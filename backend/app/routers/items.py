from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import crud, schemas, models
from ..auth_utils import get_db, get_current_user
from typing import Optional

router = APIRouter()


@router.get("/items/", response_model=list[schemas.Item])
def read_items(
    type: Optional[str] = None,
    limit: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return crud.get_items(db, user_id=current_user.id, type=type, limit=limit)

@router.post("/items/", response_model=schemas.Item)
def add_item(item: schemas.ItemCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.create_item(db, item, user_id=current_user.id)


@router.delete("/items/{item_id}")
def delete_item(item_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    item = crud.delete_item(db, item_id, user_id=current_user.id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"message": "Item deleted"}


@router.put("/items/{item_id}", response_model=schemas.Item)
def update_item(item_id: int, item: schemas.ItemCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    updated_item = crud.update_item(db, item_id, item, user_id=current_user.id)
    if not updated_item:
        raise HTTPException(status_code=404, detail="Item not found")
    return updated_item