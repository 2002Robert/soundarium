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
    """
    Verify token bằng cách gọi Supabase Auth API — đáng tin cậy hơn
    decode JWT thủ công vì không phụ thuộc vào format JWT secret.
    """
    async with httpx.AsyncClient(timeout=5.0) as client:
        resp = await client.get(
            f"{_SUPABASE_URL}/auth/v1/user",
            headers={
                "apikey":        _ANON_KEY,
                "Authorization": f"Bearer {token}",
            },
        )
    if resp.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Cần đăng nhập lại",
        )
    return resp.json()["id"]


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
