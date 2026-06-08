"use client";
import Link from "next/link";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import CardActionArea from "@mui/material/CardActionArea";

export default function Org({
  name,
  image,
  description,
  slug,
}: {
  name: string;
  image: string;
  description: string;
  slug: string;
}) {
  return (
    <Card sx={{ maxWidth: 345 }}>
      <CardActionArea component={Link} href={`/org/${slug}`}>
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
