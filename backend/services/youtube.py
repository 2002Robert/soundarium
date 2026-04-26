import re
import requests
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


def lay_thong_tin_video(video_id: str) -> dict:
    """
    Lấy tên bài và tên kênh từ YouTube oEmbed API (không cần API key).
    """
    url = (
        f"https://www.youtube.com/oembed"
        f"?url=https://www.youtube.com/watch?v={video_id}"
        f"&format=json"
    )
    try:
        resp = requests.get(url, timeout=8)
        print(f"[YouTube oEmbed] video_id={video_id} status={resp.status_code}")
        if resp.status_code == 200:
            data = resp.json()
            return {
                "ten_bai": data.get("title") or "Bài nhạc không tên",
                "ten_kenh": data.get("author_name") or "",
            }
        print(f"[YouTube oEmbed] body={resp.text[:200]}")
    except Exception as e:
        print(f"[YouTube oEmbed] error: {e}")
    return {"ten_bai": "Bài nhạc không tên", "ten_kenh": ""}
