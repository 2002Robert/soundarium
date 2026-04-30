-- ══════════════════════════════════════════════════════
-- SOUNDARIUM — Row Level Security setup
-- Chạy toàn bộ file này trong Supabase → SQL Editor
-- Backend dùng service_role nên bypass RLS hoàn toàn.
-- Chỉ chặn user dùng anon key + JWT để hack trực tiếp DB.
-- ══════════════════════════════════════════════════════

-- 1. Bật RLS cho tất cả bảng
ALTER TABLE profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE tanks       ENABLE ROW LEVEL SECURITY;
ALTER TABLE fish        ENABLE ROW LEVEL SECURITY;
ALTER TABLE decorations ENABLE ROW LEVEL SECURITY;

-- ──────────────────────────────────────────────────────
-- PROFILES
-- ──────────────────────────────────────────────────────
DROP POLICY IF EXISTS "profiles_select_own"  ON profiles;
DROP POLICY IF EXISTS "profiles_update_own"  ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own"  ON profiles;

-- User chỉ đọc profile của chính mình
-- (frontend dùng trong chiaSe() để lấy username)
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid());

CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

-- ──────────────────────────────────────────────────────
-- TANKS
-- ──────────────────────────────────────────────────────
DROP POLICY IF EXISTS "tanks_select_own" ON tanks;
DROP POLICY IF EXISTS "tanks_insert_own" ON tanks;
DROP POLICY IF EXISTS "tanks_update_own" ON tanks;
DROP POLICY IF EXISTS "tanks_delete_own" ON tanks;

CREATE POLICY "tanks_select_own" ON tanks
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "tanks_insert_own" ON tanks
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "tanks_update_own" ON tanks
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "tanks_delete_own" ON tanks
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- ──────────────────────────────────────────────────────
-- FISH
-- ──────────────────────────────────────────────────────
DROP POLICY IF EXISTS "fish_select_own" ON fish;
DROP POLICY IF EXISTS "fish_insert_own" ON fish;
DROP POLICY IF EXISTS "fish_update_own" ON fish;
DROP POLICY IF EXISTS "fish_delete_own" ON fish;

CREATE POLICY "fish_select_own" ON fish
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "fish_insert_own" ON fish
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "fish_update_own" ON fish
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "fish_delete_own" ON fish
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- ──────────────────────────────────────────────────────
-- DECORATIONS
-- ──────────────────────────────────────────────────────
DROP POLICY IF EXISTS "decorations_select_own" ON decorations;
DROP POLICY IF EXISTS "decorations_insert_own" ON decorations;
DROP POLICY IF EXISTS "decorations_update_own" ON decorations;
DROP POLICY IF EXISTS "decorations_delete_own" ON decorations;

CREATE POLICY "decorations_select_own" ON decorations
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "decorations_insert_own" ON decorations
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "decorations_update_own" ON decorations
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "decorations_delete_own" ON decorations
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- ──────────────────────────────────────────────────────
-- BONUS: Thêm cột day_ho cho tanks (nếu chưa có)
-- ──────────────────────────────────────────────────────
ALTER TABLE tanks ADD COLUMN IF NOT EXISTS day_ho TEXT DEFAULT 'cat_trang';

-- Thêm cột scale cho decorations (nếu chưa có)
ALTER TABLE decorations ADD COLUMN IF NOT EXISTS scale FLOAT DEFAULT 1.0;

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
