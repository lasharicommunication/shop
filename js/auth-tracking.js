/**
 * Lashari Communication — Customer Auth, Order Tracking & Supabase Integration
 * Version: 1.0.0
 */

// Supabase Cloud Gateway
const LashariSupabase = {
  client: null,

  init() {
    try {
      const s = typeof Storage !== "undefined" ? Storage.getSettings() : {};
      const config = s.supabase || {};
      const url = config.url ? config.url.trim() : "";
      const anonKey = config.anonKey ? config.anonKey.trim() : "";

      if (url && anonKey && window.supabase && typeof window.supabase.createClient === "function") {
        this.client = window.supabase.createClient(url, anonKey, {
          auth: {
            persistSession: true,
            autoRefreshToken: true
          }
        });
        console.log("⚡ [Supabase] Connected to project:", url);
        return this.client;
      }
    } catch (err) {
      console.warn("⚠️ [Supabase] Initialization notice:", err.message);
    }
    this.client = null;
    return null;
  },

  getClient() {
    if (!this.client) this.init();
    return this.client;
  },

  isConfigured() {
    const s = typeof Storage !== "undefined" ? Storage.getSettings() : {};
    const config = s.supabase || {};
    return Boolean(config.url && config.anonKey);
  }
};

// Customer Account Authentication (Supabase + Local Synchronized Session)
const CustomerAuth = {
  SESSION_KEY: "lashari_customer_session",
  ACCOUNTS_KEY: "lashari_customer_accounts",

  init() {
    LashariSupabase.init();
    this.updateHeaderUI();
    this.setupListeners();
  },

  setupListeners() {
    window.addEventListener("lashari:auth-changed", () => {
      this.updateHeaderUI();
      this.renderAuthModalContent();
    });
  },

  getCurrentUser() {
    try {
      const saved = localStorage.getItem(this.SESSION_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (_) {
      return null;
    }
  },

  setSession(user) {
    try {
      if (user) {
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(this.SESSION_KEY);
      }
      window.dispatchEvent(new CustomEvent("lashari:auth-changed", { detail: user }));
    } catch (_) {}
  },

  getLocalAccounts() {
    try {
      const accs = localStorage.getItem(this.ACCOUNTS_KEY);
      return accs ? JSON.parse(accs) : [];
    } catch (_) {
      return [];
    }
  },

  saveLocalAccounts(accs) {
    try {
      localStorage.setItem(this.ACCOUNTS_KEY, JSON.stringify(accs));
    } catch (_) {}
  },

  async signUp({ name, phone, email, password }) {
    name = (name || "").trim();
    phone = (phone || "").trim();
    email = (email || "").trim().toLowerCase();
    password = password || "";

    if (!name) throw new Error("Please enter your full name.");
    if (!phone) throw new Error("Please enter your phone number.");
    if (!email) throw new Error("Please enter a valid email address.");
    if (password.length < 6) throw new Error("Password must be at least 6 characters long.");

    const client = LashariSupabase.getClient();
    let supabaseUserId = null;

    if (client) {
      try {
        const { data, error } = await client.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name, phone: phone }
          }
        });
        if (error) throw error;
        if (data && data.user) {
          supabaseUserId = data.user.id;
          // Optionally sync profile to profiles table
          try {
            await client.from("profiles").upsert({
              id: supabaseUserId,
              full_name: name,
              phone: phone,
              email: email,
              updated_at: new Date().toISOString()
            });
          } catch (_) {}
        }
      } catch (sbErr) {
        console.warn("Supabase Sign Up Notice (using local backup):", sbErr.message);
      }
    }

    // Always maintain fast local store backup
    const accounts = this.getLocalAccounts();
    const existing = accounts.find(a => a.email === email || (phone && a.phone === phone));
    if (existing && !client) {
      throw new Error("An account with this email or phone number already exists. Please Sign In.");
    }

    const newUser = {
      id: supabaseUserId || "usr_" + Math.random().toString(36).substr(2, 9),
      name,
      phone,
      email,
      password: btoa(password), // Simple obfuscation for local fallback
      createdAt: new Date().toISOString(),
      orders: []
    };

    if (!existing) {
      accounts.push(newUser);
      this.saveLocalAccounts(accounts);
    }

    const sessionUser = {
      id: newUser.id,
      name: newUser.name,
      phone: newUser.phone,
      email: newUser.email,
      createdAt: newUser.createdAt
    };

    this.setSession(sessionUser);
    return sessionUser;
  },

  async signIn({ identifier, password }) {
    identifier = (identifier || "").trim().toLowerCase();
    password = password || "";

    if (!identifier) throw new Error("Please enter your email or phone number.");
    if (!password) throw new Error("Please enter your password.");

    const client = LashariSupabase.getClient();

    if (client && identifier.includes("@")) {
      try {
        const { data, error } = await client.auth.signInWithPassword({
          email: identifier,
          password
        });
        if (!error && data && data.user) {
          const userMeta = data.user.user_metadata || {};
          const sessionUser = {
            id: data.user.id,
            name: userMeta.full_name || data.user.email.split("@")[0],
            phone: userMeta.phone || "",
            email: data.user.email,
            createdAt: data.user.created_at
          };
          this.setSession(sessionUser);
          return sessionUser;
        }
      } catch (sbErr) {
        console.warn("Supabase auth attempted, falling back to local credentials:", sbErr.message);
      }
    }

    // Fallback: Verify local account
    const accounts = this.getLocalAccounts();
    const found = accounts.find(a => (a.email.toLowerCase() === identifier || a.phone === identifier));

    if (!found) {
      throw new Error("No account found with these credentials. Please check or create an account.");
    }

    if (found.password !== btoa(password) && found.password !== password) {
      throw new Error("Incorrect password. Please try again.");
    }

    const sessionUser = {
      id: found.id,
      name: found.name,
      phone: found.phone,
      email: found.email,
      createdAt: found.createdAt
    };

    this.setSession(sessionUser);
    return sessionUser;
  },

  async signOut() {
    const client = LashariSupabase.getClient();
    if (client) {
      try {
        await client.auth.signOut();
      } catch (_) {}
    }
    this.setSession(null);
  },

  updateHeaderUI() {
    const user = this.getCurrentUser();
    const accountBtn = document.getElementById("accountToggleBtn");
    const accountDot = document.getElementById("accountLoggedInDot");
    const mobileAuthLink = document.getElementById("mobileAuthLink");

    if (accountBtn) {
      if (user) {
        accountBtn.setAttribute("title", `Signed in as ${user.name}`);
        accountBtn.classList.add("is-logged-in");
        if (accountDot) accountDot.hidden = false;
      } else {
        accountBtn.setAttribute("title", "Sign in / My Account");
        accountBtn.classList.remove("is-logged-in");
        if (accountDot) accountDot.hidden = true;
      }
    }

    if (mobileAuthLink) {
      if (user) {
        mobileAuthLink.innerHTML = `<i class="fa-solid fa-user-check" style="color:var(--lime,#d6f32f);"></i> ${user.name} (My Account)`;
      } else {
        mobileAuthLink.innerHTML = `<i class="fa-regular fa-user"></i> Sign In / Create Account`;
      }
    }
  },

  getCustomerOrders() {
    const user = this.getCurrentUser();
    if (!user) return [];
    const allOrders = typeof Storage !== "undefined" ? Storage.getOrders() : [];
    return allOrders.filter(o => {
      if (!o) return false;
      const matchEmail = user.email && o.email && o.email.toLowerCase() === user.email.toLowerCase();
      const matchPhone = user.phone && o.phone && o.phone.replace(/\D/g, "") === user.phone.replace(/\D/g, "");
      const matchName = user.name && o.customerName && o.customerName.toLowerCase() === user.name.toLowerCase();
      return matchEmail || matchPhone || matchName;
    });
  },

  renderAuthModalContent(activeTab = "signin") {
    const container = document.getElementById("authModalBody");
    if (!container) return;

    const user = this.getCurrentUser();

    // If already logged in, show Account Dashboard
    if (user) {
      const myOrders = this.getCustomerOrders();
      container.innerHTML = `
        <div class="auth-account-view">
          <div class="auth-account-header">
            <div class="auth-avatar">
              ${(user.name || "U").slice(0, 1).toUpperCase()}
            </div>
            <div class="auth-user-info">
              <h3 class="auth-user-name">${user.name}</h3>
              <p class="auth-user-email">${user.email || ""}</p>
              ${user.phone ? `<p class="auth-user-phone"><i class="fa-solid fa-phone" style="font-size:11px;"></i> ${user.phone}</p>` : ""}
            </div>
          </div>

          <div class="auth-account-stats">
            <div class="auth-stat-box">
              <span class="auth-stat-num">${myOrders.length}</span>
              <span class="auth-stat-label">Total Orders</span>
            </div>
            <div class="auth-stat-box">
              <span class="auth-stat-num">Rs. ${myOrders.reduce((sum, o) => sum + (o.total || 0), 0).toLocaleString()}</span>
              <span class="auth-stat-label">Total Spent</span>
            </div>
          </div>

          <div class="auth-orders-section">
            <h4 class="auth-orders-title">
              <i class="fa-solid fa-box-archive" style="color:var(--lime,#d6f32f);"></i> My Recent Orders
            </h4>
            ${myOrders.length === 0 ? `
              <div class="auth-no-orders">
                <p>Abhi tak koi order place nahi hua.</p>
                <button type="button" class="button button-lime button-sm" onclick="closeAuthModal(); location.hash='#collection';">Start Shopping ↗</button>
              </div>
            ` : `
              <div class="auth-orders-list">
                ${myOrders.map(o => `
                  <div class="auth-order-card">
                    <div class="auth-order-top">
                      <div>
                        <strong>#${o.id}</strong>
                        <span class="auth-order-date">${o.date || ""}</span>
                      </div>
                      <span class="auth-order-badge status-${(o.status || 'Pending').toLowerCase()}">${o.status || 'Pending'}</span>
                    </div>
                    <div class="auth-order-items">
                      ${(o.items || []).map(i => `${i.qty}x ${i.title}`).join(", ")}
                    </div>
                    <div class="auth-order-footer">
                      <span class="auth-order-total">Rs. ${(o.total || 0).toLocaleString()}</span>
                      <button type="button" class="button-track-pill" onclick="closeAuthModal(); openTrackOrderModal('${o.id}');">
                        Track Status 🚚
                      </button>
                    </div>
                  </div>
                `).join("")}
              </div>
            `}
          </div>

          <div class="auth-account-footer">
            <button type="button" class="button button-ghost button-sm" onclick="CustomerAuth.handleSignOut()">
              <i class="fa-solid fa-right-from-bracket"></i> Sign Out
            </button>
          </div>
        </div>
      `;
      return;
    }

    // Tabbed Form for Sign In / Create Account
    container.innerHTML = `
      <div class="auth-tabs-nav">
        <button type="button" class="auth-tab-btn ${activeTab === 'signin' ? 'active' : ''}" onclick="CustomerAuth.renderAuthModalContent('signin')">
          Sign In
        </button>
        <button type="button" class="auth-tab-btn ${activeTab === 'signup' ? 'active' : ''}" onclick="CustomerAuth.renderAuthModalContent('signup')">
          Create Account
        </button>
      </div>

      <div id="authNoticeBox" class="auth-notice-box" style="display:none;"></div>

      ${activeTab === 'signin' ? `
        <!-- SIGN IN FORM -->
        <form id="signInForm" onsubmit="CustomerAuth.handleSignInSubmit(event)" class="auth-form">
          <div class="auth-field">
            <label class="auth-label">Email or Phone Number</label>
            <input type="text" id="authLoginInput" placeholder="name@example.com ya 03212920914" class="auth-input" required autocomplete="username">
          </div>
          <div class="auth-field">
            <label class="auth-label">Password</label>
            <input type="password" id="authPassInput" placeholder="Enter your password" class="auth-input" required autocomplete="current-password">
          </div>
          <button type="submit" id="btnSignInSubmit" class="button button-lime auth-submit-btn">
            Sign In ↗
          </button>
          <p class="auth-switch-text">
            Naye customer hain? 
            <a href="javascript:void(0)" onclick="CustomerAuth.renderAuthModalContent('signup')" class="auth-link">Create an account here</a>
          </p>
        </form>
      ` : `
        <!-- CREATE ACCOUNT FORM -->
        <form id="signUpForm" onsubmit="CustomerAuth.handleSignUpSubmit(event)" class="auth-form">
          <div class="auth-field">
            <label class="auth-label">Full Name</label>
            <input type="text" id="authRegName" placeholder="Muhammad Ali" class="auth-input" required autocomplete="name">
          </div>
          <div class="auth-field">
            <label class="auth-label">Mobile Number</label>
            <input type="tel" id="authRegPhone" placeholder="0321-2920914" class="auth-input" required autocomplete="tel">
          </div>
          <div class="auth-field">
            <label class="auth-label">Email Address</label>
            <input type="email" id="authRegEmail" placeholder="yourname@gmail.com" class="auth-input" required autocomplete="email">
          </div>
          <div class="auth-field">
            <label class="auth-label">Password (Min 6 Characters)</label>
            <input type="password" id="authRegPass" placeholder="Create a strong password" class="auth-input" minlength="6" required autocomplete="new-password">
          </div>
          <button type="submit" id="btnSignUpSubmit" class="button button-lime auth-submit-btn">
            Create Account ↗
          </button>
          <p class="auth-switch-text">
            Pehle se account hai? 
            <a href="javascript:void(0)" onclick="CustomerAuth.renderAuthModalContent('signin')" class="auth-link">Sign In karein</a>
          </p>
        </form>
      `}
    `;
  },

  async handleSignInSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();
    const btn = document.getElementById("btnSignInSubmit");
    const notice = document.getElementById("authNoticeBox");
    const identifier = document.getElementById("authLoginInput")?.value;
    const password = document.getElementById("authPassInput")?.value;

    if (notice) notice.style.display = "none";
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Signing in...';
    }

    try {
      const user = await this.signIn({ identifier, password });
      if (typeof showToast === "function") showToast(`Welcome back, ${user.name}! 👋`, "success");
      this.renderAuthModalContent();
    } catch (err) {
      if (notice) {
        notice.style.display = "block";
        notice.className = "auth-notice-box error";
        notice.innerText = err.message || "Failed to sign in. Please verify your credentials.";
      }
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = "Sign In ↗";
      }
    }
  },

  async handleSignUpSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();
    const btn = document.getElementById("btnSignUpSubmit");
    const notice = document.getElementById("authNoticeBox");
    const name = document.getElementById("authRegName")?.value;
    const phone = document.getElementById("authRegPhone")?.value;
    const email = document.getElementById("authRegEmail")?.value;
    const password = document.getElementById("authRegPass")?.value;

    if (notice) notice.style.display = "none";
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Creating Account...';
    }

    try {
      const user = await this.signUp({ name, phone, email, password });
      if (typeof showToast === "function") showToast(`Account created successfully! Welcome to Lashari Communication 🎉`, "success");
      this.renderAuthModalContent();
    } catch (err) {
      if (notice) {
        notice.style.display = "block";
        notice.className = "auth-notice-box error";
        notice.innerText = err.message || "Failed to create account. Please try again.";
      }
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = "Create Account ↗";
      }
    }
  },

  handleSignOut() {
    this.signOut();
    if (typeof showToast === "function") showToast("Signed out successfully.", "info");
    this.renderAuthModalContent("signin");
  }
};

