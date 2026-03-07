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
    user_id: int

    class Config:
        from_attributes = True


class SuggestionBase(BaseModel):
    title: str
    type: str
    description: Optional[str] = None

class SuggestionCreate(SuggestionBase):
    pass

class Suggestion(SuggestionBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True


class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_admin: bool

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str