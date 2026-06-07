"use client";
import "./globals.css";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import CardActionArea from "@mui/material/CardActionArea";
import data from "@/data/2026.json";

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

function Org({
  name,
  image,
  description,
}: {
  name: string;
  image: string;
  description: string;
}) {
  return (
    <Card sx={{ maxWidth: 345 }}>
      <CardActionArea>
        <CardMedia
          component="img"
          image={image}
          alt={name}
          sx={{
            height: 180,
            objectFit: "contain",
            bgcolor: "background.default",
            p: 2,
          }}
        />
        <CardContent>
          <Typography gutterBottom variant="h5">
            {name}
          </Typography>

          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {description.slice(0, 120)}...
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
