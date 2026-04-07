from fastapi import HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from postgrest.exceptions import APIError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.config import settings


def error_payload(
    message: str,
    code: str,
    *,
    details: list[dict[str, object]] | str | None = None,
) -> dict[str, object]:
    payload: dict[str, object] = {"error": True, "message": message, "code": code}
    if details is not None:
        payload["details"] = details
    return payload


def raise_not_found(resource: str) -> None:
    raise HTTPException(
        status_code=404,
        detail=error_payload(f"{resource} not found", "NOT_FOUND"),
    )


def raise_conflict(exc: APIError, fallback_message: str) -> None:
    message = exc.message or fallback_message
    detail = exc.details or exc.hint
    raise HTTPException(
        status_code=409,
        detail=error_payload(message, "CONFLICT", details=detail),
    ) from exc


async def http_exception_handler(
    request: Request, exc: StarletteHTTPException
) -> JSONResponse:
    detail = exc.detail
    if isinstance(detail, dict) and detail.get("error") is True:
        payload = detail
    elif exc.status_code == 404:
        payload = error_payload("The requested resource was not found", "NOT_FOUND")
    elif exc.status_code == 401:
        payload = error_payload("Authorization token is required", "MISSING_TOKEN")
    elif exc.status_code == 403:
        payload = error_payload(
            "You are not authorized to access this resource",
            "NOT_AUTHORIZED",
        )
    else:
        payload = error_payload(
            detail if isinstance(detail, str) else "Request failed",
            "HTTP_ERROR",
        )
    return JSONResponse(status_code=exc.status_code, content=payload)


async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    return JSONResponse(
        status_code=422,
        content=error_payload(
            "Request validation failed",
            "VALIDATION_ERROR",
            details=exc.errors(),
        ),
    )


async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    details = str(exc) if settings.environment.lower() == "development" else None
    return JSONResponse(
        status_code=500,
        content=error_payload(
            "Something went wrong on the server",
            "SERVER_ERROR",
            details=details,
        ),
    )


async def postgrest_exception_handler(request: Request, exc: APIError) -> JSONResponse:
    status_code = 500
    code = "SERVER_ERROR"

    if exc.code == "PGRST205":
        message = "Supabase schema is missing required tables for this API"
        code = "SCHEMA_NOT_READY"
    else:
        message = exc.message or "Database request failed"
        if exc.code and exc.code.startswith("23"):
            status_code = 409
            code = "CONFLICT"

    details = exc.json() if settings.environment.lower() == "development" else None
    return JSONResponse(
        status_code=status_code,
        content=error_payload(message, code, details=details),
    )
