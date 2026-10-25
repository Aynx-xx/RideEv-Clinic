const menuToggle = document.querySelector("#mobile-menu-toggle");
const navigation = document.querySelector(".main-nav");
const welcomeScreen = document.querySelector("#welcome-screen");
const welcomeEnter = document.querySelector("#welcome-enter");
const products = [
  { name: "Scooty", slug: "scooty", price: 115000, image: "Scooty-scaled.png", note: "The easy-going everyday scooty.", battery: "48V · 12Ah lithium", power: "350 W", range: null, speed: null, categories: ["scooty", "commuter"] },
  { name: "EV 70", slug: "ev-70", price: 230000, comingSoon: true, image: "Ev-70-scaled.png", note: "A little more power for the daily ride.", battery: "2.3 kW · 76.8V · 30Ah", power: "1,500 W", range: null, speed: null, categories: ["commuter"] },
  { name: "Zippy", slug: "zippy", price: 220000, image: "Zippy-1-scaled.png", note: "Compact frame. City-ready energy.", battery: "2.3 kW LiFePO₄", power: "1,000 W", range: "80–120 km", rangeValue: 120, speed: "40/55 km/h", categories: ["commuter", "range"] },
  { name: "Zippy + Protection Frame", slug: "zippy-with-protection-frame-tail-box", price: 230000, image: "Zippy-With-Protection-Tail-Box-scaled.png", note: "Zippy with added frame and tail box.", battery: "2.3 kW LiFePO₄", power: "1,000 W", range: "80–120 km", rangeValue: 120, speed: "40/55 km/h", categories: ["commuter", "range"] },
  { name: "Sprint", slug: "sprint", price: 275000, comingSoon: true, image: "Sprint-scaled.png", note: "Quick-charging, longer-range confidence.", battery: "3.45 kW LiFePO₄", power: "1,200 W", range: "120–145 km", rangeValue: 145, speed: "50–60 km/h", categories: ["commuter", "range"] },
  { name: "Elegance", slug: "elegance", price: 315000, comingSoon: true, image: "Elegance-scaled.png", note: "Clean lines with a comfortable ride.", battery: "2.3 kW LiFePO₄", power: "1,500 W", range: "75–100 km", rangeValue: 100, speed: "50–60 km/h", categories: ["commuter", "range"] },
  { name: "Explorer", slug: "explorer", price: 430000, image: "Explorer-scaled.png", note: "Built to go further, with room to roam.", battery: "3.0 kW LiFePO₄", power: "2,000 W", range: "115–140 km", rangeValue: 140, speed: "60–70 km/h", categories: ["range", "performance"] },
  { name: "Vortex 3.0", slug: "vortex-3-0", price: 460000, comingSoon: true, image: "Vortex-3.0-scaled.png", note: "A powerful setup for a bold ride.", battery: "3.8 kW · 76.8V · 50Ah", power: "3,000 W", range: null, speed: null, categories: ["performance"] },
  { name: "Mach 1", slug: "mach-1", price: 635000, comingSoon: true, image: "Mach-1-scaled.png", note: "The flagship for riders who want more.", battery: "5.1 kW · 76.8V · 70Ah", power: "3,000 W", range: null, speed: null, categories: ["performance"] },
];

const productGrid = document.querySelector("#scooter-grid");
const emptyCatalog = document.querySelector("#catalog-empty");
const sortControl = document.querySelector("#catalog-sort");
const productImages = "https://etorqx.com/wp-content/uploads/2021/08/";
let activeFilter = "all";
let activeSort = "featured";
let supabaseClient = null;
let currentUser = null;
let pendingProduct = "";

const formatPrice = price => `PKR ${price.toLocaleString("en-PK")}`;
const productAvailability = product => product.comingSoon ? "Coming soon" : formatPrice(product.price);
const authDialog = document.querySelector("#auth-dialog");
const bookingDialog = document.querySelector("#booking-dialog");
const productDialog = document.querySelector("#product-dialog");
const authMessage = document.querySelector("#auth-message");
const bookingMessage = document.querySelector("#booking-message");
const adminMessage = document.querySelector("#admin-message");

