from fastapi import APIRouter, Depends, HTTPException
from database import supabase_admin
from auth import lay_user_id
from services.coin_engine import tinh_coins_tu_ho, coins_moi_gio_cua_ho
from datetime import datetime, timezone

router = APIRouter(prefix="/api/coins", tags=["coins"])


@router.get("/thu-hoach")
async def thu_hoach_coins(user_id: str = Depends(lay_user_id)):
    """
    Gọi khi người dùng mở app — cộng coins tích lũy từ lần trước.
    Sau đó reset thời điểm thu hoạch về bây giờ.
    """
    profile = (
        supabase_admin.table("profiles")
        .select("coins, lan_thu_hoach_cuoi")
        .eq("id", user_id)
        .single()
        .execute()
    )
    if not profile.data:
        raise HTTPException(status_code=404, detail="Không tìm thấy profile")

    # Lấy danh sách cá để tính tốc độ nhả coins
    tank = (
        supabase_admin.table("tanks")
        .select("id")
        .eq("user_id", user_id)
        .single()
        .execute()
    )
    danh_sach_ca = []
    if tank.data:
        ca_res = (
            supabase_admin.table("fish")
            .select("level")
            .eq("tank_id", tank.data["id"])
            .execute()
        )
        danh_sach_ca = ca_res.data or []

    coins_moi = tinh_coins_tu_ho(
        danh_sach_ca,
        profile.data["lan_thu_hoach_cuoi"],
    )

    coins_hien_tai = profile.data["coins"] + coins_moi
    supabase_admin.table("profiles").update({
        "coins": coins_hien_tai,
        "lan_thu_hoach_cuoi": datetime.now(timezone.utc).isoformat(),
    }).eq("id", user_id).execute()

    return {
        "coins_nhan_duoc": coins_moi,
        "coins_hien_tai": coins_hien_tai,
        "toc_do_moi_gio": coins_moi_gio_cua_ho(danh_sach_ca),
    }


@router.get("/so-du")
async def xem_so_du_coins(user_id: str = Depends(lay_user_id)):
    profile = (
        supabase_admin.table("profiles")
        .select("coins")
        .eq("id", user_id)
        .single()
        .execute()
    )
    if not profile.data:
        raise HTTPException(status_code=404, detail="Không tìm thấy profile")
    return {"coins": profile.data["coins"]}


@router.post("/mua-item/{item_id}")
async def mua_item(item_id: str, user_id: str = Depends(lay_user_id)):
    """
    Mua item trong cửa hàng bằng coins.
    TODO STRIPE: Thêm xử lý thanh toán thật ở đây khi cần premium items.
    """
    item = (
        supabase_admin.table("shop_items")
        .select("*")
        .eq("id", item_id)
        .eq("la_active", True)
        .single()
        .execute()
    )
    if not item.data:
        raise HTTPException(status_code=404, detail="Item không tồn tại")

    gia = item.data.get("gia_coins") or 0

    profile = (
        supabase_admin.table("profiles")
        .select("coins")
        .eq("id", user_id)
        .single()
        .execute()
    )
    coins_hien_co = profile.data["coins"]

    if coins_hien_co < gia:
        raise HTTPException(status_code=402, detail="Không đủ coins")

    # Trừ coins
    supabase_admin.table("profiles").update({
        "coins": coins_hien_co - gia,
    }).eq("id", user_id).execute()

    # Ghi transaction
    supabase_admin.table("transactions").insert({
        "user_id": user_id,
        "item_id": item_id,
        "so_tien": gia,
        "don_vi": "coins",
        "trang_thai": "completed",
    }).execute()

    return {
        "thanh_cong": True,
        "item": item.data,
        "coins_con_lai": coins_hien_co - gia,
    }
