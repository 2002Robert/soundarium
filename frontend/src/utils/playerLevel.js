// Nguồn thật duy nhất cho hệ thống level — import từ đây, KHÔNG dùng constants/playerLevel.js trực tiếp
export const NGUONG = [0, 10, 30, 65, 120, 200, 320, 500]

export const TIEU_DE_LEVEL = [
  '', 'Cá mới', 'Ngư dân', 'Thủy thủ', 'Thuyền trưởng',
  'Hải dương học', 'Đại dương chủ', 'Thần biển',
]

export function tinhLevel(player_exp = 0) {
  for (let i = NGUONG.length - 1; i >= 0; i--) {
    if (player_exp >= NGUONG[i]) return i + 1
  }
  return 1
}

// Trả về tiến độ EXP trong level hiện tại
export function expDenLevelTiep(player_exp = 0) {
  const lv       = tinhLevel(player_exp)
  const expStart = NGUONG[lv - 1] ?? 0
  const expEnd   = NGUONG[lv]                          // undefined nếu max level
  if (expEnd == null) return { hienTai: 0, canCo: 0 } // đã max
  return { hienTai: player_exp - expStart, canCo: expEnd - expStart }
}
