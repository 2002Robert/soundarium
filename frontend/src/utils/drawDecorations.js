/**
 * Normalize a raw Supabase decorations row (from JOIN query) to the
 * format that AquariumCanvas / veVatTrangTri expects.
 *
 * Raw DB columns:  id, loai_trang_tri, pos_x, pos_y, layer, scale, is_visible
 * Canvas format:   id, loai,           pos_x, pos_y, layer, scale, an
 */
export function normalizeDecorDB(d) {
  const isNgoc = d.loai_trang_tri === 'ngoc_trai'
  return {
    id:    d.id,
    loai:  d.loai_trang_tri,
    pos_x: d.pos_x  ?? 0.5,
    pos_y: d.pos_y  ?? (isNgoc ? 0.96 : 0.85),
    layer: d.layer  ?? (isNgoc ? 0 : 1),
    scale: typeof d.scale === 'number' ? d.scale : 1.0,
    // ngoc_trai luôn hiển thị nếu tồn tại trong DB (is_visible cũ có thể sai)
    an:    isNgoc ? false : !d.is_visible,
  }
}
