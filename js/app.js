/**
 * The Lashari Communication (XCESS) - Storefront Logic
 * Modern Minimal Tech Experience
 * - Mouse follow cursor glow
 * - 3D CSS Product Art Rendering
 * - Category Explorer & Interactive Filtering
 * - Product Quick View Modal & Order Modal with TCS/Leopards 200 PKR delivery
 * - Shopping Bag Drawer & Wishlist Saved State
 * - Brand Filter & Live Search
 */

window.AppState = window.AppState || {
  products: [],
  brands: [],
  settings: {},
  cart: [],
  savedWishlist: [],
  activeFilter: "all",
  activeBrand: "all",
  activeCategory: "all",
  searchQuery: "",
  productQtyMap: {}, // prodId -> selected qty
  currentOrderProduct: null,
  currentOrderQty: 1,
  collectionVisibleCount: 8,
  reviews: [],
  currentReviewPage: 0
};
const AppState = window.AppState;
AppState.productSelectedVariety = AppState.productSelectedVariety || {}; // prodId -> { size, color }

function getColorHexFromName(name) {
  if (!name) return "#3b82f6";
  const n = String(name).toLowerCase();
  if (n.includes("black")) return "#111111";
  if (n.includes("white")) return "#ffffff";
  if (n.includes("silver") || n.includes("grey") || n.includes("gray")) return "#9ca3af";
  if (n.includes("gold") || n.includes("champagne")) return "#d4af37";
  if (n.includes("rose")) return "#b76e79";
  if (n.includes("blue") || n.includes("navy")) return "#1e3a8a";
  if (n.includes("purple")) return "#581c87";
  if (n.includes("green")) return "#15803d";
  if (n.includes("titanium")) return "#64748b";
  if (n.includes("red")) return "#dc2626";
  if (n.includes("orange")) return "#ea580c";
  if (n.includes("yellow")) return "#eab308";
  return "#3b82f6";
}

function getSelectedProductVariety(prod) {
  if (!prod) return { size: null, color: null };
  const current = AppState.productSelectedVariety[prod.id] || {};

  let size = current.size;
  if (!size && Array.isArray(prod.sizes) && prod.sizes.length > 0) {
    size = prod.sizes[0];
  }

  let color = current.color;
  if (!color && Array.isArray(prod.colors) && prod.colors.length > 0) {
    const c0 = prod.colors[0];
    color = typeof c0 === "string" ? c0 : (c0.name || "Color");
  }

  return { size: size || null, color: color || null };
}

function selectProductVariety(prodId, type, val, updateQuickView = false, updateOrderModal = false) {
  const prod = AppState.products.find(p => p.id === prodId);
  if (!prod) return;

  const current = getSelectedProductVariety(prod);
  AppState.productSelectedVariety[prodId] = {
    ...current,
    [type]: val
  };

  if (updateQuickView) {
    const dialog = document.getElementById("productDialog");
    if (dialog && dialog.open) {
      openProductQuickView(prodId);
    }
  }

  if (updateOrderModal) {
    const dialog = document.getElementById("orderDialog");
    if (dialog && dialog.open) {
      openOrderModalForProduct(prodId, true);
    }
  }

  // Update active states on the product card directly
  const card = document.querySelector(`.product-card[data-product-id="${prodId}"]`);
  if (card) {
    if (type === "size") {
      card.querySelectorAll(".card-size-pill").forEach(pill => {
        pill.classList.toggle("is-active", pill.textContent.trim() === val);
      });
    } else if (type === "color") {
      card.querySelectorAll(".card-color-dot").forEach(dot => {
        dot.classList.toggle("is-active", dot.title === val);
      });
    }
  }
}

// Calculate columns in product grid (4 desktop, 3 tablet, 2 mobile)
function getGridColumnCount() {
  if (window.innerWidth <= 800) return 2;
  if (window.innerWidth <= 1150) return 3;
  return 4;
}

function resetCollectionVisibleCount() {
  AppState.collectionVisibleCount = 2 * getGridColumnCount();
}

// Initialize Store
document.addEventListener("DOMContentLoaded", async () => {
  // Shared data is loaded from GitHub through the secure Vercel API.
  AppState.settings = Storage.getSettings();
  AppState.brands = Storage.getBrands();
  AppState.products = await Storage.loadProducts();

  // Load cart from LocalStorage
  const savedCart = localStorage.getItem("lashari_cart");
  if (savedCart) {
    try {
      AppState.cart = JSON.parse(savedCart);
    } catch (e) {
      AppState.cart = [];
    }
  }

  // Load wishlist from LocalStorage
  const savedWishlist = localStorage.getItem("xcess_wishlist");
  if (savedWishlist) {
    try {
      AppState.savedWishlist = JSON.parse(savedWishlist);
    } catch (e) {
      AppState.savedWishlist = [];
    }
  }

  // Render Page Components
  // Render Page Components
  AppState.settings = Storage.getSettings();
  renderStoreSettings();
  Storage.loadSettings().then(sharedSettings => {
    if (sharedSettings) {
      AppState.settings = sharedSettings;
      renderStoreSettings();
    }
  });
  initCursorGlow();
  renderCategoryStrip();
  renderFilterTabs();
  renderBrands();
  resetCollectionVisibleCount();
  renderProducts();
  initReviews();
  updateBagCountBadge();
  updateWishlistBadge();
  setupEventListeners();
  initScrollReveal();
});

// Keep an already-open storefront in sync when products are changed in another tab/window.
function syncStorefrontProducts(products) {
  AppState.products = Array.isArray(products) ? products : Storage.getProducts();
  if (typeof renderCategoryStrip === "function") renderCategoryStrip();
  if (typeof renderFilterTabs === "function") renderFilterTabs();
  if (typeof renderBrands === "function") renderBrands();
  if (typeof renderProducts === "function") renderProducts();
}

window.addEventListener("lashari:products-updated", (event) => {
  syncStorefrontProducts(event.detail);
});

window.addEventListener("lashari:settings-updated", (event) => {
  AppState.settings = event.detail || Storage.getSettings();
  if (typeof renderStoreSettings === "function") renderStoreSettings();
});

window.addEventListener("storage", (event) => {
  if (!event.key || event.key === "lashari_products") {
    syncStorefrontProducts();
  }

  if (!event.key || event.key === "lashari_settings") {
    AppState.settings = Storage.getSettings();
    if (typeof renderStoreSettings === "function") renderStoreSettings();
  }

  if (!event.key || event.key === "lashari_brands") {
    AppState.brands = Storage.getBrands();
    if (typeof renderBrands === "function") renderBrands();
  }
});

// Refresh shared products & settings periodically and whenever the page becomes visible again.
setInterval(async () => {
  syncStorefrontProducts(await Storage.loadProducts());
  const freshSettings = await Storage.loadSettings();
  if (freshSettings) {
    AppState.settings = freshSettings;
    renderStoreSettings();
  }
}, 30000);
document.addEventListener("visibilitychange", async () => {
  if (!document.hidden) {
    syncStorefrontProducts(await Storage.loadProducts());
    const freshSettings = await Storage.loadSettings();
    if (freshSettings) {
      AppState.settings = freshSettings;
      renderStoreSettings();
    }
  }
});

// Cursor Glow Follower
function initCursorGlow() {
  const glow = document.getElementById("cursor-glow");
  if (!glow) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let glowX = mouseX;
  let glowY = mouseY;
  let hasMoved = false;

  window.addEventListener("pointermove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!hasMoved) {
      glow.style.opacity = "1";
    }
  });

  function animateGlow() {
    glowX += (mouseX - glowX) * 0.12;
    glowY += (mouseY - glowY) * 0.12;
    glow.style.transform = `translate(${glowX}px, ${glowY}px) translate(-50%, -50%)`;
    requestAnimationFrame(animateGlow);
  }
  animateGlow();
}

