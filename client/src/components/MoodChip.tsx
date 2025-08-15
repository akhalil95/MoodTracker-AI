import { Chip } from "@mui/material";

export function moodColor(mood: number) {
  if (mood >= 9) return { label: "ecstatic", color: "#7C3AED" }; // violet-600
  if (mood >= 7) return { label: "upbeat", color: "#10B981" }; // emerald-500
  if (mood >= 5) return { label: "steady", color: "#3B82F6" }; // blue-500
  if (mood >= 3) return { label: "meh", color: "#F59E0B" }; // amber-500
  return { label: "low", color: "#EF4444" }; // red-500
}

export default function MoodChip({ mood }: { mood: number }) {
  const { label, color } = moodColor(mood);
  return (
    <Chip
      size="small"
      label={`${mood} • ${label}`}
      sx={{
        fontWeight: 600,
        color: "white",
        backgroundColor: color,
      }}
    />
  );
}
