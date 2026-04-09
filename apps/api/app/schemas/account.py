import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel


class AccountRead(BaseModel):
    id: uuid.UUID
    name: str
    official_name: str | None
    type: str
    subtype: str | None
    mask: str | None
    institution_name: str | None
    balance_current: Decimal | None
    balance_available: Decimal | None
    currency: str
    created_at: datetime

    model_config = {"from_attributes": True}
