from uuid import UUID

from fastapi import APIRouter, Depends, status
from fastapi.encoders import jsonable_encoder
from postgrest.exceptions import APIError

from app.db.client import get_postgrest_client, get_supabase
from app.exceptions.handlers import raise_conflict, raise_not_found
from app.middleware.auth import verify_admin
from app.models.project import ProjectCreate, ProjectResponse, ProjectUpdate

public_router = APIRouter(prefix="/api", tags=["Projects"])
admin_router = APIRouter(prefix="/api/admin", tags=["Admin Projects"])

PROJECT_COLUMNS = (
    "id,title,description,tech_stack,github_url,live_url,thumbnail_url,"
    "year,is_featured,status,created_at"
)
PROJECT_MEMBER_COLUMNS = "project_id,member_id,role"


def _serialize_projects(projects: list[dict]) -> list[dict]:
    if not projects:
        return []

    db = get_supabase()
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
    response = (
        get_supabase()
        .table("projects")
        .select(PROJECT_COLUMNS)
        .order("created_at", desc=True)
        .execute()
    )
    return _serialize_projects(response.data or [])


@public_router.get("/projects/featured", response_model=list[ProjectResponse])
def list_featured_projects() -> list[dict]:
    response = (
        get_supabase()
        .table("projects")
        .select(PROJECT_COLUMNS)
        .eq("is_featured", True)
        .order("created_at", desc=True)
        .execute()
    )
    return _serialize_projects(response.data or [])


@admin_router.get("/projects", response_model=list[ProjectResponse])
def list_projects_admin(admin: dict = Depends(verify_admin)) -> list[dict]:
    response = (
        get_postgrest_client()
        .table("projects")
        .select(PROJECT_COLUMNS)
        .order("created_at", desc=True)
        .execute()
    )
    return _serialize_projects(response.data or [])


@admin_router.post(
    "/projects",
    response_model=ProjectResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_project(payload: ProjectCreate, admin: dict = Depends(verify_admin)) -> dict:
    project_payload = jsonable_encoder(payload, exclude_none=True)
    contributors = project_payload.pop("contributors", [])
    db = get_postgrest_client()
    try:
        response = db.table("projects").insert(project_payload).execute()
        created = response.data[0]
        _replace_project_contributors(created["id"], contributors)
    except APIError as exc:
        raise_conflict(exc, "Unable to create project")
    return _serialize_projects([created])[0]


@admin_router.put("/projects/{project_id}", response_model=ProjectResponse)
def update_project(
    project_id: UUID, payload: ProjectUpdate, admin: dict = Depends(verify_admin)
) -> dict:
    project_payload = jsonable_encoder(payload, exclude_unset=True)
    contributors = project_payload.pop("contributors", None)
    db = get_postgrest_client()

    try:
        if project_payload:
            response = db.table("projects").update(project_payload).eq("id", str(project_id)).execute()
            if not response.data:
                raise_not_found("Project")
            updated = response.data[0]
        else:
            lookup = (
                db.table("projects")
                .select(PROJECT_COLUMNS)
                .eq("id", str(project_id))
                .execute()
            )
            if not lookup.data:
                raise_not_found("Project")
            updated = lookup.data[0]

        if contributors is not None:
            _replace_project_contributors(str(project_id), contributors)
    except APIError as exc:
        raise_conflict(exc, "Unable to update project")

    return _serialize_projects([updated])[0]


@admin_router.delete("/projects/{project_id}")
def delete_project(project_id: UUID, admin: dict = Depends(verify_admin)) -> dict[str, bool]:
    try:
        response = (
            get_postgrest_client()
            .table("projects")
            .delete()
            .eq("id", str(project_id))
            .execute()
        )
    except APIError as exc:
        raise_conflict(exc, "Unable to delete project")
    if not response.data:
        raise_not_found("Project")
    return {"deleted": True}
