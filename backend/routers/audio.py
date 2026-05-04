import os
import base64
import asyncio
import hashlib
import tempfile
import time
from fastapi import APIRouter, HTTPException
import httpx

router = APIRouter(prefix="/audio", tags=["audio"])

_cache: dict[str, tuple[str, float]] = {}
_CACHE_TTL = 3600  # 1h

_CLIENTS = [
    {
        "name": "ANDROID_VR",
        "version": "1.60.19",
        "header_name": "28",
        "key": "AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8",
        "user_agent": "com.google.android.apps.youtube.vr.oculus/1.60.19 (Linux; U; Android 12L; eureka-user Build/SQ3A.220605.009.A1) gzip",
        "extra": {"deviceMake": "Oculus", "deviceModel": "Quest 3", "androidSdkVersion": 32, "osName": "Android", "osVersion": "12L"},
    },
    {
        "name": "WEB",
        "version": "2.20240726.00.00",
        "header_name": "1",
        "key": "AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8",
        "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
        "extra": {},
        "web": True,
    },
    {
        "name": "ANDROID",
        "version": "19.29.37",
        "header_name": "3",
        "key": "AIzaSyA8eiZmM1FaDVjRy-df2KTyQ_vz_yYM39w",
        "user_agent": "com.google.android.youtube/19.29.37 (Linux; U; Android 11) gzip",
        "extra": {"androidSdkVersion": 30, "osName": "Android", "osVersion": "11"},
    },
    {
        "name": "ANDROID_TESTSUITE",
        "version": "1.9",
        "header_name": "30",
        "key": "AIzaSyA8eiZmM1FaDVjRy-df2KTyQ_vz_yYM39w",
        "user_agent": "com.google.android.youtube/1.9 (Linux; U; Android 11) gzip",
        "extra": {"androidSdkVersion": 30},
    },
]


def _decode_cookies_env() -> str:
    """Đọc YOUTUBE_COOKIES env var (raw hoặc base64), trả về nội dung cookies.txt."""
    raw = os.getenv("YOUTUBE_COOKIES", "")
    if not raw:
        return ""
    try:
        return base64.b64decode(raw).decode("utf-8")
    except Exception:
        return raw


def _sapisid_hash(sapisid: str) -> str:
    ts = int(time.time())
    sha = hashlib.sha1(f"{ts} {sapisid} https://www.youtube.com".encode()).hexdigest()
    return f"SAPISIDHASH {ts}_{sha}"


def _cookie_header() -> str:
    """Parse cookies.txt Netscape format → Cookie header string."""
    text = _decode_cookies_env()
    if not text:
        return ""
    cookies = {}
    for line in text.splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        parts = line.split("\t")
        if len(parts) >= 7:
            cookies[parts[5]] = parts[6]
    return "; ".join(f"{k}={v}" for k, v in cookies.items())


_PIPED_INSTANCES = [
    "https://pipedapi.kavin.rocks",
    "https://pipedapi.tokhmi.xyz",
    "https://pa.il.ax",
]


async def _piped(video_id: str) -> str:
    async with httpx.AsyncClient(timeout=8) as client:
        for base in _PIPED_INSTANCES:
            try:
                r = await client.get(
                    f"{base}/streams/{video_id}",
                    headers={"User-Agent": "Mozilla/5.0"},
                )
                if not r.is_success:
                    continue
                d = r.json()
                streams = d.get("audioStreams", [])
                m4a = [s for s in streams if "mp4" in s.get("mimeType", "")]
                best = sorted(m4a or streams, key=lambda s: s.get("bitrate", 0), reverse=True)
                if best and best[0].get("url"):
                    url = best[0]["url"]
                    print(f"[audio] Piped OK via {base}: {best[0].get('quality','')}")
                    return url
            except Exception as e:
                print(f"[audio] Piped {base}: {e}")
    return ""


