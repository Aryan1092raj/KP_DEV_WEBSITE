from uuid import UUID

from fastapi import APIRouter, Depends, status
from fastapi.encoders import jsonable_encoder
from postgrest.exceptions import APIError

from app.db.client import get_postgrest_client, get_supabase
from app.exceptions.handlers import raise_conflict, raise_not_found
from app.middleware.auth import verify_admin
from app.models.timeline import TimelineCreate, TimelineResponse, TimelineUpdate

public_router = APIRouter(prefix="/api", tags=["Timeline"])
admin_router = APIRouter(prefix="/api/admin", tags=["Admin Timeline"])

TIMELINE_COLUMNS = "id,year,title,description,sort_order,created_at"


@public_router.get("/timeline", response_model=list[TimelineResponse])
def list_timeline() -> list[dict]:
    response = (
        get_supabase()
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
        get_postgrest_client(admin["token"])
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
    try:
        response = (
            get_postgrest_client(admin["token"])
            .table("timeline")
            .insert(timeline_payload)
            .execute()
        )
    except APIError as exc:
        raise_conflict(exc, "Unable to create timeline entry")
    return response.data[0]


@admin_router.put("/timeline/{timeline_id}", response_model=TimelineResponse)
def update_timeline_entry(
    timeline_id: UUID, payload: TimelineUpdate, admin: dict = Depends(verify_admin)
) -> dict:
    timeline_payload = jsonable_encoder(payload, exclude_unset=True)
    db = get_postgrest_client(admin["token"])
    try:
        if timeline_payload:
            response = db.table("timeline").update(timeline_payload).eq("id", str(timeline_id)).execute()
        else:
            response = (
                db.table("timeline")
                .select(TIMELINE_COLUMNS)
                .eq("id", str(timeline_id))
                .execute()
            )
    except APIError as exc:
        raise_conflict(exc, "Unable to update timeline entry")
    if not response.data:
        raise_not_found("Timeline entry")
    return response.data[0]


@admin_router.delete("/timeline/{timeline_id}")
def delete_timeline_entry(
    timeline_id: UUID, admin: dict = Depends(verify_admin)
) -> dict[str, bool]:
    try:
        response = (
            get_postgrest_client(admin["token"])
            .table("timeline")
            .delete()
            .eq("id", str(timeline_id))
            .execute()
        )
    except APIError as exc:
        raise_conflict(exc, "Unable to delete timeline entry")
    if not response.data:
        raise_not_found("Timeline entry")
    return {"deleted": True}
