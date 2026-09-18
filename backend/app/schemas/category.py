from pydantic import BaseModel


class CategoryCreate(BaseModel):
    name: str
    kind: str = "expense"
    color: str = "#6366f1"


class CategoryUpdate(BaseModel):
    name: str | None = None
    kind: str | None = None
    color: str | None = None


class CategoryOut(BaseModel):
    id: int
    name: str
    kind: str
    color: str

    class Config:
        from_attributes = True
