from datetime import date as date_type
from typing import Literal

from pydantic import BaseModel, Field

Kind = Literal["income", "expense"]
Frequency = Literal["weekly", "biweekly", "monthly", "yearly"]
Status = Literal["active", "cancelled"]


class RecurringCreate(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    kind: Kind = "expense"
    amount: float = Field(gt=0, le=1_000_000_000)
    frequency: Frequency = "monthly"
    next_due_date: date_type | None = None
    account_id: int | None = None
    category_id: int | None = None


class RecurringUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=80)
    kind: Kind | None = None
    amount: float | None = Field(default=None, gt=0, le=1_000_000_000)
    frequency: Frequency | None = None
    next_due_date: date_type | None = None
    status: Status | None = None
    account_id: int | None = None
    category_id: int | None = None


class RecurringOut(BaseModel):
    id: int
    name: str
    kind: str
    amount: float
    frequency: str
    next_due_date: date_type | None
    last_seen_date: date_type | None
    status: str
    source: str
    account_id: int | None
    category_id: int | None

    class Config:
        from_attributes = True
