import React from "react";
import ReactDOM from "react-dom/client";
import { CssBaseline, ThemeProvider } from "@mui/material";
import App from "./App";
import makeTheme, { type Mode } from "./theme";

function Root() {
  const [mode, setMode] = React.useState<Mode>("light");
  const theme = React.useMemo(() => makeTheme(mode), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App
        mode={mode}
        toggleMode={() => setMode((m) => (m === "light" ? "dark" : "light"))}
      />
    </ThemeProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(<Root />);
