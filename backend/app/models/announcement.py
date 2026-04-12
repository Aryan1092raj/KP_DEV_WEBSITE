from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.models.validators import normalize_text


class AnnouncementBase(BaseModel):
    model_config = ConfigDict(extra="ignore")

    title: str = Field(min_length=2, max_length=160)
    body: str = Field(min_length=10, max_length=50000)
    author: str = Field(min_length=2, max_length=100)
    is_published: bool = False
    published_at: datetime | None = None

    @field_validator("title", "body", "author", mode="before")
    @classmethod
    def strip_text(cls, value: str | None) -> str | None:
        return normalize_text(value)


class AnnouncementCreate(AnnouncementBase):
    pass


class AnnouncementUpdate(BaseModel):
    model_config = ConfigDict(extra="ignore")

    title: str | None = Field(default=None, min_length=2, max_length=160)
    body: str | None = Field(default=None, min_length=10, max_length=50000)
    author: str | None = Field(default=None, min_length=2, max_length=100)
    is_published: bool | None = None
    published_at: datetime | None = None

    @field_validator("title", "body", "author", mode="before")
    @classmethod
    def strip_text(cls, value: str | None) -> str | None:
        return normalize_text(value)


class AnnouncementResponse(AnnouncementBase):
    id: UUID
    created_at: datetime
    updated_at: datetime | None = None