// Render Store Settings (Phone, Email, Address, Announcement, Brand)
function renderStoreSettings() {
  const { 
    storeName, 
    email, 
    phone, 
    whatsapp, 
    shopAddress, 
    announcementText, 
    socials, 
    brandName, 
    brandDot,
    locationHeading,
    locationDesc,
    storeTimings,
    googleMapsQuery,
    googleMapsUrl
  } = (AppState.settings || {});

  // Dynamic Brand Logo & Name
  const bName = brandName || "Lashari Communication";
  const bDot = brandDot !== undefined ? brandDot : ".";
  document.querySelectorAll(".brand").forEach(el => {
    el.setAttribute("aria-label", `${bName} home`);
    el.innerHTML = `${bName}<span class="brand-dot">${bDot}</span>`;
  });

  const formattedPhone = phone || "+92 321 2920914";
  const cleanWa = (whatsapp || "923212920914").replace(/[^0-9]/g, "");

  document.querySelectorAll(".shop-email-text").forEach(el => el.textContent = email || "thelasharicommunication@gmail.com");
  document.querySelectorAll(".shop-email-link").forEach(el => el.href = `mailto:${email || "thelasharicommunication@gmail.com"}`);

  document.querySelectorAll(".shop-phone-text").forEach(el => el.textContent = formattedPhone);
  document.querySelectorAll(".shop-whatsapp-link").forEach(el => {
    el.href = `https://wa.me/${cleanWa}?text=Hello%20${encodeURIComponent(bName)}%2C%20I%20want%20to%20place%20an%20order.`;
  });

  const address = shopAddress || "Shop #14, Ground Floor, Lashari Mobile Plaza, Pakistan";
  document.querySelectorAll(".shop-address-text").forEach(el => el.textContent = address);

  // Shop Location Section Dynamic Details
  const locHeadingEl = document.getElementById("displayLocationHeading");
  if (locHeadingEl && locationHeading) locHeadingEl.innerHTML = locationHeading;

  const locDescEl = document.getElementById("displayLocationDesc");
  if (locDescEl && locationDesc) locDescEl.textContent = locationDesc;

  const locStoreTitleEl = document.getElementById("displayLocationStoreTitle");
  if (locStoreTitleEl) locStoreTitleEl.textContent = storeName || "The Lashari Communication";

  const locTimingsEl = document.getElementById("displayLocationTimings");
  if (locTimingsEl && storeTimings) locTimingsEl.innerHTML = storeTimings;

  let finalMapUrl = (googleMapsUrl || "").trim();
  if (finalMapUrl.includes("<iframe") || finalMapUrl.includes("src=")) {
    const match = finalMapUrl.match(/src=["'](.*?)["']/);
    if (match && match[1]) {
      finalMapUrl = match[1];
    }
  }
  if (!finalMapUrl) {
    finalMapUrl = "https://share.google/iiBvxUjHqCga5PFY1";
  }

  const mapIframe = document.getElementById("shopMapIframe");
  if (mapIframe) {
    if (finalMapUrl.includes("output=embed") || finalMapUrl.includes("/maps/embed")) {
      mapIframe.src = finalMapUrl;
    } else {
      const query = googleMapsQuery || address || "Lashari Mobile Plaza, Pakistan";
      mapIframe.src = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
    }
  }
  const mapLink = document.getElementById("shopMapLink");
  if (mapLink) {
    mapLink.href = finalMapUrl;
  }
  const mapFooterLink = document.getElementById("shopMapFooterLink");
  if (mapFooterLink) {
    mapFooterLink.href = finalMapUrl;
  }
  document.querySelectorAll(".location-open-link").forEach(el => {
    el.href = finalMapUrl;
  });

  const annEl = document.getElementById("announcementCustomText");
  if (annEl && announcementText) {
    annEl.textContent = announcementText;
  }

  // Social Links
  const insta = document.getElementById("footerInstaLink");
  if (insta && socials?.instagram) insta.href = socials.instagram;
  const fb = document.getElementById("footerFbLink");
  if (fb && socials?.facebook) fb.href = socials.facebook;
  const tiktok = document.getElementById("footerTiktokLink");
  if (tiktok && socials?.tiktok) tiktok.href = socials.tiktok;

  const yrEl = document.getElementById("year");
  if (yrEl) yrEl.textContent = new Date().getFullYear();

  // Render payment accounts in checkout modal
  renderCustomerPaymentAccounts();

  // Special Offer & Section Visibility
  renderSpecialOffer();
  applySectionVisibility();
}
window.renderStoreInfo = renderStoreSettings;

// Section Visibility Controller (Tick to show, Untick to hide)
function applySectionVisibility() {
  const vis = AppState.settings.sectionVisibility || {};

  const toggle = (id, isShown, defaultTrue = true) => {
    const el = document.getElementById(id);
    if (el) {
      const show = defaultTrue ? (isShown !== false) : (isShown === true);
      el.style.display = show ? "" : "none";
    }
  };

  toggle("topAnnouncementBar", vis.announcement, true);
  toggle("heroSection", vis.hero, true);
  toggle("categories", vis.categories, true);
  toggle("collection", vis.collection, true);
  toggle("reviewsSection", vis.reviews, true);
  toggle("specialOfferSection", vis.offer, true);
  toggle("about", vis.editorial, false);
  toggle("closingSection", vis.closing, false);
  toggle("brands", vis.brands, true);
  toggle("locationSection", vis.location, true);

  const aboutLinks = document.querySelectorAll('a[href="#about"]');
  aboutLinks.forEach(a => {
    a.style.display = (vis.editorial === true) ? "" : "none";
  });

  const locationLinks = document.querySelectorAll('a[href="#locationSection"]');
  locationLinks.forEach(a => {
    a.style.display = (vis.location !== false) ? "" : "none";
  });
}

// Render Special Promo Offer Banner
function renderSpecialOffer() {
  const offer = AppState.settings.specialOffer;
  if (!offer) return;

  const tagEl = document.getElementById("displayOfferTag");
  if (tagEl && offer.tag) tagEl.textContent = offer.tag;

  const titleEl = document.getElementById("displayOfferTitle");
  if (titleEl && offer.title) titleEl.textContent = offer.title;

  const descEl = document.getElementById("displayOfferDesc");
  if (descEl && offer.desc) descEl.textContent = offer.desc;

  const codeEl = document.getElementById("displayOfferCode");
  if (codeEl && offer.code) codeEl.textContent = offer.code;

  const btnTextEl = document.getElementById("displayOfferBtnText");
  if (btnTextEl && offer.btnText) btnTextEl.textContent = offer.btnText;

  const btnLinkEl = document.getElementById("displayOfferBtnLink");
  if (btnLinkEl && offer.btnLink) btnLinkEl.href = offer.btnLink;

  const noteEl = document.getElementById("displayOfferNote");
  if (noteEl && offer.note) noteEl.textContent = offer.note;
}

function copyOfferPromoCode() {
  const code = AppState.settings.specialOffer?.code || "FLASH25";
  copyAccountNumber(code, document.getElementById("btnCopyOfferCode"));
}
window.copyOfferPromoCode = copyOfferPromoCode;
window.copyAccountNumber = copyAccountNumber;
window.jumpToReviewPage = jumpToReviewPage;

// Render Active Payment Accounts in Customer Checkout
function renderCustomerPaymentAccounts() {
  const container = document.getElementById("advanceAccountsList");
  if (!container) return;

  const accounts = (AppState.settings.paymentAccounts || []).filter(acc => acc.active !== false);

  if (accounts.length === 0) {
    const phone = AppState.settings.phone || "+92 321 2920914";
    const wa = AppState.settings.whatsapp || "923212920914";
    container.innerHTML = `
      <div style="padding:10px; text-align:center; color:var(--muted); font-size:11.5px; background:#f7f8f4; border-radius:8px;">
        Account details ke liye barah-e-raast WhatsApp (<a href="https://wa.me/${wa}" target="_blank" style="color:var(--ink); font-weight:700;">${phone}</a>) par rabta karein.
      </div>
    `;
    return;
  }

  container.innerHTML = accounts.map(acc => `
    <div class="advance-acc-card">
      <div class="advance-acc-head">
        <span class="advance-acc-bank">${acc.bankName}</span>
        <span class="advance-acc-title">Title: <strong>${acc.accountTitle}</strong></span>
      </div>
      <div class="advance-acc-num-row">
        <span class="advance-acc-num">${acc.accountNumber}</span>
        <button type="button" class="advance-copy-btn" onclick="copyAccountNumber('${acc.accountNumber}', this)">Copy</button>
      </div>
    </div>
  `).join("");
}

// 1-Click Copy Number for Customer
function copyAccountNumber(num, btn) {
  if (!num) return;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(num).catch(() => copyFallback(num));
  } else {
    copyFallback(num);
  }
  if (btn) {
    const orig = btn.textContent;
    btn.textContent = "Copied! ✓";
    btn.style.background = "#8bab15";
    setTimeout(() => {
      btn.textContent = orig;
      btn.style.background = "";
    }, 2000);
  }
  showToast(`Copied: ${num}`, "success");
}

function copyFallback(text) {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand("copy"); } catch (e) {}
  document.body.removeChild(ta);
}

// 3D Pure CSS Art Generator for Products
function getProductArtHtml(prod) {
  const cat = (prod.category || "").toLowerCase();
  const title = (prod.title || "").toLowerCase();

  if (cat.includes("smartwatch") || title.includes("smartwatch") || title.includes("watch")) {
    return `<div class="art-root"><div class="art-object watch-object"><div class="watch-strap"></div><div class="watch-face"><div class="watch-time">09<span>41</span></div><div class="watch-dot"></div></div></div></div>`;
  }
  if (cat.includes("earbud") || title.includes("earbud") || title.includes("pods")) {
    return `<div class="art-root"><div class="art-object buds-object"><div class="earbud one"></div><div class="earbud two"></div><div class="buds-case"></div></div></div>`;
  }
  if (cat.includes("power bank") || title.includes("power bank") || title.includes("20,000mah")) {
    return `<div class="art-root"><div class="art-object power-object"><div class="power-body"><div class="power-logo">20k</div></div></div></div>`;
  }
  if (cat.includes("cables") || title.includes("cable") || title.includes("braided")) {
    return `<div class="art-root"><div class="art-object cable-object"><div class="cable-loop"></div><div class="cable-tail"></div><div class="cable-plug"></div></div></div>`;
  }
  if (cat.includes("wireless") || title.includes("wireless charger")) {
    return `<div class="art-root"><div class="art-object wireless-object"><div class="wireless-pad"><div class="wireless-pad-ring"></div></div><div class="wireless-phone"><div class="wireless-phone-notch"></div></div></div></div>`;
  }
  if (cat.includes("ring light") || title.includes("ring light")) {
    return `<div class="art-root"><div class="art-object ringlight-object"><div class="ringlight-stand"></div><div class="ringlight-ring"><div class="ringlight-phone"></div></div></div></div>`;
  }
  if (cat.includes("charger") || title.includes("gan") || title.includes("fast charger")) {
    return `<div class="art-root"><div class="art-object charger-object"><div class="charger-pin left"></div><div class="charger-pin right"></div><div class="charger-body"></div></div></div>`;
  }
  if (cat.includes("adapter") || title.includes("adapter")) {
    return `<div class="art-root"><div class="art-object adapter-object"><div class="adapter-body"><div class="adapter-socket"></div></div></div></div>`;
  }
  if (cat.includes("speaker") || title.includes("speaker")) {
    return `<div class="art-root"><div class="art-object speaker-object"><div class="speaker-body"><div class="speaker-grill"></div><div class="speaker-mark">X</div><div class="speaker-top"></div></div></div></div>`;
  }
  if (cat.includes("desk") || title.includes("desk")) {
    return `<div class="art-root"><div class="art-object deskholder-object"><div class="deskholder-base"></div><div class="deskholder-arm"></div><div class="deskholder-clip"></div><div class="deskholder-phone"></div></div></div>`;
  }
  if (cat.includes("car") || title.includes("car")) {
    return `<div class="art-root"><div class="art-object carholder-object"><div class="carholder-vent"></div><div class="carholder-arm"></div><div class="carholder-clip"></div><div class="carholder-phone"></div></div></div>`;
  }
  if (cat.includes("bike") || title.includes("bike")) {
    return `<div class="art-root"><div class="art-object bikeholder-object"><div class="bikeholder-bar"></div><div class="bikeholder-mount"></div><div class="bikeholder-clip"></div><div class="bikeholder-phone"></div></div></div>`;
  }
  // Mobile Case Artwork
  return `<div class="art-root"><div class="art-object cover-object"><div class="cover-shell"><div class="cover-camera"><i></i><i></i></div></div></div></div>`;
}

