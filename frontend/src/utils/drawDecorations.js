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
    pos_y: d.pos_y  ?? (isNgoc ? 0.90 : 0.85),
    // ngoc_trai layer=0 là bug cũ (bị chôn dưới cát) → force lên 1
    layer: (isNgoc && (d.layer ?? 0) < 1) ? 1 : (d.layer ?? 1),
    scale: typeof d.scale === 'number' ? d.scale : 1.0,
    // ngoc_trai luôn hiển thị nếu tồn tại trong DB (is_visible cũ có thể sai)
    an:    isNgoc ? false : !d.is_visible,
  }
}
