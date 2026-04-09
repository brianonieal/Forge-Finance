import uuid
from datetime import datetime

from pydantic import BaseModel


class UserBase(BaseModel):
    email: str
    full_name: str | None = None


class UserRead(UserBase):
    id: uuid.UUID
    plan: str
    query_count: int
    created_at: datetime

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    full_name: str | None = None
    avatar_url: str | None = None
