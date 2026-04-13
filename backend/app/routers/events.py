from uuid import UUID

from fastapi import APIRouter, Depends, status
from fastapi.encoders import jsonable_encoder

from app.db.client import get_postgrest_client
from app.db.crud_helpers import (
    create_record,
    delete_record_by_id,
    update_record_by_id,
)
from app.middleware.auth import verify_admin
from app.models.event import EventCreate, EventResponse, EventUpdate

public_router = APIRouter(prefix="/api", tags=["Events"])
admin_router = APIRouter(prefix="/api/admin", tags=["Admin Events"])

EVENT_TYPES = {"session", "workshop", "hackathon", "talk"}


def _normalize_event_row(row: dict) -> dict:
    normalized = dict(row)

    normalized["description"] = normalized.get("description") or ""
    normalized["resource_url"] = normalized.get("resource_url") or None
    normalized["end_date"] = normalized.get("end_date") or None
    normalized["is_upcoming"] = bool(normalized.get("is_upcoming"))
    normalized["is_ongoing"] = bool(normalized.get("is_ongoing"))

    event_type = str(normalized.get("event_type") or "session").strip().lower()
    normalized["event_type"] = event_type if event_type in EVENT_TYPES else "session"

    return normalized


def _normalize_event_rows(rows: list[dict] | None) -> list[dict]:
    return [_normalize_event_row(row) for row in (rows or [])]


EVENT_COLUMNS = "id,title,description,event_date,end_date,event_type,resource_url,is_upcoming,is_ongoing,created_at"


@public_router.get("/events", response_model=list[EventResponse])
def list_events() -> list[dict]:
    response = get_postgrest_client().table("events").select("*").order("event_date").execute()
    return _normalize_event_rows(response.data)


@public_router.get("/events/upcoming", response_model=list[EventResponse])
def list_upcoming_events() -> list[dict]:
    response = get_postgrest_client().table("events").select("*").order("event_date").execute()
    normalized_rows = _normalize_event_rows(response.data)
    return [row for row in normalized_rows if row["is_upcoming"] and not row["is_ongoing"]]


@admin_router.get("/events", response_model=list[EventResponse])
def list_events_admin(admin: dict = Depends(verify_admin)) -> list[dict]:
    response = get_postgrest_client().table("events").select("*").order("event_date").execute()
    return _normalize_event_rows(response.data)


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
