from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from app.models.validators import normalize_text


class AdminLoginRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")

    email: EmailStr
    password: str = Field(min_length=1, max_length=256)

    @field_validator("password", mode="before")
    @classmethod
    def strip_password(cls, value: str | None) -> str | None:
        return normalize_text(value)


class AdminUserResponse(BaseModel):
    id: str
    email: EmailStr | None = None
    role: str


class AdminSessionResponse(BaseModel):
    authenticated: bool = True
    expires_at: datetime
    user: AdminUserResponse


class AdminLoginResponse(AdminSessionResponse):
    access_token: str
