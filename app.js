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
/* ---------------------------------------------------------
   Plutoo — Gold Edition
   app.js (Parte 2/5)
   Rewards mock, sponsor, luoghi PET, griglia Dog, profilo
   --------------------------------------------------------- */

// --------------------- Reward system mock ---------------------
const Rewards = {
  show: async (reason = "") => {
    if (state.plus) return true; // Plus: niente ads
    return new Promise(resolve => {
      openDialog("rewardDialog");
      $("#rewardPlay").onclick = () => {
        $("#rewardDialog").hidden = true;
        setTimeout(() => resolve(true), 800);
      };
      $("#rewardClose").onclick = () => {
        $("#rewardDialog").hidden = true;
        resolve(false);
      };
    });
  }
};

// --------------------- Sponsor + Etica ---------------------
$("#sponsorFido")?.addEventListener("click", async () => {
  if (await Rewards.show("sponsor")) openMaps("Fido il gelato per cani");
});
$("#sponsorFido2")?.addEventListener("click", async () => {
  if (await Rewards.show("sponsor")) openMaps("Fido il gelato per cani");
});
$("#btnEthic, #btnEthic2, #btnEthic3, #btnEthic4")?.forEach?.(b => {
  b.addEventListener("click", async () => {
    if (await Rewards.show("ethic")) openEthic();
  });
});

// --------------------- Luoghi PET ---------------------
$$(".dropdown-item").forEach(btn => {
  btn.addEventListener("click", async e => {
    const type = e.target.dataset.service;
    if (await Rewards.show("service")) {
      const q = state.lang === "en"
        ? (type === "canili" ? "animal shelters near me" : `${type} for dogs near me`)
        : `${type} vicino a me`;
      openMaps(q);
    }
  });
});

// --------------------- Dataset cani mock ---------------------
const dogSamples = [
  { id: 1, name: "Luna", breed: "Labrador", age: 3, sex: "female", img: "dog1.jpg", verified: true },
  { id: 2, name: "Rocky", breed: "Bulldog", age: 4, sex: "male", img: "dog2.jpg", verified: false },
  { id: 3, name: "Milo", breed: "Golden Retriever", age: 2, sex: "male", img: "dog3.jpg", verified: true },
  { id: 4, name: "Bella", breed: "Barboncino", age: 1, sex: "female", img: "dog4.jpg", verified: false },
];
state.dogs = dogSamples;

// --------------------- Griglia “Vicino a te” ---------------------
function renderNearby() {
  const grid = $("#nearbyGrid");
  if (!grid) return;
  grid.innerHTML = "";
  state.dogs.forEach(dog => {
    const card = document.createElement("div");
    card.className = "card frame-gold";
    card.innerHTML = `
      <div class="card-photo"><img src="${dog.img}" alt="${dog.name}" /></div>
      <div class="card-info small">
        <div><strong>${escapeHTML(dog.name)}</strong>, ${dog.age}</div>
        <div>${escapeHTML(dog.breed)}</div>
      </div>`;
    card.addEventListener("click", () => openProfile(dog.id));
    grid.appendChild(card);
  });
}
document.addEventListener("DOMContentLoaded", renderNearby);

// --------------------- Profilo Dog ---------------------
function openProfile(id) {
  const d = state.dogs.find(x => x.id === id);
  if (!d) return;
  state.currentDog = d;
  $("#profileMainPhoto").innerHTML = `<img src="${d.img}" alt="${d.name}" />`;
  $("#profileName").textContent = d.name;
  $("#profileInfo").textContent = `${d.breed}, ${d.age} anni`;
  $("#badgeVerified").hidden = !d.verified;
  $("#profilePage").hidden = false;
}
$("#btnCloseProfile")?.addEventListener("click", () => { $("#profilePage").hidden = true; });

console.log("%cPlutoo logic loaded (Part 2/5)", "color:gold;font-weight:bold;");
/* ---------------------------------------------------------
   Plutoo — Gold Edition
   app.js (Parte 3/5)
   Swipe, Match, Reward swipe logic
   --------------------------------------------------------- */

// --------------------- Swipe setup ---------------------
const swipeCard = $("#swipeCard");
let currentIndex = 0;

