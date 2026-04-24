import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from routers import fish, tank, coins

load_dotenv()

app = FastAPI(
    title="Soundarium API",
    description="Backend cho hồ cá ảo kết hợp nghe nhạc YouTube",
    version="1.0.0",
)

_frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")

# Cho phép cả localhost dev và production frontend gọi API
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        _frontend_url,
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(fish.router)
app.include_router(tank.router)
app.include_router(coins.router)


@app.get("/")
async def root():
    return {"trang_thai": "Soundarium API đang chạy 🐟"}


@app.get("/health")
async def health():
    """Endpoint cho GitHub Actions keep-alive và Railway health check."""
    return {"ok": True}
