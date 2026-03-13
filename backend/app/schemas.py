from pydantic import BaseModel, ConfigDict
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
    model_config = ConfigDict(from_attributes=True)


class SuggestionBase(BaseModel):
    title: str
    type: str
    description: Optional[str] = None

class SuggestionCreate(SuggestionBase):
    pass

class Suggestion(SuggestionBase):
    id: int
    user_id: int
    model_config = ConfigDict(from_attributes=True)


class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_admin: bool
    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str

class SongBase(BaseModel):
    title: str
    artist: str
    cover_url: Optional[str] = None
    link: Optional[str] = None
    year: Optional[int] = None
    rank: Optional[int] = None
    list_type: str

class SongCreate(SongBase):
    pass

class Song(SongBase):
    id: int
    user_id: int
    model_config = ConfigDict(from_attributes=True)