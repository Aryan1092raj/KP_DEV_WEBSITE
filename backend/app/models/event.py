from datetime import date, datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, HttpUrl, field_validator, model_validator

from app.models.validators import normalize_empty_url, normalize_text

EventType = Literal["session", "workshop", "hackathon", "talk"]


class EventBase(BaseModel):
    model_config = ConfigDict(extra="ignore")

    title: str = Field(min_length=2, max_length=150)
    description: str = Field(default="", max_length=500)
    event_date: date
    end_date: date | None = None
    event_type: EventType = "session"
    resource_url: HttpUrl | None = None
    is_upcoming: bool = False
    is_ongoing: bool = False

    @field_validator("title", "description", mode="before")
    @classmethod
    def strip_text(cls, value: str | None) -> str | None:
        return normalize_text(value)

    @field_validator("resource_url", mode="before")
    @classmethod
    def empty_url_to_none(cls, value: object) -> object:
        return normalize_empty_url(value)

    @model_validator(mode="after")
    def validate_dates_and_status(self):
        if self.end_date is not None and self.end_date < self.event_date:
            raise ValueError("end_date must be on or after event_date")

        if self.is_upcoming and self.is_ongoing:
            raise ValueError("is_upcoming and is_ongoing cannot both be true")

        return self


class EventCreate(EventBase):
    pass


class EventUpdate(BaseModel):
    model_config = ConfigDict(extra="ignore")

    title: str | None = Field(default=None, min_length=2, max_length=150)
    description: str | None = Field(default=None, max_length=500)
    event_date: date | None = None
    end_date: date | None = None
    event_type: EventType | None = None
    resource_url: HttpUrl | None = None
    is_upcoming: bool | None = None
    is_ongoing: bool | None = None

    @field_validator("title", "description", mode="before")
    @classmethod
    def strip_text(cls, value: str | None) -> str | None:
        return normalize_text(value)

    @field_validator("resource_url", mode="before")
    @classmethod
    def empty_url_to_none(cls, value: object) -> object:
        return normalize_empty_url(value)

    @model_validator(mode="after")
    def validate_dates_and_status(self):
        if (
            self.end_date is not None
            and self.event_date is not None
            and self.end_date < self.event_date
        ):
            raise ValueError("end_date must be on or after event_date")

        if self.is_upcoming is True and self.is_ongoing is True:
            raise ValueError("is_upcoming and is_ongoing cannot both be true")

        return self


class EventResponse(EventBase):
    id: UUID
    created_at: datetime
