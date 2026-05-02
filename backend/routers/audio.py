from fastapi import APIRouter, HTTPException
import httpx
import time

router = APIRouter(prefix="/audio", tags=["audio"])

_cache: dict[str, tuple[str, float]] = {}
_CACHE_TTL = 3600  # 1h — Innertube URL expire ~6h, cache 1h để an toàn

# Clients thử lần lượt — Android client trả URL không cần giải mã cipher
_CLIENTS = [
    {
        "name": "ANDROID",
        "version": "17.31.35",
        "header_name": "3",
        "user_agent": "com.google.android.youtube/17.31.35 (Linux; U; Android 11) gzip",
        "extra": {"androidSdkVersion": 30},
    },
    {
        "name": "ANDROID_TESTSUITE",
        "version": "1.9",
        "header_name": "30",
        "user_agent": "com.google.android.youtube/1.9 (Linux; U; Android 11) gzip",
        "extra": {"androidSdkVersion": 30},
    },
    {
        "name": "TV_EMBEDDED",
        "version": "2.0",
        "header_name": "85",
        "user_agent": "Mozilla/5.0 (SMART-TV; LINUX; Tizen 6.0) AppleWebKit/538.1",
        "extra": {},
    },
]


async def _innertube(video_id: str) -> str:
    async with httpx.AsyncClient(timeout=10) as client:
        for cfg in _CLIENTS:
            try:
                resp = await client.post(
                    "https://www.youtube.com/youtubei/v1/player",
                    json={
                        "videoId": video_id,
                        "context": {
                            "client": {
                                "clientName": cfg["name"],
                                "clientVersion": cfg["version"],
                                "hl": "en",
                                "gl": "US",
                                **cfg["extra"],
                            }
                        },
                    },
                    headers={
                        "User-Agent": cfg["user_agent"],
                        "Content-Type": "application/json",
                        "X-YouTube-Client-Name": cfg["header_name"],
                        "X-YouTube-Client-Version": cfg["version"],
                    },
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

                # Ưu tiên m4a (audio/mp4) — tương thích tốt nhất iOS/Android
                m4a = [f for f in audio if "mp4" in f.get("mimeType", "")]
                best = sorted(
                    m4a or audio, key=lambda x: x.get("bitrate", 0), reverse=True
                )[0]

                url = best.get("url")
                if url:
                    print(f"[audio] OK via {cfg['name']}: {best.get('mimeType')} {best.get('bitrate',0)//1000}kbps")
                    return url

            except Exception as e:
                print(f"[audio] {cfg['name']}: {e}")

    raise ValueError("Tất cả Innertube clients thất bại")


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
        url = await _innertube(v)
        _cache[v] = (url, now + _CACHE_TTL)
        return {"url": url, "video_id": v}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
