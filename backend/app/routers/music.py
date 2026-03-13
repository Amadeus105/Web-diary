from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from .. import crud, schemas, models
from ..auth_utils import get_db, get_current_user

router = APIRouter(prefix="/music")

@router.get("/", response_model=list[schemas.Song])
def get_songs(
    list_type: str,
    year: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return crud.get_songs(db, user_id=current_user.id, list_type=list_type, year=year)

@router.post("/", response_model=schemas.Song)
def add_song(
    song: schemas.SongCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return crud.create_song(db, song, user_id=current_user.id)

@router.delete("/{song_id}")
def remove_song(
    song_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    song = crud.delete_song(db, song_id, user_id=current_user.id)
    if not song:
        raise HTTPException(status_code=404, detail="Song not found")
    return {"message": "Song deleted"}