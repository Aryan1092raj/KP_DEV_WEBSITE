from uuid import UUID

from fastapi import APIRouter, Depends, status
from fastapi.encoders import jsonable_encoder
from postgrest.exceptions import APIError

from app.db.client import get_auth_supabase, get_postgrest_client, get_supabase
from app.db.crud_helpers import create_record, delete_record_by_id, update_record_by_id
from app.exceptions.handlers import raise_conflict
from app.middleware.auth import verify_admin
from app.models.project import ProjectCreate, ProjectResponse, ProjectUpdate

public_router = APIRouter(prefix="/api", tags=["Projects"])
admin_router = APIRouter(prefix="/api/admin", tags=["Admin Projects"])

PROJECT_COLUMNS = (
    "id,title,description,tech_stack,github_url,live_url,thumbnail_url,"
    "year,is_featured,status,created_at"
)
PROJECT_MEMBER_COLUMNS = "project_id,member_id,role"


def _serialize_projects(projects: list[dict], db_client=None) -> list[dict]:
    if not projects:
        return []

    db = db_client or get_supabase()
    project_ids = [project["id"] for project in projects if project.get("id")]

    contributors: list[dict] = []
    members: list[dict] = []

    if project_ids:
        contributors_response = (
            db.table("project_members")
            .select(PROJECT_MEMBER_COLUMNS)
            .in_("project_id", project_ids)
            .execute()
        )
        contributors = contributors_response.data or []

        member_ids = list(
            {
                contributor["member_id"]
                for contributor in contributors
                if contributor.get("member_id")
            }
        )
        if member_ids:
            members_response = (
                db.table("team_members")
                .select("id,name,role,photo_url")
                .in_("id", member_ids)
                .execute()
            )
            members = members_response.data or []

    member_lookup = {member["id"]: member for member in members}
    project_lookup: dict[str, list[dict]] = {}

    for contributor in contributors:
        member = member_lookup.get(contributor["member_id"])
        if not member:
            continue
        project_lookup.setdefault(contributor["project_id"], []).append(
            {
                "member_id": contributor["member_id"],
                "role": contributor["role"],
                "member_name": member["name"],
                "member_role": member["role"],
                "member_photo_url": member.get("photo_url"),
            }
        )

    return [
        {
            **project,
            "tech_stack": project.get("tech_stack") or [],
            "github_url": project.get("github_url") or None,
            "live_url": project.get("live_url") or None,
            "thumbnail_url": project.get("thumbnail_url") or None,
            "contributors": project_lookup.get(project["id"], []),
        }
        for project in projects
    ]


def _replace_project_contributors(project_id: str, contributors: list[dict]) -> None:
    db = get_postgrest_client()
    db.table("project_members").delete().eq("project_id", project_id).execute()
    if contributors:
        db.table("project_members").insert(
            [
                {
                    "project_id": project_id,
                    "member_id": contributor["member_id"],
                    "role": contributor["role"],
                }
                for contributor in contributors
            ]
        ).execute()


@public_router.get("/projects", response_model=list[ProjectResponse])
def list_projects() -> list[dict]:
    db = get_auth_supabase()
    response = (
        db.table("projects")
        .select(PROJECT_COLUMNS)
        .order("created_at", desc=True)
        .execute()
    )
    return _serialize_projects(response.data or [], db)


@public_router.get("/projects/featured", response_model=list[ProjectResponse])
def list_featured_projects() -> list[dict]:
    db = get_auth_supabase()
    response = (
        db.table("projects")
        .select(PROJECT_COLUMNS)
        .eq("is_featured", True)
        .order("created_at", desc=True)
        .execute()
    )
    return _serialize_projects(response.data or [], db)


@admin_router.get("/projects", response_model=list[ProjectResponse])
def list_projects_admin(admin: dict = Depends(verify_admin)) -> list[dict]:
    db = get_postgrest_client()
    response = (
        db
        .table("projects")
        .select(PROJECT_COLUMNS)
        .order("created_at", desc=True)
        .execute()
    )
    return _serialize_projects(response.data or [], db)


@admin_router.post(
    "/projects",
    response_model=ProjectResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_project(payload: ProjectCreate, admin: dict = Depends(verify_admin)) -> dict:
    project_payload = jsonable_encoder(payload, exclude_none=True)
    contributors = project_payload.pop("contributors", [])
    db = get_postgrest_client()

    created = create_record(
        table_name="projects",
        payload=project_payload,
        conflict_message="Unable to create project",
    )

    try:
        _replace_project_contributors(created["id"], contributors)
    except APIError as exc:
        raise_conflict(exc, "Unable to create project")

    return _serialize_projects([created], db)[0]


@admin_router.put("/projects/{project_id}", response_model=ProjectResponse)
def update_project(
    project_id: UUID, payload: ProjectUpdate, admin: dict = Depends(verify_admin)
) -> dict:
    project_payload = jsonable_encoder(payload, exclude_unset=True)
    contributors = project_payload.pop("contributors", None)
    db = get_postgrest_client()

    updated = update_record_by_id(
        table_name="projects",
        record_id=project_id,
        payload=project_payload,
        columns=PROJECT_COLUMNS,
        conflict_message="Unable to update project",
        not_found_resource="Project",
    )

    if contributors is not None:
        try:
            _replace_project_contributors(str(project_id), contributors)
        except APIError as exc:
            raise_conflict(exc, "Unable to update project")

    return _serialize_projects([updated], db)[0]


@admin_router.delete("/projects/{project_id}")
def delete_project(project_id: UUID, admin: dict = Depends(verify_admin)) -> dict[str, bool]:
    return delete_record_by_id(
        table_name="projects",
        record_id=project_id,
        conflict_message="Unable to delete project",
        not_found_resource="Project",
    )
