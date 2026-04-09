import uuid
from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel


class GoalCreate(BaseModel):
    name: str
    target_amount: Decimal
    deadline: date | None = None
    linked_account_id: uuid.UUID | None = None


class GoalRead(GoalCreate):
    id: uuid.UUID
    current_amount: Decimal
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


class GoalUpdate(BaseModel):
    name: str | None = None
    target_amount: Decimal | None = None
    current_amount: Decimal | None = None
    deadline: date | None = None
    status: str | None = None
