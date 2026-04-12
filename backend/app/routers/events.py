from uuid import UUID

from fastapi import APIRouter, Depends, status
from fastapi.encoders import jsonable_encoder
from postgrest.exceptions import APIError

from app.db.client import get_postgrest_client, get_supabase
from app.exceptions.handlers import raise_conflict, raise_not_found
from app.middleware.auth import verify_admin
from app.models.event import EventCreate, EventResponse, EventUpdate

public_router = APIRouter(prefix="/api", tags=["Events"])
admin_router = APIRouter(prefix="/api/admin", tags=["Admin Events"])

EVENT_COLUMNS = "id,title,description,event_date,event_type,resource_url,is_upcoming,created_at"


@public_router.get("/events", response_model=list[EventResponse])
def list_events() -> list[dict]:
    response = (
        get_supabase().table("events").select(EVENT_COLUMNS).order("event_date").execute()
    )
    return response.data or []


@public_router.get("/events/upcoming", response_model=list[EventResponse])
def list_upcoming_events() -> list[dict]:
    response = (
        get_supabase()
        .table("events")
        .select(EVENT_COLUMNS)
        .eq("is_upcoming", True)
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
    try:
        response = (
            get_postgrest_client().table("events").insert(event_payload).execute()
        )
    except APIError as exc:
        raise_conflict(exc, "Unable to create event")
    return response.data[0]


@admin_router.put("/events/{event_id}", response_model=EventResponse)
def update_event(
    event_id: UUID, payload: EventUpdate, admin: dict = Depends(verify_admin)
) -> dict:
    event_payload = jsonable_encoder(payload, exclude_unset=True)
    db = get_postgrest_client()
    try:
        if event_payload:
            response = db.table("events").update(event_payload).eq("id", str(event_id)).execute()
        else:
            response = db.table("events").select(EVENT_COLUMNS).eq("id", str(event_id)).execute()
    except APIError as exc:
        raise_conflict(exc, "Unable to update event")
    if not response.data:
        raise_not_found("Event")
    return response.data[0]


@admin_router.delete("/events/{event_id}")
def delete_event(event_id: UUID, admin: dict = Depends(verify_admin)) -> dict[str, bool]:
    try:
        response = (
            get_postgrest_client()
            .table("events")
            .delete()
            .eq("id", str(event_id))
            .execute()
        )
    except APIError as exc:
        raise_conflict(exc, "Unable to delete event")
    if not response.data:
        raise_not_found("Event")
    return {"deleted": True}
