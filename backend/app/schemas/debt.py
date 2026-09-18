from pydantic import BaseModel


class DebtCreate(BaseModel):
    name: str
    type: str = "credit_card"
    balance: float
    interest_rate: float = 0.0
    minimum_payment: float = 0.0


class DebtUpdate(BaseModel):
    name: str | None = None
    type: str | None = None
    balance: float | None = None
    interest_rate: float | None = None
    minimum_payment: float | None = None


class DebtOut(BaseModel):
    id: int
    name: str
    type: str
    balance: float
    interest_rate: float
    minimum_payment: float

    class Config:
        from_attributes = True


class PayoffRequest(BaseModel):
    strategy: str = "avalanche"  # avalanche | snowball
    extra_payment: float = 0.0


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
