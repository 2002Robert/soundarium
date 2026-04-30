"""
Simple in-memory rate limiter.
Resets on server restart (acceptable for Render free tier / casual game).
"""
import time
from fastapi import HTTPException

_store: dict[str, float] = {}
_call_count = 0


def check(user_id: str, endpoint: str, cooldown_s: int) -> None:
    """Raise HTTP 429 if user called this endpoint within cooldown_s seconds."""
    global _call_count
    _call_count += 1

    # Cleanup every 2000 calls to prevent unbounded memory growth
    if _call_count % 2000 == 0:
        cutoff = time.time() - 3600  # drop entries older than 1 hour
        expired = [k for k, v in _store.items() if v < cutoff]
        for k in expired:
            del _store[k]

    key = f"{endpoint}:{user_id}"
    now = time.time()
    last = _store.get(key, 0.0)
    wait = cooldown_s - (now - last)

    if wait > 0:
        m, s = divmod(int(wait), 60)
        msg = f"Chờ thêm {m} phút {s} giây" if m else f"Chờ thêm {s} giây"
        raise HTTPException(status_code=429, detail=msg)

    _store[key] = now
