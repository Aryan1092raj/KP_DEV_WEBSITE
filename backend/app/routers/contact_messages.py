from fastapi import APIRouter, Depends, status
from fastapi.encoders import jsonable_encoder
from postgrest.exceptions import APIError

from app.db.client import get_postgrest_client, get_supabase
from app.exceptions.handlers import raise_conflict
from app.middleware.auth import verify_admin
from app.models.contact import ContactMessageCreate, ContactMessageResponse

public_router = APIRouter(prefix="/api", tags=["Contact"])
admin_router = APIRouter(prefix="/api/admin", tags=["Admin Contact"])


@public_router.post(
    "/contact",
    response_model=ContactMessageResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_contact_message(payload: ContactMessageCreate) -> dict:
    message_payload = jsonable_encoder(payload, exclude_none=True)
    try:
        response = get_supabase().table("contact_messages").insert(message_payload).execute()
    except APIError as exc:
        raise_conflict(exc, "Unable to submit contact message")
    return response.data[0]


@admin_router.get("/contact-messages", response_model=list[ContactMessageResponse])
def list_contact_messages(admin: dict = Depends(verify_admin)) -> list[dict]:
    response = (
        get_postgrest_client(admin["token"])
        .table("contact_messages")
        .select("*")
        .order("created_at", desc=True)
        .execute()
    )
    return response.data or []
