"use client";

import Alert from "@mui/material/Alert";

export default function NotificationBanner({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Alert
      severity="info"
      sx={{
        width: "100%",
        borderRadius: 0,
        justifyContent: "center",
        "& .MuiAlert-message": {
          width: "100%",
          textAlign: "center",
          fontWeight: 500,
        },
      }}
    >
      {children}
    </Alert>
  );
}
