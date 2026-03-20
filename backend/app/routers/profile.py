from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import crud, schemas, models
from ..auth_utils import get_db, get_current_user

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