from uuid import UUID

from fastapi import APIRouter, Depends, status
from fastapi.encoders import jsonable_encoder

from app.db.client import get_postgrest_client
from app.db.crud_helpers import create_record, update_record_by_id
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
    return create_record(
        table_name="applications",
        payload=application_payload,
        conflict_message="Unable to submit application",
    )


@admin_router.get("/applications", response_model=list[ApplicationResponse])
def list_applications(admin: dict = Depends(verify_admin)) -> list[dict]:
    response = (
        get_postgrest_client()
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
    return update_record_by_id(
        table_name="applications",
        record_id=application_id,
        payload=jsonable_encoder(payload),
        columns=APPLICATION_COLUMNS,
        conflict_message="Unable to update application status",
        not_found_resource="Application",
    )
