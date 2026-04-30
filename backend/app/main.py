from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import items, suggestions, auth, admin, catalog, music, profile, friends, chat
import os

Base.metadata.create_all(bind=engine)

app = FastAPI()

# CORS — читаем из env, fallback на localhost для локалки
origins_env = os.getenv("ALLOWED_ORIGINS", "")
origins = [o.strip() for o in origins_env.split(",") if o.strip()]

# Всегда добавляем localhost для локальной разработки
origins += [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(items.router)
app.include_router(suggestions.router)
app.include_router(admin.router)
app.include_router(catalog.router)
app.include_router(music.router)
app.include_router(profile.router)
app.include_router(friends.router)
app.include_router(chat.router)