/* ---------------------------------------------------------
   Plutoo — Gold Edition
   APP.JS (Parte 1/4)
   Core iniziale, traduzioni, gestione viste, helpers
   --------------------------------------------------------- */

// Global state
const state = {
  lang: "it",
  plus: localStorage.getItem("plutoo_plus") === "1",
  swipeCount: 0,
  selfieUnlocked: {},
  verifiedDogs: {},
  currentView: "home",
  currentDog: null,
  dogs: [],
  services: ["veterinari", "toelettature", "negozi", "parchi", "addestratori", "canili"],
};

// --------------------- Traduzioni ---------------------
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
  },
};

// --------------------- Helpers ---------------------
function $(sel, ctx = document) {
  return ctx.querySelector(sel);
}
function $$(sel, ctx = document) {
  return Array.from(ctx.querySelectorAll(sel));
}
function show(id) {
  $$(".view").forEach(v => v.classList.remove("view-active"));
  const el = document.getElementById("view-" + id);
  if (el) el.classList.add("view-active");
  state.currentView = id;
  window.scrollTo({ top: 0, behavior: "smooth" });
}
function openDialog(id) {
  const el = document.getElementById(id);
  if (el) el.hidden = false;
}
function closeDialog(id) {
  const el = document.getElementById(id);
  if (el) el.hidden = true;
}

// Traduzione dinamica
window.setLanguage = function (lang) {
  if (!i18n[lang]) return;
  state.lang = lang;
  document.documentElement.lang = lang;
  localStorage.setItem("plutoo_lang", lang);
  $$(".lang-btn").forEach(b => {
    b.setAttribute("aria-pressed", b.dataset.lang === lang ? "true" : "false");
  });
  $$("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (i18n[lang][key]) el.textContent = i18n[lang][key];
  });
  $$("[data-i18n-ph]").forEach(el => {
    const key = el.getAttribute("data-i18n-ph");
    if (i18n[lang][key]) el.setAttribute("placeholder", i18n[lang][key]);
  });
};

// Auto language detect
const savedLang = localStorage.getItem("plutoo_lang");
if (savedLang) state.lang = savedLang;
else state.lang = navigator.language.startsWith("en") ? "en" : "it";
window.addEventListener("DOMContentLoaded", () => window.setLanguage(state.lang));

// --------------------- Vista iniziale ---------------------
document.addEventListener("DOMContentLoaded", () => {
  $("#btnEnter")?.addEventListener("click", () => {
    show("nearby");
  });

  $("#navHome")?.addEventListener("click", () => show("home"));

  $$(".tab").forEach(tab => {
    tab.addEventListener("click", () => {
      const view = tab.dataset.view;
      if (view) show(view);
    });
  });

  // Ethic box (tutte le versioni)
  $$("#btnEthic, #btnEthic2, #btnEthic3, #btnEthic4, #btnEthic5, #btnEthicGlobal").forEach(b => {
    b.addEventListener("click", () => openEthic());
  });
});
/* ---------------------------------------------------------
   APP.JS (Parte 2/4)
   Swipe, match, reward mock, sponsor e PET Places
   --------------------------------------------------------- */

// --------------------- Reward / Monetizzazione (mock) ---------------------
const Rewards = {
  showing: false,
  // Mostra un "video premio" mock, risolve dopo ~2s. Se Plus attivo, salta.
  async show(reason = "") {
    if (state.plus) return true;
    if (this.showing) return false;
    this.showing = true;
    const dlg = $("#rewardDialog");
    const play = $("#rewardPlay");
    const close = $("#rewardClose");
    dlg.hidden = false;

    return new Promise((resolve) => {
      let done = false;
      function finish(ok) {
        if (done) return;
        done = true;
        dlg.hidden = true;
        Rewards.showing = false;
        resolve(ok);
      }
      play.onclick = () => {
        // Simula attesa "video"
        play.disabled = true;
        setTimeout(() => finish(true), 1800);
      };
      close.onclick = () => finish(false);
    });
  },
  async interstitial(tag = "Videomatch") {
    // Mock interstitial post-match; se Plus, salta.
    if (state.plus) return true;
    // breve overlay senza UI dedicata (si potrebbe riusare rewardDialog con testo diverso)
    await new Promise(r => setTimeout(r, 600));
    return true;
  }
};

