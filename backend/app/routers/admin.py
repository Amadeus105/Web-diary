from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas
from ..auth_utils import get_admin_user, get_db

router = APIRouter(prefix="/admin")


@router.get("/users", response_model=list[schemas.User])
def get_all_users(db: Session = Depends(get_db), _=Depends(get_admin_user)):
    return db.query(models.User).all()


@router.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), _=Depends(get_admin_user)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
    return {"message": "User deleted"}


@router.get("/items", response_model=list[schemas.Item])
def get_all_items(db: Session = Depends(get_db), _=Depends(get_admin_user)):
    return db.query(models.Item).all()


@router.delete("/items/{item_id}")
def delete_any_item(item_id: int, db: Session = Depends(get_db), _=Depends(get_admin_user)):
    item = db.query(models.Item).filter(models.Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(item)
    db.commit()
    return {"message": "Item deleted"}