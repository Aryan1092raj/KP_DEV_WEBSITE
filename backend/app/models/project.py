from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, HttpUrl, field_validator

from app.models.validators import normalize_empty_url, normalize_text

ProjectStatus = Literal["active", "archived", "in-progress"]


class ProjectContributorBase(BaseModel):
    model_config = ConfigDict(extra="ignore")

    member_id: UUID
    role: str = Field(min_length=2, max_length=100)

    @field_validator("role", mode="before")
    @classmethod
    def strip_role(cls, value: str | None) -> str | None:
        return normalize_text(value)


class ProjectContributorCreate(ProjectContributorBase):
    pass


class ProjectContributorResponse(ProjectContributorBase):
    member_name: str
    member_role: str
    member_photo_url: str | None = None


class ProjectBase(BaseModel):
    model_config = ConfigDict(extra="ignore")

    title: str = Field(min_length=2, max_length=150)
    description: str = Field(min_length=10, max_length=500)
    tech_stack: list[str] = Field(min_length=1)
    github_url: HttpUrl | None = None
    live_url: HttpUrl | None = None
    thumbnail_url: HttpUrl | None = None
    year: int | None = Field(default=None, ge=1900, le=2100)
    is_featured: bool = False
    status: ProjectStatus = "active"

    @field_validator("title", "description", mode="before")
    @classmethod
    def strip_text(cls, value: str | None) -> str | None:
        return normalize_text(value)

    @field_validator("tech_stack", mode="before")
    @classmethod
    def clean_stack(cls, value: object) -> list[str]:
        if not isinstance(value, list):
            raise TypeError("tech_stack must be a list of strings")
        cleaned = [str(item).strip() for item in value if str(item).strip()]
        if not cleaned:
            raise ValueError("tech_stack must contain at least one item")
        return cleaned

    @field_validator("github_url", "live_url", "thumbnail_url", mode="before")
    @classmethod
    def empty_url_to_none(cls, value: object) -> object:
        return normalize_empty_url(value)


class ProjectCreate(ProjectBase):
    contributors: list[ProjectContributorCreate] = Field(default_factory=list)


class ProjectUpdate(BaseModel):
    model_config = ConfigDict(extra="ignore")

    title: str | None = Field(default=None, min_length=2, max_length=150)
    description: str | None = Field(default=None, min_length=10, max_length=500)
    tech_stack: list[str] | None = Field(default=None, min_length=1)
    github_url: HttpUrl | None = None
    live_url: HttpUrl | None = None
    thumbnail_url: HttpUrl | None = None
    year: int | None = Field(default=None, ge=1900, le=2100)
    is_featured: bool | None = None
    status: ProjectStatus | None = None
    contributors: list[ProjectContributorCreate] | None = None

    @field_validator("title", "description", mode="before")
    @classmethod
    def strip_text(cls, value: str | None) -> str | None:
        return normalize_text(value)

    @field_validator("tech_stack", mode="before")
    @classmethod
    def clean_stack(cls, value: object) -> object:
        if value is None:
            return value
        if not isinstance(value, list):
            raise TypeError("tech_stack must be a list of strings")
        cleaned = [str(item).strip() for item in value if str(item).strip()]
        if not cleaned:
            raise ValueError("tech_stack must contain at least one item")
        return cleaned

    @field_validator("github_url", "live_url", "thumbnail_url", mode="before")
    @classmethod
    def empty_url_to_none(cls, value: object) -> object:
        return normalize_empty_url(value)


class ProjectResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: UUID
    title: str
    description: str
    tech_stack: list[str] = Field(default_factory=list)
    github_url: HttpUrl | None = None
    live_url: HttpUrl | None = None
    thumbnail_url: HttpUrl | None = None
    year: int | None = None
    is_featured: bool = False
    status: ProjectStatus = "active"
    created_at: datetime
    contributors: list[ProjectContributorResponse] = Field(default_factory=list)
