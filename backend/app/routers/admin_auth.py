from fastapi import APIRouter, Depends, HTTPException, Response, status
from gotrue.errors import AuthApiError

from app.db.client import get_auth_supabase
from app.middleware.auth import (
    clear_admin_session_cookie,
    create_admin_session_for_user,
    set_admin_session_cookie,
    verify_admin,
)
from app.models.auth import AdminLoginRequest, AdminSessionResponse

router = APIRouter(prefix="/api/admin", tags=["Admin Auth"])


@router.post("/login", response_model=AdminSessionResponse)
def login(payload: AdminLoginRequest, response: Response) -> AdminSessionResponse:
    try:
        auth_response = get_auth_supabase().auth.sign_in_with_password(
            {"email": payload.email, "password": payload.password}
        )
    except AuthApiError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "error": True,
                "message": "Email or password is incorrect.",
                "code": "INVALID_CREDENTIALS",
            },
        ) from exc

    user = getattr(auth_response, "user", None)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "error": True,
                "message": "Email or password is incorrect.",
                "code": "INVALID_CREDENTIALS",
            },
        )

    try:
        session = create_admin_session_for_user(user)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error": True,
                "message": "This account does not have admin access.",
                "code": "NOT_AUTHORIZED",
            },
        ) from exc

    set_admin_session_cookie(response, session)
    return session


@router.get("/session", response_model=AdminSessionResponse)
def get_session(admin: dict = Depends(verify_admin)) -> AdminSessionResponse:
    return admin["session"]


@router.post("/logout")
def logout(response: Response) -> dict[str, bool]:
    clear_admin_session_cookie(response)
    return {"logged_out": True}
