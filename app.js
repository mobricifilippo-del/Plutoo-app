/* ---------------------------------------------------------
   Plutoo — Gold Edition
   app.js (Parte 1/5)
   Core, i18n, helpers, gestione viste e lingua
   --------------------------------------------------------- */

// Stato globale (persistenze base incluse)
const state = {
  lang: "it",
  plus: localStorage.getItem("plutoo_plus") === "1",
  swipeCount: 0,
  selfieUnlocked: {},    // dogId -> expiry timestamp (24h)
  currentView: "home",
  currentDog: null,
  dogs: [],
  services: ["veterinari", "toelettature", "negozi", "parchi", "addestratori", "canili"],
};

// --------------------- I18N ---------------------
const i18n = {
  it: {
    "tab.nearby": "Vicino a te",
    "tab.love": "Amore",
    "tab.play": "Giochiamo insieme",
    "tab.plus": "Plus",
    "tab.filters": "Ricerca personalizzata",
    "tab.services": "Luoghi PET",

    "home.subtitle": "L’app etica che unisce proprietari di Dog per amicizie reali e accoppiamenti responsabili.",
    "home.enter": "ENTRA",

    "sponsor.fido": "Il gelato per i nostri amici a quattro zampe",
    "ethic.cta": "Non abbandonare mai i tuoi amici 🐾 (canili vicino a me)",

    "match.title": "È un match!",
    "match.goChat": "Vai in chat",

    "plus.title": "Plutoo Gold",
    "plus.copy": "Rimuove tutti gli annunci, sblocca i filtri Gold e le funzioni Premium.",
    "plus.price": "€39,90 / anno",
    "plus.buy": "Abbonati ora",
    "plus.f1": "Niente pubblicità, niente attese",
    "plus.f2": "Filtri Gold sbloccati",
    "plus.f3": "Accesso prioritario alle novità",

    "filters.breed": "Razza",
    "filters.breedPh": "Es. Labrador",
    "filters.age": "Età",
    "filters.weight": "Peso (kg)",
    "filters.height": "Altezza (cm)",
    "filters.sex": "Sesso",
    "filters.any": "Qualsiasi",
    "filters.male": "Maschio",
    "filters.female": "Femmina",
    "filters.distance": "Distanza (km)",
    "filters.goldTitle": "Filtri Gold",
    "filters.verified": "Badge verificato",
    "filters.mating": "Disponibilità accoppiamento",
    "filters.pedigree": "Genealogia",
    "filters.apply": "Applica",
    "filters.reset": "Reset",

    "chat.title": "Chat",
    "chat.placeholder": "Scrivi un messaggio…",
    "chat.send": "Invia",

    "likes.title": "Like ricevuti",
    "likes.hint": "3 gratis; per vedere altri, guarda un video premio.",
    "likes.unlock": "Sblocca altri like",

    "reward.title": "Video premio",
    "reward.text": "Guarda un breve video per continuare.",
    "reward.play": "Guarda ora",
    "reward.close": "Chiudi",

    "profile.unlockSelfie": "Guarda il selfie (video premio)",
    "auth.login": "Login",
    "auth.signup": "Registrati",
  },
  en: {
    "tab.nearby": "Nearby",
    "tab.love": "Love",
    "tab.play": "Let's Play",
    "tab.plus": "Plus",
    "tab.filters": "Advanced Search",
    "tab.services": "PET Places",

    "home.subtitle": "The ethical app connecting Dog owners for real friendships and responsible matches.",
    "home.enter": "ENTER",

    "sponsor.fido": "The ice cream for our four-legged friends",
    "ethic.cta": "Never abandon your friends 🐾 (shelters near me)",

    "match.title": "It’s a match!",
    "match.goChat": "Go to chat",

    "plus.title": "Plutoo Gold",
    "plus.copy": "Removes all ads, unlocks Gold filters and premium features.",
    "plus.price": "€39.90 / year",
    "plus.buy": "Subscribe now",
    "plus.f1": "No ads, no waits",
    "plus.f2": "Gold filters unlocked",
    "plus.f3": "Priority access to new features",

    "filters.breed": "Breed",
    "filters.breedPh": "e.g. Labrador",
    "filters.age": "Age",
    "filters.weight": "Weight (kg)",
    "filters.height": "Height (cm)",
    "filters.sex": "Sex",
    "filters.any": "Any",
    "filters.male": "Male",
    "filters.female": "Female",
    "filters.distance": "Distance (km)",
    "filters.goldTitle": "Gold Filters",
    "filters.verified": "Verified badge",
    "filters.mating": "Mating availability",
    "filters.pedigree": "Pedigree",
    "filters.apply": "Apply",
    "filters.reset": "Reset",

    "chat.title": "Chat",
    "chat.placeholder": "Write a message…",
    "chat.send": "Send",

    "likes.title": "Received Likes",
    "likes.hint": "3 free; watch a reward video to unlock more.",
    "likes.unlock": "Unlock more likes",

    "reward.title": "Reward video",
    "reward.text": "Watch a short video to continue.",
    "reward.play": "Watch now",
    "reward.close": "Close",

    "profile.unlockSelfie": "View selfie (reward video)",
    "auth.login": "Login",
    "auth.signup": "Sign up",
  },
};