// Real-Time Order Tracking Module
const OrderTracker = {
  findOrder(query) {
    if (!query) return null;
    const cleanQuery = String(query).trim().toUpperCase();
    const numericQuery = cleanQuery.replace(/\D/g, "");

    const orders = typeof Storage !== "undefined" ? Storage.getOrders() : [];

    // Exact ID Match (#ORD-498907 or ORD-498907 or 498907)
    let found = orders.find(o => {
      if (!o || !o.id) return false;
      const oId = String(o.id).toUpperCase();
      const oNum = oId.replace(/\D/g, "");
      return oId === cleanQuery || (numericQuery && oNum === numericQuery);
    });

    // Match by Phone Number if not found by ID
    if (!found && numericQuery && numericQuery.length >= 7) {
      found = orders.find(o => {
        if (!o || !o.phone) return false;
        const oPhone = String(o.phone).replace(/\D/g, "");
        return oPhone.includes(numericQuery) || numericQuery.includes(oPhone);
      });
    }

    return found || null;
  },

  track(query) {
    const resultBox = document.getElementById("trackResultContainer");
    if (!resultBox) return;

    if (!query) {
      resultBox.innerHTML = `
        <div class="track-alert warning">
          <i class="fa-solid fa-circle-exclamation"></i>
          <span>Order ID ya Mobile Number enter karein (maslan <b>ORD-498907</b>).</span>
        </div>
      `;
      resultBox.style.display = "block";
      return;
    }

    const order = this.findOrder(query);

    if (!order) {
      resultBox.innerHTML = `
        <div class="track-alert error">
          <i class="fa-solid fa-triangle-exclamation"></i>
          <div>
            <strong>Order nahi mila (#${escapeHtml(query)})</strong>
            <p style="margin:4px 0 0; font-size:12px; color:#cbd5e1;">
              Barah-e-karam apna Order ID ya wo phone number check karein jo order karte waqt diya tha. Agar madad chahiye to hamare WhatsApp par rabta karein.
            </p>
            <a href="https://wa.me/923212920914?text=Salam!%20Mera%20Order%20${encodeURIComponent(query)}%20track%20nahi%20ho%20raha." target="_blank" class="button button-ghost button-sm" style="margin-top:10px; width:fit-content;">
              <i class="fa-brands fa-whatsapp" style="color:#25d366;"></i> WhatsApp Support
            </a>
          </div>
        </div>
      `;
      resultBox.style.display = "block";
      return;
    }

    // Determine tracking steps
    const status = (order.status || "Pending").trim();
    const isCancelled = status.toLowerCase() === "cancelled";

    let stepIndex = 1;
    if (status === "Confirmed") stepIndex = 2;
    if (status === "Shipped") stepIndex = 3;
    if (status === "Delivered") stepIndex = 4;

    const steps = [
      { id: 1, title: "Order Placed", desc: order.date || "Order received", icon: "fa-clipboard-check" },
      { id: 2, title: "Confirmed", desc: "Verified & Packed", icon: "fa-shield-halved" },
      { id: 3, title: "In Transit", desc: order.courierPartner || "TCS Express / Leopards", icon: "fa-truck-fast" },
      { id: 4, title: "Delivered", desc: "Delivered to Customer", icon: "fa-circle-check" }
    ];

    resultBox.innerHTML = `
      <div class="track-card">
        <div class="track-header">
          <div>
            <span class="track-kicker">LIVE ORDER STATUS</span>
            <h3 class="track-order-id">#${order.id}</h3>
            <span class="track-date"><i class="fa-regular fa-calendar"></i> ${order.date || "Recent"}</span>
          </div>
          <div class="track-status-pill status-${status.toLowerCase()}">
            <span class="track-pulse"></span>
            ${status}
          </div>
        </div>

        ${isCancelled ? `
          <div class="track-cancelled-notice">
            <i class="fa-solid fa-ban"></i>
            <span>Yeh order cancel kiya ja chuka hai. Mazeed maloomat ke liye helpline par rabta karein.</span>
          </div>
        ` : `
          <!-- STEP TRACKER TIMELINE -->
          <div class="track-timeline">
            ${steps.map(s => {
              const isDone = s.id <= stepIndex;
              const isCurrent = s.id === stepIndex;
              return `
                <div class="track-step ${isDone ? 'is-done' : ''} ${isCurrent ? 'is-current' : ''}">
                  <div class="track-step-icon">
                    <i class="fa-solid ${s.icon}"></i>
                  </div>
                  <div class="track-step-text">
                    <span class="track-step-title">${s.title}</span>
                    <span class="track-step-desc">${s.desc}</span>
                  </div>
                </div>
              `;
            }).join("")}
          </div>
        `}

        <!-- COURIER & DESTINATION INFO -->
        <div class="track-info-grid">
          <div class="track-info-item">
            <span class="track-info-label">Courier Partner</span>
            <span class="track-info-val"><i class="fa-solid fa-truck" style="color:var(--lime,#d6f32f);"></i> ${order.courierPartner || "TCS Express & Leopards"}</span>
          </div>
          <div class="track-info-item">
            <span class="track-info-label">Payment Method</span>
            <span class="track-info-val">${order.paymentMethod || "Cash on Delivery (COD)"}</span>
          </div>
          <div class="track-info-item" style="grid-column: 1 / -1;">
            <span class="track-info-label">Delivery Address</span>
            <span class="track-info-val">${order.customerName ? `<b>${escapeHtml(order.customerName)}</b> · ` : ""}${escapeHtml(order.address || "Pakistan")}</span>
          </div>
        </div>

        <!-- ORDER ITEMS -->
        <div class="track-items-box">
          <h4 class="track-items-heading">Ordered Items (${(order.items || []).length}):</h4>
          <div class="track-items-list">
            ${(order.items || []).map(i => `
              <div class="track-item-row">
                <span class="track-item-title">
                  <b>${i.qty}x</b> ${escapeHtml(i.title)}
                  ${i.color ? `<small class="track-item-tag">Color: ${escapeHtml(i.color)}</small>` : ""}
                  ${i.size ? `<small class="track-item-tag">Size: ${escapeHtml(i.size)}</small>` : ""}
                </span>
                <span class="track-item-price">Rs. ${((i.price || 0) * (i.qty || 1)).toLocaleString()}</span>
              </div>
            `).join("")}
          </div>
          <div class="track-total-row">
            <span>Total Payable:</span>
            <strong>Rs. ${(order.total || 0).toLocaleString()}</strong>
          </div>
        </div>

        <!-- WHATSAPP SUPPORT ACTION -->
        <div class="track-actions">
          <a href="https://wa.me/923212920914?text=Salam!%20Mujhe%20apne%20Order%20%23${order.id}%20ke%20bare%20me%20maloomat%20chahiye." target="_blank" rel="noopener" class="button button-ghost button-sm track-wa-btn">
            <i class="fa-brands fa-whatsapp" style="color:#25d366;"></i> WhatsApp Support for this Order
          </a>
        </div>
      </div>
    `;
    resultBox.style.display = "block";
  }
};

