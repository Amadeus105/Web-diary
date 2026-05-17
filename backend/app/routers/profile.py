from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import crud, schemas, models
from ..auth_utils import get_db, get_current_user
from typing import List

router = APIRouter(prefix="/profile")

@router.get("/", response_model=schemas.Profile)
def get_profile(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    profile = crud.get_profile(db, user_id=current_user.id)
    if not profile:
        return schemas.Profile(id=0, user_id=current_user.id)
    return profile

@router.post("/", response_model=schemas.Profile)
def save_profile(
    profile: schemas.ProfileCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return crud.upsert_profile(db, user_id=current_user.id, profile_data=profile)

import json

@router.patch("/song-of-day")
def set_song_of_day(
    payload: dict,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    profile = crud.get_profile(db, user_id=current_user.id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    profile.song_of_day = json.dumps(payload)
    db.commit()
    return {"message": "ok"}


@router.patch("/hidden-categories")
def set_hidden_categories(
    payload: dict,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """payload: { "categories": ["movie", "anime"] }"""
    profile = crud.get_profile(db, user_id=current_user.id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    categories = payload.get("categories", [])
    profile.hidden_categories = json.dumps(categories)
    db.commit()
    return {"hidden_categories": categories}