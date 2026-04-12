from typing import Any
from uuid import UUID

from postgrest.exceptions import APIError

from app.db.client import get_postgrest_client
from app.exceptions.handlers import raise_conflict, raise_not_found


def create_record(
    *,
    table_name: str,
    payload: dict[str, Any],
    conflict_message: str,
    db_client: Any | None = None,
) -> dict[str, Any]:
    db = db_client or get_postgrest_client()

    try:
        response = db.table(table_name).insert(payload).execute()
    except APIError as exc:
        raise_conflict(exc, conflict_message)

    return response.data[0]


def update_record_by_id(
    *,
    table_name: str,
    record_id: UUID,
    payload: dict[str, Any],
    columns: str,
    conflict_message: str,
    not_found_resource: str,
) -> dict[str, Any]:
    db = get_postgrest_client()

    try:
        if payload:
            response = db.table(table_name).update(payload).eq("id", str(record_id)).execute()
        else:
            response = db.table(table_name).select(columns).eq("id", str(record_id)).execute()
    except APIError as exc:
        raise_conflict(exc, conflict_message)

    if not response.data:
        raise_not_found(not_found_resource)

    return response.data[0]


def delete_record_by_id(
    *,
    table_name: str,
    record_id: UUID,
    conflict_message: str,
    not_found_resource: str,
) -> dict[str, bool]:
    try:
        response = get_postgrest_client().table(table_name).delete().eq("id", str(record_id)).execute()
    except APIError as exc:
        raise_conflict(exc, conflict_message)

    if not response.data:
        raise_not_found(not_found_resource)

    return {"deleted": True}
