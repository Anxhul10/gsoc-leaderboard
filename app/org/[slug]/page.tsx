import fs from "fs/promises";
import path from "path";
import Link from "next/link";
import Alert from "@mui/material/Alert";
import {
  Avatar,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

type StatusResponse = {
  status: "success" | "fail";
};

type Contributor = {
  username: string;
  totalPRs: number;
  mergedPRs: number;
  totalIssues: number;
};

type DataFile = [StatusResponse, ...Contributor[]];

export async function generateStaticParams() {
  const dir = path.join(process.cwd(), "data", "contributions");

  const files = await fs.readdir(dir);

  return files
    .filter((file) => file.endsWith(".json"))
    .map((file) => ({
      slug: file.replace(".json", ""),
    }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const filePath = path.join(
    process.cwd(),
    "data",
    "contributions",
    `${slug.toLowerCase()}.json`,
  );

  const rawData: DataFile = JSON.parse(await fs.readFile(filePath, "utf-8"));

  const status = rawData[0]?.status;

  if (status === "fail") {
    return (
      <div style={{ padding: 24 }}>
        <Typography variant="h4" gutterBottom>
          {slug} Leaderboard
        </Typography>

        <Alert severity="warning" sx={{ mb: 3 }}>
          Unfortunately, gsoc-leaderboard currently supports only organizations
          whose source code is hosted on GitHub. If you&apos;d like support for
          another platform, or would like to help implement it, please{" "}
          <Link
            href="https://github.com/Anxhul10/gsoc-leaderboard/issues"
            target="_blank"
            rel="noopener noreferrer"
          >
            open an issue
          </Link>{" "}
          or submit a{" "}
          <Link
            href="https://github.com/Anxhul10/gsoc-leaderboard/pulls"
            target="_blank"
            rel="noopener noreferrer"
          >
            pull request
          </Link>
          .
        </Alert>
      </div>
    );
  }

  const data = rawData.slice(1) as Contributor[];

  const sortedData = [...data].sort((a, b) => {
    if (b.mergedPRs !== a.mergedPRs) {
      return b.mergedPRs - a.mergedPRs;
    }

    return b.totalPRs - a.totalPRs;
  });

  return (
    <div style={{ padding: 24 }}>
      <Typography variant="h4" align="center" gutterBottom>
        {slug} Leaderboard
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>Rank</strong>
              </TableCell>
              <TableCell>
                <strong>Username</strong>
              </TableCell>
              <TableCell align="right">
                <strong>Open PRs</strong>
              </TableCell>
              <TableCell align="right">
                <strong>Merged PRs</strong>
              </TableCell>
              <TableCell align="right">
                <strong>Issues</strong>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {sortedData.map((user, index) => {
              // Cleaned up username for URLs (removing '[bot]')
              const cleanUsername = user.username.replace("[bot]", "");

              return (
                <TableRow
                  key={user.username}
                  sx={{
                    "&:nth-of-type(odd)": {
                      backgroundColor: "action.hover",
                    },
                  }}
                >
                  <TableCell>{index + 1}</TableCell>

                  <TableCell>
                    {/* Box sets up a flex container to align items perfectly side-by-side */}
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                    >
                      <Avatar
                        src={`https://github.com/${cleanUsername}.png`}
                        alt={`${user.username}'s avatar`}
                        sx={{ width: 32, height: 32 }}
                      />
                      <Link
                        href={`https://github.com/${cleanUsername}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          textDecoration: "none",
                          color: "#1976d2",
                          fontWeight: 500,
                        }}
                      >
                        {user.username}
                      </Link>
                    </Box>
                  </TableCell>

                  <TableCell align="right">
                    {user.totalPRs - user.mergedPRs}
                  </TableCell>

                  <TableCell align="right">{user.mergedPRs}</TableCell>

                  <TableCell align="right">{user.totalIssues}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
