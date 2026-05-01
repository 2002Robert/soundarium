import os
import traceback
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from routers import fish, tank, coins, profile, decor, analytics, feedback, audio

load_dotenv()

app = FastAPI(
    title="Soundarium API",
    description="Backend cho hồ cá ảo kết hợp nghe nhạc YouTube",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://soundarium.pages.dev",
        "https://www.soundarium.pages.dev",
        "http://localhost:5173",
        "http://localhost:3000",
    ],
    allow_origin_regex=r"https://[a-z0-9]+\.soundarium\.pages\.dev",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global handler: đảm bảo mọi unhandled exception vẫn trả JSON có CORS header
# FastAPI bug: exception_handler chạy ngoài CORSMiddleware nên phải tự thêm header
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    tb = traceback.format_exc()
    print(f"[500] {request.method} {request.url}\n{tb}")
    origin = request.headers.get("origin", "")
    cors_headers = {}
    if origin:
        cors_headers["Access-Control-Allow-Origin"] = origin
        cors_headers["Access-Control-Allow-Credentials"] = "true"
    return JSONResponse(
        status_code=500,
        content={"detail": f"Lỗi server: {type(exc).__name__}: {exc}"},
        headers=cors_headers,
    )

app.include_router(fish.router)
app.include_router(tank.router)
app.include_router(coins.router)
app.include_router(profile.router)
app.include_router(decor.router)
app.include_router(analytics.router)
app.include_router(feedback.router)
app.include_router(audio.router)


@app.get("/")
async def root():
    return {"trang_thai": "Soundarium API đang chạy 🐟"}


@app.get("/health")
async def health():
    return {"ok": True}
