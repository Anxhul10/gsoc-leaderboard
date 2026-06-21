import fs from "fs/promises";
import path from "path";

const FROM = new Date("2026-01-01T00:00:00Z");
const TO = new Date();

const BASE_URL = "https://code.videolan.org/api/v4";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchJson(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);

      if (response.status === 404) {
        return [];
      }

      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (err) {
      if (i === retries - 1) {
        throw err;
      }

      const wait = Math.pow(2, i) * 1000;

      console.warn(
        `[Retry ${i + 1}] ${err.message} - waiting ${wait / 1000}s`
      );

      await sleep(wait);
    }
  }
}

function inRange(dateString) {
  const d = new Date(dateString);
  return d >= FROM && d <= TO;
}

function getUser(stats, username) {
  if (!stats[username]) {
    stats[username] = {
      username,
      totalPRs: 0,
      mergedPRs: 0,
      totalIssues: 0,
    };
  }

  return stats[username];
}

async function getAllProjects() {
  let page = 1;
  const projects = [];

  while (true) {
    const batch = await fetchJson(
      `${BASE_URL}/groups/videolan/projects?include_subgroups=true&per_page=100&page=${page}`
    );

    if (!batch.length) {
      break;
    }

    projects.push(...batch);

    console.log(
      `Fetched page ${page} (${batch.length} projects)`
    );

    if (batch.length < 100) {
      break;
    }

    page++;
  }

  return projects;
}

async function getProjectMRs(projectId) {
  let page = 1;
  const mrs = [];

  while (true) {
    const batch = await fetchJson(
      `${BASE_URL}/projects/${projectId}/merge_requests?state=all&order_by=created_at&sort=desc&per_page=100&page=${page}`
    );

    if (!batch.length) {
      break;
    }

    for (const mr of batch) {
      const created = new Date(mr.created_at);

      if (created < FROM) {
        return mrs;
      }

      if (created <= TO) {
        mrs.push(mr);
      }
    }

    if (batch.length < 100) {
      break;
    }

    page++;
  }

  return mrs;
}

async function getProjectIssues(projectId) {
  let page = 1;
  const issues = [];

  while (true) {
    const batch = await fetchJson(
      `${BASE_URL}/projects/${projectId}/issues?state=all&order_by=created_at&sort=desc&per_page=100&page=${page}`
    );

    if (!batch.length) {
      break;
    }

    for (const issue of batch) {
      const created = new Date(issue.created_at);

      if (created < FROM) {
        return issues;
      }

      if (created <= TO) {
        issues.push(issue);
      }
    }

    if (batch.length < 100) {
      break;
    }

    page++;
  }

  return issues;
}

async function buildLeaderboard() {
  const projects = await getAllProjects();

  console.log(
    `\nFound ${projects.length} VideoLAN projects\n`
  );

  const leaderboard = {};

  const CONCURRENCY = 5;

  for (let i = 0; i < projects.length; i += CONCURRENCY) {
    const batch = projects.slice(i, i + CONCURRENCY);

    await Promise.all(
      batch.map(async (project) => {
        try {
          console.log(
            `[${project.id}] ${project.path_with_namespace}`
          );

          const [mrs, issues] = await Promise.all([
            getProjectMRs(project.id),
            getProjectIssues(project.id),
          ]);

          for (const mr of mrs) {
            if (!mr.author) continue;
            if (!inRange(mr.created_at)) continue;

            const user = getUser(
              leaderboard,
              mr.author.username
            );

            user.totalPRs++;

            if (mr.merged_at) {
              user.mergedPRs++;
            }
          }

          for (const issue of issues) {
            if (!issue.author) continue;
            if (!inRange(issue.created_at)) continue;

            const user = getUser(
              leaderboard,
              issue.author.username
            );

            user.totalIssues++;
          }
        } catch (err) {
          console.error(
            `Failed project ${project.id}:`,
            err.message
          );
        }
      })
    );
  }

  return Object.values(leaderboard).sort(
    (a, b) =>
      b.mergedPRs - a.mergedPRs ||
      b.totalPRs - a.totalPRs ||
      b.totalIssues - a.totalIssues
  );
}

async function main() {
  console.log("Building VideoLAN leaderboard...");

  const results = await buildLeaderboard();

  const output = [
    {
      status: "success",
    },
    ...results,
  ];

  const outDir = path.resolve("data", "contributions");

  await fs.mkdir(outDir, { recursive: true });

  const outputPath = path.join(
    outDir,
    "videolan.json"
  );

  await fs.writeFile(
    outputPath,
    JSON.stringify(output, null, 2)
  );

  console.log(
    `\nDone. Saved ${results.length} contributors to ${outputPath}`
  );
}

main().catch(console.error);