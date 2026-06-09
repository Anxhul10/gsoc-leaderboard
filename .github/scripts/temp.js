import fs from "fs/promises";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const TOKEN = process.env.GITHUB_TOKEN;
const FROM = new Date("2026-01-01T00:00:00Z");
const TO = new Date(); // Dynamically uses the current date and time

const headers = {
  Authorization: `Bearer ${TOKEN}`,
  Accept: "application/vnd.github+json",
};

async function fetchJson(url, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, { headers });

      // 1. Check for Rate Limiting (Status 403 or 429)
      if (response.status === 403 || response.status === 429) {
        const remaining = response.headers.get("x-ratelimit-remaining");
        
        if (remaining === "0") {
          // Calculate how long to sleep until the API resets
          const resetTime = response.headers.get("x-ratelimit-reset");
          const waitTime = (resetTime * 1000) - Date.now() + 5000; // Add 5 sec buffer
          
          const waitMinutes = Math.ceil(waitTime / 60000);
          console.warn(`\n  [Rate Limited] Waiting ${waitMinutes} minutes for GitHub API to reset...`);
          
          await sleep(waitTime);
          i--; // Don't count this as a failed retry, decrement and try again
          continue;
        }
      }

      // 2. Handle 404 (Not Found) or 410 (Gone) gracefully if features are disabled
      if (response.status === 404 || response.status === 410) {
        return [];
      }

      // 3. Handle standard HTTP errors
      if (!response.ok) {
        throw new Error(`GitHub API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      // 4. Catch Network blips ("fetch failed") and Retry
      if (i === retries - 1) {
        // If we are out of retries, actually throw the error to be caught by main()
        throw error;
      }
      
      // Exponential backoff: Wait 2s, then 4s, etc., before retrying
      const wait = Math.pow(2, i) * 1000;
      console.warn(`    [Network Blip] ${error.message} - Retrying in ${wait / 1000}s...`);
      await sleep(wait);
    }
  }
}

async function getRepos(owner) {
  let page = 1;
  const repos = [];

  while (true) {
    const batch = await fetchJson(
      `https://api.github.com/users/${owner}/repos?per_page=100&page=${page}`
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

async function getAllPulls(owner, repo) {
  let page = 1;
  const pulls = [];

  while (true) {
    // 1. Ask API for newest PRs first
    const batch = await fetchJson(
      `https://api.github.com/repos/${owner}/${repo}/pulls?state=all&sort=created&direction=desc&per_page=100&page=${page}`
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

async function getAllIssues(owner, repo) {
  let page = 1;
  const issues = [];

  while (true) {
    // 1. Ask API for newest issues first
    const batch = await fetchJson(
      `https://api.github.com/repos/${owner}/${repo}/issues?state=all&sort=created&direction=desc&per_page=100&page=${page}`
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

async function getGitHubStats(owner, concurrencyLimit = 5) {
  const allRepos = await getRepos(owner);
  
  // Filter repositories that had activity between FROM and TO
  const activeRepos = allRepos.filter(repo => {
    const updatedAt = new Date(repo.updated_at);
    return updatedAt >= FROM && updatedAt <= TO;
  });

  console.log(`  Found ${allRepos.length} total repos. ${activeRepos.length} updated since ${FROM.toISOString().split('T')[0]}`);

  const leaderboard = {};

  // Process repositories based on the requested concurrency limit
  for (let i = 0; i < activeRepos.length; i += concurrencyLimit) {
    const batch = activeRepos.slice(i, i + concurrencyLimit);

    await Promise.all(batch.map(async (repo) => {
      // Fetch PRs and Issues simultaneously for maximum performance within the batch
      const [pulls, issues] = await Promise.all([
        getAllPulls(owner, repo.name),
        getAllIssues(owner, repo.name)
      ]);

      // Process PRs
      for (const pr of pulls) {
        if (!pr.user) continue;
        if (!inRange(pr.created_at)) continue;

        const user = getUser(leaderboard, pr.user.login);
        user.totalPRs++;

        if (pr.merged_at) {
          user.mergedPRs++;
        }
      }

      // Process Issues
      for (const issue of issues) {
        if (issue.pull_request) continue; // Skip PRs returned by issues endpoint
        if (!issue.user) continue;
        if (!inRange(issue.created_at)) continue;

        const user = getUser(leaderboard, issue.user.login);
        user.totalIssues++;
      }
    }));
  }

  return Object.values(leaderboard).sort(
    (a, b) => b.mergedPRs - a.mergedPRs || b.totalPRs - a.totalPRs
  );
}

function extractGitHubOwner(url) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (!['github.com', 'www.github.com'].includes(parsed.hostname)) {
      return null;
    }
    // Remove empty strings from potential trailing slashes
    const parts = parsed.pathname.split('/').filter(Boolean);
    return parts.length > 0 ? parts[0] : null;
  } catch (error) {
    return null; // Will catch inherently invalid URLs
  }
}

// Reusable logic to process and save a single organization
async function processAndSaveOrganization(org, owner, outDir, concurrencyLimit = 5) {
  try {
    console.log(`\n[Processing] ${org.name} (GitHub Owner: ${owner}) [Batch Size: ${concurrencyLimit}]`);
    const results = await getGitHubStats(owner, concurrencyLimit);

    const successData = [
      { status: "success" },
      ...results
    ];

    // Convert org slug to lowercase and remove illegal filename characters
    const safeFileName = org.slug.toLowerCase().replace(/[\\/:*?"<>|]/g, "");
    const successPath = path.join(outDir, `${safeFileName}.json`);
    
    await fs.writeFile(successPath, JSON.stringify(successData, null, 2));
    
    console.log(`  Successfully saved data to ${safeFileName}.json`);

  } catch (error) {
    console.error(`  [Error] Failed processing ${owner}:`, error.message);
  }
}

async function main() {
  const dataPath = path.resolve("data", "2026.json");
  const outDir = path.resolve("data", "contributions");

  await fs.mkdir(outDir, { recursive: true });

  const rawData = await fs.readFile(dataPath, "utf-8");
  const organizations = JSON.parse(rawData);

  for (const org of organizations) {
    const owner = extractGitHubOwner(org.source_code);

    if (!owner) {
      console.log(`[Skipped] ${org.name} - Non-GitHub platform or invalid URL.`);
      const failPath = path.join(outDir, `${org.slug}.json`);
      await fs.writeFile(failPath, JSON.stringify([{ status: "fail" }], null, 2));
      continue;
    }

    // Skip Apache in the normal run
    if (owner.toLowerCase() === "apache") {
      console.log(`[Skipped] ${org.name} - Apache is deliberately skipped in the normal run. Use processApacheOnly() to run it.`);
      continue;
    }

    // Uses the optimized batch size of 5 for normal runs
    await processAndSaveOrganization(org, owner, outDir, 5);
  }

  console.log("\nDone processing all regular organizations.");
}

// Function dedicated exclusively to Apache
async function processApacheOnly() {
  const dataPath = path.resolve("data", "2026.json");
  const outDir = path.resolve("data", "contributions");

  await fs.mkdir(outDir, { recursive: true });

  const rawData = await fs.readFile(dataPath, "utf-8");
  const organizations = JSON.parse(rawData);

  // Find the Apache org object
  const apacheOrg = organizations.find((org) => {
    const owner = extractGitHubOwner(org.source_code);
    return owner && owner.toLowerCase() === "apache";
  });

  if (!apacheOrg) {
    console.error("Could not find Apache in 2026.json");
    return;
  }

  console.log(`\n--- Starting Dedicated Apache Job ---`);
  // Forces a concurrency limit of 1, running it entirely sequentially
  await processAndSaveOrganization(apacheOrg, "apache", outDir, 1);
  console.log("\n--- Finished Apache Job ---");
}

// To run the normal loop, leave this as is.
// To run ONLY Apache, comment out main() and uncomment processApacheOnly().
main().catch(console.error);
// processApacheOnly().catch(console.error);