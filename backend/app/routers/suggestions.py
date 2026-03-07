from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import crud, schemas, models
from ..auth_utils import get_db, get_current_user
import httpx
import os

router = APIRouter()

@router.get("/suggestions/", response_model=list[schemas.Suggestion])
def read_suggestions(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.get_suggestions(db, user_id=current_user.id)

@router.post("/suggestions/", response_model=schemas.Suggestion)
def add_suggestion(suggestion: schemas.SuggestionCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.create_suggestion(db, suggestion, user_id=current_user.id)

@router.post("/suggestions/ai")
async def get_ai_suggestions(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    items = crud.get_items(db, user_id=current_user.id)

    if not items:
        return {"intro": "Add some completed items first!", "suggestions": []}

    items_text = "\n".join([f"- {item.name} ({item.type})" for item in items])

    prompt = f"""Ты персональный рекомендатор книг и игр.

Пользователь уже завершил следующие книги и игры:
{items_text}

Основываясь на его вкусах и предпочтениях, порекомендуй 5 книг или игр которые ему понравятся.
Начни ответ с короткой фразой о его вкусах, например: "Судя по вашим предпочтениям, вам нравятся..."
Затем дай 5 рекомендаций.

Для каждой рекомендации используй формат: Title | type | description
Где type это "book" или "game", а description — одно предложение почему это ему подойдёт."""

    ollama_url = os.getenv("OLLAMA_URL", "http://localhost:11434")

    async with httpx.AsyncClient(timeout=300.0) as client:
        response = await client.post(
            f"{ollama_url}/api/generate",
            json={"model": "llama3", "prompt": prompt, "stream": False}
        )
    data = response.json()
    print("Ollama response:", data)  # temporary debug log

    if "response" not in data:
        return {"intro": f"Ollama error: {data}", "suggestions": []}


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