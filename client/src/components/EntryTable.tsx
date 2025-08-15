import { useEffect, useState } from "react";
import {
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import MoodChip from "./MoodChip";
import type { Entry } from "../api/types";

export default function EntryTable() {
  const [rows, setRows] = useState<Entry[]>([]);

  useEffect(() => {
    // load from API later; keeping empty for now
    setRows([]);
  }, []);

  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{ border: "1px solid #e2e8f0" }}
    >
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Mood</TableCell>
            <TableCell>Sleep</TableCell>
            <TableCell>Steps</TableCell>
            <TableCell>Screen</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={6}
                sx={{ color: "text.secondary", py: 6, textAlign: "center" }}
              >
                No entries yet — add one on the <b>Today</b> tab.
              </TableCell>
            </TableRow>
          )}
          {rows.map((r) => (
            <TableRow
              key={r.id}
              sx={{
                "&:hover": { backgroundColor: "rgba(99,102,241,0.06)" },
                background:
                  r.mood >= 8
                    ? "linear-gradient(90deg, rgba(16,185,129,0.06), transparent)"
                    : r.mood <= 3
                    ? "linear-gradient(90deg, rgba(239,68,68,0.06), transparent)"
                    : undefined,
              }}
            >
              <TableCell>{r.date}</TableCell>
              <TableCell>
                <MoodChip mood={r.mood} />
              </TableCell>
              <TableCell>{r.sleep_hours}</TableCell>
              <TableCell>{r.steps}</TableCell>
              <TableCell>{r.screen_time}</TableCell>
              <TableCell align="right">
                <Tooltip title="Delete">
                  <IconButton size="small" color="error">
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
