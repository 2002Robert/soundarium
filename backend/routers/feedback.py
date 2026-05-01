from fastapi import APIRouter, Depends
from pydantic import BaseModel
from datetime import datetime, timezone
from database import supabase_admin
from auth import lay_user_id

router = APIRouter(prefix="/api/feedback", tags=["feedback"])


class DanhGiaBody(BaseModel):
    liked: bool


@router.post("/danh-gia")
async def danh_gia(body: DanhGiaBody, user_id: str = Depends(lay_user_id)):
    supabase_admin.table("user_feedback").upsert(
        {
            "user_id":    user_id,
            "liked":      body.liked,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        },
        on_conflict="user_id",
    ).execute()
    return {"ok": True}


@router.get("/trang-thai")
async def trang_thai(user_id: str = Depends(lay_user_id)):
    result = (
        supabase_admin.table("user_feedback")
        .select("liked")
        .eq("user_id", user_id)
        .execute()
    )
    da_danh_gia = bool(result.data)
    return {
        "da_danh_gia": da_danh_gia,
        "liked": result.data[0]["liked"] if da_danh_gia else None,
    }