// --------------------- Helpers ---------------------
const $  = (s, c=document) => c.querySelector(s);
const $$ = (s, c=document) => Array.from(c.querySelectorAll(s));

function show(view) {
  $$(".view").forEach(v => v.classList.remove("view-active"));
  const el = $("#view-" + view);
  if (el) el.classList.add("view-active");
  state.currentView = view;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function openDialog(id){ const el = $("#"+id); if (el) el.hidden = false; }
function closeDialog(id){ const el = $("#"+id); if (el) el.hidden = true; }

function escapeHTML(s){
  return s.replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  })[c]);
}

// --------------------- Lingua ---------------------
window.setLanguage = function(lang){
  if (!i18n[lang]) return;
  state.lang = lang;
  localStorage.setItem("plutoo_lang", lang);
  document.documentElement.lang = lang;

  // toggle pulsanti bandiere
  $$(".lang-btn").forEach(b => b.setAttribute("aria-pressed", b.dataset.lang === lang ? "true" : "false"));

  // testi
  $$("[data-i18n]").forEach(el => {
    const k = el.getAttribute("data-i18n");
    if (i18n[lang][k]) el.textContent = i18n[lang][k];
  });

  // placeholder
  $$("[data-i18n-ph]").forEach(el => {
    const k = el.getAttribute("data-i18n-ph");
    if (i18n[lang][k]) el.setAttribute("placeholder", i18n[lang][k]);
  });
};

// lingua iniziale
const savedLang = localStorage.getItem("plutoo_lang");
state.lang = savedLang ? savedLang : (navigator.language || "it").startsWith("en") ? "en" : "it";

document.addEventListener("DOMContentLoaded", () => {
  window.setLanguage(state.lang);
});

// --------------------- Stub sicuri (verranno estesi nelle parti successive) ---------------------
// Reward mock minimale per evitare errori prima di caricare la logica reale (Parte 2)
const Rewards = {
  show: async () => true
};

// Etic box → apre Maps (logica avanzata con reward nella Parte 2)
function openEthic(){
  const q = state.lang === "en" ? "animal shelters near me" : "canili vicino a me";
  openMaps(q);
}

// Apertura Google Maps (riusata in più punti)
function openMaps(query){
  window.open(`https://www.google.com/maps/search/${encodeURIComponent(query)}`, "_blank");
}

// --------------------- Routing / Pulsanti base ---------------------
document.addEventListener("DOMContentLoaded", () => {
  // HOME → ENTRA
  $("#btnEnter")?.addEventListener("click", () => show("nearby"));

  // Logo → HOME
  $("#navHome")?.addEventListener("click", () => show("home"));

  // Tabs principali
  $$(".tab").forEach(t => t.addEventListener("click", () => t.dataset.view && show(t.dataset.view)));

  // Switch lingua (🇮🇹/🇬🇧)
  $("#btn-lang-it")?.addEventListener("click", e => window.setLanguage("it"));
  $("#btn-lang-en")?.addEventListener("click", e => window.setLanguage("en"));

  // Etic box (tutti i punti della UI)
  $$("#btnEthic, #btnEthic2, #btnEthic3, #btnEthic4, #btnEthic5, #btnEthicGlobal")
    .forEach(b => b.addEventListener("click", openEthic));
});

// --------------------- Splash fail-safe (se app.js carica prima dell’inline) ---------------------
document.addEventListener("DOMContentLoaded", () => {
  const splash = $("#splash");
  const app = $("#app");
  // se lo script inline di index non è ancora partito, gestiamo noi:
  setTimeout(() => {
    if (splash && !splash.classList.contains("hide")) splash.classList.add("hide");
    if (app && app.classList.contains("hidden")) app.classList.remove("hidden");
  }, 1400);
});

// Log di servizio
console.log("%cPlutoo app core loaded (Part 1/5)", "color:gold;font-weight:bold;");
