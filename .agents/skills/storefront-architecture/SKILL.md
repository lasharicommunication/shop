---
name: storefront-architecture
description: High-speed codebase navigation, component map, and surgical editing guide for Lashari Communication storefront. Use whenever working on index.html, css/style.css, js/app.js, or modifying sections like categories, ticker, hero, reviews, dialogs, checkout, and promo codes.
---

# ⚡ Storefront Architecture Skill — Lashari Communication

This skill provides an instant, pre-compiled mental model of the Lashari Communication codebase. When activated, **do not read entire files** or run broad regex grep scans across `css/style.css`, `index.html`, or `js/app.js`. Use the line directories below for direct, surgical inspections and edits.

---

## 🎯 Direct Component Line Index

### `index.html` (Total ~2,100 lines)
* **Top Announcement Bar**: `L708 - L713` (`#topAnnouncementBar`)
* **Header & Navbar**: `L714 - L776` (`.site-header`, `#top`)
* **Hero Section**: `L777 - L863` (`#heroSection`)
* **Category Runway Ticker**: `L864 - L994` (`#categoryTicker`)
* **Categories Grid (10 Tiles)**: `L995 - L1162` (`#categories`)
* **Products Collection & Toolbar**: `L1163 - L1209` (`#collection`)
* **Customer Reviews Carousel**: `L1210 - L1274` (`#reviewsSection`)
* **Special Promo Offer**: `L1275 - L1299` (`#specialOfferSection`)
* **Phone Brand Grid**: `L1350 - L1436` (`#brands`)
* **Store Location & Google Map**: `L1437 - L1543` (`#locationSection`)
* **FAQ Accordion**: `L1544 - L1664` (`#faq`)
* **Site Footer & Perks**: `L1665 - L1795` (`.site-footer`)
* **Product Quick View Modal**: `L1796 - L1900` (`#productDialog`)
* **Direct Order Checkout Modal**: `L1901 - L2104` (`#orderDialog`)
* **Shopping Bag Drawer**: `L2105 - L2143` (`#bagDialog`)
* **Track Order Modal**: `L2144 - L2180` (`#trackOrderDialog`)

---

### `css/style.css` (Total ~7,400 lines)
* **Base Variables & Design Tokens**: `L1 - L150` (`:root`)
* **Header & Navigation**: `L150 - L450`
* **Hero Section**: `L450 - L503`
* **Category Runway Ticker**: `L504 - L637` (`.ticker`, `.ticker-item`, `.ticker-track`)
* **Categories Grid**: `L638 - L800` (`.category-tile`, `.category-icon-box`)
* **Products Grid & Cards**: `L800 - L1400` (`.product-card`, `.product-media`)
* **Reviews Carousel**: `L4440 - L4800` (`.reviews-section`, `.review-card`)
* **Special Promo Banner**: `L4800 - L4940` (`.offer-card`)
* **Modals & Dialogs**: `L5435 - L6200` (`.site-dialog`, `.order-dialog`)
* **Checkout Form & Promo Input**: `L6200 - L6600` (`.order-promo-box`, `.order-payment-card`)
* **Responsive Breakpoints**:
  - `1400px+` (Large Desktop): `L3881`
  - `1150px` (Tablet/Small Laptop): `L3888`
  - `960px` (Landscape Tablet): `L3906`
  - `768px` (Portrait Tablet): `L3963`
  - `550px` (Standard Mobile): `L4020`
  - `400px` (Small Mobile): `L4348`
  - `330px` (Compact Mobile): `L4411`

---

### `js/app.js` (Total ~2,450 lines)
* **AppState Definition**: `L29`
* **Price & Variety Calculation**: `L78 - L138` (`getProductPrice`)
* **Runway Ticker Click & Touch Listeners**: `L676 - L707` (`initTicker`)
* **Categories Strip Filtering & Toggle**: `L708 - L754` (`renderCategoryStrip`)
* **Filter Tabs Management**: `L755 - L804` (`renderFilterTabs`, `updateFilterTabsActiveState`)
* **Brand Filter Grid**: `L805 - L861` (`renderBrands`)
* **Core Filter Algorithm**: `L862 - L908` (`getFilteredProducts`)
* **Product Card Rendering**: `L947 - L1065` (`renderProducts`)
* **Reviews Carousel Setup & Swipe**: `L1066 - L1227` (`initReviews`, `renderReviews`)
* **Promo Code Application (FLASH10)**: `L1321 - L1390` (`applyOrderPromoCode`)
* **Shopping Bag State & Badges**: `L1419 - L1470` (`addProductToBag`, `updateBagCountBadge`)
* **Product Quick View Modal Logic**: `L1611 - L1852` (`openProductQuickView`)
* **Checkout Order Modal Logic**: `L1853 - L2115` (`openOrderModalForProduct`)
* **Order Form Submission to Backend**: `L2127 - L2235` (`handleOrderFormSubmit`)

---

## ⚡ Fast Workflow Protocol

1. **Direct Inspection**: Never call `read_file` without `StartLine` and `EndLine`. Target only the required 30–60 lines.
2. **Surgical Edits**: Use `edit_file` directly with exact target context from the index.
3. **Responsive Verification**: When editing a section's CSS, check its base styles AND corresponding mobile media queries at `L3963` (768px) and `L4020` (550px).
4. **Validation**: Test JS syntax using `node` on `js/app.js` before concluding turns.