function renderProducts() {
  let visible = products.filter(product => activeFilter === "all" || product.categories.includes(activeFilter));
  if (activeSort === "price-low") visible.sort((a, b) => a.price - b.price);
  if (activeSort === "price-high") visible.sort((a, b) => b.price - a.price);
  if (activeSort === "range-high") visible.sort((a, b) => (b.rangeValue || 0) - (a.rangeValue || 0));

  productGrid.innerHTML = visible.map((product, index) => `
    <article class="scooter-card reveal" style="--card-order:${index}">
      <div class="scooter-image">
        <button class="scooter-image-trigger" type="button" data-view-model="${product.slug}" aria-label="View ${product.name} details">
          <img src="${productImages}${product.image}" alt="" loading="lazy" />
        </button>
        <span class="scooter-image-label">E-TORQ · ${product.name.toUpperCase()}</span>
        ${product.comingSoon ? '<span class="coming-soon-badge">COMING SOON</span>' : ""}
        <button class="scooter-image-arrow" type="button" data-book-model="${product.slug}" aria-label="Ask about ${product.name}">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h13M12 5l7 7-7 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
      </div>
      <div class="scooter-info">
        <div class="scooter-title-row"><div><h3>${product.name}</h3><p>${product.note}</p></div><span class="scooter-power">${product.power}</span></div>
        <div class="scooter-specs">
          <span><small>BATTERY</small>${product.battery}</span>
          <span><small>RANGE</small>${product.range || "Ask showroom"}</span>
          <span><small>TOP SPEED</small>${product.speed || "Ask showroom"}</span>
        </div>
        <div class="scooter-price-row"><div><small>${product.comingSoon ? "AVAILABILITY" : "MANUFACTURER LIST PRICE"}</small><strong class="${product.comingSoon ? "coming-soon-price" : ""}">${productAvailability(product)}</strong></div><button class="query-button" type="button" data-book-model="${product.slug}">${product.comingSoon ? "Ask about arrival" : "Ask about this ride"} <span aria-hidden="true">→</span></button></div>
        <div class="scooter-details">Dealer price &amp; stock confirmed by phone <span aria-hidden="true">☎</span></div>
      </div>
    </article>`).join("");
  emptyCatalog.hidden = visible.length > 0;
  observeReveals(productGrid.querySelectorAll(".reveal"));
}

function observeReveals(elements = document.querySelectorAll(".reveal")) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
    elements.forEach(element => element.classList.add("is-visible"));
    return;
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  elements.forEach(element => observer.observe(element));
}

menuToggle.addEventListener("click", () => {
  const isOpen = navigation.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

navigation.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    navigation.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});

document.querySelectorAll(".catalog-filter").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelector(".catalog-filter.active").classList.remove("active");
    button.classList.add("active");
    activeFilter = button.dataset.filter;
    renderProducts();
  });
});

sortControl.addEventListener("change", () => {
  activeSort = sortControl.value;
  renderProducts();
});

function setMessage(element, message, isError = false) {
  element.textContent = message;
  element.classList.toggle("error", isError);
}

function configuredSupabase() {
  const config = window.RIDE_CLINIC_SUPABASE;
  if (!window.supabase || !config?.url || !config?.anonKey || config.url.includes("YOUR_")) {
    return null;
  }
  return window.supabase.createClient(config.url, config.anonKey);
}

function updateAccountControls() {
  const accountButton = document.querySelector("#account-button");
  const adminButton = document.querySelector("#admin-button");
  document.querySelector("#auth-signout-button").hidden = !currentUser;
  if (!currentUser) {
    accountButton.textContent = "Log in / Sign up";
    adminButton.hidden = true;
    return;
  }
  accountButton.textContent = currentUser.user_metadata?.full_name || currentUser.email;
  adminButton.hidden = !adminButton.dataset.isAdmin;
}

async function syncUser(user) {
  currentUser = user;
  delete document.querySelector("#admin-button").dataset.isAdmin;
  document.querySelector("#admin-panel").hidden = true;
  if (!user || !supabaseClient) {
    updateAccountControls();
    return;
  }

  const { data, error } = await supabaseClient
    .from("ride_clinic_admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (error) {
    setMessage(authMessage, `We couldn’t verify admin access: ${error.message}`, true);
  } else if (data) {
    document.querySelector("#admin-button").dataset.isAdmin = "true";
  }
  updateAccountControls();

  if (pendingProduct && user) {
    const requestedProduct = pendingProduct;
    pendingProduct = "";
    openBookingDialog(requestedProduct);
  }
}

