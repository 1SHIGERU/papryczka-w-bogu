import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const readJSON = async (name) => JSON.parse(await readFile(path.join(root, "src/data", name), "utf8"));
const [site, menu, catering, galleryData] = await Promise.all([
  readJSON("site.json"), readJSON("menu.json"), readJSON("catering.json"), readJSON("gallery.json")
]);
const ORDER_URL = site.ORDER_URL;
if (!/^https:\/\//.test(ORDER_URL)) throw new Error("ORDER_URL musi zawierać zweryfikowany adres HTTPS zewnętrznego systemu zamówień.");
const template = await readFile(path.join(root, "src/layout.html"), "utf8");
const sectionKeys = ["hero", "offer", "menu", "imprezy", "about", "why", "catering", "urodziny", "warsztaty", "galeria", "opinie", "sala", "kontakt"];
const sections = Object.fromEntries(await Promise.all(sectionKeys.map(async (key) => [key, await readFile(path.join(root, `src/sections/${key}.html`), "utf8")])));
const output = path.join(root, "dist");

const esc = (value = "") => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
const jsonForHTML = (value) => JSON.stringify(value).replaceAll("<", "\\u003c").replaceAll(">", "\\u003e").replaceAll("&", "\\u0026");
const imageDimensions = {
  "/images/pizza-hero-640.webp": [640, 427], "/images/pizza-hero-1200.webp": [1200, 801],
  "/images/gallery-01-640.webp": [640, 288], "/images/gallery-01-1200.webp": [1200, 540],
  "/images/gallery-02-640.webp": [480, 640], "/images/gallery-02-1200.webp": [480, 640],
  "/images/gallery-03-640.webp": [640, 853], "/images/gallery-03-1200.webp": [720, 960],
  "/images/gallery-04-640.webp": [640, 1424], "/images/gallery-04-1200.webp": [899, 2000],
  "/images/gallery-05-640.webp": [640, 853], "/images/gallery-05-1200.webp": [720, 960],
  "/images/gallery-06-640.webp": [640, 288], "/images/gallery-06-1200.webp": [1200, 540]
};
const dimensionsFor = (url) => imageDimensions[url] || [1200, 800];
const srcsetFor = (url) => {
  const big = url || "/favicon.svg";
  const small = big.replace("-1200.webp", "-640.webp");
  const [smallWidth] = dimensionsFor(small);
  const [bigWidth] = dimensionsFor(big);
  return small !== big && smallWidth < bigWidth ? `${small} ${smallWidth}w, ${big} ${bigWidth}w` : `${big} ${bigWidth}w`;
};
const categoryPhotoCaptions = (category) => category.photoCaption || ``;
const offerCards = [
  {title:"Pizza", description:"Klasyczne i autorskie kompozycje.", href:"/menu#pizza", index:"01", image:"https://res.cloudinary.com/peakvbib/image/upload/v1790847509/WhatsApp_Image_2026-09-30_at_10.23.45_6.jpg", imageAlt:"Pizza z sosem i dodatkami sfotografowana na drewnianej desce.", photoNote:""},
  {title:"Obiady", description:"Dania obiadowe przygotowywane na miejscu.", href:"/menu#lunch", index:"02", image:"/images/gallery-02-1200.webp", imageAlt:"Danie obiadowe i miska zupy sfotografowane w restauracji.", photoNote:""},
  {title:"Fast Food", description:"Burgery, zapiekanki, frytki i nuggetsy.", href:"/menu#fastfood", index:"03", image:"https://res.cloudinary.com/peakvbib/image/upload/v1790850876/WhatsApp_Image_2026-09-30_at_10.23.45_7.jpg", imageAlt:"Autentyczne zdjęcie wnętrza restauracji, sali i lady z witryną.", photoNote:"", topic:"fastfood"},
  {title:"Sałatki", description:"Lżejsze propozycje ze świeżymi składnikami.", href:"/menu#salads", index:"04", image:"https://res.cloudinary.com/peakvbib/image/upload/v1790851781/468323684_17858004312300900_8240667284657994399_n.jpg", imageAlt:"Szaszłyk z dodatkami na talerzu oraz miska zupy z oficjalnej galerii.", photoNote:"", topic:"salads"},
  {title:"Catering", description:"Oferta dla większej liczby osób.", href:"/catering", index:"05", image:"https://res.cloudinary.com/peakvbib/image/upload/v1790847509/WhatsApp_Image_2026-09-30_at_10.23.45_1.jpg", imageAlt:"Szaszłyk i miska kremowej zupy sfotografowane w restauracji.", photoNote:""},
  {title:"Imprezy okolicznościowe", description:"Urodziny, chrzciny, roczki, wesela i stypy.", href:"/imprezy", index:"06", image:"https://res.cloudinary.com/peakvbib/image/upload/v1790847516/WhatsApp_Image_2026-09-30_at_10.42.53.jpg", imageAlt:"Wnętrze restauracji przygotowane na spotkanie gości.", photoNote:""},
  {title:"Urodziny dla dzieci", description:"Animacje, pizza i warsztaty robienia własnej pizzy.", href:"/urodziny", index:"07", image:"https://res.cloudinary.com/peakvbib/image/upload/v1790851931/492512827_1307835494263917_5560112203056928154_n.jpg", imageAlt:"Małe słodkie wypieki z owocami z oficjalnej galerii restauracji.", photoNote:""},
  {title:"Warsztaty z pizzy", description:"Od ciasta do pieca — wspólnie wypiekamy własną pizzę.", href:"/warsztaty", index:"08", image:"https://res.cloudinary.com/peakvbib/image/upload/v1790847517/WhatsApp_Image_2026-09-30_at_10.42.55_2.jpg", imageAlt:"Pizza przygotowana podczas warsztatów z pizzy w Papryczce.", photoNote:""}
];


const sliderImages = {
  birthday: [
    "https://res.cloudinary.com/peakvbib/image/upload/v1790847518/WhatsApp_Image_2026-09-30_at_10.42.55_4.jpg",
    "https://res.cloudinary.com/peakvbib/image/upload/v1790847517/WhatsApp_Image_2026-09-30_at_10.42.54.jpg",
    "https://res.cloudinary.com/peakvbib/image/upload/v1790847515/WhatsApp_Image_2026-09-30_at_10.40.50_1.jpg"
  ],
  workshops: [
    "https://res.cloudinary.com/peakvbib/image/upload/v1790886819/warsztat.jpg",
    "https://res.cloudinary.com/peakvbib/image/upload/v1790847510/WhatsApp_Image_2026-09-30_at_10.29.21.jpg",
    "https://res.cloudinary.com/peakvbib/image/upload/v1790847517/WhatsApp_Image_2026-09-30_at_10.42.55_2.jpg",
    "https://res.cloudinary.com/peakvbib/image/upload/v1790886819/warsztat.jpg"
  ]
};
function photoMarkup(src, alt, sizes = "(max-width: 600px) 90vw, (max-width: 900px) 45vw, 30vw", loading = "lazy") {
  const url = esc(src || "/favicon.svg");
  const srcset = esc(srcsetFor(src));
  const [width, height] = dimensionsFor(src);
  return `<img src="${url}" srcset="${srcset}" sizes="${esc(sizes)}" alt="${esc(alt)}" width="${width}" height="${height}" loading="${loading}" decoding="async">`;
}
function renderOfferCard(card) {
  const photo = card.image ? `<span class="offer-card__photo-note">${esc(card.photoNote)}</span>${photoMarkup(card.image, card.imageAlt, "(max-width: 600px) 90vw, 32vw")}` : "";
  return `<a class="offer-card" data-visual="${card.image ? "photo" : "brand"}" data-topic="${esc(card.topic || "")}" href="${esc(card.href)}" aria-label="${esc(card.title)} — zobacz więcej"><span class="offer-card__arrow" aria-hidden="true">↗</span>${photo}<span class="offer-card__content"><span class="offer-card__index">${card.index} </span><h3>${esc(card.title)}</h3><p>${esc(card.description)}</p></span></a>`;
}
function badgeClass(text) {
  if (text.includes("Nowość")) return "badge--new";
  if (text.includes("specjalna")) return "badge--special";
  return "badge--chef";
}
function renderPrice(price) {
  const match = String(price).match(/^32 cm: (.+?) · 45 cm: (.+)$/);
  if (!match) return `<span class="product-price">${esc(price)}</span>`;
  return `<div class="product-prices"><span class="product-price"><small>32 cm</small><strong>${esc(match[1])}</strong></span><span class="product-price"><small>45 cm</small><strong>${esc(match[2])}</strong></span></div>`;
}
function renderProduct(product, category) {
  const badgeHTML = (product.badges || []).length
    ? `<div class="badge-row">${product.badges.map((badge) => `<span class="badge ${badgeClass(badge)}">${esc(badge)}</span>`).join("")}</div>` : "";
  const ingredients = (product.ingredients || []).length
    ? `<p class="product-card__ingredients"><span>Składniki:</span> ${product.ingredients.map(esc).join(" · ")}</p>`
    : `<p class="product-card__ingredients product-card__ingredients--todo">`;
  const photo = product.image ? `<figure class="product-card__media">${photoMarkup(product.image, product.imageAlt || `Zdjęcie pozycji menu: ${product.name}.`, "(max-width: 600px) 108px, 26vw")}<figcaption>${esc(product.imageCaption || "Zdjęcie konkretnej pozycji menu")}</figcaption></figure>` : "";
  const availability = product.available === false
    ? `<span class="product-order product-order--unavailable" role="status">Chwilowo niedostępne</span>` : "";
  const detailAction = product.category === "drinks"
    ? ""
    : `<button class="product-detail" type="button" data-product-open="${esc(product.id)}" aria-label="Szczegóły: ${esc(product.name)}">Szczegóły</button>`;
  return `<article class="product-card" data-product-id="${esc(product.id)}" data-category="${esc(product.category)}">
    ${photo}
    <div class="product-card__body">${badgeHTML}<h4>${esc(product.name)}</h4><p class="product-card__description">${esc(product.description)}</p>${ingredients}<div class="product-card__footer">${renderPrice(product.price)}<div class="product-actions">${detailAction}${availability}</div></div></div>
  </article>`;
}
function renderPanel(category) {
  const products = menu.products.filter((product) => product.category === category.id);
  const plural = products.length === 1 ? "pozycja" : "pozycji";
  const photo = category.photo ? `<div class="category-cover">${photoMarkup(category.photo, category.photoAlt, "(max-width: 600px) 90vw, 100vw")}<div><span class="eyebrow">${esc(category.photoSource || "")}</span><p>${esc(categoryPhotoCaptions(category))}</p></div></div>` : "";
  return `<section class="menu-panel" id="panel-${esc(category.id)}" role="tabpanel" aria-labelledby="tab-${esc(category.id)}" data-category-panel="${esc(category.id)}">
    <div class="menu-panel__heading"><div><h3>${esc(category.label)}</h3><p>${esc(category.description)}</p></div><span class="menu-panel__count">${products.length} ${plural}</span></div>
    ${photo}
    <div class="product-grid">${products.map((product) => renderProduct(product, category)).join("")}<p class="no-results" data-empty-state hidden>Nie znaleźliśmy takiej pozycji w tej kategorii.</p></div>
  </section>`;
}
function renderCateringCard(pack, index) {
  return `<article class="catering-card"><div class="catering-card__top"><div><p>Pakiet ${String(index + 1).padStart(2, "0")}</p><h3>${esc(pack.guests)}</h3></div><strong>${esc(pack.price)}</strong></div><ul>${pack.items.map((item) => `<li>${esc(item)}</li>`).join("")}</ul></article>`;
}
function renderGallery(item, index) {
  const src = item.src || `/images/${item.file}`;
  const thumb = item.thumbnail || (item.src ? src : src.replace("-1200.webp", "-640.webp"));
  const [width, height] = dimensionsFor(src);
  return `<button class="gallery-item" type="button" data-gallery-index="${index}" aria-label="Powiększ zdjęcie: ${esc(item.caption)}"><img src="${thumb}" srcset="${srcsetFor(src)}" sizes="(max-width: 600px) 47vw, 32vw" alt="${esc(item.alt)}" width="${width}" height="${height}" loading="lazy" decoding="async"><span>${esc(item.caption)}</span></button>`;
}
function renderReview(review) {
  return `<article class="review-card"><span class="review-quote-mark" aria-hidden="true">“</span><blockquote>${esc(review)}</blockquote><span class="review-source">Opinia klienta pobrana z Google Maps</span></article>`;
}

// Pierwszy slajd jest ładowany od razu, kolejne dopiero wtedy, gdy przeglądarka ma wolne zasoby.
// Zdjęcia do tego slidera klient podmienia w src/data/site.json → heroSlides.
const heroSlides = Array.isArray(site.heroSlides) && site.heroSlides.length
  ? site.heroSlides.slice(0, 4)
  : [{ src: "/images/pizza-hero-1200.webp", alt: "Pizza z dodatkami.", position: "center" }];
const heroSlidesHTML = heroSlides.map((slide, index) => `<figure class="hero-slide${index === 0 ? " is-active" : ""}" data-hero-slide aria-hidden="${index === 0 ? "false" : "true"}"><img src="${esc(slide.src)}" alt="${esc(slide.alt || "Zdjęcie restauracji Papryczka w Bogu.")}" style="object-position:${esc(slide.position || "center")}" width="1200" height="800" ${index === 0 ? "fetchpriority=\"high\"" : "loading=\"lazy\""}></figure>`).join("");
const heroDotsHTML = heroSlides.map((_, index) => `<button type="button" data-hero-dot="${index}" aria-label="Pokaż zdjęcie ${index + 1}" aria-current="${index === 0 ? "true" : "false"}"></button>`).join("");
const tabs = menu.categories.map((category, index) => `<button class="menu-tab" id="tab-${esc(category.id)}" type="button" role="tab" data-category-tab="${esc(category.id)}" aria-controls="panel-${esc(category.id)}" aria-selected="${index === 0 ? "true" : "false"}" tabindex="${index === 0 ? "0" : "-1"}">${esc(category.label)}</button>`).join("");
const panels = menu.categories.map(renderPanel).join("");
const birthdayFeatures = catering.birthday.features.map((feature) => `<li>${esc(feature)}</li>`).join("");
const cateringCards = catering.packages.map(renderCateringCard).join("");
const galleryItems = galleryData.gallery.map(renderGallery).join("");
const reviewCards = galleryData.reviews.map(renderReview).join("");
const cateringSalads = catering.salads.map((salad) => `<span>${esc(salad)}</span>`).join("");
const offerCardsHTML = offerCards.map(renderOfferCard).join("");
const galleryForApp = galleryData.gallery.map((item) => ({
  src: item.thumbnail || (item.src ? item.src : `/images/${item.file.replace("-1200.webp", "-640.webp")}`),
  displaySrc: item.src || `/images/${item.file}`,
  alt: item.alt,
  caption: item.caption
}));
const seoTitle = "Papryczka w Bogu | Pizza i obiady w Rybniku";
const description = "Pizza, obiady i więcej w Papryczce w Bogu w Rybniku. Poznaj menu, zamów online, sprawdź catering, urodziny dla dzieci i godziny otwarcia.";
const canonicalLink = site.canonicalUrl ? `<link rel="canonical" href="${esc(site.canonicalUrl)}">` : "";
const ogUrl = site.canonicalUrl ? `<meta property="og:url" content="${esc(site.canonicalUrl)}">` : "";
const ogImage = "https://restaumatic-production.imgix.net/uploads/accounts/184499/media_library/30320389-c547-474f-8184-986b4c100a29.jpg?auto=compress%2Cformat&fit=max&w=1200";
const address = site.address;
const structuredData = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  "name": site.name,
  "telephone": site.phoneHref,
  "email": site.email,
  "address": {
    "@type": "PostalAddress",
    "streetAddress": address.streetAddress,
    "postalCode": address.postalCode,
    "addressLocality": address.addressLocality,
    "addressCountry": address.addressCountry
  },
  "openingHoursSpecification": [
    { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday"], opens: "12:00", closes: "20:00" },
    { "@type": "OpeningHoursSpecification", dayOfWeek: ["Friday", "Saturday", "Sunday"], opens: "12:00", closes: "21:00" }
  ],
  "hasMap": site.googleMapsLink,
  "hasMenu": ORDER_URL,
  "acceptsReservations": "By phone",
  "sameAs": [site.facebookUrl]
};

const replacements = {
  "%%SEO_TITLE%%": esc(seoTitle),
  "%%META_DESCRIPTION%%": esc(description),
  "%%CANONICAL_LINK%%": canonicalLink,
  "%%OG_URL%%": ogUrl,
  "%%OG_IMAGE%%": esc(ogImage),
  "%%STRUCTURED_DATA%%": "",
  "%%STRUCTURED_DATA_BODY%%": jsonForHTML(structuredData),
  "%%ORDER_URL%%": esc(ORDER_URL),
  "%%PHONE_HREF%%": `tel:${esc(site.phoneHref)}`,
  "%%PHONE_DISPLAY%%": esc(site.phone),
  "%%BIRTHDAY_HREF%%": `tel:${esc(site.birthdayPhoneHref)}`,
  "%%BIRTHDAY_PHONE_DISPLAY%%": esc(site.birthdayPhone),
  "%%EVENT_PHONE_HREF%%": `tel:${esc(site.eventPhoneHref)}`,
  "%%EVENT_PHONE_DISPLAY%%": esc(site.eventPhone),
  "%%MAP_LINK%%": esc(site.googleMapsLink),
  "%%MAP_EMBED_URL%%": esc(site.googleMapsEmbedUrl),
  "%%HERO_SLIDES%%": heroSlidesHTML,
  "%%HERO_DOTS%%": heroDotsHTML,
  "%%HERO_SLIDES_TOTAL%%": String(heroSlides.length).padStart(2, "0"),
  "%%OFFER_CARDS%%": offerCardsHTML,
  "%%MENU_TABS%%": tabs,
  "%%MENU_PANELS%%": panels,
  "%%CATERING_CARDS%%": cateringCards,
  "%%CATERING_SALADS%%": cateringSalads,
  "%%BIRTHDAY_FEATURES%%": birthdayFeatures,
  "%%GALLERY_ITEMS%%": galleryItems,
  "%%BIRTHDAY_SLIDE_1%%": esc(sliderImages.birthday[0]),
  "%%BIRTHDAY_SLIDE_2%%": esc(sliderImages.birthday[1]),
  "%%BIRTHDAY_SLIDE_3%%": esc(sliderImages.birthday[2]),
  "%%WORKSHOP_SLIDE_1%%": esc(sliderImages.workshops[0]),
  "%%WORKSHOP_SLIDE_2%%": esc(sliderImages.workshops[1]),
  "%%WORKSHOP_SLIDE_3%%": esc(sliderImages.workshops[2]),
  "%%REVIEW_CARDS%%": reviewCards,
  "%%SITE_JSON%%": jsonForHTML(site),
  "%%MENU_JSON%%": jsonForHTML(menu),
  "%%GALLERY_JSON%%": jsonForHTML({ gallery: galleryForApp })
};
const navItems = [
  { slug: "menu", label: "Menu" },
  { slug: "imprezy", label: "Imprezy okolicznościowe" },
  { slug: "catering", label: "Catering" },
  { slug: "urodziny", label: "Urodziny dla dzieci" },
  { slug: "warsztaty", label: "Warsztaty pizzy" },
  { slug: "sala", label: "Wynajem sali" },
  { slug: "kontakt", label: "Kontakt" }
];
const navHTML = (currentSlug) => navItems.map((item) => `<a href="/${item.slug}"${item.slug === currentSlug ? ` aria-current="page"` : ""}>${esc(item.label)}</a>`).join("\n        ");

// Strona główna pokazuje tylko cztery wskazane przez klienta sekcje; reszta trafia na podstrony.
const pages = [
  { slug: "", label: "", title: seoTitle, description, sections: ["hero", "about", "offer", "galeria", "opinie"] },
  { slug: "menu", label: "Menu", title: `Menu | ${site.name}`, description: "Menu Papryczki w Bogu w Rybniku: pizza, obiady, fast food i sałatki. Poznaj skład i ceny, a potem zamów online.", sections: ["menu"] },
  { slug: "imprezy", label: "Imprezy okolicznościowe", title: `Imprezy okolicznościowe | ${site.name}`, description: "Urodziny, chrzciny, roczki, wesela i stypy — zorganizuj imprezę okolicznościową w Papryczce w Bogu w Rybniku.", sections: ["imprezy"] },
  { slug: "catering", label: "Catering", title: `Catering | ${site.name}`, description: "Catering na spotkania, imprezy i uroczystości w Rybniku. Poznaj pakiety i sałatki do wyboru w Papryczce w Bogu.", sections: ["catering"] },
  { slug: "urodziny", label: "Urodziny dla dzieci", title: `Urodziny dla dzieci | ${site.name}`, description: "Urodziny dla dzieci w Papryczce w Bogu: własnoręcznie robiona pizza, animator i zabawa w Rybniku.", sections: ["urodziny"] },
  { slug: "warsztaty", label: "Warsztaty pizzy", title: `Warsztaty z pizzy | ${site.name}`, description: "Warsztaty pizzy w Papryczce w Bogu: od ciasta do pieca. Sprawdź, jak wyglądają zajęcia w Rybniku.", sections: ["warsztaty"] },
  { slug: "sala", label: "Wynajem sali", title: `Wynajem sali | ${site.name}`, description: "Wynajem sali w Papryczce w Bogu w Rybniku na rodzinne spotkania i wieczory ze znajomymi. Zapytaj o termin.", sections: ["sala"] },
  { slug: "kontakt", label: "Kontakt", title: `Kontakt | ${site.name}`, description: "Kontakt z Papryczką w Bogu w Rybniku: adres, telefon, godziny otwarcia i mapa dojazdu do restauracji.", sections: ["kontakt", "why"] }
];

const breadcrumbsHTML = (label) => `<div class="wrap breadcrumbs-bar"><nav class="breadcrumbs" aria-label="Okruszki nawigacyjne"><a href="/">Strona główna</a><span aria-hidden="true">/</span><span aria-current="page">${esc(label)}</span></nav><h1 class="sr-only">${esc(label)} | Papryczka w Bogu</h1></div>`;

await rm(output, { recursive: true, force: true });
await mkdir(path.join(output, "assets"), { recursive: true });

for (const page of pages) {
  const content = page.sections.map((key) => sections[key].trim()).join("\n\n");
  const main = page.slug ? `${breadcrumbsHTML(page.label)}\n${content}` : content;
  const pageReplacements = {
    ...replacements,
    "%%SEO_TITLE%%": esc(page.title),
    "%%META_DESCRIPTION%%": esc(page.description),
    "%%NAV_ITEMS%%": navHTML(page.slug),
    "%%MAIN%%": main
  };
  // Treść wstawiamy przed pętlą, żeby znaczniki z sekcji też zostały rozwiązane.
  let html = template.replaceAll("%%MAIN%%", main);
  for (const [token, value] of Object.entries(pageReplacements)) html = html.replaceAll(token, value);
  html = html.replaceAll("papryczkawbogu@gmail.com", esc(site.email));
  html = html.replaceAll("https://www.facebook.com/profile.php?id=100051124369968", esc(site.facebookUrl));
  if (html.match(/%%[A-Z_]+%%/)) throw new Error(`Nierozwiązany znacznik szablonu (/${page.slug}): ${html.match(/%%[A-Z_]+%%/)?.[0]}`);
  const target = page.slug ? path.join(output, page.slug, "index.html") : path.join(output, "index.html");
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, html, "utf8");
}

// Awaryjna strona dla hostingu statycznego: nieznany adres wraca na stronę główną.
await writeFile(path.join(output, "404.html"), `<!doctype html><html lang="pl"><head><meta charset="utf-8"><meta name="robots" content="noindex"><meta http-equiv="refresh" content="0; url=/"><title>${esc(site.name)}</title></head><body><p><a href="/">Przejdź na stronę główną</a></p><script>location.replace("/")</script></body></html>\n`, "utf8");

await cp(path.join(root, "src/css/styles.css"), path.join(output, "assets/styles.css"));
await cp(path.join(root, "src/js/main.js"), path.join(output, "assets/main.js"));
await cp(path.join(root, "public"), output, { recursive: true, force: true });
console.log(`Zbudowano ${pages.length} stron (${pages.map((page) => `/${page.slug}`).join(", ")}); ${menu.products.length} produktów, ${menu.categories.length} kategorii, ${galleryData.gallery.length} zdjęć.`);