// Global Helpers & Modal Opener Bindings
function openAuthModal(tab = "signin") {
  const dialog = document.getElementById("authDialog");
  if (!dialog) return;
  CustomerAuth.renderAuthModalContent(tab);
  if (typeof dialog.showModal === "function") {
    dialog.showModal();
  } else {
    dialog.setAttribute("open", "");
  }
}

function closeAuthModal() {
  const dialog = document.getElementById("authDialog");
  if (dialog) {
    if (typeof dialog.close === "function") dialog.close();
    else dialog.removeAttribute("open");
  }
}

function openTrackOrderModal(orderId = "") {
  const dialog = document.getElementById("trackOrderDialog");
  if (!dialog) return;
  const input = document.getElementById("trackOrderIdInput");
  if (input && orderId) {
    input.value = orderId;
  }
  if (typeof dialog.showModal === "function") {
    dialog.showModal();
  } else {
    dialog.setAttribute("open", "");
  }
  if (orderId) {
    OrderTracker.track(orderId);
  }
}

function closeTrackOrderModal() {
  const dialog = document.getElementById("trackOrderDialog");
  if (dialog) {
    if (typeof dialog.close === "function") dialog.close();
    else dialog.removeAttribute("open");
  }
}

function handleTrackFormSubmit(e) {
  if (e && e.preventDefault) e.preventDefault();
  const input = document.getElementById("trackOrderIdInput");
  const val = input ? input.value.trim() : "";
  OrderTracker.track(val);
}

// Auto-fill checkout fields if user is signed in
function autofillCheckoutIfLoggedIn() {
  const user = CustomerAuth.getCurrentUser();
  if (!user) return;
  const nameInput = document.getElementById("orderCustomerName");
  const phoneInput = document.getElementById("orderPhone");
  if (nameInput && !nameInput.value) nameInput.value = user.name || "";
  if (phoneInput && !phoneInput.value) phoneInput.value = user.phone || "";
}

// Helper HTML escaper
function escapeHtml(str) {
  if (!str) return "";
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Auto-init on DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  CustomerAuth.init();
});
