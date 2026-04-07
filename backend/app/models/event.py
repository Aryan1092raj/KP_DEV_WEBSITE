from datetime import date, datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, HttpUrl, field_validator

EventType = Literal["session", "workshop", "hackathon", "talk"]


class EventBase(BaseModel):
    model_config = ConfigDict(extra="ignore")

    title: str = Field(min_length=2, max_length=150)
    description: str = Field(default="", max_length=500)
    event_date: date
    event_type: EventType = "session"
    resource_url: HttpUrl | None = None
    is_upcoming: bool = False

    @field_validator("title", "description", mode="before")
    @classmethod
    def strip_text(cls, value: str | None) -> str | None:
        return value.strip() if isinstance(value, str) else value

    @field_validator("resource_url", mode="before")
    @classmethod
    def empty_url_to_none(cls, value: object) -> object:
        if value in ("", None):
            return None
        return value


class EventCreate(EventBase):
    pass


class EventUpdate(BaseModel):
    model_config = ConfigDict(extra="ignore")

    title: str | None = Field(default=None, min_length=2, max_length=150)
    description: str | None = Field(default=None, max_length=500)
    event_date: date | None = None
    event_type: EventType | None = None
    resource_url: HttpUrl | None = None
    is_upcoming: bool | None = None

    @field_validator("title", "description", mode="before")
    @classmethod
    def strip_text(cls, value: str | None) -> str | None:
        return value.strip() if isinstance(value, str) else value

    @field_validator("resource_url", mode="before")
    @classmethod
    def empty_url_to_none(cls, value: object) -> object:
        if value == "":
            return None
        return value


class EventResponse(EventBase):
    id: UUID
    created_at: datetime
