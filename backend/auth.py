from fastapi import HTTPException, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
import os
from dotenv import load_dotenv

load_dotenv()

_bearer = HTTPBearer(auto_error=False)

# Supabase ký JWT bằng JWT_SECRET lấy từ Project Settings → API
# Khi chưa có biến này, ta decode không verify để lấy user_id
_jwt_secret = os.getenv("SUPABASE_JWT_SECRET", "")


def lay_user_id(
    credentials: HTTPAuthorizationCredentials = Security(_bearer),
) -> str:
    """Trích user ID từ JWT Supabase. Throw 401 nếu token không hợp lệ."""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Cần đăng nhập",
        )

    token = credentials.credentials
    try:
        # Supabase dùng HS256, audience = "authenticated"
        payload = jwt.decode(
            token,
            _jwt_secret,
            algorithms=["HS256"],
            audience="authenticated",
            options={"verify_signature": bool(_jwt_secret)},
        )
        user_id: str = payload.get("sub")
        if not user_id:
            raise ValueError("Không có sub trong token")
        return user_id
    except (JWTError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token không hợp lệ hoặc đã hết hạn",
        )


def lay_token(
    credentials: HTTPAuthorizationCredentials = Security(_bearer),
) -> str:
    """Trả về raw JWT để gắn vào Supabase client."""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Cần đăng nhập",
        )
    return credentials.credentials
