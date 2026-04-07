from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

ApplicationStatus = Literal["pending", "accepted", "rejected"]


class ApplicationCreate(BaseModel):
    model_config = ConfigDict(extra="ignore")

    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    branch: str = Field(min_length=2, max_length=100)
    batch: str = Field(min_length=2, max_length=30)
    why_join: str = Field(min_length=10, max_length=1000)
    skills: str = Field(default="", max_length=500)

    @field_validator("name", "branch", "batch", "why_join", "skills", mode="before")
    @classmethod
    def strip_text(cls, value: str | None) -> str | None:
        return value.strip() if isinstance(value, str) else value


class ApplicationStatusUpdate(BaseModel):
    model_config = ConfigDict(extra="ignore")

    status: ApplicationStatus


class ApplicationResponse(ApplicationCreate):
    id: UUID
    status: ApplicationStatus
    submitted_at: datetime
