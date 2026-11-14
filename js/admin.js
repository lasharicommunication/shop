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
  collectionVisibleCount: 12,
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
    this.updateTrashBadge();
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

    if (tabName === "overview") {
      this.renderOverview();
      if (typeof Storage.loadOrders === "function") {
        Storage.loadOrders().then(() => this.renderOverview()).catch(() => {});
      }
    }
    if (tabName === "orders") {
      this.renderOrdersTable();
      if (typeof Storage.loadOrders === "function") {
        Storage.loadOrders().then(() => this.renderOrdersTable()).catch(() => {});
      }
    }
    if (tabName === "products") {
      this.renderProductsTable();
      this.updateTrashBadge();
    }
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
  async saveQuickContact() {
    const saveBtn = document.querySelector(".admin-quick-save-btn");
    if (saveBtn) {
      if (saveBtn.disabled) return;
      saveBtn.disabled = true;
      saveBtn.innerText = "Saving...";
    }

    const address = document.getElementById("quickShopAddress")?.value.trim() || "";
    const email = document.getElementById("quickShopEmail")?.value.trim() || "";
    const phone = document.getElementById("quickShopPhone")?.value.trim() || "";
    const whatsapp = document.getElementById("quickShopWhatsapp")?.value.trim() || "";
    let mapUrl = document.getElementById("quickGoogleMapsUrl")?.value.trim() || "";

    if (!address) {
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.innerText = "Save Quick Info ↗";
      }
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

    if (window.AppState) AppState.settings = updated;
    if (typeof renderStoreInfo === "function") renderStoreInfo();
    if (typeof renderStoreSettings === "function") renderStoreSettings();

    // Sync with settings tab inputs if currently loaded in DOM
    const setAddr = document.getElementById("setShopAddress");
    if (setAddr) setAddr.value = address;
    const setMap = document.getElementById("setGoogleMapsUrl");
    if (setMap) setMap.value = updated.googleMapsUrl;

    try {
      const ok = await Storage.saveSettings(updated);
      if (ok) {
        showToast("Shop Address, Google Maps link & Contact details saved successfully!", "success");
      } else {
        showToast("Settings saved locally! (Syncing globally in background)", "info");
      }
    } catch (e) {
      showToast("Settings saved locally!", "info");
    } finally {
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.innerText = "Save Quick Info ↗";
      }
    }
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
          ${(order.items || []).map(i => `
            <span style="color:#fff; font-weight:600;">${i.qty}x</span> ${i.title}
            ${i.size ? `<span style="background:#1e291e; color:var(--lime); padding:1px 5px; border-radius:4px; font-size:10px; font-weight:700; margin-left:3px;">Size: ${i.size}</span>` : ''}
            ${i.color ? `<span style="background:#1e291e; color:#7dd3fc; padding:1px 5px; border-radius:4px; font-size:10px; font-weight:700; margin-left:3px;">Color: ${i.color}</span>` : ''}
          `).join("<br>")}
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

  async updateOrderStatus(orderId, newStatus) {
    const orders = Storage.getOrders();
    const order = orders.find(o => o.id === orderId);
    if (order) {
      order.status = newStatus;
      await Storage.saveOrders(orders);
      showToast(`Order #${orderId} marked as ${newStatus}`, "success");
      this.renderOverview();
      this.renderOrdersTable();
    }
  },

  async deleteOrder(orderId) {
    if (!confirm(`Are you sure you want to delete Order #${orderId}?`)) return;
    let orders = Storage.getOrders();
    orders = orders.filter(o => o.id !== orderId);
    await Storage.saveOrders(orders);
    showToast(`Order #${orderId} deleted successfully`, "info");
    this.renderOrdersTable();
    this.renderOverview();
  },

  async refreshOrders(btn) {
    const originalHtml = btn ? btn.innerHTML : "";
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Syncing...';
    }
    try {
      const orders = await Storage.loadOrders();
      this.renderOrdersTable();
      this.renderOverview();
      showToast(`Synced ${orders.length} orders from server`, "success");
    } catch (e) {
      showToast("Orders sync error: " + e.message, "error");
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = originalHtml;
      }
    }
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
    if (window.AppState) window.AppState.products = products;
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
              ${(prod.sizes && prod.sizes.length) || (prod.colors && prod.colors.length) ? `
                <br><small style="color:var(--lime); font-size:10px; font-weight:700;">
                  ${prod.sizes?.length ? `Sizes: ${prod.sizes.map(s => typeof s === 'object' ? `${s.name} (Rs. ${Number(s.price || prod.price).toLocaleString()})` : s).join(", ")}` : ''}
                  ${prod.sizes?.length && prod.colors?.length ? ' · ' : ''}
                  ${prod.colors?.length ? `${prod.colors.length} color(s)` : ''}
                </small>` : ''}
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

  handleCategoryChange(value) {
    const customBox = document.getElementById("customCategoryBox");
    const customInput = document.getElementById("prodFormCustomCategory");
    if (!customBox) return;
    if (value === "__custom__") {
      customBox.style.display = "block";
      if (customInput) customInput.focus();
    } else {
      customBox.style.display = "none";
      if (customInput) customInput.value = "";
    }
    this.updateSizePresetsForCategory(value === "__custom__" ? (customInput?.value || "") : value);
  },

  updateSizePresetsForCategory(category = "") {
    const cat = String(category || "").toLowerCase();
    const usbRow = document.getElementById("adminPresetRowUsb");
    const pbRow = document.getElementById("adminPresetRowPowerBank");
    const otherRow = document.getElementById("adminPresetRowOther");
    const customInput = document.getElementById("customSizeInput");

    const isPowerBank = cat.includes("power bank") || cat.includes("powerbank") || cat.includes("battery");
    const isUsb = cat.includes("usb") || cat.includes("flash") || cat.includes("drive") || cat.includes("pendrive");
    const isCable = cat.includes("cable") || cat.includes("charger") || cat.includes("wire");

    if (usbRow) usbRow.style.display = (isUsb || (!isPowerBank && !isCable)) ? "flex" : "none";
    if (pbRow) pbRow.style.display = (isPowerBank || (!isUsb && !isCable)) ? "flex" : "none";
    if (otherRow) otherRow.style.display = (!isPowerBank && !isUsb) ? "flex" : "none";

    if (customInput) {
      if (isPowerBank) {
        customInput.placeholder = "e.g. 5000 mAh, 10000 mAh, 20000 mAh";
      } else if (isUsb) {
        customInput.placeholder = "e.g. 32 GB, 64 GB, 128 GB, 256 GB";
      } else if (isCable) {
        customInput.placeholder = "e.g. 1 Meter, 2 Meter, 3 Meter";
      } else {
        customInput.placeholder = "e.g. 64 GB, 20000 mAh, 1 Meter";
      }
    }
  },

  renderAdminVarieties(selectedSizes = [], selectedColors = [], basePrice = 0) {
    const sizesContainer = document.getElementById("adminSizesContainer");
    const colorsContainer = document.getElementById("adminColorsContainer");
    const currentBasePrice = basePrice || parseInt(document.getElementById("prodFormPrice")?.value, 10) || 0;

    // Render sizes with custom prices
    if (sizesContainer) {
      sizesContainer.innerHTML = "";
      if (!Array.isArray(selectedSizes) || selectedSizes.length === 0) {
        sizesContainer.innerHTML = `
          <div class="empty-sizes-hint" style="color:#6f806d; font-size:11px; padding:6px 0; text-align:center; font-style:italic;">
            Koi size add nahi hai. Product upar wali single price par bikega. Upar presets par click karke ya size aur price likh kar add karein.
          </div>
        `;
      } else {
        selectedSizes.forEach(s => {
          const sName = typeof s === 'object' ? s.name : String(s);
          let sPrice = '';
          let sSpecialPrice = '';
          if (typeof s === 'object') {
            if (s.specialPrice != null && Number(s.specialPrice) > 0) {
              sSpecialPrice = Number(s.specialPrice);
              sPrice = s.regularPrice || s.oldPrice || s.price || '';
            } else if (s.oldPrice != null && Number(s.oldPrice) > Number(s.price)) {
              sPrice = Number(s.oldPrice);
              sSpecialPrice = Number(s.price);
            } else {
              sPrice = s.price != null ? Number(s.price) : currentBasePrice;
            }
          } else {
            sPrice = currentBasePrice;
          }
          this.appendSizeRow(sName, sPrice, sSpecialPrice);
        });
      }
    }

    // Combine default colors with any saved colors
    const defaultColors = [
      { name: "Black", hex: "#111111" },
      { name: "White", hex: "#ffffff" },
      { name: "Silver / Grey", hex: "#9ca3af" },
      { name: "Gold / Champagne", hex: "#d4af37" },
      { name: "Rose Gold", hex: "#b76e79" },
      { name: "Navy Blue", hex: "#1e3a8a" },
      { name: "Deep Purple", hex: "#581c87" },
      { name: "Alpine Green", hex: "#15803d" },
      { name: "Titanium Grey", hex: "#64748b" },
      { name: "Red", hex: "#dc2626" },
      { name: "Orange", hex: "#ea580c" }
    ];

    const activeColorNames = new Set();
    const savedColorMap = {};
    (selectedColors || []).forEach(c => {
      if (typeof c === "string") {
        activeColorNames.add(c.trim());
        savedColorMap[c.trim()] = "#3b82f6";
      } else if (c && c.name) {
        activeColorNames.add(c.name.trim());
        savedColorMap[c.name.trim()] = c.hex || "#3b82f6";
      }
    });

    const allColors = [...defaultColors];
    activeColorNames.forEach(name => {
      if (!allColors.some(c => c.name.toLowerCase() === name.toLowerCase())) {
        allColors.push({ name: name, hex: savedColorMap[name] || "#3b82f6" });
      }
    });

    if (colorsContainer) {
      colorsContainer.innerHTML = allColors.map(col => {
        const isChecked = activeColorNames.has(col.name);
        return `
          <label class="variety-check-chip ${isChecked ? 'is-checked' : ''}">
            <input type="checkbox" class="admin-color-checkbox" value="${col.name.replace(/"/g, '&quot;')}" data-hex="${col.hex}" ${isChecked ? 'checked' : ''} onchange="this.parentElement.classList.toggle('is-checked', this.checked)">
            <span class="variety-color-dot" style="background:${col.hex};"></span>
            <span>${col.name}</span>
          </label>
        `;
      }).join("");
    }
  },

  appendSizeRow(sizeName, sizePrice, sizeSpecialPrice = null) {
    const container = document.getElementById("adminSizesContainer");
    if (!container) return;

    const emptyHint = container.querySelector(".empty-sizes-hint");
    if (emptyHint) emptyHint.remove();

    const name = String(sizeName || "").trim();
    if (!name) return;
    const basePrice = parseInt(document.getElementById("prodFormPrice")?.value, 10) || 0;

    let price = (sizePrice != null && sizePrice !== '' && !isNaN(Number(sizePrice)) && Number(sizePrice) > 0) ? Number(sizePrice) : (basePrice > 0 ? basePrice : '');
    let specialPrice = (sizeSpecialPrice != null && sizeSpecialPrice !== '' && !isNaN(Number(sizeSpecialPrice)) && Number(sizeSpecialPrice) > 0) ? Number(sizeSpecialPrice) : '';

    // Check if already exists in container
    const existing = Array.from(container.querySelectorAll(".admin-size-row-item")).find(r => (r.dataset.sizeName || "").toLowerCase() === name.toLowerCase());
    if (existing) {
      const priceInput = existing.querySelector(".admin-size-price-input");
      const specialInput = existing.querySelector(".admin-size-special-price-input");
      if (priceInput && price !== '') priceInput.value = price;
      if (specialInput && specialPrice !== '') specialInput.value = specialPrice;
      showToast(`Size "${name}" already added. Price updated!`, "info");
      return;
    }

    const row = document.createElement("div");
    row.className = "admin-size-row-item";
    row.dataset.sizeName = name;
    row.innerHTML = `
      <div style="display:flex; align-items:center; gap:8px;">
        <span style="font-size:12px; color:var(--lime, #d8ff55);"><i class="fa-solid fa-circle-check"></i></span>
        <strong style="font-size:13px; color:#fff;">${name}</strong>
      </div>
      <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
        <div style="display:flex; align-items:center; gap:5px;">
          <span style="font-size:11px; color:#879b8a; font-weight:700;">Price: Rs.</span>
          <input type="number" class="admin-size-price-input" value="${price !== '' ? price : ''}" placeholder="Selling Price" min="0" step="1" style="width:105px; background:#0d110e; border:1px solid #3c5440; color:#fff; font-weight:700; font-size:12px; padding:6px 8px; border-radius:6px; box-sizing:border-box;">
        </div>
        <div style="display:flex; align-items:center; gap:5px;">
          <span style="font-size:11px; color:#d8ff55; font-weight:700;">Special Price: Rs.</span>
          <input type="number" class="admin-size-special-price-input" value="${specialPrice !== '' ? specialPrice : ''}" placeholder="Offer Price (Opt)" min="0" step="1" style="width:115px; background:#0d110e; border:1px solid #3c5440; color:#d8ff55; font-weight:800; font-size:12px; padding:6px 8px; border-radius:6px; box-sizing:border-box;">
        </div>
        <button type="button" onclick="AdminController.removeSizeRow(this)" style="background:#2b151a; border:1px solid #5c202a; color:#ff6b8b; width:26px; height:26px; border-radius:6px; cursor:pointer; display:grid; place-items:center; font-size:11px; line-height:1;" title="Remove size">✕</button>
      </div>
    `;
    container.appendChild(row);
  },

  addSizePreset(name) {
    const formCat = document.getElementById("prodFormCategory");
    let cat = (formCat ? formCat.value : "").toLowerCase();
    if (cat === "__custom__") {
      cat = (document.getElementById("prodFormCustomCategory")?.value || "").toLowerCase();
    }
    const nameLower = String(name || "").toLowerCase();

    if ((cat.includes("power bank") || cat.includes("battery")) && (nameLower.includes("gb") || nameLower.includes("tb"))) {
      showToast("Power Bank mein mAh hota hai, GB nahi! Please select mAh preset.", "error");
      return;
    }
    if ((cat.includes("usb") || cat.includes("flash") || cat.includes("pendrive")) && nameLower.includes("mah")) {
      showToast("USB Flash Drive mein GB hota hai, mAh nahi! Please select GB preset.", "error");
      return;
    }

    this.appendSizeRow(name, '', '');
    showToast(`Added "${name}". Ab Price aur Special Price enter karein!`, "success");
    const container = document.getElementById("adminSizesContainer");
    const row = Array.from(container?.querySelectorAll(".admin-size-row-item") || []).find(r => (r.dataset.sizeName || "").toLowerCase() === name.toLowerCase());
    const input = row?.querySelector(".admin-size-price-input");
    if (input) {
      input.focus();
      input.select();
    }
  },

  addCustomSizeWithPrice() {
    const nameInp = document.getElementById("customSizeInput");
    const priceInp = document.getElementById("customSizePrice");
    const specialPriceInp = document.getElementById("customSizeSpecialPrice");
    if (!nameInp) return;
    const name = nameInp.value.trim();
    if (!name) {
      showToast("Please enter size name (e.g. 64 GB or 20000 mAh)!", "error");
      nameInp.focus();
      return;
    }

    const formCat = document.getElementById("prodFormCategory");
    let cat = (formCat ? formCat.value : "").toLowerCase();
    if (cat === "__custom__") {
      cat = (document.getElementById("prodFormCustomCategory")?.value || "").toLowerCase();
    }
    const nameLower = name.toLowerCase();

    if ((cat.includes("power bank") || cat.includes("battery")) && (nameLower.includes("gb") || nameLower.includes("tb"))) {
      showToast("Power Bank mein mAh hota hai, GB nahi! e.g. 10000 mAh ya 20000 mAh likhein.", "error");
      nameInp.focus();
      return;
    }
    if ((cat.includes("usb") || cat.includes("flash") || cat.includes("pendrive")) && nameLower.includes("mah")) {
      showToast("USB Flash Drive mein GB hota hai, mAh nahi! e.g. 64 GB ya 128 GB likhein.", "error");
      nameInp.focus();
      return;
    }

    const basePrice = parseInt(document.getElementById("prodFormPrice")?.value, 10) || 0;
    const price = (priceInp && priceInp.value && !isNaN(parseInt(priceInp.value, 10))) ? parseInt(priceInp.value, 10) : basePrice;
    const specialPrice = (specialPriceInp && specialPriceInp.value && !isNaN(parseInt(specialPriceInp.value, 10))) ? parseInt(specialPriceInp.value, 10) : null;

    this.appendSizeRow(name, price, specialPrice);
    nameInp.value = "";
    if (priceInp) priceInp.value = "";
    if (specialPriceInp) specialPriceInp.value = "";
    showToast(`Added size "${name}"`, "success");
  },

  removeSizeRow(btn) {
    const row = btn.closest(".admin-size-row-item");
    if (!row) return;
    const name = row.dataset.sizeName;
    row.remove();
    showToast(`Removed size "${name}"`, "info");

    const container = document.getElementById("adminSizesContainer");
    if (container && container.querySelectorAll(".admin-size-row-item").length === 0) {
      container.innerHTML = `
        <div class="empty-sizes-hint" style="color:#6f806d; font-size:11px; padding:6px 0; text-align:center; font-style:italic;">
          Koi size add nahi hai. Product upar wali single price par bikega. Upar presets par click karke ya size aur price likh kar add karein.
        </div>
      `;
    }
  },

  getSelectedSizesFromForm() {
    const container = document.getElementById("adminSizesContainer");
    if (!container) return [];
    const rows = container.querySelectorAll(".admin-size-row-item");
    const basePrice = parseInt(document.getElementById("prodFormPrice")?.value, 10) || 0;
    const sizes = [];
    rows.forEach(r => {
      const name = r.dataset.sizeName?.trim();
      const pInp = r.querySelector(".admin-size-price-input");
      const spInp = r.querySelector(".admin-size-special-price-input");

      const pVal = pInp && pInp.value !== "" ? parseInt(pInp.value, 10) : null;
      const spVal = spInp && spInp.value !== "" ? parseInt(spInp.value, 10) : null;

      if (name) {
        let finalPrice = basePrice;
        let finalOldPrice = null;
        let regularPrice = pVal;
        let specialPrice = spVal;

        if (pVal != null && spVal != null && pVal > 0 && spVal > 0) {
          finalPrice = Math.min(pVal, spVal);
          finalOldPrice = Math.max(pVal, spVal);
        } else if (spVal != null && spVal > 0) {
          finalPrice = spVal;
        } else if (pVal != null && pVal > 0) {
          finalPrice = pVal;
        }

        sizes.push({
          name: name,
          price: finalPrice,
          regularPrice: regularPrice,
          specialPrice: specialPrice,
          oldPrice: finalOldPrice
        });
      }
    });
    return sizes;
  },

  addCustomSize() {
    this.addCustomSizeWithPrice();
  },

  addCustomColor() {
    const nameInput = document.getElementById("customColorInput");
    const picker = document.getElementById("customColorPicker");
    const container = document.getElementById("adminColorsContainer");
    if (!nameInput || !container) return;
    const name = nameInput.value.trim();
    const hex = picker?.value || "#3b82f6";
    if (!name) {
      showToast("Please type a color name first!", "error");
      return;
    }

    const existing = Array.from(container.querySelectorAll(".admin-color-checkbox")).find(inp => inp.value.toLowerCase() === name.toLowerCase());
    if (existing) {
      existing.checked = true;
      existing.dataset.hex = hex;
      existing.parentElement.classList.add("is-checked");
      const dot = existing.parentElement.querySelector(".variety-color-dot");
      if (dot) dot.style.background = hex;
      showToast(`Color "${name}" is now selected!`, "info");
      nameInput.value = "";
      return;
    }

    const label = document.createElement("label");
    label.className = "variety-check-chip is-checked";
    label.innerHTML = `
      <input type="checkbox" class="admin-color-checkbox" value="${name.replace(/"/g, '&quot;')}" data-hex="${hex}" checked onchange="this.parentElement.classList.toggle('is-checked', this.checked)">
      <span class="variety-color-dot" style="background:${hex};"></span>
      <span>${name}</span>
    `;
    container.appendChild(label);
    nameInput.value = "";
    showToast(`Added color "${name}"`, "success");
  },

  getSelectedColorsFromForm() {
    const checked = document.querySelectorAll("#adminColorsContainer .admin-color-checkbox:checked");
    return Array.from(checked).map(inp => ({
      name: inp.value.trim(),
      hex: inp.dataset.hex || "#111111"
    })).filter(c => c.name);
  },

  openProductForm(productId = null) {
    const box = document.getElementById("adminProductFormBox");
    const titleEl = document.getElementById("adminProductFormTitle");
    const editIdInput = document.getElementById("editProductId");
    const formTitle = document.getElementById("prodFormTitle");
    const formCat = document.getElementById("prodFormCategory");
    const customBox = document.getElementById("customCategoryBox");
    const customInput = document.getElementById("prodFormCustomCategory");
    const formBrand = document.getElementById("prodFormBrand");
    const formPrice = document.getElementById("prodFormPrice");
    const formOldPrice = document.getElementById("prodFormOldPrice");
    const formIsOnSale = document.getElementById("prodFormIsOnSale");
    const formStock = document.getElementById("prodFormStock");
    const formDesc = document.getElementById("prodFormDescription");
    const imgList = document.getElementById("productImagesList");
    const draftNotice = document.getElementById("adminProductDraftNotice");
    const draftStatus = document.getElementById("adminDraftAutoSaveStatus");

    if (!box) return;
    sessionStorage.setItem("lashari_admin_product_form_open", "true");

    if (imgList) imgList.innerHTML = "";
    if (draftStatus) draftStatus.innerHTML = "";
    if (draftNotice) draftNotice.style.display = "none";

    // Sync categories into dropdown including any existing custom categories
    const products = Storage.getProducts();
    const standardCategories = [
      "Smartwatch",
      "Earbuds",
      "Handsfree",
      "Power Bank",
      "USB Drive",
      "Memory Card",
      "Charger",
      "Wireless Charger",
      "Cables",
      "Adapters & OTG",
      "Speaker",
      "Mobile Cover",
      "Screen Protector",
      "Holders",
      "Ring Light & Tripod",
      "Gaming Accessories",
      "Smart Gadgets"
    ];
    const categoryLabels = {
      "Smartwatch": "Smartwatches",
      "Earbuds": "Earbuds & Audio",
      "Handsfree": "Handsfree & Earphones",
      "Power Bank": "Power Banks",
      "USB Drive": "USB Flash Drives",
      "Memory Card": "Memory Cards & Storage",
      "Charger": "Fast Chargers",
      "Wireless Charger": "Wireless Chargers",
      "Cables": "Cables & Adapters",
      "Adapters & OTG": "OTG & Audio Adapters",
      "Speaker": "Bluetooth Speakers",
      "Mobile Cover": "Mobile Covers & Cases",
      "Screen Protector": "Screen Protectors & Glass",
      "Holders": "Mounts & Mobile Holders",
      "Ring Light & Tripod": "Tripods & Ring Lights",
      "Gaming Accessories": "Mobile Gaming & Triggers",
      "Smart Gadgets": "Smart Tech & Gadgets"
    };
    const allCategories = new Set(standardCategories);
    products.forEach(p => {
      if (p.category && typeof p.category === "string" && p.category.trim()) {
        allCategories.add(p.category.trim());
      }
    });

    if (formCat) {
      const currentSelected = formCat.value;
      formCat.innerHTML = Array.from(allCategories).map(cat => {
        const label = categoryLabels[cat] || cat;
        return `<option value="${cat.replace(/"/g, '&quot;')}">${label}</option>`;
      }).join("") + `<option value="__custom__">➕ + Custom Category / Add New...</option>`;
    }

    const draft = this.getProductDraft();
    let isDraftRestored = false;

    if (productId) {
      const prod = products.find(p => p.id === productId);
      if (prod) {
        if (titleEl) titleEl.textContent = `Edit Product: ${prod.title}`;
        if (editIdInput) editIdInput.value = prod.id;

        // Check if there is an unsaved draft specifically for this product
        if (draft && draft.editProductId === productId && this.hasMeaningfulDraftContent(draft)) {
          isDraftRestored = true;
          if (formTitle) formTitle.value = draft.title ?? prod.title ?? "";
          if (formCat) {
            if (draft.category === "__custom__") {
              formCat.value = "__custom__";
              if (customBox) customBox.style.display = "block";
              if (customInput) customInput.value = draft.customCategory || "";
            } else {
              formCat.value = draft.category || prod.category || "Smartwatch";
              if (customBox) customBox.style.display = "none";
            }
          }
          if (formBrand) formBrand.value = draft.brand || prod.brand || "infinix";
          if (formPrice) formPrice.value = draft.price || prod.price || "";
          if (formOldPrice) formOldPrice.value = draft.oldPrice || prod.oldPrice || "";
          if (formIsOnSale) formIsOnSale.checked = draft.isOnSale !== false;
          if (formStock) formStock.value = draft.stock ?? prod.stock ?? 25;
          if (formDesc) formDesc.value = draft.description || prod.description || "";

          this.renderAdminVarieties(draft.sizes || prod.sizes || [], draft.colors || prod.colors || [], draft.price || prod.price);
          const images = (draft.images && draft.images.length > 0) ? draft.images : (prod.images || (prod.image ? [prod.image] : []));
          if (images.length > 0) {
            images.forEach(u => this.addImageUrlField(u));
          } else {
            this.addImageUrlField("");
          }
        } else {
          if (formTitle) formTitle.value = prod.title || "";
          // Handle category selection
          if (formCat) {
            const hasOption = Array.from(formCat.options).some(o => o.value.toLowerCase() === (prod.category || "").toLowerCase());
            if (hasOption) {
              formCat.value = prod.category;
              if (customBox) customBox.style.display = "none";
              if (customInput) customInput.value = "";
            } else {
              formCat.value = "__custom__";
              if (customBox) customBox.style.display = "block";
              if (customInput) customInput.value = prod.category || "";
            }
          }

          if (formBrand) formBrand.value = prod.brand || "infinix";
          if (formPrice) formPrice.value = prod.price || "";
          if (formOldPrice) formOldPrice.value = prod.oldPrice || "";
          if (formIsOnSale) formIsOnSale.checked = prod.isOnSale !== false;
          if (formStock) formStock.value = prod.stock ?? 25;
          if (formDesc) formDesc.value = prod.description || "";

          // Render saved varieties (sizes & colors)
          this.renderAdminVarieties(prod.sizes || [], prod.colors || [], prod.price);

          const existingImages = Array.isArray(prod.images) && prod.images.length > 0 
            ? prod.images 
            : (prod.image ? [prod.image] : []);

          if (existingImages.length > 0) {
            existingImages.forEach(u => this.addImageUrlField(u));
          } else {
            this.addImageUrlField("");
          }
        }
      }
    } else {
      if (titleEl) titleEl.textContent = "Add New Product";
      if (editIdInput) editIdInput.value = "";

      // Check if there is an unsaved draft for a new product
      if (draft && !draft.editProductId && this.hasMeaningfulDraftContent(draft)) {
        isDraftRestored = true;
        if (formTitle) formTitle.value = draft.title || "";
        if (formCat) {
          if (draft.category === "__custom__") {
            formCat.value = "__custom__";
            if (customBox) customBox.style.display = "block";
            if (customInput) customInput.value = draft.customCategory || "";
          } else {
            formCat.value = draft.category || "Smartwatch";
            if (customBox) customBox.style.display = "none";
          }
        }
        if (formBrand) formBrand.value = draft.brand || "infinix";
        if (formPrice) formPrice.value = draft.price || "";
        if (formOldPrice) formOldPrice.value = draft.oldPrice || "";
        if (formIsOnSale) formIsOnSale.checked = draft.isOnSale !== false;
        if (formStock) formStock.value = draft.stock ?? 25;
        if (formDesc) formDesc.value = draft.description || "";

        this.renderAdminVarieties(draft.sizes || [], draft.colors || [], draft.price);
        if (draft.images && draft.images.length > 0) {
          draft.images.forEach(u => this.addImageUrlField(u));
        } else {
          this.addImageUrlField("");
        }
      } else {
        const form = document.getElementById("adminProductForm");
        if (form) form.reset();
        if (formCat) formCat.value = "Smartwatch";
        if (customBox) customBox.style.display = "none";
        if (customInput) customInput.value = "";
        if (formIsOnSale) formIsOnSale.checked = true;
        if (formStock) formStock.value = 25;
        this.addImageUrlField("");
        this.renderAdminVarieties([], []);
      }
    }

    if (isDraftRestored && draftNotice) {
      draftNotice.style.display = "flex";
    }

    this.updateSizePresetsForCategory(formCat?.value || "");

    box.style.display = "block";
    box.scrollIntoView({ behavior: "smooth", block: "nearest" });
  },

  closeProductForm() {
    sessionStorage.removeItem("lashari_admin_product_form_open");
    const box = document.getElementById("adminProductFormBox");
    if (box) box.style.display = "none";
    const form = document.getElementById("adminProductForm");
    if (form) form.reset();
    const imgList = document.getElementById("productImagesList");
    if (imgList) imgList.innerHTML = "";
    const customBox = document.getElementById("customCategoryBox");
    if (customBox) customBox.style.display = "none";
    const draftNotice = document.getElementById("adminProductDraftNotice");
    if (draftNotice) draftNotice.style.display = "none";
  },

  async saveProduct(e) {
    if (e && e.preventDefault) e.preventDefault();

    const editId = document.getElementById("editProductId")?.value.trim();
    const title = document.getElementById("prodFormTitle")?.value.trim();
    const formCat = document.getElementById("prodFormCategory");
    let category = formCat ? formCat.value.trim() : "Mobile Cover";

    // Custom category check
    if (category === "__custom__") {
      const customCategoryVal = document.getElementById("prodFormCustomCategory")?.value.trim();
      if (!customCategoryVal) {
        showToast("Please enter a custom category name!", "error");
        document.getElementById("prodFormCustomCategory")?.focus();
        return;
      }
      category = customCategoryVal;
    }

    const brand = document.getElementById("prodFormBrand")?.value.trim() || "infinix";
    const priceInputVal = parseInt(document.getElementById("prodFormPrice")?.value, 10);
    const oldPriceStr = document.getElementById("prodFormOldPrice")?.value?.trim();
    const isOnSale = document.getElementById("prodFormIsOnSale")?.checked ?? true;
    const stock = parseInt(document.getElementById("prodFormStock")?.value, 10) || 25;
    const images = this.getProductImagesFromForm();
    const image = images[0] || "";
    const description = document.getElementById("prodFormDescription")?.value.trim() || "";

    // Variety selections (Sizes & Colors)
    const sizes = this.getSelectedSizesFromForm();
    const colors = this.getSelectedColorsFromForm();

    // Determine base price: from input, from sizes, or from existing product
    let price = (!isNaN(priceInputVal) && priceInputVal > 0) ? priceInputVal : 0;
    if (!price && sizes.length > 0) {
      price = sizes[0].price || sizes[0].specialPrice || sizes[0].regularPrice || 0;
    }
    if (!price && editId) {
      const existingProd = Storage.getProducts().find(p => p.id === editId);
      if (existingProd) price = existingProd.price || 0;
    }

    let oldPrice = (oldPriceStr && parseInt(oldPriceStr, 10) > 0) ? parseInt(oldPriceStr, 10) : null;
    if (!oldPrice && sizes.length > 0 && sizes[0].oldPrice) {
      oldPrice = sizes[0].oldPrice;
    }

    if (!title) {
      showToast("Please provide product title!", "error");
      return;
    }

    if (!price || isNaN(price) || price <= 0) {
      if (sizes.length === 0) {
        showToast("Please add at least one size with a price!", "error");
        return;
      }
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
            sizes,
            colors,
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
          rating: parseFloat((4.6 + Math.random() * 0.4).toFixed(1)),
          reviewsCount: Math.floor(15 + Math.random() * 95),
          stock,
          sizes,
          colors,
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
      if (window.AppState) window.AppState.products = products;

      this.clearProductDraft();
      this.renderProductsTable();
      this.closeProductForm();
      if (typeof renderProducts === "function") renderProducts();
    } catch (err) {
      console.error("Error saving product:", err);
      showToast("Could not save product: " + err.message, "error");
    }
  },

  // 7-Day Product Recycle Bin / Trash
  async deleteProduct(productId) {
    let products = Storage.getProducts();
    const prod = products.find(p => p.id === productId);
    const title = prod ? prod.title : "this product";

    if (!confirm(`Are you sure you want to move "${title}" to the Recycle Bin?\n\nIt will be safely retained in the Trash for 7 days where you can restore it anytime.`)) {
      return;
    }

    const trashedItem = await Storage.moveToTrash(productId);
    if (trashedItem) {
      showToast(`Product moved to Recycle Bin (recoverable for 7 days)`, "info");
    }

    this.renderProductsTable();
    this.updateTrashBadge();
    this.renderOverview();
    if (typeof renderProducts === "function") renderProducts();
  },

  openTrashModal() {
    const modal = document.getElementById("adminTrashModal");
    if (modal) {
      modal.style.display = "grid";
      document.body.style.overflow = "hidden";
      this.renderTrashTable();
    }
  },

  closeTrashModal() {
    const modal = document.getElementById("adminTrashModal");
    if (modal) {
      modal.style.display = "none";
      document.body.style.overflow = "";
    }
  },

  updateTrashBadge() {
    const badge = document.getElementById("adminTrashCountBadge");
    if (!badge) return;
    const trash = (typeof Storage !== "undefined" && Storage.getTrash) ? Storage.getTrash() : [];
    if (trash.length > 0) {
      badge.textContent = trash.length;
      badge.style.display = "inline-flex";
    } else {
      badge.style.display = "none";
    }
  },

  renderTrashTable() {
    const container = document.getElementById("adminTrashTableContainer");
    const countBadge = document.getElementById("adminTrashModalCount");
    if (!container) return;

    const trash = Storage.getTrash();
    if (countBadge) countBadge.textContent = `${trash.length} ${trash.length === 1 ? 'item' : 'items'}`;
    this.updateTrashBadge();

    if (trash.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding:48px 20px; color:#7d8f80;">
          <div style="font-size:36px; margin-bottom:12px; color:#49574b;"><i class="fa-solid fa-trash-can"></i></div>
          <h4 style="color:#f2f5eb; margin:0 0 6px; font-size:16px;">Recycle Bin is Empty</h4>
          <p style="font-size:12.5px; margin:0; max-width:380px; margin:0 auto; line-height:1.5;">
            Jab aap kisi product ko delete karenge to wo 7 din tak yahan save rahega ta ke aap galti se delete hone par foran restore kar sakein.
          </p>
        </div>
      `;
      return;
    }

    const now = Date.now();
    let rowsHtml = "";

    trash.forEach(item => {
      const deletedAtDate = item.deletedAt ? new Date(item.deletedAt) : new Date();
      const expiresAtMs = deletedAtDate.getTime() + (7 * 24 * 60 * 60 * 1000);
      const remainingMs = Math.max(0, expiresAtMs - now);
      const daysLeft = Math.ceil(remainingMs / (24 * 60 * 60 * 1000));
      const hoursLeft = Math.ceil(remainingMs / (60 * 60 * 1000));

      let countdownBadgeHtml = "";
      if (daysLeft > 1) {
        countdownBadgeHtml = `<span class="admin-badge" style="background:#262d28; color:#d8ff55; border:1px solid #3c4c3e;"><i class="fa-solid fa-clock"></i> Auto-deletes in ${daysLeft} days</span>`;
      } else if (hoursLeft > 0) {
        countdownBadgeHtml = `<span class="admin-badge" style="background:#3b1f1f; color:#f87171; border:1px solid #5a2e2e;"><i class="fa-solid fa-hourglass-end"></i> Auto-deletes in ${hoursLeft} hours</span>`;
      } else {
        countdownBadgeHtml = `<span class="admin-badge" style="background:#3b1f1f; color:#f87171; border:1px solid #5a2e2e;"><i class="fa-solid fa-triangle-exclamation"></i> Purging today</span>`;
      }

      const img = (item.images && item.images[0]) || item.image || "images/logo.png";
      const formattedDate = deletedAtDate.toLocaleDateString("en-PK", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });

      rowsHtml += `
        <tr style="border-bottom:1px solid #232d25;">
          <td style="padding:12px 10px;">
            <div style="display:flex; align-items:center; gap:12px;">
              <img src="${img}" alt="${item.title}" style="width:42px; height:42px; border-radius:8px; object-fit:cover; background:#1b231d; border:1px solid #2d3b2f;" onerror="this.src='images/logo.png'">
              <div>
                <div style="font-weight:700; color:#fff; font-size:13.5px;">${item.title}</div>
                <div style="font-size:11px; color:#879b8a;">${item.category || 'General'} · ${item.brandName || item.brand || 'Lashari'}</div>
              </div>
            </div>
          </td>
          <td style="padding:12px 10px; font-weight:700; color:var(--lime,#d8ff55); white-space:nowrap;">
            Rs. ${Number(item.price || 0).toLocaleString()}
          </td>
          <td style="padding:12px 10px; font-size:12px; color:#adb5a8; white-space:nowrap;">
            ${formattedDate}
          </td>
          <td style="padding:12px 10px; white-space:nowrap;">
            ${countdownBadgeHtml}
          </td>
          <td style="padding:12px 10px; text-align:right; white-space:nowrap;">
            <div style="display:inline-flex; gap:8px;">
              <button type="button" class="admin-btn admin-btn-lime" style="padding:6px 12px; font-size:12px;" onclick="AdminController.restoreProduct('${item.id}')" title="Restore to active store">
                <i class="fa-solid fa-rotate-left"></i> Restore
              </button>
              <button type="button" class="admin-btn admin-btn-danger" style="padding:6px 10px; font-size:12px;" onclick="AdminController.deletePermanently('${item.id}')" title="Delete forever">
                <i class="fa-solid fa-trash-can"></i> Delete Forever
              </button>
            </div>
          </td>
        </tr>
      `;
    });

    container.innerHTML = `
      <div class="admin-table-container">
        <table class="admin-table" style="min-width:680px;">
          <thead>
            <tr>
              <th>Product</th>
              <th>Price</th>
              <th>Deleted On</th>
              <th>Retention Period</th>
              <th style="text-align:right;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </div>
    `;
  },

  async restoreProduct(productId) {
    const restored = await Storage.restoreFromTrash(productId);
    if (restored) {
      showToast(`Product "${restored.title}" restored to store inventory!`, "success");
    }
    this.renderTrashTable();
    this.renderProductsTable();
    this.updateTrashBadge();
    this.renderOverview();
    if (typeof renderProducts === "function") renderProducts();
  },

  deletePermanently(productId) {
    if (!confirm("Are you sure you want to permanently delete this product? This action cannot be undone.")) return;
    Storage.deletePermanentlyFromTrash(productId);
    showToast("Product deleted permanently.", "info");
    this.renderTrashTable();
    this.updateTrashBadge();
  },

  emptyAllTrash() {
    const trash = Storage.getTrash();
    if (trash.length === 0) return;
    if (!confirm(`Are you sure you want to permanently delete all ${trash.length} items from the Recycle Bin? This cannot be undone.`)) return;
    Storage.emptyTrash();
    showToast("Recycle Bin emptied.", "info");
    this.renderTrashTable();
    this.updateTrashBadge();
  },

  // Product Draft Auto-Save & Recovery System (accidental refresh / close protection)
  DRAFT_KEY: "lashari_admin_product_draft",
  _draftSaveTimeout: null,

  initProductDraftAutoSave() {
    const form = document.getElementById("adminProductForm");
    if (!form) return;

    const onFormInput = () => {
      clearTimeout(this._draftSaveTimeout);
      this._draftSaveTimeout = setTimeout(() => {
        this.saveProductDraft();
      }, 300);
    };

    form.addEventListener("input", onFormInput);
    form.addEventListener("change", onFormInput);

    // Check if there was an active draft before reload / refresh
    this.checkDraftRecoveryOnLoad();
  },

  checkDraftRecoveryOnLoad() {
    const draft = this.getProductDraft();
    if (!draft) return;

    const wasOpen = sessionStorage.getItem("lashari_admin_product_form_open") === "true";
    if (wasOpen && this.hasMeaningfulDraftContent(draft)) {
      setTimeout(() => {
        this.openProductForm(draft.editProductId || null);
      }, 300);
    }
  },

  hasMeaningfulDraftContent(draft) {
    if (!draft) return false;
    return Boolean(
      (draft.title && draft.title.trim()) ||
      (draft.description && draft.description.trim()) ||
      (draft.price && Number(draft.price) > 0) ||
      (draft.images && draft.images.length > 0 && draft.images.some(u => u && u.trim())) ||
      (draft.sizes && draft.sizes.length > 0) ||
      (draft.colors && draft.colors.length > 0)
    );
  },

  saveProductDraft() {
    const box = document.getElementById("adminProductFormBox");
    if (!box || box.style.display === "none") return;

    const editProductId = document.getElementById("editProductId")?.value.trim() || "";
    const title = document.getElementById("prodFormTitle")?.value || "";
    const formCat = document.getElementById("prodFormCategory");
    const category = formCat ? formCat.value : "Smartwatch";
    const customCategory = document.getElementById("prodFormCustomCategory")?.value || "";
    const brand = document.getElementById("prodFormBrand")?.value || "infinix";
    const price = document.getElementById("prodFormPrice")?.value || "";
    const oldPrice = document.getElementById("prodFormOldPrice")?.value || "";
    const isOnSale = document.getElementById("prodFormIsOnSale")?.checked ?? true;
    const stock = document.getElementById("prodFormStock")?.value || 25;
    const description = document.getElementById("prodFormDescription")?.value || "";

    const images = this.getProductImagesFromForm ? this.getProductImagesFromForm() : [];
    const sizes = this.getSelectedSizesFromForm ? this.getSelectedSizesFromForm() : [];
    const colors = this.getSelectedColorsFromForm ? this.getSelectedColorsFromForm() : [];

    const draft = {
      editProductId,
      title,
      category,
      customCategory,
      brand,
      price,
      oldPrice,
      isOnSale,
      stock,
      description,
      images,
      sizes,
      colors,
      savedAt: Date.now()
    };

    if (this.hasMeaningfulDraftContent(draft)) {
      try {
        localStorage.setItem(this.DRAFT_KEY, JSON.stringify(draft));
        const statusEl = document.getElementById("adminDraftAutoSaveStatus");
        if (statusEl) {
          const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          statusEl.innerHTML = `<i class="fa-solid fa-cloud-arrow-up" style="color:#4ade80;"></i> <span style="color:#4ade80;">Auto-saved</span> <span style="color:#6c7a6e; font-size:10px;">(${time})</span>`;
        }
      } catch (_) {}
    }
  },

  getProductDraft() {
    try {
      const saved = localStorage.getItem(this.DRAFT_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (_) {
      return null;
    }
  },

  clearProductDraft() {
    try {
      localStorage.removeItem(this.DRAFT_KEY);
      sessionStorage.removeItem("lashari_admin_product_form_open");
      const notice = document.getElementById("adminProductDraftNotice");
      if (notice) notice.style.display = "none";
      const statusEl = document.getElementById("adminDraftAutoSaveStatus");
      if (statusEl) statusEl.innerHTML = "";
    } catch (_) {}
  },

  discardProductDraft() {
    if (!confirm("Are you sure you want to discard this unsaved product draft?")) return;
    this.clearProductDraft();
    const editId = document.getElementById("editProductId")?.value.trim();
    if (editId) {
      this.openProductForm(editId);
    } else {
      this.openProductForm(null);
    }
    showToast("Unsaved draft discarded.", "info");
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

    const adminEmailsInp = document.getElementById("setAdminEmails");
    if (adminEmailsInp) {
      const list = Array.isArray(s.adminEmails) ? s.adminEmails.join(", ") : (s.adminEmails || "");
      adminEmailsInp.value = list;
    }

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

    // Floating WhatsApp Button
    const waFloat = s.whatsappFloat || {
      enabled: true,
      url: "https://whatsapp.com/channel/0029Vb8kVBP2ZjCnQE2l1q1e",
      tooltip: "Follow The Lashari Communication on WhatsApp"
    };
    const waEnabled = document.getElementById("setWhatsappFloatEnabled");
    if (waEnabled) waEnabled.checked = waFloat.enabled !== false;
    setVal("setWhatsappFloatUrl", waFloat.url || "https://whatsapp.com/channel/0029Vb8kVBP2ZjCnQE2l1q1e");
    setVal("setWhatsappFloatTooltip", waFloat.tooltip || "Follow The Lashari Communication on WhatsApp");

    // Telegram Notifications
    const tg = s.telegramNotification || {
      enabled: true,
      botToken: "9163122969:AAFJKgDkTRIJ1lL0O8OYCK-iANnwUiUe9go",
      chatId: "8893027663"
    };
    const tgEnabled = document.getElementById("setTelegramEnabled");
    if (tgEnabled) tgEnabled.checked = tg.enabled !== false;
    setVal("setTelegramBotToken", tg.botToken || "9163122969:AAFJKgDkTRIJ1lL0O8OYCK-iANnwUiUe9go");
    setVal("setTelegramChatId", tg.chatId || "8893027663");

    // Supabase Cloud Database & Auth Settings (Always Enabled)
    const sb = s.supabase || {
      enabled: true,
      url: "https://wnsiodlajtaskdmeklyp.supabase.co",
      anonKey: "",
      ordersTable: "orders",
      profilesTable: "profiles"
    };
    setVal("setSupabaseUrl", sb.url || "https://wnsiodlajtaskdmeklyp.supabase.co");
    setVal("setSupabaseAnonKey", sb.anonKey || "");
  },

  toggleSupabaseSchemaModal() {
    const box = document.getElementById("supabaseSchemaBox");
    if (box) box.style.display = box.style.display === "none" ? "block" : "none";
  },

  async testSupabaseConnection(btn) {
    let url = document.getElementById("setSupabaseUrl")?.value.trim() || "";
    let anonKey = document.getElementById("setSupabaseAnonKey")?.value.trim() || "";
    const statusEl = document.getElementById("supabaseTestStatus");

    // Clean URL: strip quotes and trailing slashes
    url = url.replace(/^['"]|['"]$/g, "").replace(/\/+$/, "");
    if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
      const urlInput = document.getElementById("setSupabaseUrl");
      if (urlInput) urlInput.value = url;
    }

    // Clean Key: strip quotes and spaces
    anonKey = anonKey.replace(/^['"]|['"]$/g, "").replace(/\s+/g, "");

    if (!url || !anonKey) {
      showToast("Pehle Supabase Project URL aur Anon Key enter karein.", "warning");
      if (statusEl) statusEl.innerHTML = '<span style="color:#facc15;"><i class="fa-solid fa-circle-exclamation"></i> URL aur Key required hain</span>';
      return;
    }

    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Testing...';
    if (statusEl) statusEl.innerText = "Checking Supabase connection...";

    try {
      // 1. Test Auth Settings with Publishable / Anon API key
      const authRes = await fetch(`${url}/auth/v1/settings`, {
        headers: {
          apikey: anonKey,
          Authorization: `Bearer ${anonKey}`
        }
      });

      if (!authRes.ok) {
        if (authRes.status === 401) {
          showToast("Supabase 401: Invalid API Key. Check your Publishable / Anon Key.", "error");
          if (statusEl) {
            statusEl.innerHTML = `<span style="color:#f87171;"><i class="fa-solid fa-triangle-exclamation"></i> <b>Error 401 (Unauthorized):</b> Key invalid hai. Supabase Dashboard > Project Settings > API se 'anon public' key copy karein.</span>`;
          }
        } else {
          showToast(`Supabase returned HTTP ${authRes.status}`, "warning");
          if (statusEl) statusEl.innerHTML = `<span style="color:#facc15;">Response: HTTP ${authRes.status}</span>`;
        }
        return;
      }

      // 2. Auth is verified (200 OK)! Now check if orders table exists
      let tableStatus = "checking";
      try {
        const tableRes = await fetch(`${url}/rest/v1/orders?select=*&limit=1`, {
          headers: {
            apikey: anonKey,
            Authorization: `Bearer ${anonKey}`
          }
        });
        if (tableRes.ok || tableRes.status === 200) {
          tableStatus = "ready";
        } else if (tableRes.status === 404) {
          tableStatus = "missing_tables";
        }
      } catch (_) {}

      showToast("Supabase Connected Successfully! 🎉", "success");

      if (tableStatus === "ready") {
        if (statusEl) {
          statusEl.innerHTML = '<span style="color:#4ade80;"><i class="fa-solid fa-circle-check"></i> <b>Connected Successfully!</b> Supabase Auth aur Tables 100% active hain.</span>';
        }
      } else {
        if (statusEl) {
          statusEl.innerHTML = '<span style="color:#4ade80;"><i class="fa-solid fa-circle-check"></i> <b>Connection Successful!</b> Auth &amp; Key bilkul sahi hain. <span style="color:#facc15;">(Tip: "View SQL Schema" par click karke SQL copy karein aur Supabase SQL Editor mein run karein taake tables create ho jayein).</span></span>';
        }
      }
    } catch (err) {
      showToast("Connection failed: " + err.message, "error");
      if (statusEl) statusEl.innerHTML = `<span style="color:#f87171;">Connection error: ${err.message}</span>`;
    } finally {
      btn.disabled = false;
      btn.innerHTML = originalText;
    }
  },

  async testTelegramAlert(btn) {
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';

    const botToken = document.getElementById("setTelegramBotToken")?.value.trim();
    const chatId = document.getElementById("setTelegramChatId")?.value.trim();

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "test_telegram",
          botToken,
          chatId
        })
      });
      const data = await res.json();
      if (data.ok) {
        showToast("Telegram test notification sent! Check your Telegram app 📲", "success");
      } else {
        showToast(data.message || "Failed to send Telegram test message", "error");
      }
    } catch (e) {
      showToast("Error testing Telegram: " + e.message, "error");
    } finally {
      btn.disabled = false;
      btn.innerHTML = originalText;
    }
  },

  saveSettings(e) {
    if (e && e.preventDefault) e.preventDefault();

    const submitBtn = document.querySelector(".admin-settings-save-btn");
    if (submitBtn) {
      if (submitBtn.disabled) return;
      submitBtn.disabled = true;
      submitBtn.innerText = "Saving Settings...";
    }

    const current = Storage.getSettings();

    const brandName = document.getElementById("setBrandName")?.value.trim() || current.brandName || "Lashari Communication";
    const brandDot = document.getElementById("setBrandDot")?.value ?? current.brandDot ?? ".";
    const shopAddress = document.getElementById("setShopAddress")?.value.trim() || current.shopAddress || "";
    const email = document.getElementById("setShopEmail")?.value.trim() || current.email || "";
    const rawPhone = document.getElementById("setShopPhone")?.value.trim() || current.phone || "+92 321 2920914";
    const deliveryFee = parseInt(document.getElementById("setDeliveryFee")?.value, 10) || current.deliveryFee || 200;
    const adminPin = document.getElementById("setAdminPin")?.value.trim() || current.adminPin || "Speed150";
    const adminEmailsRaw = document.getElementById("setAdminEmails")?.value || "";
    const adminEmails = adminEmailsRaw
      .split(",")
      .map(e => e.trim().toLowerCase())
      .filter(Boolean);
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
      adminEmails: adminEmails.length > 0 ? adminEmails : (current.adminEmails || ["thelasharicommunication@gmail.com", "abdulqabir.369@gmail.com"]),
      announcementText: announcementText,
      sectionVisibility: sectionVisibility,
      specialOffer: specialOffer,
      whatsappFloat: {
        enabled: document.getElementById("setWhatsappFloatEnabled") ? document.getElementById("setWhatsappFloatEnabled").checked : (current.whatsappFloat?.enabled ?? true),
        url: document.getElementById("setWhatsappFloatUrl")?.value.trim() || current.whatsappFloat?.url || "https://whatsapp.com/channel/0029Vb8kVBP2ZjCnQE2l1q1e",
        tooltip: document.getElementById("setWhatsappFloatTooltip")?.value.trim() || current.whatsappFloat?.tooltip || "Follow The Lashari Communication on WhatsApp"
      },
      telegramNotification: {
        enabled: document.getElementById("setTelegramEnabled") ? document.getElementById("setTelegramEnabled").checked : (current.telegramNotification?.enabled ?? true),
        botToken: document.getElementById("setTelegramBotToken")?.value.trim() || current.telegramNotification?.botToken || "9163122969:AAFJKgDkTRIJ1lL0O8OYCK-iANnwUiUe9go",
        chatId: document.getElementById("setTelegramChatId")?.value.trim() || current.telegramNotification?.chatId || "8893027663"
      },
      supabase: {
        enabled: true,
        url: document.getElementById("setSupabaseUrl")?.value.trim() || current.supabase?.url || "https://wnsiodlajtaskdmeklyp.supabase.co",
        anonKey: document.getElementById("setSupabaseAnonKey")?.value.trim() || current.supabase?.anonKey || "",
        ordersTable: current.supabase?.ordersTable || "orders",
        profilesTable: current.supabase?.profilesTable || "profiles"
      }
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
        showToast("Settings saved locally! (Syncing globally in background)", "info");
      }
    }).catch(() => {
      showToast("Store and brand settings saved locally!", "info");
    }).finally(() => {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerText = "Save Settings ↗";
      }
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

  copyAdminSqlSnippet() {
    const code = document.getElementById("adminSqlSnippetCode")?.innerText;
    if (code && navigator.clipboard) {
      navigator.clipboard.writeText(code).then(() => {
        showToast("Supabase RBAC SQL commands copied to clipboard!", "success");
      }).catch(() => {
        showToast("Select and copy code manually.", "info");
      });
    }
  },

  bindEvents() {
    this.initProductDraftAutoSave();
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
    // Form already has onsubmit="AdminController.saveSettings(event)", avoid double-submitting

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

  // Scroll to Top Button (Admin)
  const scrollBtn = document.getElementById("scrollToTopBtn");
  if (scrollBtn) {
    const checkScroll = () => {
      const pos = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
      if (pos > 280) {
        scrollBtn.classList.add("show");
      } else {
        scrollBtn.classList.remove("show");
      }
    };
    window.addEventListener("scroll", checkScroll, { passive: true });
    checkScroll();
  }
});


window.addEventListener("lashari:orders-updated", () => {
  if (window.AdminController && AdminController.isAdminLoggedIn) {
    if (AdminController.activeTab === "overview") AdminController.renderOverview();
    if (AdminController.activeTab === "orders") AdminController.renderOrdersTable();
  }
});