async def _innertube(video_id: str) -> str:
    cookie = _cookie_header()
    has_cookie = bool(cookie)

    async with httpx.AsyncClient(timeout=15) as client:
        for cfg in _CLIENTS:
            try:
                hdrs = {
                    "User-Agent": cfg["user_agent"],
                    "Content-Type": "application/json",
                    "X-YouTube-Client-Name": cfg["header_name"],
                    "X-YouTube-Client-Version": cfg["version"],
                }
                if has_cookie:
                    hdrs["Cookie"] = cookie
                    if cfg.get("web"):
                        # WEB client dùng SAPISIDHASH thay vì chỉ Cookie
                        sapisid = next(
                            (v for k, v in (p.split("=", 1) for p in cookie.split("; ") if "=" in p) if k == "SAPISID"),
                            None
                        )
                        if sapisid:
                            hdrs["Authorization"] = _sapisid_hash(sapisid)
                            hdrs["Origin"] = "https://www.youtube.com"
                            hdrs["X-Origin"] = "https://www.youtube.com"

                api_url = f"https://www.youtube.com/youtubei/v1/player?key={cfg['key']}&prettyPrint=false"
                ctx: dict = {
                    "client": {
                        "clientName": cfg["name"],
                        "clientVersion": cfg["version"],
                        "hl": "en",
                        "gl": "US",
                        **cfg["extra"],
                    }
                }
                if cfg.get("embed_url"):
                    ctx["thirdParty"] = {"embedUrl": cfg["embed_url"]}

                resp = await client.post(
                    api_url,
                    json={
                        "videoId": video_id,
                        "context": ctx,
                        "contentCheckOk": True,
                        "racyCheckOk": True,
                    },
                    headers=hdrs,
                )

                if not resp.is_success:
                    print(f"[audio] {cfg['name']}: HTTP {resp.status_code}")
                    continue

                data = resp.json()
                status = data.get("playabilityStatus", {}).get("status")
                if status not in ("OK", None):
                    reason = data["playabilityStatus"].get("reason", status)
                    print(f"[audio] {cfg['name']}: {reason}")
                    continue

                formats = data.get("streamingData", {}).get("adaptiveFormats", [])
                audio = [f for f in formats if "audio" in f.get("mimeType", "")]
                if not audio:
                    print(f"[audio] {cfg['name']}: no audio formats")
                    continue

                m4a = [f for f in audio if "mp4" in f.get("mimeType", "")]
                best = sorted(
                    m4a or audio, key=lambda x: x.get("bitrate", 0), reverse=True
                )[0]

                url = best.get("url")
                if url:
                    print(f"[audio] Innertube OK via {cfg['name']} (cookie={has_cookie}): {best.get('mimeType')} {best.get('bitrate',0)//1000}kbps")
                    return url

            except Exception as e:
                print(f"[audio] {cfg['name']}: {e}")

    return ""


async def _ytdlp(video_id: str) -> str:
    cookies_text = _decode_cookies_env()
    if not cookies_text:
        print("[audio] yt-dlp: không có YOUTUBE_COOKIES, bỏ qua")
        return ""

    tmp = tempfile.NamedTemporaryFile(mode="w", suffix=".txt", delete=False)
    try:
        tmp.write(cookies_text)
        tmp.close()
        cookies_path = tmp.name

        def extract():
            import yt_dlp
            ydl_opts = {
                "format": "bestaudio[ext=m4a]/bestaudio",
                "quiet": True,
                "no_warnings": True,
                "cookiefile": cookies_path,
            }
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(
                    f"https://www.youtube.com/watch?v={video_id}",
                    download=False,
                )
                fmts = info.get("formats") or []
                audio = [f for f in fmts if (f.get("vcodec") or "none") == "none" and f.get("url")]
                if audio:
                    best = sorted(audio, key=lambda f: f.get("tbr") or f.get("abr") or 0, reverse=True)[0]
                    return best["url"]
                return info.get("url", "")

        loop = asyncio.get_event_loop()
        url = await loop.run_in_executor(None, extract)
        if url:
            print(f"[audio] yt-dlp OK")
            return url
        return ""
    except Exception as e:
        print(f"[audio] yt-dlp: {e}")
        return ""
    finally:
        try:
            os.unlink(tmp.name)
        except Exception:
            pass


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

    # 1) Piped (third-party YT proxy, không bị IP block)
    url = await _piped(v)

    # 2) Innertube (dùng cookie nếu có)
    if not url:
        url = await _innertube(v)

    # 3) yt-dlp fallback (chỉ khi có YOUTUBE_COOKIES)
    if not url:
        url = await _ytdlp(v)

    if not url:
        has_cookie = bool(os.getenv("YOUTUBE_COOKIES"))
        msg = "Innertube thất bại" + ("" if has_cookie else " — thêm YOUTUBE_COOKIES vào Render để bypass IP block")
        raise HTTPException(status_code=400, detail=msg)

    _cache[v] = (url, now + _CACHE_TTL)
    return {"url": url, "video_id": v}