function showConfigurationHelp() {
  setMessage(authMessage, "Online accounts and booking requests are not configured yet. Please call +92 313 9999926.", true);
}

function openAuthDialog(mode = "login") {
  if (!authDialog.open) authDialog.showModal();
  setAuthMode(mode);
  if (!supabaseClient) {
    showConfigurationHelp();
  } else if (currentUser) {
    setMessage(authMessage, `Signed in as ${currentUser.email}.`);
  }
}

function setAuthMode(mode) {
  document.querySelectorAll(".auth-tab").forEach(tab => {
    const selected = tab.dataset.authMode === mode;
    tab.classList.toggle("active", selected);
    tab.setAttribute("aria-selected", String(selected));
  });
  document.querySelector("#login-form").hidden = mode !== "login";
  document.querySelector("#signup-form").hidden = mode !== "signup";
  document.querySelector("#auth-title").textContent = mode === "login" ? "Welcome aboard." : "Create your account.";
  setMessage(authMessage, "");
}

function openBookingDialog(modelSlug) {
  if (!supabaseClient) {
    openAuthDialog();
    showConfigurationHelp();
    return;
  }
  if (!currentUser) {
    pendingProduct = modelSlug;
    openAuthDialog();
    setMessage(authMessage, "Log in or create an account first. We’ll bring you back to your scooter query.");
    return;
  }

  const form = document.querySelector("#booking-form");
  const selectedProduct = products.find(product => product.slug === modelSlug);
  form.elements.name.value = currentUser.user_metadata?.full_name || "";
  form.elements.phone.value = currentUser.user_metadata?.phone || "";
  form.elements.scooter.value = selectedProduct ? selectedProduct.slug : "";
  setMessage(bookingMessage, "");
  bookingDialog.showModal();
}

function openProductDialog(modelSlug) {
  const product = products.find(item => item.slug === modelSlug);
  if (!product) return;
  const image = document.querySelector("#product-dialog-image");
  image.src = `${productImages}${product.image}`;
  image.alt = `${product.name} electric scooter`;
  document.querySelector("#product-dialog-name").textContent = product.name;
  document.querySelector("#product-dialog-note").textContent = product.note;
  document.querySelector("#product-dialog-battery").textContent = product.battery;
  document.querySelector("#product-dialog-power").textContent = product.power;
  document.querySelector("#product-dialog-range").textContent = product.range || "Ask showroom";
  document.querySelector("#product-dialog-speed").textContent = product.speed || "Ask showroom";
  document.querySelector("#product-dialog-price").textContent = productAvailability(product);
  document.querySelector("#product-dialog-price-label").textContent = product.comingSoon ? "AVAILABILITY" : "MANUFACTURER LIST PRICE";
  document.querySelector("#product-dialog-price-note").textContent = product.comingSoon
    ? "Ask Ride Clinic for updates on when this model will arrive."
    : "Confirm local price & stock with Ride Clinic.";
  document.querySelector("#product-dialog-book").dataset.bookModel = product.slug;
  productDialog.showModal();
}

function setupDialogClose(dialog) {
  dialog.querySelectorAll("[data-close-dialog]").forEach(button => {
    button.addEventListener("click", () => dialog.close());
  });
  dialog.addEventListener("click", event => {
    if (event.target === dialog) dialog.close();
  });
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]);
}

