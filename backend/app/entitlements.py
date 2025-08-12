from __future__ import annotations
from typing import Dict, Optional
from datetime import datetime, timedelta, timezone
import os

from .settings import Settings
from .google_play import GooglePlayClient, GooglePlayNotConfigured


class EntitlementsService:
    def __init__(self, settings: Settings) -> None:
        self._settings = settings
        try:
            self._gplay = GooglePlayClient.from_env(settings)
        except GooglePlayNotConfigured:
            self._gplay = None
        # naive in-memory store for demo; replace with DB in production
        self._user_entitlements: Dict[str, dict] = {}

    def get_user_entitlement(self, user_id: str) -> Optional[dict]:
        return self._user_entitlements.get(user_id)

    def set_user_entitlement(self, user_id: str, active: bool, expires_at: Optional[datetime], source: str, raw: dict) -> dict:
        record = {
            "user_id": user_id,
            "active": active,
            "expires_at": expires_at.isoformat() if expires_at else None,
            "source": source,
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "raw": raw,
        }
        self._user_entitlements[user_id] = record
        return record

    def verify_google_purchase(self, package_name: str, product_id: str, purchase_token: str, user_id: str) -> dict:
        if self._gplay is None:
            # Not configured: mark inactive with reason
            record = self.set_user_entitlement(
                user_id=user_id,
                active=False,
                expires_at=None,
                source="google",
                raw={
                    "reason": "google_play_not_configured",
                    "package_name": package_name,
                    "product_id": product_id,
                },
            )
            return record

        status = self._gplay.verify_subscription(package_name=package_name, token=purchase_token)
        active = status.get("active", False)
        expires_at = status.get("expiry_time_millis")
        expires_dt = None
        if expires_at is not None:
            try:
                expires_dt = datetime.fromtimestamp(int(expires_at) / 1000.0, tz=timezone.utc)
            except Exception:
                expires_dt = None

        record = self.set_user_entitlement(
            user_id=user_id,
            active=active,
            expires_at=expires_dt,
            source="google",
            raw=status,
        )
        return record