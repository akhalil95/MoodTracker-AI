import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Grid,
  InputAdornment,
  Slider,
  Stack,
  TextField,
} from "@mui/material";
import MoodChip from "./MoodChip";
import { api } from "../api/client";

type FormState = {
  date: string;
  mood: number;
  sleep_hours: number;
  steps: number;
  workouts: number;
  caffeine: number;
  meals: number;
  work_hours: number;
  screen_time: number;
  journal: string;
  tags: string;
};

export default function EntryForm({ onSaved }: { onSaved?: () => void }) {
  const [form, setForm] = useState<FormState>({
    date: new Date().toISOString().slice(0, 10),
    mood: 6,
    sleep_hours: 7,
    steps: 4000,
    workouts: 0,
    caffeine: 120,
    meals: 3,
    work_hours: 8,
    screen_time: 180,
    journal: "",
    tags: "",
  });
  const [msg, setMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    try {
      if (form.mood < 1 || form.mood > 10) throw new Error("Mood must be 1–10");

      await api.post("/entries", {
        ...form,
        tags: form.tags
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      });

      setMsg({ type: "success", text: "Saved!" });
      onSaved?.();
    } catch (e: any) {
      const detail = e?.response?.data?.detail;
      setMsg({ type: "error", text: detail || e?.message || "Save failed" });
    }
  };

  return (
    <Stack spacing={2}>
      {msg && <Alert severity={msg.type}>{msg.text}</Alert>}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="date"
            label="Date"
            value={form.date}
            onChange={(e) => set("date", e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <MoodChip mood={form.mood} />
          </Stack>
          <Slider
            value={form.mood}
            min={1}
            max={10}
            step={1}
            onChange={(_, v) => set("mood", v as number)}
          />
        </Grid>

        <Grid item xs={6} sm={4}>
          <Num
            label="Sleep"
            value={form.sleep_hours}
            onChange={(n) => set("sleep_hours", n)}
            adorn="h"
          />
        </Grid>
        <Grid item xs={6} sm={4}>
          <Num
            label="Steps"
            value={form.steps}
            onChange={(n) => set("steps", n)}
          />
        </Grid>
        <Grid item xs={6} sm={4}>
          <Num
            label="Workout"
            value={form.workouts}
            onChange={(n) => set("workouts", n)}
            adorn="min"
          />
        </Grid>
        <Grid item xs={6} sm={4}>
          <Num
            label="Caffeine"
            value={form.caffeine}
            onChange={(n) => set("caffeine", n)}
            adorn="mg"
          />
        </Grid>
        <Grid item xs={6} sm={4}>
          <Num
            label="Meals"
            value={form.meals}
            onChange={(n) => set("meals", n)}
          />
        </Grid>
        <Grid item xs={6} sm={4}>
          <Num
            label="Work"
            value={form.work_hours}
            onChange={(n) => set("work_hours", n)}
            adorn="h"
          />
        </Grid>
        <Grid item xs={12}>
          <Num
            label="Screen"
            value={form.screen_time}
            onChange={(n) => set("screen_time", n)}
            adorn="min"
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            minRows={3}
            label="Journal"
            value={form.journal}
            onChange={(e) => set("journal", e.target.value)}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Tags (comma separated)"
            value={form.tags}
            onChange={(e) => set("tags", e.target.value)}
          />
        </Grid>
      </Grid>

      <Box>
        <Button
          onClick={submit}
          sx={{
            background: "linear-gradient(135deg, #6C63FF, #00BFA6)",
            ":hover": {
              opacity: 0.9,
              background: "linear-gradient(135deg, #5B55EE, #00A892)",
            },
          }}
        >
          Save
        </Button>
      </Box>
    </Stack>
  );
}

function Num({
  label,
  value,
  onChange,
  adorn,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  adorn?: string;
}) {
  return (
    <TextField
      fullWidth
      type="number"
      label={label}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      InputProps={
        adorn
          ? {
              endAdornment: (
                <InputAdornment position="end">{adorn}</InputAdornment>
              ),
            }
          : undefined
      }
    />
  );
}
