import random
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from database import supabase_admin
from auth import lay_user_id
from models.tank import CapNhatTank

router = APIRouter(prefix="/api/tank", tags=["tank"])

MAX_TANKS = 3

# Coin cost và player_exp tối thiểu để tạo hồ thứ N (index = số hồ hiện tại)
_TANK_CHI_PHI      = [0, 0, 15, 25]
_PLAYER_EXP_NGUONG = [0, 0, 15, 60]


@router.get("/danh-sach")
async def lay_danh_sach_tank(user_id: str = Depends(lay_user_id)):
    """Danh sách tất cả hồ của user (không bao gồm cá)."""
    ket_qua = (
        supabase_admin.table("tanks")
        .select("*")
        .eq("user_id", user_id)
        .execute()
    )
    return {"tanks": ket_qua.data or []}


@router.get("/cua-toi")
async def lay_tank_cua_toi(user_id: str = Depends(lay_user_id)):
    """Lấy hồ mặc định (đầu tiên) kèm toàn bộ cá."""
    ket_qua = (
        supabase_admin.table("tanks")
        .select("*, fish(*)")
        .eq("user_id", user_id)
        .execute()
    )
    if not ket_qua.data:
        raise HTTPException(status_code=404, detail="Không tìm thấy hồ cá")
    return {"tank": ket_qua.data[0]}


@router.get("/theo-id/{tank_id}")
async def lay_tank_theo_id(tank_id: str, user_id: str = Depends(lay_user_id)):
    """Lấy hồ cụ thể theo ID (phải thuộc user)."""
    ket_qua = (
        supabase_admin.table("tanks")
        .select("*, fish(*)")
        .eq("id", tank_id)
        .eq("user_id", user_id)
        .execute()
    )
    if not ket_qua.data:
        raise HTTPException(status_code=404, detail="Không tìm thấy hồ cá")
    return {"tank": ket_qua.data[0]}


@router.post("/tao-moi")
async def tao_tank_moi(user_id: str = Depends(lay_user_id)):
    """Tạo hồ mới. Tối đa 3 hồ, cần player_exp và coins cho hồ 2-3."""
    existing = (
        supabase_admin.table("tanks")
        .select("id")
        .eq("user_id", user_id)
        .execute()
    )
    so_ho = len(existing.data or [])
    if so_ho >= MAX_TANKS:
        raise HTTPException(status_code=400, detail=f"Tối đa {MAX_TANKS} hồ")

    chi_phi   = _TANK_CHI_PHI[so_ho]   if so_ho < len(_TANK_CHI_PHI)      else 0
    exp_nguong = _PLAYER_EXP_NGUONG[so_ho] if so_ho < len(_PLAYER_EXP_NGUONG) else 0

    if chi_phi > 0 or exp_nguong > 0:
        profile = (
            supabase_admin.table("profiles")
            .select("coins, player_exp")
            .eq("id", user_id)
            .single()
            .execute()
        )
        if not profile.data:
            raise HTTPException(status_code=404, detail="Không tìm thấy profile")
        player_exp = profile.data.get("player_exp") or 0
        coins      = profile.data.get("coins") or 0
        if player_exp < exp_nguong:
            raise HTTPException(
                status_code=403,
                detail=f"Cần {exp_nguong} điểm kinh nghiệm (hiện tại {player_exp})"
            )
        if coins < chi_phi:
            raise HTTPException(
                status_code=402,
                detail=f"Không đủ coins (cần {chi_phi} 🪙)"
            )
        if chi_phi > 0:
            supabase_admin.table("profiles").update(
                {"coins": coins - chi_phi}
            ).eq("id", user_id).execute()

    tank_moi = (
        supabase_admin.table("tanks")
        .insert({
            "user_id": user_id,
            "ten": f"Hồ {so_ho + 1}",
            "la_cong_khai": False,
            "nen_ho": "ocean-shallow",
        })
        .execute()
    )
    return {"tank": tank_moi.data[0], "coins_tru": chi_phi}


@router.get("/xem/{username}")
async def xem_tank_cong_khai(username: str):
    """Xem hồ người khác — không cần đăng nhập."""
    profile_data = None

    # Thử tìm theo username
    ket_qua = (
        supabase_admin.table("profiles")
        .select("id, username, tong_gio_nghe")
        .eq("username", username)
        .execute()
    )
    if ket_qua.data:
        profile_data = ket_qua.data[0]

    # Fallback: tìm theo nickname
    if not profile_data:
        try:
            ket_qua2 = (
                supabase_admin.table("profiles")
                .select("id, username, tong_gio_nghe")
                .eq("nickname", username)
                .execute()
            )
            if ket_qua2.data:
                profile_data = ket_qua2.data[0]
        except Exception:
            pass

    if not profile_data:
        raise HTTPException(status_code=404, detail="Hồ này chưa công khai")

    tank = (
        supabase_admin.table("tanks")
        .select("*, fish(*), decorations(*)")
        .eq("user_id", profile_data["id"])
        .eq("la_cong_khai", True)
        .execute()
    )
    if not tank.data:
        raise HTTPException(status_code=404, detail="Hồ này chưa công khai")

    return {
        "owner": profile_data,
        "tank": tank.data[0],
    }


@router.patch("/cap-nhat")
async def cap_nhat_tank(
    body: CapNhatTank,
    user_id: str = Depends(lay_user_id),
    tank_id: Optional[str] = Query(None),
):
    cap_nhat = body.model_dump(exclude_none=True)
    if not cap_nhat:
        raise HTTPException(status_code=400, detail="Không có gì để cập nhật")

    query = supabase_admin.table("tanks").update(cap_nhat).eq("user_id", user_id)
    if tank_id:
        query = query.eq("id", tank_id)
    ket_qua = query.execute()

    if not ket_qua.data:
        raise HTTPException(status_code=404, detail="Không tìm thấy hồ cá")
    return {"tank": ket_qua.data[0]}


@router.get("/ngau-nhien")
async def lay_tank_ngau_nhien(user_id: str = Depends(lay_user_id)):
    """Khám phá hồ lạ — lấy ngẫu nhiên, bỏ qua hồ của chính mình."""
    ket_qua = (
        supabase_admin.table("tanks")
        .select("*, profiles(username, tong_gio_nghe), fish(*)")
        .eq("la_cong_khai", True)
        .neq("user_id", user_id)
        .execute()
    )

    danh_sach = ket_qua.data or []
    if not danh_sach:
        raise HTTPException(status_code=404, detail="Chưa có hồ nào để khám phá")

    return {"tank": random.choice(danh_sach)}
