from collections import defaultdict, deque
from threading import Lock
from time import time

from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
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
    announcements,
    applications,
    contact_messages,
    events,
    members,
    projects,
    timeline,
)

app = FastAPI(
    title="KP Dev Cell API",
    version="3.0.0",
    description="Official KP Dev Cell website API built with FastAPI and Supabase.",
)

_admin_request_buckets: dict[str, deque[float]] = defaultdict(deque)
_admin_rate_lock = Lock()

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)

app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(APIError, postgrest_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)


@app.middleware("http")
async def admin_rate_limit_middleware(request, call_next):
    if request.url.path.startswith("/api/admin"):
        client_ip = request.client.host if request.client else "unknown"
        now = time()
        window_seconds = settings.admin_rate_limit_window_seconds
        request_limit = settings.admin_rate_limit_requests

        with _admin_rate_lock:
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

for router in (
    contact_messages.public_router,
    contact_messages.admin_router,
    members.public_router,
    members.admin_router,
    projects.public_router,
    projects.admin_router,
    events.public_router,
    events.admin_router,
    timeline.public_router,
    timeline.admin_router,
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
    return {"service": "KP Dev Cell API", "status": "ok", "docs": "/docs"}
