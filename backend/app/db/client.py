from functools import lru_cache

from supabase import Client, create_client

from app.config import settings


@lru_cache(maxsize=1)
def get_supabase() -> Client:
    return create_client(settings.supabase_url, settings.supabase_anon_key)


def get_postgrest_client(token: str | None = None):
    # Use a fresh Supabase client for authenticated PostgREST requests so the
    # official header/session wiring stays consistent with supabase-py.
    supabase = create_client(settings.supabase_url, settings.supabase_anon_key)
    if token:
        supabase.postgrest.auth(token)
    return supabase.postgrest
