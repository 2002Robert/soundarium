from fastapi import APIRouter, Depends, HTTPException, status
from database import lay_client_voi_token, supabase_admin
from auth import lay_user_id, lay_token
from models.fish import ThemCaMoi, ChinhSuaCa, CapNhatNghe, TestCapXP
from services.youtube import trich_video_id, lay_thong_tin_video
from services.fish_growth import (
    tinh_xp_tu_phut_nghe,
    kiem_tra_len_level,
    tao_ca_ngau_nhien,
)
from datetime import datetime, timezone

router = APIRouter(prefix="/api/fish", tags=["fish"])


async def _lay_tank_id_cua_user(user_id: str) -> str:
    """Lấy tank_id của user — mỗi user có đúng 1 tank."""
    ket_qua = (
        supabase_admin.table("tanks")
        .select("id")
        .eq("user_id", user_id)
        .single()
        .execute()
    )
    if not ket_qua.data:
        raise HTTPException(status_code=404, detail="Không tìm thấy hồ cá")
    return ket_qua.data["id"]


@router.post("/them-ca")
async def them_ca_moi(
    body: ThemCaMoi,
    user_id: str = Depends(lay_user_id),
    token: str = Depends(lay_token),
):
    video_id = trich_video_id(body.youtube_url)
    if not video_id:
        raise HTTPException(status_code=400, detail="Link YouTube không hợp lệ")

    tank_id = await _lay_tank_id_cua_user(user_id)

    # Kiểm tra cá với video này đã có trong hồ chưa
    trung_lap = (
        supabase_admin.table("fish")
        .select("id")
        .eq("tank_id", tank_id)
        .eq("video_id", video_id)
        .execute()
    )
    if trung_lap.data:
        raise HTTPException(status_code=409, detail="Bài nhạc này đã có trong hồ rồi")

    thong_tin = await lay_thong_tin_video(video_id)
    thuoc_tinh_ngau_nhien = tao_ca_ngau_nhien()

    # Dùng loài từ shop nếu có, ngược lại random
    if body.loai_ca:
        thuoc_tinh_ngau_nhien["loai_ca"] = body.loai_ca

    ca_moi = {
        "tank_id": tank_id,
        "youtube_url": body.youtube_url,
        "video_id": video_id,
        "ten_bai": thong_tin["ten_bai"],
        "ten_kenh": thong_tin["ten_kenh"],
        "nickname": body.nickname,
        **thuoc_tinh_ngau_nhien,
    }

    ket_qua = supabase_admin.table("fish").insert(ca_moi).execute()
    return {"ca": ket_qua.data[0], "da_len_level": False}


@router.get("/danh-sach")
async def lay_danh_sach_ca(user_id: str = Depends(lay_user_id)):
    tank_id = await _lay_tank_id_cua_user(user_id)
    ket_qua = (
        supabase_admin.table("fish")
        .select("*")
        .eq("tank_id", tank_id)
        .order("ngay_them")
        .execute()
    )
    return {"danh_sach_ca": ket_qua.data}


@router.patch("/chinh-sua/{ca_id}")
async def chinh_sua_ca(
    ca_id: str,
    body: ChinhSuaCa,
    user_id: str = Depends(lay_user_id),
):
    tank_id = await _lay_tank_id_cua_user(user_id)

    # Xác nhận cá này thuộc hồ của user
    ca = (
        supabase_admin.table("fish")
        .select("id, video_id, level, xp")
        .eq("id", ca_id)
        .eq("tank_id", tank_id)
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
            # Level và XP giữ nguyên khi đổi link — thiết kế có chủ đích
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
async def xoa_ca(ca_id: str, user_id: str = Depends(lay_user_id)):
    tank_id = await _lay_tank_id_cua_user(user_id)

    ca = (
        supabase_admin.table("fish")
        .select("id")
        .eq("id", ca_id)
        .eq("tank_id", tank_id)
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
):
    """Gọi mỗi 5 phút khi người dùng đang nghe để cộng XP và kiểm tra level up."""
    tank_id = await _lay_tank_id_cua_user(user_id)

    ca = (
        supabase_admin.table("fish")
        .select("id, level, xp")
        .eq("id", ca_id)
        .eq("tank_id", tank_id)
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

    # Cộng tổng giờ nghe vào profile để hiển thị thống kê
    supabase_admin.table("profiles").update({
        "tong_gio_nghe": supabase_admin.table("profiles")
            .select("tong_gio_nghe")
            .eq("id", user_id)
            .single()
            .execute()
            .data["tong_gio_nghe"] + body.so_phut / 60
    }).eq("id", user_id).execute()

    return {
        "level_moi": level_moi,
        "xp_moi": xp_sau_len,
        "da_len_level": da_len_level,
    }


@router.post("/test-cap-xp/{ca_id}")
async def test_cap_xp_thu_cong(
    ca_id: str,
    body: TestCapXP,
    user_id: str = Depends(lay_user_id),
):
    """
    Chỉ dùng để test — cộng XP tương đương số giờ nghe thủ công.
    Không để trong production build.
    """
    tank_id = await _lay_tank_id_cua_user(user_id)

    ca = (
        supabase_admin.table("fish")
        .select("id, level, xp")
        .eq("id", ca_id)
        .eq("tank_id", tank_id)
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
