from fastapi import APIRouter, Query
import httpx
import os

router = APIRouter(prefix="/catalog")

RAWG_API_KEY        = os.getenv("RAWG_API_KEY")
GOOGLE_BOOKS_API_KEY = os.getenv("GOOGLE_BOOKS_API_KEY")
TMDB_API_KEY        = os.getenv("TMDB_API_KEY")

@router.get("/books")
async def search_books(q: str = Query(...)):
    params = {"q": q, "maxResults": 20}
    if GOOGLE_BOOKS_API_KEY:
        params["key"] = GOOGLE_BOOKS_API_KEY

    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://www.googleapis.com/books/v1/volumes",
            params=params
        )
    data = response.json()

    if "items" not in data:
        return []

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


# ── Movies ───────────────────────────────────────────────────
@router.get("/movies")
async def search_movies(q: str = Query(...)):
    if not TMDB_API_KEY:
        return []
    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://api.themoviedb.org/3/search/movie",
            params={"api_key": TMDB_API_KEY, "query": q, "language": "en-US", "page": 1}
        )
    data = response.json()
    results = []
    for item in data.get("results", [])[:20]:
        poster = item.get("poster_path")
        results.append({
            "id": str(item.get("id")),
            "title": item.get("title", "Unknown"),
            "description": item.get("overview", ""),
            "cover": f"https://image.tmdb.org/t/p/w500{poster}" if poster else None,
            "year": str(item.get("release_date", ""))[:4] if item.get("release_date") else None,
            "type": "movie"
        })
    return results


# ── Cartoons ─────────────────────────────────────────────────
@router.get("/cartoons")
async def search_cartoons(q: str = Query(...)):
    if not TMDB_API_KEY:
        return []
    # Search movies with animation genre (16) — covers cartoons
    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://api.themoviedb.org/3/search/movie",
            params={
                "api_key": TMDB_API_KEY, "query": q,
                "language": "en-US", "page": 1,
                "with_genres": "16"
            }
        )
    data = response.json()
    # Also search TV animation
    async with httpx.AsyncClient() as client:
        tv_response = await client.get(
            "https://api.themoviedb.org/3/search/tv",
            params={
                "api_key": TMDB_API_KEY, "query": q,
                "language": "en-US", "page": 1
            }
        )
    tv_data = tv_response.json()

    results = []
    for item in data.get("results", [])[:10]:
        poster = item.get("poster_path")
        results.append({
            "id": f"movie-{item.get('id')}",
            "title": item.get("title", "Unknown"),
            "description": item.get("overview", ""),
            "cover": f"https://image.tmdb.org/t/p/w500{poster}" if poster else None,
            "year": str(item.get("release_date", ""))[:4] if item.get("release_date") else None,
            "type": "cartoon"
        })
    for item in tv_data.get("results", [])[:10]:
        poster = item.get("poster_path")
        results.append({
            "id": f"tv-{item.get('id')}",
            "title": item.get("name", "Unknown"),
            "description": item.get("overview", ""),
            "cover": f"https://image.tmdb.org/t/p/w500{poster}" if poster else None,
            "year": str(item.get("first_air_date", ""))[:4] if item.get("first_air_date") else None,
            "type": "cartoon"
        })
    return results[:20]


# ── Anime ─────────────────────────────────────────────────────
@router.get("/anime")
async def search_anime(q: str = Query(...)):
    # AniList GraphQL API — free, no key needed
    query = """
    query ($search: String) {
      Page(perPage: 20) {
        media(search: $search, type: ANIME) {
          id
          title { romaji english }
          description(asHtml: false)
          coverImage { large }
          seasonYear
        }
      }
    }
    """
    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.post(
            "https://graphql.anilist.co",
            json={"query": query, "variables": {"search": q}},
            headers={"Content-Type": "application/json"}
        )
    data = response.json()
    results = []
    for item in data.get("data", {}).get("Page", {}).get("media", []):
        title = item.get("title", {})
        results.append({
            "id": str(item.get("id")),
            "title": title.get("english") or title.get("romaji") or "Unknown",
            "description": item.get("description") or "",
            "cover": item.get("coverImage", {}).get("large"),
            "year": str(item.get("seasonYear")) if item.get("seasonYear") else None,
            "type": "anime"
        })
    return results