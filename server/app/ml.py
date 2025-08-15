from __future__ import annotations
from typing import List, Dict, Tuple
from sqlmodel import select
from datetime import datetime
from pathlib import Path
import json
import math

import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
from sklearn.ensemble import RandomForestRegressor
from joblib import dump, load

from .db import get_session, Entry
from .analytics import correlations

MODELS_DIR = Path(__file__).parent.parent / "models"
MODELS_DIR.mkdir(parents=True, exist_ok=True)

FEATURES = ["sleep_hours","steps","workouts","caffeine","meals","work_hours","screen_time","weekday"]

def _fetch_rows() -> List[Dict]:
    with get_session() as s:
        data = s.exec(select(Entry).order_by(Entry.date)).all()
        rows = []
        for r in data:
            rows.append({
                "date": r.date.isoformat(),
                "mood": r.mood,
                "sleep_hours": r.sleep_hours,
                "steps": r.steps,
                "workouts": r.workouts,
                "caffeine": r.caffeine,
                "meals": r.meals,
                "work_hours": r.work_hours,
                "screen_time": r.screen_time,
                "weekday": datetime.fromisoformat(r.date.isoformat()).weekday(),  # 0..6
            })
        return rows

def _to_matrix(rows: List[Dict]) -> np.ndarray:
    return np.array([[r[k] for k in FEATURES] for r in rows], dtype=float)

def _train_kmeans(X: np.ndarray) -> Tuple[KMeans, int]:
    best_k, best_score, best_model = 3, -1.0, None
    for k in range(3, 7):
        km = KMeans(n_clusters=k, n_init="auto", random_state=42)
        labels = km.fit_predict(X)
        if len(set(labels)) < 2: 
            continue
        score = silhouette_score(X, labels)
        if score > best_score:
            best_k, best_score, best_model = k, score, km
    return best_model if best_model else KMeans(n_clusters=3, n_init="auto", random_state=42).fit(X), best_k

def _train_regressor(rows: List[Dict], X: np.ndarray) -> RandomForestRegressor:
    # predict mood_{t+1} using X_t
    if len(rows) < 8:  # not enough data
        rf = RandomForestRegressor(random_state=42)
        rf.fit(np.zeros((1, X.shape[1])), np.array([5.0]))
        return rf

    y = np.array([rows[i+1]["mood"] for i in range(len(rows)-1)], dtype=float)
    Xy = X[:-1]

    split = int(len(Xy) * 0.8)
    X_train, y_train = Xy[:split], y[:split]
    rf = RandomForestRegressor(n_estimators=200, random_state=42)
    rf.fit(X_train, y_train)
    return rf

def retrain() -> Dict:
    rows = _fetch_rows()
    if not rows:
        meta = {"message": "no data"}
        (MODELS_DIR / "meta.json").write_text(json.dumps(meta))
        return meta

    X = _to_matrix(rows)
    scaler = StandardScaler().fit(X)
    Xs = scaler.transform(X)

    kmeans, k = _train_kmeans(Xs)
    rf = _train_regressor(rows, Xs)

    dump(scaler, MODELS_DIR / "scaler.joblib")
    dump(kmeans, MODELS_DIR / "kmeans.joblib")
    dump(rf, MODELS_DIR / "mood_rf.joblib")

    meta = {
        "updated_at": datetime.utcnow().isoformat() + "Z",
        "k": k,
        "features": FEATURES,
        "corr": correlations(rows),
    }
    (MODELS_DIR / "meta.json").write_text(json.dumps(meta, indent=2))
    return meta

def _load_or_default():
    try:
        scaler = load(MODELS_DIR / "scaler.joblib")
        kmeans = load(MODELS_DIR / "kmeans.joblib")
        rf = load(MODELS_DIR / "mood_rf.joblib")
        return scaler, kmeans, rf
    except Exception:
        return None, None, None

