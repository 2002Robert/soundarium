from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import Optional
from database import lay_client_voi_token, supabase_admin
from auth import lay_user_id, lay_token
from models.fish import ThemCaMoi, ChinhSuaCa, CapNhatNghe, TestCapXP
from services.youtube import trich_video_id, lay_thong_tin_video
from services.fish_growth import (
    tinh_xp_tu_phut_nghe,
    kiem_tra_len_level,
    tao_ca_ngau_nhien,
    GIA_CA,
)
from datetime import datetime, timezone

router = APIRouter(prefix="/api/fish", tags=["fish"])

COINS_KHI_CHO_AN = 3  # coins thưởng mỗi lần cho ăn

_NGUONG_LEVEL = [0, 2, 8, 25, 75, 200, 500]
_LEVEL_SUA_GAI = 3


def _tinh_level_nguoi_choi(gio_nghe: float) -> int:
    level = 1
    for i, nguong in enumerate(_NGUONG_LEVEL):
        if gio_nghe >= nguong:
            level = i + 1
    return level


async def _lay_tank_id_cua_user(user_id: str, tank_id: Optional[str] = None) -> str:
    """Lấy tank_id của user. Nếu tank_id được chỉ định, xác thực nó thuộc user."""
    if tank_id:
        ket_qua = (
            supabase_admin.table("tanks")
            .select("id")
            .eq("id", tank_id)
            .eq("user_id", user_id)
            .execute()
        )
        data = ket_qua.data[0] if ket_qua.data else None
    else:
        ket_qua = (
            supabase_admin.table("tanks")
            .select("id")
            .eq("user_id", user_id)
            .limit(1)
            .execute()
        )
        data = ket_qua.data[0] if ket_qua.data else None

    if not data:
        raise HTTPException(status_code=404, detail="Không tìm thấy hồ cá")
    return data["id"]


@router.post("/them-ca")
async def them_ca_moi(
    body: ThemCaMoi,
    user_id: str = Depends(lay_user_id),
    token: str = Depends(lay_token),
    tank_id: Optional[str] = Query(None),
):
    video_id = trich_video_id(body.youtube_url)
    if not video_id:
        raise HTTPException(status_code=400, detail="Link YouTube không hợp lệ")

    tid = await _lay_tank_id_cua_user(user_id, tank_id)

    trung_lap = (
        supabase_admin.table("fish")
        .select("id")
        .eq("tank_id", tid)
        .eq("video_id", video_id)
        .execute()
    )
    if trung_lap.data:
        raise HTTPException(status_code=409, detail="Bài nhạc này đã có trong hồ rồi")

    # Kiểm tra giá và coins
    loai_ca = body.loai_ca if body.loai_ca in GIA_CA else None
    gia = GIA_CA.get(loai_ca, 0) if loai_ca else 0

    coins_hien_co = 0
    if gia > 0:
        fields = "coins,tong_gio_nghe" if loai_ca == "sua_gai" else "coins"
        profile = (
            supabase_admin.table("profiles")
            .select(fields)
            .eq("id", user_id)
            .single()
            .execute()
        )
        if not profile.data:
            raise HTTPException(status_code=404, detail="Không tìm thấy profile")

        if loai_ca == "sua_gai":
            level = _tinh_level_nguoi_choi(profile.data.get("tong_gio_nghe") or 0)
            if level < _LEVEL_SUA_GAI:
                raise HTTPException(
                    status_code=403,
                    detail=f"Cần Lv.{_LEVEL_SUA_GAI} để mua Sứa (hiện tại Lv.{level})"
                )

        coins_hien_co = profile.data.get("coins", 0)
        if coins_hien_co < gia:
            raise HTTPException(status_code=402, detail=f"Không đủ coins (cần {gia})")

    thong_tin = await lay_thong_tin_video(video_id)
    thuoc_tinh = tao_ca_ngau_nhien(loai_ca)

    ca_moi = {
        "tank_id": tid,
        "youtube_url": body.youtube_url,
        "video_id": video_id,
        "ten_bai": thong_tin["ten_bai"],
        "ten_kenh": thong_tin["ten_kenh"],
        "nickname": body.nickname,
        **thuoc_tinh,
    }

    ket_qua = supabase_admin.table("fish").insert(ca_moi).execute()

    coins_con_lai = None
    if gia > 0:
        coins_con_lai = coins_hien_co - gia
        supabase_admin.table("profiles").update(
            {"coins": coins_con_lai}
        ).eq("id", user_id).execute()

    return {"ca": ket_qua.data[0], "da_len_level": False, "coins_con_lai": coins_con_lai}


