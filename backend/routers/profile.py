from fastapi import APIRouter, Depends, HTTPException
from database import supabase_admin
from auth import lay_user_id
from pydantic import BaseModel, field_validator
import re

router = APIRouter(prefix="/api/profile", tags=["profile"])


class CapNhatProfile(BaseModel):
    ten_hien_thi: str

    @field_validator("ten_hien_thi")
    @classmethod
    def kiem_tra_ten(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 2:
            raise ValueError("Tên phải có ít nhất 2 ký tự")
        if len(v) > 30:
            raise ValueError("Tên tối đa 30 ký tự")
        # Chỉ chữ cái, số, dấu gạch dưới và dấu chấm
        if not re.match(r"^[\w.]+$", v, re.UNICODE):
            raise ValueError("Tên chỉ được dùng chữ, số, dấu _ và .")
        return v


@router.get("/cua-toi")
async def lay_profile(user_id: str = Depends(lay_user_id)):
    ket_qua = (
        supabase_admin.table("profiles")
        .select("id, username, coins, tong_gio_nghe")
        .eq("id", user_id)
        .single()
        .execute()
    )
    if not ket_qua.data:
        raise HTTPException(status_code=404, detail="Không tìm thấy profile")
    return {"profile": ket_qua.data}


@router.patch("/cap-nhat-ten")
async def cap_nhat_ten_hien_thi(
    body: CapNhatProfile,
    user_id: str = Depends(lay_user_id),
):
    # Kiểm tra tên đã có người dùng chưa
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
        .update({"username": body.ten_hien_thi})
        .eq("id", user_id)
        .execute()
    )
    return {"profile": ket_qua.data[0]}
