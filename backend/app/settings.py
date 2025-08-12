from functools import lru_cache
from pydantic_settings import BaseSettings
from pydantic import Field
from typing import Optional


class Settings(BaseSettings):
    # Google Play settings
    google_application_credentials: Optional[str] = Field(
        default=None, description="Path to service account JSON"
    )
    google_play_package_name: Optional[str] = None

    # App
    debug: bool = False

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    return Settings()