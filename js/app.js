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
    deskholder: "Desk",
    carholder: "Car",
    bikeholder: "Bike",
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
    const primaryImg = (Array.isArray(prod.images) && prod.images.length > 0) ? prod.images[0] : (prod.image || "");
    const photoCount = Array.isArray(prod.images) ? prod.images.length : (prod.image ? 1 : 0);
    const artHtml = primaryImg 
      ? `<img src="${primaryImg}" alt="${prod.title}" class="product-real-img" loading="lazy" onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='block';">
         <div class="art-fallback-box" style="display:none; width:100%; height:100%;">${getProductArtHtml(prod)}</div>`
      : getProductArtHtml(prod);
    const categoryTag = prod.category || prod.brandName || "Accessory";
    
    // Check if on sale tag is enabled
    const isOnSale = prod.isOnSale !== false;
    
    // Check if valid before / old price exists
    const hasDiscount = prod.oldPrice && Number(prod.oldPrice) > Number(prod.price);
    const discountPercent = hasDiscount ? Math.round(((prod.oldPrice - prod.price) / prod.oldPrice) * 100) : 0;

    return `
      <article class="product-card reveal in-view" data-product-id="${prod.id}">
        <div class="product-media" onclick="openProductQuickView('${prod.id}')">
          ${isOnSale ? '<span class="sale-badge">🔥 SALE</span>' : ''}
          <span class="product-topline" style="${isOnSale ? 'top:42px;' : ''}">${categoryTag}</span>
          ${photoCount > 1 ? `<span style="position:absolute; bottom:12px; right:12px; background:rgba(0,0,0,0.72); color:#fff; font-size:10.5px; font-weight:700; padding:2px 7px; border-radius:5px; z-index:3; display:flex; align-items:center; gap:4px;"><i class="fa-solid fa-camera"></i> ${photoCount}</span>` : ''}
          <button type="button" class="heart-button ${isSaved ? 'is-saved' : ''}" onclick="event.stopPropagation(); toggleWishlist('${prod.id}')" title="Save to favorites">
            <svg viewBox="0 0 24 24">
              <path d="M20.7 8.5c0 4.3-8.7 10.4-8.7 10.4S3.3 12.8 3.3 8.5A4.7 4.7 0 0 1 12 6.2a4.7 4.7 0 0 1 8.7 2.3Z"/>
            </svg>
          </button>
          ${artHtml}
        </div>

        <div class="product-info-block">
          <div class="product-info-top">
            <h3 class="product-name" onclick="openProductQuickView('${prod.id}')">${prod.title}</h3>
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

          <div style="display:flex; align-items:center; justify-content:space-between; margin-top:4px;">
            <div class="product-qty-row">
              <button type="button" class="qty-btn" onclick="adjustProductQty('${prod.id}', -1)">−</button>
              <span class="qty-value" id="qtyVal_${prod.id}">${currentQty}</span>
              <button type="button" class="qty-btn" onclick="adjustProductQty('${prod.id}', 1)">+</button>
            </div>
            <span style="font-size:10px; color:#6a8060; font-weight:800; text-transform:uppercase;">
              <i class="fa-solid fa-truck-fast"></i> TCS / LEO
            </span>
          </div>

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

// Adjust Quantity on Product Card
function adjustProductQty(prodId, delta) {
  const cur = AppState.productQtyMap[prodId] || 1;
  const next = Math.max(1, cur + delta);
  AppState.productQtyMap[prodId] = next;

  const valEl = document.getElementById(`qtyVal_${prodId}`);
  if (valEl) valEl.textContent = next;
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

  const qty = AppState.productQtyMap[prodId] || 1;
  const existing = AppState.cart.find(item => item.id === prodId);

  if (existing) {
    existing.qty += qty;
  } else {
    AppState.cart.push({
      id: prod.id,
      title: prod.title,
      price: prod.price,
      image: prod.image,
      category: prod.category,
      qty: qty
    });
  }

  localStorage.setItem("lashari_cart", JSON.stringify(AppState.cart));
  updateBagCountBadge();
  showToast(`Added ${qty} × ${prod.title} to cart!`);

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

// Quick View Product Modal
function openProductQuickView(prodId) {
  const prod = AppState.products.find(p => p.id === prodId);
  if (!prod) return;

  const dialog = document.getElementById("productDialog");
  const visual = document.getElementById("dialogVisual");
  const cat = document.getElementById("dialogCategory");
  const title = document.getElementById("dialogTitle");
  const price = document.getElementById("dialogPrice");
  const oldPrice = document.getElementById("dialogOldPrice");
  const desc = document.getElementById("dialogDescription");
  const buyBtn = document.getElementById("dialogBuyNowBtn");
  const addBtn = document.getElementById("dialogAddCartBtn");

  const images = (Array.isArray(prod.images) && prod.images.length > 0)
    ? prod.images
    : (prod.image ? [prod.image] : []);

  if (visual) {
    if (images.length > 0) {
      visual.innerHTML = `
        <div style="width:100%; height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; position:relative;">
          <img id="quickViewMainImg" src="${images[0]}" alt="${prod.title}" style="max-width:85%; max-height:260px; object-fit:contain; border-radius:8px; filter:drop-shadow(0 10px 20px rgba(0,0,0,0.15)); transition:opacity 0.2s ease;">
          ${images.length > 1 ? `
            <div style="display:flex; gap:8px; margin-top:12px; overflow-x:auto; max-width:90%; padding:4px;">
              ${images.map((img, idx) => `
                <img src="${img}" alt="Photo ${idx+1}" onclick="document.getElementById('quickViewMainImg').src='${img}'; document.querySelectorAll('.qv-thumb').forEach(t=>t.style.borderColor='transparent'); this.style.borderColor='var(--lime)';" class="qv-thumb" style="width:48px; height:48px; object-fit:contain; background:#fff; border:2px solid ${idx===0 ? 'var(--lime)' : 'transparent'}; border-radius:6px; cursor:pointer; padding:2px;">
              `).join('')}
            </div>
          ` : ''}
        </div>
      `;
    } else {
      visual.innerHTML = getProductArtHtml(prod);
    }
  }
  if (cat) cat.textContent = prod.category ? `${prod.category} · XCESS COLLECTION` : 'XCESS COLLECTION';
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
  if (desc) desc.textContent = prod.description || "Precision engineered tech accessory crafted with ultra-durable materials, sleek ergonomic design, and premium finish.";

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

  if (dialog) dialog.showModal();
}

// Order Modal Handler
function openOrderModalForProduct(prodId) {
  const prod = AppState.products.find(p => p.id === prodId);
  if (!prod) return;

  const qty = AppState.productQtyMap[prodId] || 1;
  AppState.currentOrderProduct = prod;
  AppState.currentOrderQty = qty;

  const dialog = document.getElementById("orderDialog");
  const art = document.getElementById("orderArt");
  const nameEl = document.getElementById("orderProductName");
  const qtyEl = document.getElementById("orderProductQty");
  const totalEl = document.getElementById("orderTotalDisplay");
  const form = document.getElementById("orderForm");
  const success = document.getElementById("orderSuccess");

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

  if (art) art.innerHTML = getProductArtHtml(prod);
  if (nameEl) nameEl.textContent = prod.title;
  if (qtyEl) qtyEl.textContent = `Qty: ${qty} · Rs. ${prod.price?.toLocaleString()} each`;

  const deliveryFee = AppState.settings.deliveryFee || 200;
  const grandTotal = (prod.price * qty) + deliveryFee;
  if (totalEl) totalEl.textContent = `Rs. ${grandTotal.toLocaleString()}`;

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
  const totalEl = document.getElementById("orderTotalDisplay");
  const form = document.getElementById("orderForm");
  const success = document.getElementById("orderSuccess");

  if (form) form.style.display = "flex";
  if (success) success.classList.remove("show");

  // Advance Payment selected by default
  const payAdvanceRadio = document.getElementById("payAdvance");
  if (payAdvanceRadio) payAdvanceRadio.checked = true;
  togglePaymentBox("advance");
  renderCustomerPaymentAccounts();

  if (art) art.innerHTML = `<span style="font-size:24px;">🛍️</span>`;
  if (nameEl) nameEl.textContent = compositeProd.title;
  if (qtyEl) qtyEl.textContent = `Subtotal: Rs. ${cartSubtotal.toLocaleString()}`;

  const deliveryFee = AppState.settings.deliveryFee || 200;
  const grandTotal = cartSubtotal + deliveryFee;
  if (totalEl) totalEl.textContent = `Rs. ${grandTotal.toLocaleString()}`;

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

  const newOrder = {
    id: `ORD-${Date.now().toString().slice(-6)}`,
    customerName: name,
    phone: phone,
    email: email,
    address: address,
    items: prod.id === "cart-order" ? AppState.cart : [{ title: prod.title, qty: qty, price: prod.price }],
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
  if (success) success.classList.add("show");

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
          const primaryImg = (Array.isArray(prod.images) && prod.images.length > 0) ? prod.images[0] : (prod.image || "");
          const artHtml = primaryImg 
            ? `<img src="${primaryImg}" alt="${prod.title}" class="product-real-img" loading="lazy">` 
            : getProductArtHtml(prod);
          return `
            <article class="product-card reveal in-view" data-product-id="${prod.id}">
              <div class="product-media" onclick="openProductQuickView('${prod.id}')">
                <span class="product-topline">SAVED ITEM</span>
                <button type="button" class="heart-button is-saved" onclick="event.stopPropagation(); toggleWishlist('${prod.id}')">
                  <svg viewBox="0 0 24 24"><path d="M20.7 8.5c0 4.3-8.7 10.4-8.7 10.4S3.3 12.8 3.3 8.5A4.7 4.7 0 0 1 12 6.2a4.7 4.7 0 0 1 8.7 2.3Z"/></svg>
                </button>
                ${artHtml}
              </div>
              <div class="product-info-block">
                <div class="product-info-top">
                  <h3 class="product-name" onclick="openProductQuickView('${prod.id}')">${prod.title}</h3>
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
