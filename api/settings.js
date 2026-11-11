const OWNER = process.env.GITHUB_OWNER || "lasharicommunication";
const REPO = process.env.GITHUB_REPO || "shop";
const BRANCH = process.env.GITHUB_BRANCH || "main";
const FILE_PATH = process.env.GITHUB_SETTINGS_PATH || "data/settings.json";

async function githubRequest(path, token, options = {}) {
  const response = await fetch(`https://api.github.com${path}`, {
    ...options,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GitHub API ${response.status}: ${body}`);
  }
  return response.status === 204 ? null : response.json();
}

function json(res, status, body) {
  res.status(status);
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  res.end(JSON.stringify(body));
}

module.exports = async function handler(req, res) {
  const token = process.env.GITHUB_TOKEN;
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  const apiPath = `/repos/${OWNER}/${REPO}/contents/${FILE_PATH}?ref=${encodeURIComponent(BRANCH)}`;

  // GET: Return shared settings (tries API, then falls back to public raw URL)
  if (req.method === "GET") {
    try {
      if (token) {
        const file = await githubRequest(apiPath, token, { headers: { "Cache-Control": "no-cache, no-store" } });
        const content = Buffer.from(file.content || "", "base64").toString("utf8");
        return json(res, 200, JSON.parse(content));
      }
    } catch (apiErr) {
      console.warn("GitHub API GET failed, trying public raw URL:", apiErr.message);
    }

    try {
      const rawRes = await fetch(`https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/${FILE_PATH}?_t=${Date.now()}`, {
        headers: { "Cache-Control": "no-cache" }
      });
      if (rawRes.ok) {
        const rawJson = await rawRes.json();
        return json(res, 200, rawJson);
      }
    } catch (rawErr) {
      console.error("Raw settings fallback failed:", rawErr.message);
    }

    return json(res, 200, {});
  }

  // POST: Commit settings changes to GitHub repo (with auto-retry on 409 conflict)
  if (req.method === "POST") {
    if (!token) {
      return json(res, 500, {
        error: "GITHUB_TOKEN is not configured in Vercel Environment Variables. Please add Key: GITHUB_TOKEN in Vercel Project Settings -> Environment Variables and redeploy."
      });
    }

    const settings = req.body?.settings;
    if (!settings || typeof settings !== "object") {
      return json(res, 400, { error: "settings must be an object" });
    }

    const maxRetries = 3;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        let sha;
        let existingSettings = {};
        try {
          const file = await githubRequest(apiPath, token, {
            headers: { "Cache-Control": "no-cache, no-store", "Pragma": "no-cache" }
          });
          sha = file.sha;
          if (file && file.content) {
            try {
              const raw = Buffer.from(file.content, "base64").toString("utf8");
              existingSettings = JSON.parse(raw) || {};
            } catch (e) {}
          }
        } catch (error) {
          if (!error.message.includes("GitHub API 404")) throw error;
        }

        const mergedSettings = { ...existingSettings, ...settings };

        await githubRequest(`/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`, token, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: `Update storefront settings (${mergedSettings.brandName || "store"})`,
            content: Buffer.from(JSON.stringify(mergedSettings, null, 2) + "\n").toString("base64"),
            branch: BRANCH,
            ...(sha ? { sha } : {})
          })
        });

        return json(res, 200, { ok: true, settings: mergedSettings });
      } catch (error) {
        if (error.message.includes("409") && attempt < maxRetries) {
          console.warn(`Settings GitHub 409 conflict (attempt ${attempt}/${maxRetries}), retrying with fresh SHA...`);
          await new Promise(r => setTimeout(r, 300 * attempt));
          continue;
        }
        console.error("GitHub settings commit failed:", error);
        return json(res, 500, { error: `GitHub save failed: ${error.message}` });
      }
    }
  }

  return json(res, 405, { error: "Method not allowed" });
};
