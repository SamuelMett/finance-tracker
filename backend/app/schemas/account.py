from pydantic import BaseModel


class AccountCreate(BaseModel):
    name: str
    type: str = "checking"
    starting_balance: float = 0.0


class AccountUpdate(BaseModel):
    name: str | None = None
    type: str | None = None
    starting_balance: float | None = None


class AccountOut(BaseModel):
    id: int
    name: str
    type: str
    starting_balance: float
    balance: float

    class Config:
        from_attributes = True
