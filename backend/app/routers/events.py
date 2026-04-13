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
from app.models.event import EventCreate, EventResponse, EventUpdate

public_router = APIRouter(prefix="/api", tags=["Events"])
admin_router = APIRouter(prefix="/api/admin", tags=["Admin Events"])

EVENT_COLUMNS = "id,title,description,event_date,end_date,event_type,resource_url,is_upcoming,is_ongoing,created_at"


@public_router.get("/events", response_model=list[EventResponse])
def list_events() -> list[dict]:
    response = (
        get_auth_supabase().table("events").select(EVENT_COLUMNS).order("event_date").execute()
    )
    return response.data or []


@public_router.get("/events/upcoming", response_model=list[EventResponse])
def list_upcoming_events() -> list[dict]:
    response = (
        get_auth_supabase()
        .table("events")
        .select(EVENT_COLUMNS)
        .eq("is_upcoming", True)
        .eq("is_ongoing", False)
        .order("event_date")
        .execute()
    )
    return response.data or []


@admin_router.get("/events", response_model=list[EventResponse])
def list_events_admin(admin: dict = Depends(verify_admin)) -> list[dict]:
    response = (
        get_postgrest_client()
        .table("events")
        .select(EVENT_COLUMNS)
        .order("event_date")
        .execute()
    )
    return response.data or []


@admin_router.post(
    "/events",
    response_model=EventResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_event(payload: EventCreate, admin: dict = Depends(verify_admin)) -> dict:
    event_payload = jsonable_encoder(payload, exclude_none=True)
    return create_record(
        table_name="events",
        payload=event_payload,
        conflict_message="Unable to create event",
    )


@admin_router.put("/events/{event_id}", response_model=EventResponse)
def update_event(
    event_id: UUID, payload: EventUpdate, admin: dict = Depends(verify_admin)
) -> dict:
    event_payload = jsonable_encoder(payload, exclude_unset=True)
    return update_record_by_id(
        table_name="events",
        record_id=event_id,
        payload=event_payload,
        columns=EVENT_COLUMNS,
        conflict_message="Unable to update event",
        not_found_resource="Event",
    )


@admin_router.delete("/events/{event_id}")
def delete_event(event_id: UUID, admin: dict = Depends(verify_admin)) -> dict[str, bool]:
    return delete_record_by_id(
        table_name="events",
        record_id=event_id,
        conflict_message="Unable to delete event",
        not_found_resource="Event",
    )