// --------------------- Etic box / Maps helpers ---------------------
function openMaps(query) {
  const q = encodeURIComponent(query);
  const url = `https://www.google.com/maps/search/?api=1&query=${q}`;
  window.open(url, "_blank");
}
async function openEthic() {
  const ok = await Rewards.show("ethic");
  if (ok) {
    const q = state.lang === "en" ? "animal shelters near me" : "canili vicino a me";
    openMaps(q);
  }
}

// Sponsor click
$("#sponsorFido")?.addEventListener("click", async () => {
  const ok = await Rewards.show("sponsor");
  if (ok) {
    // Se hai un link ufficiale Fido, mettilo qui:
    window.open("https://www.google.com/search?q=Fido+gelato+per+cani", "_blank");
  }
});
$("#sponsorFido2")?.addEventListener("click", async () => {
  const ok = await Rewards.show("sponsor");
  if (ok) window.open("https://www.google.com/search?q=Fido+gelato+per+cani", "_blank");
});

// PET Places (dropdown)
document.addEventListener("click", async (e) => {
  const item = e.target.closest(".dropdown-item");
  if (!item) return;
  const type = item.dataset.service || "";
  const mapQueries = {
    veterinari: state.lang === "en" ? "veterinarians near me" : "veterinari vicino a me",
    toelettature: state.lang === "en" ? "dog groomers near me" : "toelettature per cani vicino a me",
    negozi: state.lang === "en" ? "pet shops near me" : "negozi animali vicino a me",
    parchi: state.lang === "en" ? "dog parks near me" : "parchi per cani vicino a me",
    addestratori: state.lang === "en" ? "dog trainers near me" : "addestratori cani vicino a me",
    canili: state.lang === "en" ? "animal shelters near me" : "canili vicino a me",
  };
  const ok = await Rewards.show("petplace");
  if (ok) openMaps(mapQueries[type] || "pet near me");
});

// --------------------- Dataset mock / caricamento ---------------------
async function loadDogs() {
  // Base mock + immagini locali se presenti (dog1.jpg…)
  const base = [
    { id: 1, name: "Luna", breed: "Labrador", age: 3, sex: "female", km: 2, img: "dog1.jpg", verified: true },
    { id: 2, name: "Rocky", breed: "Husky", age: 4, sex: "male", km: 5, img: "dog2.jpg", verified: false },
    { id: 3, name: "Mia", breed: "Beagle", age: 2, sex: "female", km: 1, img: "dog3.jpg", verified: true },
    { id: 4, name: "Bruno", breed: "German Shepherd", age: 5, sex: "male", km: 9, img: "dog4.jpg", verified: false },
  ];
  // In futuro: fetch a JSON remoto / localStorage
  state.dogs = base;
}
loadDogs();

// --------------------- Rendering griglia 2x2 ---------------------
function dogCardHTML(d) {
  return `
  <article class="card pop" data-id="${d.id}">
    <img src="${d.img}" alt="${d.name}" loading="lazy" />
    <div class="card-info" style="position:absolute;left:8px;bottom:8px;right:8px;display:flex;justify-content:space-between;align-items:flex-end;gap:8px;">
      <div>
        <div style="font-weight:800">${d.name}</div>
        <div style="opacity:.85;font-size:12px">${d.breed} • ${d.age}y • ${d.km}km</div>
      </div>
      ${d.verified ? '<span class="badge badge-gold">✔</span>' : ""}
    </div>
  </article>`;
}

