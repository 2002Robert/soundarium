import os
import base64
import asyncio
import tempfile
import time
from fastapi import APIRouter, HTTPException
import httpx

router = APIRouter(prefix="/audio", tags=["audio"])

_cache: dict[str, tuple[str, float]] = {}
_CACHE_TTL = 3600  # 1h

_CLIENTS = [
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
    {
        "name": "TVHTML5_SIMPLY_EMBEDDED_PLAYER",
        "version": "2.0",
        "header_name": "85",
        "key": "AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8",
        "user_agent": "Mozilla/5.0 (SMART-TV; LINUX; Tizen 6.0) AppleWebKit/538.1",
        "extra": {},
        "embed_url": "https://www.youtube.com/",
    },
    {
        "name": "IOS",
        "version": "19.29.1",
        "header_name": "5",
        "key": "AIzaSyB-63vPrdThhKuerbB2N_l7Kwwcxj6yUA",
        "user_agent": "com.google.ios.youtube/19.29.1 (iPhone14,3; U; CPU iOS 15_6 like Mac OS X)",
        "extra": {"deviceModel": "iPhone14,3", "osVersion": "15.6.0.19H274"},
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

    # 1) Innertube (nhanh, dùng cookie nếu có)
    url = await _innertube(v)

    # 2) yt-dlp fallback (chỉ khi có YOUTUBE_COOKIES)
    if not url:
        url = await _ytdlp(v)

    if not url:
        has_cookie = bool(os.getenv("YOUTUBE_COOKIES"))
        msg = "Innertube thất bại" + ("" if has_cookie else " — thêm YOUTUBE_COOKIES vào Render để bypass IP block")
        raise HTTPException(status_code=400, detail=msg)

    _cache[v] = (url, now + _CACHE_TTL)
    return {"url": url, "video_id": v}
