from datetime import datetime, timezone

# Coins nhả mỗi giờ theo level — chỉ dùng khi cá no
_COINS_THEO_LEVEL = {1: 2, 2: 4, 3: 7, 4: 12, 5: 20}

# Tối đa tích lũy 4 giờ offline
_GIO_TOI_DA_TICH_LUY = 4

# Cá no trong vòng 45 phút kể từ lần cho ăn cuối
_HUNGER_MINUTES = 45


def tinh_coins_tu_ho(danh_sach_ca: list[dict], lan_thu_hoach_cuoi: str) -> int:
    """
    Tính coins tích lũy từ lần thu hoạch cuối đến bây giờ.
    Chỉ cá đã được cho ăn (còn no) mới nhả coins.
    Sứa gai luôn nhả coins.
    """
    try:
        ngay_cuoi = datetime.fromisoformat(lan_thu_hoach_cuoi.replace("Z", "+00:00"))
    except (ValueError, AttributeError):
        return 0

    now = datetime.now(timezone.utc)
    so_gio = min((now - ngay_cuoi).total_seconds() / 3600, _GIO_TOI_DA_TICH_LUY)
    hunger_sec = _HUNGER_MINUTES * 60

    tong_coins = 0
    for ca in danh_sach_ca:
        loai = ca.get("loai_ca", "")
        if loai != "sua_gai":
            fed_str = ca.get("lan_cho_an_cuoi")
            if not fed_str:
                continue
            try:
                fed_time = datetime.fromisoformat(fed_str.replace("Z", "+00:00"))
            except (ValueError, AttributeError):
                continue
            if (now - fed_time).total_seconds() > hunger_sec:
                continue
        level = ca.get("level", 1)
        tong_coins += _COINS_THEO_LEVEL.get(level, 2) * so_gio

    return int(tong_coins)


def coins_moi_gio_cua_ho(danh_sach_ca: list[dict]) -> int:
    """Hiển thị tốc độ coins/giờ cho người dùng biết."""
    return sum(
        _COINS_THEO_LEVEL.get(ca.get("level", 1), 2)
        for ca in danh_sach_ca
    )
