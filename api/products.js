const OWNER = process.env.GITHUB_OWNER || "lasharicommunication";
const REPO = process.env.GITHUB_REPO || "shop";
const BRANCH = process.env.GITHUB_BRANCH || "main";
const FILE_PATH = process.env.GITHUB_PRODUCTS_PATH || "data/products.json";

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
  res.setHeader("Cache-Control", "no-store");
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
  if (!token) return json(res, 500, { error: "GITHUB_TOKEN environment variable is not configured" });

  try {
    const apiPath = `/repos/${OWNER}/${REPO}/contents/${FILE_PATH}?ref=${encodeURIComponent(BRANCH)}`;

    if (req.method === "GET") {
      const file = await githubRequest(apiPath, token, { headers: { "Cache-Control": "no-cache" } });
      const content = Buffer.from(file.content || "", "base64").toString("utf8");
      return json(res, 200, JSON.parse(content));
    }

    if (req.method === "POST") {
      const products = req.body?.products;
      if (!Array.isArray(products)) return json(res, 400, { error: "products must be an array" });

      let sha;
      try {
        sha = (await githubRequest(apiPath, token)).sha;
      } catch (error) {
        if (!error.message.includes("GitHub API 404")) throw error;
      }

      await githubRequest(`/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`, token, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Update storefront products (${products.length} items)`,
          content: Buffer.from(JSON.stringify(products, null, 2) + "\n").toString("base64"),
          branch: BRANCH,
          ...(sha ? { sha } : {})
        })
      });
      return json(res, 200, { ok: true, products });
    }

    return json(res, 405, { error: "Method not allowed" });
  } catch (error) {
    console.error(error);
    return json(res, 500, { error: error.message });
  }
};
