from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .database import engine, SessionLocal, Base
from . import models, schemas, crud

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/items/", response_model=list[schemas.Item])
def read_items(db: Session = Depends(get_db)):
    return crud.get_items(db)

@app.post("/items/", response_model=schemas.Item)
def add_item(item: schemas.ItemCreate, db: Session = Depends(get_db)):
    return crud.create_item(db, item)

@app.delete("/items/{item_id}")
def delete_item(item_id: int, db: Session = Depends(get_db)):
    item = crud.delete_item(db, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"message": "Item deleted"}

@app.put("/items/{item_id}", response_model=schemas.Item)
def update_item(
    item_id: int,
    item: schemas.ItemCreate,
    db: Session = Depends(get_db),
):
    updated_item = crud.update_item(db, item_id, item)
    if not updated_item:
        raise HTTPException(status_code=404, detail="Item not found")
    return updated_item
