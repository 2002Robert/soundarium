from pydantic import BaseModel, field_validator
from typing import Optional
import re


class ThemCaMoi(BaseModel):
    youtube_url: str
    nickname: Optional[str] = None
    loai_ca: Optional[str] = None   # Truyền từ shop; None = random

    @field_validator("youtube_url")
    @classmethod
    def kiem_tra_url_youtube(cls, v: str) -> str:
        # Chấp nhận cả youtube.com/watch?v= và youtu.be/
        pattern = r"(youtube\.com/watch\?v=|youtu\.be/)[\w-]+"
        if not re.search(pattern, v):
            raise ValueError("Không phải link YouTube hợp lệ")
        return v


class ChinhSuaCa(BaseModel):
    nickname: Optional[str] = None
    youtube_url: Optional[str] = None

    @field_validator("youtube_url")
    @classmethod
    def kiem_tra_url(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        pattern = r"(youtube\.com/watch\?v=|youtu\.be/)[\w-]+"
        if not re.search(pattern, v):
            raise ValueError("Không phải link YouTube hợp lệ")
        return v


class CapNhatNghe(BaseModel):
    so_phut: float = 5.0  # Mặc định gọi mỗi 5 phút


class TestCapXP(BaseModel):
    so_gio: float
