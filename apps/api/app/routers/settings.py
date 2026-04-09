from fastapi import APIRouter, Depends

from app.core.auth import get_current_user_id

router = APIRouter(prefix="/api/settings", tags=["settings"])


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
