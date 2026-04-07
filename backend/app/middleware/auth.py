from fastapi import HTTPException, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.db.client import get_supabase

security_scheme = HTTPBearer(auto_error=False)


def _error(message: str, code: str) -> dict[str, object]:
    return {"error": True, "message": message, "code": code}


def _extract_role(user: object) -> str | None:
    app_metadata = getattr(user, "app_metadata", None) or {}
    user_metadata = getattr(user, "user_metadata", None) or {}

    if isinstance(app_metadata, dict) and app_metadata.get("role"):
        return app_metadata.get("role")

    if isinstance(user_metadata, dict):
        return user_metadata.get("role")

    return None


async def verify_admin(
    credentials: HTTPAuthorizationCredentials | None = Security(security_scheme),
) -> dict[str, object]:
    if credentials is None:
        raise HTTPException(
            status_code=401,
            detail=_error("Authorization token is required", "MISSING_TOKEN"),
        )

    token = credentials.credentials
    try:
        user_response = get_supabase().auth.get_user(token)
        user = getattr(user_response, "user", None)
    except Exception as exc:
        raise HTTPException(
            status_code=401,
            detail=_error("Token is invalid or has expired", "INVALID_TOKEN"),
        ) from exc

    if user is None:
        raise HTTPException(
            status_code=401,
            detail=_error("Token is invalid or has expired", "INVALID_TOKEN"),
        )

    role = _extract_role(user)
    if role != "admin":
        raise HTTPException(
            status_code=403,
            detail=_error(
                "You are not authorized to access this resource",
                "NOT_AUTHORIZED",
            ),
        )

    return {"token": token, "user": user}
