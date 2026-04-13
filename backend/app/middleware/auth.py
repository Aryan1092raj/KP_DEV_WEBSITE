import logging
from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt

from fastapi import HTTPException, Request, Response, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.config import settings
from app.models.auth import AdminSessionResponse, AdminUserResponse

security_scheme = HTTPBearer(auto_error=False)
logger = logging.getLogger("kp.auth")


def _error(message: str, code: str) -> dict[str, object]:
    return {"error": True, "message": message, "code": code}


def _extract_role(user: object) -> str | None:
    app_metadata = getattr(user, "app_metadata", None) or {}

    if isinstance(app_metadata, dict) and app_metadata.get("role"):
        return app_metadata.get("role")

    return None


def _extract_user_id(user: object) -> str | None:
    user_id = getattr(user, "id", None)
    return str(user_id) if user_id else None


def _extract_email(user: object) -> str | None:
    email = getattr(user, "email", None)
    return str(email) if email else None


def _extract_last_sign_in_at(user: object) -> datetime | None:
    raw_value = getattr(user, "last_sign_in_at", None)

    if raw_value is None:
        return None

    if isinstance(raw_value, datetime):
        return raw_value

    if isinstance(raw_value, str) and raw_value:
        normalized = raw_value.replace("Z", "+00:00")
        try:
            return datetime.fromisoformat(normalized)
        except ValueError:
            return None

    return None


def build_admin_session(user: object, expires_at: datetime) -> AdminSessionResponse:
    role = _extract_role(user)
    user_id = _extract_user_id(user)

    if role != "admin" or not user_id:
        raise ValueError("Admin session can only be created for admin users")

    return AdminSessionResponse(
        expires_at=expires_at,
        user=AdminUserResponse(
            id=user_id,
            email=_extract_email(user),
            role=role,
            last_sign_in_at=_extract_last_sign_in_at(user),
        ),
    )


def create_admin_session_token(session: AdminSessionResponse) -> str:
    payload = {
        "sub": session.user.id,
        "email": session.user.email,
        "role": session.user.role,
        "last_sign_in_at": (
            session.user.last_sign_in_at.isoformat()
            if session.user.last_sign_in_at is not None
            else None
        ),
        "iat": int(datetime.now(timezone.utc).timestamp()),
        "exp": int(session.expires_at.timestamp()),
    }
    return jwt.encode(payload, settings.session_signing_secret, algorithm="HS256")


def set_admin_session_cookie(response: Response, session: AdminSessionResponse) -> None:
    token = create_admin_session_token(session)
    response.set_cookie(
        key=settings.admin_session_cookie_name,
        value=token,
        max_age=settings.admin_session_max_age_seconds,
        expires=session.expires_at,
        httponly=True,
        secure=settings.secure_cookies,
        samesite=settings.session_cookie_samesite,
        path="/",
    )


def clear_admin_session_cookie(response: Response) -> None:
    response.delete_cookie(
        key=settings.admin_session_cookie_name,
        httponly=True,
        secure=settings.secure_cookies,
        samesite=settings.session_cookie_samesite,
        path="/",
    )


def create_admin_session_for_user(user: object) -> AdminSessionResponse:
    expires_at = datetime.now(timezone.utc) + timedelta(
        seconds=settings.admin_session_max_age_seconds
    )
    return build_admin_session(user, expires_at)


def _read_admin_session_token(
    request: Request,
    credentials: HTTPAuthorizationCredentials | None,
) -> str | None:
    if credentials is not None and credentials.credentials:
        return credentials.credentials

    cookie_token = request.cookies.get(settings.admin_session_cookie_name)
    if cookie_token:
        return cookie_token

    return None


def _decode_admin_session(token: str) -> AdminSessionResponse:
    try:
        payload = jwt.decode(
            token,
            settings.session_signing_secret,
            algorithms=["HS256"],
        )
    except JWTError as exc:
        raise HTTPException(
            status_code=401,
            detail=_error("Admin session is invalid or has expired", "INVALID_SESSION"),
        ) from exc

    role = payload.get("role")
    user_id = payload.get("sub")
    expires_at_raw = payload.get("exp")
    iat_raw = payload.get("iat")
    last_sign_in_at_raw = payload.get("last_sign_in_at")

    if role != "admin" or not user_id or not expires_at_raw:
        raise HTTPException(
            status_code=401,
            detail=_error("Admin session is invalid or has expired", "INVALID_SESSION"),
        )

    expires_at = datetime.fromtimestamp(expires_at_raw, tz=timezone.utc)

    last_sign_in_at: datetime | None = None
    if isinstance(last_sign_in_at_raw, str) and last_sign_in_at_raw:
        try:
            last_sign_in_at = datetime.fromisoformat(
                last_sign_in_at_raw.replace("Z", "+00:00")
            )
        except ValueError:
            last_sign_in_at = None

    if last_sign_in_at is None and isinstance(iat_raw, (int, float)):
        last_sign_in_at = datetime.fromtimestamp(iat_raw, tz=timezone.utc)

    return AdminSessionResponse(
        expires_at=expires_at,
        user=AdminUserResponse(
            id=str(user_id),
            email=payload.get("email"),
            role=role,
            last_sign_in_at=last_sign_in_at,
        ),
    )


async def verify_admin(
    request: Request,
    credentials: HTTPAuthorizationCredentials | None = Security(security_scheme),
) -> dict[str, object]:
    client_ip = request.client.host if request.client else "unknown"

    token = _read_admin_session_token(request, credentials)
    if token is None:
        logger.warning("admin_auth_failed_missing_token ip=%s path=%s", client_ip, request.url.path)
        raise HTTPException(
            status_code=401,
            detail=_error("Admin session is required", "MISSING_SESSION"),
        )

    try:
        session = _decode_admin_session(token)
    except Exception as exc:
        logger.warning("admin_auth_failed_invalid_token ip=%s path=%s", client_ip, request.url.path)
        if isinstance(exc, HTTPException):
            raise
        raise HTTPException(
            status_code=401,
            detail=_error("Admin session is invalid or has expired", "INVALID_SESSION"),
        ) from exc

    return {
        "token": token,
        "user": session.user.model_dump(),
        "session": session,
    }
