from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    PROJECT_NAME: str = "Runway API"

    # Database
    DATABASE_URL: str = "sqlite:///./finance_tracker.db"

    # JWT — must be set via the environment or a .env file (see .env.example).
    # No insecure default: the app refuses to start without a real secret.
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60


settings = Settings()
