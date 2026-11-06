from datetime import date as date_type

from typing import Literal

from pydantic import BaseModel, Field


Kind = Literal["income", "expense"]


class TransactionCreate(BaseModel):
    account_id: int
    category_id: int | None = None
    kind: Kind = "expense"
    amount: float = Field(gt=0, le=1_000_000_000)
    description: str | None = Field(default=None, max_length=200)
    date: date_type


class TransactionUpdate(BaseModel):
    account_id: int | None = None
    category_id: int | None = None
    kind: Kind | None = None
    amount: float | None = Field(default=None, gt=0, le=1_000_000_000)
    description: str | None = Field(default=None, max_length=200)
    date: date_type | None = None


class TransactionOut(BaseModel):
    id: int
    account_id: int
    category_id: int | None
    kind: str
    amount: float
    description: str | None
    date: date_type

    class Config:
        from_attributes = True
