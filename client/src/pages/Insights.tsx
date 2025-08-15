import { Button, Stack, Typography } from "@mui/material";
import Shell from "../components/Shell";
import { useEffect, useState } from "react";

export default function Insights() {
  const [summary, setSummary] = useState<string>(
    "Models not trained yet (server pending)."
  );
  const [pred, setPred] = useState<string>("—");

  useEffect(() => {
    // later: call /analytics/insights and /ml/predict
  }, []);

  return (
    <Stack spacing={2}>
      <Shell title="Summary" actions={<Button disabled>Refresh</Button>}>
        <Typography color="text.secondary">{summary}</Typography>
      </Shell>
      <Shell title="Prediction (tomorrow)">
        <Typography variant="h5" fontWeight={700}>
          {pred}
        </Typography>
      </Shell>
    </Stack>
  );
}
