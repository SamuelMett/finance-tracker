from typing import Literal

from pydantic import BaseModel, Field


Kind = Literal["income", "expense"]
HexColor = r"^#[0-9a-fA-F]{6}$"


class CategoryCreate(BaseModel):
    name: str = Field(min_length=1, max_length=60)
    kind: Kind = "expense"
    color: str = Field(default="#8a8f98", pattern=HexColor)


class CategoryUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=60)
    kind: Kind | None = None
    color: str | None = Field(default=None, pattern=HexColor)


class CategoryOut(BaseModel):
    id: int
    name: str
    kind: str
    color: str

    class Config:
        from_attributes = True
