from datetime import date as date_type

from pydantic import BaseModel, field_validator


class TransactionCreate(BaseModel):
    account_id: int
    category_id: int | None = None
    kind: str = "expense"
    amount: float
    description: str | None = None
    date: date_type

    @field_validator("amount")
    @classmethod
    def amount_positive(cls, v: float):
        if v <= 0:
            raise ValueError("Amount must be greater than 0")
        return v

    @field_validator("kind")
    @classmethod
    def kind_valid(cls, v: str):
        if v not in ("income", "expense"):
            raise ValueError("kind must be 'income' or 'expense'")
        return v


class TransactionUpdate(BaseModel):
    account_id: int | None = None
    category_id: int | None = None
    kind: str | None = None
    amount: float | None = None
    description: str | None = None
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
