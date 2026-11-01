# The Lashari Communication - Storefront & Management Web App

Modern, ultra-fast eCommerce website for mobile phone covers and tech accessories with direct WhatsApp ordering and dedicated store management portal.

## 🚀 One-Click Deployments

### Deploying to Vercel
1. Push this repository to your GitHub account.
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import your GitHub repository.
4. Framework Preset: **Other / None** (Static Site).
5. Output Directory: `./` (Root directory).
6. Click **Deploy**. Vercel will automatically read `vercel.json` and deploy with instant global CDN caching and SSL.

### Deploying to Cloudflare Pages
1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com) and go to **Workers & Pages**.
2. Click **Create Application** -> **Pages** -> **Connect to Git**.
3. Select this repository.
4. Build settings:
   - Framework preset: **None**
   - Build output directory: `/` (or leave empty)
5. Click **Save and Deploy**. Cloudflare automatically uses `_headers` and `_redirects`.

---

## Shared Products API (GitHub-backed)

Product additions and changes are stored in `data/products.json` through the secure Vercel API in `api/products.js`.

Configure these environment variables in the Vercel project settings:

- `GITHUB_TOKEN`: fine-grained GitHub token with read/write access to repository contents; never place this value in frontend JavaScript or HTML.
- `GITHUB_OWNER`: repository owner (default: `lasharicommunication`).
- `GITHUB_REPO`: repository name (default: `shop`).
- `GITHUB_BRANCH`: repository branch (default: `main`).
- `GITHUB_PRODUCTS_PATH`: optional JSON path (default: `data/products.json`).

Redeploy after setting `GITHUB_TOKEN`. GitHub API writes commit the shared product catalog automatically, so every storefront visitor receives the same catalog.

---

## 🛠️ Features
- **Modern Tech Aesthetic**: Sleek Ink & Lime dark/light modern typography with smooth animations.
- **Product Lineup**: Dynamic category filters, discount before-price strikethrough, auto-calculated percentage badges, and `🔥 SALE` flags.
- **Advance Payment Accounts**: Meezan Bank, JazzCash, EasyPaisa, SadaPay with 1-click copy-to-clipboard.
- **Customer Reviews**: Dynamic review shuffle with Pakistani customer feedback.
- **Interactive Store Map**: Dynamic Google Maps embed synced with physical shop address.
- **Mobile Responsive**: Fully optimized across desktop, tablet, and mobile screens.