async function loadBookingRequests() {
  const rows = document.querySelector("#request-rows");
  const adminSection = document.querySelector("#admin-panel");
  if (!currentUser || !supabaseClient || adminSection.hidden) return;

  setMessage(adminMessage, "Loading customer queries…");
  const { data, error } = await supabaseClient
    .from("ride_clinic_booking_requests")
    .select("id, customer_name, phone, scooter_name, message, status, created_at")
    .order("created_at", { ascending: false });
  if (error) {
    setMessage(adminMessage, `Could not load requests: ${error.message}`, true);
    return;
  }

  rows.innerHTML = data.length ? data.map(request => `
    <tr>
      <td>${escapeHtml(request.customer_name)}</td>
      <td><a href="tel:${escapeHtml(request.phone)}">${escapeHtml(request.phone)}</a></td>
      <td>${escapeHtml(request.scooter_name)}</td>
      <td>${escapeHtml(request.message || "—")}</td>
      <td>${escapeHtml(new Date(request.created_at).toLocaleString())}</td>
      <td><select class="request-status" data-request-id="${escapeHtml(request.id)}" aria-label="Update request status">
        <option value="new" ${request.status === "new" ? "selected" : ""}>New</option>
        <option value="contacted" ${request.status === "contacted" ? "selected" : ""}>Contacted</option>
        <option value="closed" ${request.status === "closed" ? "selected" : ""}>Closed</option>
      </select></td>
    </tr>`).join("") : `<tr><td colspan="6" class="empty-requests">No customer queries yet.</td></tr>`;
  setMessage(adminMessage, `${data.length} customer ${data.length === 1 ? "query" : "queries"}`);
}

document.querySelector("#account-button").addEventListener("click", () => {
  if (currentUser) {
    openAuthDialog();
    document.querySelector("#login-form").hidden = true;
    document.querySelector("#signup-form").hidden = true;
    document.querySelector("#auth-title").textContent = "You’re signed in.";
    document.querySelector("#auth-signout-button").hidden = false;
    setMessage(authMessage, `Signed in as ${currentUser.email}. Use the private admin panel if you have access, or sign out below.`);
    return;
  }
  openAuthDialog();
});

document.querySelector("#admin-button").addEventListener("click", async () => {
  const panel = document.querySelector("#admin-panel");
  panel.hidden = false;
  panel.scrollIntoView({ behavior: "smooth", block: "start" });
  await loadBookingRequests();
});
document.querySelector("#refresh-requests").addEventListener("click", loadBookingRequests);
document.querySelector("#sign-out-button").addEventListener("click", async () => {
  if (!supabaseClient) return;
  const { error } = await supabaseClient.auth.signOut();
  if (error) setMessage(adminMessage, `Could not sign out: ${error.message}`, true);
  else {
    document.querySelector("#admin-panel").hidden = true;
    setMessage(authMessage, "You have been signed out.");
    openAuthDialog();
  }
});
document.querySelector("#auth-signout-button").addEventListener("click", async () => {
  if (!supabaseClient) return;
  const { error } = await supabaseClient.auth.signOut();
  if (error) return setMessage(authMessage, `Could not sign out: ${error.message}`, true);
  authDialog.close();
});

document.querySelectorAll(".auth-tab").forEach(tab => {
  tab.addEventListener("click", () => setAuthMode(tab.dataset.authMode));
});
setupDialogClose(authDialog);
setupDialogClose(bookingDialog);
setupDialogClose(productDialog);

document.querySelector("#login-form").addEventListener("submit", async event => {
  event.preventDefault();
  if (!supabaseClient) return showConfigurationHelp();
  const form = event.currentTarget;
  const submit = form.querySelector("button[type=submit]");
  submit.disabled = true;
  setMessage(authMessage, "Signing you in…");
  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email: form.elements.email.value.trim(),
    password: form.elements.password.value,
  });
  submit.disabled = false;
  if (error) return setMessage(authMessage, error.message, true);
  await syncUser(data.user);
  authDialog.close();
});

document.querySelector("#signup-form").addEventListener("submit", async event => {
  event.preventDefault();
  if (!supabaseClient) return showConfigurationHelp();
  const form = event.currentTarget;
  const submit = form.querySelector("button[type=submit]");
  submit.disabled = true;
  setMessage(authMessage, "Creating your account…");
  const { data, error } = await supabaseClient.auth.signUp({
    email: form.elements.email.value.trim(),
    password: form.elements.password.value,
    options: {
      data: {
        full_name: form.elements.name.value.trim(),
        phone: form.elements.phone.value.trim(),
      },
    },
  });
  submit.disabled = false;
  if (error) return setMessage(authMessage, error.message, true);
  if (data.session) {
    await syncUser(data.user);
    authDialog.close();
  } else {
    setAuthMode("login");
    setMessage(authMessage, "Account created. Check your email to confirm your address, then log in to send a scooter query.");
  }
});

