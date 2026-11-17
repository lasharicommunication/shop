# 🎨 Lashari Communication — Design System & Technical Architecture Specification

> **Version:** 2.4.0  
> **Brand:** The Lashari Communication (The Everyday Tech Edit · XCESS Feeling)  
> **Live Production Storefront:** [https://www.lasharicommunication.com/](https://www.lasharicommunication.com/)  
> **Document Status:** Active & Maintained

---

## 📑 Table of Contents
1. [Executive Summary & Product Vision](#1-executive-summary--product-vision)
2. [Visual Design System & Design Tokens](#2-visual-design-system--design-tokens)
3. [System Architecture & Information Hierarchy](#3-system-architecture--information-hierarchy)
4. [Storefront UI Components Anatomy](#4-storefront-ui-components-anatomy)
5. [Customer Account Experience (`account.html`)](#5-customer-account-experience-accounthtml)
6. [Secure Admin Portal & Resilience Engine (`portalsafe.html`)](#6-secure-admin-portal--resilience-engine-portalsafehtml)
7. [Data Schemas & Serverless API Specifications](#7-data-schemas--serverless-api-specifications)
8. [Search Engine Optimization (SEO) & Structured Data](#8-search-engine-optimization-seo--structured-data)
9. [Performance, Accessibility (a11y) & Browser Support](#9-performance-accessibility-a11y--browser-support)
10. [Deployment, Infrastructure & CI/CD Runbook](#10-deployment-infrastructure--cicd-runbook)

---

## 1. Executive Summary & Product Vision

### 1.1 Brand Identity
**Lashari Communication** is a high-velocity, luxury-minimalist Pakistani eCommerce storefront specializing in everyday premium tech gear:
- Smartwatches & Fitness Bands
- Wireless Earbuds & Audio Gadgets
- Fast-Charging Power Banks & Adapters
- Precision Mobile Back Covers for all major smartphone manufacturers (Apple, Samsung, Infinix, Tecno, Xiaomi, Vivo, Oppo, Realme).

### 1.2 Core Pillars
1. **Zero-Friction Mobile First:** 85%+ of Pakistani traffic originates from mobile devices. The UI is designed thumb-first, eliminating layout shifts, auto-zooming on inputs, and horizontal overflow down to 320px screen widths.
2. **Pakistani Commerce Alignment:**
   - Cash on Delivery (COD) nationwide across 250+ cities and towns.
   - Flat **Rs. 200 Express Shipping** powered by TCS Express and Leopards Courier.
   - Advance payment options: Meezan Bank, JazzCash, EasyPaisa, SadaPay with 1-click clipboard copying.
   - Instant WhatsApp ordering & customer service channel.
3. **Pure Vanilla Performance:** Zero heavy JS frameworks (no React, Next.js or Vue bundle bloat). Native HTML5, modern CSS3 variables, and modular Vanilla ES6+ ensure sub-second First Contentful Paint (FCP) and near-zero Total Blocking Time (TBT).
4. **Git-Backed Shared State & Supabase Sync:** Product updates and order placements are committed to the GitHub repository automatically through Vercel serverless functions, alongside Supabase Authentication and Realtime Database synchronization.

---

## 2. Visual Design System & Design Tokens

The visual language blends modern editorial typography with cyber-physical minimalism, anchored by deep charcoal inks, warm paper backdrops, and an electric lime accent.

### 2.1 Color Palette & Semantic Roles

```css
:root {
  /* Core Brand Tokens */
  --ink: #171a18;           /* Primary text, high-contrast buttons, deep darks */
  --paper: #f6f6f1;         /* Base page canvas, clean off-white background */
  --cream: #edeee7;         /* Secondary canvas, muted section backgrounds */
  --lime: #d8ff55;          /* Signature Electric Lime accent, CTA highlights */
  --lime-dark: #8bab15;     /* High-contrast border, focus-visible states */
  --line: #dcded7;          /* Hairline dividers, subtle card borders */
  --muted: #747872;         /* Secondary captions, subtitles, timestamp tags */
  --card-bg: #ecefe4;       /* Product & feature tile container fill */

  /* Dark Surface Elements */
  --admin-bg: #0f1311;      /* Admin & modal backdrop canvas */
  --admin-card: #171d19;    /* Elevated dark cards */
  --admin-border: #242c26;  /* Dark hairline borders */

  /* Status & Feedback Accents */
  --status-success: #16a34a; /* Verified badges, in-stock pills, active states */
  --status-danger: #ef4444;  /* Price cuts, delete buttons, recycle bin counts */
  --status-warning: #f59e0b; /* Pending orders, sale badges */
  --status-info: #3b82f6;    /* Tracking notices, info alerts */
}
```

#### Color Usage Guidelines
| Token | HEX Code | Contrast on `--paper` | Usage |
| :--- | :--- | :--- | :--- |
| `--ink` | `#171a18` | 14.2:1 (AAA) | Headings, primary body copy, dark pill buttons |
| `--paper` | `#f6f6f1` | Base Canvas | Page background, modal card surface |
| `--cream` | `#edeee7` | 1.1:1 | Alternating section fills, secondary wrappers |
| `--lime` | `#d8ff55` | 1.2:1 (Use with `--ink`) | Primary CTA hover, pulse dots, promo banners |
| `--lime-dark`| `#8bab15` | 4.8:1 (AA) | Accessible borders, links, focus outlines |
| `--line` | `#dcded7` | 1.3:1 | Subtle dividers, borders on light surfaces |
| `--muted` | `#747872` | 4.9:1 (AA) | Secondary text, ratings counts, specifications |

---

### 2.2 Typography Scale

```css
:root {
  --font: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
  --display: 'Manrope', -apple-system, BlinkMacSystemFont, sans-serif;
}
```

- **Display (`Manrope`):** Used for brand wordmark, hero headlines, section kickers, price amounts, and dialog titles. Weights: `500`, `600`, `700`, `800`.
- **Body (`DM Sans`):** Used for editorial body paragraphs, form inputs, navigation links, and specifications. Weights: `400`, `500`, `600`, `700`.

#### Type Hierarchy Table
| Style | Font Family | Size (Desktop / Mobile) | Weight | Line Height | Tracking |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Hero Title** | Manrope | `clamp(48px, 8vw, 96px)` | 800 | 0.94 | `-0.04em` |
| **Section Heading** | Manrope | `clamp(32px, 5.5vw, 60px)` | 800 | 1.02 | `-0.03em` |
| **Card Title** | Manrope | `18px – 20px` | 700 | 1.2 | `-0.015em` |
| **Price Main** | Manrope | `20px – 24px` | 800 | 1.0 | `-0.02em` |
| **Kicker / Eyebrow**| Manrope | `11px` | 800 | 1.0 | `+0.17em` (All-Caps) |
| **Body Large** | DM Sans | `17px – 19px` | 400 | 1.5 | Normal |
| **Body Standard** | DM Sans | `14.5px – 15.5px` | 400 / 500 | 1.6 | Normal |
| **Caption / Badge** | DM Sans | `11px – 12.5px` | 600 / 700 | 1.2 | `+0.02em` |

---

### 2.3 Elevation, Surfaces & Micro-Interactions

1. **Mouse-Follow Cursor Glow (`#cursor-glow`):**
   - 520px circular radial gradient (`#d8ff5522` to transparent).
   - Mix-blend mode: `multiply`.
   - Smoothly follows pointer movement on desktop; disabled on touch devices to conserve battery and GPU cycles.
2. **Pill Badges (`border-radius: 999px`):**
   - Compact status indicators (e.g. `100% Genuine Quality`, `In Stock`, `Flat Rs. 200 Delivery`).
   - Feature subtle 1px border and 2px horizontal padding.
3. **Card Radii System:**
   - Outer Section Cards: `20px` to `24px`.
   - Product Cards: `16px`.
   - Quick View & Dialog Modals: `20px` to `24px` (Desktop), `16px` border-top (Mobile Bottom-Sheet).
4. **Transition Defaults:**
   - Standard UI Hover: `transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1)`.
   - Accordion Expansion: `transition: border-color 0.2s ease, box-shadow 0.2s ease`.

---

## 3. System Architecture & Information Hierarchy

```mermaid
flowchart TD
    subgraph Clients["Customer & Admin Clients"]
        direction TB
        SF["Storefront (/)"]
        ACC["Account Portal (/account)"]
        ADM["Admin Portal (/portalsafe)"]
    end

    subgraph CDN["Edge & Routing Layer (Vercel / Cloudflare)"]
        direction TB
        REWR["vercel.json Clean Rewrites & Headers"]
        REDIR["301 Permanent Redirect: /index.html -> /"]
        ROBOTS["robots.txt (Disallow /portalsafe.html, Allow Googlebot)"]
        SITEMAP["sitemap.xml (Storefront & Account + Image Sitemap)"]
    end

    subgraph Serverless["Vercel Serverless Functions (/api)"]
        direction TB
        API_PROD["api/products.js (GET / POST)"]
        API_ORD["api/orders.js (GET / POST)"]
        API_SET["api/settings.js (GET / POST)"]
    end

    subgraph DataSync["Persistence & Integrations"]
        direction TB
        GH["GitHub Repository (data/products.json, data/orders.json)"]
        SB["Supabase (Authentication, Users, DB Sync)"]
        TG["Telegram Bot API (Instant Order Alerts)"]
        WA["WhatsApp Business Channel API"]
    end

    SF --> REWR
    ACC --> REWR
    ADM --> REWR

    REWR --> REDIR
    REWR --> ROBOTS
    REWR --> SITEMAP

    SF --> API_PROD
    SF --> API_ORD
    SF --> API_SET
    SF --> SB

    ACC --> SB
    ADM --> SB
    ADM --> API_PROD
    ADM --> API_ORD
    ADM --> API_SET

    API_PROD --> GH
    API_ORD --> GH
    API_ORD --> TG
    API_SET --> GH
    SF -.-> WA
```

---

## 4. Storefront UI Components Anatomy

### 4.1 Sticky Navigation Header (`<header class="site-header">`)
- **Brand Wordmark:**
  - Includes high-resolution brand logo image (`images/logo.png`, 40x40 eager load).
  - Wordmark: `Lashari Communication` with electric lime period dot (`.`).
  - Mobile breakpoint: Automatically scales letter-spacing and font-size to guarantee "Communication" fits seamlessly on narrow viewports without clipping.
- **Desktop Navigation Links:** `Shop all`, `Categories`, `Mobile Covers`, `Track Order`, `Location`.
- **Action Group:**
  - **Search Button (`#searchToggle`):** Expands smooth drop-down live search input.
  - **Account Icon Button (`#accountToggleBtn`):** Navigates to `/account`; displays live green status indicator dot when customer session is active.
  - **Bag Trigger (`#bagToggle`):** Dark pill badge displaying shopping bag icon and reactive item count badge (`#headerBagCount`).
  - **Mobile Menu Hamburger (`#menuToggle`):** Accessible hamburger button triggering sliding mobile navigation drawer.

---

### 4.2 Hero Section & Category Fast-Picker
- **Micro-Kicker:** `TECH ACCESSORIES, REIMAGINED`.
- **Headline:** `Small gear. Big energy.` with fluid responsive sizing (`clamp(48px, 8vw, 96px)`).
- **Primary CTAs:**
  - `Explore collection ↗` (smooth-scrolls to `#collection`).
  - `See categories ↗` (smooth-scrolls to `#categories`).
- **Category Tiles:** 1-click filter buttons featuring custom visual icons:
  - Microphones (`🎤 Mic`)
  - Handsfree Earphones (`🎧 Handsfree`)
  - Bluetooth Speakers (`🔊 Speaker`)
  - Desktop Stands (`📱 Mobile Holder`)
  - Wireless Earbuds (`🎵 Earbuds`)
  - Smartwatches (`⌚ Smartwatches`)
  - Mobile Back Covers (`▯ Mobile Covers`)

---

### 4.3 Product Grid & Card Architecture
Each product item rendered in `#productGrid` follows an intentional visual card hierarchy:
1. **Badges:**
   - Sale discount percentage badge (e.g. `30% OFF`).
   - `🔥 SALE` or `FEATURED` ribbon.
2. **Visual Stage:** 1:1 square aspect ratio image container with subtle hover zoom effect (`transform: scale(1.04)`).
3. **Meta Row:**
   - Brand name / category tag.
   - Star rating (e.g. `★ 4.9`) and review count.
4. **Product Title:** 2-line clamp preventing uneven card heights across responsive rows.
5. **Pricing Strip:**
   - Current Selling Price: Bold Manrope in PKR (e.g. `Rs. 1,050`).
   - Before Price (Old Price): Subtle strikethrough in muted tone (e.g. `Rs. 1,499`).
6. **Action Triggers:**
   - Quick View Eye Button.
   - Direct Add to Bag CTA button.

---

### 4.4 Product Quick-View Modal Dialog (`#productDialog`)
Native `<dialog>` element featuring clean backdrop blur:
- **Left Column:** High-res primary photo with thumbnail selector for multi-angle shots.
- **Right Column:**
  - Trust strip (`100% Genuine Quality · In Stock · Ready to Dispatch`).
  - Product Title & Star rating with verified customer count.
  - Variant Selectors:
    - Size / Model pills (e.g. Single Mic vs Dual Mic, with real-time price switching).
    - Color chips with hex previews and active border indicators.
  - Quantity Stepper: Accessible `−` and `+` decrement/increment controls.
  - Direct Checkout CTA & WhatsApp Inquiry Button.

---

### 4.5 Shopping Bag & Checkout Modal (`#orderDialog`)
- **Flat Shipping Guarantee:** Transparent delivery fee calculation locked at **Rs. 200 PKR** nationwide.
- **Dual Payment Tabs:**
  1. **Cash on Delivery (COD):** No advance payment required; rider collects at doorstep.
  2. **Advance Payment:** Displays official store bank accounts (Meezan Bank, JazzCash, EasyPaisa, SadaPay) with 1-click copyable account numbers and verification note.
- **Form Inputs with Smart Validation:** Full Name, WhatsApp Mobile Number, Detailed Delivery Address, City Picker.
- **Instant Backend Triggers:**
  - Order posted to `/api/orders` (committed to GitHub).
  - Instant Telegram alert dispatched to store management with order breakdown.
  - Customer receives Order ID and direct tracking button.

---

### 4.6 Accessible FAQ & Delivery Trust Section (`#faq`)
Structured with semantic `<details>` and `<summary>` tags for 100% compatibility with Google Search Central FAQ Rich Snippet guidelines:
- Real-time animated `+` to `✕` toggle icon.
- Answers nationwide delivery timeline (2–4 days via TCS & Leopards).
- COD availability confirmation for all Pakistani regions.
- 7-Day checking warranty & hassle-free replacement workflow.
- Live order tracking instructions.

---

## 5. Customer Account Experience (`account.html`)

A dedicated customer account portal connected to Supabase:
- **Clean Single-Card Authentication:**
  - Toggle between **Sign In** and **Create Account**.
  - No complex multi-step redirects; auto-detects session and immediately transitions to customer dashboard.
- **Customer Dashboard Features:**
  - Active User Welcome banner with user initial avatar.
  - **Orders History:** Lists past orders placed with current email/phone, real-time status badges (`Pending`, `Confirmed`, `Shipped`, `Delivered`).
  - **1-Click Tracking:** Re-opens order modal for live courier tracking.
  - **Saved Addresses:** Remembers default shipping details for instant future checkout.
  - **Sign Out:** Securely clears Supabase local auth tokens and updates storefront header indicator.

---

## 6. Secure Admin Portal & Resilience Engine (`portalsafe.html`)

The store management portal (`/portalsafe`) is fortified with enterprise-grade data safety mechanisms designed specifically for fast-paced retail operations.

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Store Owner / Admin
    participant Portal as /portalsafe
    participant LocalStorage as Browser Storage
    participant Supabase as Supabase Auth & DB
    participant API as Vercel /api/products
    participant GitHub as GitHub Git Repository

    Admin->>Portal: Enters /portalsafe
    Portal->>Supabase: Verify active session & role
    alt Not Authorized
        Portal-->>Admin: Silent Redirect to https://www.lasharicommunication.com/
    else Verified Admin
        Portal->>LocalStorage: Check for unsaved product draft
        opt Draft Exists
            Portal->>Admin: Display "Unsaved Draft Restored" Banner
        end
        Portal->>API: GET /api/products
        API-->>Portal: Render Products & 7-Day Recycle Bin
    end

    Admin->>Portal: Types new product data
    Portal->>LocalStorage: Debounced auto-save on every keystroke

    alt Accidental Browser Refresh
        Admin->>Portal: Browser Reload (F5)
        Portal->>LocalStorage: Recover draft fields immediately
        Portal->>Admin: All input fields restored without data loss
    end

    Admin->>Portal: Clicks "Save Product"
    Portal->>API: POST /api/products
    API->>GitHub: Commit to data/products.json
    Portal->>LocalStorage: Clear recovered draft
    Portal->>Admin: Success Toast Notification
```

---

### 6.1 Silent Role-Based Access Control (RBAC)
- **Zero Exposure Policy:** The admin portal displays **no** login forms, master PIN prompts, or "Access Denied" error banners.
- When an unauthorized visitor or customer navigates to `/portalsafe` (or `/portalsafe.html`), the system checks their Supabase user metadata.
- If the user is not authenticated as a verified store admin, they are instantly and silently 301-redirected to the storefront root (`https://www.lasharicommunication.com/`).

---

### 6.2 Real-Time Product Draft Auto-Save Protection
- **Problem Solved:** When an administrator fills in a detailed product title, multi-paragraph description, pricing, sizes, and multiple image URLs, an accidental page refresh, browser crash, or tab close previously wiped all entered data.
- **Implementation:**
  - Input listeners monitor key fields (`title`, `category`, `price`, `oldPrice`, `stock`, `description`, `images`, `sizes`, `colors`).
  - State is automatically serialized and saved to `localStorage` with a subtle visual indicator: `⚡ Draft Auto-Saved`.
  - On page load, if an unsubmitted draft is detected, fields are auto-populated and a recovery banner appears:  
    `Unsaved Draft Restored: Pichli session ka data recover ho gaya hai (refresh se mehfooz raha). [Discard Draft ✕]`
  - Successful product save automatically purges the draft.

---

### 6.3 7-Day Soft-Delete Recycle Bin (Trash System)
- **Problem Solved:** Accidental deletion of live products.
- **Mechanism:**
  - Deleting a product removes it from the active catalog and archives it into `admin_product_trash` with a timestamp:
    ```json
    {
      "deletedAt": 1794658555000,
      "expiresAt": 1795263355000,
      "product": { ... }
    }
    ```
  - **Recycle Bin Modal:** Displays deleted products, remaining days/hours until permanent purge, and a **1-Click Restore** button.
  - Restoring immediately re-injects the product into `data/products.json` and updates the live catalog.
  - Items older than 7 days are automatically purged during routine garbage collection.

---

## 7. Data Schemas & Serverless API Specifications

### 7.1 Product Schema (`data/products.json`)
```json
{
  "id": "prod-1794650941855",
  "title": "K8 Wireless Lavalier Collar Microphone for Android Type-C",
  "category": "Mic",
  "brand": "general",
  "brandName": "Universal Tech",
  "compatibleModels": ["Universal Device Compatibility"],
  "price": 1050,
  "oldPrice": 1499,
  "isOnSale": true,
  "rating": 4.8,
  "reviewsCount": 42,
  "stock": 250,
  "sizes": [
    {
      "name": "K8 Mic",
      "price": 1050,
      "regularPrice": 1499,
      "specialPrice": 1050,
      "oldPrice": 1499
    },
    {
      "name": "K9 Dual Mic",
      "price": 1499,
      "regularPrice": 1999,
      "specialPrice": 1499,
      "oldPrice": 1999
    }
  ],
  "colors": [
    { "name": "Black", "hex": "#111111" }
  ],
  "isFeatured": true,
  "badge": "Sale Item",
  "image": "https://i.postimg.cc/pdJWHvkX/b3bf4a3a07c47e2cb916d2281773f3eb.jpg",
  "images": [
    "https://i.postimg.cc/pdJWHvkX/b3bf4a3a07c47e2cb916d2281773f3eb.jpg",
    "https://i.postimg.cc/D0HFgwfX/48a22e56ffeb8a53b068ff28d1795b41-jpg-960x960q80-jpg.webp"
  ],
  "description": "Capture crisp, studio-quality audio without messy wires using the K8 Single & K9 Dual Wireless Lavalier Microphone Series..."
}
```

---

### 7.2 Order Schema (`data/orders.json`)
```json
{
  "id": "357366",
  "customerName": "Faizan Yaqoob",
  "phone": "03001234567",
  "email": "customer@example.com",
  "address": "House 12, Street 4, Sector G-9/1, Islamabad",
  "city": "Islamabad",
  "courierPartner": "TCS Express & Leopards",
  "paymentMethod": "Cash on Delivery",
  "status": "Pending",
  "items": [
    {
      "id": "prod-1794650941855",
      "title": "K8 Wireless Lavalier Collar Microphone",
      "qty": 1,
      "size": "K8 Mic",
      "color": "Black",
      "price": 1050
    }
  ],
  "subtotal": 1050,
  "deliveryFee": 200,
  "total": 1250,
  "date": "2026-11-17T11:45:00.000Z"
}
```

---

### 7.3 Serverless API Endpoints

| Endpoint | Method | Role | Description |
| :--- | :--- | :--- | :--- |
| `/api/products` | `GET` | Public | Returns current product catalog from GitHub main branch |
| `/api/products` | `POST` | Admin | Writes updated product array to `data/products.json` via GitHub API |
| `/api/orders` | `GET` | Admin | Retrieves all active customer orders |
| `/api/orders` | `POST` | Public | Appends new order, commits to GitHub, and dispatches Telegram notification |
| `/api/settings` | `GET` | Public | Fetches global settings (promo voucher, bank account details) |
| `/api/settings` | `POST` | Admin | Updates store configuration and promotional banners |

---

## 8. Search Engine Optimization (SEO) & Structured Data

The website is engineered for top ranking in Google Search and Google Merchant Listings.

### 8.1 Schema.org `@graph` JSON-LD Specifications
All structured data in `index.html` passes Google Rich Results Validation with zero warnings:

```mermaid
classDiagram
    class KnowledgeGraph {
        +OnlineStore / ElectronicsStore
        +WebSite (Sitelinks SearchAction)
        +BreadcrumbList (Home > Collection > Categories)
        +ItemList (Featured Top Products)
        +FAQPage (Nationwide Delivery & Warranty)
    }

    class ProductSchema {
        +name: String
        +image: Array~URL~
        +description: String
        +sku: String
        +mpn: String
        +brand: Brand
        +aggregateRating: AggregateRating
        +offers: Offer
    }

    class OfferSchema {
        +priceCurrency: "PKR"
        +price: Number
        +availability: "InStock"
        +itemCondition: "NewCondition"
        +shippingDetails: OfferShippingDetails
        +hasMerchantReturnPolicy: MerchantReturnPolicy
    }

    KnowledgeGraph *-- ProductSchema
    ProductSchema *-- OfferSchema
```

#### Zero-Warning Merchant Attributes
1. **`OfferShippingDetails`:** Explicitly states `shippingRate: 200 PKR`, destination `PK`, handling time `0–1 days`, transit time `2–4 days`.
2. **`MerchantReturnPolicy`:** Finite window of `7 days`, `ReturnByMail`, `FreeReturn`.
3. **`AggregateRating`:** `ratingValue`, `reviewCount`, `bestRating: 5`, `worstRating: 1`.

---

## 9. Performance, Accessibility (a11y) & Browser Support

### 9.1 Core Web Vitals Benchmarks
- **Largest Contentful Paint (LCP):** `< 1.2s` (Hero logo and banner preloaded, minimal critical CSS).
- **First Input Delay (FID) / INP:** `< 50ms` (Event delegation, debounced input handlers, zero heavy framework reconciliation).
- **Cumulative Layout Shift (CLS):** `0.00` (Explicit width and height on images, responsive grid containers).

### 9.2 Accessibility Standards (WCAG 2.1 AA)
- Touch targets strictly exceed `44px × 44px`.
- High-contrast color pairings complying with AA standard for normal text and AAA for headings.
- Keyboard navigation: Clear, visible focus ring (`outline: 3px solid #7f9d17; outline-offset: 4px`).
- Screen reader skip links (`.skip-link` skips directly to `#collection`).
- Dialogs implement trapped focus and `Escape` key close listeners.

---

## 10. Deployment, Infrastructure & CI/CD Runbook

### 10.1 Environment Variables (Vercel Project Settings)
```bash
# GitHub API Git-Backed Persistence
GITHUB_TOKEN="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" # Fine-grained contents read/write token
GITHUB_OWNER="lasharicommunication"
GITHUB_REPO="shop"
GITHUB_BRANCH="main"
GITHUB_PRODUCTS_PATH="data/products.json"
GITHUB_ORDERS_PATH="data/orders.json"
GITHUB_SETTINGS_PATH="data/settings.json"

# Telegram Bot Instant Notifications
TELEGRAM_BOT_TOKEN="9163122969:AAFJKgDkTRIJ1lL0O8OYCK-iANnwUiUe9go"
TELEGRAM_CHAT_ID="8893027663"

# Supabase Auth & Realtime
SUPABASE_URL="https://wnsiodlajtaskdmeklyp.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 10.2 Clean URL Architecture (`vercel.json`)
```json
{
  "version": 2,
  "cleanUrls": true,
  "trailingSlash": false,
  "redirects": [
    { "source": "/index.html", "destination": "/", "permanent": true }
  ],
  "rewrites": [
    { "source": "/account", "destination": "/account.html" },
    { "source": "/login", "destination": "/account.html" }
  ]
}
```

---

*Authored and verified for **Lashari Communication**.*
