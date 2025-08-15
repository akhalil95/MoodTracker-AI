import { useState } from "react";
import {
  AppBar,
  Box,
  Button,
  Container,
  Tab,
  Tabs,
  Toolbar,
  Typography,
} from "@mui/material";
import TodayLog from "./pages/TodayLog";
import History from "./pages/History";
import Trends from "./pages/Trends";
import Insights from "./pages/Insights";

const PAGES = ["Today", "History", "Trends", "Insights"] as const;

export default function App({
  mode,
  toggleMode,
}: {
  mode: "light" | "dark";
  toggleMode: () => void;
}) {
  const [tab, setTab] = useState<(typeof PAGES)[number]>("Today");

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Box
        sx={{
          background:
            mode === "light"
              ? "linear-gradient(135deg, #EEF2FF 0%, #F0FDFA 100%)"
              : "linear-gradient(135deg, #0F172A 0%, #0B1020 100%)",
          borderBottom: "1px solid #E2E8F0",
          position: "sticky",
          top: 0,
          zIndex: 1100,
        }}
      >
        <AppBar
          position="static"
          color="inherit"
          elevation={0}
          sx={{ background: "transparent" }}
        >
          <Toolbar sx={{ gap: 2, justifyContent: "space-between" }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              MoodTracker AI
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Tabs
                value={PAGES.indexOf(tab)}
                onChange={(_, i) => setTab(PAGES[i])}
                textColor="primary"
                indicatorColor="primary"
                sx={{ minHeight: 48 }}
              >
                {PAGES.map((p) => (
                  <Tab key={p} label={p} sx={{ minHeight: 48 }} />
                ))}
              </Tabs>
              <Button variant="outlined" size="small" onClick={toggleMode}>
                {mode === "light" ? "Dark" : "Light"}
              </Button>
            </Box>
          </Toolbar>
        </AppBar>
      </Box>

      <Container maxWidth="md" sx={{ py: 3 }}>
        {tab === "Today" && <TodayLog />}
        {tab === "History" && <History />}
        {tab === "Trends" && <Trends />}
        {tab === "Insights" && <Insights />}
      </Container>
    </Box>
  );
}
