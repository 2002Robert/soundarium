import random
from datetime import datetime, timezone

# XP cần để lên từng level — cộng dồn
_XP_THEO_LEVEL = {1: 0, 2: 60, 3: 180, 4: 420, 5: 900}
_LEVEL_TOI_DA = 5

# Kích thước render (px) theo level
KICH_THUOC_THEO_LEVEL = {1: 40, 2: 52, 3: 64, 4: 72, 5: 80}

# Danh sách loài và màu để random khi tạo cá mới
LOAI_CA = [
    "ca_vang", "ca_neon", "ca_betta", "ca_clownfish",
    "ca_tang", "ca_angel", "ca_guppy", "ca_tetra",
]
MAU_CA = [
    "#ff6b6b", "#ffd93d", "#6bcb77", "#4d96ff",
    "#ff922b", "#cc5de8", "#20c997", "#f06595",
]


def tinh_xp_tu_phut_nghe(so_phut: float, level_hien_tai: int) -> float:
    """
    Cá level cao hơn cần nhiều thời gian hơn để cảm thấy 'được nghe',
    nhưng nhận XP nhiều hơn mỗi phút để bù lại.
    """
    he_so = 1.0 + (level_hien_tai - 1) * 0.2
    return so_phut * he_so


def kiem_tra_len_level(xp_moi: float, level_cu: int) -> tuple[int, float]:
    """Trả về (level mới, XP còn lại sau khi lên level)."""
    level = level_cu
    xp = xp_moi

    while level < _LEVEL_TOI_DA:
        nguong_ke_tiep = _XP_THEO_LEVEL[level + 1]
        if xp >= nguong_ke_tiep:
            level += 1
        else:
            break

    return level, xp


def tinh_do_mo(lan_nghe_cuoi: str) -> float:
    """
    Cá bị bỏ quên > 7 ngày bắt đầu mờ dần.
    Mờ hoàn toàn (opacity 0.2) sau 30 ngày không nghe.
    """
    try:
        ngay_cuoi = datetime.fromisoformat(lan_nghe_cuoi.replace("Z", "+00:00"))
    except (ValueError, AttributeError):
        return 1.0

    so_ngay = (datetime.now(timezone.utc) - ngay_cuoi).days

    if so_ngay <= 7:
        return 1.0
    if so_ngay >= 30:
        return 0.2

    # Linear từ 1.0 → 0.2 trong khoảng 7–30 ngày
    return 1.0 - (so_ngay - 7) / 23 * 0.8


def tao_ca_ngau_nhien() -> dict:
    """Random loài và màu khi người dùng thêm cá mới."""
    return {
        "loai_ca": random.choice(LOAI_CA),
        "mau_ca": random.choice(MAU_CA),
        "vi_tri_x": round(random.uniform(0.1, 0.9), 2),
        "vi_tri_y": round(random.uniform(0.2, 0.8), 2),
    }
