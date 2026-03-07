from sqlalchemy.orm import Session
from . import models, schemas


def get_items(db: Session, user_id: int):
    return db.query(models.Item).filter(models.Item.user_id == user_id).all()


def create_item(db: Session, item: schemas.ItemCreate, user_id: int):
    db_item = models.Item(**item.dict(), user_id=user_id)
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
    db_suggestion = models.Suggestion(**suggestion.dict(), user_id=user_id)
    db.add(db_suggestion)
    db.commit()
    db.refresh(db_suggestion)
    return db_suggestion