# ⚡ Lashari Communication — Codebase Architecture & Fast-Lookup Index

> **Purpose**: This file provides an exact, instant index of components, line numbers, CSS selectors, JavaScript functions, and data schemas across the Lashari Communication storefront. Use this map to execute direct surgical edits without reading thousands of lines repeatedly.

---

## 🎨 1. Core Design System & Tokens

* **Primary Background**: `#fbfcf8` (Soft Bone / Minimal Paper) / `#ffffff` (Card Surface)
* **Text / Ink**: `#171a18` (Deep Charcoal Onyx) / `#657060` (Muted Olive-Grey)
* **Accent (Electric Lime)**: `#d8ff55` (Active glow, hover badges, highlights)
* **Accent (Forest Sage)**: `#8bab15` (Borders, active states, focus outlines)
* **Border Line**: `1.5px solid rgba(23, 26, 24, 0.08)` / `#e3e7dc`
* **Card Border Radius**: `18px` – `20px` (Desktop) / `12px` – `14px` (Mobile)
* **Typography**:
  - Headings / Display: `--display` (`Syne`, sans-serif)
  - Body: `--body` (`Plus Jakarta Sans`, sans-serif)
* **Icons**: FontAwesome 6 Free Solid & Brands (`fa-solid`, `fa-brands`, `fa-regular`)
* **Standard Delivery Policy**: Flat Rs. 200 Nationwide via TCS & Leopards Express

---

## 📄 2. `index.html` Component & Line Map (~2,100 lines)

| Section / Component | ID / Selector | Approximate Line | Description |
| :--- | :--- | :--- | :--- |
| **Top Announcement Bar** | `#topAnnouncementBar` | `L708 - L713` | Scrolling ticker with flat delivery & guarantees |
| **Site Header & Navigation** | `.site-header`, `#top` | `L714 - L776` | Logo, search pill, account link, shopping bag button, mobile menu |
| **Hero Section** | `#heroSection` | `L777 - L863` | Display typography, product visuals, quick badges |
| **Category Runway Ticker** | `#categoryTicker` | `L864 - L994` | Dual-track continuous marquee with clickable category capsules |
| **Categories Grid** | `#categories` | `L995 - L1162` | 10 squircle category cards with glow & FontAwesome vector icons |
| **Products Collection** | `#collection` | `L1163 - L1209` | Search field, filter tabs, product cards grid & pagination |
| **Customer Reviews** | `#reviewsSection` | `L1210 - L1274` | Rating banner, 3-card carousel, touch swipe, counter & mobile nav |
| **Special Promo Offer** | `#specialOfferSection` | `L1275 - L1299` | Dynamic voucher banner (`FLASH10`), copy coupon button |
| **Brand Selection** | `#brands` | `L1350 - L1436` | Grid of supported phone brands (Apple, Samsung, Infinix, etc.) |
| **Store Location / Map** | `#locationSection` | `L1437 - L1543` | Physical shop address, Google Map embed, timings & WhatsApp button |
| **FAQ Accordion** | `#faq` | `L1544 - L1664` | Collapsible questions regarding delivery, warranty, payments |
| **Site Footer** | `.site-footer` | `L1665 - L1795` | Brand story, quick links, social media, contact info, perks |
| **Product Quick View Modal** | `#productDialog` | `L1796 - L1900` | Gallery slider, color/size selection, quantity controls, Buy Now |
| **Direct Checkout Modal** | `#orderDialog` | `L1901 - L2104` | Order summary, promo voucher code input, address form, COD/Bank toggle |
| **Shopping Bag Drawer** | `#bagDialog` | `L2105 - L2143` | Cart item list, subtotal, checkout button |
| **Order Tracking Modal** | `#trackOrderDialog` | `L2144 - L2180` | Real-time order lookup by phone/order ID |

---

## 🎨 3. `css/style.css` Stylesheet Map (~7,400 lines)

| Block / Style Target | Selectors | Line Range |
| :--- | :--- | :--- |
| **CSS Variables & Base Reset** | `:root`, `body`, `html` | `L1 - L150` |
| **Header & Topbar** | `.topbar`, `.site-header`, `.desktop-nav` | `L150 - L450` |
| **Hero Styles** | `.hero`, `.hero-grid`, `.hero-stage` | `L450 - L503` |
| **Category Runway Ticker** | `.ticker`, `.ticker-track`, `.ticker-item` | `L504 - L637` |
| **Categories Grid (Luxury)** | `.categories-section`, `.category-tile` | `L638 - L800` |
| **Products & Cards** | `.product-card`, `.product-media`, `.price` | `L800 - L1400` |
| **Customer Reviews Carousel** | `.reviews-section`, `.review-card`, `.reviews-nav-btn` | `L4440 - L4800` |
| **Special Promo Card** | `.special-offer-section`, `.offer-card` | `L4800 - L4940` |
| **Location & Contact** | `.location-section`, `.location-info-card` | `L4953 - L5130` |
| **Dialogs & Modals** | `.site-dialog`, `#orderDialog`, `#bagDialog` | `L5435 - L6200` |
| **Order Form & Payment Radio** | `.order-payment-card`, `.order-promo-box` | `L6200 - L6600` |
| **Responsive: Large Desktop (1400px+)** | `@media (min-width: 1400px)` | `L3881 - L3887` |
| **Responsive: Laptop / Tablet (1150px)** | `@media (max-width: 1150px)` | `L3888 - L3905` |
| **Responsive: Landscape Tablet (960px)** | `@media (max-width: 960px)` | `L3906 - L3962` |
| **Responsive: Portrait Tablet (768px)** | `@media (max-width: 768px)` | `L3963 - L4019` |
| **Responsive: Standard Mobile (550px)** | `@media (max-width: 550px)` | `L4020 - L4347` |
| **Responsive: Small Mobile (400px)** | `@media (max-width: 400px)` | `L4348 - L4410` |
| **Responsive: Compact Mobile (330px)** | `@media (max-width: 330px)` | `L4411 - L4419` |

