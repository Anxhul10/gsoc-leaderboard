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

type Contributor = {
  username: string;
  totalPRs: number;
  mergedPRs: number;
  totalIssues: number;
};

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
    slug,
    "contributors.json",
  );

  const data: Contributor[] = JSON.parse(await fs.readFile(filePath, "utf-8"));

  // Sort by merged PRs descending.
  // If tied, sort by total PRs descending.
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
                <TableCell>
                  {index === 0
                    ? "1"
                    : index === 1
                      ? "2"
                      : index === 2
                        ? "3"
                        : index + 1}
                </TableCell>

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
                <TableCell align="right">{user.totalPRs}</TableCell>

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
