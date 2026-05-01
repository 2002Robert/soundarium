from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from datetime import date, timedelta, datetime, timezone
from database import supabase_admin
from auth import lay_user_id

router = APIRouter(prefix="/api/analytics", tags=["analytics"])

ADMIN_USERNAME = "daorobert2002"


class SessionBody(BaseModel):
    session_id: str
    duration_seconds: int


@router.post("/bat-dau-session")
async def bat_dau_session(user_id: str = Depends(lay_user_id)):
    result = supabase_admin.table("analytics_sessions").insert({
        "user_id": user_id,
    }).execute()
    return {"session_id": result.data[0]["id"]}


@router.post("/cap-nhat-session")
async def cap_nhat_session(body: SessionBody, user_id: str = Depends(lay_user_id)):
    supabase_admin.table("analytics_sessions").update({
        "duration_seconds": body.duration_seconds,
    }).eq("id", body.session_id).eq("user_id", user_id).execute()
    return {"ok": True}


@router.post("/ket-thuc-session")
async def ket_thuc_session(body: SessionBody, user_id: str = Depends(lay_user_id)):
    supabase_admin.table("analytics_sessions").update({
        "session_end":      datetime.now(timezone.utc).isoformat(),
        "duration_seconds": body.duration_seconds,
    }).eq("id", body.session_id).eq("user_id", user_id).execute()
    return {"ok": True}


@router.get("/dashboard")
async def dashboard(user_id: str = Depends(lay_user_id)):
    profile = (
        supabase_admin.table("profiles")
        .select("username")
        .eq("id", user_id)
        .single()
        .execute()
    )
    if not profile.data or profile.data.get("username") != ADMIN_USERNAME:
        raise HTTPException(status_code=403, detail="Không có quyền truy cập")

    today     = date.today().isoformat()
    yesterday = (date.today() - timedelta(days=1)).isoformat()

    # Tổng user
    total_res = supabase_admin.table("profiles").select("id").execute()
    tong_user = len(total_res.data or [])

    # DAU hôm nay / hôm qua
    today_res     = supabase_admin.table("analytics_sessions").select("user_id").eq("ngay", today).execute()
    yesterday_res = supabase_admin.table("analytics_sessions").select("user_id").eq("ngay", yesterday).execute()
    today_users     = {s["user_id"] for s in (today_res.data or [])}
    yesterday_users = {s["user_id"] for s in (yesterday_res.data or [])}

    returning = today_users & yesterday_users
    dau_rate  = round(len(returning) / len(today_users) * 100, 1) if today_users else 0.0

    # Thời gian chơi
    dur_res   = supabase_admin.table("analytics_sessions").select("duration_seconds").gt("duration_seconds", 0).execute()
    durations = [s["duration_seconds"] for s in (dur_res.data or [])]
    avg_min   = round(sum(durations) / len(durations) / 60, 1) if durations else 0.0
    max_min   = round(max(durations) / 60, 1) if durations else 0.0

    # Feedback
    fb_res   = supabase_admin.table("user_feedback").select("liked").execute()
    likes    = sum(1 for f in (fb_res.data or []) if f["liked"] is True)
    dislikes = sum(1 for f in (fb_res.data or []) if f["liked"] is False)
    total_fb = likes + dislikes

    return {
        "tong_nguoi_dung":            tong_user,
        "nguoi_choi_hom_nay":         len(today_users),
        "nguoi_choi_hom_qua":         len(yesterday_users),
        "ti_le_quay_lai":             dau_rate,
        "thoi_gian_trung_binh_phut":  avg_min,
        "thoi_gian_lau_nhat_phut":    max_min,
        "so_like":                    likes,
        "so_dislike":                 dislikes,
        "ti_le_like":                 round(likes / total_fb * 100, 1) if total_fb > 0 else 0.0,
    }
