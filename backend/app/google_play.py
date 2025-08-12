from __future__ import annotations
from typing import Optional, Dict
import os

from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

from .settings import Settings


class GooglePlayNotConfigured(Exception):
    pass


class GooglePlayClient:
    def __init__(self, service) -> None:
        self._service = service

    @classmethod
    def from_env(cls, settings: Settings) -> "GooglePlayClient":
        creds_path = settings.google_application_credentials or os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
        if not creds_path or not os.path.isfile(creds_path):
            raise GooglePlayNotConfigured("GOOGLE_APPLICATION_CREDENTIALS not set or file missing")
        creds = service_account.Credentials.from_service_account_file(
            creds_path, scopes=[
                "https://www.googleapis.com/auth/androidpublisher",
            ]
        )
        service = build("androidpublisher", "v3", credentials=creds, cache_discovery=False)
        return cls(service)

    def verify_subscription(self, package_name: str, token: str) -> Dict:
        """Verify a subscription using SubscriptionsV2 API.

        Docs: purchases.subscriptionsv2.get
        """
        try:
            req = self._service.purchases().subscriptionsv2().get(
                packageName=package_name,
                token=token,
            )
            resp = req.execute()
            entitlement = resp.get("lineItems", [{}])[0].get("expiryTime", {})
            # SubscriptionsV2 returns RFC3339 in entitlement["expiryTime"] as seconds? Use raw fields as-is
            return {
                "raw": resp,
                "active": resp.get("subscriptionState") == "SUBSCRIPTION_STATE_ACTIVE",
                "expiry_time_millis": resp.get("latestOrderId", None) and resp.get("lineItems", [{}])[0].get("expiryTime", {}).get("millis", None),
            }
        except HttpError as e:
            return {"active": False, "error": str(e)}