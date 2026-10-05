const parseData = (id) => {
  const node = document.getElementById(id);
  if (!node) return {};
  try { return JSON.parse(node.textContent || "{}"); }
  catch (error) { console.error(`Nie można odczytać danych ${id}.`, error); return {}; }
};

const site = parseData("site-data");
const menu = parseData("menu-data");
const gallery = parseData("gallery-data").gallery || [];
const ORDER_URL = site.ORDER_URL;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Slider zdjęć na pierwszym ekranie. Adresy zdjęć są konfigurowane w site.json.
document.querySelectorAll("[data-hero-slider]").forEach((heroSlider) => {
  const slides = [...heroSlider.querySelectorAll("[data-hero-slide]")];
  const dots = [...heroSlider.querySelectorAll("[data-hero-dot]")];
  const counter = heroSlider.querySelector("[data-hero-count]");
  let activeSlide = 0;
  let intervalId = null;

  function renderHeroSlider() {
    slides.forEach((slide, index) => {
      const isActive = index === activeSlide;
      slide.classList.toggle("is-active", isActive);
      slide.setAttribute("aria-hidden", String(!isActive));
    });
    dots.forEach((dot, index) => dot.setAttribute("aria-current", String(index === activeSlide)));
    if (counter) counter.textContent = `${String(activeSlide + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`;
  }
  function moveHeroSlider(step) {
    activeSlide = (activeSlide + step + slides.length) % slides.length;
    renderHeroSlider();
  }
  function stopAutoplay() {
    if (intervalId) window.clearInterval(intervalId);
    intervalId = null;
  }
  function startAutoplay() {
    stopAutoplay();
    if (slides.length > 1 && !prefersReducedMotion) intervalId = window.setInterval(() => moveHeroSlider(1), 6000);
  }

  heroSlider.querySelector("[data-hero-prev]")?.addEventListener("click", () => { moveHeroSlider(-1); startAutoplay(); });
  heroSlider.querySelector("[data-hero-next]")?.addEventListener("click", () => { moveHeroSlider(1); startAutoplay(); });
  dots.forEach((dot) => dot.addEventListener("click", () => {
    activeSlide = Number(dot.dataset.heroDot) || 0;
    renderHeroSlider();
    startAutoplay();
  }));
  heroSlider.addEventListener("mouseenter", stopAutoplay);
  heroSlider.addEventListener("mouseleave", startAutoplay);
  heroSlider.addEventListener("focusin", stopAutoplay);
  heroSlider.addEventListener("focusout", (event) => {
    if (!heroSlider.contains(event.relatedTarget)) startAutoplay();
  });
  let touchStartX = 0;
  heroSlider.addEventListener("touchstart", (event) => { touchStartX = event.changedTouches[0].clientX; }, { passive: true });
  heroSlider.addEventListener("touchend", (event) => {
    const distance = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(distance) > 45) { moveHeroSlider(distance < 0 ? 1 : -1); startAutoplay(); }
  }, { passive: true });
  renderHeroSlider();
  startAutoplay();
});

