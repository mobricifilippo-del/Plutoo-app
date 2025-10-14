/* =========================================================
   Plutoo — app.js (Black & Gold) — Ott 2025
   Funzioni principali:
   - Home → Entra → pulse → Nearby (grid 2×N)
   - Tabs: Nearby / Love / Social / Services / Plus
   - Swipe: drag con tilt + swipe-out, match burst
   - Profilo (sheet), Chat (sheet), Selfie 24h (reward)
   - Ricerca personalizzata: prefix-match razze
   - Servizi: pillole + grid, Maps canili (reward → deep link/fallback)
   - Footer etico: reward → Maps
   - Sponsor click: reward → pagina
   - Plus mock (rimuove banner e reward)
   - i18n IT/EN con toggle + query Maps localizzate
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const $ = (id) => document.getElementById(id);
  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* --------------------- Riferimenti UI --------------------- */
  // Home
  const homeScreen = $("homeScreen");
  const heroLogo = $("heroLogo");
  const btnEnter = $("btnEnter");
  const sponsorLink = $("sponsorLink");
  const ethicsButton = $("ethicsButton");
  const langToggle = $("langToggle");

  // App
  const appScreen = $("appScreen");
  const adBanner = $("adBanner");

  // Tabs
  const tabNearby = $("tabNearby");
  const tabLove = $("tabLove");
  const tabSocial = $("tabSocial");
  const tabServices = $("tabServices");

  // Views
  const viewNearby = $("viewNearby");
  const viewLove = $("viewLove");
  const viewSocial = $("viewSocial");
  const viewServices = $("viewServices");

  // Nearby
  const nearGrid = $("nearGrid");
  const btnSearchPanel = $("btnSearchPanel");

  // Love card
  const loveCard = $("loveCard");
  const loveImg = $("loveImg");
  const loveTitleTxt = $("loveTitleTxt");
  const loveMeta = $("loveMeta");
  const loveBio = $("loveBio");
  const loveNo = $("loveNo");
  const loveYes = $("loveYes");

  // Social card
  const socialCard = $("socialCard");
  const socialImg = $("socialImg");
  const socialTitleTxt = $("socialTitleTxt");
  const socialMeta = $("socialMeta");
  const socialBio = $("socialBio");
  const socialNo = $("socialNo");
  const socialYes = $("socialYes");

  // Search panel
  const searchPanel = $("searchPanel");
  const closeSearch = $("closeSearch");
  const searchForm = $("searchForm");
  const breedInput = $("breedInput");
  const breedsList = $("breedsList");
  const weightInput = $("weightInput");
  const heightInput = $("heightInput");
  const distRange = $("distRange");
  const distLabel = $("distLabel");
  const applyFilters = $("applyFilters");
  const resetFilters = $("resetFilters");

  // Services
  const servicesGrid = $("servicesGrid");
  const btnSheltersMaps = $("btnSheltersMaps");

  // Selfie
  const selfieImg = $("selfieImg");
  const unlockBtn = $("unlockBtn");
  const uploadSelfie = $("uploadSelfie");

  // Chat & Profile
  const chatPane = $("chatPane");
  const chatList = $("chatList");
  const chatComposer = $("chatComposer");
  const chatInput = $("chatInput");
  const closeChatBtn = $("closeChat");

  const profileSheet = $("profileSheet");
  const ppBody = $("ppBody");

  /* --------------------- Stato --------------------- */
  const state = {
    lang: localStorage.getItem("lang") || autoDetectLang(),
    plusActive: localStorage.getItem("plusActive") === "true",
    selfieUnlockedUntil: parseInt(localStorage.getItem("selfieUnlockedUntil") || "0"),
    swipeCount: parseInt(localStorage.getItem("swipeCount") || "0"),
    matchesCount: parseInt(localStorage.getItem("matchesCount") || "0"),
    chatRewardsDone: JSON.parse(localStorage.getItem("chatRewardsDone") || "{}"),
    dogs: [],
    breeds: [],
    currentLoveIdx: 0,
    currentSocialIdx: 0,
    filters: {
      breed: "",
      maxKm: parseInt(localStorage.getItem("filter_maxKm") || "5"),
      weight: localStorage.getItem("filter_weight") || "",
      height: localStorage.getItem("filter_height") || "",
    },
    geo: null,
    services: [],
    servicesCat: "all",
  };

  /* --------------------- i18n --------------------- */
  const I18N = {
    it: {
      brand: "Plutoo",
      login: "Login",
      register: "Registrati",
      enter: "Entra",
      sponsorTitle: "Sponsor ufficiale",
      sponsorCopy: "Fido, il gelato per i nostri amici a quattro zampe",
      nearby: "Vicino a te",
      love: "Amore",
      social: "Social",
      services: "Servizi",
      searchAdvanced: "Ricerca personalizzata",
      all: "Tutti",
      vets: "Veterinari",
      groomers: "Toelettature",
      shops: "Negozi",
      parks: "Parchi",
      trainers: "Addestratori",
      shelters: "Canili & Adozioni",
      openSheltersMaps: "Apri canili nelle vicinanze (Maps)",
      selfieTitle: "Selfie",
      unlockSelfie: "Sblocca selfie",
      uploadSelfie: "Carica selfie",
      chat: "Chat",
      send: "Invia",
      typeMessage: "Scrivi un messaggio…",
      profile: "Profilo",
      ethicsLine1: "Non abbandonare mai i tuoi amici",
      ethicsLine2: "(canili vicino a me)",
      breed: "Razza",
      breedPh: "Cerca razza…",
      weight: "Peso (kg)",
      weightPh: "Es. 12",
      height: "Altezza (cm)",
      heightPh: "Es. 45",
      distance: "Distanza:",
      apply: "Applica",
      reset: "Reset",
      itsAMatch: "È un Match! 💘",
      noProfiles: "Nessun profilo. Modifica i filtri.",
      openProfile: "Apri profilo",
      bannerPlus: "Plutoo Plus attivo — niente banner",
      bannerMock: "Banner pubblicitario (mock)",
      mapsQueryShelters: "canili vicino a me",
      sponsorUrl: "https://example.com/fido-gelato"
    },
    en: {
      brand: "Plutoo",
      login: "Log in",
      register: "Sign up",
      enter: "Enter",
      sponsorTitle: "Official sponsor",
      sponsorCopy: "Fido, the gelato for our four-legged friends",
      nearby: "Nearby",
      love: "Love",
      social: "Social",
      services: "Services",
      searchAdvanced: "Advanced search",
      all: "All",
      vets: "Vets",
      groomers: "Groomers",
      shops: "Pet shops",
      parks: "Parks",
      trainers: "Trainers",
      shelters: "Shelters & Adoption",
      openSheltersMaps: "Open nearby shelters (Maps)",
      selfieTitle: "Selfie",
      unlockSelfie: "Unlock selfie",
      uploadSelfie: "Upload selfie",
      chat: "Chat",
      send: "Send",
      typeMessage: "Type a message…",
      profile: "Profile",
      ethicsLine1: "Never abandon your friends",
      ethicsLine2: "(shelters near me)",
      breed: "Breed",
      breedPh: "Search breed…",
      weight: "Weight (kg)",
      weightPh: "e.g., 12",
      height: "Height (cm)",
      heightPh: "e.g., 45",
      distance: "Distance:",
      apply: "Apply",
      reset: "Reset",
      itsAMatch: "It’s a Match! 💘",
      noProfiles: "No profiles. Adjust filters.",
      openProfile: "Open profile",
      bannerPlus: "Plutoo Plus active — no banner",
      bannerMock: "Ad banner (mock)",
      mapsQueryShelters: "animal shelters near me",
      sponsorUrl: "https://example.com/fido-gelato"
    }
  };

  function autoDetectLang() {
    const l = (navigator.language || "it").toLowerCase();
    return l.startsWith("en") ? "en" : "it";
  }

  function t(key) {
    return (I18N[state.lang] && I18N[state.lang][key]) || key;
  }

  function applyI18n() {
    qsa("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      el.textContent = t(key);
    });
    qsa("[data-i18n-placeholder]").forEach(el => {
      const key = el.getAttribute("data-i18n-placeholder");
      el.setAttribute("placeholder", t(key));
    });
    distLabel.textContent = `${distRange.value} km`;
    sponsorLink.setAttribute("href", t("sponsorUrl"));
  }

  langToggle?.addEventListener("click", () => {
    state.lang = state.lang === "it" ? "en" : "it";
    localStorage.setItem("lang", state.lang);
    applyI18n();
  });

  /* --------------------- Monetizzazione mock --------------------- */
  function showReward(message = "Guarda un breve video per continuare") {
    if (state.plusActive) return Promise.resolve(true);
    return new Promise((res) => {
      alert(`${message}\n\n(Mock completato ✅)`);
      res(true);
    });
  }

  function renderBanner() {
    adBanner.textContent = state.plusActive ? t("bannerPlus") : t("bannerMock");
  }

  window.openPlusDialog = () => {
    if (state.plusActive) {
      if (confirm("Disattivare Plutoo Plus (mock)?")) {
        state.plusActive = false;
        localStorage.setItem("plusActive", "false");
        renderBanner();
        alert("Plutoo Plus disattivato.");
      }
      return;
    }
    if (confirm("Attivare Plutoo Plus (mock)? Rimuove banner e video.")) {
      state.plusActive = true;
      localStorage.setItem("plusActive", "true");
      renderBanner();
      alert("Plutoo Plus attivato!");
    }
  };

  /* --------------------- Home → App --------------------- */
  sponsorLink?.addEventListener("click", (e) => {
    e.preventDefault();
    showReward("Video prima di aprire lo sponsor").then(() => {
      window.open(t("sponsorUrl"), "_blank", "noopener");
    });
  });

  ethicsButton?.addEventListener("click", async () => {
    await showReward("Video prima di aprire Google Maps (canili)");
    openSheltersMaps();
  });

  btnEnter?.addEventListener("click", () => {
    // pulse del logo (one-shot) poi vai in app
    heroLogo.classList.add("pulse");
    setTimeout(() => {
      heroLogo.classList.remove("pulse");
      homeScreen.classList.add("hidden");
      appScreen.classList.remove("hidden");
      localStorage.setItem("entered", "1");
      setActiveView("nearby");
    }, 1200);
  });

  if (localStorage.getItem("entered") === "1") {
    homeScreen.classList.add("hidden");
    appScreen.classList.remove("hidden");
    setActiveView("nearby");
  }

  /* --------------------- Tabs & Views --------------------- */
  function setActiveView(name) {
    // reset
    [viewNearby, viewLove, viewSocial, viewServices].forEach(v => v.classList.remove("active"));
    [tabNearby, tabLove, tabSocial, tabServices].forEach(t => t.classList.remove("active"));

    switch (name) {
      case "nearby":
        viewNearby.classList.add("active");
        tabNearby.classList.add("active");
        btnSearchPanel.disabled = false;
        renderNearby();
        break;
      case "love":
        viewLove.classList.add("active");
        tabLove.classList.add("active");
        btnSearchPanel.disabled = true;
        renderLoveCard();
        break;
      case "social":
        viewSocial.classList.add("active");
        tabSocial.classList.add("active");
        btnSearchPanel.disabled = true;
        renderSocialCard();
        break;
      case "services":
        viewServices.classList.add("active");
        tabServices.classList.add("active");
        btnSearchPanel.disabled = true;
        renderServices();
        break;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  tabNearby?.addEventListener("click", () => setActiveView("nearby"));
  tabLove?.addEventListener("click", () => setActiveView("love"));
  tabSocial?.addEventListener("click", () => setActiveView("social"));
  tabServices?.addEventListener("click", () => setActiveView("services"));

  /* --------------------- Dati (mock) --------------------- */
  const MOCK_DOGS = [
    { id:"d1", name:"Luna",   age:2, breed:"Golden Retriever", km:1.2, img:"dog1.jpg", bio:"Dolcissima e giocherellona.", mode:"love", verified:true },
    { id:"d2", name:"Rex",    age:4, breed:"Pastore Tedesco",  km:3.4, img:"dog2.jpg", bio:"Adoro correre e giocare.",    mode:"social", verified:true },
    { id:"d3", name:"Maya",   age:3, breed:"Bulldog Francese", km:2.1, img:"dog3.jpg", bio:"Coccole e passeggiate.",      mode:"love", verified:false },
    { id:"d4", name:"Rocky",  age:5, breed:"Beagle",           km:4.0, img:"dog4.jpg", bio:"Naso infallibile, amicone.",  mode:"social", verified:true },
    { id:"d5", name:"Chicco", age:1, breed:"Barboncino",       km:0.8, img:"dog1.jpg", bio:"Piccolo fulmine di allegria.",mode:"love", verified:true },
    { id:"d6", name:"Kira",   age:6, breed:"Labrador",         km:5.1, img:"dog2.jpg", bio:"Acqua, palla e carezze.",     mode:"social", verified:true },
  ];

  const MOCK_SERVICES = [
    { id:"s1", name:"Ambulatorio Vet Aurora",    cat:"vets",     km:1.1, img:"dog2.jpg" },
    { id:"s2", name:"Toelettatura BauChic",      cat:"groomers", km:2.3, img:"dog3.jpg" },
    { id:"s3", name:"Pet Market Center",         cat:"shops",    km:0.9, img:"dog1.jpg" },
    { id:"s4", name:"Parco Arcobaleno",          cat:"parks",    km:1.9, img:"dog4.jpg" },
    { id:"s5", name:"Trainer GoodDog Academy",   cat:"trainers", km:3.7, img:"dog1.jpg" },
    { id:"s6", name:"Rifugio Amici Fedele",      cat:"shelters", km:4.2, img:"dog2.jpg" },
  ];

  function loadDogs() {
    state.dogs = [...MOCK_DOGS];
  }

  function loadServices() {
    state.services = [...MOCK_SERVICES];
  }

  function loadBreeds() {
    fetch("breeds.json")
      .then(r => r.json())
      .then(list => state.breeds = Array.isArray(list) ? list : [])
      .catch(() => state.breeds = []);
  }

  /* --------------------- Nearby (grid 2×N) --------------------- */
  function renderNearby() {
    const list = filteredDogs();
    nearGrid.innerHTML = list.map(d => dogCardHtml(d)).join("");
    // bind
    qsa(".dog-card").forEach(card => {
      const id = card.getAttribute("data-id");
      card.querySelector("img").addEventListener("click", () => openProfile(findDog(id)));
      card.querySelector(".open-profile").addEventListener("click", () => {
        showReward("Video prima di aprire il profilo").then(() => openProfile(findDog(id)));
      });
    });
  }

  function dogCardHtml(d) {
    return `
      <article class="card dog-card" data-id="${d.id}">
        <img src="${d.img}" alt="${d.name}" class="card-img" />
        <div class="card-info">
          <h3>${d.name} ${d.verified ? "✅" : ""}</h3>
          <p class="meta">${d.breed} · ${fmtKm(d.km)} · ${d.age} ${state.lang==='it'?'anni':'yrs'}</p>
          <p class="bio">${d.bio || ""}</p>
        </div>
        <div class="card-actions">
          <button class="btn ghost small open-profile">${t("openProfile")}</button>
        </div>
      </article>
    `;
  }

  function findDog(id) {
    return state.dogs.find(x => x.id === id) || state.dogs[0];
  }

  function fmtKm(n) { return `${n.toFixed(1)} km`; }

  /* ----- Filtri (panel) ----- */
  btnSearchPanel?.addEventListener("click", () => {
    searchPanel.classList.remove("hidden");
    setTimeout(() => searchPanel.classList.add("show"), 10);
  });
  closeSearch?.addEventListener("click", () => {
    searchPanel.classList.remove("show");
    setTimeout(() => searchPanel.classList.add("hidden"), 250);
  });

  distRange?.addEventListener("input", () => {
    distLabel.textContent = `${distRange.value} km`;
  });

  resetFilters?.addEventListener("click", () => {
    breedInput.value = "";
    weightInput.value = "";
    heightInput.value = "";
    distRange.value = 5;
    distLabel.textContent = `5 km`;
    state.filters = { breed:"", weight:"", height:"", maxKm:5 };
    persistFilters();
    renderNearby();
  });

  searchForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    state.filters.breed = (breedInput.value || "").trim();
    state.filters.weight = (weightInput.value || "").trim();
    state.filters.height = (heightInput.value || "").trim();
    state.filters.maxKm = parseInt(distRange.value || "5");
    persistFilters();
    renderNearby();
    closeSearch.click();
  });

  function persistFilters() {
    localStorage.setItem("filter_maxKm", String(state.filters.maxKm));
    localStorage.setItem("filter_weight", state.filters.weight);
    localStorage.setItem("filter_height", state.filters.height);
  }

  function filteredDogs() {
    const { breed, weight, height, maxKm } = state.filters;
    return state.dogs
      .filter(d => d.km <= (maxKm || 999))
      .filter(d => (!breed ? true : d.breed.toLowerCase().startsWith(breed.toLowerCase())))
      .filter(d => (!weight ? true : (d.weight ? d.weight <= parseFloat(weight) : true)))
      .filter(d => (!height ? true : (d.height ? d.height <= parseFloat(height) : true)));
  }

  // Autocomplete razze — prefix match ONLY
  breedInput?.addEventListener("input", () => {
    const v = (breedInput.value || "").trim().toLowerCase();
    breedsList.innerHTML = "";
    if (!v) { breedsList.classList.remove("show"); return; }
    const matches = state.breeds
      .filter(b => b.toLowerCase().startsWith(v))
      .sort((a,b) => a.localeCompare(b))
      .slice(0, 16);
    if (!matches.length) { breedsList.classList.remove("show"); return; }
    breedsList.innerHTML = matches.map(b => `<div class="item" role="option">${b}</div>`).join("");
    breedsList.classList.add("show");
    qsa(".suggestions .item", breedsList).forEach(item => {
      item.addEventListener("click", () => {
        breedInput.value = item.textContent;
        breedsList.classList.remove("show");
      });
    });
  });

  document.addEventListener("click", (e) => {
    if (!breedsList.contains(e.target) && e.target !== breedInput) {
      breedsList.classList.remove("show");
    }
  });

  /* --------------------- Swipe (Amore / Social) --------------------- */
  function renderLoveCard() { renderSwipeCard("love"); }
  function renderSocialCard() { renderSwipeCard("social"); }

  function getDeck(mode) { return state.dogs.filter(d => d.mode === mode); }

  function renderSwipeCard(mode) {
    const deck = getDeck(mode);
    if (!deck.length) {
      const tgt = mode === "love"
        ? { img: loveImg, title: loveTitleTxt, meta: loveMeta, bio: loveBio }
        : { img: socialImg, title: socialTitleTxt, meta: socialMeta, bio: socialBio };
      tgt.img.src = "dog1.jpg";
      tgt.title.textContent = t("noProfiles");
      tgt.meta.textContent = "";
      tgt.bio.textContent = "";
      return;
    }
    const idx = mode === "love" ? state.currentLoveIdx % deck.length : state.currentSocialIdx % deck.length;
    const d = deck[idx];

    const img = mode === "love" ? loveImg : socialImg;
    const title = mode === "love" ? loveTitleTxt : socialTitleTxt;
    const meta = mode === "love" ? loveMeta : socialMeta;
    const bio = mode === "love" ? loveBio : socialBio;

    img.src = d.img;
    title.textContent = `${d.name}, ${d.age} ${state.lang==='it'?'anni':'yrs'}`;
    meta.textContent = `${d.breed} · ${fmtKm(d.km)} · ${mode === "love" ? t("love") : t("social")}`;
    bio.textContent = d.bio || "";

    img.onclick = () => openProfile(d);

    // attach drag for tilt/swipe
    const card = mode === "love" ? loveCard : socialCard;
    attachSwipe(card, (dir) => onSwipe(mode, dir));
  }

  function onSwipe(mode, dir) {
    incrementSwipe();
    if (dir === "right") { // like → possibile match
      const matched = Math.random() < 0.5;
      if (matched) onMatch();
    }
    nextCard(mode);
  }

  function incrementSwipe() {
    state.swipeCount++;
    localStorage.setItem("swipeCount", String(state.swipeCount));
    if (!state.plusActive) {
      if (state.swipeCount === 10 || (state.swipeCount > 10 && (state.swipeCount - 10) % 5 === 0)) {
        showReward("Video per continuare a fare swipe");
      }
    }
  }

  function onMatch() {
    state.matchesCount++;
    localStorage.setItem("matchesCount", String(state.matchesCount));
    if (!state.plusActive && state.matchesCount >= 4) {
      showReward("Video per sbloccare il nuovo match");
    }
    // Heart burst overlay
    const burst = document.createElement("div");
    burst.className = "match-burst";
    burst.innerHTML = `<div class="match-heart"></div>`;
    document.body.appendChild(burst);
    setTimeout(() => burst.remove(), 720);
  }

  function nextCard(mode) {
    if (mode === "love") {
      state.currentLoveIdx++;
      renderLoveCard();
    } else {
      state.currentSocialIdx++;
      renderSocialCard();
    }
  }

  // Buttons fallback
  loveYes?.addEventListener("click", () => onSwipe("love", "right"));
  loveNo?.addEventListener("click", () => onSwipe("love", "left"));
  socialYes?.addEventListener("click", () => onSwipe("social", "right"));
  socialNo?.addEventListener("click", () => onSwipe("social", "left"));

  function attachSwipe(card, cb) {
    // evita multi-binding
    if (card._bound) return;
    card._bound = true;

    let startX = 0, startY = 0, dx = 0, dy = 0, dragging = false;

    const onStart = (x, y) => { startX = x; startY = y; dragging = true; card.style.transition = "none"; };
    const onMove = (x, y) => {
      if (!dragging) return;
      dx = x - startX; dy = y - startY;
      const tilt = (dx / 20);
      card.style.transform = `translate3d(${dx}px, ${dy * 0.1}px, 0) rotate(${tilt}deg)`;
      card.classList.add("swipe-tilt");
    };
    const onEnd = () => {
      if (!dragging) return;
      dragging = false;
      card.style.transition = "";
      const threshold = 90;
      if (dx > threshold) {
        card.classList.add("swipe-out-right");
        setTimeout(() => {
          card.classList.remove("swipe-out-right");
          card.style.transform = "";
          cb("right");
        }, 320);
      } else if (dx < -threshold) {
        card.classList.add("swipe-out-left");
        setTimeout(() => {
          card.classList.remove("swipe-out-left");
          card.style.transform = "";
          cb("left");
        }, 320);
      } else {
        card.style.transform = "";
        card.classList.remove("swipe-tilt");
      }
      dx = dy = 0;
    };

    card.addEventListener("touchstart", (e) => onStart(e.touches[0].clientX, e.touches[0].clientY), {passive:true});
    card.addEventListener("touchmove", (e) => onMove(e.touches[0].clientX, e.touches[0].clientY), {passive:true});
    card.addEventListener("touchend", onEnd);
    card.addEventListener("mousedown", (e) => onStart(e.clientX, e.clientY));
    window.addEventListener("mousemove", (e) => onMove(e.clientX, e.clientY));
    window.addEventListener("mouseup", onEnd);
  }

  /* --------------------- Profilo (sheet) --------------------- */
  window.openProfile = (d) => {
    profileSheet.classList.add("show");
    profileSheet.classList.remove("hidden");
    ppBody.innerHTML = `
      <div class="center" style="margin-bottom:10px;">
        <img src="${d.img}" alt="${d.name}" style="width:100%;max-height:320px;object-fit:cover;border-radius:12px;border:1px solid #2a2a3a;">
      </div>
      <h2 style="margin:.2rem 0 0">${d.name} ${d.verified ? "✅" : ""}</h2>
      <p class="rmeta" style="margin:.2rem 0">${d.breed} · ${fmtKm(d.km)} · ${d.age} ${state.lang==='it'?'anni':'yrs'}</p>
      <p style="margin:.4rem 0 1rem">${d.bio || ""}</p>
      <div style="display:grid;gap:8px;margin-bottom:10px;">
        <button class="btn outline" id="btnDocs">Carica documenti</button>
        <button class="btn" id="btnChat">${t("chat")}</button>
      </div>
    `;
    $("btnDocs").onclick = () => {
      alert("Upload documenti completato (mock). Badge applicato.");
      d.verified = true;
      renderNearby();
    };
    $("btnChat").onclick = () => {
      closeProfilePage();
      setTimeout(() => openChat(d), 180);
    };
  };

  window.closeProfilePage = () => {
    profileSheet.classList.remove("show");
    setTimeout(() => profileSheet.classList.add("hidden"), 250);
  };

  /* --------------------- Chat (reward 1° messaggio) --------------------- */
  function openChat(dog) {
    chatPane.classList.remove("hidden");
    setTimeout(() => chatPane.classList.add("show"), 10);
    chatPane.dataset.dogId = dog.id;
    chatList.innerHTML = `<div class="msg">Ciao ${dog.name}! 🐶</div>`;
    chatInput.value = "";
  }

  function closeChat() {
    chatPane.classList.remove("show");
    setTimeout(() => chatPane.classList.add("hidden"), 250);
  }

  closeChatBtn?.addEventListener("click", closeChat);

  chatComposer?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (!text) return;
    const dogId = chatPane.dataset.dogId || "unknown";
    if (!state.plusActive && !state.chatRewardsDone[dogId]) {
      await showReward("Video per inviare il primo messaggio");
      state.chatRewardsDone[dogId] = true;
      localStorage.setItem("chatRewardsDone", JSON.stringify(state.chatRewardsDone));
    }
    const msg = document.createElement("div");
    msg.className = "msg me";
    msg.textContent = text;
    chatList.appendChild(msg);
    chatInput.value = "";
    chatList.scrollTop = chatList.scrollHeight;
  });

  /* --------------------- Selfie 24h --------------------- */
  function isSelfieUnlocked() { return Date.now() < state.selfieUnlockedUntil; }
  function updateSelfieUI() {
    if (isSelfieUnlocked()) {
      selfieImg.classList.remove("selfie-blur");
      unlockBtn.disabled = true;
    } else {
      selfieImg.classList.add("selfie-blur");
      unlockBtn.disabled = false;
    }
  }
  updateSelfieUI();

  unlockBtn?.addEventListener("click", async () => {
    await showReward("Video per sbloccare il selfie");
    state.selfieUnlockedUntil = Date.now() + 24*60*60*1000;
    localStorage.setItem("selfieUnlockedUntil", String(state.selfieUnlockedUntil));
    updateSelfieUI();
  });
  uploadSelfie?.addEventListener("click", () => alert("Upload selfie (mock)."));

  /* --------------------- Servizi --------------------- */
  // pillole categoria
  qsa(".pillbar .pill").forEach(p => {
    p.addEventListener("click", () => {
      qsa(".pillbar .pill").forEach(x => x.classList.remove("active"));
      p.classList.add("active");
      state.servicesCat = p.getAttribute("data-cat") || "all";
      renderServices();
    });
  });

  function renderServices() {
    const list = state.services.filter(s => state.servicesCat === "all" ? true : s.cat === state.servicesCat);
    servicesGrid.innerHTML = list.map(s => `
      <article class="card service-card" data-id="${s.id}">
        <img src="${s.img}" alt="${s.name}" class="card-img" />
        <div class="card-info">
          <h3>${s.name}</h3>
          <p class="meta">${labelCat(s.cat)} · ${fmtKm(s.km)}</p>
        </div>
        <div class="card-actions">
          <button class="btn ghost small open-service">Apri</button>
        </div>
      </article>
    `).join("");
    qsa(".service-card").forEach(card => {
      const id = card.getAttribute("data-id");
      const s = state.services.find(x => x.id === id);
      card.querySelector(".open-service").addEventListener("click", async () => {
        await showReward("Video prima di aprire il servizio");
        openExternal(`https://www.google.com/search?q=${encodeURIComponent(s.name)}`);
      });
    });
  }

  function labelCat(c) {
    const map = {
      vets: t("vets"), groomers: t("groomers"), shops: t("shops"),
      parks: t("parks"), trainers: t("trainers"), shelters: t("shelters")
    };
    return map[c] || c;
  }

  btnSheltersMaps?.addEventListener("click", async () => {
    await showReward("Video prima di aprire Google Maps (canili)");
    openSheltersMaps();
  });

  /* --------------------- Geo & Maps --------------------- */
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      (pos) => { state.geo = { lat: pos.coords.latitude, lon: pos.coords.longitude }; },
      () => { /* fallback silenzioso */ },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 60000 }
    );
  }

  function openSheltersMaps() {
    const q = t("mapsQueryShelters");
    if (state.geo) {
      const url = `geo:${state.geo.lat},${state.geo.lon}?q=${encodeURIComponent(q)}`;
      openExternal(url);
    } else {
      const url = `https://www.google.com/maps/search/${encodeURIComponent(q)}`;
      openExternal(url);
    }
  }

  function openExternal(url) {
    window.open(url, "_blank", "noopener");
  }

  /* --------------------- Init --------------------- */
  function init() {
    loadDogs();
    loadServices();
    loadBreeds();
    applyI18n();
    renderBanner();
    // start on Nearby by default if already in app
    if (!homeScreen.classList.contains("hidden")) return;
    setActiveView("nearby");
    // inizializza valori UI filtri
    distRange.value = state.filters.maxKm || 5;
    distLabel.textContent = `${distRange.value} km`;
    if (state.filters.breed) breedInput.value = state.filters.breed;
    if (state.filters.weight) weightInput.value = state.filters.weight;
    if (state.filters.height) heightInput.value = state.filters.height;
  }

  init();
});
