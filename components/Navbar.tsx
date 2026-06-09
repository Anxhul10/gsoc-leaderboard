"use client";
import TextField from "@mui/material/TextField";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";

export default function Navbar() {
  const router = useRouter();

  const handleSearch = useDebouncedCallback((value: string) => {
    if (value) {
      router.replace(`/search?q=${encodeURIComponent(value)}`);
    } else {
      router.replace("/");
    }
  }, 300);

  return (
    <div className="Navbar">
      <div className="Navbar-left" style={{ cursor: "pointer" }}>
        <Image
          src="/icon1.svg"
          alt="main logo"
          loading="eager"
          width={50}
          height={50}
          onClick={() => router.push("/")}
        />
      </div>

      <TextField
        id="outlined-basic"
        label="Search organization"
        variant="outlined"
        size="small"
        onChange={(e) => handleSearch(e.target.value)}
        sx={{ width: 1 / 2 }}
      />

      <div className="Navbar-right">
        <a
          href="https://github.com/Anxhul10/gsoc-leaderboard"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            src="/icon0.svg"
            alt="github logo"
            loading="eager"
            width={30}
            height={30}
          />
        </a>
      </div>
    </div>
  );
}