document.addEventListener("click", event => {
  const viewButton = event.target.closest("[data-view-model]");
  if (viewButton) {
    openProductDialog(viewButton.dataset.viewModel);
    return;
  }
  const button = event.target.closest("[data-book-model]");
  if (button) {
    if (button.closest("#product-dialog")) productDialog.close();
    openBookingDialog(button.dataset.bookModel);
  }
});
document.querySelectorAll(".hero-actions a[href=\"#scooters\"]").forEach(link => {
  link.addEventListener("click", () => {
    if (navigation.classList.contains("open")) {
      navigation.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    }
  });
});

document.querySelector("#booking-form").addEventListener("submit", async event => {
  event.preventDefault();
  if (!supabaseClient || !currentUser) {
    pendingProduct = event.currentTarget.elements.scooter.value;
    bookingDialog.close();
    return openAuthDialog();
  }

  const form = event.currentTarget;
  const submit = form.querySelector("button[type=submit]");
  const scooter = products.find(product => product.slug === form.elements.scooter.value);
  if (!scooter) return setMessage(bookingMessage, "Please choose a scooter model.", true);

  submit.disabled = true;
  setMessage(bookingMessage, "Sending your query securely…");
  const { error } = await supabaseClient.from("ride_clinic_booking_requests").insert({
    user_id: currentUser.id,
    customer_name: form.elements.name.value.trim(),
    phone: form.elements.phone.value.trim(),
    scooter_name: scooter.name,
    message: form.elements.message.value.trim(),
  });
  submit.disabled = false;
  if (error) return setMessage(bookingMessage, `We couldn’t save your query: ${error.message}`, true);

  form.reset();
  setMessage(bookingMessage, "Your query has been sent. Ride Clinic will call you about this scooter.");
  window.setTimeout(() => bookingDialog.close(), 1800);
});

document.querySelector("#request-rows").addEventListener("change", async event => {
  const select = event.target.closest("[data-request-id]");
  if (!select || !supabaseClient) return;
  select.disabled = true;
  const { error } = await supabaseClient
    .from("ride_clinic_booking_requests")
    .update({ status: select.value })
    .eq("id", select.dataset.requestId);
  select.disabled = false;
  if (error) {
    setMessage(adminMessage, `Could not update request: ${error.message}`, true);
    await loadBookingRequests();
  } else {
    setMessage(adminMessage, "Request status updated.");
  }
});

observeReveals();
renderProducts();

document.querySelectorAll("#booking-scooter").forEach(select => {
  select.innerHTML = `<option value="">Choose a scooter</option>${products.map(product => `<option value="${escapeHtml(product.slug)}">${escapeHtml(product.name)} — ${productAvailability(product)}</option>`).join("")}`;
});

if (welcomeScreen && welcomeEnter) {
  document.body.classList.add("welcome-active");
  welcomeEnter.addEventListener("click", () => {
    if (welcomeScreen.classList.contains("is-leaving")) return;
    welcomeScreen.classList.add("is-leaving");
    const dismiss = () => {
      welcomeScreen.hidden = true;
      welcomeScreen.setAttribute("aria-hidden", "true");
      document.body.classList.remove("welcome-active");
    };
    welcomeScreen.addEventListener("animationend", event => {
      if (event.target === welcomeScreen && event.animationName === "welcome-exit") dismiss();
    }, { once: true });
    const fallbackDelay = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 80 : 950;
    window.setTimeout(dismiss, fallbackDelay);
  });
}

supabaseClient = configuredSupabase();
if (supabaseClient) {
  supabaseClient.auth.getSession().then(({ data, error }) => {
    if (error) setMessage(authMessage, `Could not restore your session: ${error.message}`, true);
    return syncUser(data?.session?.user || null);
  });
  supabaseClient.auth.onAuthStateChange((_event, session) => {
    window.setTimeout(() => syncUser(session?.user || null), 0);
  });
}