// Category Strip Setup
function renderCategoryStrip() {
  const strip = document.getElementById("categoryStrip");
  if (!strip) return;

  const categoryMap = {
    smartwatches: "Smartwatch",
    earbuds: "Earbud",
    powerbanks: "Power Bank",
    wirelesschargers: "Wireless Charger",
    cableschargers: "Charger",
    adapters: "Adapter",
    speakers: "Speaker",
    ringlight: "Ring Light",
    mobileholder: "Holder",
    deskholder: "Holder",
    carholder: "Holder",
    bikeholder: "Holder",
    covers: "all"
  };

  strip.querySelectorAll(".category-tile").forEach(tile => {
    tile.addEventListener("click", () => {
      const catKey = tile.dataset.category;
      const targetQuery = categoryMap[catKey] || "";

      strip.querySelectorAll(".category-tile").forEach(t => t.classList.remove("is-active"));
      tile.classList.add("is-active");

      AppState.activeCategory = targetQuery === "all" ? "all" : targetQuery;
      AppState.activeBrand = "all";
      AppState.activeFilter = "all";

      updateFilterTabsActiveState();
      resetCollectionVisibleCount();
      renderProducts();

      const col = document.getElementById("collection");
      if (col) col.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

// Filter Tabs Setup
function renderFilterTabs() {
  const container = document.getElementById("filters");
  if (!container) return;

  const filters = [
    { label: "All Items", key: "all" },
    { label: "Mobile Covers", key: "cover" },
    { label: "Wearables", key: "watch" },
    { label: "Audio", key: "audio" },
    { label: "Power & Cables", key: "power" },
    { label: "Holders & Mounts", key: "holder" }
  ];

  container.innerHTML = filters.map(f => `
    <button type="button" class="filter-button ${AppState.activeFilter === f.key ? 'is-active' : ''}" data-filter="${f.key}">
      ${f.label}
    </button>
  `).join("");

  container.querySelectorAll(".filter-button").forEach(btn => {
    btn.addEventListener("click", () => {
      const fKey = btn.dataset.filter;
      AppState.activeFilter = fKey;
      AppState.activeCategory = "all";
      AppState.activeBrand = "all";

      container.querySelectorAll(".filter-button").forEach(b => b.classList.remove("is-active"));
      btn.classList.add("is-active");

      document.querySelectorAll("#categoryStrip .category-tile").forEach(t => t.classList.remove("is-active"));
      document.querySelectorAll(".brand-card").forEach(c => c.classList.remove("is-active"));

      resetCollectionVisibleCount();
      renderProducts();
    });
  });
}

function updateFilterTabsActiveState() {
  document.querySelectorAll(".filter-button").forEach(b => {
    b.classList.toggle("is-active", b.dataset.filter === AppState.activeFilter);
  });
}

// Brand Selection Grid (Always visible with real company names and models)
function renderBrands() {
  const grid = document.getElementById("brandGrid");
  if (!grid) return;

  const brands = [
    { id: "apple", name: "Apple", iconText: "", models: "iPhone 11 to 16 Pro Max" },
    { id: "samsung", name: "Samsung", iconText: "S", models: "Galaxy S & A Series" },
    { id: "infinix", name: "Infinix", iconText: "In", models: "Note, Hot & Smart" },
    { id: "tecno", name: "Tecno", iconText: "T", models: "Camon & Spark" },
    { id: "xiaomi", name: "Xiaomi", iconText: "Mi", models: "Redmi Note & Poco" },
    { id: "vivo", name: "Vivo", iconText: "V", models: "V-Series & Y-Series" },
    { id: "oppo", name: "Oppo", iconText: "O", models: "Reno & A-Series" },
    { id: "realme", name: "Realme", iconText: "R", models: "Number & C-Series" }
  ];

  grid.innerHTML = brands.map(b => {
    const isActive = AppState.activeBrand === b.id;
    return `
      <div class="brand-card in-view ${isActive ? 'is-active' : ''}" data-brand="${b.id}" title="Filter covers for ${b.name}">
        <div class="brand-logo">
          <span class="brand-logo-text">${b.iconText}</span>
        </div>
        <div class="brand-name">${b.name}</div>
        <div class="brand-models">${b.models}</div>
      </div>
    `;
  }).join("");

  grid.querySelectorAll(".brand-card").forEach(card => {
    card.addEventListener("click", () => {
      const brandId = card.dataset.brand;
      const isAlreadyActive = AppState.activeBrand === brandId;

      if (isAlreadyActive) {
        // Toggle back to all
        AppState.activeBrand = "all";
        card.classList.remove("is-active");
      } else {
        grid.querySelectorAll(".brand-card").forEach(c => c.classList.remove("is-active"));
        card.classList.add("is-active");
        AppState.activeBrand = brandId;
      }

      AppState.activeCategory = "all";
      AppState.activeFilter = "all";

      updateFilterTabsActiveState();
      resetCollectionVisibleCount();
      renderProducts();

      const col = document.getElementById("collection");
      if (col) col.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

// Filter Products Logic
function getFilteredProducts() {
  let list = AppState.products;

  // Filter by active brand
  if (AppState.activeBrand !== "all") {
    list = list.filter(p => p.brand?.toLowerCase() === AppState.activeBrand.toLowerCase());
  }

  // Filter by category strip
  if (AppState.activeCategory !== "all") {
    const q = AppState.activeCategory.toLowerCase();
    list = list.filter(p => 
      (p.category && p.category.toLowerCase().includes(q)) ||
      (p.title && p.title.toLowerCase().includes(q))
    );
  }

  // Filter by filter tabs
  if (AppState.activeFilter !== "all") {
    const f = AppState.activeFilter;
    list = list.filter(p => {
      const cat = (p.category || "").toLowerCase();
      const title = (p.title || "").toLowerCase();
      if (f === "cover") return cat.includes("armor") || cat.includes("case") || cat.includes("silicone") || cat.includes("leather") || cat.includes("clear") || title.includes("case") || title.includes("cover");
      if (f === "watch") return cat.includes("smartwatch") || title.includes("watch");
      if (f === "audio") return cat.includes("earbud") || cat.includes("speaker") || title.includes("earbud") || title.includes("speaker");
      if (f === "power") return cat.includes("power") || cat.includes("charger") || cat.includes("cable") || title.includes("power bank") || title.includes("charger");
      if (f === "holder") return cat.includes("holder") || title.includes("holder") || title.includes("mount") || cat.includes("desk") || cat.includes("car") || cat.includes("bike");
      return true;
    });
  }

  // Filter by search query
  if (AppState.searchQuery.trim() !== "") {
    const q = AppState.searchQuery.toLowerCase();
    list = list.filter(p => 
      p.title.toLowerCase().includes(q) ||
      (p.brandName && p.brandName.toLowerCase().includes(q)) ||
      (p.category && p.category.toLowerCase().includes(q)) ||
      (p.compatibleModels && p.compatibleModels.some(m => m.toLowerCase().includes(q)))
    );
  }

  return list;
}

// Render Products Grid (Shows 2 rows initially, expands by 3 rows on Show More)
function renderProducts() {
  const grid = document.getElementById("productGrid");
  const emptyState = document.getElementById("emptyState");
  const loadMoreBox = document.getElementById("loadMoreContainer");
  const btnLoadMore = document.getElementById("btnLoadMoreProducts");
  if (!grid) return;

  const filtered = getFilteredProducts();

  if (filtered.length === 0) {
    grid.innerHTML = "";
    if (emptyState) emptyState.hidden = false;
    if (loadMoreBox) loadMoreBox.style.display = "none";
    return;
  }

  if (emptyState) emptyState.hidden = true;

  if (!AppState.collectionVisibleCount) {
    resetCollectionVisibleCount();
  }

  const visibleList = filtered.slice(0, AppState.collectionVisibleCount);

  grid.innerHTML = visibleList.map(prod => {
    const currentQty = AppState.productQtyMap[prod.id] || 1;
    const isSaved = AppState.savedWishlist.includes(prod.id);
    const artHtml = renderProductGallery(prod);
    const isOnSale = prod.isOnSale !== false;
    
    // Check if valid before / old price exists
    const hasDiscount = prod.oldPrice && Number(prod.oldPrice) > Number(prod.price);
    const discountPercent = hasDiscount ? Math.round(((prod.oldPrice - prod.price) / prod.oldPrice) * 100) : 0;

    const selectedVariety = getSelectedProductVariety(prod);
    const hasSizes = Array.isArray(prod.sizes) && prod.sizes.length > 0;
    const hasColors = Array.isArray(prod.colors) && prod.colors.length > 0;

    let varietyHtml = "";
    if (hasSizes || hasColors) {
      varietyHtml = `<div class="product-card-varieties">`;
      if (hasSizes) {
        varietyHtml += `
          <div class="card-variety-row" title="Available Sizes">
            ${prod.sizes.map(s => `
              <span class="card-size-pill ${selectedVariety.size === s ? 'is-active' : ''}" onclick="event.stopPropagation(); selectProductVariety('${prod.id}', 'size', '${s.replace(/'/g, "\\'")}')">
                ${s}
              </span>
            `).join("")}
          </div>
        `;
      }
      if (hasColors) {
        varietyHtml += `
          <div class="card-variety-row" title="Available Colors">
            ${prod.colors.map(c => {
              const colName = typeof c === 'string' ? c : (c.name || 'Color');
              const colHex = typeof c === 'string' ? getColorHexFromName(c) : (c.hex || '#3b82f6');
              const isActive = selectedVariety.color === colName;
              return `
                <span class="card-color-dot ${isActive ? 'is-active' : ''}" style="background:${colHex};" title="${colName}" onclick="event.stopPropagation(); selectProductVariety('${prod.id}', 'color', '${colName.replace(/'/g, "\\'")}')"></span>
              `;
            }).join("")}
          </div>
        `;
      }
      varietyHtml += `</div>`;
    }

    return `
      <article class="product-card reveal in-view" data-product-id="${prod.id}">
        <div class="product-media" onclick="openProductQuickView('${prod.id}', event)">
          ${isOnSale ? '<span class="sale-badge">🔥 SALE</span>' : ''}
          <button type="button" class="heart-button ${isSaved ? 'is-saved' : ''}" onclick="event.stopPropagation(); toggleWishlist('${prod.id}')" title="Save to favorites">
            <svg viewBox="0 0 24 24">
              <path d="M20.7 8.5c0 4.3-8.7 10.4-8.7 10.4S3.3 12.8 3.3 8.5A4.7 4.7 0 0 1 12 6.2a4.7 4.7 0 0 1 8.7 2.3Z"/>
            </svg>
          </button>
          ${artHtml}
        </div>

        <div class="product-info-block">
          <div class="product-info-top">
            <h3 class="product-name" onclick="openProductQuickView('${prod.id}', event)">${prod.title}</h3>
            <div class="product-pricing-wrap">
              <div class="product-price-row">
                <span class="product-price-tag">Rs. ${prod.price?.toLocaleString()}</span>
                ${hasDiscount ? `<span class="product-discount-tag">-${discountPercent}%</span>` : ''}
              </div>
              ${hasDiscount ? `<span class="product-old-price">Rs. ${prod.oldPrice.toLocaleString()}</span>` : ''}
            </div>
          </div>

          <p class="product-caption">
            ${prod.compatibleModels ? prod.compatibleModels[0] : 'Universal Tech'} · Flat 200 PKR Delivery
          </p>

          <div class="product-stars">
            <span class="stars-filled">★★★★★</span>
            <span class="stars-count">${prod.rating || 4.9} (${prod.reviewsCount || 38})</span>
          </div>

          ${varietyHtml}

          <div class="product-actions">
            <button type="button" class="btn-buy-now" onclick="openOrderModalForProduct('${prod.id}')">
              Buy Now ↗
            </button>
            <button type="button" class="btn-add-cart" id="btnCart_${prod.id}" onclick="addProductToBag('${prod.id}')">
              Add to Cart +
            </button>
          </div>
        </div>
      </article>
    `;
  }).join("");

  bindProductSliders(grid);

  // Update Show More Button State
  if (loadMoreBox && btnLoadMore) {
    if (filtered.length <= AppState.collectionVisibleCount) {
      loadMoreBox.style.display = "none";
    } else {
      loadMoreBox.style.display = "block";
      const remaining = filtered.length - AppState.collectionVisibleCount;
      btnLoadMore.innerHTML = `Show more items (${remaining} more) <span style="font-size:14px; margin-left:4px;">↓</span>`;
    }
  }
}

// ==========================================================================
// REVIEWS CAROUSEL WITH AUTO-SHUFFLE
// ==========================================================================
let reviewShuffleInterval = null;
let isReviewHovered = false;

function initReviews() {
  AppState.reviews = (typeof DEFAULT_REVIEWS !== "undefined" && DEFAULT_REVIEWS.length > 0) ? DEFAULT_REVIEWS : [];
  renderReviews();

  const prevBtn = document.getElementById("prevReviewsBtn");
  if (prevBtn) {
    prevBtn.addEventListener("click", () => prevReviews());
  }

  const nextBtn = document.getElementById("nextReviewsBtn");
  if (nextBtn) {
    nextBtn.addEventListener("click", () => nextReviews());
  }

  const reviewsSection = document.getElementById("reviewsSection");
  if (reviewsSection) {
    reviewsSection.addEventListener("mouseenter", () => isReviewHovered = true);
    reviewsSection.addEventListener("mouseleave", () => isReviewHovered = false);
  }

  // Auto shuffle every 4.5 seconds
  if (reviewShuffleInterval) clearInterval(reviewShuffleInterval);
  reviewShuffleInterval = setInterval(() => {
    if (!isReviewHovered) {
      nextReviews(true);
    }
  }, 4500);

  window.addEventListener("resize", () => {
    renderReviews();
  });
}

function getVisibleReviewsCount() {
  if (window.innerWidth <= 700) return 1;
  if (window.innerWidth <= 1050) return 2;
  return 3;
}

function renderReviews() {
  const grid = document.getElementById("reviewsGrid");
  const dotsContainer = document.getElementById("reviewsDots");
  if (!grid || !AppState.reviews || AppState.reviews.length === 0) return;

  const perPage = getVisibleReviewsCount();
  const totalPages = Math.ceil(AppState.reviews.length / perPage);

  if (AppState.currentReviewPage >= totalPages) {
    AppState.currentReviewPage = 0;
  }
  if (AppState.currentReviewPage < 0) {
    AppState.currentReviewPage = totalPages - 1;
  }

  const startIdx = AppState.currentReviewPage * perPage;
  const pageReviews = AppState.reviews.slice(startIdx, startIdx + perPage);

  grid.innerHTML = pageReviews.map(rev => `
    <div class="review-card">
      <div class="review-head">
        <div class="review-stars">★★★★★</div>
        <span class="review-verified-badge">✓ Verified Buyer 🇵🇰</span>
      </div>
      <p class="review-text">"${rev.review}"</p>
      <div class="review-item-tag">📦 ${rev.item}</div>
      <div class="review-user-row">
        <img class="review-avatar" src="${rev.avatar}" alt="${rev.name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'">
        <div class="review-user-info">
          <span class="review-name">${rev.name}</span>
          <span class="review-city-time">${rev.city}, Pakistan · ${rev.date}</span>
        </div>
      </div>
    </div>
  `).join("");

  if (dotsContainer) {
    dotsContainer.innerHTML = Array.from({ length: totalPages }).map((_, idx) => `
      <button type="button" class="reviews-dot ${idx === AppState.currentReviewPage ? 'active' : ''}" onclick="jumpToReviewPage(${idx})" aria-label="Review page ${idx + 1}"></button>
    `).join("");
  }
}

function nextReviews(isAuto = false) {
  const perPage = getVisibleReviewsCount();
  const totalPages = Math.ceil((AppState.reviews?.length || 1) / perPage);
  AppState.currentReviewPage = (AppState.currentReviewPage + 1) % totalPages;
  renderReviews();
}

function prevReviews() {
  const perPage = getVisibleReviewsCount();
  const totalPages = Math.ceil((AppState.reviews?.length || 1) / perPage);
  AppState.currentReviewPage = (AppState.currentReviewPage - 1 + totalPages) % totalPages;
  renderReviews();
}

function jumpToReviewPage(idx) {
  AppState.currentReviewPage = idx;
  renderReviews();
}

// Adjust Quantity on Product Card (fallback)
function adjustProductQty(prodId, delta) {
  const cur = AppState.productQtyMap[prodId] || 1;
  const next = Math.max(1, cur + delta);
  AppState.productQtyMap[prodId] = next;

  const valEl = document.getElementById(`qtyVal_${prodId}`);
  if (valEl) valEl.textContent = next;
}

// Adjust Quantity inside the Order Details Modal
function adjustOrderModalQty(delta) {
  const prod = AppState.currentOrderProduct;
  if (!prod || prod.id === "cart-order") return;

  const currentQty = AppState.currentOrderQty || 1;
  const nextQty = Math.max(1, currentQty + delta);
  AppState.currentOrderQty = nextQty;

  const valEl = document.getElementById("orderModalQtyVal");
  if (valEl) valEl.textContent = nextQty;

  const priceEachEl = document.getElementById("orderProductPriceEach");
  const subtotal = prod.price * nextQty;
  if (priceEachEl) {
    priceEachEl.innerHTML = nextQty > 1
      ? `Rs. ${prod.price?.toLocaleString()} each &times; ${nextQty} = <strong>Rs. ${subtotal.toLocaleString()}</strong>`
      : `Rs. ${prod.price?.toLocaleString()} each`;
  }

  const deliveryFee = AppState.settings.deliveryFee || 200;
  const grandTotal = subtotal + deliveryFee;
  const totalEl = document.getElementById("orderTotalDisplay");
  if (totalEl) totalEl.textContent = `Rs. ${grandTotal.toLocaleString()}`;

  const breakdownEl = document.getElementById("orderSubtotalBreakdown");
  if (breakdownEl) {
    breakdownEl.textContent = `Subtotal: Rs. ${subtotal.toLocaleString()} + Rs. ${deliveryFee} fee`;
  }
}

// Wishlist Toggle
function toggleWishlist(prodId) {
  const idx = AppState.savedWishlist.indexOf(prodId);
  if (idx >= 0) {
    AppState.savedWishlist.splice(idx, 1);
    showToast("Removed from favorites");
  } else {
    AppState.savedWishlist.push(prodId);
    showToast("Saved to favorites!");
  }
  localStorage.setItem("xcess_wishlist", JSON.stringify(AppState.savedWishlist));
  updateWishlistBadge();
  renderProducts();
}

function updateWishlistBadge() {
  const badge = document.getElementById("favoritesCount");
  if (!badge) return;
  const count = AppState.savedWishlist.length;
  badge.textContent = count;
  badge.hidden = count === 0;
}

// Add Product to Bag
function addProductToBag(prodId) {
  const prod = AppState.products.find(p => p.id === prodId);
  if (!prod) return;

  const qty = 1;
  const variety = getSelectedProductVariety(prod);
  const existing = AppState.cart.find(item => 
    item.id === prodId && 
    item.size === variety.size && 
    item.color === variety.color
  );

  if (existing) {
    existing.qty += qty;
  } else {
    AppState.cart.push({
      id: prod.id,
      title: prod.title,
      price: prod.price,
      image: (Array.isArray(prod.images) && prod.images.length > 0) ? prod.images[0] : (prod.image || ""),
      category: prod.category,
      qty: qty,
      size: variety.size || null,
      color: variety.color || null
    });
  }

  localStorage.setItem("lashari_cart", JSON.stringify(AppState.cart));
  updateBagCountBadge();
  const vNotes = [variety.size ? `Size: ${variety.size}` : '', variety.color ? `Color: ${variety.color}` : ''].filter(Boolean).join(", ");
  showToast(`Added ${qty} × ${prod.title}${vNotes ? ` (${vNotes})` : ''} to cart!`);

  const btn = document.getElementById(`btnCart_${prodId}`);
  if (btn) {
    btn.classList.add("in-cart");
    btn.textContent = "In Cart ✓";
    setTimeout(() => {
      btn.classList.remove("in-cart");
      btn.textContent = "Add to Cart +";
    }, 1800);
  }
}

function updateBagCountBadge() {
  const totalItems = AppState.cart.reduce((sum, item) => sum + item.qty, 0);
  document.querySelectorAll(".bag-count, #headerBagCount").forEach(el => {
    el.textContent = totalItems;
  });
}

function escapeAttr(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
}

function getProductImages(prod) {
  if (Array.isArray(prod.images) && prod.images.length > 0) {
    return prod.images.filter(Boolean);
  }
  return prod.image ? [prod.image] : [];
}

function renderProductGallery(prod) {
  const images = getProductImages(prod);
  const title = escapeAttr(prod.title);
  if (images.length === 0) return getProductArtHtml(prod);
  if (images.length === 1) {
    return `<img src="${escapeAttr(images[0])}" alt="${title}" class="product-real-img" loading="lazy">`;
  }
  return `
    <div class="product-slider" data-index="0">
      <div class="product-slider-track">
        ${images.map((src, idx) => `
          <div class="product-slide">
            <img src="${escapeAttr(src)}" alt="${title} photo ${idx + 1}" class="product-real-img" loading="${idx === 0 ? "eager" : "lazy"}">
          </div>
        `).join("")}
      </div>
      <button type="button" class="product-slider-btn prev" onclick="event.stopPropagation(); moveProductSlide(this, -1)" aria-label="Previous photo">‹</button>
      <button type="button" class="product-slider-btn next" onclick="event.stopPropagation(); moveProductSlide(this, 1)" aria-label="Next photo">›</button>
      <div class="product-slider-dots">
        ${images.map((_, idx) => `<button type="button" class="product-slider-dot ${idx === 0 ? "is-active" : ""}" onclick="event.stopPropagation(); goProductSlide(this, ${idx})" aria-label="Photo ${idx + 1}"></button>`).join("")}
      </div>
    </div>
  `;
}

function setProductSlide(slider, index) {
  const count = slider.querySelectorAll(".product-slide").length;
  if (!count) return;
  const next = (index + count) % count;
  slider.dataset.index = String(next);
  const track = slider.querySelector(".product-slider-track");
  if (track) track.style.transform = `translateX(-${next * 100}%)`;
  slider.querySelectorAll(".product-slider-dot").forEach((dot, idx) => {
    dot.classList.toggle("is-active", idx === next);
  });
}

function moveProductSlide(btn, delta) {
  const slider = btn.closest(".product-slider");
  if (!slider) return;
  setProductSlide(slider, Number(slider.dataset.index || 0) + delta);
}

function goProductSlide(dot, index) {
  const slider = dot.closest(".product-slider");
  if (!slider) return;
  setProductSlide(slider, index);
}

function bindProductSliders(root) {
  if (!root) return;
  root.querySelectorAll(".product-slider").forEach(slider => {
    if (slider.dataset.bound === "1") return;
    slider.dataset.bound = "1";
    let startX = 0;
    slider.addEventListener("touchstart", (event) => {
      startX = event.changedTouches[0].clientX;
    }, { passive: true });
    slider.addEventListener("touchend", (event) => {
      const dx = event.changedTouches[0].clientX - startX;
      if (Math.abs(dx) < 36) return;
      slider.dataset.swiped = "1";
      setProductSlide(slider, Number(slider.dataset.index || 0) + (dx < 0 ? 1 : -1));
    }, { passive: true });
    slider.addEventListener("click", (event) => {
      if (slider.dataset.swiped !== "1") return;
      slider.dataset.swiped = "0";
      event.stopPropagation();
      event.preventDefault();
    });
  });
}

let quickViewImages = [];

function goQuickView(index) {
  const gallery = document.querySelector("#dialogVisual .qv-gallery");
  const img = document.getElementById("quickViewMainImg");
  if (!gallery || !img || !quickViewImages.length) return;
  const next = (index + quickViewImages.length) % quickViewImages.length;
  gallery.dataset.index = String(next);
  img.src = quickViewImages[next];
  gallery.querySelectorAll(".product-slider-dot").forEach((dot, idx) => {
    dot.classList.toggle("is-active", idx === next);
  });
  gallery.querySelectorAll(".qv-thumb-btn").forEach((thumb, idx) => {
    thumb.classList.toggle("is-active", idx === next);
  });
}

function moveQuickView(delta) {
  const gallery = document.querySelector("#dialogVisual .qv-gallery");
  const current = Number(gallery?.dataset.index || 0);
  goQuickView(current + delta);
}

function renderQuickViewGallery(images, title, prod) {
  if (!images.length) return "";
  const hasDiscount = prod && prod.oldPrice && Number(prod.oldPrice) > Number(prod.price);
  const discountPercent = hasDiscount ? Math.round(((prod.oldPrice - prod.price) / prod.oldPrice) * 100) : 0;
  const isSaved = prod && AppState.savedWishlist && AppState.savedWishlist.includes(prod.id);

  return `
    <div class="qv-gallery" data-index="0">
      ${hasDiscount ? `<div class="dialog-floating-badge">🔥 -${discountPercent}% OFF</div>` : (prod?.badge ? `<div class="dialog-floating-badge" style="background:#162413;">★ ${escapeAttr(prod.badge)}</div>` : '')}
      ${prod ? `
        <button type="button" class="heart-button ${isSaved ? 'is-saved' : ''} dialog-heart-btn" onclick="event.stopPropagation(); toggleWishlist('${prod.id}'); this.classList.toggle('is-saved');" title="Save to favorites">
          <svg viewBox="0 0 24 24"><path d="M20.7 8.5c0 4.3-8.7 10.4-8.7 10.4S3.3 12.8 3.3 8.5A4.7 4.7 0 0 1 12 6.2a4.7 4.7 0 0 1 8.7 2.3Z"/></svg>
        </button>
      ` : ''}
      <div class="qv-stage">
        <img id="quickViewMainImg" src="${escapeAttr(images[0])}" alt="${escapeAttr(title)}">
        ${images.length > 1 ? `
          <button type="button" class="qv-nav-btn prev" onclick="moveQuickView(-1)" aria-label="Previous photo">‹</button>
          <button type="button" class="qv-nav-btn next" onclick="moveQuickView(1)" aria-label="Next photo">›</button>
        ` : ""}
      </div>
      ${images.length > 1 ? `
        <div class="qv-thumbs-strip">
          ${images.map((img, idx) => `
            <button type="button" class="qv-thumb-btn ${idx === 0 ? "is-active" : ""}" onclick="goQuickView(${idx})" aria-label="Photo ${idx + 1}">
              <img src="${escapeAttr(img)}" alt="thumb ${idx + 1}">
            </button>
          `).join("")}
        </div>
      ` : ""}
    </div>
  `;
}

// Quick View Product Modal
function openProductQuickView(prodId, event) {
  if (event) {
    if (typeof event.preventDefault === "function") event.preventDefault();
    if (typeof event.stopPropagation === "function") event.stopPropagation();
  }

  const prod = AppState.products.find(p => p.id === prodId);
  if (!prod) return;

  const currentScrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;

  const dialog = document.getElementById("productDialog");
  const visual = document.getElementById("dialogVisual");
  const title = document.getElementById("dialogTitle");
  const price = document.getElementById("dialogPrice");
  const oldPrice = document.getElementById("dialogOldPrice");
  const desc = document.getElementById("dialogDescription");
  const buyBtn = document.getElementById("dialogBuyNowBtn");
  const addBtn = document.getElementById("dialogAddCartBtn");

  const cat = document.getElementById("dialogCategory");
  if (cat) cat.remove();

  const images = (Array.isArray(prod.images) && prod.images.length > 0)
    ? prod.images
    : (prod.image ? [prod.image] : []);

  quickViewImages = images;
  if (visual) {
    if (images.length > 0) {
      visual.innerHTML = renderQuickViewGallery(images, prod.title, prod);
      const gallery = visual.querySelector(".qv-gallery");
      if (gallery && images.length > 1) {
        let startX = 0;
        gallery.addEventListener("touchstart", (event) => {
          startX = event.changedTouches[0].clientX;
        }, { passive: true });
        gallery.addEventListener("touchend", (event) => {
          const dx = event.changedTouches[0].clientX - startX;
          if (Math.abs(dx) < 36) return;
          moveQuickView(dx < 0 ? 1 : -1);
        }, { passive: true });
      }
    } else {
      visual.innerHTML = getProductArtHtml(prod);
    }
  }
  if (title) title.textContent = prod.title;
  if (price) price.textContent = `Rs. ${prod.price?.toLocaleString() || "1,450"}`;
  if (oldPrice) {
    if (prod.oldPrice && Number(prod.oldPrice) > Number(prod.price)) {
      const pct = Math.round(((prod.oldPrice - prod.price) / prod.oldPrice) * 100);
      oldPrice.innerHTML = `Rs. ${prod.oldPrice.toLocaleString()} <span style="background:#ffe4e6; color:#e11d48; font-size:11px; font-weight:800; padding:2px 6px; border-radius:4px; text-decoration:none; display:inline-block; margin-left:6px;">-${pct}% OFF</span>`;
      oldPrice.style.display = "inline";
    } else {
      oldPrice.style.display = "none";
    }
  }

  const ratingEl = document.getElementById("dialogRatingText");
  if (ratingEl) {
    ratingEl.textContent = `${prod.rating || 4.9} (${prod.reviewsCount || 38} reviews)`;
  }

  // Variety Picker (Sizes & Colors) in Quick View
  const varContainer = document.getElementById("dialogVarietiesContainer");
  const sizesGroup = document.getElementById("dialogSizesGroup");
  const sizesList = document.getElementById("dialogSizesList");
  const colorsGroup = document.getElementById("dialogColorsGroup");
  const colorsList = document.getElementById("dialogColorsList");

  const hasSizes = Array.isArray(prod.sizes) && prod.sizes.length > 0;
  const hasColors = Array.isArray(prod.colors) && prod.colors.length > 0;

  if (varContainer) {
    if (hasSizes || hasColors) {
      varContainer.style.display = "block";
      const currentVariety = getSelectedProductVariety(prod);

      const sizeHint = document.getElementById("dialogSelectedSizeHint");
      const colorHint = document.getElementById("dialogSelectedColorHint");
      if (sizeHint) sizeHint.textContent = currentVariety.size ? `· ${currentVariety.size}` : "";
      if (colorHint) colorHint.textContent = currentVariety.color ? `· ${currentVariety.color}` : "";

      if (sizesGroup && sizesList) {
        if (hasSizes) {
          sizesGroup.style.display = "block";
          sizesList.innerHTML = prod.sizes.map(s => `
            <button type="button" class="variety-size-btn ${currentVariety.size === s ? 'is-selected' : ''}" onclick="selectProductVariety('${prod.id}', 'size', '${s.replace(/'/g, "\\'")}', true)">
              ${s}
            </button>
          `).join("");
        } else {
          sizesGroup.style.display = "none";
        }
      }

      if (colorsGroup && colorsList) {
        if (hasColors) {
          colorsGroup.style.display = "block";
          colorsList.innerHTML = prod.colors.map(c => {
            const colName = typeof c === 'string' ? c : (c.name || 'Color');
            const colHex = typeof c === 'string' ? getColorHexFromName(c) : (c.hex || '#3b82f6');
            const isSel = currentVariety.color === colName;
            return `
              <button type="button" class="variety-color-btn ${isSel ? 'is-selected' : ''}" onclick="selectProductVariety('${prod.id}', 'color', '${colName.replace(/'/g, "\\'")}', true)">
                <span class="variety-swatch-circle" style="background:${colHex};"></span>
                <span>${colName}</span>
              </button>
            `;
          }).join("");
        } else {
          colorsGroup.style.display = "none";
        }
      }
    } else {
      varContainer.style.display = "none";
    }
  }

  // 3-Line Description Clamping & Show More Toggle Button
  if (desc) {
    const fullDesc = prod.description || "Precision engineered tech accessory crafted with ultra-durable materials, sleek ergonomic design, and premium finish.";
    desc.textContent = fullDesc;
    desc.classList.remove("dialog-desc-expanded");
    desc.classList.add("dialog-desc-clamped");

    const toggleBtn = document.getElementById("dialogDescToggle");
    if (toggleBtn) {
      if (fullDesc.length > 110) {
        toggleBtn.style.display = "inline-flex";
        toggleBtn.innerHTML = `<span>Show More</span> <i class="fa-solid fa-chevron-down" style="font-size:10px;"></i>`;
        toggleBtn.onclick = () => {
          const isExpanded = desc.classList.contains("dialog-desc-expanded");
          if (isExpanded) {
            desc.classList.remove("dialog-desc-expanded");
            desc.classList.add("dialog-desc-clamped");
            toggleBtn.innerHTML = `<span>Show More</span> <i class="fa-solid fa-chevron-down" style="font-size:10px;"></i>`;
          } else {
            desc.classList.remove("dialog-desc-clamped");
            desc.classList.add("dialog-desc-expanded");
            toggleBtn.innerHTML = `<span>Show Less</span> <i class="fa-solid fa-chevron-up" style="font-size:10px;"></i>`;
          }
        };
      } else {
        toggleBtn.style.display = "none";
      }
    }
  }

  if (buyBtn) {
    buyBtn.onclick = () => {
      dialog.close();
      openOrderModalForProduct(prod.id);
    };
  }

  if (addBtn) {
    addBtn.onclick = () => {
      addProductToBag(prod.id);
      dialog.close();
    };
  }

  if (dialog) {
    dialog.onclick = (e) => {
      if (e.target === dialog) dialog.close();
    };

    // Show modal without scrolling the background window
    dialog.showModal();

    // Preserve exact scroll position
    window.scrollTo({
      top: currentScrollY,
      left: 0,
      behavior: "instant"
    });

    dialog.onclose = () => {
      window.scrollTo({
        top: currentScrollY,
        left: 0,
        behavior: "instant"
      });
    };
  }
}

// Order Modal Handler
function openOrderModalForProduct(prodId, preserveQty = false) {
  const prod = AppState.products.find(p => p.id === prodId);
  if (!prod) return;

  const currentModalProdId = AppState.currentOrderProduct ? AppState.currentOrderProduct.id : null;
  const isSameProduct = currentModalProdId === prodId;
  const qty = (preserveQty && isSameProduct && AppState.currentOrderQty) ? AppState.currentOrderQty : 1;
  AppState.currentOrderProduct = prod;
  AppState.currentOrderQty = qty;

  const dialog = document.getElementById("orderDialog");
  const art = document.getElementById("orderArt");
  const nameEl = document.getElementById("orderProductName");
  const priceEachEl = document.getElementById("orderProductPriceEach");
  const qtyControlsRow = document.getElementById("orderQtyControlsRow");
  const qtyValEl = document.getElementById("orderModalQtyVal");
  const qtyEl = document.getElementById("orderProductQty");
  const totalEl = document.getElementById("orderTotalDisplay");
  const breakdownEl = document.getElementById("orderSubtotalBreakdown");
  const form = document.getElementById("orderForm");
  const success = document.getElementById("orderSuccess");
  const varietyInfoEl = document.getElementById("orderVarietyInfo");
  const modalVarietiesEl = document.getElementById("orderModalVarieties");

  const orderImg = (Array.isArray(prod.images) && prod.images.length > 0) ? prod.images[0] : (prod.image || "");
  if (art) {
    if (orderImg) {
      art.innerHTML = `<img src="${orderImg}" alt="${prod.title}" style="width:100%; height:100%; object-fit:contain; border-radius:6px;">`;
    } else {
      art.innerHTML = getProductArtHtml(prod);
    }
  }

  if (form) form.style.display = "flex";
  if (success) success.classList.remove("show");

  // Advance Payment selected by default
  const payAdvanceRadio = document.getElementById("payAdvance");
  if (payAdvanceRadio) payAdvanceRadio.checked = true;
  togglePaymentBox("advance");
  renderCustomerPaymentAccounts();

  // Show selected variety
  const selectedVariety = getSelectedProductVariety(prod);
  let varietyText = [];
  if (selectedVariety.size) varietyText.push(`Size: ${selectedVariety.size}`);
  if (selectedVariety.color) varietyText.push(`Color: ${selectedVariety.color}`);

  if (varietyInfoEl) {
    if (varietyText.length > 0) {
      varietyInfoEl.textContent = `Variety: ${varietyText.join(" · ")}`;
      varietyInfoEl.style.display = "block";
    } else {
      varietyInfoEl.style.display = "none";
    }
  }

  // Interactive Variety switcher inside Order Modal
  if (modalVarietiesEl) {
    const hasSizes = Array.isArray(prod.sizes) && prod.sizes.length > 0;
    const hasColors = Array.isArray(prod.colors) && prod.colors.length > 0;
    if (hasSizes || hasColors) {
      modalVarietiesEl.style.display = "flex";
      modalVarietiesEl.innerHTML = `
        <div style="font-size:10.5px; font-weight:800; color:#3b4d32; text-transform:uppercase; letter-spacing:0.04em;">
          Confirm Available Variety:
        </div>
        ${hasSizes ? `
          <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
            <span style="font-size:11px; font-weight:700; color:#5b6d52; min-width:40px;">Size:</span>
            ${prod.sizes.map(s => `
              <button type="button" class="card-size-pill ${selectedVariety.size === s ? 'is-active' : ''}" onclick="selectProductVariety('${prod.id}', 'size', '${s.replace(/'/g, "\\'")}', false, true)" style="font-size:11px; padding:3px 9px;">
                ${s}
              </button>
            `).join("")}
          </div>
        ` : ''}
        ${hasColors ? `
          <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
            <span style="font-size:11px; font-weight:700; color:#5b6d52; min-width:40px;">Color:</span>
            ${prod.colors.map(c => {
              const colName = typeof c === 'string' ? c : (c.name || 'Color');
              const colHex = typeof c === 'string' ? getColorHexFromName(c) : (c.hex || '#3b82f6');
              const isSel = selectedVariety.color === colName;
              return `
                <button type="button" class="variety-color-btn ${isSel ? 'is-selected' : ''}" onclick="selectProductVariety('${prod.id}', 'color', '${colName.replace(/'/g, "\\'")}', false, true)" style="font-size:11px; padding:3px 8px;">
                  <span class="variety-swatch-circle" style="background:${colHex}; width:11px; height:11px;"></span>
                  <span>${colName}</span>
                </button>
              `;
            }).join("")}
          </div>
        ` : ''}
      `;
    } else {
      modalVarietiesEl.style.display = "none";
      modalVarietiesEl.innerHTML = "";
    }
  }

  if (nameEl) nameEl.textContent = prod.title;

  // Set quantity controls
  if (qtyControlsRow) qtyControlsRow.style.display = "flex";
  if (qtyValEl) qtyValEl.textContent = qty;
  if (qtyEl) qtyEl.style.display = "none";

  const subtotal = prod.price * qty;
  if (priceEachEl) {
    priceEachEl.style.display = "block";
    priceEachEl.innerHTML = qty > 1
      ? `Rs. ${prod.price?.toLocaleString()} each &times; ${qty} = <strong>Rs. ${subtotal.toLocaleString()}</strong>`
      : `Rs. ${prod.price?.toLocaleString()} each`;
  }

  const deliveryFee = AppState.settings.deliveryFee || 200;
  const grandTotal = subtotal + deliveryFee;
  if (totalEl) totalEl.textContent = `Rs. ${grandTotal.toLocaleString()}`;
  if (breakdownEl) {
    breakdownEl.style.display = "block";
    breakdownEl.textContent = `Subtotal: Rs. ${subtotal.toLocaleString()} + Rs. ${deliveryFee} fee`;
  }

  if (dialog) dialog.showModal();
}

function openOrderModalFromBag() {
  if (AppState.cart.length === 0) {
    showToast("Your shopping bag is empty!");
    return;
  }

  const bagDialog = document.getElementById("bagDialog");
  if (bagDialog) bagDialog.close();

  // Create composite order item from cart
  const totalCartQty = AppState.cart.reduce((s, i) => s + i.qty, 0);
  const cartSubtotal = AppState.cart.reduce((s, i) => s + (i.price * i.qty), 0);
  const compositeProd = {
    id: "cart-order",
    title: `${totalCartQty} Item(s) from Shopping Bag`,
    price: cartSubtotal,
    category: "Shopping Bag"
  };

  AppState.currentOrderProduct = compositeProd;
  AppState.currentOrderQty = 1;

  const dialog = document.getElementById("orderDialog");
  const art = document.getElementById("orderArt");
  const nameEl = document.getElementById("orderProductName");
  const qtyEl = document.getElementById("orderProductQty");
  const priceEachEl = document.getElementById("orderProductPriceEach");
  const qtyControlsRow = document.getElementById("orderQtyControlsRow");
  const totalEl = document.getElementById("orderTotalDisplay");
  const breakdownEl = document.getElementById("orderSubtotalBreakdown");
  const form = document.getElementById("orderForm");
  const success = document.getElementById("orderSuccess");
  const varietyInfoEl = document.getElementById("orderVarietyInfo");
  const modalVarietiesEl = document.getElementById("orderModalVarieties");

  if (varietyInfoEl) varietyInfoEl.style.display = "none";
  if (modalVarietiesEl) {
    modalVarietiesEl.style.display = "none";
    modalVarietiesEl.innerHTML = "";
  }

  if (form) form.style.display = "flex";
  if (success) success.classList.remove("show");

  // Advance Payment selected by default
  const payAdvanceRadio = document.getElementById("payAdvance");
  if (payAdvanceRadio) payAdvanceRadio.checked = true;
  togglePaymentBox("advance");
  renderCustomerPaymentAccounts();

  if (art) art.innerHTML = `<span style="font-size:24px;">🛍️</span>`;
  if (nameEl) nameEl.textContent = compositeProd.title;

  if (qtyControlsRow) qtyControlsRow.style.display = "none";
  if (priceEachEl) priceEachEl.style.display = "none";
  if (qtyEl) {
    qtyEl.style.display = "block";
    qtyEl.textContent = `Subtotal: Rs. ${cartSubtotal.toLocaleString()}`;
  }

  const deliveryFee = AppState.settings.deliveryFee || 200;
  const grandTotal = cartSubtotal + deliveryFee;
  if (totalEl) totalEl.textContent = `Rs. ${grandTotal.toLocaleString()}`;
  if (breakdownEl) {
    breakdownEl.style.display = "block";
    breakdownEl.textContent = `Bag Total + Rs. ${deliveryFee} fee`;
  }

  if (dialog) dialog.showModal();
}

// Payment Option Toggle (COD vs Advance)
function togglePaymentBox(method) {
  const box = document.getElementById("advanceBankDetails");
  if (!box) return;
  if (method === "advance") {
    box.classList.add("show");
  } else {
    box.classList.remove("show");
  }
}

// Submit Order Form
function handleOrderFormSubmit(e) {
  e.preventDefault();

  const name = document.getElementById("orderName")?.value.trim();
  const phone = document.getElementById("orderPhone")?.value.trim();
  const email = document.getElementById("orderEmail")?.value.trim();
  const address = document.getElementById("orderAddress")?.value.trim();
  const courier = "TCS Express & Leopards Delivery (Standard Express)";
  const payment = document.querySelector('input[name="payment"]:checked')?.value || "Advance Payment";

  if (!name || !phone || !address) {
    showToast("Please fill in your name, phone and address!");
    return;
  }

  const prod = AppState.currentOrderProduct;
  const qty = AppState.currentOrderQty || 1;
  const deliveryFee = AppState.settings.deliveryFee || 200;
  const subtotal = prod ? (prod.price * qty) : 0;
  const total = subtotal + deliveryFee;

  const selectedVariety = prod && prod.id !== "cart-order" ? getSelectedProductVariety(prod) : {};
  const orderItems = prod.id === "cart-order" 
    ? AppState.cart.map(c => ({ title: c.title, qty: c.qty, price: c.price, size: c.size || null, color: c.color || null }))
    : [{ title: prod.title, qty: qty, price: prod.price, size: selectedVariety.size || null, color: selectedVariety.color || null }];

  const newOrder = {
    id: `ORD-${Date.now().toString().slice(-6)}`,
    customerName: name,
    phone: phone,
    email: email,
    address: address,
    items: orderItems,
    subtotal: subtotal,
    deliveryFee: deliveryFee,
    total: total,
    courierPartner: courier,
    paymentMethod: payment,
    status: "Confirmed",
    date: new Date().toISOString().replace("T", " ").slice(0, 16)
  };

  Storage.addOrder(newOrder);

  // If order was from cart, clear cart
  if (prod.id === "cart-order") {
    AppState.cart = [];
    localStorage.removeItem("lashari_cart");
    updateBagCountBadge();
  }

  // Show Success View
  const form = document.getElementById("orderForm");
  const success = document.getElementById("orderSuccess");
  if (form) form.style.display = "none";
  if (success) {
    const wa = AppState.settings.whatsapp || "923212920914";
    const cleanWa = wa.replace(/[^0-9]/g, "");

    const itemLines = orderItems.map(i => {
      let v = [];
      if (i.size) v.push(`Size: ${i.size}`);
      if (i.color) v.push(`Color: ${i.color}`);
      return `• ${i.title} (${i.qty}x) ${v.length ? `[${v.join(", ")}]` : ""} - Rs. ${(i.price * i.qty).toLocaleString()}`;
    }).join("\n");

    const msg = `Salam! Naya Order Confirm karna hai:\n\n*Order ID:* #${newOrder.id}\n*Customer:* ${name}\n*Phone:* ${phone}\n*Address:* ${address}\n*Payment Method:* ${payment}\n\n*Items:*\n${itemLines}\n\n*Delivery Fee:* Rs. ${deliveryFee}\n*Total Amount:* Rs. ${total.toLocaleString()}`;
    const waUrl = `https://wa.me/${cleanWa}?text=${encodeURIComponent(msg)}`;

    success.innerHTML = `
      <div class="order-success-icon">✓</div>
      <h3>Order Placed!</h3>
      <p style="margin-bottom:12px;">Shukriya ${name}! Aapka order receive ho gaya hai.</p>
      <div style="background:#f4f6ee; border:1px solid #dbe2cc; border-radius:10px; padding:12px; margin-bottom:16px; text-align:left; font-size:12px; color:#2d3a27;">
        <div><strong>Total Payable:</strong> Rs. ${total.toLocaleString()} (${payment})</div>
        <div style="margin-top:4px; color:#607358;">Items: ${orderItems.map(i => `${i.qty}x ${i.title}${i.size ? ` (${i.size})` : ''}${i.color ? ` (${i.color})` : ''}`).join(", ")}</div>
      </div>
      <div style="display:flex; flex-direction:column; gap:8px;">
        <a href="${waUrl}" target="_blank" class="button button-lime" style="justify-content:center; text-decoration:none;">
          <i class="fa-brands fa-whatsapp" style="font-size:16px;"></i> Send Order on WhatsApp
        </a>
        <button type="button" class="button button-dark" data-close-order style="justify-content:center;">
          Keep exploring <span>↗</span>
        </button>
      </div>
    `;

    success.querySelectorAll("[data-close-order]").forEach(b => {
      b.onclick = () => {
        const d = document.getElementById("orderDialog");
        if (d) d.close();
      };
    });

    success.classList.add("show");
  }

  showToast("Order placed successfully! We will contact you soon.");
}

// Shopping Bag Dialog
function openShoppingBag() {
  const dialog = document.getElementById("bagDialog");
  const list = document.getElementById("bagItemsList");
  const summaryBox = document.getElementById("bagSummaryBox");
  const emptyView = document.getElementById("bagEmptyView");
  const subtotalEl = document.getElementById("bagSubtotal");
  const deliveryEl = document.getElementById("bagDelivery");
  const grandTotalEl = document.getElementById("bagGrandTotal");

  if (!dialog) return;

  if (AppState.cart.length === 0) {
    if (list) list.innerHTML = "";
    if (summaryBox) summaryBox.style.display = "none";
    if (emptyView) emptyView.style.display = "block";
  } else {
    if (emptyView) emptyView.style.display = "none";
    if (summaryBox) summaryBox.style.display = "block";

    const deliveryFee = AppState.settings.deliveryFee || 200;
    const subtotal = AppState.cart.reduce((s, i) => s + (i.price * i.qty), 0);
    const grandTotal = subtotal + deliveryFee;

    if (subtotalEl) subtotalEl.textContent = `Rs. ${subtotal.toLocaleString()}`;
    if (deliveryEl) deliveryEl.textContent = `Rs. ${deliveryFee} PKR`;
    if (grandTotalEl) grandTotalEl.textContent = `Rs. ${grandTotal.toLocaleString()}`;

    if (list) {
      list.innerHTML = AppState.cart.map((item, idx) => `
        <div class="bag-item-card">
          <div class="bag-item-pic">
            <span style="font-size:16px;">📦</span>
          </div>
          <div class="bag-item-info">
            <h4>${item.title}</h4>
            ${(item.size || item.color) ? `<small style="color:#6a8060; font-size:11px; font-weight:700; display:block; margin:2px 0 3px;">${[item.size ? `Size: ${item.size}` : '', item.color ? `Color: ${item.color}` : ''].filter(Boolean).join(' · ')}</small>` : ''}
            <p>Rs. ${item.price?.toLocaleString()} × ${item.qty}</p>
          </div>
          <button type="button" class="bag-item-del" onclick="removeBagItem(${idx})" title="Remove">×</button>
        </div>
      `).join("");
    }
  }

  dialog.showModal();
}

function removeBagItem(idx) {
  AppState.cart.splice(idx, 1);
  localStorage.setItem("lashari_cart", JSON.stringify(AppState.cart));
  updateBagCountBadge();
  openShoppingBag();
  showToast("Item removed from bag");
}

// Toast Notification Helper
function showToast(msg) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add("toast-show");
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => {
    toast.classList.remove("toast-show");
  }, 3000);
}

// Scroll Reveal
function initScrollReveal() {
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll(".reveal").forEach(el => el.classList.add("in-view"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll(".reveal").forEach(el => observer.observe(el));
}

// Global Event Listeners Setup
function setupEventListeners() {
  // Search Toggle
  const searchToggle = document.getElementById("searchToggle");
  const searchInput = document.getElementById("searchInput");
  if (searchToggle && searchInput) {
    searchToggle.addEventListener("click", () => {
      const col = document.getElementById("collection");
      if (col) col.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(() => searchInput.focus(), 400);
    });
  }

  // Live Search Input
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      AppState.searchQuery = e.target.value;
      resetCollectionVisibleCount();
      renderProducts();
    });
  }

  // Load More Button (Adds 3 more rows on click)
  const btnLoadMore = document.getElementById("btnLoadMoreProducts");
  if (btnLoadMore) {
    btnLoadMore.addEventListener("click", () => {
      const cols = getGridColumnCount();
      AppState.collectionVisibleCount += 3 * cols; // Exactly 3 more rows!
      renderProducts();
    });
  }

  // Favorites / Wishlist Toggle
  const favToggle = document.getElementById("favoritesToggle");
  if (favToggle) {
    favToggle.addEventListener("click", () => {
      if (AppState.savedWishlist.length === 0) {
        showToast("No items in wishlist yet! Click the heart on any card to save it.");
        return;
      }
      // Filter collection to saved items
      AppState.activeFilter = "all";
      AppState.activeBrand = "all";
      AppState.activeCategory = "all";
      AppState.searchQuery = "";
      
      const grid = document.getElementById("productGrid");
      const emptyState = document.getElementById("emptyState");
      const savedProds = AppState.products.filter(p => AppState.savedWishlist.includes(p.id));

      if (grid) {
        grid.innerHTML = savedProds.map(prod => {
          const artHtml = renderProductGallery(prod);
          return `
            <article class="product-card reveal in-view" data-product-id="${prod.id}">
              <div class="product-media" onclick="openProductQuickView('${prod.id}', event)">
                <button type="button" class="heart-button is-saved" onclick="event.stopPropagation(); toggleWishlist('${prod.id}')">
                  <svg viewBox="0 0 24 24"><path d="M20.7 8.5c0 4.3-8.7 10.4-8.7 10.4S3.3 12.8 3.3 8.5A4.7 4.7 0 0 1 12 6.2a4.7 4.7 0 0 1 8.7 2.3Z"/></svg>
                </button>
                ${artHtml}
              </div>
              <div class="product-info-block">
                <div class="product-info-top">
                  <h3 class="product-name" onclick="openProductQuickView('${prod.id}', event)">${prod.title}</h3>
                  <span class="product-price-tag">Rs. ${prod.price?.toLocaleString()}</span>
                </div>
                <div class="product-actions" style="margin-top:10px;">
                  <button type="button" class="btn-buy-now" onclick="openOrderModalForProduct('${prod.id}')">Buy Now ↗</button>
                  <button type="button" class="btn-add-cart" onclick="addProductToBag('${prod.id}')">Add to Cart +</button>
                </div>
              </div>
            </article>
          `;
        }).join("");
        bindProductSliders(grid);
      }
      if (emptyState) emptyState.hidden = savedProds.length > 0;

      const col = document.getElementById("collection");
      if (col) col.scrollIntoView({ behavior: "smooth", block: "start" });
      showToast(`Showing ${savedProds.length} saved favorite(s)`);
    });
  }

  // Bag Toggle
  const bagToggle = document.getElementById("bagToggle");
  if (bagToggle) {
    bagToggle.addEventListener("click", openShoppingBag);
  }

  // Bag Checkout Button
  const bagCheckoutBtn = document.getElementById("bagCheckoutBtn");
  if (bagCheckoutBtn) {
    bagCheckoutBtn.addEventListener("click", openOrderModalFromBag);
  }

  // Mobile Menu Toggle
  const menuToggle = document.getElementById("menuToggle");
  const mobileNav = document.getElementById("mobileNav");
  if (menuToggle && mobileNav) {
    menuToggle.addEventListener("click", () => {
      const isHidden = mobileNav.hidden;
      mobileNav.hidden = !isHidden;
      menuToggle.setAttribute("aria-expanded", String(isHidden));
    });
    mobileNav.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        mobileNav.hidden = true;
        menuToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // Dialog Close Handlers
  document.querySelectorAll("[data-close-dialog]").forEach(btn => {
    btn.addEventListener("click", () => {
      const d = document.getElementById("productDialog");
      if (d) d.close();
    });
  });

  document.querySelectorAll("[data-close-order]").forEach(btn => {
    btn.addEventListener("click", () => {
      const d = document.getElementById("orderDialog");
      if (d) d.close();
    });
  });

  document.querySelectorAll("[data-close-bag]").forEach(btn => {
    btn.addEventListener("click", () => {
      const d = document.getElementById("bagDialog");
      if (d) d.close();
    });
  });

  // Order Form Submit
  const orderForm = document.getElementById("orderForm");
  if (orderForm) {
    orderForm.addEventListener("submit", handleOrderFormSubmit);
  }
}
