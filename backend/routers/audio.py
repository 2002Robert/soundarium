from fastapi import APIRouter, HTTPException
import yt_dlp
import asyncio
import time
from functools import partial

router = APIRouter(prefix="/audio", tags=["audio"])

# In-memory cache: {video_id: (url, expires_at)}
_cache: dict[str, tuple[str, float]] = {}
_CACHE_TTL = 4 * 3600  # 4h — YouTube CDN URL expire ~6h


def _extract_sync(video_id: str) -> str:
    """Chạy yt-dlp đồng bộ — sẽ được gọi trong thread executor."""
    ydl_opts = {
        # ios client bypass bot detection mà không cần cookies
        "format": "bestaudio[ext=m4a]/bestaudio",
        "extractor_args": {"youtube": {"player_client": ["ios"]}},
        "quiet": True,
        "no_warnings": True,
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(
            f"https://www.youtube.com/watch?v={video_id}",
            download=False,
        )

    url = info.get("url")
    if not url:
        for fmt in info.get("formats", []):
            if fmt.get("acodec") not in (None, "none") and fmt.get("url"):
                url = fmt["url"]
                break

    if not url:
        raise ValueError("Không tìm được audio URL trong formats")
    return url


@router.get("/url")
async def lay_audio_url(v: str):
    if not v or len(v) < 5:
        raise HTTPException(status_code=400, detail="Video ID không hợp lệ")

    now = time.time()
    if v in _cache:
        url, exp = _cache[v]
        if now < exp:
            return {"url": url, "video_id": v}
        del _cache[v]

    try:
        loop = asyncio.get_event_loop()
        url = await loop.run_in_executor(None, partial(_extract_sync, v))
        _cache[v] = (url, now + _CACHE_TTL)
        return {"url": url, "video_id": v}

    except yt_dlp.utils.DownloadError as e:
        raise HTTPException(status_code=400, detail=f"yt-dlp: {e}")
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi extract: {e}")
