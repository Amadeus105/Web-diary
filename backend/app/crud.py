from sqlalchemy.orm import Session
from . import models, schemas


def get_items(db: Session, user_id: int, type: str = None, limit: int = None):
    query = db.query(models.Item).filter(models.Item.user_id == user_id)
    if type:
        query = query.filter(models.Item.type == type)
    query = query.order_by(models.Item.id.desc())
    if limit:
        query = query.limit(limit)
    return query.all()

def create_item(db: Session, item: schemas.ItemCreate, user_id: int):
    db_item = models.Item(**item.model_dump(), user_id=user_id)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


def delete_item(db: Session, item_id: int, user_id: int):
    item = db.query(models.Item).filter(
        models.Item.id == item_id,
        models.Item.user_id == user_id
    ).first()
    if not item:
        return None
    db.delete(item)
    db.commit()
    return item


def update_item(db: Session, item_id: int, item_data: schemas.ItemCreate, user_id: int):
    item = db.query(models.Item).filter(
        models.Item.id == item_id,
        models.Item.user_id == user_id
    ).first()
    if not item:
        return None
    item.name = item_data.name
    item.type = item_data.type
    item.finished_date = item_data.finished_date
    item.rating = item_data.rating
    item.notes = item_data.notes
    db.commit()
    db.refresh(item)
    return item


def get_suggestions(db: Session, user_id: int):
    return db.query(models.Suggestion).filter(models.Suggestion.user_id == user_id).all()


def create_suggestion(db: Session, suggestion: schemas.SuggestionCreate, user_id: int):
    db_suggestion = models.Suggestion(**suggestion.model_dump(), user_id=user_id)
    db.add(db_suggestion)
    db.commit()
    db.refresh(db_suggestion)
    return db_suggestion

def get_songs(db: Session, user_id: int, list_type: str, year: int = None):
    query = db.query(models.Song).filter(
        models.Song.user_id == user_id,
        models.Song.list_type == list_type
    )
    if year:
        query = query.filter(models.Song.year == year)
    return query.order_by(models.Song.rank).all()

def create_song(db: Session, song: schemas.SongCreate, user_id: int):
    db_song = models.Song(**song.model_dump(), user_id=user_id)
    db.add(db_song)
    db.commit()
    db.refresh(db_song)
    return db_song

def delete_song(db: Session, song_id: int, user_id: int):
    song = db.query(models.Song).filter(
        models.Song.id == song_id,
        models.Song.user_id == user_id
    ).first()
    if not song:
        return None
    db.delete(song)
    db.commit()
    return song

def get_profile(db: Session, user_id: int):
    return db.query(models.UserProfile).filter(
        models.UserProfile.user_id == user_id
    ).first()

def upsert_profile(db: Session, user_id: int, profile_data: schemas.ProfileCreate):
    profile = db.query(models.UserProfile).filter(
        models.UserProfile.user_id == user_id
    ).first()
    if profile:
        for key, value in profile_data.model_dump().items():
            setattr(profile, key, value)
    else:
        profile = models.UserProfile(**profile_data.model_dump(), user_id=user_id)
        db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile