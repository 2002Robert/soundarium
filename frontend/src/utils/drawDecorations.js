/**
 * Normalize a raw Supabase decorations row (from JOIN query) to the
 * format that AquariumCanvas / veVatTrangTri expects.
 *
 * Raw DB columns:  id, loai_trang_tri, pos_x, pos_y, layer, scale, is_visible
 * Canvas format:   id, loai,           pos_x, pos_y, layer, scale, an
 */
export function normalizeDecorDB(d) {
  return {
    id:    d.id,
    loai:  d.loai_trang_tri,
    pos_x: d.pos_x  ?? 0.5,
    pos_y: d.pos_y  ?? 0.85,
    layer: d.layer  ?? 1,
    scale: typeof d.scale === 'number' ? d.scale : 1.0,
    an:    !d.is_visible,
  }
}
