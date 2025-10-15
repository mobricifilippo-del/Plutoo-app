/* ---------------------------------------------------------
   Plutoo — Gold Edition
   app.js (Parte 1/4)
   Core, i18n, helpers, viste e lingua
   --------------------------------------------------------- */

// Stato globale
const state = {
  lang: "it",
  plus: localStorage.getItem("plutoo_plus") === "1",
  swipeCount: 0,
  selfieUnlocked: {},
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
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

function show(view) {
  $$(".view").forEach(v => v.classList.remove("view-active"));
  const el = $("#view-" + view);
  if (el) el.classList.add("view-active");
  state.currentView = view;
  window.scrollTo({ top: 0, behavior: "smooth" });
}
function openDialog(id) { const el = $("#" + id); if (el) el.hidden = false; }
function closeDialog(id) { const el = $("#" + id); if (el) el.hidden = true; }

// --------------------- Lingua ---------------------
window.setLanguage = function(lang) {
  if (!i18n[lang]) return;
  state.lang = lang;
  localStorage.setItem("plutoo_lang", lang);
  document.documentElement.lang = lang;

  $$(".lang-btn").forEach(b => b.setAttribute("aria-pressed", b.dataset.lang === lang ? "true" : "false"));
  $$("[data-i18n]").forEach(el => {
    const k = el.getAttribute("data-i18n");
    if (i18n[lang][k]) el.textContent = i18n[lang][k];
  });
  $$("[data-i18n-ph]").forEach(el => {
    const k = el.getAttribute("data-i18n-ph");
    if (i18n[lang][k]) el.setAttribute("placeholder", i18n[lang][k]);
  });
};

const savedLang = localStorage.getItem("plutoo_lang");
state.lang = savedLang ? savedLang : (navigator.language || "it").startsWith("en") ? "en" : "it";
document.addEventListener("DOMContentLoaded", () => window.setLanguage(state.lang));

// --------------------- Routing / pulsanti base ---------------------
document.addEventListener("DOMContentLoaded", () => {
  $("#btnEnter")?.addEventListener("click", () => show("nearby"));
  $("#navHome")?.addEventListener("click", () => show("home"));
  $$(".tab").forEach(t => t.addEventListener("click", () => t.dataset.view && show(t.dataset.view)));

  // Etic box → reward + maps
  $$("#btnEthic, #btnEthic2, #btnEthic3, #btnEthic4, #btnEthic5, #btnEthicGlobal").forEach(b =>
    b.addEventListener("click", () => openEthic())
  );
});
/* ---------------------------------------------------------
   Plutoo — Gold Edition
   app.js (Parte 2/4)
   Rewards, Sponsor, PET Places, Dogs, Grid, Profile, Swipe
   --------------------------------------------------------- */

// --------------------- Rewards mock ---------------------
const Rewards = {
  show: async (type = "") => {
    return new Promise(resolve => {
      const dlg = $("#rewardDialog");
      const play = $("#rewardPlay");
      const close = $("#rewardClose");
      dlg.hidden = false;

      const done = ok => {
        dlg.hidden = true;
        play.removeEventListener("click", yes);
        close.removeEventListener("click", no);
        resolve(ok);
      };
      function yes() { done(true); }
      function no() { done(false); }

      play.addEventListener("click", yes);
      close.addEventListener("click", no);
    });
  },
};

// --------------------- Sponsor e luoghi PET ---------------------
function openEthic() {
  if (state.plus) return openMaps("canili vicino a me");
  Rewards.show("ethic").then(ok => {
    if (ok) openMaps("canili vicino a me");
  });
}

$("#sponsorFido, #sponsorFido2").forEach?.(b =>
  b.addEventListener("click", () => {
    if (state.plus) return openSponsor();
    Rewards.show("sponsor").then(ok => { if (ok) openSponsor(); });
  })
);

function openSponsor() {
  window.open("https://www.fido.it", "_blank");
}

$$(".dropdown-item").forEach(btn =>
  btn.addEventListener("click", () => {
    const q = btn.dataset.service;
    const lang = state.lang === "en" ? "near me" : "vicino a me";
    if (state.plus) return openMaps(`${q} ${lang}`);
    Rewards.show("service").then(ok => { if (ok) openMaps(`${q} ${lang}`); });
  })
);

function openMaps(query) {
  const encoded = encodeURIComponent(query);
  window.open(`https://www.google.com/maps/search/${encoded}`, "_blank");
}

// --------------------- Dataset iniziale ---------------------
function loadDogs() {
  state.dogs = [
    { id: 1, name: "Luna", age: 3, breed: "Labrador", km: 2, sex: "female", verified: true, img: "dog1.jpg?v=gold2" },
    { id: 2, name: "Rocky", age: 4, breed: "Bulldog", km: 4, sex: "male", verified: false, img: "dog2.jpg?v=gold2" },
    { id: 3, name: "Mia", age: 2, breed: "Beagle", km: 1, sex: "female", verified: true, img: "dog3.jpg?v=gold2" },
    { id: 4, name: "Bruno", age: 5, breed: "Husky", km: 6, sex: "male", verified: false, img: "dog4.jpg?v=gold2" },
  ];
}
loadDogs();

// --------------------- Griglia “Vicino a te” ---------------------
function renderGrid(id, list) {
  const grid = $("#" + id);
  if (!grid) return;
  grid.innerHTML = list.map(d => `
    <article class="card" onclick="openProfile(${d.id})">
      <div class="card-photo frame-gold">
        <img src="${d.img}" alt="${d.name}" loading="lazy" />
      </div>
      <div class="card-info">
        <strong>${d.name}</strong>
        <span>${d.breed} • ${d.age}y</span>
        <small>${d.km} km</small>
      </div>
    </article>
  `).join("");
}
document.addEventListener("DOMContentLoaded", () => renderGrid("nearbyGrid", state.dogs));

// --------------------- Profilo Dog ---------------------
function openProfile(id) {
  const d = state.dogs.find(x => x.id === id);
  if (!d) return;
  state.currentDog = d;

  $("#profilePage").hidden = false;
  $("#profileName").textContent = d.name;
  $("#profileInfo").innerHTML = `${d.breed} • ${d.age} anni • ${d.km} km`;

  const photo = $("#profileMainPhoto");
  photo.innerHTML = `<img src="${d.img}" alt="${d.name}" />`;

  $("#badgeVerified").hidden = !d.verified;
  $("#profileGallery").innerHTML = `<img src="${d.img}" alt="${d.name}" />`;

  const selfie = $("#selfieBlur");
  selfie.onclick = () => unlockSelfie(d.id);

  $("#btnProfileLike").onclick = () => profileLike(d);
  $("#btnProfileDislike").onclick = closeProfilePage;
}

function closeProfilePage() {
  $("#profilePage").hidden = true;
  state.currentDog = null;
}

function unlockSelfie(dogId) {
  if (state.plus) return showSelfie();
  if (state.selfieUnlocked[dogId]) return showSelfie();

  Rewards.show("selfie").then(ok => {
    if (ok) {
      state.selfieUnlocked[dogId] = Date.now();
      showSelfie();
      setTimeout(() => delete state.selfieUnlocked[dogId], 24 * 60 * 60 * 1000);
    }
  });
}

function showSelfie() {
  $("#selfieBlur").style.display = "none";
  alert(state.lang === "en" ? "Selfie unlocked for 24h!" : "Selfie sbloccato per 24 ore!");
}

function profileLike(d) {
  closeProfilePage();
  matchFound(d);
}

// --------------------- Swipe system ---------------------
const swipe = {
  index: 0,
  list: state.dogs,
};

function nextCard() {
  const d = swipe.list[swipe.index];
  if (!d) {
    $("#swipeCard").innerHTML = `<p style="text-align:center;margin-top:40px;">🐾 ${state.lang === "en" ? "No more nearby dogs." : "Nessun Dog vicino al momento."}</p>`;
    return;
  }
  $("#swipeCard").innerHTML = `
    <article class="card-solo">
      <div class="frame-gold">
        <img src="${d.img}" alt="${d.name}" class="swipe-photo" />
      </div>
      <div class="swipe-info">
        <h3>${d.name}</h3>
        <p>${d.breed} • ${d.age} anni • ${d.km} km</p>
      </div>
    </article>
  `;
}
document.addEventListener("DOMContentLoaded", nextCard);

$("#btnLike")?.addEventListener("click", () => handleSwipe(true));
$("#btnDislike")?.addEventListener("click", () => handleSwipe(false));

function handleSwipe(like) {
  const d = swipe.list[swipe.index];
  if (!d) return;
  if (like) {
    state.swipeCount++;
    if (state.swipeCount === 10 || (state.swipeCount > 10 && state.swipeCount % 5 === 0)) {
      if (!state.plus) Rewards.show("swipe");
    }
    matchFound(d);
  }
  swipe.index++;
  nextCard();
}

function matchFound(d) {
  const popup = $("#matchPopup");
  popup.hidden = false;
  const heart = popup.querySelector(".match-heart");
  heart.animate(
    [{ transform: "scale(0.6)", opacity: 0 }, { transform: "scale(1.2)", opacity: 1 }, { transform: "scale(1)", opacity: 0.9 }],
    { duration: 1000, fill: "forwards" }
  );
  setTimeout(() => popup.hidden = true, 2200);
}
/* ---------------------------------------------------------
   Plutoo — Gold Edition
   app.js (Parte 3/4)
   Chat, Likes ricevuti, Ricerca personalizzata
   --------------------------------------------------------- */

// --------------------- Chat ---------------------
const chats = new Map();
const firstMessageGated = new Set();

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

    if (!state.plus && !firstMessageGated.has(dog.id)) {
      const ok = await Rewards.show("first_message");
      if (!ok) return;
      firstMessageGated.add(dog.id);
    }

    const arr = chats.get(dog.id) || [];
    arr.push({ me: true, text, ts: Date.now() });
    chats.set(dog.id, arr);

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

$("#btnCloseChat")?.addEventListener("click", () => {
  $("#chatPage").hidden = true;
});

// --------------------- Likes ricevuti ---------------------
const likesState = { list: [], unlocked: 3 };

function simulateIncomingLikes() {
  likesState.list = state.dogs.map(d => ({
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
      <div class="card-info small">
        <div><strong>${it.name}</strong></div>
        <div>${it.breed} • ${it.km}km</div>
      </div>
      <button class="btn gold small" onclick="likeBack('${it.id}')">💛</button>
    </article>
  `).join("");
}

window.likeBack = function (id) {
  alert(state.lang === "en" ? "Like sent back!" : "Like ricambiato!");
};

$("#btnUnlockMoreLikes")?.addEventListener("click", async () => {
  if (state.plus) {
    likesState.unlocked = likesState.list.length;
    renderLikes();
    return;
  }
  const ok = await Rewards.show("likes_unlock");
  if (ok) {
    likesState.unlocked = Math.min(likesState.unlocked + 5, likesState.list.length);
    renderLikes();
  }
});

$("#btnCloseLikes")?.addEventListener("click", () => {
  $("#likesPage").hidden = true;
});

let loveTabLastTap = 0;
$("#tab-love")?.addEventListener("click", () => {
  const now = Date.now();
  if (now - loveTabLastTap < 450) openLikesPage();
  loveTabLastTap = now;
});

// --------------------- Ricerca personalizzata ---------------------
let breedsList = [];

async function loadBreeds() {
  try {
    const res = await fetch("breeds.json", { cache: "no-store" });
    breedsList = await res.json();
  } catch {
    breedsList = ["Labrador", "Beagle", "Husky", "Bulldog", "Poodle", "German Shepherd"];
  }
}
loadBreeds();

const breedInput = $("#breed");
const breedSuggest = $("#breedSuggest");

function prefixMatch(term, list) {
  const t = term.trim().toLowerCase();
  return list.filter(x => x.toLowerCase().startsWith(t)).sort((a, b) => a.localeCompare(b));
}

breedInput?.addEventListener("input", () => {
  const items = prefixMatch(breedInput.value, breedsList).slice(0, 10);
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
});

$("#filtersForm")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const q = new FormData(e.currentTarget);
  const breed = q.get("breed")?.toString().toLowerCase() || "";
  const age = Number(q.get("age") || 0);
  const sex = q.get("sex")?.toString() || "";
  const dist = Number(q.get("distance") || 0);
  const verified = q.get("verified") === "on";

  let list = state.dogs.slice();
  if (breed) list = list.filter(d => d.breed.toLowerCase().startsWith(breed));
  if (age) list = list.filter(d => d.age === age);
  if (sex) list = list.filter(d => d.sex === sex);
  if (dist) list = list.filter(d => d.km <= dist);
  if (verified) list = list.filter(d => d.verified);

  renderGrid("nearbyGrid", list);
  show("nearby");
});

$("#filtersForm")?.addEventListener("reset", () => {
  setTimeout(() => renderGrid("nearbyGrid", state.dogs), 0);
});

function escapeHTML(s) {
  return s.replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}
/* ---------------------------------------------------------
   Plutoo — Gold Edition
   app.js (Parte 4/4)
   Plus (Gold), persistenze, animazioni e UX finale
   --------------------------------------------------------- */

// --------------------- PLUTOO PLUS ---------------------
const plusBtn = $("#btnBuyPlus");

plusBtn?.addEventListener("click", () => {
  if (state.plus) {
    alert(state.lang === "en" ? "You already have Plutoo Gold." : "Hai già Plutoo Gold attivo.");
    return;
  }

  const ok = confirm(
    state.lang === "en"
      ? "Activate Plutoo Gold (no ads, all filters unlocked)?"
      : "Attivare Plutoo Gold (niente annunci, filtri Gold sbloccati)?"
  );

  if (ok) {
    state.plus = true;
    localStorage.setItem("plutoo_plus", "1");
    alert(state.lang === "en" ? "Plutoo Gold activated! 💛" : "Plutoo Gold attivato! 💛");
    document.body.classList.add("plus-active");
  }
});

(function restorePlus() {
  if (state.plus) document.body.classList.add("plus-active");
})();

// --------------------- Animazioni Gold ---------------------
document.addEventListener("DOMContentLoaded", () => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("glow");
        else entry.target.classList.remove("glow");
      });
    },
    { threshold: 0.2 }
  );
  $$(".frame-gold img").forEach((img) => observer.observe(img));
});

// --------------------- Splash + Logo pulsante ---------------------
document.addEventListener("DOMContentLoaded", () => {
  const splash = $("#splash");
  const app = $("#app");

  setTimeout(() => {
    if (splash) splash.classList.add("hide");
    if (app) app.classList.remove("hidden");
  }, 1200);

  $("#btnEnter")?.addEventListener("click", () => {
    const logo = $(".hero-logo");
    if (logo) {
      logo.classList.add("pulse-once");
      setTimeout(() => show("nearby"), 900);
    } else {
      show("nearby");
    }
  });
});

// --------------------- Eventi globali ---------------------
window.addEventListener("error", (e) => {
  console.warn("Errore non gestito:", e.message);
});

// --------------------- Log finale ---------------------
console.log("%c🐾 Plutoo Gold Edition ready 💛", "color:gold;font-weight:bold;font-size:14px;");