@router.get("/danh-sach")
async def lay_danh_sach_ca(
    user_id: str = Depends(lay_user_id),
    tank_id: Optional[str] = Query(None),
):
    tid = await _lay_tank_id_cua_user(user_id, tank_id)
    ket_qua = (
        supabase_admin.table("fish")
        .select("*")
        .eq("tank_id", tid)
        .order("ngay_them")
        .execute()
    )
    return {"danh_sach_ca": ket_qua.data}


@router.patch("/chinh-sua/{ca_id}")
async def chinh_sua_ca(
    ca_id: str,
    body: ChinhSuaCa,
    user_id: str = Depends(lay_user_id),
    tank_id: Optional[str] = Query(None),
):
    tid = await _lay_tank_id_cua_user(user_id, tank_id)

    ca = (
        supabase_admin.table("fish")
        .select("id, video_id, level, xp")
        .eq("id", ca_id)
        .eq("tank_id", tid)
        .single()
        .execute()
    )
    if not ca.data:
        raise HTTPException(status_code=404, detail="Không tìm thấy con cá này")

    cap_nhat: dict = {}
    if body.nickname is not None:
        cap_nhat["nickname"] = body.nickname

    if body.youtube_url is not None:
        video_id_moi = trich_video_id(body.youtube_url)
        if not video_id_moi:
            raise HTTPException(status_code=400, detail="Link YouTube không hợp lệ")
        thong_tin = await lay_thong_tin_video(video_id_moi)
        cap_nhat.update({
            "youtube_url": body.youtube_url,
            "video_id": video_id_moi,
            "ten_bai": thong_tin["ten_bai"],
            "ten_kenh": thong_tin["ten_kenh"],
        })

    if not cap_nhat:
        raise HTTPException(status_code=400, detail="Không có gì để cập nhật")

    ket_qua = (
        supabase_admin.table("fish")
        .update(cap_nhat)
        .eq("id", ca_id)
        .execute()
    )
    return {"ca": ket_qua.data[0]}


@router.delete("/xoa/{ca_id}")
async def xoa_ca(
    ca_id: str,
    user_id: str = Depends(lay_user_id),
    tank_id: Optional[str] = Query(None),
):
    tid = await _lay_tank_id_cua_user(user_id, tank_id)

    ca = (
        supabase_admin.table("fish")
        .select("id")
        .eq("id", ca_id)
        .eq("tank_id", tid)
        .single()
        .execute()
    )
    if not ca.data:
        raise HTTPException(status_code=404, detail="Không tìm thấy con cá này")

    supabase_admin.table("fish").delete().eq("id", ca_id).execute()
    return {"thanh_cong": True}


