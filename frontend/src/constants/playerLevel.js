// EXP-based player level system
// Per-level cost: 10, 20, 35, 55, 80, 110, 145, 185, 230 (delta of deltas = +5)
// Cumulative EXP thresholds to reach each level (index = level - 1):
export const EXP_NGUONG = [0, 10, 30, 65, 120, 200, 310, 455, 640, 870]

export const TIEU_DE_LEVEL = [
  '', 'Cá mới', 'Ngư dân', 'Thủy thủ', 'Thuyền trưởng',
  'Hải dương học', 'Đại dương chủ', 'Thần biển', 'Đại sư', 'Huyền thoại',
]

export function tinhLevelTuExp(exp = 0) {
  let lv = 1
  for (let i = 1; i < EXP_NGUONG.length; i++) {
    if (exp >= EXP_NGUONG[i]) lv = i + 1
    else break
  }
  return lv
}

// EXP earned within the current level
export function expTrongLevel(exp = 0) {
  const lv = tinhLevelTuExp(exp)
  return exp - (EXP_NGUONG[lv - 1] ?? 0)
}

// EXP needed to complete the current level (reach next)
export function expCanLenLevel(level) {
  const curr = EXP_NGUONG[level - 1] ?? 0
  const next = EXP_NGUONG[level]
  return next !== undefined ? next - curr : 999
}

// Legacy alias — kept for backward compatibility
export function tinhLevelNguoiChoi(exp = 0) { return tinhLevelTuExp(exp) }
export function tinhPhanTramTienLevel(exp = 0) {
  const lv   = tinhLevelTuExp(exp)
  const inLv = expTrongLevel(exp)
  const need = expCanLenLevel(lv)
  return Math.min(100, Math.round((inLv / need) * 100))
}
