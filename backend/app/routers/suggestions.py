from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from .. import crud, models
from ..auth_utils import get_db, get_current_user
from pydantic import BaseModel
import httpx
import os

router = APIRouter()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")


# ── Shared helper ────────────────────────────────────────────
async def call_openrouter(prompt: str, max_tokens: int = 500) -> str:
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": "google/gemma-3-4b-it:free",
                "messages": [{"role": "user", "content": prompt}],
                "max_tokens": max_tokens
            }
        )
    data = response.json()
    if "choices" not in data:
        raise HTTPException(status_code=500, detail=f"OpenRouter error: {data}")
    return data["choices"][0]["message"]["content"]


# ── AI Recommendations ───────────────────────────────────────
@router.post("/suggestions/ai")
async def get_ai_suggestions(
    filter_type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    items = crud.get_items(db, user_id=current_user.id)

    if not items:
        return {"intro": "Add some completed items first!", "suggestions": []}

    if filter_type and filter_type != "both":
        items = [i for i in items if i.type.lower() == filter_type.lower()]

    if not items:
        return {"intro": f"No {filter_type}s in your completed list yet!", "suggestions": []}

    items_text = "\n".join([f"- {item.name} ({item.type})" for item in items])

    if filter_type == "book":
        request_type = "5 books"
    elif filter_type == "game":
        request_type = "5 games"
    else:
        request_type = "3 books and 3 games"

    prompt = f"""Based on these completed items:
{items_text}

Recommend {request_type} the user would enjoy based on their taste.
Start with one sentence about their preferences.
Then list recommendations in this exact format on separate lines:
Title | type | one sentence why they would like it

Where type is exactly "book" or "game"."""

    result = await call_openrouter(prompt, max_tokens=500)
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
        elif line.strip() and not intro and "|" not in line:
            intro = line.strip()

    return {"intro": intro, "suggestions": suggestions}


# ── Plot Lookup ──────────────────────────────────────────────
class PlotRequest(BaseModel):
    title: str
    media_type: str   # "book" | "game" | "movie"
    language: str     # "english" | "russian" | "kazakh"


PROMPTS = {
    "english": {
        "book":  lambda t: f'Write a short spoiler-free plot summary (3-5 sentences) for the book "{t}". No ending, no major twists. Describe the setting, main character and what the story is about at the start. Reply in English only. No preamble.',
        "game":  lambda t: f'Write a short spoiler-free plot summary (3-5 sentences) for the video game "{t}". No ending, no major twists. Describe the setting, main character and what the story is about at the start. Reply in English only. No preamble.',
        "movie": lambda t: f'Write a short spoiler-free plot summary (3-5 sentences) for the movie "{t}". No ending, no major twists. Describe the setting, main character and what the story is about at the start. Reply in English only. No preamble.',
    },
    "russian": {
        "book":  lambda t: f'Напиши короткий пересказ книги "{t}" без спойлеров (3-5 предложений). Не раскрывай концовку и ключевые повороты сюжета. Опиши сеттинг, главного героя и завязку сюжета. Отвечай ТОЛЬКО на русском языке. Без вводных слов.',
        "game":  lambda t: f'Напиши короткий пересказ видеоигры "{t}" без спойлеров (3-5 предложений). Не раскрывай концовку и ключевые повороты сюжета. Опиши сеттинг, главного героя и завязку сюжета. Отвечай ТОЛЬКО на русском языке. Без вводных слов.',
        "movie": lambda t: f'Напиши короткий пересказ фильма "{t}" без спойлеров (3-5 предложений). Не раскрывай концовку и ключевые повороты сюжета. Опиши сеттинг, главного героя и завязку сюжета. Отвечай ТОЛЬКО на русском языке. Без вводных слов.',
    },
    "kazakh": {
        "book":  lambda t: f'"{t}" кітабының спойлерсіз қысқаша мазмұнын жаз (3-5 сөйлем). Соңын және негізгі бұрылыстарды ашпа. Кейіпкерді, оқиға орнын және сюжеттің басын сипатта. ТЕК қазақ тілінде жауап бер. Кіріспесіз.',
        "game":  lambda t: f'"{t}" видеойынының спойлерсіз қысқаша мазмұнын жаз (3-5 сөйлем). Соңын және негізгі бұрылыстарды ашпа. Кейіпкерді, оқиға орнын және сюжеттің басын сипатта. ТЕК қазақ тілінде жауап бер. Кіріспесіз.',
        "movie": lambda t: f'"{t}" фильмінің спойлерсіз қысқаша мазмұнын жаз (3-5 сөйлем). Соңын және негізгі бұрылыстарды ашпа. Кейіпкерді, оқиға орнын және сюжеттің басын сипатта. ТЕК қазақ тілінде жауап бер. Кіріспесіз.',
    },
}


@router.post("/suggestions/plot")
async def get_plot(
    body: PlotRequest,
    current_user: models.User = Depends(get_current_user)
):
    lang    = body.language   if body.language   in PROMPTS            else "english"
    media   = body.media_type if body.media_type in PROMPTS["english"] else "book"
    prompt  = PROMPTS[lang][media](body.title)

    summary = await call_openrouter(prompt, max_tokens=300)
    return {"title": body.title, "summary": summary.strip()}