function renderSwipeCard() {
  if (!swipeCard) return;
  const dog = state.dogs[currentIndex % state.dogs.length];
  swipeCard.innerHTML = `
    <div class="card-solo frame-gold">
      <img src="${dog.img}" alt="${dog.name}" class="swipe-photo" />
      <div class="swipe-info">
        <div><strong>${dog.name}</strong>, ${dog.age}</div>
        <div>${dog.breed}</div>
      </div>
    </div>
  `;
  state.currentDog = dog;
}

function nextDog(liked) {
  if (liked) {
    state.swipeCount++;
    if (state.swipeCount === 10 || (state.swipeCount > 10 && (state.swipeCount - 10) % 5 === 0)) {
      Rewards.show("swipe");
    }
    if (Math.random() < 0.5) showMatchPopup(state.currentDog);
  }
  currentIndex++;
  renderSwipeCard();
}

// --------------------- Match popup ---------------------
function showMatchPopup(dog) {
  const pop = $("#matchPopup");
  const heart = $(".match-heart", pop);
  pop.hidden = false;
  heart.animate([
    { transform: "scale(0)", opacity: 0 },
    { transform: "scale(1.4)", opacity: 1, offset: 0.5 },
    { transform: "scale(1)", opacity: 1 }
  ], { duration: 900, easing: "ease-out" });

  setTimeout(() => {
    pop.hidden = true;
    Rewards.show("match");
  }, 2000);
}

$("#btnLike")?.addEventListener("click", () => nextDog(true));
$("#btnDislike")?.addEventListener("click", () => nextDog(false));

document.addEventListener("DOMContentLoaded", renderSwipeCard);

console.log("%cSwipe system loaded (Part 3/5)", "color:gold;font-weight:bold;");
/* ---------------------------------------------------------
   Plutoo — Gold Edition
   app.js (Parte 4/5)
   Chat, Selfie, Likes
   --------------------------------------------------------- */

// --------------------- Chat ---------------------
const chatPage = $("#chatPage");
const chatMessages = $("#chatMessages");
const chatForm = $("#chatForm");
const chatText = $("#chatText");

function openChat(dog) {
  $("#chatTitle").textContent = `Chat con ${dog.name}`;
  chatMessages.innerHTML = "";
  chatPage.hidden = false;
}
$("#btnGoChat")?.addEventListener("click", () => {
  if (state.currentDog) openChat(state.currentDog);
});

$("#btnCloseChat")?.addEventListener("click", () => { chatPage.hidden = true; });

chatForm?.addEventListener("submit", async e => {
  e.preventDefault();
  const msg = chatText.value.trim();
  if (!msg) return;

  // reward solo al primo messaggio
  if (!localStorage.getItem("chat_reward_done") && !state.plus) {
    const ok = await Rewards.show("chat");
    if (!ok) return;
    localStorage.setItem("chat_reward_done", "1");
  }

  appendMessage(msg, true);
  chatText.value = "";
  setTimeout(() => appendMessage("🐾 Bau!", false), 1000);
});

