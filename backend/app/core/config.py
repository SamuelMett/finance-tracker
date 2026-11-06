from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    PROJECT_NAME: str = "Runway API"
    ENV: str = "dev"  # set to "prod" in production: hides API docs, enables HSTS

    # Database
    DATABASE_URL: str = "sqlite:///./finance_tracker.db"

    # JWT: must be set via the environment or a .env file (see .env.example).
    # No insecure default, and the app refuses to start with a weak secret.
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    JWT_ISSUER: str = "runway-api"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Abuse protection
    MAX_BODY_BYTES: int = 1_000_000
    LOGIN_MAX_ATTEMPTS: int = 5  # failed attempts per email+IP before lockout
    LOGIN_LOCKOUT_SECONDS: int = 900
    AUTH_RATE_LIMIT: int = 20  # auth requests per IP per minute
    API_RATE_LIMIT: int = 240  # all other requests per IP per minute

    @field_validator("JWT_SECRET_KEY")
    @classmethod
    def secret_must_be_strong(cls, v: str) -> str:
        if len(v) < 32 or v.upper().startswith("CHANGE_ME"):
            raise ValueError("JWT_SECRET_KEY must be a random string of at least 32 characters")
        return v

    @property
    def is_prod(self) -> bool:
        return self.ENV.lower() == "prod"


settings = Settings()
