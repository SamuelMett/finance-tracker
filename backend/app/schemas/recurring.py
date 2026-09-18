from datetime import date as date_type

from pydantic import BaseModel


class RecurringCreate(BaseModel):
    name: str
    amount: float
    frequency: str = "monthly"  # weekly, biweekly, monthly, yearly
    next_due_date: date_type | None = None
    account_id: int | None = None
    category_id: int | None = None


class RecurringUpdate(BaseModel):
    name: str | None = None
    amount: float | None = None
    frequency: str | None = None
    next_due_date: date_type | None = None
    status: str | None = None
    account_id: int | None = None
    category_id: int | None = None


class RecurringOut(BaseModel):
    id: int
    name: str
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
