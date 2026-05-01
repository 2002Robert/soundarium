from fastapi import APIRouter, HTTPException
import yt_dlp
import httpx
import asyncio
import time
from functools import partial

router = APIRouter(prefix="/audio", tags=["audio"])

_cache: dict[str, tuple[str, float]] = {}
_CACHE_TTL = 4 * 3600

# Invidious public instances — thử lần lượt
INVIDIOUS = [
    "https://iv.nboeck.de",
    "https://inv.nadeko.net",
    "https://yt.artemislena.eu",
    "https://invidious.privacydev.net",
]


async def _via_invidious(video_id: str) -> str:
    async with httpx.AsyncClient(timeout=8) as client:
        for instance in INVIDIOUS:
            try:
                resp = await client.get(
                    f"{instance}/api/v1/videos/{video_id}",
                    params={"fields": "adaptiveFormats"},
                )
                if not resp.is_success:
                    continue
                formats = resp.json().get("adaptiveFormats", [])
                audio = [f for f in formats if "audio" in f.get("type", "")]
                if not audio:
                    continue
                audio.sort(key=lambda x: x.get("bitrate", 0), reverse=True)
                url = audio[0].get("url", "")
                if url:
                    return url
            except Exception:
                continue
    raise ValueError("Tất cả Invidious instances thất bại")


def _via_ytdlp(video_id: str) -> str:
    clients = ["android_vr", "android", "mweb"]
    last_err = None
    for client in clients:
        try:
            opts = {
                "format": "bestaudio[ext=m4a]/bestaudio",
                "extractor_args": {"youtube": {"player_client": [client]}},
                "quiet": True,
                "no_warnings": True,
            }
            with yt_dlp.YoutubeDL(opts) as ydl:
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
            if url:
                return url
        except Exception as e:
            last_err = e
    raise last_err or ValueError("yt-dlp thất bại với mọi client")


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

    # 1. Thử Invidious (nhanh, không cần bypass)
    try:
        url = await _via_invidious(v)
        _cache[v] = (url, now + _CACHE_TTL)
        return {"url": url, "video_id": v}
    except Exception:
        pass

    # 2. Fallback: yt-dlp với nhiều client
    try:
        loop = asyncio.get_event_loop()
        url = await loop.run_in_executor(None, partial(_via_ytdlp, v))
        _cache[v] = (url, now + _CACHE_TTL)
        return {"url": url, "video_id": v}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
