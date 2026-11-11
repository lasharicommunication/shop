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
      const url = (config.url ? config.url.trim() : "") || "https://wnsiodlajtaskdmeklyp.supabase.co";
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

    if (!name) throw new Error("Please enter your username.");
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

  togglePasswordVisibility(inputId, btn) {
    const el = document.getElementById(inputId);
    if (!el) return;
    if (el.type === "password") {
      el.type = "text";
      if (btn) btn.textContent = "Hide password";
    } else {
      el.type = "password";
      if (btn) btn.textContent = "Show password";
    }
  },

  renderAuthModalContent(activeTab = "signin") {
    const container = document.getElementById("authModalBody");
    if (!container) return;

    const user = this.getCurrentUser();

    // If already logged in, show Clean Account Dashboard
    if (user) {
      const myOrders = this.getCustomerOrders();
      container.innerHTML = `
        <div class="auth-clean-account-header">
          <div class="auth-clean-avatar">
            ${(user.name || "U").slice(0, 1).toUpperCase()}
          </div>
          <div>
            <h3 class="auth-clean-user-name">${escapeHtml(user.name)}</h3>
            <p class="auth-clean-user-sub">${escapeHtml(user.email || "")}</p>
          </div>
        </div>

        <div class="auth-clean-stats-row" style="grid-template-columns: 1fr;">
          <div class="auth-clean-stat">
            <span class="auth-clean-stat-val">${myOrders.length}</span>
            <span class="auth-clean-stat-lbl">Orders Placed</span>
          </div>
        </div>

        <div class="auth-clean-orders-box">
          <h4 class="auth-clean-orders-title">
            <i class="fa-solid fa-box-archive" style="color:#2563eb;"></i> My Recent Orders
          </h4>
          ${myOrders.length === 0 ? `
            <div style="text-align:center; padding:18px 0; color:#64748b; font-size:13px;">
              <p style="margin:0 0 10px;">No orders placed yet.</p>
              <button type="button" class="auth-primary-btn" style="margin:0 auto; width:fit-content; padding:8px 18px; font-size:13px;" onclick="closeAuthModal(); location.hash='#collection';">Explore Store ↗</button>
            </div>
          ` : `
            <div class="auth-clean-orders-list">
              ${myOrders.map(o => `
                <div class="auth-clean-order-item">
                  <div class="auth-clean-order-top">
                    <span class="auth-clean-order-id">#${o.id}</span>
                    <span class="auth-clean-order-badge">${o.status || 'Pending'}</span>
                  </div>
                  <div style="color:#64748b; font-size:11.5px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                    ${(o.items || []).map(i => `${i.qty}x ${i.title}`).join(", ")}
                  </div>
                  <div class="auth-clean-order-footer">
                    <span style="font-weight:700; color:#0f172a;">Rs. ${(o.total || 0).toLocaleString()}</span>
                    <button type="button" class="auth-clean-track-btn" onclick="closeAuthModal(); openTrackOrderModal('${o.id}');">
                      Track 🚚
                    </button>
                  </div>
                </div>
              `).join("")}
            </div>
          `}
        </div>

        <button type="button" class="auth-clean-logout-btn" onclick="CustomerAuth.handleSignOut()">
          <i class="fa-solid fa-right-from-bracket"></i> Log out
        </button>
      `;
      return;
    }

    // CREATE AN ACCOUNT VIEW (MATCHING USER UPLOADED DESIGN)
    if (activeTab === "signup") {
      container.innerHTML = `
        <div class="auth-card-brand">
          Lashari Communication <span class="auth-card-brand-icon">📱</span>
        </div>
        <h2 class="auth-card-title">Create an account</h2>
        <p class="auth-card-subtitle">Enter your username, email, and password to register.</p>

        <div id="authNoticeBox" class="auth-clean-alert" style="display:none;"></div>

        <form id="signUpForm" onsubmit="CustomerAuth.handleSignUpSubmit(event)" class="auth-clean-form">
          <div class="auth-clean-field">
            <label class="auth-clean-label">Username</label>
            <input type="text" id="authRegName" placeholder="e.g. ali123" class="auth-clean-input" required autocomplete="username">
            <span class="auth-clean-hint">3–24 characters, letters, numbers, and underscores only.</span>
          </div>

          <div class="auth-clean-field">
            <label class="auth-clean-label">Email</label>
            <input type="email" id="authRegEmail" placeholder="you@gmail.com" class="auth-clean-input" required autocomplete="email">
            <span class="auth-clean-hint">Allowed domains: gmail.com, outlook.com, yahoo.com, hotmail.com, icloud.com</span>
          </div>

          <div class="auth-clean-field">
            <label class="auth-clean-label">Password</label>
            <input type="password" id="authRegPass" placeholder="••••••••" class="auth-clean-input" minlength="6" required autocomplete="new-password">
            <span class="auth-clean-hint">At least 6 characters.</span>
            <button type="button" class="auth-toggle-pass-btn" onclick="CustomerAuth.togglePasswordVisibility('authRegPass', this)">Show password</button>
          </div>

          <button type="submit" id="btnSignUpSubmit" class="auth-primary-btn">
            Sign up
          </button>
        </form>

        <p class="auth-clean-footer-text">
          Already have an account? 
          <a href="javascript:void(0)" onclick="CustomerAuth.renderAuthModalContent('signin')" class="auth-clean-link">Log in</a>
        </p>
      `;
      return;
    }

    // LOG IN VIEW (MATCHING USER UPLOADED DESIGN)
    container.innerHTML = `
      <div class="auth-card-brand">
        Lashari Communication <span class="auth-card-brand-icon">📱</span>
      </div>
      <h2 class="auth-card-title">Welcome back</h2>
      <p class="auth-card-subtitle">Enter your username or email and password to log in.</p>

      <div id="authNoticeBox" class="auth-clean-alert" style="display:none;"></div>

      <form id="signInForm" onsubmit="CustomerAuth.handleSignInSubmit(event)" class="auth-clean-form">
        <div class="auth-clean-field">
          <label class="auth-clean-label">Username or Email</label>
          <input type="text" id="authLoginInput" placeholder="e.g. ali123 or you@gmail.com" class="auth-clean-input" required autocomplete="username">
        </div>

        <div class="auth-clean-field">
          <label class="auth-clean-label">Password</label>
          <input type="password" id="authLoginPass" placeholder="••••••••" class="auth-clean-input" required autocomplete="current-password">
          <button type="button" class="auth-toggle-pass-btn" onclick="CustomerAuth.togglePasswordVisibility('authLoginPass', this)">Show password</button>
        </div>

        <button type="submit" id="btnSignInSubmit" class="auth-primary-btn">
          Log in
        </button>
      </form>

      <p class="auth-clean-footer-text">
        Don't have an account? 
        <a href="javascript:void(0)" onclick="CustomerAuth.renderAuthModalContent('signup')" class="auth-clean-link">Sign up</a>
      </p>
    `;
  },

  async handleSignInSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();
    const btn = document.getElementById("btnSignInSubmit");
    const notice = document.getElementById("authNoticeBox");
    const identifier = document.getElementById("authLoginInput")?.value;
    const password = document.getElementById("authLoginPass")?.value || document.getElementById("authPassInput")?.value;

    if (notice) notice.style.display = "none";
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Logging in...';
    }

    try {
      const user = await this.signIn({ identifier, password });
      if (typeof showToast === "function") showToast(`Welcome back, ${user.name}! 👋`, "success");
      this.renderAuthModalContent();
    } catch (err) {
      if (notice) {
        notice.style.display = "block";
        notice.className = "auth-clean-alert error";
        notice.innerText = err.message || "Failed to log in. Please verify your credentials.";
      }
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = "Log in";
      }
    }
  },

  async handleSignUpSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();
    const btn = document.getElementById("btnSignUpSubmit");
    const notice = document.getElementById("authNoticeBox");
    const name = document.getElementById("authRegName")?.value;
    const phone = document.getElementById("authRegPhone")?.value || "";
    const email = document.getElementById("authRegEmail")?.value;
    const password = document.getElementById("authRegPass")?.value;

    if (notice) notice.style.display = "none";
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Creating Account...';
    }

    try {
      const user = await this.signUp({ name, phone, email, password });
      if (typeof showToast === "function") showToast(`Account created successfully! Welcome, ${user.name} 🎉`, "success");
      this.renderAuthModalContent();
    } catch (err) {
      if (notice) {
        notice.style.display = "block";
        notice.className = "auth-clean-alert error";
        notice.innerText = err.message || "Failed to create account. Please try again.";
      }
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = "Sign up";
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

    // Exact ID Match (#498907 or 498907 or legacy ORD-498907)
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
          <span>Please enter your Order ID or phone number (e.g. <b>498907</b>).</span>
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
            <strong>Order not found (#${escapeHtml(query)})</strong>
            <p style="margin:4px 0 0; font-size:12px; color:#cbd5e1;">
              Please check your Order ID or phone number used during checkout. Contact us on WhatsApp if you need help.
            </p>
            <a href="https://wa.me/923212920914?text=Hi!%20I%20am%20trying%20to%20track%20my%20order%20${encodeURIComponent(query)}." target="_blank" class="button button-ghost button-sm" style="margin-top:10px; width:fit-content;">
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
            <span>This order has been cancelled. For further assistance, please contact our support helpline.</span>
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
function openAuthModal(tab = "signup") {
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
