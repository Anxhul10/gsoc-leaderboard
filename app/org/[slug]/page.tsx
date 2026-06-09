import fs from "fs/promises";
import path from "path";
import Link from "next/link";
import {
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

        <Typography color="error">
          Source code platforms other than GitHub are not supported right now.
        </Typography>
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
      <Typography variant="h4" gutterBottom>
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
            {sortedData.map((user, index) => (
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
                  <Link
                    href={`https://github.com/${user.username.replace("[bot]", "")}`}
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
                </TableCell>

                <TableCell align="right">
                  {user.totalPRs - user.mergedPRs}
                </TableCell>

                <TableCell align="right">{user.mergedPRs}</TableCell>

                <TableCell align="right">{user.totalIssues}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
