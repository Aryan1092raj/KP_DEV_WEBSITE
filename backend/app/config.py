from functools import cached_property

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    port: int = Field(default=8000, alias="PORT")
    environment: str = Field(default="development", alias="ENVIRONMENT")
    cors_origin: str = Field(default="http://localhost:3000", alias="CORS_ORIGIN")
    supabase_url: str = Field(..., alias="SUPABASE_URL")
    supabase_anon_key: str = Field(..., alias="SUPABASE_ANON_KEY")
    supabase_service_role_key: str | None = Field(
        default=None,
        alias="SUPABASE_SERVICE_ROLE_KEY",
    )
    supabase_jwt_secret: str = Field(..., alias="SUPABASE_JWT_SECRET")
    admin_session_secret: str | None = Field(default=None, alias="ADMIN_SESSION_SECRET")
    admin_session_cookie_name: str = Field(
        default="kp_admin_session",
        alias="ADMIN_SESSION_COOKIE_NAME",
    )
    admin_session_max_age_seconds: int = Field(
        default=28800,
        alias="ADMIN_SESSION_MAX_AGE_SECONDS",
    )
    admin_rate_limit_requests: int = Field(default=120, alias="ADMIN_RATE_LIMIT_REQUESTS")
    admin_rate_limit_window_seconds: int = Field(default=60, alias="ADMIN_RATE_LIMIT_WINDOW_SECONDS")
    public_submission_rate_limit_requests: int = Field(
        default=20,
        alias="PUBLIC_SUBMISSION_RATE_LIMIT_REQUESTS",
    )
    public_submission_rate_limit_window_seconds: int = Field(
        default=300,
        alias="PUBLIC_SUBMISSION_RATE_LIMIT_WINDOW_SECONDS",
    )

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @cached_property
    def supabase_database_key(self) -> str:
        return self.supabase_service_role_key or self.supabase_anon_key

    @cached_property
    def is_production(self) -> bool:
        return self.environment.strip().lower() == "production"

    @cached_property
    def session_signing_secret(self) -> str:
        return self.admin_session_secret or self.supabase_jwt_secret

    @cached_property
    def secure_cookies(self) -> bool:
        return self.is_production

    @cached_property
    def session_cookie_samesite(self) -> str:
        return "none" if self.secure_cookies else "lax"

    @cached_property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origin.split(",") if origin.strip()]


settings = Settings()
