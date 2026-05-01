from fastapi import APIRouter, HTTPException
import yt_dlp
import httpx
import asyncio
import time
from functools import partial

router = APIRouter(prefix="/audio", tags=["audio"])

_cache: dict[str, tuple[str, float]] = {}
_CACHE_TTL = 4 * 3600

PIPED_INSTANCES = [
    "https://pipedapi.kavin.rocks",
    "https://piped-api.garudalinux.org",
    "https://api.piped.yt",
    "https://pipedapi.adminforge.de",
]

INVIDIOUS_INSTANCES = [
    "https://iv.nboeck.de",
    "https://inv.nadeko.net",
    "https://yt.artemislena.eu",
    "https://invidious.privacydev.net",
]


async def _via_piped(video_id: str) -> str:
    async with httpx.AsyncClient(timeout=8) as client:
        for instance in PIPED_INSTANCES:
            try:
                resp = await client.get(f"{instance}/streams/{video_id}")
                if not resp.is_success:
                    print(f"[audio] Piped {instance}: HTTP {resp.status_code}")
                    continue
                streams = resp.json().get("audioStreams", [])
                if not streams:
                    print(f"[audio] Piped {instance}: no audioStreams")
                    continue
                streams.sort(key=lambda x: x.get("bitrate", 0), reverse=True)
                url = streams[0].get("url", "")
                if url:
                    print(f"[audio] Piped OK: {instance}")
                    return url
            except Exception as e:
                print(f"[audio] Piped {instance} error: {e}")
    raise ValueError("Piped thất bại")


async def _via_invidious(video_id: str) -> str:
    async with httpx.AsyncClient(timeout=8) as client:
        for instance in INVIDIOUS_INSTANCES:
            try:
                resp = await client.get(
                    f"{instance}/api/v1/videos/{video_id}",
                    params={"fields": "adaptiveFormats"},
                )
                if not resp.is_success:
                    print(f"[audio] Invidious {instance}: HTTP {resp.status_code}")
                    continue
                audio = [
                    f for f in resp.json().get("adaptiveFormats", [])
                    if "audio" in f.get("type", "")
                ]
                if not audio:
                    print(f"[audio] Invidious {instance}: no audio formats")
                    continue
                audio.sort(key=lambda x: x.get("bitrate", 0), reverse=True)
                url = audio[0].get("url", "")
                if url:
                    print(f"[audio] Invidious OK: {instance}")
                    return url
            except Exception as e:
                print(f"[audio] Invidious {instance} error: {e}")
    raise ValueError("Invidious thất bại")


def _via_pytubefix(video_id: str) -> str:
    from pytubefix import YouTube
    from pytubefix.cli import on_progress
    yt = YouTube(
        f"https://www.youtube.com/watch?v={video_id}",
        use_oauth=False,
        allow_oauth_cache=False,
    )
    stream = yt.streams.filter(only_audio=True).order_by("abr").last()
    if not stream:
        raise ValueError("pytubefix: không có audio stream")
    print(f"[audio] pytubefix OK: {stream.abr}")
    return stream.url


def _via_ytdlp(video_id: str) -> str:
    for client in ["tv_embedded", "web_embedded", "android_music", "android_vr"]:
        try:
            with yt_dlp.YoutubeDL({
                "format": "bestaudio[ext=m4a]/bestaudio",
                "extractor_args": {"youtube": {"player_client": [client]}},
                "quiet": True,
                "no_warnings": True,
            }) as ydl:
                info = ydl.extract_info(
                    f"https://www.youtube.com/watch?v={video_id}",
                    download=False,
                )
            url = info.get("url") or next(
                (f["url"] for f in info.get("formats", [])
                 if f.get("acodec") not in (None, "none") and f.get("url")),
                None,
            )
            if url:
                print(f"[audio] yt-dlp OK: client={client}")
                return url
        except Exception as e:
            print(f"[audio] yt-dlp client={client}: {e}")
    raise ValueError("yt-dlp thất bại với mọi client")


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

    errors = []
    loop = asyncio.get_event_loop()

    # 1. Piped
    try:
        url = await _via_piped(v)
        _cache[v] = (url, now + _CACHE_TTL)
        return {"url": url, "video_id": v}
    except Exception as e:
        errors.append(f"Piped: {e}")

    # 2. Invidious
    try:
        url = await _via_invidious(v)
        _cache[v] = (url, now + _CACHE_TTL)
        return {"url": url, "video_id": v}
    except Exception as e:
        errors.append(f"Invidious: {e}")

    # 3. pytubefix
    try:
        url = await loop.run_in_executor(None, partial(_via_pytubefix, v))
        _cache[v] = (url, now + _CACHE_TTL)
        return {"url": url, "video_id": v}
    except Exception as e:
        errors.append(f"pytubefix: {e}")

    # 4. yt-dlp
    try:
        url = await loop.run_in_executor(None, partial(_via_ytdlp, v))
        _cache[v] = (url, now + _CACHE_TTL)
        return {"url": url, "video_id": v}
    except Exception as e:
        errors.append(f"yt-dlp: {e}")

    raise HTTPException(status_code=400, detail=" | ".join(errors))
