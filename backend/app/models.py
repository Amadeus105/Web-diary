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

