from typing import Dict, List
import math
import statistics as stats

NUMERIC_KEYS = [
    "mood","sleep_hours","steps","workouts","caffeine",
    "meals","work_hours","screen_time"
]

def pearson(xs, ys):
    if len(xs) < 3 or len(ys) < 3: return 0.0
    mx, my = stats.mean(xs), stats.mean(ys)
    num = sum((x-mx)*(y-my) for x,y in zip(xs,ys))
    denx = math.sqrt(sum((x-mx)**2 for x in xs))
    deny = math.sqrt(sum((y-my)**2 for y in ys))
    return 0.0 if denx==0 or deny==0 else num/(denx*deny)

def correlations(rows: List[dict]) -> Dict[str, float]:
    if not rows: return {k:0.0 for k in NUMERIC_KEYS if k!="mood"}
    mood = [r["mood"] for r in rows]
    result = {}
    for k in NUMERIC_KEYS:
        if k == "mood": continue
        result[k] = pearson([r[k] for r in rows], mood)
    return result

def weekly_averages(rows: List[dict]) -> List[dict]:
    if not rows: return []
    avg = sum(r["mood"] for r in rows) / len(rows)
    return [{"label": "last_period", "avg_mood": round(avg, 2)}]
