from pydantic import BaseModel
from typing import Optional
from datetime import date

class ItemBase(BaseModel):
    name: str
    type: str
    finished_date: Optional[date] = None
    rating: Optional[int] = None
    notes: Optional[str] = None

class ItemCreate(ItemBase):
    pass

class Item(ItemBase):
    id: int

    class Config:
        orm_mode = True

