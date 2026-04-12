from functools import lru_cache

from supabase import Client, create_client

from app.config import settings


@lru_cache(maxsize=1)
def get_supabase() -> Client:
    return create_client(settings.supabase_url, settings.supabase_database_key)


@lru_cache(maxsize=1)
def get_auth_supabase() -> Client:
    return create_client(settings.supabase_url, settings.supabase_anon_key)


def get_postgrest_client():
    # Table access is intentionally anchored to the backend credential so the
    # API layer, not caller-controlled PostgREST tokens, defines data access.
    return get_supabase().postgrest
