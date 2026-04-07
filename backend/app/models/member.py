from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, HttpUrl, field_validator


class MemberBase(BaseModel):
    model_config = ConfigDict(extra="ignore")

    name: str = Field(min_length=2, max_length=100)
    role: str = Field(min_length=2, max_length=100)
    batch: str = Field(min_length=2, max_length=30)
    bio: str = Field(default="", max_length=300)
    photo_url: HttpUrl | None = None
    github_url: HttpUrl | None = None
    linkedin_url: HttpUrl | None = None
    is_active: bool = True
    display_order: int = 0

    @field_validator("name", "role", "batch", "bio", mode="before")
    @classmethod
    def strip_text(cls, value: str | None) -> str | None:
        return value.strip() if isinstance(value, str) else value

    @field_validator("photo_url", "github_url", "linkedin_url", mode="before")
    @classmethod
    def empty_url_to_none(cls, value: object) -> object:
        if value in ("", None):
            return None
        return value


class MemberCreate(MemberBase):
    pass


class MemberUpdate(BaseModel):
    model_config = ConfigDict(extra="ignore")

    name: str | None = Field(default=None, min_length=2, max_length=100)
    role: str | None = Field(default=None, min_length=2, max_length=100)
    batch: str | None = Field(default=None, min_length=2, max_length=30)
    bio: str | None = Field(default=None, max_length=300)
    photo_url: HttpUrl | None = None
    github_url: HttpUrl | None = None
    linkedin_url: HttpUrl | None = None
    is_active: bool | None = None
    display_order: int | None = None

    @field_validator("name", "role", "batch", "bio", mode="before")
    @classmethod
    def strip_text(cls, value: str | None) -> str | None:
        return value.strip() if isinstance(value, str) else value

    @field_validator("photo_url", "github_url", "linkedin_url", mode="before")
    @classmethod
    def empty_url_to_none(cls, value: object) -> object:
        if value == "":
            return None
        return value


class MemberResponse(MemberBase):
    id: UUID
    created_at: datetime
