from fastapi import APIRouter, Depends, status
from fastapi.encoders import jsonable_encoder

from app.db.client import get_auth_supabase, get_postgrest_client
from app.db.crud_helpers import create_record
from app.middleware.auth import verify_admin
from app.models.contact import ContactMessageCreate, ContactMessageResponse

public_router = APIRouter(prefix="/api", tags=["Contact"])
admin_router = APIRouter(prefix="/api/admin", tags=["Admin Contact"])

CONTACT_MESSAGE_COLUMNS = "id,name,email,message,created_at"


@public_router.post(
    "/contact",
    response_model=ContactMessageResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_contact_message(payload: ContactMessageCreate) -> dict:
    message_payload = jsonable_encoder(payload, exclude_none=True)
    return create_record(
        table_name="contact_messages",
        payload=message_payload,
        conflict_message="Unable to submit contact message",
        db_client=get_auth_supabase(),
    )


@admin_router.get("/contact-messages", response_model=list[ContactMessageResponse])
def list_contact_messages(admin: dict = Depends(verify_admin)) -> list[dict]:
    response = (
        get_postgrest_client()
        .table("contact_messages")
        .select(CONTACT_MESSAGE_COLUMNS)
        .order("created_at", desc=True)
        .execute()
    )
    return response.data or []
