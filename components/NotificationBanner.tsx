export default function NotificationBanner({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      style={{
        width: "100%",
        backgroundColor: "#03fce7",
        color: "#0c0b0b",
        padding: "10px 20px",
        textAlign: "center",
        fontWeight: "bold",
        boxSizing: "border-box",
      }}
    >
      {children}
    </div>
  );
}
