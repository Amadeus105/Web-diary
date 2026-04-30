from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import crud, schemas, models
from ..auth_utils import get_db, get_current_user
from typing import Optional
import csv
import io
from fastapi.responses import StreamingResponse

router = APIRouter()


def _write_activity(db: Session, user_id: int, item: models.Item):
    """Record item creation in activity feed."""
    action = "wishlist" if item.status == "wishlist" else "completed"
    entry = models.ActivityFeed(
        user_id=user_id,
        action_type=action,
        item_name=item.name,
        item_type=item.type,
        item_cover=item.cover_url,
        rating=item.rating,
    )
    db.add(entry)
    db.commit()


@router.get("/items/", response_model=list[schemas.Item])
def read_items(
    type: Optional[str] = None,
    limit: Optional[int] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return crud.get_items(db, user_id=current_user.id, type=type, limit=limit, status=status)


@router.post("/items/", response_model=schemas.Item)
def add_item(
    item: schemas.ItemCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    created = crud.create_item(db, item, user_id=current_user.id)
    _write_activity(db, current_user.id, created)
    return created


@router.delete("/items/{item_id}")
def delete_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    item = crud.delete_item(db, item_id, user_id=current_user.id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"message": "Item deleted"}


@router.put("/items/{item_id}", response_model=schemas.Item)
def update_item(
    item_id: int,
    item: schemas.ItemUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    updated = crud.update_item(db, item_id, item, user_id=current_user.id)
    if not updated:
        raise HTTPException(status_code=404, detail="Item not found")
    return updated


@router.patch("/items/{item_id}/complete", response_model=schemas.Item)
def mark_complete(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    item = crud.update_item(
        db, item_id,
        schemas.ItemUpdate(status="completed"),
        user_id=current_user.id
    )
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    # Write "completed" activity
    entry = models.ActivityFeed(
        user_id=current_user.id,
        action_type="completed",
        item_name=item.name,
        item_type=item.type,
        item_cover=item.cover_url,
        rating=item.rating,
    )
    db.add(entry)
    db.commit()
    return item

@router.get("/items/export")
def export_items(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    items = db.query(models.Item).filter(
        models.Item.user_id == current_user.id
    ).order_by(models.Item.id.desc()).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Name", "Type", "Status", "Rating", "Finished Date", "Notes"])
    for item in items:
        writer.writerow([
            item.name,
            item.type,
            item.status,
            item.rating or "",
            item.finished_date or "",
            item.notes or "",
        ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=my_diary.csv"}
    )