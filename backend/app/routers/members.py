from uuid import UUID

from fastapi import APIRouter, Depends, status
from fastapi.encoders import jsonable_encoder
from postgrest.exceptions import APIError

from app.db.client import get_auth_supabase, get_postgrest_client
from app.exceptions.handlers import raise_conflict, raise_not_found
from app.middleware.auth import verify_admin
from app.models.member import MemberCreate, MemberResponse, MemberUpdate

public_router = APIRouter(prefix="/api", tags=["Members"])
admin_router = APIRouter(prefix="/api/admin", tags=["Admin Members"])

MEMBER_COLUMNS = (
    "id,name,role,batch,bio,photo_url,github_url,linkedin_url,is_active,display_order,created_at"
)


@public_router.get("/members", response_model=list[MemberResponse])
def list_members() -> list[dict]:
    response = (
        get_auth_supabase()
        .table("team_members")
        .select(MEMBER_COLUMNS)
        .eq("is_active", True)
        .order("display_order")
        .order("created_at")
        .execute()
    )
    return response.data or []


@admin_router.get("/members", response_model=list[MemberResponse])
def list_members_admin(admin: dict = Depends(verify_admin)) -> list[dict]:
    response = (
        get_postgrest_client()
        .table("team_members")
        .select(MEMBER_COLUMNS)
        .order("display_order")
        .order("created_at")
        .execute()
    )
    return response.data or []


@admin_router.post(
    "/members",
    response_model=MemberResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_member(payload: MemberCreate, admin: dict = Depends(verify_admin)) -> dict:
    member_payload = jsonable_encoder(payload, exclude_none=True)
    try:
        response = (
            get_postgrest_client()
            .table("team_members")
            .insert(member_payload)
            .execute()
        )
    except APIError as exc:
        raise_conflict(exc, "Unable to create member")
    return response.data[0]


@admin_router.put("/members/{member_id}", response_model=MemberResponse)
def update_member(
    member_id: UUID, payload: MemberUpdate, admin: dict = Depends(verify_admin)
) -> dict:
    update_payload = jsonable_encoder(payload, exclude_unset=True)
    db = get_postgrest_client()
    try:
        if update_payload:
            response = db.table("team_members").update(update_payload).eq("id", str(member_id)).execute()
        else:
            response = (
                db.table("team_members")
                .select(MEMBER_COLUMNS)
                .eq("id", str(member_id))
                .execute()
            )
    except APIError as exc:
        raise_conflict(exc, "Unable to update member")
    if not response.data:
        raise_not_found("Member")
    return response.data[0]


@admin_router.delete("/members/{member_id}")
def delete_member(member_id: UUID, admin: dict = Depends(verify_admin)) -> dict[str, bool]:
    try:
        response = (
            get_postgrest_client()
            .table("team_members")
            .delete()
            .eq("id", str(member_id))
            .execute()
        )
    except APIError as exc:
        raise_conflict(exc, "Unable to delete member")
    if not response.data:
        raise_not_found("Member")
    return {"deleted": True}
