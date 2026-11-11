const OWNER = process.env.GITHUB_OWNER || "lasharicommunication";
const REPO = process.env.GITHUB_REPO || "shop";
const BRANCH = process.env.GITHUB_BRANCH || "main";
const FILE_PATH = process.env.GITHUB_ORDERS_PATH || "data/orders.json";

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

  // GET: Return shared orders (tries API, then falls back to public raw URL)
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
      console.error("Raw fallback failed:", rawErr.message);
    }

    return json(res, 200, []);
  }

  // POST: Either append a single new customer order ({ order: ... }) or save full orders list ({ orders: [...] })
  if (req.method === "POST") {
    if (!token) {
      return json(res, 500, {
        error: "GITHUB_TOKEN is not configured in Vercel Environment Variables. Please add Key: GITHUB_TOKEN in Vercel Project Settings -> Environment Variables and redeploy."
      });
    }

    const isSingle = req.body && req.body.order && typeof req.body.order === "object";
    const isArray = req.body && Array.isArray(req.body.orders);

    if (!isSingle && !isArray) {
      return json(res, 400, { error: "Payload must contain 'order' object or 'orders' array" });
    }

    const maxRetries = 3;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        let currentOrders = [];
        let sha;

        try {
          const file = await githubRequest(apiPath, token, {
            headers: { "Cache-Control": "no-cache, no-store", "Pragma": "no-cache" }
          });
          sha = file.sha;
          const content = Buffer.from(file.content || "", "base64").toString("utf8");
          const parsed = JSON.parse(content);
          if (Array.isArray(parsed)) currentOrders = parsed;
        } catch (err) {
          if (!err.message.includes("GitHub API 404")) {
            console.warn("Could not fetch existing orders for merge:", err.message);
          }
        }

        let updatedOrders = [];
        let commitMessage = "Update storefront orders";

        if (isSingle) {
          const single = req.body.order;
          const exists = currentOrders.some(o => o.id === single.id);
          if (!exists) {
            currentOrders.unshift(single);
          }
          updatedOrders = currentOrders;
          commitMessage = `New order #${single.id} from ${single.customerName || "Customer"}`;
        } else {
          updatedOrders = req.body.orders;
          commitMessage = `Update storefront orders (${updatedOrders.length} items)`;
        }

        await githubRequest(`/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`, token, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: commitMessage,
            content: Buffer.from(JSON.stringify(updatedOrders, null, 2) + "\n").toString("base64"),
            branch: BRANCH,
            ...(sha ? { sha } : {})
          })
        });

        return json(res, 200, { ok: true, orders: updatedOrders });
      } catch (error) {
        if (error.message.includes("409") && attempt < maxRetries) {
          console.warn(`Orders GitHub 409 conflict (attempt ${attempt}/${maxRetries}), retrying with fresh SHA...`);
          await new Promise(r => setTimeout(r, 300 * attempt));
          continue;
        }
        console.error("GitHub orders commit failed:", error);
        return json(res, 500, { error: `GitHub save failed: ${error.message}` });
      }
    }
  }

  return json(res, 405, { error: "Method not allowed" });
};
