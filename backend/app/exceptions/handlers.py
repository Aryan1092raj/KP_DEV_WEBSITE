import logging

from fastapi import HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from postgrest.exceptions import APIError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.config import settings

logger = logging.getLogger("kp.api")


def _apply_cors_headers(request: Request, response: JSONResponse) -> JSONResponse:
    origin = request.headers.get("origin")
    if not origin:
        return response

    if origin in settings.cors_origins:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Vary"] = "Origin"

    return response


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
    logger.warning(
        "Conflict while processing database request: code=%s message=%s",
        exc.code,
        exc.message,
    )
    raise HTTPException(
        status_code=409,
        detail=error_payload(fallback_message, "CONFLICT"),
    ) from exc


def raise_database_error(
    exc: APIError,
    *,
    conflict_message: str,
    fallback_message: str = "Database request failed",
) -> None:
    logger.warning(
        "Database request failed: code=%s message=%s",
        exc.code,
        exc.message,
    )

    if exc.code == "PGRST205":
        raise HTTPException(
            status_code=500,
            detail=error_payload(
                "Supabase schema is missing required tables for this API",
                "SCHEMA_NOT_READY",
            ),
        ) from exc

    if exc.code and exc.code.startswith("23"):
        raise HTTPException(
            status_code=409,
            detail=error_payload(conflict_message, "CONFLICT"),
        ) from exc

    if exc.code in {"42501", "PGRST301", "PGRST302"}:
        raise HTTPException(
            status_code=403,
            detail=error_payload(
                "Database permission denied for this operation",
                "NOT_AUTHORIZED",
            ),
        ) from exc

    raise HTTPException(
        status_code=500,
        detail=error_payload(fallback_message, "DB_ERROR"),
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
    response = JSONResponse(status_code=exc.status_code, content=payload)
    return _apply_cors_headers(request, response)


async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    response = JSONResponse(
        status_code=422,
        content=error_payload(
            "Request validation failed",
            "VALIDATION_ERROR",
            details=exc.errors(),
        ),
    )
    return _apply_cors_headers(request, response)


async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.exception("Unhandled server exception at path=%s", request.url.path)
    response = JSONResponse(
        status_code=500,
        content=error_payload(
            "Something went wrong on the server",
            "SERVER_ERROR",
        ),
    )
    return _apply_cors_headers(request, response)


async def postgrest_exception_handler(request: Request, exc: APIError) -> JSONResponse:
    status_code = 500
    code = "SERVER_ERROR"

    if exc.code == "PGRST205":
        message = "Supabase schema is missing required tables for this API"
        code = "SCHEMA_NOT_READY"
    else:
        message = "Database request failed"
        if exc.code and exc.code.startswith("23"):
            status_code = 409
            code = "CONFLICT"
            message = "Database conflict detected"

    logger.warning(
        "PostgREST error at path=%s status=%s code=%s message=%s",
        request.url.path,
        status_code,
        exc.code,
        exc.message,
    )

    if not settings.is_production:
        logger.debug("PostgREST raw payload: %s", exc.json())

    response = JSONResponse(
        status_code=status_code,
        content=error_payload(message, code),
    )
    return _apply_cors_headers(request, response)
