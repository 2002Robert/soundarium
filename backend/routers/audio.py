from fastapi import APIRouter, HTTPException
import yt_dlp
import time

router = APIRouter(prefix="/audio", tags=["audio"])

# In-memory cache: {video_id: (url, expires_at)}
_cache: dict[str, tuple[str, float]] = {}
_CACHE_TTL = 4 * 3600  # 4h — YouTube CDN URL expire ~6h

@router.get("/url")
async def lay_audio_url(v: str):
    now = time.time()

    if v in _cache:
        url, exp = _cache[v]
        if now < exp:
            return {"url": url, "video_id": v}
        del _cache[v]

    ydl_opts = {
        "format": "bestaudio[ext=m4a]/bestaudio[acodec=mp4a]/bestaudio",
        "quiet": True,
        "no_warnings": True,
        "http_headers": {
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/124.0.0.0 Safari/537.36"
            )
        },
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(
                f"https://www.youtube.com/watch?v={v}",
                download=False,
            )

        url = info.get("url")
        if not url:
            for fmt in info.get("formats", []):
                if fmt.get("acodec") not in (None, "none") and fmt.get("url"):
                    url = fmt["url"]
                    break

        if not url:
            raise HTTPException(status_code=404, detail="Không tìm được audio URL")

        _cache[v] = (url, now + _CACHE_TTL)
        return {"url": url, "video_id": v}

    except yt_dlp.utils.DownloadError as e:
        raise HTTPException(status_code=400, detail=str(e))
