import os
import httpx
from dotenv import load_dotenv

load_dotenv()

_URL  = os.getenv("SUPABASE_URL", "").rstrip("/")
_ANON = os.getenv("SUPABASE_ANON_KEY", "")
_SVC  = os.getenv("SUPABASE_SERVICE_KEY", _ANON)

if not _URL or not _ANON:
    raise RuntimeError("Thiếu SUPABASE_URL hoặc SUPABASE_ANON_KEY trong .env")


class _Result:
    def __init__(self, data):
        self.data = data


class _QB:
    """Minimal PostgREST query builder — interface khớp hoàn toàn với supabase-py."""

    def __init__(self, base_url: str, table: str, api_key: str, token: str):
        self._url    = f"{base_url}/rest/v1/{table}"
        self._apikey = api_key
        self._token  = token
        self._method = "GET"
        self._cols   = "*"
        self._filters: dict[str, str] = {}
        self._order_col: str | None   = None
        self._single  = False
        self._body    = None

    def select(self, cols: str = "*"):
        self._cols = cols
        return self

    def eq(self, col: str, val):
        self._filters[col] = f"eq.{val}"
        return self

    def neq(self, col: str, val):
        self._filters[col] = f"neq.{val}"
        return self

    def order(self, col: str):
        self._order_col = col
        return self

    def single(self):
        self._single = True
        return self

    def insert(self, body):
        self._method = "POST"
        self._body = body
        return self

    def update(self, body: dict):
        self._method = "PATCH"
        self._body = body
        return self

    def delete(self):
        self._method = "DELETE"
        return self

    def execute(self) -> _Result:
        params: dict = {**self._filters}
        if self._method != "DELETE":
            params["select"] = self._cols
        if self._order_col:
            params["order"] = self._order_col

        headers = {
            "apikey":        self._apikey,
            "Authorization": f"Bearer {self._token}",
            "Content-Type":  "application/json",
        }
        if self._single:
            headers["Accept"] = "application/vnd.pgrst.object+json"
        if self._method in ("POST", "PATCH"):
            headers["Prefer"] = "return=representation"

        with httpx.Client(timeout=10.0) as client:
            resp = client.request(
                self._method, self._url,
                params=params, json=self._body, headers=headers,
            )

        if not resp.is_success:
            raise Exception(f"Supabase {resp.status_code}: {resp.text}")

        if not resp.text or resp.text == "null":
            return _Result(None if self._single else [])

        data = resp.json()
        if self._single and isinstance(data, list):
            data = data[0] if data else None
        elif not self._single and not isinstance(data, list):
            data = [data] if data else []

        return _Result(data)


class _Client:
    def __init__(self, base_url: str, api_key: str, token: str | None = None):
        self._base = base_url
        self._key  = api_key
        self._tok  = token or api_key

    def table(self, name: str) -> _QB:
        return _QB(self._base, name, self._key, self._tok)


# Admin client — service key, bypass RLS
supabase_admin = _Client(_URL, _SVC)

# Anon client — RLS áp dụng đầy đủ
supabase = _Client(_URL, _ANON)


def lay_client_voi_token(jwt_token: str) -> _Client:
    """Client với JWT của user — RLS nhận đúng user_id."""
    return _Client(_URL, _ANON, jwt_token)
