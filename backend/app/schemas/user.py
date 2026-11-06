from pydantic import BaseModel, EmailStr, Field, field_validator

COMMON_PASSWORDS = {
    "password", "password1", "password12", "password123", "passw0rd123", "qwerty123", "qwertyuiop",
    "1234567890", "12345678910", "iloveyou123", "letmein1234", "welcome1234", "admin12345", "abc1234567",
}


def validate_password_strength(v: str) -> str:
    if len(v) < 10:
        raise ValueError("Password must be at least 10 characters")
    if len(v) > 128:
        raise ValueError("Password must be at most 128 characters")
    if v.lower() in COMMON_PASSWORDS or len(set(v)) < 5:
        raise ValueError("That password is too common or too repetitive")
    if not (any(c.isalpha() for c in v) and any(c.isdigit() or not c.isalnum() for c in v)):
        raise ValueError("Use letters plus at least one number or symbol")
    return v


class UserCreate(BaseModel):
    email: EmailStr
    password: str

    @field_validator("email")
    @classmethod
    def lower_email(cls, v: str) -> str:
        return v.strip().lower()

    @field_validator("password")
    @classmethod
    def strong_password(cls, v: str) -> str:
        return validate_password_strength(v)


class UserOut(BaseModel):
    id: int
    email: EmailStr
    twofa_enabled: bool

    class Config:
        from_attributes = True