function renderGrid(targetId, list) {
  const wrap = $("#" + targetId);
  if (!wrap) return;
  wrap.setAttribute("aria-busy", "true");
  wrap.innerHTML = list.map(dogCardHTML).join("");
  wrap.removeAttribute("aria-busy");
  // Click → profilo
  $$("#" + targetId + " .card").forEach(card => {
    card.addEventListener("click", () => {
      const id = Number(card.dataset.id);
      const dog = state.dogs.find(x => x.id === id);
      if (dog) openProfile(dog);
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderGrid("nearbyGrid", state.dogs);
  renderGrid("playGrid", state.dogs.slice().reverse());
});

// --------------------- Profilo ---------------------
function openProfile(dog) {
  state.currentDog = dog;
  $("#profileMainPhoto").style.backgroundImage = `url(${dog.img})`;
  $("#profileName").textContent = dog.name;
  $("#profileInfo").textContent = `${dog.breed} • ${dog.age}y • ${dog.sex === "male" ? (state.lang==="en"?"male":"maschio") : (state.lang==="en"?"female":"femmina")} • ${dog.km}km`;
  $("#badgeVerified").hidden = !dog.verified;

  // Gallery mock
  const gallery = $("#profileGallery");
  gallery.innerHTML = ["dog1.jpg","dog2.jpg","dog3.jpg"].map((src) =>
    `<div class="thumb"><img src="${src}" alt="" /></div>`).join("");

  // Selfie gate
  const blur = $("#selfieBlur");
  blur.onclick = async () => {
    const key = "selfie_" + dog.id;
    if (state.plus || state.selfieUnlocked[key]) {
      // già sbloccato: apri immagine intera (qui riuso main photo)
      viewFullPhoto(dog.img);
      return;
    }
    const ok = await Rewards.show("selfie");
    if (ok) {
      state.selfieUnlocked[key] = Date.now() + 24 * 60 * 60 * 1000; // 24h
      blur.remove();
      viewFullPhoto(dog.img);
      persistSelfieUnlocks();
    }
  };

  // like/dislike in profilo
  $("#btnProfileLike").onclick = () => doLike(dog);
  $("#btnProfileDislike").onclick = () => doDislike(dog);

  $("#profilePage").hidden = false;
}

function closeProfile() {
  $("#profilePage").hidden = true;
}
$("#btnCloseProfile")?.addEventListener("click", closeProfile);

function viewFullPhoto(src) {
  // semplice fullscreen nativo
  const w = window.open(src, "_blank");
  if (!w) alert("Impossibile aprire l’immagine.");
}

function persistSelfieUnlocks() {
  // comprime solo le chiavi attive
  localStorage.setItem("plutoo_selfies", JSON.stringify(state.selfieUnlocked));
}
(function restoreSelfies(){
  try {
    const raw = localStorage.getItem("plutoo_selfies");
    if (!raw) return;
    const data = JSON.parse(raw);
    const now = Date.now();
    Object.entries(data).forEach(([k, v]) => {
      if (Number(v) > now) state.selfieUnlocked[k] = Number(v);
    });
  } catch(e){}
})();

// --------------------- Swipe Deck ---------------------
let currentIndex = 0;

function loadNextCard() {
  const card = $("#swipeCard");
  if (!card) return;
  const dog = state.dogs[currentIndex % state.dogs.length];
  card.innerHTML = `
    <div class="card swipe-content" data-id="${dog.id}" style="width:100%;height:100%;position:relative;">
      <img src="${dog.img}" alt="${dog.name}" style="width:100%;height:100%;object-fit:cover;" />
      <div style="position:absolute;left:10px;bottom:10px;right:10px;display:flex;justify-content:space-between;align-items:flex-end;">
        <div>
          <div style="font-weight:800">${dog.name}</div>
          <div style="opacity:.85;font-size:12px">${dog.breed} • ${dog.age}y • ${dog.km}km</div>
        </div>
        ${dog.verified ? '<span class="badge badge-gold">✔</span>' : ""}
      </div>
    </div>`;
  attachSwipe(card, dog);
}

function attachSwipe(container, dog) {
  let startX = 0, currentX = 0, dragging = false;

  function onStart(e) {
    dragging = true;
    startX = (e.touches ? e.touches[0].clientX : e.clientX);
    container.style.transition = "none";
    document.body.style.overflow = "hidden"; // scroll-lock
  }
  function onMove(e) {
    if (!dragging) return;
    currentX = (e.touches ? e.touches[0].clientX : e.clientX) - startX;
    container.style.transform = `translateX(${currentX}px) rotate(${currentX/30}deg)`;
  }
  async function onEnd() {
    if (!dragging) return;
    dragging = false;
    document.body.style.overflow = ""; // unlock
    const threshold = container.offsetWidth * 0.25;
    if (currentX > threshold) {
      doLike(dog);
      animateOut(1);
    } else if (currentX < -threshold) {
      doDislike(dog);
      animateOut(-1);
    } else {
      container.style.transition = "transform .2s ease";
      container.style.transform = "translateX(0) rotate(0)";
    }
  }
  function animateOut(dir) {
    container.style.transition = "transform .25s ease";
    container.style.transform = `translateX(${dir*window.innerWidth}px) rotate(${dir*20}deg)`;
    setTimeout(() => {
      currentIndex++;
      loadNextCard();
    }, 180);
  }

  container.addEventListener("touchstart", onStart, { passive: true });
  container.addEventListener("touchmove", onMove, { passive: true });
  container.addEventListener("touchend", onEnd);
  container.addEventListener("mousedown", onStart);
  window.addEventListener("mousemove", onMove);
  window.addEventListener("mouseup", onEnd);
}

// Bottoni azione
$("#btnLike")?.addEventListener("click", () => {
  const dog = state.dogs[currentIndex % state.dogs.length];
  doLike(dog);
  currentIndex++; loadNextCard();
});
$("#btnDislike")?.addEventListener("click", () => {
  const dog = state.dogs[currentIndex % state.dogs.length];
  doDislike(dog);
  currentIndex++; loadNextCard();
});

// Like / Dislike / Match
async function doLike(dog) {
  incrementSwipe();
  // logica match mock: every 3 likes → match
  const isMatch = (Date.now() % 3) === 0;
  if (isMatch) {
    openMatch(dog);
    await Rewards.interstitial("Videomatch");
  }
}
function doDislike(_dog) {
  incrementSwipe();
}

function incrementSwipe() {
  state.swipeCount++;
  // Reward a 10 e +5
  if (!state.plus) {
    if (state.swipeCount === 10 || (state.swipeCount > 10 && (state.swipeCount - 10) % 5 === 0)) {
      Rewards.show("swipe");
    }
  }
}

function openMatch(dog) {
  const pop = $("#matchPopup");
  pop.hidden = false;
  $("#btnGoChat").onclick = () => {
    pop.hidden = true;
    openChatWith(dog);
  };
}

// Init prima card
document.addEventListener("DOMContentLoaded", loadNextCard);
/* ---------------------------------------------------------
   APP.JS (Parte 3/4)
   Chat (reward al primo messaggio), Likes ricevuti (3 gratis),
   Ricerca personalizzata con autocomplete prefisso
   --------------------------------------------------------- */

// --------------------- Chat ---------------------
const chats = new Map();            // key: dog.id → array di messaggi
const firstMessageGated = new Set(); // dog.id per cui abbiamo già mostrato reward

function openChatWith(dog) {
  $("#chatTitle").textContent = (state.lang === "en" ? "Chat with " : "Chat con ") + dog.name;
  $("#chatMessages").innerHTML = renderChat(dog.id);
  $("#chatPage").hidden = false;

  const form = $("#chatForm");
  const input = $("#chatText");
  form.onsubmit = async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    // reward solo al primo messaggio dopo il match
    if (!state.plus && !firstMessageGated.has(dog.id)) {
      const ok = await Rewards.show("first_message");
      if (!ok) return; // utente ha chiuso
      firstMessageGated.add(dog.id);
    }

    // push messaggio
    const arr = chats.get(dog.id) || [];
    arr.push({ me: true, text, ts: Date.now() });
    chats.set(dog.id, arr);

    // echo semplice (bot) per simulare risposta
    setTimeout(() => {
      const reply = state.lang === "en" ? "Woof! Nice to meet you 🐾" : "Bau! Piacere di conoscerti 🐾";
      const arr2 = chats.get(dog.id) || [];
      arr2.push({ me: false, text: reply, ts: Date.now() });
      chats.set(dog.id, arr2);
      $("#chatMessages").innerHTML = renderChat(dog.id);
      scrollChatToEnd();
    }, 700);

    input.value = "";
    $("#chatMessages").innerHTML = renderChat(dog.id);
    scrollChatToEnd();
  };
}

function renderChat(dogId) {
  const arr = chats.get(dogId) || [];
  return arr.map(m => `<div class="msg ${m.me ? "me" : ""}">${escapeHTML(m.text)}</div>`).join("");
}

function scrollChatToEnd() {
  const box = $("#chatMessages");
  box.scrollTop = box.scrollHeight;
}

$("#btnCloseChat")?.addEventListener("click", () => { $("#chatPage").hidden = true; });

// --------------------- Likes ricevuti ---------------------
const likesState = {
  list: [],        // simulazione: chi ti ha messo like
  unlocked: 3,     // 3 gratis
};

function simulateIncomingLikes() {
  // genera like simulati dai dog esistenti
  likesState.list = state.dogs.slice().map(d => ({
    id: "like-" + d.id,
    name: d.name,
    img: d.img,
    km: d.km,
    breed: d.breed,
  }));
}
simulateIncomingLikes();

function openLikesPage() {
  renderLikes();
  $("#likesPage").hidden = false;
}

function renderLikes() {
  const wrap = $("#likesList");
  if (!wrap) return;
  const canSee = likesState.unlocked;
  const items = likesState.list.slice(0, canSee);
  wrap.innerHTML = items.map(it => `
    <article class="card">
      <img src="${it.img}" alt="${it.name}" />
      <div style="position:absolute;left:8px;bottom:8px;right:8px;display:flex;justify-content:space-between;">
        <div>
          <div style="font-weight:800">${it.name}</div>
          <div style="opacity:.85;font-size:12px">${it.breed} • ${it.km}km</div>
        </div>
        <button class="btn gold" onclick="likeBack('${it.id}')">💛</button>
      </div>
    </article>
  `).join("");
}

window.likeBack = function (likeId) {
  // opzionale: azione "ricambia like"
  alert(state.lang === "en" ? "Like sent back!" : "Like ricambiato!");
};

$("#btnUnlockMoreLikes")?.addEventListener("click", async () => {
  if (state.plus) {
    likesState.unlocked = likesState.list.length; // tutto
    renderLikes();
    return;
  }
  const ok = await Rewards.show("likes_unlock");
  if (ok) {
    likesState.unlocked = Math.min(likesState.unlocked + 5, likesState.list.length);
    renderLikes();
  }
});
$("#btnCloseLikes")?.addEventListener("click", () => { $("#likesPage").hidden = true; });

// (Scelta d’accesso alla pagina “Like ricevuti”)
// Aprila programmaticamente da dove preferisci (es. icona in header).
// Per ora esponiamo un gesto: doppio tap sulla tab "Amore" per aprire i like.
let loveTabLastTap = 0;
$("#tab-love")?.addEventListener("click", () => {
  const now = Date.now();
  if (now - loveTabLastTap < 450) {
    openLikesPage();
  }
  loveTabLastTap = now;
});

// --------------------- Ricerca personalizzata ---------------------
let breedsList = [];
async function loadBreeds() {
  try {
    const res = await fetch("breeds.json", { cache: "no-store" });
    const data = await res.json();
    breedsList = Array.isArray(data) ? data : [];
  } catch (e) {
    // fallback minimale
    breedsList = ["Labrador", "Beagle", "Husky", "German Shepherd", "Poodle", "Bulldog"];
  }
}
loadBreeds();

const breedInput = $("#breed");
const breedSuggest = $("#breedSuggest");

function prefixMatch(term, list) {
  const t = (term || "").trim().toLowerCase();
  if (!t) return [];
  return list
    .filter(x => x.toLowerCase().startsWith(t))
    .sort((a, b) => a.localeCompare(b));
}

breedInput?.addEventListener("input", () => {
  const items = prefixMatch(breedInput.value, breedsList).slice(0, 12);
  if (!items.length) {
    breedSuggest.classList.remove("show");
    breedSuggest.innerHTML = "";
    return;
  }
  breedSuggest.classList.add("show");
  breedSuggest.innerHTML = items.map(i => `<button type="button" class="sugg">${escapeHTML(i)}</button>`).join("");
});

breedSuggest?.addEventListener("click", (e) => {
  const b = e.target.closest(".sugg");
  if (!b) return;
  breedInput.value = b.textContent;
  breedSuggest.classList.remove("show");
  breedSuggest.innerHTML = "";
});

$("#filtersForm")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const q = new FormData(e.currentTarget);
  const breed = (q.get("breed") || "").toString().trim().toLowerCase();
  const age = Number(q.get("age") || 0);
  const weight = Number(q.get("weight") || 0);   // mock, non applicato ai dati demo
  const height = Number(q.get("height") || 0);   // mock, non applicato ai dati demo
  const sex = (q.get("sex") || "").toString();
  const dist = Number(q.get("distance") || 0);
  const verified = q.get("verified") === "on";
  const mating = q.get("mating") === "on";   // mock
  const pedigree = q.get("pedigree") === "on"; // mock

  let list = state.dogs.slice();

  if (breed) list = list.filter(d => d.breed.toLowerCase().startsWith(breed));
  if (age)   list = list.filter(d => d.age === age); // demo: equality
  if (sex)   list = list.filter(d => d.sex === sex);
  if (dist)  list = list.filter(d => d.km <= dist);
  if (verified) list = list.filter(d => !!d.verified);

  renderGrid("nearbyGrid", list);
  show("nearby");
});