document.querySelectorAll(".brand[href='/']").forEach((brand) => brand.addEventListener("click", (event) => {
  // Z podstrony logo prowadzi na stronę główną (domyślne zachowanie przeglądarki).
  if (window.location.pathname !== "/") return;
  event.preventDefault();
  window.scrollTo({ top: 0, left: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
  history.replaceState(null, "", "/");
}));

document.querySelectorAll("[data-occasion-slider]").forEach((occasionSlider) => {
  const track = occasionSlider.querySelector(".occasion-slider__track");
  const slides = [...occasionSlider.querySelectorAll(".occasion-slide")];
  const dots = [...occasionSlider.querySelectorAll("[data-occasion-dot]")];
  const count = occasionSlider.querySelector("[data-occasion-count]");
  let activeSlide = 0;

  function renderOccasionSlider() {
    if (!track || !slides.length) return;
    slides.forEach((slide, index) => {
      const offset = index - activeSlide;
      const wrappedOffset = offset > slides.length / 2 ? offset - slides.length : offset < -slides.length / 2 ? offset + slides.length : offset;
      slide.style.transform = `translateX(${wrappedOffset * 78}%) scale(${wrappedOffset === 0 ? 1 : .9})`;
      slide.classList.toggle("is-active", wrappedOffset === 0);
      slide.setAttribute("aria-hidden", String(wrappedOffset !== 0));
    });
    dots.forEach((dot, index) => dot.setAttribute("aria-current", String(index === activeSlide)));
    if (count) count.textContent = `${String(activeSlide + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`;
  }
  function moveOccasionSlider(step) {
    activeSlide = (activeSlide + step + slides.length) % slides.length;
    renderOccasionSlider();
  }
  occasionSlider.querySelector("[data-occasion-prev]")?.addEventListener("click", () => moveOccasionSlider(-1));
  occasionSlider.querySelector("[data-occasion-next]")?.addEventListener("click", () => moveOccasionSlider(1));
  dots.forEach((dot) => dot.addEventListener("click", () => {
    activeSlide = Number(dot.dataset.occasionDot) || 0;
    renderOccasionSlider();
  }));
  let touchStartX = 0;
  occasionSlider.addEventListener("touchstart", (event) => { touchStartX = event.changedTouches[0].clientX; }, { passive: true });
  occasionSlider.addEventListener("touchend", (event) => {
    const distance = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(distance) > 45) moveOccasionSlider(distance < 0 ? 1 : -1);
  }, { passive: true });
  renderOccasionSlider();
});

// Mobilna nawigacja
const menuToggle = document.querySelector(".menu-toggle");
const primaryNav = document.getElementById("primary-nav");
if (menuToggle && primaryNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Otwórz menu" : "Zamknij menu");
    primaryNav.classList.toggle("is-open", !isOpen);
  });
  primaryNav.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Otwórz menu");
    primaryNav.classList.remove("is-open");
  }));
}

// Interaktywne kategorie menu. Cała zawartość jest już w HTML, więc pozostaje czytelna bez JS.
const tabs = [...document.querySelectorAll("[data-category-tab]")];
const panels = [...document.querySelectorAll("[data-category-panel]")];
const searchInput = document.getElementById("menu-search");
let activeCategory = tabs.find((tab) => tab.getAttribute("aria-selected") === "true")?.dataset.categoryTab || tabs[0]?.dataset.categoryTab;

function applySearch() {
  const term = (searchInput?.value || "").trim().toLocaleLowerCase("pl");
  const activePanel = panels.find((panel) => panel.dataset.categoryPanel === activeCategory);
  if (!activePanel) return;
  const cards = [...activePanel.querySelectorAll("[data-product-id]")];
  let matches = 0;
  cards.forEach((card) => {
    const visible = !term || card.textContent.toLocaleLowerCase("pl").includes(term);
    card.hidden = !visible;
    if (visible) matches += 1;
  });
  const empty = activePanel.querySelector("[data-empty-state]");
  if (empty) empty.hidden = matches > 0;
}

function selectCategory(category, focusTab = false) {
  if (!tabs.some((tab) => tab.dataset.categoryTab === category)) return;
  activeCategory = category;
  tabs.forEach((tab) => {
    const selected = tab.dataset.categoryTab === category;
    tab.setAttribute("aria-selected", String(selected));
    tab.tabIndex = selected ? 0 : -1;
    if (selected && focusTab) tab.focus();
  });
  panels.forEach((panel) => {
    panel.hidden = panel.dataset.categoryPanel !== category;
  });
  if (searchInput) searchInput.value = "";
  applySearch();
}

tabs.forEach((tab, index) => {
  tab.addEventListener("click", () => selectCategory(tab.dataset.categoryTab));
  tab.addEventListener("keydown", (event) => {
    let next = null;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (index + 1) % tabs.length;
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (index - 1 + tabs.length) % tabs.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = tabs.length - 1;
    if (next !== null) {
      event.preventDefault();
      selectCategory(tabs[next].dataset.categoryTab, true);
    }
  });
});
searchInput?.addEventListener("input", applySearch);
if (activeCategory) selectCategory(activeCategory);

