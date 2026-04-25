from sqlalchemy import Column, Integer, String, Date, Boolean, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_admin = Column(Boolean, default=False)
    is_private = Column(Boolean, default=False, server_default="false")
    telegram_id = Column(String, nullable=True, unique=True)

    items       = relationship("Item",        back_populates="owner")
    suggestions = relationship("Suggestion",  back_populates="owner")
    songs       = relationship("Song",        back_populates="owner")
    profile     = relationship("UserProfile", back_populates="owner", uselist=False)
    activity    = relationship("ActivityFeed", back_populates="owner", cascade="all, delete")

    sent_requests     = relationship("Friendship", foreign_keys="Friendship.requester_id",
                                     back_populates="requester", cascade="all, delete")
    received_requests = relationship("Friendship", foreign_keys="Friendship.addressee_id",
                                     back_populates="addressee", cascade="all, delete")


class Item(Base):
    __tablename__ = "items"

    id            = Column(Integer, primary_key=True, index=True)
    name          = Column(String, nullable=False)
    type          = Column(String, nullable=False)
    finished_date = Column(Date,    nullable=True)
    rating        = Column(Integer, nullable=True)
    notes         = Column(String,  nullable=True)
    cover_url     = Column(String,  nullable=True)
    status        = Column(String,  nullable=False, default="completed", server_default="completed")
    user_id       = Column(Integer, ForeignKey("users.id"), nullable=False)

    owner = relationship("User", back_populates="items")


class Suggestion(Base):
    __tablename__ = "suggestions"

    id          = Column(Integer, primary_key=True, index=True)
    title       = Column(String, nullable=False)
    type        = Column(String, nullable=False)
    description = Column(String, nullable=True)
    user_id     = Column(Integer, ForeignKey("users.id"), nullable=False)

    owner = relationship("User", back_populates="suggestions")


class Song(Base):
    __tablename__ = "songs"

    id        = Column(Integer, primary_key=True, index=True)
    title     = Column(String, nullable=False)
    artist    = Column(String, nullable=False)
    cover_url = Column(String,  nullable=True)
    link      = Column(String,  nullable=True)
    year      = Column(Integer, nullable=True)
    rank      = Column(Integer, nullable=True)
    list_type = Column(String,  nullable=False)
    user_id   = Column(Integer, ForeignKey("users.id"), nullable=False)

    owner = relationship("User", back_populates="songs")


class UserProfile(Base):
    __tablename__ = "profiles"

    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    name       = Column(String, nullable=True)
    title      = Column(String, nullable=True)
    handle     = Column(String, nullable=True)
    status     = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    github_url = Column(String, nullable=True)

    owner = relationship("User", back_populates="profile")


class Friendship(Base):
    __tablename__ = "friendships"

    id           = Column(Integer, primary_key=True, index=True)
    requester_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    addressee_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status       = Column(String, nullable=False, default="pending")  # pending | accepted
    created_at   = Column(DateTime(timezone=True), server_default=func.now())

    requester = relationship("User", foreign_keys=[requester_id], back_populates="sent_requests")
    addressee = relationship("User", foreign_keys=[addressee_id], back_populates="received_requests")


class Message(Base):
    __tablename__ = "messages"

    id          = Column(Integer, primary_key=True, index=True)
    sender_id   = Column(Integer, ForeignKey("users.id"), nullable=False)
    receiver_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content     = Column(Text,    nullable=False)
    is_read     = Column(Boolean, default=False)
    created_at  = Column(DateTime(timezone=True), server_default=func.now())

    sender   = relationship("User", foreign_keys=[sender_id])
    receiver = relationship("User", foreign_keys=[receiver_id])


class ActivityFeed(Base):
    __tablename__ = "activity_feed"

    id          = Column(Integer, primary_key=True, index=True)
    user_id     = Column(Integer, ForeignKey("users.id"), nullable=False)
    action_type = Column(String, nullable=False)  # "completed" | "wishlist" | "rated"
    item_name   = Column(String, nullable=False)
    item_type   = Column(String, nullable=False)  # "game" | "book"
    item_cover  = Column(String, nullable=True)
    rating      = Column(Integer, nullable=True)
    created_at  = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User", back_populates="activity")