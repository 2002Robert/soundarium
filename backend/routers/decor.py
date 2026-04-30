"""
Decoration placement system.

Supabase SQL (run once in dashboard):
  CREATE TABLE decorations (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     TEXT NOT NULL,
    tank_id     TEXT NOT NULL,
    loai        TEXT NOT NULL,
    pos_x       FLOAT NOT NULL DEFAULT 0.5,
    pos_y       FLOAT NOT NULL DEFAULT 0.85,
    layer       INT   NOT NULL DEFAULT 1,
    an          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ DEFAULT NOW()
  );
  CREATE INDEX idx_decorations_user_tank ON decorations(user_id, tank_id);
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
from pydantic import BaseModel
from database import supabase_admin
from auth import lay_user_id

router = APIRouter(prefix="/api/decor", tags=["decor"])

GIA_TRANG_TRI = {
    "rong_bien":  50,
    "san_ho_cay": 80,
    "da_cuoi":    30,
    "kho_bau":    200,
    "vo_oc":      40,
    "hai_quy":    120,
}


class MuaBody(BaseModel):
    loai: str
    tank_id: Optional[str] = None


class CapNhatBody(BaseModel):
    pos_x: Optional[float] = None
    pos_y: Optional[float] = None
    layer: Optional[int] = None
    an: Optional[bool] = None


async def _lay_tank(user_id: str, tank_id: Optional[str]) -> str:
    q = supabase_admin.table("tanks").select("id").eq("user_id", user_id)
    if tank_id:
        q = q.eq("id", tank_id)
    res = q.order("created_at").execute()
    if not res.data:
        raise HTTPException(404, "Không tìm thấy hồ")
    return res.data[0]["id"]


@router.get("/danh-sach")
async def lay_danh_sach(
    tank_id: Optional[str] = Query(None),
    user_id: str = Depends(lay_user_id),
):
    tid = await _lay_tank(user_id, tank_id)
    res = (
        supabase_admin.table("decorations")
        .select("*")
        .eq("user_id", user_id)
        .eq("tank_id", tid)
        .order("created_at")
        .execute()
    )
    return {"danh_sach": res.data or []}


@router.post("/mua")
async def mua_trang_tri(
    body: MuaBody,
    user_id: str = Depends(lay_user_id),
):
    if body.loai not in GIA_TRANG_TRI:
        raise HTTPException(400, f"Loại trang trí không hợp lệ: {body.loai}")
    gia = GIA_TRANG_TRI[body.loai]
    tid = await _lay_tank(user_id, body.tank_id)

    profile = (
        supabase_admin.table("profiles")
        .select("coins")
        .eq("id", user_id)
        .single()
        .execute()
    )
    coins = (profile.data or {}).get("coins", 0)
    if coins < gia:
        raise HTTPException(402, f"Không đủ coins (cần {gia}, có {coins})")

    decor = {
        "user_id": user_id,
        "tank_id": tid,
        "loai":    body.loai,
        "pos_x":   0.5,
        "pos_y":   0.85,
        "layer":   1,
        "an":      True,
    }
    result = supabase_admin.table("decorations").insert(decor).execute()
    coins_con_lai = coins - gia
    supabase_admin.table("profiles").update({"coins": coins_con_lai}).eq("id", user_id).execute()
    return {"decor": result.data[0], "coins_con_lai": coins_con_lai}


@router.patch("/{decor_id}")
async def cap_nhat(
    decor_id: str,
    body: CapNhatBody,
    user_id: str = Depends(lay_user_id),
):
    existing = (
        supabase_admin.table("decorations")
        .select("id")
        .eq("id", decor_id)
        .eq("user_id", user_id)
        .execute()
    )
    if not existing.data:
        raise HTTPException(404, "Không tìm thấy trang trí")

    updates = {}
    if body.pos_x is not None: updates["pos_x"] = max(0.01, min(0.99, body.pos_x))
    if body.pos_y is not None: updates["pos_y"] = max(0.05, min(0.97, body.pos_y))
    if body.layer is not None: updates["layer"] = max(1, min(3, body.layer))
    if body.an    is not None: updates["an"]    = body.an

    if not updates:
        return {"ok": True}

    result = supabase_admin.table("decorations").update(updates).eq("id", decor_id).execute()
    return {"decor": result.data[0] if result.data else None}


@router.delete("/{decor_id}")
async def xoa(
    decor_id: str,
    user_id: str = Depends(lay_user_id),
):
    existing = (
        supabase_admin.table("decorations")
        .select("id")
        .eq("id", decor_id)
        .eq("user_id", user_id)
        .execute()
    )
    if not existing.data:
        raise HTTPException(404, "Không tìm thấy trang trí")
    supabase_admin.table("decorations").delete().eq("id", decor_id).execute()
    return {"ok": True}
