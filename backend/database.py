import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

_supabase_url = os.getenv("SUPABASE_URL")
_supabase_anon_key = os.getenv("SUPABASE_ANON_KEY")
_supabase_service_key = os.getenv("SUPABASE_SERVICE_KEY")

if not _supabase_url or not _supabase_anon_key:
    raise RuntimeError("Thiếu SUPABASE_URL hoặc SUPABASE_ANON_KEY trong file .env")

# Client dùng cho request người dùng (bị giới hạn bởi RLS)
supabase: Client = create_client(_supabase_url, _supabase_anon_key)

# Client admin — bypass RLS, chỉ dùng cho server-side logic
supabase_admin: Client = create_client(
    _supabase_url,
    _supabase_service_key or _supabase_anon_key,
)


def lay_client_voi_token(jwt_token: str) -> Client:
    """Tạo client Supabase gắn JWT của người dùng để RLS hoạt động đúng."""
    client = create_client(_supabase_url, _supabase_anon_key)
    client.postgrest.auth(jwt_token)
    return client
