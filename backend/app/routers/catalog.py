from fastapi import APIRouter, Query
import httpx
import os

router = APIRouter(prefix="/catalog")

RAWG_API_KEY = os.getenv("RAWG_API_KEY")

@router.get("/books")
async def search_books(q: str = Query(...)):
    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://www.googleapis.com/books/v1/volumes",
            params={"q": q, "maxResults": 20}
        )
    data = response.json()
    books = []
    for item in data.get("items", []):
        info = item.get("volumeInfo", {})
        books.append({
            "id": item.get("id"),
            "title": info.get("title", "Unknown"),
            "authors": info.get("authors", []),
            "description": info.get("description", ""),
            "genre": info.get("categories", []),
            "cover": info.get("imageLinks", {}).get("thumbnail", None),
            "year": info.get("publishedDate", "")[:4] if info.get("publishedDate") else None,
            "type": "book"
        })
    return books

@router.get("/games")
async def search_games(q: str = Query(...)):
    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://api.rawg.io/api/games",
            params={"key": RAWG_API_KEY, "search": q, "page_size": 20}
        )
    data = response.json()
    games = []
    for item in data.get("results", []):
        games.append({
            "id": str(item.get("id")),
            "title": item.get("name", "Unknown"),
            "description": item.get("description", ""),
            "genre": [g["name"] for g in item.get("genres", [])],
            "cover": item.get("background_image", None),
            "year": str(item.get("released", ""))[:4] if item.get("released") else None,
            "type": "game"
        })
    return games