// Szczegóły produktu w natywnym, dostępnym dialogu.
const productDialog = document.getElementById("product-dialog");
const dialogContent = document.getElementById("dialog-content");
let lastProductTrigger = null;
const allProducts = menu.products || [];
const categoryById = new Map((menu.categories || []).map((category) => [category.id, category]));

function createPriceElement(priceText) {
  const priceGroup = document.createElement("div");
  const match = String(priceText).match(/^32 cm: (.+?) · 45 cm: (.+)$/);
  if (!match) {
    priceGroup.className = "product-price";
    priceGroup.textContent = priceText;
    return priceGroup;
  }
  priceGroup.className = "product-prices dialog-product-prices";
  [["32 cm", match[1]], ["45 cm", match[2]]].forEach(([size, amount]) => {
    const price = document.createElement("span");
    price.className = "product-price";
    const label = document.createElement("small");
    label.textContent = size;
    const value = document.createElement("strong");
    value.textContent = amount;
    price.append(label, value);
    priceGroup.append(price);
  });
  return priceGroup;
}

function openProduct(productId, trigger) {
  const product = allProducts.find((item) => item.id === productId);
  if (!product || !productDialog || !dialogContent) return;
  lastProductTrigger = trigger;
  const category = categoryById.get(product.category);
  const ingredients = Array.isArray(product.ingredients) ? product.ingredients : [];
  const badges = Array.isArray(product.badges) ? product.badges : [];
  const imagePath = product.image || "";
  let photo = null;
  if (imagePath) {
    photo = document.createElement("div");
    photo.className = "dialog-photo";
    const image = document.createElement("img");
    image.src = imagePath;
    image.alt = product.imageAlt || `Zdjęcie pozycji menu: ${product.name}.`;
    image.loading = "lazy";
    photo.append(image);
  }

  const info = document.createElement("div");
  info.className = "dialog-info";
  const kicker = document.createElement("p");
  kicker.className = "dialog-kicker";
  kicker.textContent = category?.label ? `MENU · ${category.label}` : "MENU PAPRYCZKI";
  info.append(kicker);
  if (badges.length) {
    const badgeRow = document.createElement("div");
    badgeRow.className = "badge-row";
    badges.forEach((badge) => {
      const chip = document.createElement("span");
      chip.className = `badge ${badge.includes("Nowość") ? "badge--new" : badge.includes("specjalna") ? "badge--special" : "badge--chef"}`;
      chip.textContent = badge;
      badgeRow.append(chip);
    });
    info.append(badgeRow);
  }
  const title = document.createElement("h2");
  title.id = "dialog-title";
  title.textContent = product.name;
  const description = document.createElement("p");
  description.textContent = product.description || "Szczegóły produktu do uzupełnienia przez klienta.";
  const price = createPriceElement(product.price);
  info.append(title, description, price);

  const availability = document.createElement("p");
  availability.className = "product-availability";
  availability.setAttribute("role", "status");
  if (product.available === false) {
    availability.classList.add("product-availability--unavailable");
    availability.textContent = "Chwilowo niedostępne";
  } else if (product.available === true) {
    availability.classList.add("product-availability--available");
    availability.textContent = "Dostępne";
  } else {
    availability.classList.add("product-availability--unknown");
    availability.textContent = "";
  }
  info.append(availability);

  const ingredientTitle = document.createElement("h3");
  ingredientTitle.textContent = "Skład";
  const ingredientList = document.createElement("ul");
  ingredientList.className = "dialog-ingredients";
  if (ingredients.length) {
    ingredients.forEach((ingredient) => {
      const item = document.createElement("li");
      item.textContent = ingredient;
      ingredientList.append(item);
    });
  } else {
    const item = document.createElement("li");
    item.textContent = "DO UZUPEŁNIENIA PRZEZ KLIENTA";
    ingredientList.append(item);
  }
  info.append(ingredientTitle, ingredientList);

  if (product.available !== false) {
    const order = document.createElement("button");
    order.className = "button button--primary";
    order.type = "button";
    order.textContent = "Zamów online ↗";
    order.addEventListener("click", () => {
      if (ORDER_URL) window.open(ORDER_URL, "_blank", "noopener,noreferrer");
    });
    info.append(order);
  }
  dialogContent.classList.toggle("dialog-content--text-only", !photo);
  dialogContent.replaceChildren(...(photo ? [photo, info] : [info]));
  productDialog.showModal();
}

