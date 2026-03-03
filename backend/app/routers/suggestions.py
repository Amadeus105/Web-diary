from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import crud, schemas
from ..database import SessionLocal
import httpx
import os

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/suggestions/", response_model=list[schemas.Suggestion])
def read_suggestions(db: Session = Depends(get_db)):
    return crud.get_suggestions(db)

@router.post("/suggestions/", response_model=schemas.Suggestion)
def add_suggestion(suggestion: schemas.SuggestionCreate, db: Session = Depends(get_db)):
    return crud.create_suggestion(db, suggestion)

@router.post("/suggestions/ai")
async def get_ai_suggestions(db: Session = Depends(get_db)):
    items = crud.get_items(db)

    if not items:
        return []

    items_text = "\n".join([f"- {item.name} ({item.type})" for item in items])

    prompt = f"""Ты персональный рекомендатор книг и игр.

    Пользователь уже завершил следующие книги и игры:
    {items_text}

    Основываясь на его вкусах и предпочтениях, порекомендуй 5 книг или игр которые ему понравятся.
    Начни ответ с короткой фразы о его вкусах, например: "Судя по вашим предпочтениям, вам нравятся..."
    Затем дай 5 рекомендаций.

    Для каждой рекомендации используй формат: Title | type | description
    Где type это "book" или "game", а description — одно предложение почему это ему подойдёт."""

    ollama_url = os.getenv("OLLAMA_URL", "http://localhost:11434")

    async with httpx.AsyncClient(timeout=300.0) as client:
        response = await client.post(
            f"{ollama_url}/api/generate",
            json={
                "model": "llama3",
                "prompt": prompt,
                "stream": False
            }
        )

    result = response.json()["response"]

    lines = result.strip().split("\n")
    intro = ""
    suggestions = []

    for line in lines:
        parts = line.split("|")
        if len(parts) == 3:
            suggestions.append({
                "title": parts[0].strip(),
                "type": parts[1].strip(),
                "description": parts[2].strip()
            })
        elif line.strip() and not intro:
            intro = line.strip()

    return {"intro": intro, "suggestions": suggestions}