def predict(date: str | None = None) -> Dict:
    rows = _fetch_rows()
    if not rows:
        return {"predicted_mood": 5.0, "features_used": FEATURES}
    scaler, _, rf = _load_or_default()
    if scaler is None or rf is None:
        # baseline: last 3-day avg
        last3 = [r["mood"] for r in rows[-3:]]
        return {"predicted_mood": round(float(sum(last3)/len(last3)), 2), "features_used": FEATURES}

    X = _to_matrix(rows)
    Xs = scaler.transform(X)
    x_last = Xs[-1].reshape(1, -1)
    y_hat = float(rf.predict(x_last)[0])
    # clamp to 1..10
    y_hat = max(1.0, min(10.0, y_hat))
    return {"predicted_mood": round(y_hat, 2), "features_used": FEATURES}

def clusters() -> Dict:
    rows = _fetch_rows()
    if not rows:
        return {"k": 0, "clusters": [], "assignments": []}
    scaler, kmeans, _ = _load_or_default()
    if scaler is None or kmeans is None:
        # fallback: label by mood thresholds
        assigns, high, low = [], 0, 0
        for r in rows:
            c = "high-energy" if r["mood"] >= 7 else "low-energy" if r["mood"] <= 4 else "balanced"
            assigns.append({"date": r["date"], "cluster": c})
            high += c == "high-energy"
            low += c == "low-energy"
        return {
            "k": 3,
            "clusters": [
                {"name":"high-energy","days":high,"centroid":{"mood":8.0}},
                {"name":"balanced","days":len(rows)-high-low,"centroid":{"mood":6.0}},
                {"name":"low-energy","days":low,"centroid":{"mood":3.5}},
            ],
            "assignments": assigns,
        }

    X = _to_matrix(rows)
    Xs = scaler.transform(X)
    labels = kmeans.predict(Xs)

    # name clusters by average mood within each label
    mood_by_label: Dict[int, List[int]] = {}
    for r, lab in zip(rows, labels):
        mood_by_label.setdefault(lab, []).append(r["mood"])

    ordered = sorted(mood_by_label.items(), key=lambda kv: (sum(kv[1])/len(kv[1]) if kv[1] else 0), reverse=True)
    label_to_name = {}
    names = ["high-energy","balanced","low-energy","misc-1","misc-2","misc-3"]
    for idx, (lab, _) in enumerate(ordered):
        label_to_name[lab] = names[idx] if idx < len(names) else f"cluster-{idx}"

    assigns = [{"date": r["date"], "cluster": label_to_name[lbl]} for r, lbl in zip(rows, labels)]

    clusters_out = []
    for lab, moods in mood_by_label.items():
        clusters_out.append({
            "name": label_to_name[lab],
            "days": len(moods),
            "centroid": {"mood": round(sum(moods)/len(moods), 2) if moods else math.nan}
        })

    return {"k": int(getattr(kmeans, "n_clusters", 0)), "clusters": clusters_out, "assignments": assigns}

def insight_summary() -> Dict:
    rows = _fetch_rows()
    if not rows:
        return {"summary": "No data yet.", "recommendations": []}
    avg = round(sum(r["mood"] for r in rows)/len(rows), 2)
    corr = correlations(rows)
    top_pos = max(corr.items(), key=lambda kv: kv[1]) if corr else ("sleep_hours", 0.0)
    top_neg = min(corr.items(), key=lambda kv: kv[1]) if corr else ("screen_time", 0.0)
    recs = []
    if top_pos[1] > 0.2:
        recs.append(f"Lean into {top_pos[0]} this week.")
    if top_neg[1] < -0.2:
        recs.append(f"Reduce {top_neg[0]} a bit and observe.")
    return {
        "summary": f"Avg mood {avg}. Strongest positive factor: {top_pos[0]} ({top_pos[1]:.2f}). Strongest negative: {top_neg[0]} ({top_neg[1]:.2f}).",
        "recommendations": recs[:3]
    }
