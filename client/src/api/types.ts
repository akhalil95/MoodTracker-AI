// client/src/api/types.ts
export type Entry = {
  id: number;
  date: string; // YYYY-MM-DD
  mood: number; // 1..10
  sleep_hours: number;
  steps: number;
  workouts: number; // minutes
  caffeine: number; // mg
  meals: number;
  work_hours: number;
  screen_time: number; // minutes
  journal: string;
  tags: string[];
};

export type NewEntry = Omit<Entry, "id">;
