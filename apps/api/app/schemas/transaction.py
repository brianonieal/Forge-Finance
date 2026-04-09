import uuid
from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel


class TransactionRead(BaseModel):
    id: uuid.UUID
    account_id: uuid.UUID
    amount: Decimal
    date: date
    merchant_name: str | None
    category: str | None
    subcategory: str | None
    pending: bool
    notes: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class TransactionUpdate(BaseModel):
    category: str | None = None
    notes: str | None = None
