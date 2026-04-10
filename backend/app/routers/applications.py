from uuid import UUID

from fastapi import APIRouter, Depends, status
from fastapi.encoders import jsonable_encoder
from postgrest.exceptions import APIError

from app.db.client import get_postgrest_client, get_supabase
from app.exceptions.handlers import raise_conflict, raise_not_found
from app.middleware.auth import verify_admin
from app.models.application import (
    ApplicationCreate,
    ApplicationResponse,
    ApplicationStatusUpdate,
)

public_router = APIRouter(prefix="/api", tags=["Applications"])
admin_router = APIRouter(prefix="/api/admin", tags=["Admin Applications"])

APPLICATION_COLUMNS = "id,name,email,branch,batch,why_join,skills,status,submitted_at"


@public_router.post(
    "/apply",
    response_model=ApplicationResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_application(payload: ApplicationCreate) -> dict:
    application_payload = jsonable_encoder(payload, exclude_none=True)
    try:
        response = get_supabase().table("applications").insert(application_payload).execute()
    except APIError as exc:
        raise_conflict(exc, "Unable to submit application")
    return response.data[0]


@admin_router.get("/applications", response_model=list[ApplicationResponse])
def list_applications(admin: dict = Depends(verify_admin)) -> list[dict]:
    response = (
        get_postgrest_client(admin["token"])
        .table("applications")
        .select(APPLICATION_COLUMNS)
        .order("submitted_at", desc=True)
        .execute()
    )
    return response.data or []


@admin_router.put(
    "/applications/{application_id}/status",
    response_model=ApplicationResponse,
)
def update_application_status(
    application_id: UUID,
    payload: ApplicationStatusUpdate,
    admin: dict = Depends(verify_admin),
) -> dict:
    try:
        response = (
            get_postgrest_client(admin["token"])
            .table("applications")
            .update(jsonable_encoder(payload))
            .eq("id", str(application_id))
            .execute()
        )
    except APIError as exc:
        raise_conflict(exc, "Unable to update application status")
    if not response.data:
        raise_not_found("Application")
    return response.data[0]
