from functools import cached_property

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    port: int = Field(default=8000, alias="PORT")
    environment: str = Field(default="development", alias="ENVIRONMENT")
    cors_origin: str = Field(default="http://localhost:3000", alias="CORS_ORIGIN")
    supabase_url: str = Field(..., alias="SUPABASE_URL")
    supabase_anon_key: str = Field(..., alias="SUPABASE_ANON_KEY")
    supabase_jwt_secret: str = Field(..., alias="SUPABASE_JWT_SECRET")

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @cached_property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origin.split(",") if origin.strip()]


settings = Settings()
