import re
import httpx
from typing import Optional


def trich_video_id(youtube_url: str) -> Optional[str]:
    """Lấy video ID từ mọi dạng URL YouTube."""
    patterns = [
        r"youtube\.com/watch\?v=([\w-]+)",
        r"youtu\.be/([\w-]+)",
        r"youtube\.com/embed/([\w-]+)",
        r"youtube\.com/shorts/([\w-]+)",
    ]
    for pattern in patterns:
        match = re.search(pattern, youtube_url)
        if match:
            return match.group(1)
    return None


async def lay_thong_tin_video(video_id: str) -> dict:
    """
    Lấy tên bài và tên kênh từ YouTube oEmbed API.
    oEmbed không cần API key, giới hạn thấp nên ổn cho MVP.
    """
    url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={video_id}&format=json"
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(url)
            if resp.status_code == 200:
                data = resp.json()
                return {
                    "ten_bai": data.get("title", "Bài nhạc không tên"),
                    "ten_kenh": data.get("author_name", ""),
                }
    except Exception:
        pass
    return {"ten_bai": "Bài nhạc không tên", "ten_kenh": ""}
