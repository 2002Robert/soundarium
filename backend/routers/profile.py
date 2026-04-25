from fastapi import APIRouter, Depends, HTTPException
from database import supabase_admin
from auth import lay_user_id
from pydantic import BaseModel, field_validator
import re

router = APIRouter(prefix="/api/profile", tags=["profile"])

LOAI_CA_HOP_LE = {
    "ca_vang", "ca_neon", "ca_betta", "ca_clownfish",
    "ca_tang", "ca_koi", "ca_chep", "ca_dia",
}


class CapNhatTen(BaseModel):
    ten_hien_thi: str

    @field_validator("ten_hien_thi")
    @classmethod
    def kiem_tra_ten(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 3:
            raise ValueError("Tên phải có ít nhất 3 ký tự")
        if len(v) > 20:
            raise ValueError("Tên tối đa 20 ký tự")
        if not re.match(r"^[a-zA-Z0-9_]+$", v):
            raise ValueError("Chỉ dùng chữ cái, số và dấu _")
        return v


class CapNhatAvatar(BaseModel):
    loai_ca: str

    @field_validator("loai_ca")
    @classmethod
    def kiem_tra_loai(cls, v: str) -> str:
        if v not in LOAI_CA_HOP_LE:
            raise ValueError("Loài cá không hợp lệ")
        return v


@router.get("/cua-toi")
async def lay_profile(user_id: str = Depends(lay_user_id)):
    ket_qua = (
        supabase_admin.table("profiles")
        .select("*")
        .eq("id", user_id)
        .single()
        .execute()
    )
    if not ket_qua.data:
        raise HTTPException(status_code=404, detail="Không tìm thấy profile")
    return {"profile": ket_qua.data}


@router.patch("/cap-nhat-ten")
async def cap_nhat_ten(
    body: CapNhatTen,
    user_id: str = Depends(lay_user_id),
):
    profile_hien_tai = (
        supabase_admin.table("profiles")
        .select("da_doi_username")
        .eq("id", user_id)
        .single()
        .execute()
    )
    if not profile_hien_tai.data:
        raise HTTPException(status_code=404, detail="Không tìm thấy profile")

    if profile_hien_tai.data.get("da_doi_username"):
        raise HTTPException(status_code=403, detail="Bạn đã dùng lượt đổi username rồi")

    trung = (
        supabase_admin.table("profiles")
        .select("id")
        .eq("username", body.ten_hien_thi)
        .execute()
    )
    if trung.data and trung.data[0]["id"] != user_id:
        raise HTTPException(status_code=409, detail="Tên này đã có người dùng rồi")

    ket_qua = (
        supabase_admin.table("profiles")
        .update({"username": body.ten_hien_thi, "da_doi_username": True})
        .eq("id", user_id)
        .execute()
    )
    return {"profile": ket_qua.data[0]}


@router.patch("/cap-nhat-avatar")
async def cap_nhat_avatar(
    body: CapNhatAvatar,
    user_id: str = Depends(lay_user_id),
):
    ket_qua = (
        supabase_admin.table("profiles")
        .update({"avatar_loai_ca": body.loai_ca})
        .eq("id", user_id)
        .execute()
    )
    return {"profile": ket_qua.data[0]}


@router.post("/thu-ngoc")
async def thu_ngoc_trai(user_id: str = Depends(lay_user_id)):
    """Người dùng bắt sứa → nhận 1 ngọc trai."""
    profile = (
        supabase_admin.table("profiles")
        .select("ngoc_trai")
        .eq("id", user_id)
        .single()
        .execute()
    )
    if not profile.data:
        raise HTTPException(status_code=404, detail="Không tìm thấy profile")

    ngoc_moi = (profile.data.get("ngoc_trai") or 0) + 1
    supabase_admin.table("profiles").update(
        {"ngoc_trai": ngoc_moi}
    ).eq("id", user_id).execute()

    return {"ngoc_trai": ngoc_moi}
