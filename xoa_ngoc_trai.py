import httpx, os, sys

URL = "https://vhirifjjailbdzpwkxgx.supabase.co"
KEY = os.getenv("SB_SERVICE_KEY", "")

if not KEY:
    print("Thiếu SB_SERVICE_KEY. Chạy: SB_SERVICE_KEY=xxx python xoa_ngoc_trai.py")
    sys.exit(1)

H = {
    "apikey":        KEY,
    "Authorization": f"Bearer {KEY}",
    "Content-Type":  "application/json",
}

def get(table, params=""):
    r = httpx.get(f"{URL}/rest/v1/{table}?{params}", headers=H, timeout=15)
    r.raise_for_status()
    return r.json()

def delete(table, params):
    r = httpx.delete(f"{URL}/rest/v1/{table}?{params}", headers={**H, "Prefer": "return=representation"}, timeout=15)
    r.raise_for_status()
    return r.json()

def patch(table, params, body):
    r = httpx.patch(f"{URL}/rest/v1/{table}?{params}", headers={**H, "Prefer": "return=representation"}, json=body, timeout=15)
    r.raise_for_status()
    return r.json()

# ── 1. Kiểm tra distinct loai_trang_tri ─────────────────────────────
print("\n=== DISTINCT loai_trang_tri trong decorations ===")
rows = get("decorations", "select=loai_trang_tri")
distinct = sorted({r["loai_trang_tri"] for r in rows if r.get("loai_trang_tri")})
for v in distinct:
    print(" ", v)

# ── 2. Đếm ngọc/trai trước khi xóa ─────────────────────────────────
print("\n=== Records liên quan ngọc/trai ===")
targets = [v for v in distinct if any(k in v for k in ("trai", "ngoc", "pearl", "oyster"))]
for v in targets:
    rows_v = get("decorations", f"loai_trang_tri=eq.{v}&select=id")
    print(f"  {v}: {len(rows_v)} record(s)")

if not targets:
    print("  Không tìm thấy record nào liên quan.")

# ── 3. Xóa từng loại ────────────────────────────────────────────────
print("\n=== XÓA decorations ===")
total_xoa = 0
for v in targets:
    deleted = delete("decorations", f"loai_trang_tri=eq.{v}")
    n = len(deleted) if isinstance(deleted, list) else 0
    print(f"  Đã xóa {n} record loai_trang_tri='{v}'")
    total_xoa += n
print(f"  Tổng: {total_xoa} record đã xóa")

# ── 4. Reset ngoc_trai về 0 trong profiles ──────────────────────────
print("\n=== RESET profiles.ngoc_trai = 0 ===")
updated = patch("profiles", "ngoc_trai=neq.0", {"ngoc_trai": 0})
n = len(updated) if isinstance(updated, list) else 0
print(f"  Đã reset {n} profile(s) về 0")

print("\n✓ Xong!")