---

## ⚙️ 4. `js/app.js` Architecture & State Map (~2,450 lines)

### Global State (`AppState`)
* `AppState.products`: Array of loaded catalog items from `data/products.json`.
* `AppState.activeCategory`: Currently active category filter (e.g. `"Smartwatch"`, `"Cover"`, `"all"`).
* `AppState.activeFilter`: Filter tabs active key (`"all"`, `"cover"`, `"watch"`, `"audio"`, `"power"`, `"holder"`).
* `AppState.activeBrand`: Selected phone brand (`"apple"`, `"samsung"`, `"all"`).
* `AppState.searchQuery`: Text search term.
* `AppState.cart`: Shopping bag items array.
* `AppState.currentOrder`: Active product being ordered in the checkout dialog.
* `AppState.orderPromo`: Applied promo coupon details (`{ code: "FLASH10", discountPercent: 10 }`).
* `AppState.reviews`: Customer review list from `DEFAULT_REVIEWS`.
* `AppState.currentReviewPage`: Active slide index for reviews carousel.

### Key Function Locations
| Function Name | Line Range | Purpose |
| :--- | :--- | :--- |
| `getColorHexFromName(name)` | `L32 - L49` | Maps color names (`Black`, `Titanium`, etc.) to hex codes |
| `getProductPrice(prod, size)` | `L78 - L107` | Calculates dynamic item price based on selected size/variant |
| `syncStorefrontProducts(list)` | `L258 - L274` | Hot-reloads products when updated in admin or storage |
| `initTicker()` | `L676 - L707` | Click listeners & touch-pause for runway category ticker |
| `renderCategoryStrip()` | `L708 - L754` | Sets up 10 category cards with toggle click filtering |
| `renderFilterTabs()` | `L755 - L792` | Renders and handles collection filter tab buttons |
| `updateFilterTabsActiveState()` | `L793 - L804` | Syncs filter tabs when category or brand is selected |
| `renderBrands()` | `L805 - L861` | Populates and binds brand filter cards |
| `getFilteredProducts()` | `L862 - L908` | Core filtering algorithm combining category, brand, tabs, and query |
| `renderProducts()` | `L947 - L1065` | Renders product cards into `#productGrid` |
| `initReviews()` | `L1066 - L1135` | Initializes customer reviews carousel, touch swipe, and auto-shuffle |
| `renderReviews()` | `L1142 - L1207` | Renders review cards, updates counter and indicator dots |
| `applyOrderPromoCode(code)` | `L1321 - L1390` | Validates and applies promo discount (e.g. `FLASH10` -> 10% off) |
| `addProductToBag(prodId, qty)` | `L1419 - L1463` | Adds product to cart with chosen size/color |
| `openProductQuickView(prodId)` | `L1611 - L1838` | Opens `#productDialog` quick view modal |
| `openOrderModalForProduct(...)` | `L1853 - L2030` | Opens `#orderDialog` direct checkout modal |
| `handleOrderFormSubmit(e)` | `L2127 - L2235` | Validates form and submits order payload to `/api/orders` |

---

## 🗄️ 5. Data & API Schemas

### `data/products.json`
Array of product objects:
```json
{
  "id": "prod_1",
  "title": "...",
  "price": 2499,
  "oldPrice": 3499,
  "category": "Smartwatch",
  "brand": "apple",
  "images": ["images/products/...jpg"],
  "colors": ["Black", "Silver"],
  "sizes": ["49mm"],
  "description": "...",
  "inStock": true
}
```

### `api/orders.js`
* Serverless API route receiving POST orders.
* Interacts with Supabase database table `orders`.
* Auto-calculates flat delivery fee (Rs. 200) and applies promo discounts securely.

---

## 🚀 6. Fast Development Rules (For AI Agents)

1. **Never read whole files**: Check the line ranges in this document and read **only the target lines** using `read_file` (e.g. `StartLine: 860, EndLine: 910`).
2. **Execute Single-Block Edits**: Use `edit_file` with precise `Target` and `Replacement` strings.
3. **Verify Tag Balance & Syntax**: Run `node` syntax check in `scratch/` before committing.
4. **Maintain Responsive Integrity**: Whenever changing desktop styles, verify or update the corresponding media query in `css/style.css` (`L3963` for 768px, `L4020` for 550px).

