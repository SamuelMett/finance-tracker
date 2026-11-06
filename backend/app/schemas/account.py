from typing import Literal

from pydantic import BaseModel, Field


AccountType = Literal["checking", "savings", "credit_card", "cash", "investment", "other"]
Money = Field(ge=-1_000_000_000, le=1_000_000_000)


class AccountCreate(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    type: AccountType = "checking"
    starting_balance: float = Field(default=0.0, ge=-1_000_000_000, le=1_000_000_000)


class AccountUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=80)
    type: AccountType | None = None
    starting_balance: float | None = Field(default=None, ge=-1_000_000_000, le=1_000_000_000)


class AccountOut(BaseModel):
    id: int
    name: str
    type: str
    starting_balance: float
    balance: float

    class Config:
        from_attributes = True
