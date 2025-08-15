import { useEffect, useMemo, useState } from "react";
import Shell from "../components/Shell";
import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Line,
} from "recharts";
import type { Entry } from "../api/types";
import { moodColor } from "../components/MoodChip";
import { api } from "../api/client";

export default function Trends() {
  const [rows, setRows] = useState<Entry[]>([]);

  useEffect(() => {
    (async () => {
      const res = await api.get<Entry[]>("/entries");
      setRows(res.data);
    })();
  }, []);

  const data = useMemo(() => rows, [rows]);

  const ColoredDot = (props: any) => {
    const { cx, cy, payload } = props;
    return (
      <circle
        cx={cx}
        cy={cy}
        r={3.5}
        fill={moodColor(payload.mood).color}
        stroke="rgba(0,0,0,0.08)"
      />
    );
  };

  return (
    <Shell title="Trends">
      <div style={{ height: 360 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" hide />
            <YAxis domain={[0, 10]} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="mood"
              stroke="#6C63FF"
              dot={<ColoredDot />}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Shell>
  );
}
