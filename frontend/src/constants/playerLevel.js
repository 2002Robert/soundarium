// Giờ nghe tích lũy để lên level người chơi
const NGUONG = [0, 2, 8, 25, 75, 200, 500]

export const TIEU_DE_LEVEL = [
  '', 'Cá mới', 'Ngư dân', 'Thủy thủ', 'Thuyền trưởng', 'Hải dương học', 'Đại dương chủ', 'Thần biển',
]

export function tinhLevelNguoiChoi(gioNghe = 0) {
  let lv = 1
  for (let i = 1; i < NGUONG.length; i++) {
    if (gioNghe >= NGUONG[i]) lv = i + 1
    else break
  }
  return lv
}

export function tinhPhanTramTienLevel(gioNghe = 0, level) {
  if (level >= NGUONG.length) return 100
  const low  = NGUONG[level - 1]
  const high = NGUONG[level]
  return Math.min(100, Math.round(((gioNghe - low) / (high - low)) * 100))
}
