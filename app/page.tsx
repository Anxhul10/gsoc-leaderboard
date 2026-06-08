"use client";
import "./globals.css";
import data from "@/data/2026.json";
import Org from "@/components/Org";

export default function Page() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "20px",
        padding: "20px",
      }}
    >
      {data.map((org) => (
        <Org
          key={org.slug}
          name={org.name}
          image={org.logo_url}
          description={org.description}
        />
      ))}
    </div>
  );
}
