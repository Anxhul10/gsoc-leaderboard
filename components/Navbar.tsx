import TextField from "@mui/material/TextField";
import Image from "next/image";
import { redirect } from "next/navigation";

export default function Navbar() {
  return (
    <div className="Navbar">
      <div className="Navbar-left">
        <Image
          src="/icon0.svg"
          alt="GitHub"
          loading="eager"
          width={50}
          height={50}
          onClick={() => redirect("/")}
        />
      </div>
      <TextField
        id="outlined-basic"
        label="Search"
        variant="outlined"
        size="small"
        sx={{
          width: 1 / 2,
        }}
      />
      <div className="Navbar-right">
        <Image
          src="/icon1.svg"
          alt="GitHub"
          loading="eager"
          width={30}
          height={30}
          onClick={() =>
            redirect("https://github.com/Anxhul10/gsoc-leaderboard")
          }
        />
      </div>
    </div>
  );
}
