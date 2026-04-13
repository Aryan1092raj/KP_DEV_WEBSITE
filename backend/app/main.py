import logging
from collections import defaultdict, deque
from threading import Lock
from time import time

from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from postgrest.exceptions import APIError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.config import settings
from app.exceptions.handlers import (
    generic_exception_handler,
    http_exception_handler,
    postgrest_exception_handler,
    validation_exception_handler,
)
from app.routers import (
    admin_auth,
    announcements,
    applications,
    contact_messages,
    events,
    members,
    projects,
)

app = FastAPI(
    title="KP Dev Cell API",
    version="3.0.0",
    description="Official KP Dev Cell website API built with FastAPI and Supabase.",
    docs_url="/docs" if not settings.is_production else None,
    redoc_url="/redoc" if not settings.is_production else None,
    openapi_url="/openapi.json" if not settings.is_production else None,
)

logger = logging.getLogger("kp.security")
_admin_request_buckets: dict[str, deque[float]] = defaultdict(deque)
_admin_rate_lock = Lock()
_public_submission_request_buckets: dict[str, deque[float]] = defaultdict(deque)
_public_submission_rate_lock = Lock()
_public_submission_paths = frozenset({"/api/contact", "/api/apply"})
_admin_last_gc = 0.0
_public_last_gc = 0.0


def _prune_rate_buckets(buckets: dict[str, deque[float]], now: float, window_seconds: int) -> None:
    stale_keys: list[str] = []
    for key, bucket in buckets.items():
        while bucket and (now - bucket[0]) > window_seconds:
            bucket.popleft()
        if not bucket:
            stale_keys.append(key)

    for key in stale_keys:
        buckets.pop(key, None)

if settings.is_production and not settings.supabase_service_role_key:
    raise RuntimeError(
        "SUPABASE_SERVICE_ROLE_KEY must be configured when ENVIRONMENT=production."
    )

if not settings.supabase_service_role_key:
    logger.warning(
        "SUPABASE_SERVICE_ROLE_KEY is not configured; falling back to SUPABASE_ANON_KEY."
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

app.add_middleware(GZipMiddleware, minimum_size=1000)

app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(APIError, postgrest_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)


@app.middleware("http")
async def admin_rate_limit_middleware(request, call_next):
    global _admin_last_gc

    if request.url.path.startswith("/api/admin"):
        client_ip = request.client.host if request.client else "unknown"
        now = time()
        window_seconds = settings.admin_rate_limit_window_seconds
        request_limit = settings.admin_rate_limit_requests

        with _admin_rate_lock:
            if now - _admin_last_gc >= window_seconds:
                _prune_rate_buckets(_admin_request_buckets, now, window_seconds)
                _admin_last_gc = now

            bucket = _admin_request_buckets[client_ip]
            while bucket and (now - bucket[0]) > window_seconds:
                bucket.popleft()

            if len(bucket) >= request_limit:
                return JSONResponse(
                    status_code=429,
                    content={
                        "error": True,
                        "code": "RATE_LIMITED",
                        "message": "Too many admin requests. Please retry shortly.",
                    },
                )

            bucket.append(now)

    return await call_next(request)


@app.middleware("http")
async def public_submission_rate_limit_middleware(request, call_next):
    global _public_last_gc

    if request.method == "POST" and request.url.path in _public_submission_paths:
        client_ip = request.client.host if request.client else "unknown"
        bucket_key = f"{request.url.path}:{client_ip}"
        now = time()
        window_seconds = settings.public_submission_rate_limit_window_seconds
        request_limit = settings.public_submission_rate_limit_requests

        with _public_submission_rate_lock:
            if now - _public_last_gc >= window_seconds:
                _prune_rate_buckets(
                    _public_submission_request_buckets,
                    now,
                    window_seconds,
                )
                _public_last_gc = now

            bucket = _public_submission_request_buckets[bucket_key]
            while bucket and (now - bucket[0]) > window_seconds:
                bucket.popleft()

            if len(bucket) >= request_limit:
                return JSONResponse(
                    status_code=429,
                    content={
                        "error": True,
                        "code": "RATE_LIMITED",
                        "message": "Too many submission attempts. Please retry later.",
                    },
                )

            bucket.append(now)

    return await call_next(request)

for router in (
    admin_auth.router,
    contact_messages.public_router,
    contact_messages.admin_router,
    members.public_router,
    members.admin_router,
    projects.public_router,
    projects.admin_router,
    events.public_router,
    events.admin_router,
    announcements.public_router,
    announcements.admin_router,
    applications.public_router,
    applications.admin_router,
):
    app.include_router(router)


@app.get("/health", tags=["Health"])
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/", tags=["Health"])
def root() -> dict[str, str]:
    payload = {"service": "KP Dev Cell API", "status": "ok"}
    if app.docs_url:
        payload["docs"] = app.docs_url
    return payload
