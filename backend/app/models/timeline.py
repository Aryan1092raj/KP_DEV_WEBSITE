from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator


class TimelineBase(BaseModel):
    model_config = ConfigDict(extra="ignore")

    year: int = Field(ge=1900, le=2100)
    title: str = Field(min_length=2, max_length=150)
    description: str = Field(default="", max_length=400)
    sort_order: int = 0

    @field_validator("title", "description", mode="before")
    @classmethod
    def strip_text(cls, value: str | None) -> str | None:
        return value.strip() if isinstance(value, str) else value


class TimelineCreate(TimelineBase):
    pass


class TimelineUpdate(BaseModel):
    model_config = ConfigDict(extra="ignore")

    year: int | None = Field(default=None, ge=1900, le=2100)
    title: str | None = Field(default=None, min_length=2, max_length=150)
    description: str | None = Field(default=None, max_length=400)
    sort_order: int | None = None

    @field_validator("title", "description", mode="before")
    @classmethod
    def strip_text(cls, value: str | None) -> str | None:
        return value.strip() if isinstance(value, str) else value


class TimelineResponse(TimelineBase):
    id: UUID
    created_at: datetime
