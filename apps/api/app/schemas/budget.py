import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel


class BudgetCreate(BaseModel):
    category: str
    amount_limit: Decimal
    period: str = "monthly"
    alert_threshold: int = 70


class BudgetRead(BudgetCreate):
    id: uuid.UUID
    created_at: datetime

    model_config = {"from_attributes": True}


class BudgetUpdate(BaseModel):
    category: str | None = None
    amount_limit: Decimal | None = None
    period: str | None = None
    alert_threshold: int | None = None
