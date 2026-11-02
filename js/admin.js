/**
 * The Lashari Communication - Admin Panel Controller
 * Complete store management for orders, products, statistics, and settings.
 * Includes direct Address, Email, and Phone/WhatsApp management.
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
  productQtyMap: {},
  currentOrderProduct: null,
  currentOrderQty: 1,
  collectionVisibleCount: 8,
  reviews: [],
  currentReviewPage: 0
};

// Professional Toast Notification for Admin Panel
function showToast(msg, type = "info") {
  console.log(`[Toast ${type}]:`, msg);
  let container = document.getElementById("toastContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "toastContainer";
    container.className = "toast-container";
    container.style.cssText = "position:fixed; top:24px; right:24px; z-index:999999; display:flex; flex-direction:column; gap:10px; max-width:400px; pointer-events:none;";
    document.body.appendChild(container);
  } else {
    container.style.position = "fixed";
    container.style.top = "24px";
    container.style.right = "24px";
    container.style.zIndex = "999999";
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.gap = "10px";
    container.style.maxWidth = "400px";
    container.style.pointerEvents = "none";
  }

  const toast = document.createElement("div");
  const bg = type === "success" ? "#14381e" : (type === "error" ? "#4a1919" : "#1a241c");
  const border = type === "success" ? "#22c55e" : (type === "error" ? "#ef4444" : "#4ade80");
  const textCol = type === "success" ? "#86efac" : (type === "error" ? "#fca5a5" : "#ffffff");
  const icon = type === "success" ? "✓" : (type === "error" ? "⚠" : "ℹ");

  toast.style.cssText = `background:${bg}; border:1px solid ${border}; color:${textCol}; padding:14px 18px; border-radius:10px; font-family:sans-serif; font-size:13px; font-weight:700; box-shadow:0 12px 30px rgba(0,0,0,0.6); display:flex; align-items:center; gap:12px; pointer-events:auto; transition:all 0.35s cubic-bezier(0.16, 1, 0.3, 1); transform:translateY(-12px); opacity:0;`;
  toast.innerHTML = `<span style="font-size:17px; line-height:1;">${icon}</span> <span style="line-height:1.4;">${msg}</span>`;

  container.appendChild(toast);
  requestAnimationFrame(() => {
    toast.style.transform = "translateY(0)";
    toast.style.opacity = "1";
  });

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(-10px)";
    setTimeout(() => { if (toast.parentNode) toast.remove(); }, 350);
  }, 4000);
}
window.showToast = showToast;

const AdminController = {
  isAdminLoggedIn: false,
  activeTab: "overview",
  editingProductId: null,
  orderSearchQuery: "",
  orderStatusFilter: "all",
  productSearchQuery: "",

  init() {
    this.bindEvents();
  },

  // Check PIN and Open Admin Panel
  promptLogin() {
    const settings = Storage.getSettings();
    const pin = prompt("Enter Admin Access PIN:", "");
    if (pin === null) return;

    if (pin.trim() === (settings.adminPin || "Speed150") || pin.trim() === "Speed150") {
      this.isAdminLoggedIn = true;
      this.showAdminPanel();
      showToast("Welcome to Lashari Admin Panel", "success");
    } else {
      showToast("Incorrect Admin PIN! Access denied.", "error");
    }
  },

  showAdminPanel() {
    const storefront = document.getElementById("storefrontContainer");
    if (storefront) storefront.style.display = "none";
    const adminEl = document.getElementById("adminViewContainer");
    if (adminEl) {
      adminEl.classList.add("active");
      adminEl.style.display = "block";
    }
    window.scrollTo({ top: 0, behavior: "smooth" });

    this.switchTab("overview");
  },

  exitAdmin() {
    const adminEl = document.getElementById("adminViewContainer");
    if (adminEl) {
      adminEl.classList.remove("active");
      adminEl.style.display = "none";
    }
    const storefront = document.getElementById("storefrontContainer");
    if (storefront) storefront.style.display = "block";
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Refresh storefront state
    if (window.AppState) {
      AppState.settings = Storage.getSettings();
      AppState.products = Storage.getProducts();
    }
    if (typeof renderStoreSettings === "function") renderStoreSettings();
    if (typeof renderProducts === "function") renderProducts();
  },

  switchTab(tabName) {
    this.activeTab = tabName;

    // Update sidebar navigation
    document.querySelectorAll(".admin-nav-btn").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.tab === tabName);
    });

    // Update tab sections
    document.querySelectorAll(".admin-tab-section").forEach(sec => {
      const isActive = sec.id === `adminTab-${tabName}`;
      sec.classList.toggle("active", isActive);
      sec.style.display = isActive ? "block" : "none";
    });

    if (tabName === "overview") this.renderOverview();
    if (tabName === "orders") this.renderOrdersTable();
    if (tabName === "products") this.renderProductsTable();
    if (tabName === "coupons") this.renderCouponsTab();
    if (tabName === "accounts") this.renderAccountsTab();
    if (tabName === "settings") this.renderSettingsForm();
  },

  // Overview Tab Metrics & Quick Info Editor
  renderOverview() {
    const orders = Storage.getOrders();
    const products = Storage.getProducts();
    const settings = Storage.getSettings();

    const totalSales = orders
      .filter(o => o.status !== "Cancelled")
      .reduce((sum, o) => sum + (o.total || 0), 0);

    const pendingOrders = orders.filter(o => o.status === "Pending").length;

    const elSales = document.getElementById("statTotalSales");
    if (elSales) elSales.textContent = `Rs. ${totalSales.toLocaleString()}`;
    const elOrders = document.getElementById("statTotalOrders");
    if (elOrders) elOrders.textContent = orders.length;
    const elProds = document.getElementById("statTotalProducts");
    if (elProds) elProds.textContent = products.length;
    const elPending = document.getElementById("statPendingOrders");
    if (elPending) elPending.textContent = pendingOrders;

    // Populate Quick Contact & Address inputs
    const qAddress = document.getElementById("quickShopAddress");
    if (qAddress) qAddress.value = settings.shopAddress || "";
    const qEmail = document.getElementById("quickShopEmail");
    if (qEmail) qEmail.value = settings.email || "";
    const qPhone = document.getElementById("quickShopPhone");
    if (qPhone) qPhone.value = settings.phone || "";
    const qWhatsapp = document.getElementById("quickShopWhatsapp");
    if (qWhatsapp) qWhatsapp.value = settings.whatsapp || "";
    const qMapUrl = document.getElementById("quickGoogleMapsUrl");
    if (qMapUrl) qMapUrl.value = settings.googleMapsUrl || "";

    // Render recent orders in overview
    const recentTbody = document.getElementById("adminRecentOrdersTbody");
    if (!recentTbody) return;

    recentTbody.innerHTML = "";
    orders.slice(0, 5).forEach(order => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><strong>#${order.id}</strong></td>
        <td>${order.customerName}<br><small style="color:#9ca3af">${order.phone}</small></td>
        <td>Rs. ${order.total.toLocaleString()}</td>
        <td><span class="order-status-badge ${order.status}">${order.status}</span></td>
        <td><small>${order.date}</small></td>
      `;
      recentTbody.appendChild(tr);
    });
  },

  // Save Quick Contact directly from Overview
  saveQuickContact() {
    const address = document.getElementById("quickShopAddress")?.value.trim() || "";
    const email = document.getElementById("quickShopEmail")?.value.trim() || "";
    const phone = document.getElementById("quickShopPhone")?.value.trim() || "";
    const whatsapp = document.getElementById("quickShopWhatsapp")?.value.trim() || "";
    let mapUrl = document.getElementById("quickGoogleMapsUrl")?.value.trim() || "";

    if (!address) {
      showToast("Please provide the physical shop address!", "error");
      return;
    }

    // Sanitize if admin pasted an iframe embed code
    if (mapUrl.includes("<iframe") || mapUrl.includes("src=")) {
      const match = mapUrl.match(/src=["'](.*?)["']/);
      if (match && match[1]) {
        mapUrl = match[1];
      }
    }

    let cleanWhatsapp = whatsapp.replace(/[^0-9]/g, "");
    if (cleanWhatsapp.startsWith("0")) {
      cleanWhatsapp = "92" + cleanWhatsapp.substring(1);
    }
    if (!cleanWhatsapp) cleanWhatsapp = "923212920914";

    const current = Storage.getSettings();
    const updated = {
      ...current,
      shopAddress: address,
      googleMapsQuery: address,
      googleMapsUrl: mapUrl || current.googleMapsUrl || "https://share.google/iiBvxUjHqCga5PFY1",
      email: email || current.email || "thelasharicommunication@gmail.com",
      phone: phone || current.phone || "+92 321 2920914",
      whatsapp: cleanWhatsapp
    };

    Storage.saveSettings(updated);
    if (window.AppState) AppState.settings = updated;
    if (typeof renderStoreInfo === "function") renderStoreInfo();
    if (typeof renderStoreSettings === "function") renderStoreSettings();

    // Sync with settings tab inputs if currently loaded in DOM
    const setAddr = document.getElementById("setShopAddress");
    if (setAddr) setAddr.value = address;
    const setMap = document.getElementById("setGoogleMapsUrl");
    if (setMap) setMap.value = updated.googleMapsUrl;

    showToast("Shop Address, Google Maps link & Contact details saved successfully!", "success");
  },

  // Orders Tab Management & Live Filtering
  filterOrdersByStatus(status) {
    this.orderStatusFilter = status;
    this.renderOrdersTable();
  },

  searchOrders(query) {
    this.orderSearchQuery = (query || "").toLowerCase().trim();
    this.renderOrdersTable();
  },

  renderOrdersTable() {
    const orders = Storage.getOrders();
    const tbody = document.getElementById("adminOrdersTbody");
    const countText = document.getElementById("adminOrdersCountText");
    if (!tbody) return;

    tbody.innerHTML = "";

    let filtered = orders;

    // Status filter
    if (this.orderStatusFilter !== "all") {
      filtered = filtered.filter(o => o.status.toLowerCase() === this.orderStatusFilter.toLowerCase());
    }

    // Search query filter
    if (this.orderSearchQuery) {
      filtered = filtered.filter(o => 
        o.id.toLowerCase().includes(this.orderSearchQuery) ||
        o.customerName.toLowerCase().includes(this.orderSearchQuery) ||
        o.phone.toLowerCase().includes(this.orderSearchQuery) ||
        o.city.toLowerCase().includes(this.orderSearchQuery) ||
        (o.courierPartner && o.courierPartner.toLowerCase().includes(this.orderSearchQuery))
      );
    }

    if (countText) {
      countText.textContent = `Showing ${filtered.length} of ${orders.length} orders`;
    }

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 2.5rem; color:var(--text-muted);">No orders match your filter.</td></tr>`;
      return;
    }

    filtered.forEach(order => {
      const tr = document.createElement("tr");
      tr.style.borderBottom = "1px solid #232c25";
      tr.innerHTML = `
        <td style="padding:12px 10px;">
          <strong style="color:#fff;">#${order.id}</strong>
          <br><small style="color:var(--lime); font-weight:700;">${order.courierPartner || "TCS Express"}</small>
          ${order.trackingNumber ? `<br><small style="color:#879b8a; font-size:10px;">TRK: ${order.trackingNumber}</small>` : ""}
        </td>
        <td style="padding:12px 10px;">
          <strong style="color:#fff;">${order.customerName}</strong>
          <br><small style="color:#adb5a8;">${order.phone}</small>
          <br><small style="color:#879b8a; font-size:11px;">${order.city || "Pakistan"}</small>
        </td>
        <td style="padding:12px 10px; color:#adb5a8; font-size:12px;">
          ${(order.items || []).map(i => `<span style="color:#fff; font-weight:600;">${i.qty}x</span> ${i.title}`).join("<br>")}
        </td>
        <td style="padding:12px 10px; font-weight:800; color:var(--lime);">
          Rs. ${(order.total || 0).toLocaleString()}
          <br><small style="color:#879b8a; font-weight:normal; font-size:10.5px;">Fee: Rs. ${order.deliveryFee ?? 200}</small>
        </td>
        <td style="padding:12px 10px;">
          <span style="background:#111412; border:1px solid #28332a; padding:3px 8px; border-radius:6px; color:#fff; font-size:11px; font-weight:700;">
            ${order.paymentMethod || "COD"}
          </span>
          ${order.transactionRef ? `<br><small style="color:var(--lime); font-size:10.5px;">Ref: ${order.transactionRef}</small>` : ""}
        </td>
        <td style="padding:12px 10px;">
          <select class="status-select-inline" onchange="AdminController.updateOrderStatus('${order.id}', this.value)">
            <option value="Pending" ${order.status === "Pending" ? "selected" : ""}>Pending</option>
            <option value="Confirmed" ${order.status === "Confirmed" ? "selected" : ""}>Confirmed</option>
            <option value="Shipped" ${order.status === "Shipped" ? "selected" : ""}>Shipped</option>
            <option value="Delivered" ${order.status === "Delivered" ? "selected" : ""}>Delivered</option>
            <option value="Cancelled" ${order.status === "Cancelled" ? "selected" : ""}>Cancelled</option>
          </select>
        </td>
        <td style="padding:12px 10px; text-align:right;">
          <div style="display:inline-flex; gap:6px;">
            <button type="button" class="admin-btn admin-btn-secondary" onclick="AdminController.viewOrderInvoice('${order.id}')" title="View Details">
              📄 Invoice
            </button>
            <button type="button" class="admin-btn admin-btn-secondary" style="color:#25d366;" onclick="AdminController.whatsappCustomer('${order.id}')" title="WhatsApp Customer">
              💬 WA
            </button>
            <button type="button" class="admin-btn admin-btn-danger" onclick="AdminController.deleteOrder('${order.id}')" title="Delete">
              ✕
            </button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
  },

  updateOrderStatus(orderId, newStatus) {
    const orders = Storage.getOrders();
    const order = orders.find(o => o.id === orderId);
    if (order) {
      order.status = newStatus;
      Storage.saveOrders(orders);
      showToast(`Order #${orderId} marked as ${newStatus}`, "success");
      this.renderOverview();
      this.renderOrdersTable();
    }
  },

  deleteOrder(orderId) {
    if (!confirm(`Are you sure you want to delete Order #${orderId}?`)) return;
    let orders = Storage.getOrders();
    orders = orders.filter(o => o.id !== orderId);
    Storage.saveOrders(orders);
    showToast(`Order #${orderId} deleted successfully`, "info");
    this.renderOrdersTable();
    this.renderOverview();
  },

  viewOrderInvoice(orderId) {
    const orders = Storage.getOrders();
    const o = orders.find(item => item.id === orderId);
    if (!o) return;

    alert(
      `=============================\n` +
      `ORDER INVOICE: #${o.id}\n` +
      `Date: ${o.date}\n` +
      `=============================\n` +
      `Customer: ${o.customerName}\n` +
      `Phone: ${o.phone}\n` +
      `Email: ${o.email}\n` +
      `Address: ${o.address}, ${o.city}\n\n` +
      `Delivery Partner: ${o.courierPartner}\n` +
      `Tracking ID: ${o.trackingNumber}\n` +
      `Status: ${o.status}\n\n` +
      `Items:\n` +
      o.items.map(i => ` • ${i.qty}x ${i.title} [${i.model}] - Rs. ${(i.price * i.qty).toLocaleString()}`).join("\n") +
      `\n\nSubtotal: Rs. ${o.subtotal.toLocaleString()}\n` +
      (o.discount ? `Coupon Discount (${o.coupon || 'Promo'}): - Rs. ${o.discount.toLocaleString()} PKR\n` : "") +
      `Delivery Charges: Rs. ${o.deliveryFee} PKR\n` +
      `Grand Total: Rs. ${o.total.toLocaleString()} PKR\n` +
      `Payment: ${o.paymentMethod} ${o.transactionRef ? `(Ref: ${o.transactionRef})` : ""}\n` +
      `=============================`
    );
  },

  whatsappCustomer(orderId) {
    const orders = Storage.getOrders();
    const o = orders.find(item => item.id === orderId);
    if (!o) return;

    let cleanPhone = o.phone.replace(/[^0-9]/g, "");
    if (cleanPhone.startsWith("0")) {
      cleanPhone = "92" + cleanPhone.substring(1);
    }

    const message = encodeURIComponent(
      `Assalam-o-Alaikum ${o.customerName}!\n\n` +
      `Thank you for shopping at The Lashari Communication.\n` +
      `Your Order #${o.id} of total Rs. ${o.total.toLocaleString()} PKR has been confirmed.\n` +
      `Delivery Partner: ${o.courierPartner}\n` +
      `Tracking #: ${o.trackingNumber}\n\n` +
      `Your parcel will be delivered in 2-3 business days. If you have any questions, feel free to ask!`
    );

    window.open(`https://wa.me/${cleanPhone}?text=${message}`, "_blank");
  },

  // Products Tab Management & Quick Stock Adjustment
  searchProducts(query) {
    this.productSearchQuery = (query || "").toLowerCase().trim();
    this.renderProductsTable();
  },

  async quickAdjustStock(productId, change) {
    let products = Storage.getProducts();
    const p = products.find(item => item.id === productId);
    if (!p) return;
    p.stock = Math.max(0, (p.stock || 0) + change);
    await Storage.saveProducts(products);
    if (window.AppState) AppState.products = products;
    if (typeof renderProducts === "function") renderProducts();
    this.renderProductsTable();
    showToast(`Stock for "${p.title}" updated to ${p.stock}`, "success");
  },

  renderProductsTable() {
    const products = Storage.getProducts();
    const tbody = document.getElementById("adminProductsTbody");
    if (!tbody) return;

    tbody.innerHTML = "";

    let filtered = products;
    if (this.productSearchQuery) {
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(this.productSearchQuery) ||
        (p.brandName && p.brandName.toLowerCase().includes(this.productSearchQuery)) ||
        (p.category && p.category.toLowerCase().includes(this.productSearchQuery))
      );
    }

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" style="padding:24px; text-align:center; color:#879b8a;">
            No products found matching "${this.productSearchQuery}".
          </td>
        </tr>
      `;
      return;
    }

    filtered.forEach(prod => {
      const hasOldPrice = prod.oldPrice && Number(prod.oldPrice) > Number(prod.price);
      const discountPct = hasOldPrice ? Math.round(((prod.oldPrice - prod.price) / prod.oldPrice) * 100) : 0;
      const isOnSale = prod.isOnSale !== false;

      const tr = document.createElement("tr");
      tr.style.borderBottom = "1px solid #232c25";
      tr.innerHTML = `
        <td style="padding:12px 10px;">
          <div style="display:flex; align-items:center; gap:10px;">
            <div style="width:36px; height:36px; border-radius:8px; background:#111412; display:grid; place-items:center; font-size:18px; border:1px solid #28332a; flex:none;">
              📦
            </div>
            <div>
              <strong style="color:#fff; font-size:13px;">${prod.title}</strong>
              <br><small style="color:#879b8a; font-size:11px;">${prod.brandName || prod.brand || "Accessory"}</small>
            </div>
          </div>
        </td>
        <td style="padding:12px 10px; color:#adb5a8;">
          ${prod.category || "General"}
        </td>
        <td style="padding:12px 10px; font-weight:800; color:var(--lime);">
          Rs. ${prod.price?.toLocaleString()}
        </td>
        <td style="padding:12px 10px;">
          ${hasOldPrice ? `<span style="text-decoration:line-through; color:#879b8a;">Rs. ${prod.oldPrice.toLocaleString()}</span>` : `<span style="color:#4a544b; font-size:11px;">None</span>`}
        </td>
        <td style="padding:12px 10px;">
          ${hasOldPrice ? `<span style="background:#3b141e; color:#ff6b8b; font-size:10.5px; font-weight:800; padding:2px 7px; border-radius:4px;">-${discountPct}%</span>` : `<span style="color:#4a544b;">—</span>`}
        </td>
        <td style="padding:12px 10px;">
          ${isOnSale ? `<span class="admin-badge" style="background:#3b141e; color:#ff6b8b; border:1px solid #6d2134;">🔥 SALE</span>` : `<span class="admin-badge admin-badge-hidden">Off</span>`}
        </td>
        <td style="padding:12px 10px; color:#fff; font-weight:700;">
          ${prod.stock ?? 10}
        </td>
        <td style="padding:12px 10px; text-align:right;">
          <div style="display:inline-flex; gap:6px;">
            <button type="button" class="admin-btn admin-btn-secondary" onclick="AdminController.openProductForm('${prod.id}')" title="Edit Product">
              Edit ✎
            </button>
            <button type="button" class="admin-btn admin-btn-danger" onclick="AdminController.deleteProduct('${prod.id}')" title="Delete Product">
              Delete ✕
            </button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
  },

  // Dynamic Image URL Boxes Management
  addImageUrlField(url = "") {
    const list = document.getElementById("productImagesList");
    if (!list) return;
    const row = document.createElement("div");
    row.className = "prod-image-row";
    row.style.cssText = "display:flex; gap:8px; align-items:center;";
    const count = list.children.length + 1;
    row.innerHTML = `
      <span style="font-size:11px; font-weight:700; color:#879b8a; min-width:62px;">Photo #${count}:</span>
      <input type="url" class="prod-image-url-input" placeholder="https://example.com/cover-image.jpg" value="${(url || "").replace(/"/g, '&quot;')}" style="flex:1; background:#19201a; border:1px solid #28332a; color:#fff; border-radius:8px; padding:10px; font-size:12.5px;">
      <button type="button" onclick="AdminController.removeImageUrlField(this)" title="Remove URL" style="background:#2a1c1c; border:1px solid #4a2828; color:#f87171; border-radius:8px; width:38px; height:38px; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:16px;">&times;</button>
    `;
    list.appendChild(row);
  },

  removeImageUrlField(btn) {
    const row = btn?.closest(".prod-image-row");
    if (!row) return;
    const list = document.getElementById("productImagesList");
    row.remove();
    if (list) {
      Array.from(list.children).forEach((child, idx) => {
        const span = child.querySelector("span");
        if (span) span.textContent = `Photo #${idx + 1}:`;
      });
      if (list.children.length === 0) {
        this.addImageUrlField("");
      }
    }
  },

  getProductImagesFromForm() {
    const inputs = document.querySelectorAll("#productImagesList .prod-image-url-input");
    const urls = [];
    inputs.forEach(inp => {
      const val = (inp.value || "").trim();
      if (val) urls.push(val);
    });
    return urls;
  },

  openProductForm(productId = null) {
    const box = document.getElementById("adminProductFormBox");
    const titleEl = document.getElementById("adminProductFormTitle");
    const editIdInput = document.getElementById("editProductId");
    const formTitle = document.getElementById("prodFormTitle");
    const formCat = document.getElementById("prodFormCategory");
    const formBrand = document.getElementById("prodFormBrand");
    const formPrice = document.getElementById("prodFormPrice");
    const formOldPrice = document.getElementById("prodFormOldPrice");
    const formIsOnSale = document.getElementById("prodFormIsOnSale");
    const formStock = document.getElementById("prodFormStock");
    const formDesc = document.getElementById("prodFormDescription");
    const imgList = document.getElementById("productImagesList");

    if (!box) return;

    if (imgList) imgList.innerHTML = "";

    if (productId) {
      const products = Storage.getProducts();
      const prod = products.find(p => p.id === productId);
      if (prod) {
        if (titleEl) titleEl.textContent = `Edit Product: ${prod.title}`;
        if (editIdInput) editIdInput.value = prod.id;
        if (formTitle) formTitle.value = prod.title || "";
        if (formCat) formCat.value = prod.category || "Mobile Cover";
        if (formBrand) formBrand.value = prod.brand || "infinix";
        if (formPrice) formPrice.value = prod.price || "";
        if (formOldPrice) formOldPrice.value = prod.oldPrice || "";
        if (formIsOnSale) formIsOnSale.checked = prod.isOnSale !== false;
        if (formStock) formStock.value = prod.stock ?? 25;
        if (formDesc) formDesc.value = prod.description || "";

        const existingImages = Array.isArray(prod.images) && prod.images.length > 0 
          ? prod.images 
          : (prod.image ? [prod.image] : []);

        if (existingImages.length > 0) {
          existingImages.forEach(u => this.addImageUrlField(u));
        } else {
          this.addImageUrlField("");
        }
      }
    } else {
      if (titleEl) titleEl.textContent = "Add New Product";
      if (editIdInput) editIdInput.value = "";
      const form = document.getElementById("adminProductForm");
      if (form) form.reset();
      if (formIsOnSale) formIsOnSale.checked = true;
      if (formStock) formStock.value = 25;
      this.addImageUrlField("");
    }

    box.style.display = "block";
    box.scrollIntoView({ behavior: "smooth", block: "nearest" });
  },

  closeProductForm() {
    const box = document.getElementById("adminProductFormBox");
    if (box) box.style.display = "none";
    const form = document.getElementById("adminProductForm");
    if (form) form.reset();
    const imgList = document.getElementById("productImagesList");
    if (imgList) imgList.innerHTML = "";
  },

  async saveProduct(e) {
    if (e && e.preventDefault) e.preventDefault();

    const editId = document.getElementById("editProductId")?.value.trim();
    const title = document.getElementById("prodFormTitle")?.value.trim();
    const category = document.getElementById("prodFormCategory")?.value.trim() || "Mobile Cover";
    const brand = document.getElementById("prodFormBrand")?.value.trim() || "infinix";
    const price = parseInt(document.getElementById("prodFormPrice")?.value, 10);
    const oldPriceStr = document.getElementById("prodFormOldPrice")?.value.trim();
    const oldPrice = (oldPriceStr && parseInt(oldPriceStr, 10) > 0) ? parseInt(oldPriceStr, 10) : null;
    const isOnSale = document.getElementById("prodFormIsOnSale")?.checked ?? true;
    const stock = parseInt(document.getElementById("prodFormStock")?.value, 10) || 25;
    const images = this.getProductImagesFromForm();
    const image = images[0] || "";
    const description = document.getElementById("prodFormDescription")?.value.trim() || "";

    if (!title || !price || isNaN(price)) {
      showToast("Please provide product title and valid selling price!", "error");
      return;
    }

    const brandMap = {
      apple: "Apple",
      samsung: "Samsung",
      xiaomi: "Xiaomi",
      vivo: "Vivo",
      oppo: "Oppo",
      realme: "Realme",
      infinix: "Infinix",
      tecno: "Tecno",
      general: "Universal Tech"
    };

    let products = Storage.getProducts();

    try {
      if (editId) {
        const idx = products.findIndex(p => p.id === editId);
        if (idx !== -1) {
          products[idx] = {
            ...products[idx],
            title,
            category,
            brand,
            brandName: brandMap[brand] || brand.toUpperCase(),
            price,
            oldPrice,
            isOnSale,
            stock,
            image: image || products[idx].image || "",
            images: images.length > 0 ? images : (products[idx].images || (image ? [image] : [])),
            description: description || products[idx].description
          };
          showToast(`Product "${title}" updated successfully!`, "success");
        }
      } else {
        const newProduct = {
          id: `prod-${Date.now()}`,
          title,
          category,
          brand,
          brandName: brandMap[brand] || brand.toUpperCase(),
          compatibleModels: ["Universal Device Compatibility"],
          price,
          oldPrice,
          isOnSale,
          rating: 5.0,
          reviewsCount: 1,
          stock,
          isFeatured: true,
          badge: isOnSale ? "Sale Item" : "New Arrival",
          image: image || "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=700&q=80",
          images: images.length > 0 ? images : [image || "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=700&q=80"],
          description: description || "Premium authentic tech accessory backed with official checking warranty."
        };
        products.unshift(newProduct);
        showToast(`New product "${title}" added to store!`, "success");
      }

      await Storage.saveProducts(products);
      if (window.AppState) AppState.products = products;

      this.renderProductsTable();
      this.closeProductForm();
      if (typeof renderProducts === "function") renderProducts();
    } catch (err) {
      console.error("Error saving product:", err);
      showToast("Could not save product: " + err.message, "error");
    }
  },

  async deleteProduct(productId) {
    let products = Storage.getProducts();
    const prod = products.find(p => p.id === productId);
    const title = prod ? prod.title : "product";

    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    products = products.filter(p => p.id !== productId);
    await Storage.saveProducts(products);
    if (window.AppState) AppState.products = products;

    showToast(`Product "${title}" deleted from store`, "info");
    this.renderProductsTable();
    if (typeof renderProducts === "function") renderProducts();
    this.renderOverview();
  },

  // Coupons Tab Management
  openCouponForm() {
    const box = document.getElementById("adminCouponFormBox");
    if (box) {
      box.style.display = "block";
      box.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  },

  closeCouponForm() {
    const box = document.getElementById("adminCouponFormBox");
    if (box) box.style.display = "none";
    const form = document.getElementById("adminCouponForm");
    if (form) form.reset();
  },

  renderCouponsTab() {
    const coupons = Storage.getCoupons();
    const tbody = document.getElementById("adminCouponsTbody");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (coupons.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 2rem; color:#879b8a;">No active coupons created yet. Click "+ Add New Coupon" to create one.</td></tr>`;
      return;
    }

    coupons.forEach(c => {
      const tr = document.createElement("tr");
      tr.style.borderBottom = "1px solid #232c25";
      tr.innerHTML = `
        <td style="padding:12px 10px;">
          <code style="background:#111412; border:1px solid #28332a; color:var(--lime); padding:4px 8px; border-radius:6px; font-weight:800; font-family:monospace; font-size:12px;">
            ${c.code}
          </code>
        </td>
        <td style="padding:12px 10px; font-weight:800; color:#fff;">
          <span style="background:#1c2b1e; color:var(--lime); padding:3px 8px; border-radius:6px; font-size:11.5px;">
            ${c.discountType === "percent" ? `${c.value}% OFF` : `Rs. ${c.value} OFF`}
          </span>
        </td>
        <td style="padding:12px 10px; color:#adb5a8; font-size:12px;">
          ${c.label || "Store Discount"}
        </td>
        <td style="padding:12px 10px; text-align:right;">
          <button type="button" class="admin-btn admin-btn-danger" onclick="AdminController.deleteCoupon('${c.code}')" title="Delete Coupon">
            Delete ✕
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  },

  saveCoupon(e) {
    if (e && e.preventDefault) e.preventDefault();
    const code = document.getElementById("couponFormCode")?.value.trim().toUpperCase();
    const type = document.getElementById("couponFormType")?.value || "percent";
    const value = parseInt(document.getElementById("couponFormValue")?.value, 10);
    const label = document.getElementById("couponFormLabel")?.value.trim() || `${type === 'percent' ? `${value}% Off` : `Rs. ${value} Off`} Promo`;

    if (!code || isNaN(value) || value <= 0) {
      showToast("Please enter valid coupon details!", "error");
      return;
    }

    let coupons = Storage.getCoupons();
    if (coupons.some(c => c.code === code)) {
      showToast(`Coupon "${code}" already exists!`, "error");
      return;
    }

    coupons.push({
      code,
      discountType: type,
      value,
      label
    });

    Storage.saveCoupons(coupons);
    showToast(`Coupon "${code}" activated successfully!`, "success");

    this.closeCouponForm();
    this.renderCouponsTab();
    if (typeof renderCouponSuggestions === "function") renderCouponSuggestions();
  },

  deleteCoupon(code) {
    if (!confirm(`Delete coupon "${code}"?`)) return;
    let coupons = Storage.getCoupons();
    coupons = coupons.filter(c => c.code !== code);
    Storage.saveCoupons(coupons);
    showToast(`Coupon "${code}" deleted`, "info");
    this.renderCouponsTab();
    if (typeof renderCouponSuggestions === "function") renderCouponSuggestions();
  },

  // ==========================================
  // PAYMENT ACCOUNTS MANAGEMENT (Advance Payment)
  // ==========================================
  renderAccountsTab() {
    const s = Storage.getSettings();
    const accounts = s.paymentAccounts || [];
    const tbody = document.getElementById("adminAccountsTbody");
    if (!tbody) return;

    if (accounts.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" style="padding:24px; text-align:center; color:#879b8a;">
            Koi account create nahi hua. <strong>"+ Add New Account"</strong> par click kar ke account add karein.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = accounts.map(acc => {
      const isVisible = acc.active !== false;
      const badgeHtml = isVisible
        ? `<span class="admin-badge admin-badge-active">● Visible to Customers</span>`
        : `<span class="admin-badge admin-badge-hidden">👁‍🗨 Hidden from Checkout</span>`;

      const toggleBtnText = isVisible ? "Hide 👁‍🗨" : "Unhide 👁";
      const toggleTitle = isVisible ? "Click to hide from customer view" : "Click to show to customer";

      return `
        <tr style="border-bottom:1px solid #232c25;">
          <td style="padding:12px 10px; font-weight:800; color:#fff;">
            ${acc.bankName}
          </td>
          <td style="padding:12px 10px; color:#adb5a8;">
            ${acc.accountTitle}
          </td>
          <td style="padding:12px 10px;">
            <code style="font-family:monospace; background:#111412; padding:3px 8px; border-radius:6px; color:var(--lime); font-size:12px; font-weight:700;">
              ${acc.accountNumber}
            </code>
          </td>
          <td style="padding:12px 10px;">
            ${badgeHtml}
          </td>
          <td style="padding:12px 10px; text-align:right;">
            <div style="display:inline-flex; gap:6px;">
              <button type="button" class="admin-btn admin-btn-secondary" title="${toggleTitle}" onclick="AdminController.toggleAccountVisibility('${acc.id}')">
                ${toggleBtnText}
              </button>
              <button type="button" class="admin-btn admin-btn-secondary" title="Edit account" onclick="AdminController.editPaymentAccount('${acc.id}')">
                Edit ✎
              </button>
              <button type="button" class="admin-btn admin-btn-danger" title="Delete account" onclick="AdminController.deletePaymentAccount('${acc.id}')">
                Delete ✕
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join("");
  },

  openAccountForm(accId = null) {
    const box = document.getElementById("adminAccountFormBox");
    const titleEl = document.getElementById("adminAccountFormTitle");
    const editIdInput = document.getElementById("editAccountId");
    const bankInput = document.getElementById("accFormBank");
    const titleInput = document.getElementById("accFormTitle");
    const numInput = document.getElementById("accFormNumber");
    const activeInput = document.getElementById("accFormActive");

    if (!box) return;

    if (accId) {
      const s = Storage.getSettings();
      const acc = (s.paymentAccounts || []).find(a => a.id === accId);
      if (acc) {
        if (titleEl) titleEl.textContent = `Edit Account: ${acc.bankName}`;
        if (editIdInput) editIdInput.value = acc.id;
        if (bankInput) bankInput.value = acc.bankName || "";
        if (titleInput) titleInput.value = acc.accountTitle || "";
        if (numInput) numInput.value = acc.accountNumber || "";
        if (activeInput) activeInput.checked = acc.active !== false;
      }
    } else {
      if (titleEl) titleEl.textContent = "Add New Payment Account";
      if (editIdInput) editIdInput.value = "";
      if (bankInput) bankInput.value = "";
      if (titleInput) titleInput.value = "";
      if (numInput) numInput.value = "";
      if (activeInput) activeInput.checked = true;
    }

    box.style.display = "block";
    box.scrollIntoView({ behavior: "smooth", block: "nearest" });
  },

  closeAccountForm() {
    const box = document.getElementById("adminAccountFormBox");
    if (box) box.style.display = "none";
    const form = document.getElementById("adminAccountForm");
    if (form) form.reset();
  },

  editPaymentAccount(accId) {
    this.openAccountForm(accId);
  },

  savePaymentAccount(e) {
    if (e && e.preventDefault) e.preventDefault();

    const editId = document.getElementById("editAccountId")?.value.trim();
    const bank = document.getElementById("accFormBank")?.value.trim();
    const title = document.getElementById("accFormTitle")?.value.trim();
    const num = document.getElementById("accFormNumber")?.value.trim();
    const isActive = document.getElementById("accFormActive")?.checked ?? true;

    if (!bank || !title || !num) {
      showToast("Please enter Bank Name, Account Title, and Account Number!", "error");
      return;
    }

    const settings = Storage.getSettings();
    if (!Array.isArray(settings.paymentAccounts)) {
      settings.paymentAccounts = [];
    }

    if (editId) {
      const idx = settings.paymentAccounts.findIndex(a => a.id === editId);
      if (idx !== -1) {
        settings.paymentAccounts[idx] = {
          ...settings.paymentAccounts[idx],
          bankName: bank,
          accountTitle: title,
          accountNumber: num,
          active: isActive
        };
        showToast(`Account "${bank}" updated successfully!`, "success");
      }
    } else {
      const newAcc = {
        id: "acc_" + Date.now(),
        bankName: bank,
        accountTitle: title,
        accountNumber: num,
        active: isActive
      };
      settings.paymentAccounts.push(newAcc);
      showToast(`New account "${bank}" added successfully!`, "success");
    }

    Storage.saveSettings(settings);
    AppState.settings = settings;

    // Refresh views live
    this.renderAccountsTab();
    this.closeAccountForm();
    if (typeof renderStoreSettings === "function") renderStoreSettings();
  },

  toggleAccountVisibility(accId) {
    const settings = Storage.getSettings();
    if (!Array.isArray(settings.paymentAccounts)) return;

    const acc = settings.paymentAccounts.find(a => a.id === accId);
    if (!acc) return;

    acc.active = (acc.active === false);
    Storage.saveSettings(settings);
    AppState.settings = settings;

    this.renderAccountsTab();
    if (typeof renderStoreSettings === "function") renderStoreSettings();

    showToast(`${acc.bankName} is now ${acc.active ? "Visible to customers" : "Hidden from checkout"}`, "info");
  },

  deletePaymentAccount(accId) {
    const settings = Storage.getSettings();
    if (!Array.isArray(settings.paymentAccounts)) return;

    const acc = settings.paymentAccounts.find(a => a.id === accId);
    const bankName = acc ? acc.bankName : "account";

    if (!confirm(`Are you sure you want to delete "${bankName}"?`)) return;

    settings.paymentAccounts = settings.paymentAccounts.filter(a => a.id !== accId);
    Storage.saveSettings(settings);
    AppState.settings = settings;

    this.renderAccountsTab();
    if (typeof renderStoreSettings === "function") renderStoreSettings();

    showToast(`Account "${bankName}" deleted!`, "info");
  },

  // ==========================================
  // SETTINGS TAB MANAGEMENT (Brand & Store Info)
  // ==========================================
  renderSettingsForm() {
    const s = Storage.getSettings();

    // Brand inputs
    const bName = document.getElementById("setBrandName");
    if (bName) bName.value = s.brandName || "Lashari Communication";
    const bDot = document.getElementById("setBrandDot");
    if (bDot) bDot.value = s.brandDot !== undefined ? s.brandDot : ".";

    // Shop info
    const sAddr = document.getElementById("setShopAddress");
    if (sAddr) sAddr.value = s.shopAddress || "";
    const sEmail = document.getElementById("setShopEmail");
    if (sEmail) sEmail.value = s.email || "";
    const sPhone = document.getElementById("setShopPhone");
    if (sPhone) sPhone.value = s.phone || "";

    const sFee = document.getElementById("setDeliveryFee");
    if (sFee) sFee.value = s.deliveryFee || 200;

    const sPin = document.getElementById("setAdminPin");
    if (sPin) sPin.value = s.adminPin || "Speed150";

    const sAnn = document.getElementById("setAnnouncementText");
    if (sAnn) sAnn.value = s.announcementText || "";

    // Homepage Sections Visibility
    const vis = s.sectionVisibility || {};
    const setCheck = (id, val, defaultTrue = true) => {
      const el = document.getElementById(id);
      if (el) el.checked = defaultTrue ? (val !== false) : (val === true);
    };
    setCheck("secVisAnnouncement", vis.announcement, true);
    setCheck("secVisHero", vis.hero, true);
    setCheck("secVisCategories", vis.categories, true);
    setCheck("secVisCollection", vis.collection, true);
    setCheck("secVisReviews", vis.reviews, true);
    setCheck("secVisOffer", vis.offer, true);
    setCheck("secVisEditorial", vis.editorial, false);
    setCheck("secVisClosing", vis.closing, false);
    setCheck("secVisBrands", vis.brands, true);
    setCheck("secVisLocation", vis.location, true);

    // Special Promo Offer
    const offer = s.specialOffer || {};
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val || "";
    };
    setVal("setOfferTag", offer.tag || "🔥 LIMITED TIME MEGA DROP");
    setVal("setOfferTitle", offer.title || "FLAT 25% OFF · WEEKEND EDIT");
    setVal("setOfferDesc", offer.desc || "");
    setVal("setOfferCode", offer.code || "FLASH25");
    setVal("setOfferBtnText", offer.btnText || "Shop Weekend Deals");
    setVal("setOfferBtnLink", offer.btnLink || "#collection");
    setVal("setOfferNote", offer.note || "⚡ Valid for all orders across Pakistan · Limited Stock");

    // Location & Timings
    setVal("setShopTimings", s.storeTimings || "Monday – Sunday: 11:00 AM – 11:00 PM (Friday Break: 1:00 PM – 2:30 PM)");
    setVal("setLocHeading", s.locationHeading || "Find us in person.");
    setVal("setLocDesc", s.locationDesc || "Experience our premium tech essentials, live checking warranty, and free precision mobile cover fitting at our official outlet.");
    setVal("setGoogleMapsUrl", s.googleMapsUrl || "https://share.google/iiBvxUjHqCga5PFY1");
  },

  saveSettings(e) {
    if (e && e.preventDefault) e.preventDefault();

    const current = Storage.getSettings();

    const brandName = document.getElementById("setBrandName")?.value.trim() || current.brandName || "Lashari Communication";
    const brandDot = document.getElementById("setBrandDot")?.value ?? current.brandDot ?? ".";
    const shopAddress = document.getElementById("setShopAddress")?.value.trim() || current.shopAddress || "";
    const email = document.getElementById("setShopEmail")?.value.trim() || current.email || "";
    const rawPhone = document.getElementById("setShopPhone")?.value.trim() || current.phone || "+92 321 2920914";
    const deliveryFee = parseInt(document.getElementById("setDeliveryFee")?.value, 10) || current.deliveryFee || 200;
    const adminPin = document.getElementById("setAdminPin")?.value.trim() || current.adminPin || "Speed150";
    const announcementText = document.getElementById("setAnnouncementText")?.value.trim() || "";
    const storeTimings = document.getElementById("setShopTimings")?.value.trim() || "Monday – Sunday: 11:00 AM – 11:00 PM (Friday Break: 1:00 PM – 2:30 PM)";
    const locationHeading = document.getElementById("setLocHeading")?.value.trim() || "Find us in person.";
    const locationDesc = document.getElementById("setLocDesc")?.value.trim() || current.locationDesc || "";

    let googleMapsUrl = document.getElementById("setGoogleMapsUrl")?.value.trim() || "";
    if (googleMapsUrl.includes("<iframe") || googleMapsUrl.includes("src=")) {
      const match = googleMapsUrl.match(/src=["'](.*?)["']/);
      if (match && match[1]) {
        googleMapsUrl = match[1];
      }
    }
    if (!googleMapsUrl) {
      googleMapsUrl = current.googleMapsUrl || "https://share.google/iiBvxUjHqCga5PFY1";
    }

    let cleanWhatsapp = rawPhone.replace(/[^0-9]/g, "");
    if (cleanWhatsapp.startsWith("0")) {
      cleanWhatsapp = "92" + cleanWhatsapp.substring(1);
    }
    if (!cleanWhatsapp) cleanWhatsapp = "923212920914";

    // Section Visibility Checkmarks
    const getCheck = (id, fallback = true) => {
      const el = document.getElementById(id);
      return el ? el.checked : fallback;
    };

    const prevVis = current.sectionVisibility || {};
    const sectionVisibility = {
      announcement: getCheck("secVisAnnouncement", prevVis.announcement ?? true),
      hero: getCheck("secVisHero", prevVis.hero ?? true),
      categories: getCheck("secVisCategories", prevVis.categories ?? true),
      collection: getCheck("secVisCollection", prevVis.collection ?? true),
      reviews: getCheck("secVisReviews", prevVis.reviews ?? true),
      offer: getCheck("secVisOffer", prevVis.offer ?? true),
      editorial: getCheck("secVisEditorial", prevVis.editorial ?? false),
      closing: getCheck("secVisClosing", prevVis.closing ?? false),
      brands: getCheck("secVisBrands", prevVis.brands ?? true),
      location: getCheck("secVisLocation", prevVis.location ?? true)
    };

    // Special Promo Offer
    const specialOffer = {
      tag: document.getElementById("setOfferTag")?.value.trim() || "🔥 LIMITED TIME MEGA DROP",
      title: document.getElementById("setOfferTitle")?.value.trim() || "FLAT 25% OFF · WEEKEND EDIT",
      desc: document.getElementById("setOfferDesc")?.value.trim() || "",
      code: document.getElementById("setOfferCode")?.value.trim() || "FLASH25",
      btnText: document.getElementById("setOfferBtnText")?.value.trim() || "Shop Weekend Deals",
      btnLink: document.getElementById("setOfferBtnLink")?.value.trim() || "#collection",
      note: document.getElementById("setOfferNote")?.value.trim() || "⚡ Valid for all orders across Pakistan · Limited Stock"
    };

    const updated = {
      ...current,
      brandName: brandName,
      brandDot: brandDot,
      shopAddress: shopAddress,
      googleMapsQuery: shopAddress,
      googleMapsUrl: googleMapsUrl,
      email: email,
      phone: rawPhone,
      whatsapp: cleanWhatsapp,
      storeTimings: storeTimings,
      locationHeading: locationHeading,
      locationDesc: locationDesc,
      deliveryFee: deliveryFee,
      adminPin: adminPin,
      announcementText: announcementText,
      sectionVisibility: sectionVisibility,
      specialOffer: specialOffer
    };

    if (window.AppState) AppState.settings = updated;
    if (typeof renderStoreSettings === "function") renderStoreSettings();
    if (typeof renderStoreInfo === "function") renderStoreInfo();

    // Also sync Overview tab fields if present
    const qAddress = document.getElementById("quickShopAddress");
    if (qAddress) qAddress.value = shopAddress;
    const qMapUrl = document.getElementById("quickGoogleMapsUrl");
    if (qMapUrl) qMapUrl.value = googleMapsUrl;

    this.renderOverview();

    Storage.saveSettings(updated).then(ok => {
      if (ok) {
        showToast("Settings synchronized across all devices!", "success");
      } else {
        showToast("Settings saved locally! (Syncing globally when server connects)", "success");
      }
    }).catch(() => {
      showToast("Store and brand settings saved!", "success");
    });
  },

  resetStoreData() {
    if (confirm("Reset all products, orders, and settings to original initial demo state?")) {
      Storage.resetDemoData();
      showToast("Store data reset to default successfully!", "info");
      if (window.AppState) {
        AppState.settings = Storage.getSettings();
        AppState.products = Storage.getProducts();
      }
      if (typeof renderStoreInfo === "function") renderStoreInfo();
      if (typeof renderProducts === "function") renderProducts();
      this.renderOverview();
      this.renderOrdersTable();
      this.renderProductsTable();
      this.renderSettingsForm();
    }
  },

  bindEvents() {
    document.querySelectorAll(".admin-nav-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        this.switchTab(btn.dataset.tab);
      });
    });

    const prodForm = document.getElementById("adminProductForm");
    // Form already has onsubmit="AdminController.saveProduct(event)", avoid double-submitting

    const imgInput = document.getElementById("prodFormImage");
    if (imgInput) {
      imgInput.addEventListener("input", (e) => {
        const preview = document.getElementById("prodFormImagePreview");
        if (preview && e.target.value) {
          preview.src = e.target.value;
        }
      });
    }

    const setForm = document.getElementById("adminSettingsForm");
    if (setForm) {
      setForm.addEventListener("submit", (e) => this.saveSettings(e));
    }

    // Section Visibility Live Checkbox Listeners
    const visCheckboxes = [
      { id: "secVisAnnouncement", key: "announcement", label: "Announcement Bar" },
      { id: "secVisHero", key: "hero", label: "Hero Banner" },
      { id: "secVisCategories", key: "categories", label: "Category Strip" },
      { id: "secVisCollection", key: "collection", label: "Collection Lineup" },
      { id: "secVisReviews", key: "reviews", label: "Customer Reviews" },
      { id: "secVisOffer", key: "offer", label: "Special Offer Banner" },
      { id: "secVisEditorial", key: "editorial", label: "Editorial Section" },
      { id: "secVisClosing", key: "closing", label: "Closing Banner" },
      { id: "secVisBrands", key: "brands", label: "Brands Grid" },
      { id: "secVisLocation", key: "location", label: "Shop Location Section" }
    ];

    visCheckboxes.forEach(({ id, key, label }) => {
      const chk = document.getElementById(id);
      if (chk) {
        chk.addEventListener("change", () => {
          const s = Storage.getSettings();
          if (!s.sectionVisibility) s.sectionVisibility = {};
          s.sectionVisibility[key] = chk.checked;
          Storage.saveSettings(s);
          if (window.AppState) AppState.settings = s;
          if (typeof applySectionVisibility === "function") applySectionVisibility();
          showToast(`${label} ${chk.checked ? "shown on" : "hidden from"} homepage`, "info");
        });
      }
    });
  }
};

// Initialize Admin Controller
document.addEventListener("DOMContentLoaded", () => {
  AdminController.init();
});
