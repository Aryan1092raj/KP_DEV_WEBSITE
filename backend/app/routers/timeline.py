from uuid import UUID

from fastapi import APIRouter, Depends, status
from fastapi.encoders import jsonable_encoder

from app.db.client import get_auth_supabase, get_postgrest_client
from app.db.crud_helpers import (
    create_record,
    delete_record_by_id,
    update_record_by_id,
)
from app.middleware.auth import verify_admin
from app.models.timeline import TimelineCreate, TimelineResponse, TimelineUpdate

public_router = APIRouter(prefix="/api", tags=["Timeline"])
admin_router = APIRouter(prefix="/api/admin", tags=["Admin Timeline"])

TIMELINE_COLUMNS = "id,year,title,description,sort_order,created_at"


@public_router.get("/timeline", response_model=list[TimelineResponse])
def list_timeline() -> list[dict]:
    response = (
        get_auth_supabase()
        .table("timeline")
        .select(TIMELINE_COLUMNS)
        .order("year")
        .order("sort_order")
        .execute()
    )
    return response.data or []


@admin_router.get("/timeline", response_model=list[TimelineResponse])
def list_timeline_admin(admin: dict = Depends(verify_admin)) -> list[dict]:
    response = (
        get_postgrest_client()
        .table("timeline")
        .select(TIMELINE_COLUMNS)
        .order("year")
        .order("sort_order")
        .execute()
    )
    return response.data or []


@admin_router.post(
    "/timeline",
    response_model=TimelineResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_timeline_entry(payload: TimelineCreate, admin: dict = Depends(verify_admin)) -> dict:
    timeline_payload = jsonable_encoder(payload, exclude_none=True)
    return create_record(
        table_name="timeline",
        payload=timeline_payload,
        conflict_message="Unable to create timeline entry",
    )


@admin_router.put("/timeline/{timeline_id}", response_model=TimelineResponse)
def update_timeline_entry(
    timeline_id: UUID, payload: TimelineUpdate, admin: dict = Depends(verify_admin)
) -> dict:
    timeline_payload = jsonable_encoder(payload, exclude_unset=True)
    return update_record_by_id(
        table_name="timeline",
        record_id=timeline_id,
        payload=timeline_payload,
        columns=TIMELINE_COLUMNS,
        conflict_message="Unable to update timeline entry",
        not_found_resource="Timeline entry",
    )


@admin_router.delete("/timeline/{timeline_id}")
def delete_timeline_entry(
    timeline_id: UUID, admin: dict = Depends(verify_admin)
) -> dict[str, bool]:
    return delete_record_by_id(
        table_name="timeline",
        record_id=timeline_id,
        conflict_message="Unable to delete timeline entry",
        not_found_resource="Timeline entry",
    )
