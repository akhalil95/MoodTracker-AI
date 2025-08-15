import { createTheme } from "@mui/material/styles";

export type Mode = "light" | "dark";

export const makeTheme = (mode: Mode = "light") =>
  createTheme({
    palette: {
      mode,
      primary: { main: "#6C63FF" }, // indigo-ish
      secondary: { main: "#00BFA6" }, // teal
      error: { main: "#FF5A5F" },
      warning: { main: "#F59E0B" },
      info: { main: "#3B82F6" },
      success: { main: "#10B981" },
      background: {
        default: mode === "light" ? "#F6F7FB" : "#0B1020",
        paper: mode === "light" ? "#FFFFFF" : "#0F172A",
      },
      text: {
        primary: mode === "light" ? "#0F172A" : "#E5E7EB",
        secondary: mode === "light" ? "#475569" : "#94A3B8",
      },
    },
    shape: { borderRadius: 14 },
    components: {
      MuiAppBar: { styleOverrides: { root: { background: "transparent" } } },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 18,
            border: "1px solid #E5E7EB",
            boxShadow:
              mode === "light"
                ? "0 6px 24px rgba(17,24,39,0.06)"
                : "0 6px 24px rgba(0,0,0,0.4)",
          },
        },
      },
      MuiButton: { defaultProps: { variant: "contained" } },
      MuiTextField: { defaultProps: { size: "small" } },
    },
    typography: {
      fontFamily: `"Inter", system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif`,
      h6: { fontWeight: 700 },
    },
  });

export default makeTheme;
