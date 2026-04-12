from datetime import datetime
import re
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, HttpUrl, field_validator

from app.models.validators import normalize_empty_url, normalize_text


IMAGE_DATA_URL_PATTERN = re.compile(
    r"^data:image\/(png|jpeg|jpg|webp|gif);base64,[A-Za-z0-9+/=\s]+$",
    re.IGNORECASE,
)


def normalize_photo_value(value: object) -> str | None | object:
    if value in ("", None):
        return None
    if isinstance(value, str):
        return value.strip()
    return value


def validate_photo_value(value: str | None) -> str | None:
    if value is None:
        return None

    if len(value) > 2_000_000:
        raise ValueError("photo_url is too large; please upload a smaller image")

    if value.startswith(("http://", "https://")):
        return value

    if IMAGE_DATA_URL_PATTERN.match(value):
        return value

    raise ValueError("photo_url must be an http(s) URL or an image data URL")


class MemberBase(BaseModel):
    model_config = ConfigDict(extra="ignore")

    name: str = Field(min_length=2, max_length=100)
    role: str = Field(min_length=2, max_length=100)
    batch: str = Field(min_length=2, max_length=30)
    bio: str = Field(default="", max_length=300)
    photo_url: str | None = None
    github_url: HttpUrl | None = None
    linkedin_url: HttpUrl | None = None
    is_active: bool = True
    display_order: int = 0

    @field_validator("name", "role", "batch", "bio", mode="before")
    @classmethod
    def strip_text(cls, value: str | None) -> str | None:
        return normalize_text(value)

    @field_validator("photo_url", mode="before")
    @classmethod
    def empty_photo_to_none(cls, value: object) -> object:
        return normalize_photo_value(value)

    @field_validator("photo_url")
    @classmethod
    def validate_photo_url(cls, value: str | None) -> str | None:
        return validate_photo_value(value)

    @field_validator("github_url", "linkedin_url", mode="before")
    @classmethod
    def empty_url_to_none(cls, value: object) -> object:
        return normalize_empty_url(value)


class MemberCreate(MemberBase):
    pass


class MemberUpdate(BaseModel):
    model_config = ConfigDict(extra="ignore")

    name: str | None = Field(default=None, min_length=2, max_length=100)
    role: str | None = Field(default=None, min_length=2, max_length=100)
    batch: str | None = Field(default=None, min_length=2, max_length=30)
    bio: str | None = Field(default=None, max_length=300)
    photo_url: str | None = None
    github_url: HttpUrl | None = None
    linkedin_url: HttpUrl | None = None
    is_active: bool | None = None
    display_order: int | None = None

    @field_validator("name", "role", "batch", "bio", mode="before")
    @classmethod
    def strip_text(cls, value: str | None) -> str | None:
        return normalize_text(value)

    @field_validator("photo_url", mode="before")
    @classmethod
    def empty_photo_to_none(cls, value: object) -> object:
        return normalize_photo_value(value)

    @field_validator("photo_url")
    @classmethod
    def validate_photo_url(cls, value: str | None) -> str | None:
        return validate_photo_value(value)

    @field_validator("github_url", "linkedin_url", mode="before")
    @classmethod
    def empty_url_to_none(cls, value: object) -> object:
        return normalize_empty_url(value)


class MemberResponse(MemberBase):
    id: UUID
    created_at: datetime
