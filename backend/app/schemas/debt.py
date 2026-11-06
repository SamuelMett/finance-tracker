from typing import Literal

from pydantic import BaseModel, Field

DebtType = Literal["credit_card", "student_loan", "auto_loan", "mortgage", "personal_loan", "other"]


class DebtCreate(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    type: DebtType = "credit_card"
    balance: float = Field(ge=0, le=1_000_000_000)
    interest_rate: float = Field(default=0.0, ge=0, le=100)
    minimum_payment: float = Field(default=0.0, ge=0, le=1_000_000_000)
    due_day: int = Field(default=1, ge=1, le=28)


class DebtUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=80)
    type: DebtType | None = None
    balance: float | None = Field(default=None, ge=0, le=1_000_000_000)
    interest_rate: float | None = Field(default=None, ge=0, le=100)
    minimum_payment: float | None = Field(default=None, ge=0, le=1_000_000_000)
    due_day: int | None = Field(default=None, ge=1, le=28)


class DebtOut(BaseModel):
    id: int
    name: str
    type: str
    balance: float
    interest_rate: float
    minimum_payment: float
    due_day: int

    class Config:
        from_attributes = True


class PayoffRequest(BaseModel):
    strategy: Literal["avalanche", "snowball"] = "avalanche"
    extra_payment: float = Field(default=0.0, ge=0, le=1_000_000_000)


class DebtPayoffEntry(BaseModel):
    debt_id: int
    name: str
    payoff_month: int
    interest_paid: float


class PayoffPlan(BaseModel):
    strategy: str
    months_to_debt_free: int
    total_interest_paid: float
    total_paid: float
    timeline: list[dict]
    payoff_order: list[DebtPayoffEntry]
