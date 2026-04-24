from fastapi import HTTPException, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
import httpx
import os
from dotenv import load_dotenv

load_dotenv()

_bearer = HTTPBearer(auto_error=False)
_SUPABASE_URL = os.getenv("SUPABASE_URL", "").rstrip("/")
_ANON_KEY     = os.getenv("SUPABASE_ANON_KEY", "")


async def _xac_thuc_token(token: str) -> str:
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.get(
                f"{_SUPABASE_URL}/auth/v1/user",
                headers={
                    "apikey":        _ANON_KEY,
                    "Authorization": f"Bearer {token}",
                },
            )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Không thể kết nối xác thực",
        )
    if resp.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Cần đăng nhập lại",
        )
    data = resp.json()
    uid = data.get("id")
    if not uid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token không hợp lệ",
        )
    return uid


async def lay_user_id(
    credentials: HTTPAuthorizationCredentials = Security(_bearer),
) -> str:
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Cần đăng nhập",
        )
    return await _xac_thuc_token(credentials.credentials)


def lay_token(
    credentials: HTTPAuthorizationCredentials = Security(_bearer),
) -> str:
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Cần đăng nhập",
        )
    return credentials.credentials
