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
    return create_record(
        table_name="team_members",
        payload=member_payload,
        conflict_message="Unable to create member",
    )


@admin_router.put("/members/{member_id}", response_model=MemberResponse)
def update_member(
    member_id: UUID, payload: MemberUpdate, admin: dict = Depends(verify_admin)
) -> dict:
    update_payload = jsonable_encoder(payload, exclude_unset=True)
    return update_record_by_id(
        table_name="team_members",
        record_id=member_id,
        payload=update_payload,
        columns=MEMBER_COLUMNS,
        conflict_message="Unable to update member",
        not_found_resource="Member",
    )


@admin_router.delete("/members/{member_id}")
def delete_member(member_id: UUID, admin: dict = Depends(verify_admin)) -> dict[str, bool]:
    return delete_record_by_id(
        table_name="team_members",
        record_id=member_id,
        conflict_message="Unable to delete member",
        not_found_resource="Member",
    )
