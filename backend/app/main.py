from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
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
