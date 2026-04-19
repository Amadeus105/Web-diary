from sqlalchemy import Column, Integer, String, Date, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_admin = Column(Boolean, default=False)
    telegram_id = Column(String, nullable=True, unique=True)

    items = relationship("Item", back_populates="owner")
    suggestions = relationship("Suggestion", back_populates="owner")
    songs = relationship("Song", back_populates="owner")
    profile = relationship("UserProfile", back_populates="owner", uselist=False)


class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)
    finished_date = Column(Date, nullable=True)
    rating = Column(Integer, nullable=True)
    notes = Column(String, nullable=True)
    cover_url = Column(String, nullable=True)
    # "completed" or "wishlist"
    status = Column(String, nullable=False, default="completed", server_default="completed")
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    owner = relationship("User", back_populates="items")


class Suggestion(Base):
    __tablename__ = "suggestions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    type = Column(String, nullable=False)
    description = Column(String, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    owner = relationship("User", back_populates="suggestions")


class Song(Base):
    __tablename__ = "songs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    artist = Column(String, nullable=False)
    cover_url = Column(String, nullable=True)
    link = Column(String, nullable=True)
    year = Column(Integer, nullable=True)
    rank = Column(Integer, nullable=True)
    list_type = Column(String, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    owner = relationship("User", back_populates="songs")


class UserProfile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    name = Column(String, nullable=True)
    title = Column(String, nullable=True)
    handle = Column(String, nullable=True)
    status = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    github_url = Column(String, nullable=True)

    owner = relationship("User", back_populates="profile")