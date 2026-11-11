const OWNER = process.env.GITHUB_OWNER || "lasharicommunication";
const REPO = process.env.GITHUB_REPO || "shop";
const BRANCH = process.env.GITHUB_BRANCH || "main";
const FILE_PATH = process.env.GITHUB_ORDERS_PATH || "data/orders.json";

// Telegram Instant Order Notifications Config
const DEFAULT_TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "9163122969:AAFJKgDkTRIJ1lL0O8OYCK-iANnwUiUe9go";
const DEFAULT_TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || "8893027663";

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

async function sendTelegramOrderAlert(order, customConfig = {}) {
  const token = customConfig.token || DEFAULT_TELEGRAM_TOKEN;
  const chatId = customConfig.chatId || DEFAULT_TELEGRAM_CHAT_ID;
  if (!token || !chatId) return false;

  const itemsList = (order.items || []).map(i => {
    let variants = [];
    if (i.size) variants.push(`Size: ${i.size}`);
    if (i.color) variants.push(`Color: ${i.color}`);
    const vStr = variants.length ? ` [${variants.join(", ")}]` : "";
    return `• <b>${escapeHtml(i.title)}</b> (${i.qty}x)${vStr} - Rs. ${((i.price || 0) * (i.qty || 1)).toLocaleString()}`;
  }).join("\n");

  const message = `🛍️ <b>NAYA ORDER RECEIVE HUA!</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `🆔 <b>Order ID:</b> <code>#${order.id}</code>\n` +
    `👤 <b>Customer:</b> ${escapeHtml(order.customerName || "N/A")}\n` +
    `📞 <b>Phone:</b> <code>${escapeHtml(order.phone || "N/A")}</code>\n` +
    `📍 <b>Address:</b> ${escapeHtml(order.address || "N/A")}\n` +
    `🚚 <b>Courier:</b> ${escapeHtml(order.courierPartner || "TCS Express & Leopards")}\n` +
    `💳 <b>Payment:</b> ${escapeHtml(order.paymentMethod || "Advance Payment")}\n\n` +
    `📦 <b>Order Items:</b>\n${itemsList || "• No items specified"}\n\n` +
    `💵 <b>Subtotal:</b> Rs. ${(order.subtotal || 0).toLocaleString()}\n` +
    `🛵 <b>Delivery Fee:</b> Rs. ${(order.deliveryFee || 200).toLocaleString()}\n` +
    `💰 <b>Total Payable:</b> <b>Rs. ${(order.total || 0).toLocaleString()}</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `🕒 <i>${order.date || new Date().toISOString().slice(0, 16)}</i>`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "HTML"
      }),
      signal: controller.signal
    });
    clearTimeout(timeout);
    const resData = await response.json().catch(() => null);
    if (!response.ok) {
      console.warn("Telegram API Error:", resData);
      return { ok: false, error: resData?.description || `HTTP ${response.status}` };
    }
    return { ok: true, data: resData };
  } catch (err) {
    console.warn("Telegram notification dispatch error:", err.message);
    return { ok: false, error: err.message };
  }
}

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

  // Handle Telegram Test Alert Action
  if (req.method === "POST" && req.body && req.body.action === "test_telegram") {
    const testOrder = {
      id: "TEST-" + Math.floor(1000 + Math.random() * 9000),
      customerName: "Lashari Test Customer",
      phone: "0321-2920914",
      address: "Shop #3, Plot no. B-34, Lashari Communication, Karachi",
      items: [
        { title: "Ultra Smartwatch 2.0 Titanium", qty: 1, price: 3499, color: "Black" },
        { title: "Luxury MagSafe Frosted Matte Armor Case", qty: 1, price: 1450, color: "Navy Blue" }
      ],
      subtotal: 4949,
      deliveryFee: 200,
      total: 5149,
      paymentMethod: "Cash on Delivery",
      courierPartner: "TCS Express & Leopards Delivery",
      date: new Date().toISOString().replace("T", " ").slice(0, 16)
    };

    const result = await sendTelegramOrderAlert(testOrder, {
      token: req.body.botToken || DEFAULT_TELEGRAM_TOKEN,
      chatId: req.body.chatId || DEFAULT_TELEGRAM_CHAT_ID
    });

    return json(res, 200, {
      ok: result.ok,
      error: result.error,
      message: result.ok ? "Telegram test notification sent successfully! Check your Telegram app 📲" : `Failed to deliver Telegram message: ${result.error || "Unknown error"}`
    });
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

          // Send instant Telegram notification to store owner!
          sendTelegramOrderAlert(single).catch(err => console.warn("Telegram notification error:", err));
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
