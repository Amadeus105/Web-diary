from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from .. import crud, models
from ..auth_utils import get_db, get_current_user
import httpx
import os

router = APIRouter()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

@router.post("/suggestions/ai")
async def get_ai_suggestions(
    filter_type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    items = crud.get_items(db, user_id=current_user.id)

    if not items:
        return {"intro": "Add some completed items first!", "suggestions": []}

    # Filter by type if specified
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
                "max_tokens": 500
            }
        )

    data = response.json()
    print("OpenRouter response:", data)  # add this

    if "choices" not in data:
        raise HTTPException(status_code=500, detail=f"OpenRouter error: {data}")

    result = data["choices"][0]["message"]["content"]
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