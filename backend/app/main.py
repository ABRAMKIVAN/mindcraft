from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

from .settings import get_settings
from .entitlements import EntitlementsService


app = FastAPI(title="VPN Backend", version="0.1.0")
settings = get_settings()
service = EntitlementsService(settings=settings)


class VerifyRequest(BaseModel):
    platform: str  # "google" (others in future)
    package_name: str
    product_id: str
    purchase_token: str
    user_id: str


@app.get("/health")
def health():
    return {
        "ok": True,
        "time": datetime.utcnow().isoformat() + "Z",
        "version": app.version,
    }


@app.post("/entitlements/verify")
def verify(req: VerifyRequest):
    if req.platform != "google":
        raise HTTPException(status_code=400, detail="Unsupported platform")

    result = service.verify_google_purchase(
        package_name=req.package_name,
        product_id=req.product_id,
        purchase_token=req.purchase_token,
        user_id=req.user_id,
    )
    return result


@app.get("/entitlements/{user_id}")
def get_entitlement(user_id: str):
    ent = service.get_user_entitlement(user_id)
    if not ent:
        raise HTTPException(status_code=404, detail="Entitlement not found")
    return ent