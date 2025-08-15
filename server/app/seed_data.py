from datetime import date, timedelta
import random, json
from sqlmodel import select

from .db import init_db, get_session, Entry

def synthetic_day(d: date):
    sleep = round(random.uniform(5.5, 8.5), 1)
    steps = random.randint(1500, 12000)
    workouts = random.choice([0, 0, 20, 30, 45])
    caffeine = random.choice([0, 80, 120, 200])
    meals = random.randint(2, 4)
    work = round(random.uniform(6, 9), 1)
    screen = random.randint(120, 360)
    mood = max(1, min(10, int(
        5 + 0.4*(sleep-7) + 0.0003*(steps-6000) - 0.002*(screen-200) - 0.002*(caffeine-120)
        + random.gauss(0, 1.2)
    )))
    journal = random.choice([
        "Felt okay, walk helped.", "Deep work day.", "Low energy.",
        "Great sleep, solid focus.", "Too much screen before bed."
    ])
    tags = random.sample(["walk","focus","deadline","social","gym","coffee","screen"], k=2)
    return dict(
        date=d, mood=mood, sleep_hours=sleep, steps=steps, workouts=workouts,
        caffeine=caffeine, meals=meals, work_hours=work, screen_time=screen,
        journal=journal, tags=json.dumps(tags)
    )

def run(days=120):
    init_db()
    start = date.today() - timedelta(days=days)
    with get_session() as s:
        existing = s.exec(select(Entry)).first()
        if existing:
            print("DB already has data; skipping.")
            return
        for i in range(days):
            d = start + timedelta(days=i)
            s.add(Entry(**synthetic_day(d)))
        s.commit()
        print(f"Seeded {days} days.")

if __name__ == "__main__":
    run()
