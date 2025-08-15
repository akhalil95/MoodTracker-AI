from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import select
from datetime import date
import json

from .db import init_db, get_session, Entry
from .schemas import (
    EntryCreate, EntryRead, SummaryResponse, PredictResponse,
    ClustersResponse, InsightResponse
)
from .analytics import correlations, weekly_averages
from .ml import retrain, predict, clusters, insight_summary

app = FastAPI(title="MoodTracker AI API")

# CORS: allow Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"^http://(localhost|127\.0\.0\.1):\d+$",
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=False,  # set False so we can use wildcard origins safely
)

@app.on_event("startup")
def on_startup():
    init_db()

# ---- CRUD ----
@app.post("/entries", response_model=EntryRead)
def create_entry(payload: EntryCreate):
    with get_session() as s:
        exists = s.exec(select(Entry).where(Entry.date == payload.date)).first()
        if exists:
            raise HTTPException(status_code=409, detail="Entry for this date already exists.")
        # EXCLUDE 'tags' so don't pass it twice
        base = payload.model_dump(exclude={"tags"})  # if using Pydantic v2
        # base = payload.dict(exclude={"tags"})      # if on Pydantic v1, use this instead
        e = Entry(**base, tags=json.dumps(payload.tags))
        s.add(e); s.commit(); s.refresh(e)
        return EntryRead(**payload.model_dump(), id=e.id)  # or payload.dict() on v1


@app.get("/entries", response_model=list[EntryRead])
def list_entries(
    from_date: date | None = Query(None, alias="from"),
    to_date: date | None = Query(None, alias="to")
):
    with get_session() as s:
        rows = s.exec(select(Entry).order_by(Entry.date)).all()
        out = []
        for r in rows:
            if from_date and r.date < from_date: continue
            if to_date and r.date > to_date: continue
            out.append(EntryRead(
                id=r.id, date=r.date, mood=r.mood, sleep_hours=r.sleep_hours,
                steps=r.steps, workouts=r.workouts, caffeine=r.caffeine,
                meals=r.meals, work_hours=r.work_hours, screen_time=r.screen_time,
                journal=r.journal, tags=json.loads(r.tags or "[]")
            ))
        return out

@app.put("/entries/{entry_id}", response_model=EntryRead)
def update_entry(entry_id: int, payload: EntryCreate):
    with get_session() as s:
        e = s.get(Entry, entry_id)
        if not e: raise HTTPException(status_code=404, detail="Not found")
        for k, v in payload.dict().items():
            setattr(e, k, json.dumps(v) if k == "tags" else v)
        s.add(e); s.commit(); s.refresh(e)
        return EntryRead(**payload.dict(), id=e.id)

@app.delete("/entries/{entry_id}")
def delete_entry(entry_id: int):
    with get_session() as s:
        e = s.get(Entry, entry_id)
        if not e: raise HTTPException(status_code=404, detail="Not found")
        s.delete(e); s.commit()
        return {"ok": True}

# ---- Analytics ----
@app.get("/analytics/summary", response_model=SummaryResponse)
def summary(
    from_date: date | None = Query(None, alias="from"),
    to_date: date | None = Query(None, alias="to")
):
    # reuse list_entries to keep date filtering consistent
    entries = list_entries(from_date, to_date)
    rows = [e.dict() for e in entries]
    if not rows:
        return SummaryResponse(avg_mood=0.0, delta_vs_prev=0.0, corr={}, weekly_averages=[])
    avg = sum(r["mood"] for r in rows) / len(rows)
    return SummaryResponse(
        avg_mood=round(avg, 2),
        delta_vs_prev=0.0,  # placeholder delta vs previous window
        corr=correlations(rows),
        weekly_averages=weekly_averages(rows)
    )

@app.get("/analytics/insights", response_model=InsightResponse)
def insights():
    return InsightResponse(**insight_summary())

# ---- ML ----
@app.post("/ml/retrain")
def ml_retrain():
    return retrain()

@app.get("/ml/predict", response_model=PredictResponse)
def ml_predict(date: str | None = None):
    return PredictResponse(**predict(date))

@app.get("/ml/clusters", response_model=ClustersResponse)
def ml_clusters():
    return ClustersResponse(**clusters())