@router.post("/cap-nhat-nghe/{ca_id}")
async def cap_nhat_thoi_gian_nghe(
    ca_id: str,
    body: CapNhatNghe,
    user_id: str = Depends(lay_user_id),
    tank_id: Optional[str] = Query(None),
):
    """Gọi mỗi 5 phút khi người dùng đang nghe để cộng XP và kiểm tra level up."""
    tid = await _lay_tank_id_cua_user(user_id, tank_id)

    ca = (
        supabase_admin.table("fish")
        .select("id, level, xp")
        .eq("id", ca_id)
        .eq("tank_id", tid)
        .single()
        .execute()
    )
    if not ca.data:
        raise HTTPException(status_code=404, detail="Không tìm thấy con cá này")

    xp_them = tinh_xp_tu_phut_nghe(body.so_phut, ca.data["level"])
    xp_moi = ca.data["xp"] + xp_them
    level_moi, xp_sau_len = kiem_tra_len_level(xp_moi, ca.data["level"])
    da_len_level = level_moi > ca.data["level"]

    supabase_admin.table("fish").update({
        "xp": xp_sau_len,
        "level": level_moi,
        "lan_nghe_cuoi": datetime.now(timezone.utc).isoformat(),
    }).eq("id", ca_id).execute()

    profile = (
        supabase_admin.table("profiles")
        .select("tong_gio_nghe")
        .eq("id", user_id)
        .single()
        .execute()
    )
    if profile.data:
        supabase_admin.table("profiles").update({
            "tong_gio_nghe": (profile.data.get("tong_gio_nghe") or 0) + body.so_phut / 60
        }).eq("id", user_id).execute()

    return {
        "level_moi": level_moi,
        "xp_moi": xp_sau_len,
        "da_len_level": da_len_level,
    }


@router.post("/cho-an/{ca_id}")
async def cho_ca_an(
    ca_id: str,
    user_id: str = Depends(lay_user_id),
    tank_id: Optional[str] = Query(None),
):
    """
    Cho cá ăn: +1 XP cá, +3 coins người dùng.
    Frontend tự quản lý cooldown 15 phút qua localStorage.
    """
    tid = await _lay_tank_id_cua_user(user_id, tank_id)

    ca = (
        supabase_admin.table("fish")
        .select("id, level, xp")
        .eq("id", ca_id)
        .eq("tank_id", tid)
        .single()
        .execute()
    )
    if not ca.data:
        raise HTTPException(status_code=404, detail="Không tìm thấy con cá này")

    xp_moi = ca.data["xp"] + 1
    level_moi, xp_sau_len = kiem_tra_len_level(xp_moi, ca.data["level"])
    da_len_level = level_moi > ca.data["level"]

    supabase_admin.table("fish").update({
        "xp": xp_sau_len,
        "level": level_moi,
    }).eq("id", ca_id).execute()

    # +3 coins và +1/60 giờ nghe
    profile = (
        supabase_admin.table("profiles")
        .select("tong_gio_nghe, coins")
        .eq("id", user_id)
        .single()
        .execute()
    )
    coins_moi = profile.data.get("coins", 0) if profile.data else 0
    if profile.data:
        supabase_admin.table("profiles").update({
            "tong_gio_nghe": (profile.data.get("tong_gio_nghe") or 0) + 1 / 60,
            "coins": coins_moi + COINS_KHI_CHO_AN,
        }).eq("id", user_id).execute()

    return {
        "ca": {**ca.data, "xp": xp_sau_len, "level": level_moi},
        "da_len_level": da_len_level,
        "coins_nhan": COINS_KHI_CHO_AN,
        "coins_hien_tai": coins_moi + COINS_KHI_CHO_AN,
    }


@router.post("/test-cap-xp/{ca_id}")
async def test_cap_xp_thu_cong(
    ca_id: str,
    body: TestCapXP,
    user_id: str = Depends(lay_user_id),
):
    tid = await _lay_tank_id_cua_user(user_id)

    ca = (
        supabase_admin.table("fish")
        .select("id, level, xp")
        .eq("id", ca_id)
        .eq("tank_id", tid)
        .single()
        .execute()
    )
    if not ca.data:
        raise HTTPException(status_code=404, detail="Không tìm thấy con cá này")

    xp_them = tinh_xp_tu_phut_nghe(body.so_gio * 60, ca.data["level"])
    xp_moi = ca.data["xp"] + xp_them
    level_moi, xp_sau_len = kiem_tra_len_level(xp_moi, ca.data["level"])

    supabase_admin.table("fish").update({
        "xp": xp_sau_len,
        "level": level_moi,
        "lan_nghe_cuoi": datetime.now(timezone.utc).isoformat(),
    }).eq("id", ca_id).execute()

    return {
        "xp_them": xp_them,
        "level_moi": level_moi,
        "xp_moi": xp_sau_len,
        "da_len_level": level_moi > ca.data["level"],
    }
