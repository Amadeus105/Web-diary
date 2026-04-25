from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import date, datetime


# ── Items ────────────────────────────────────────────────────
class ItemBase(BaseModel):
    name: str
    type: str
    finished_date: Optional[date] = None
    rating: Optional[int] = None
    notes: Optional[str] = None
    cover_url: Optional[str] = None
    status: Optional[str] = "completed"

class ItemCreate(ItemBase):
    pass

class ItemUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    finished_date: Optional[date] = None
    rating: Optional[int] = None
    notes: Optional[str] = None
    cover_url: Optional[str] = None
    status: Optional[str] = None

class Item(ItemBase):
    id: int
    user_id: int
    model_config = ConfigDict(from_attributes=True)


# ── Suggestions ──────────────────────────────────────────────
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


# ── Auth / Users ─────────────────────────────────────────────
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


# ── Songs ────────────────────────────────────────────────────
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


# ── Profile ──────────────────────────────────────────────────
class ProfileBase(BaseModel):
    name: Optional[str] = None
    title: Optional[str] = None
    handle: Optional[str] = None
    status: Optional[str] = None
    avatar_url: Optional[str] = None
    github_url: Optional[str] = None

class ProfileCreate(ProfileBase):
    pass

class Profile(ProfileBase):
    id: int
    user_id: int
    model_config = ConfigDict(from_attributes=True)


# ── Friendships ──────────────────────────────────────────────
class FriendshipOut(BaseModel):
    id: int
    requester_id: int
    addressee_id: int
    status: str
    created_at: datetime
    # enriched fields added in router
    username: Optional[str] = None
    avatar_url: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)


# ── Messages ─────────────────────────────────────────────────
class MessageCreate(BaseModel):
    receiver_id: int
    content: str

class MessageOut(BaseModel):
    id: int
    sender_id: int
    receiver_id: int
    content: str
    is_read: bool
    created_at: datetime
    sender_username: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)


# ── Activity Feed ─────────────────────────────────────────────
class ActivityOut(BaseModel):
    id: int
    user_id: int
    username: Optional[str] = None
    avatar_url: Optional[str] = None
    action_type: str
    item_name: str
    item_type: str
    item_cover: Optional[str] = None
    rating: Optional[int] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


# ── Public profile ───────────────────────────────────────────
class PublicProfile(BaseModel):
    user_id: int
    username: str
    name: Optional[str] = None
    avatar_url: Optional[str] = None
    title: Optional[str] = None
    handle: Optional[str] = None
    is_private: bool = False
    items: Optional[List[Item]] = None
    model_config = ConfigDict(from_attributes=True)