from pydantic import BaseModel, Field
from datetime import date
from typing import List, Dict

class EntryCreate(BaseModel):
    date: date
    mood: int = Field(ge=1, le=10)
    sleep_hours: float
    steps: int
    workouts: int
    caffeine: int
    meals: int
    work_hours: float
    screen_time: int
    journal: str = ""
    tags: List[str] = []

class EntryRead(EntryCreate):
    id: int

class SummaryResponse(BaseModel):
    avg_mood: float
    delta_vs_prev: float
    corr: Dict[str, float]
    weekly_averages: List[Dict[str, float]]

class PredictResponse(BaseModel):
    predicted_mood: float
    features_used: List[str]

class ClusterSummary(BaseModel):
    name: str
    days: int
    centroid: Dict[str, float]

class ClustersResponse(BaseModel):
    k: int
    clusters: List[ClusterSummary]
    assignments: List[Dict[str, str]]

class InsightResponse(BaseModel):
    summary: str
    recommendations: List[str]