$("#filtersForm")?.addEventListener("reset", () => {
  setTimeout(() => {
    renderGrid("nearbyGrid", state.dogs);
  }, 0);
});

// --------------------- Utils ---------------------
function escapeHTML(s) {
  return s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
/* ---------------------------------------------------------
   APP.JS (Parte 4/4)
   Plus (Gold), persistenze, UX, animazioni finali
   --------------------------------------------------------- */

// --------------------- PLUTOO PLUS ---------------------
const plusBtn = $("#btnBuyPlus");

plusBtn?.addEventListener("click", () => {
  if (state.plus) {
    alert(state.lang === "en" ? "You already have Plutoo Gold." : "Hai già Plutoo Gold attivo.");
    return;
  }

  const ok = confirm(state.lang === "en"
    ? "Activate Plutoo Gold (no ads, all filters unlocked)?"
    : "Attivare Plutoo Gold (niente annunci, filtri Gold sbloccati)?");

  if (ok) {
    state.plus = true;
    localStorage.setItem("plutoo_plus", "1");
    alert(state.lang === "en"
      ? "Plutoo Gold activated! 💛"
      : "Plutoo Gold attivato! 💛");
    document.body.classList.add("plus-active");
  }
});

// --------------------- Persistenze base ---------------------
(function restorePlus() {
  if (state.plus) document.body.classList.add("plus-active");
})();

// --------------------- Glow e animazioni gold ---------------------
document.addEventListener("DOMContentLoaded", () => {
  // Cornici dorate animate
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add("glow");
      else entry.target.classList.remove("glow");
    });
  }, { threshold: 0.2 });

  $$(".card img").forEach(img => observer.observe(img));

  // Cuore match a tutto schermo (confetti)
  const matchHeart = $(".match-heart");
  if (matchHeart) {
    matchHeart.animate(
      [
        { transform: "scale(0.5)", opacity: 0 },
        { transform: "scale(1.2)", opacity: 1 },
        { transform: "scale(1)", opacity: 0.9 },
      ],
      { duration: 800, fill: "forwards" }
    );
  }
});

// --------------------- Gestione lingua live ---------------------
window.addEventListener("DOMContentLoaded", () => {
  document.documentElement.lang = state.lang;
});

// --------------------- Pulsante ENTRA e splash ---------------------
document.addEventListener("DOMContentLoaded", () => {
  const splash = $("#splash");
  const app = $("#app");

  setTimeout(() => {
    if (splash) splash.classList.add("hide");
    if (app) app.classList.remove("hidden");
  }, 1200);

  $("#btnEnter")?.addEventListener("click", () => {
    const logo = $("#logoApp");
    if (logo) {
      logo.classList.add("pulse-once");
      setTimeout(() => show("nearby"), 800);
    } else {
      show("nearby");
    }
  });
});

// --------------------- Eventi globali ---------------------
window.addEventListener("error", (e) => {
  console.warn("Errore non gestito:", e.message);
});

console.log("%cPlutoo Gold Edition loaded 🐾💛", "color:gold;font-weight:bold;font-size:14px;");
