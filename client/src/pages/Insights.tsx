import { Button, Stack, Typography } from "@mui/material";
import Shell from "../components/Shell";
import { useEffect, useState } from "react";
import { api } from "../api/client";

export default function Insights() {
  const [summary, setSummary] = useState<string>("Loading...");
  const [recs, setRecs] = useState<string[]>([]);
  const [pred, setPred] = useState<string>("—");
  const [busy, setBusy] = useState(false);

  async function refresh() {
    const s = await api.get("/analytics/insights");
    setSummary(s.data.summary);
    setRecs(s.data.recommendations || []);
    const p = await api.get("/ml/predict");
    setPred(String(p.data.predicted_mood));
  }

  useEffect(() => {
    refresh();
  }, []);

  async function retrain() {
    try {
      setBusy(true);
      await api.post("/ml/retrain");
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Stack spacing={2}>
      <Shell
        title="Summary"
        actions={
          <Button onClick={refresh} disabled={busy} variant="outlined">
            Refresh
          </Button>
        }
      >
        <Typography color="text.secondary" sx={{ mb: 1 }}>
          {summary}
        </Typography>
        {recs.length > 0 && (
          <ul style={{ margin: 0, paddingInlineStart: 18 }}>
            {recs.map((r, i) => (
              <li key={i}>
                <Typography color="text.primary">{r}</Typography>
              </li>
            ))}
          </ul>
        )}
      </Shell>

      <Shell
        title="Prediction (tomorrow)"
        actions={
          <Button onClick={retrain} disabled={busy}>
            {busy ? "Training..." : "Retrain Models"}
          </Button>
        }
      >
        <Typography variant="h5" fontWeight={700}>
          {pred}
        </Typography>
      </Shell>
    </Stack>
  );
}
