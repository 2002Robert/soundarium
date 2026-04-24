import random
from fastapi import APIRouter, Depends, HTTPException
from database import supabase_admin
from auth import lay_user_id
from models.tank import CapNhatTank

router = APIRouter(prefix="/api/tank", tags=["tank"])


@router.get("/cua-toi")
async def lay_tank_cua_toi(user_id: str = Depends(lay_user_id)):
    ket_qua = (
        supabase_admin.table("tanks")
        .select("*, fish(*)")
        .eq("user_id", user_id)
        .single()
        .execute()
    )
    if not ket_qua.data:
        raise HTTPException(status_code=404, detail="Không tìm thấy hồ cá")
    return {"tank": ket_qua.data}


@router.get("/xem/{username}")
async def xem_tank_cong_khai(username: str):
    """Xem hồ người khác — không cần đăng nhập."""
    profile = (
        supabase_admin.table("profiles")
        .select("id, username, tong_gio_nghe")
        .eq("username", username)
        .single()
        .execute()
    )
    if not profile.data:
        raise HTTPException(status_code=404, detail="Không tìm thấy người dùng này")

    tank = (
        supabase_admin.table("tanks")
        .select("*, fish(*)")
        .eq("user_id", profile.data["id"])
        .eq("la_cong_khai", True)
        .single()
        .execute()
    )
    if not tank.data:
        raise HTTPException(status_code=404, detail="Hồ này không công khai")

    return {
        "owner": profile.data,
        "tank": tank.data,
    }


@router.patch("/cap-nhat")
async def cap_nhat_tank(
    body: CapNhatTank,
    user_id: str = Depends(lay_user_id),
):
    cap_nhat = body.model_dump(exclude_none=True)
    if not cap_nhat:
        raise HTTPException(status_code=400, detail="Không có gì để cập nhật")

    ket_qua = (
        supabase_admin.table("tanks")
        .update(cap_nhat)
        .eq("user_id", user_id)
        .execute()
    )
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
