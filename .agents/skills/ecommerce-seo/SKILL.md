---
name: ecommerce-seo
description: >-
  Expert eCommerce SEO guidelines, schema validation, and search ranking maintenance
  for Lashari Communication. Use whenever adding new products, editing JSON-LD structured
  data, updating sitemap.xml with image tags, auditing Google Merchant listings, or optimizing
  on-page SEO and Core Web Vitals.
---

# Lashari Communication eCommerce SEO Skill

This skill enforces Google Search Central and Schema.org zero-warning standards across the **Lashari Communication** storefront (`https://www.lasharicommunication.com/`).

---

## 🎯 When to Apply This Skill
Activate this skill whenever:
1. Adding, editing, or re-ordering products in `data/products.json` or `index.html`.
2. Modifying structured data (`<script type="application/ld+json">`).
3. Updating images or adding new product photo galleries.
4. Editing `sitemap.xml`, `robots.txt`, or `vercel.json` routing.
5. Reviewing Google Search Console indexing, Rich Results warnings, or Core Web Vitals.

---

## 🛠️ Step-by-Step SEO Procedures

### 1. Zero-Warning Google Merchant & Product Schema
When adding a product to the `@graph` structured data in `index.html`, **NEVER** omit any of the following fields:

- `name`: Full title with model and core specification.
- `image`: Array of absolute image URLs.
- `description`: Clean prose describing sound, build, battery, or compatibility.
- `sku`: Product ID (e.g. `prod-1794650941855`).
- `mpn`: Model part code (e.g. `K8-MIC-PK`).
- `brand`: `{ "@type": "Brand", "name": "Universal Tech" }`.
- `aggregateRating`:
  - `ratingValue`: e.g. `"4.8"` (out of 5).
  - `reviewCount`: e.g. `"42"`.
  - `bestRating`: `"5"`.
  - `worstRating`: `"1"`.
- `offers`:
  - `priceCurrency`: `"PKR"`.
  - `price`: Clean integer string (e.g. `"1050"`).
  - `priceValidUntil`: Future date string (e.g. `"2027-12-31"`).
  - `availability`: `"https://schema.org/InStock"`.
  - `itemCondition`: `"https://schema.org/NewCondition"`.
  - `shippingDetails`:
    - `shippingRate`: `{ "@type": "MonetaryAmount", "value": "200", "currency": "PKR" }`.
    - `shippingDestination`: `{ "@type": "DefinedRegion", "addressCountry": "PK" }`.
    - `deliveryTime`: `{ "@type": "ShippingDeliveryTime", "handlingTime": { "minValue": 0, "maxValue": 1, "unitCode": "DAY" }, "transitTime": { "minValue": 2, "maxValue": 4, "unitCode": "DAY" } }`.
  - `hasMerchantReturnPolicy`:
    - `applicableCountry`: `"PK"`.
    - `returnPolicyCategory`: `"https://schema.org/MerchantReturnFiniteReturnWindow"`.
    - `merchantReturnDays`: `7`.
    - `returnMethod`: `"https://schema.org/ReturnByMail"`.
    - `returnFees`: `"https://schema.org/FreeReturn"`.

---

### 2. Updating Google Image Sitemap (`sitemap.xml`)
When a high-priority hero product is added:
1. Open `sitemap.xml`.
2. Under the root storefront `<url>` (`https://www.lasharicommunication.com/`), append an `<image:image>` block:
   ```xml
   <image:image>
     <image:loc>[HIGH_RES_IMAGE_URL]</image:loc>
     <image:title>[PRODUCT_TITLE]</image:title>
     <image:caption>[KEYWORD_RICH_CAPTION]</image:caption>
   </image:image>
   ```
3. Update `<lastmod>` to the current ISO date (`YYYY-MM-DD`).
4. **CRITICAL:** Do NOT add URL fragments (e.g. `/#collection`) to `<loc>` in `sitemap.xml`. Google strips fragments and flags duplicate URLs.

---

### 3. Canonical & Crawling Hygiene
1. **Never link to `index.html`:** Always use `/` as the canonical storefront URL.
2. In `vercel.json`, ensure `/index.html` is permanently 301-redirected to `/`.
3. In `robots.txt`:
   - Keep `/portalsafe.html`, `/api/`, and `/data/` strictly **disallowed**.
   - Keep `/`, `/images/`, `/css/`, and `/js/` **allowed** for `Googlebot` and `Googlebot-Image`.
   - Ensure the `Sitemap:` directive points to `https://www.lasharicommunication.com/sitemap.xml`.

---

### 4. Visible Content Agreement (FAQ & Guarantees)
- Google penalizes hidden schema content. Any Question/Answer in `FAQPage` schema **must** exist in plain text inside the visible `<section class="faq-section" id="faq">` on `index.html`.
- Maintain identical answers in both the DOM accordion and the JSON-LD script block.

---

### 5. Automated Verification Script
Before committing any changes to git, run the workspace SEO verification script to ensure the JSON-LD parses cleanly:
```bash
node -e "
const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const match = html.match(/<script type=\"application\/ld\+json\">([\s\S]*?)<\/script>/);
if (!match) throw new Error('No JSON-LD found');
const data = JSON.parse(match[1]);
console.log('Valid JSON-LD with', data['@graph'].length, 'graph entities');
"
```

---

## 📋 Quality Checklist
- [ ] JSON-LD valid and parsed without syntax errors.
- [ ] Product ratings, reviews, PKR pricing, and InStock status present.
- [ ] Flat Rs. 200 shipping & 7-day checking warranty included in Offer schema.
- [ ] Images have descriptive alt text and explicit aspect ratios.
- [ ] `sitemap.xml` updated without fragment hashes (`#`).
- [ ] No `index.html` occurrences in public canonical links.

