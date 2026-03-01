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
    # Get all completed items
    items = crud.get_items(db)
    items_text = "\n".join([f"- {item.name} ({item.type})" for item in items])

    prompt = f"""Based on these completed books and games:
{items_text}

Suggest 5 similar books or games the user might enjoy. 
For each suggestion give: title, type (book or game), and a one sentence description.
Format each as: Title | type | description"""

    ollama_url = os.getenv("OLLAMA_URL", "http://localhost:11434")

    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            f"{ollama_url}/api/generate",
            json={
                "model": "llama3",
                "prompt": prompt,
                "stream": False
            }
        )

    result = response.json()["response"]

    # Parse the response into suggestions
    suggestions = []
    for line in result.strip().split("\n"):
        parts = line.split("|")
        if len(parts) == 3:
            suggestions.append({
                "title": parts[0].strip(),
                "type": parts[1].strip(),
                "description": parts[2].strip()
            })

    return suggestions