document.querySelectorAll("[data-product-open]").forEach((button) => {
  button.addEventListener("click", () => openProduct(button.dataset.productOpen, button));
});
document.querySelectorAll("[data-product-close]").forEach((button) => button.addEventListener("click", () => productDialog?.close()));
productDialog?.addEventListener("click", (event) => {
  if (event.target === productDialog) productDialog.close();
});
productDialog?.addEventListener("close", () => lastProductTrigger?.focus());

// Pełnoekranowa galeria z obsługą strzałek i klawisza Escape.
const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightbox-image");
const lightboxCaption = document.getElementById("lightbox-caption");
const lightboxCount = document.getElementById("lightbox-count");
const galleryButtons = [...document.querySelectorAll("[data-gallery-index]")];
let activeGalleryIndex = 0;
let lastGalleryTrigger = null;

function renderLightbox() {
  if (!gallery.length || !lightboxImage) return;
  const item = gallery[activeGalleryIndex];
  lightboxImage.src = item.displaySrc || item.src;
  lightboxImage.alt = item.alt;
  if (lightboxCaption) lightboxCaption.textContent = item.caption;
  if (lightboxCount) lightboxCount.textContent = `${activeGalleryIndex + 1} / ${gallery.length}`;
}
function moveLightbox(step) {
  activeGalleryIndex = (activeGalleryIndex + step + gallery.length) % gallery.length;
  renderLightbox();
}
galleryButtons.forEach((button) => button.addEventListener("click", () => {
  activeGalleryIndex = Number(button.dataset.galleryIndex) || 0;
  lastGalleryTrigger = button;
  renderLightbox();
  lightbox?.showModal();
}));
document.querySelector("[data-lightbox-prev]")?.addEventListener("click", () => moveLightbox(-1));
document.querySelector("[data-lightbox-next]")?.addEventListener("click", () => moveLightbox(1));
document.querySelector("[data-lightbox-close]")?.addEventListener("click", () => lightbox?.close());
lightbox?.addEventListener("click", (event) => {
  if (event.target === lightbox) lightbox.close();
});
lightbox?.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") moveLightbox(-1);
  if (event.key === "ArrowRight") moveLightbox(1);
});
lightbox?.addEventListener("close", () => lastGalleryTrigger?.focus());

// Opinie: przewijanie kart z uwzględnieniem prefers-reduced-motion.
const reviewTrack = document.getElementById("reviews-track");
function scrollReviews(direction) {
  if (!reviewTrack) return;
  const card = reviewTrack.querySelector(".review-card");
  const distance = card ? card.getBoundingClientRect().width + 14 : 280;
  reviewTrack.scrollBy({ left: direction * distance, behavior: prefersReducedMotion ? "auto" : "smooth" });
}
document.querySelector("[data-review-prev]")?.addEventListener("click", () => scrollReviews(-1));
document.querySelector("[data-review-next]")?.addEventListener("click", () => scrollReviews(1));

const yearNode = document.getElementById("current-year");
if (yearNode) yearNode.textContent = String(new Date().getFullYear());

// Przyciski „Zamów online" (baner, nagłówek, stopka) otwierają zewnętrzny system zamówień.
document.querySelectorAll("[data-order-open], .nav-order, .site-footer button.button--primary").forEach((button) => {
  button.addEventListener("click", () => {
    if (ORDER_URL) window.open(ORDER_URL, "_blank", "noopener,noreferrer");
  });
});
