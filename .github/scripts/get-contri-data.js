import dotenv from "dotenv";

dotenv.config();

const TOKEN = process.env.GITHUB_TOKEN;

const OWNER = "Anxhul10";

const FROM = new Date("2026-01-01T00:00:00Z");
const TO = new Date("2026-06-01T23:59:59Z");

const headers = {
  Authorization: `Bearer ${TOKEN}`,
  Accept: "application/vnd.github+json",
};

async function fetchJson(url) {
  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error(
      `GitHub API Error: ${response.status} ${response.statusText}\n${url}`
    );
  }

  return response.json();
}

async function getRepos() {
  let page = 1;
  const repos = [];

  while (true) {
    const batch = await fetchJson(
      `https://api.github.com/users/${OWNER}/repos?per_page=100&page=${page}`
    );

    repos.push(...batch);

    if (batch.length < 100) break;
    page++;
  }

  return repos;
}

function inRange(dateString) {
  const d = new Date(dateString);
  return d >= FROM && d <= TO;
}

async function getAllPulls(repo) {
  let page = 1;
  const pulls = [];

  while (true) {
    // 1. Ask API for newest PRs first
    const batch = await fetchJson(
      `https://api.github.com/repos/${OWNER}/${repo}/pulls?state=all&sort=created&direction=desc&per_page=100&page=${page}`
    );

    if (batch.length === 0) break;

    for (const pr of batch) {
      const createdAt = new Date(pr.created_at);
      
      // 2. Stop entirely if we've gone further back than the start date
      if (createdAt < FROM) {
        return pulls;
      }
      
      // 3. Only keep PRs that fall within the target window
      if (createdAt <= TO) {
        pulls.push(pr);
      }
    }

    if (batch.length < 100) break;
    page++;
  }

  return pulls;
}

async function getAllIssues(repo) {
  let page = 1;
  const issues = [];

  while (true) {
    // 1. Ask API for newest issues first
    const batch = await fetchJson(
      `https://api.github.com/repos/${OWNER}/${repo}/issues?state=all&sort=created&direction=desc&per_page=100&page=${page}`
    );

    if (batch.length === 0) break;

    for (const issue of batch) {
      const createdAt = new Date(issue.created_at);
      
      // 2. Stop entirely if we've gone further back than the start date
      if (createdAt < FROM) {
        return issues;
      }
      
      // 3. Only keep issues within the window
      if (createdAt <= TO) {
        issues.push(issue);
      }
    }

    if (batch.length < 100) break;
    page++;
  }

  return issues;
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

async function main() {
  const repos = await getRepos();

  console.log(`Found ${repos.length} repos`);

  const leaderboard = {};

  for (const repo of repos) {
    console.log(`Processing ${repo.name}`);

    // PRs
    const pulls = await getAllPulls(repo.name);

    for (const pr of pulls) {
      if (!pr.user) continue;
      if (!inRange(pr.created_at)) continue;

      const user = getUser(
        leaderboard,
        pr.user.login
      );

      user.totalPRs++;

      if (pr.merged_at) {
        user.mergedPRs++;
      }
    }

    // Issues
    const issues = await getAllIssues(repo.name);

    for (const issue of issues) {
      // Skip PRs returned by issues endpoint
      if (issue.pull_request) continue;

      if (!issue.user) continue;
      if (!inRange(issue.created_at)) continue;

      const user = getUser(
        leaderboard,
        issue.user.login
      );

      user.totalIssues++;
    }
  }

  const results = Object.values(leaderboard)
    .sort(
      (a, b) =>
        b.mergedPRs - a.mergedPRs ||
        b.totalPRs - a.totalPRs
    );

  console.table(results);

  console.log(
    JSON.stringify(results, null, 2)
  );
}

main().catch(console.error);