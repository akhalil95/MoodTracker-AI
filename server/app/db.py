from sqlmodel import SQLModel, Field, create_engine, Session
from typing import Optional
from datetime import date

DATABASE_URL = "sqlite:///./mood.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

class Entry(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    date: date
    mood: int
    sleep_hours: float
    steps: int
    workouts: int
    caffeine: int
    meals: int
    work_hours: float
    screen_time: int
    journal: str = ""
    tags: str = "[]"

def init_db():
    SQLModel.metadata.create_all(engine)

def get_session() -> Session:
    return Session(engine)
