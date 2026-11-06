from pydantic import BaseModel, EmailStr, Field, field_validator


class _EmailMixin(BaseModel):
    email: EmailStr

    @field_validator("email")
    @classmethod
    def lower_email(cls, v: str) -> str:
        return v.strip().lower()


class LoginRequest(_EmailMixin):
    password: str = Field(min_length=1, max_length=128)


class Login2FARequest(_EmailMixin):
    password: str = Field(min_length=1, max_length=128)
    otp: str = Field(pattern=r"^\d{6}$")


class TwoFactorConfirm(BaseModel):
    code: str = Field(pattern=r"^\d{6}$")


class TwoFactorDisable(BaseModel):
    password: str = Field(min_length=1, max_length=128)
    code: str = Field(pattern=r"^\d{6}$")
