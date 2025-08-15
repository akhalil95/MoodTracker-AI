import { Card, CardContent, Stack, Typography } from "@mui/material";
import { type ReactNode } from "react";

export default function Shell({
  title,
  actions,
  children,
}: {
  title: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Card elevation={0} sx={{ border: "1px solid #e2e8f0" }}>
      <CardContent>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          mb={2}
        >
          <Typography variant="h6" fontWeight={700}>
            {title}
          </Typography>
          {actions}
        </Stack>
        {children}
      </CardContent>
    </Card>
  );
}
