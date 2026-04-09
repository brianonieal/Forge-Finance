import base64
import hashlib
import hmac
import os
import struct
import time

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.core.auth import get_current_user_id

router = APIRouter(prefix="/api/settings", tags=["settings"])

# In-memory 2FA state for MVP (production would use DB)
_2fa_secrets: dict[str, str] = {}
_2fa_enabled: dict[str, bool] = {}


def _generate_secret(length: int = 20) -> str:
    """Generate a base32-encoded TOTP secret."""
    random_bytes = os.urandom(length)
    return base64.b32encode(random_bytes).decode("utf-8").rstrip("=")


def _compute_totp(secret: str, time_step: int = 30) -> str:
    """Compute a 6-digit TOTP code from a base32 secret."""
    key = base64.b32decode(secret.upper() + "=" * (-len(secret) % 8))
    counter = struct.pack(">Q", int(time.time()) // time_step)
    mac = hmac.new(key, counter, hashlib.sha1).digest()
    offset = mac[-1] & 0x0F
    code = struct.unpack(">I", mac[offset:offset + 4])[0] & 0x7FFFFFFF
    return str(code % 10**6).zfill(6)


class TwoFactorVerifyRequest(BaseModel):
    code: str


class BetaAccessRequest(BaseModel):
    code: str


@router.get("/profile")
async def get_profile(user_id: str = Depends(get_current_user_id)):
    return {"user_id": user_id, "message": "Profile endpoint — DB integration at v0.3.0+"}


@router.patch("/profile")
async def update_profile(user_id: str = Depends(get_current_user_id)):
    return {"user_id": user_id, "message": "Profile updated"}


@router.get("/preferences")
async def get_preferences(user_id: str = Depends(get_current_user_id)):
    return {
        "currency": "USD",
        "number_format": "1,234.56",
        "date_format": "MM/DD/YYYY",
        "default_period": "1M",
    }


@router.patch("/preferences")
async def update_preferences(user_id: str = Depends(get_current_user_id)):
    return {"message": "Preferences updated"}


@router.get("/notifications")
async def get_notifications(user_id: str = Depends(get_current_user_id)):
    return {
        "budget_alerts": True,
        "goal_alerts": True,
        "sync_errors": True,
        "ai_insights": True,
        "weekly_digest": False,
        "digest_day": "Monday",
    }


@router.patch("/notifications")
async def update_notifications(user_id: str = Depends(get_current_user_id)):
    return {"message": "Notification preferences updated"}


@router.get("/sessions")
async def get_sessions(user_id: str = Depends(get_current_user_id)):
    return {"sessions": [{"device": "Current session", "active": True}]}


@router.get("/connected-apps")
async def get_connected_apps(user_id: str = Depends(get_current_user_id)):
    return {"connected_apps": []}


# --- 2FA Endpoints ---

@router.get("/2fa/status")
async def get_2fa_status(user_id: str = Depends(get_current_user_id)):
    """Check if 2FA is enabled for this user."""
    return {"enabled": _2fa_enabled.get(user_id, False)}


@router.post("/2fa/setup")
async def setup_2fa(user_id: str = Depends(get_current_user_id)):
    """Generate a TOTP secret and return the provisioning URI."""
    secret = _generate_secret()
    _2fa_secrets[user_id] = secret
    otpauth_uri = f"otpauth://totp/Forge%20Finance?secret={secret}&issuer=Forge%20Finance"
    return {"secret": secret, "otpauth_uri": otpauth_uri}


@router.post("/2fa/verify")
async def verify_2fa(
    body: TwoFactorVerifyRequest,
    user_id: str = Depends(get_current_user_id),
):
    """Verify a TOTP code to enable 2FA."""
    secret = _2fa_secrets.get(user_id)
    if not secret:
        raise HTTPException(status_code=400, detail="No 2FA setup in progress. Call /2fa/setup first.")
    expected = _compute_totp(secret)
    if body.code != expected:
        raise HTTPException(status_code=400, detail="Invalid code. Please try again.")
    _2fa_enabled[user_id] = True
    return {"status": "2fa_enabled"}


@router.delete("/2fa")
async def disable_2fa(user_id: str = Depends(get_current_user_id)):
    """Disable 2FA for this user."""
    _2fa_enabled.pop(user_id, None)
    _2fa_secrets.pop(user_id, None)
    return {"status": "2fa_disabled"}


# --- Beta Access ---

BETA_ACCESS_CODES = {"FORGE2026", "BETAFORGE", "EARLYACCESS"}


@router.post("/beta-access")
async def verify_beta_access(body: BetaAccessRequest):
    """Verify a beta access code."""
    if body.code.upper() in BETA_ACCESS_CODES:
        return {"valid": True, "message": "Welcome to the beta!"}
    raise HTTPException(status_code=403, detail="Invalid beta access code.")