function appendMessage(txt, me = false) {
  const div = document.createElement("div");
  div.className = "msg" + (me ? " me" : "");
  div.textContent = txt;
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// --------------------- Selfie ---------------------
const selfieBlur = $("#selfieBlur");
if (selfieBlur) {
  selfieBlur.addEventListener("click", async () => {
    const dog = state.currentDog;
    if (!dog) return;
    const ok = await Rewards.show("selfie");
    if (ok) {
      selfieBlur.style.display = "none";
      state.selfieUnlocked[dog.id] = Date.now() + 24 * 60 * 60 * 1000;
      localStorage.setItem("selfieUnlocked", JSON.stringify(state.selfieUnlocked));
    }
  });
}

// --------------------- Likes ricevuti ---------------------
const likesList = $("#likesList");
const btnUnlockMoreLikes = $("#btnUnlockMoreLikes");
const likesPage = $("#likesPage");
let visibleLikes = 3;

function openLikes() {
  likesList.innerHTML = "";
  for (let i = 0; i < visibleLikes; i++) {
    const d = state.dogs[i % state.dogs.length];
    const el = document.createElement("div");
    el.className = "card frame-gold";
    el.innerHTML = `<div class="card-photo"><img src="${d.img}" alt="${d.name}" /></div><div class="card-info small">${d.name}</div>`;
    likesList.appendChild(el);
  }
  likesPage.hidden = false;
}
$("#btnUnlockMoreLikes")?.addEventListener("click", async () => {
  if (await Rewards.show("likes")) {
    visibleLikes += 3;
    openLikes();
  }
});
$("#btnCloseLikes")?.addEventListener("click", () => likesPage.hidden = true);

console.log("%cChat, Selfie & Likes loaded (Part 4/5)", "color:gold;font-weight:bold;");
/* ---------------------------------------------------------
   Plutoo — Gold Edition
   app.js (Parte 5/5)
   Plus, Filtri, i18n live, salvataggi
   --------------------------------------------------------- */

// --------------------- Plus (mock) ---------------------
const btnBuyPlus = $("#btnBuyPlus");
btnBuyPlus?.addEventListener("click", () => {
  if (confirm(state.lang === "en"
      ? "Activate Plutoo Gold and remove all ads?"
      : "Attivare Plutoo Gold e rimuovere tutte le pubblicità?")) {
    state.plus = true;
    localStorage.setItem("plutoo_plus", "1");
    alert(state.lang === "en"
      ? "Plutoo Gold activated! Enjoy your premium features."
      : "Plutoo Gold attivato! Tutte le funzioni Premium sbloccate.");
  }
});

// --------------------- Filtri personalizzati ---------------------
const breeds = [
  "Labrador", "Golden Retriever", "Barboncino", "Bulldog", "Beagle", "Chihuahua",
  "Pastore Tedesco", "Jack Russell", "Cocker Spaniel", "Carlino", "Maltese", "Border Collie",
  "Husky", "Bassotto", "Dalmata", "Pitbull", "Shiba Inu", "Rottweiler", "Terranova", "Samoyed"
].sort();

const breedInput = $("#breed");
const breedSuggest = $("#breedSuggest");

breedInput?.addEventListener("input", () => {
  const q = breedInput.value.trim().toLowerCase();
  if (!q) { breedSuggest.innerHTML = ""; breedSuggest.classList.remove("show"); return; }
  const matches = breeds.filter(b => b.toLowerCase().startsWith(q));
  if (!matches.length) { breedSuggest.innerHTML = ""; breedSuggest.classList.remove("show"); return; }
  breedSuggest.innerHTML = matches.map(b => `<button class="sugg">${b}</button>`).join("");
  breedSuggest.classList.add("show");
});

breedSuggest?.addEventListener("click", e => {
  if (e.target.classList.contains("sugg")) {
    breedInput.value = e.target.textContent;
    breedSuggest.classList.remove("show");
  }
});

// Applica filtri
$("#filtersForm")?.addEventListener("submit", e => {
  e.preventDefault();
  const breed = $("#breed").value.trim().toLowerCase();
  const sex = $("#sex").value;
  const verified = $("#verified").checked;
  let filtered = state.dogs;
  if (breed) filtered = filtered.filter(d => d.breed.toLowerCase().startsWith(breed));
  if (sex) filtered = filtered.filter(d => d.sex === sex);
  if (verified) filtered = filtered.filter(d => d.verified);
  const grid = $("#nearbyGrid");
  grid.innerHTML = "";
  filtered.forEach(d => {
    const card = document.createElement("div");
    card.className = "card frame-gold";
    card.innerHTML = `<div class="card-photo"><img src="${d.img}" alt="${d.name}" /></div>
                      <div class="card-info small"><div><strong>${d.name}</strong>, ${d.age}</div><div>${d.breed}</div></div>`;
    card.addEventListener("click", () => openProfile(d.id));
    grid.appendChild(card);
  });
  show("nearby");
});

// Reset filtri
$("#filtersForm")?.addEventListener("reset", renderNearby);

// --------------------- Lingua live (cambio bandiera) ---------------------
$$(".lang-btn").forEach(btn => {
  btn.addEventListener("click", e => {
    const lang = e.currentTarget.dataset.lang;
    window.setLanguage(lang);
  });
});

// --------------------- Salvataggi selfie ---------------------
try {
  const savedSelfie = localStorage.getItem("selfieUnlocked");
  if (savedSelfie) state.selfieUnlocked = JSON.parse(savedSelfie);
} catch(e){ console.warn("Selfie storage parse error"); }

// --------------------- Final log ---------------------
console.log("%cPlutoo Gold Edition fully loaded ✅", "color:gold;font-weight:bold;font-size:14px;");
