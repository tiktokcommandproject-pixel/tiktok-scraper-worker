// TikTok Scraper Worker - Node.js + Playwright
// Deploy on Render / Railway / VPS with Docker
// Environment: SUPABASE_URL, SUPABASE_ANON_KEY, WORKER_NAME

const { chromium } = require("playwright");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const WORKER_NAME = process.env.WORKER_NAME || "node-worker-1";
const SCRAPE_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
];

let jobsProcessed = 0;
let errorCount = 0;

async function sendHeartbeat() {
  try {
    await fetch(`${SUPABASE_URL}/functions/v1/worker-heartbeat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ worker_name: WORKER_NAME, jobs_processed: jobsProcessed, errors: errorCount }),
    });
  } catch (e) {
    console.error("Heartbeat failed:", e.message);
  }
}

async function fetchAccounts() {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/accounts?select=id,username,profile_link`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });
    return await res.json();
  } catch (e) {
    console.error("Failed to fetch accounts:", e.message);
    return [];
  }
}

async function scrapeProfile(page, username) {
  const url = `https://www.tiktok.com/@${username}`;
  console.log(`Scraping: ${url}`);

  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForTimeout(3000 + Math.random() * 2000);

  // Extract follower count (TikTok DOM changes frequently - adapt selectors)
  let followers = 0;
  try {
    const followerText = await page.locator('[data-e2e="followers-count"]').textContent();
    followers = parseCount(followerText);
  } catch (e) {
    console.warn("Could not extract followers for", username);
  }

  // Extract videos
  const videos = [];
  try {
    const videoElements = await page.locator('[data-e2e="user-post-item"]').all();
    for (const el of videoElements.slice(0, 10)) {
      try {
        const desc = await el.locator('[data-e2e="user-post-item-desc"]').textContent().catch(() => "");
        const viewText = await el.locator("strong").first().textContent().catch(() => "0");

        videos.push({
          video_id: `${username}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          description: desc || "",
          views: parseCount(viewText),
          likes: 0,
          comments: 0,
          shares: 0,
          posted_at: new Date().toISOString(),
        });
      } catch (e) { /* skip individual video errors */ }
    }
  } catch (e) {
    console.warn("Could not extract videos for", username);
  }

  return { username, followers, videos };
}

function parseCount(text) {
  if (!text) return 0;
  text = text.trim().toUpperCase();
  if (text.endsWith("M")) return Math.round(parseFloat(text) * 1_000_000);
  if (text.endsWith("K")) return Math.round(parseFloat(text) * 1_000);
  return parseInt(text.replace(/,/g, ""), 10) || 0;
}

async function ingestData(data) {
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/ingest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (result.success) jobsProcessed++;
    return result;
  } catch (e) {
    errorCount++;
    console.error("Ingest failed:", e.message);
    return null;
  }
}

async function main() {
  console.log(`Worker ${WORKER_NAME} starting...`);

  while (true) {
    try {
      const browser = await chromium.launch({ headless: true });
      const context = await browser.newContext({
        userAgent: USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)],
      });
      const page = await context.newPage();

      await sendHeartbeat();
      const accounts = await fetchAccounts();

      for (const account of accounts) {
        try {
          const data = await scrapeProfile(page, account.username);
          await ingestData(data);
          // Random delay between scrapes (2-5 seconds)
          await page.waitForTimeout(2000 + Math.random() * 3000);
        } catch (e) {
          errorCount++;
          console.error(`Error scraping ${account.username}:`, e.message);
        }
      }

      await browser.close();
      await sendHeartbeat();
    } catch (e) {
      errorCount++;
      console.error("Scraper cycle error:", e.message);
    }

    console.log(`Cycle complete. Jobs: ${jobsProcessed}, Errors: ${errorCount}. Waiting ${SCRAPE_INTERVAL_MS / 1000}s...`);
    await new Promise((r) => setTimeout(r, SCRAPE_INTERVAL_MS));
  }
}

main().catch(console.error);
