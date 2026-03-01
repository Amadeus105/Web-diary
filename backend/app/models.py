from sqlalchemy import Column, Integer, String, Date
from .database import Base


class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)
    finished_date = Column(Date, nullable=True)
    rating = Column(Integer, nullable=True)
    notes = Column(String, nullable=True)

class Suggestion(Base):
    __tablename__ = "suggestions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    type = Column(String, nullable=False)  # "book" or "game"
    description = Column(String, nullable=True)
