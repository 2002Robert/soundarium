from datetime import datetime, timezone

# Coins nhả mỗi giờ theo level trung bình của hồ
_COINS_THEO_LEVEL = {1: 2, 2: 4, 3: 7, 4: 12, 5: 20}

# Tối đa tích lũy 72 giờ (3 ngày) không vào app
_GIO_TOI_DA_TICH_LUY = 72


def tinh_coins_tu_ho(danh_sach_ca: list[dict], lan_thu_hoach_cuoi: str) -> int:
    """
    Tính coins tích lũy từ lần thu hoạch cuối đến bây giờ.
    Mỗi con cá nhả coins theo level của nó, tính theo giờ.
    """
    try:
        ngay_cuoi = datetime.fromisoformat(lan_thu_hoach_cuoi.replace("Z", "+00:00"))
    except (ValueError, AttributeError):
        return 0

    so_gio = (datetime.now(timezone.utc) - ngay_cuoi).total_seconds() / 3600
    # Giới hạn không để tích quá nhiều khi người dùng biến mất lâu
    so_gio = min(so_gio, _GIO_TOI_DA_TICH_LUY)

    tong_coins = 0
    for ca in danh_sach_ca:
        level = ca.get("level", 1)
        coins_moi_gio = _COINS_THEO_LEVEL.get(level, 2)
        tong_coins += coins_moi_gio * so_gio

    return int(tong_coins)


def coins_moi_gio_cua_ho(danh_sach_ca: list[dict]) -> int:
    """Hiển thị tốc độ coins/giờ cho người dùng biết."""
    return sum(
        _COINS_THEO_LEVEL.get(ca.get("level", 1), 2)
        for ca in danh_sach_ca
    )
