// Backward-compat re-export — source of truth is utils/playerLevel.js
export { NGUONG as EXP_NGUONG, TIEU_DE_LEVEL, tinhLevel, tinhLevel as tinhLevelTuExp, expDenLevelTiep } from '../utils/playerLevel'
export { tinhLevel as tinhLevelNguoiChoi } from '../utils/playerLevel'

import { tinhLevel, expDenLevelTiep, NGUONG } from '../utils/playerLevel'

export function expTrongLevel(exp = 0) {
  return expDenLevelTiep(exp).hienTai
}

export function expCanLenLevel(level) {
  const curr = NGUONG[level - 1] ?? 0
  const next = NGUONG[level]
  return next !== undefined ? next - curr : 0
}

export function tinhPhanTramTienLevel(exp = 0) {
  const { hienTai, canCo } = expDenLevelTiep(exp)
  return canCo > 0 ? Math.min(100, Math.round((hienTai / canCo) * 100)) : 100
}
