from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, status
from fastapi.encoders import jsonable_encoder
from postgrest.exceptions import APIError

from app.db.client import get_postgrest_client, get_supabase
from app.exceptions.handlers import raise_conflict, raise_not_found
from app.middleware.auth import verify_admin
from app.models.announcement import (
    AnnouncementCreate,
    AnnouncementResponse,
    AnnouncementUpdate,
)

public_router = APIRouter(prefix="/api", tags=["Announcements"])
admin_router = APIRouter(prefix="/api/admin", tags=["Admin Announcements"])

ANNOUNCEMENT_COLUMNS = "id,title,body,author,is_published,published_at,created_at,updated_at"


def _prepare_announcement_payload(payload: dict) -> dict:
    if payload.get("is_published") and not payload.get("published_at"):
        payload["published_at"] = datetime.now(timezone.utc).isoformat()
    if payload.get("is_published") is False:
        payload["published_at"] = None
    payload["updated_at"] = datetime.now(timezone.utc).isoformat()
    return payload


@public_router.get("/announcements", response_model=list[AnnouncementResponse])
def list_announcements() -> list[dict]:
    response = (
        get_supabase()
        .table("announcements")
        .select(ANNOUNCEMENT_COLUMNS)
        .eq("is_published", True)
        .order("published_at", desc=True)
        .order("created_at", desc=True)
        .execute()
    )
    return response.data or []


@admin_router.get("/announcements", response_model=list[AnnouncementResponse])
def list_announcements_admin(admin: dict = Depends(verify_admin)) -> list[dict]:
    response = (
        get_postgrest_client()
        .table("announcements")
        .select(ANNOUNCEMENT_COLUMNS)
        .order("created_at", desc=True)
        .execute()
    )
    return response.data or []


@admin_router.post(
    "/announcements",
    response_model=AnnouncementResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_announcement(
    payload: AnnouncementCreate, admin: dict = Depends(verify_admin)
) -> dict:
    announcement_payload = _prepare_announcement_payload(
        jsonable_encoder(payload, exclude_none=True)
    )
    try:
        response = (
            get_postgrest_client()
            .table("announcements")
            .insert(announcement_payload)
            .execute()
        )
    except APIError as exc:
        raise_conflict(exc, "Unable to create announcement")
    return response.data[0]


@admin_router.put("/announcements/{announcement_id}", response_model=AnnouncementResponse)
def update_announcement(
    announcement_id: UUID, payload: AnnouncementUpdate, admin: dict = Depends(verify_admin)
) -> dict:
    announcement_payload = jsonable_encoder(payload, exclude_unset=True)
    db = get_postgrest_client()
    try:
        if announcement_payload:
            response = (
                db.table("announcements")
                .update(_prepare_announcement_payload(announcement_payload))
                .eq("id", str(announcement_id))
                .execute()
            )
        else:
            response = (
                db.table("announcements")
                .select(ANNOUNCEMENT_COLUMNS)
                .eq("id", str(announcement_id))
                .execute()
            )
    except APIError as exc:
        raise_conflict(exc, "Unable to update announcement")
    if not response.data:
        raise_not_found("Announcement")
    return response.data[0]


@admin_router.delete("/announcements/{announcement_id}")
def delete_announcement(
    announcement_id: UUID, admin: dict = Depends(verify_admin)
) -> dict[str, bool]:
    try:
        response = (
            get_postgrest_client()
            .table("announcements")
            .delete()
            .eq("id", str(announcement_id))
            .execute()
        )
    except APIError as exc:
        raise_conflict(exc, "Unable to delete announcement")
    if not response.data:
        raise_not_found("Announcement")
    return {"deleted": True}
