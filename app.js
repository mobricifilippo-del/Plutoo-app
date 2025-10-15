/* =========================================================
   Plutoo — app.js (Gold Stable, COMPLETO per test)
   Base: mantiene struttura ZIP funzionante + migliorie concordate
   Funzioni chiave: Vicino a te, Swipe (Amore/Social), Profilo & Selfie,
                   Chat con reward al primo messaggio,
                   Luoghi PET (dropdown → reward → Google Maps),
                   Sponsor (reward → sito), Riquadro Canili (reward → Maps),
                   Filtri + Filtri Gold (gated da Plus),
                   Plus mock (rimuove ads e sblocca Gold),
                   Swipe reward: 10 poi +5, Match burst a schermo.
   ========================================================= */
(function () {
  // ------------------ Helpers base ------------------
  const $  = (id, r = document) => r.getElementById(id);
  const qs = (sel, r = document) => r.querySelector(sel);
  const qa = (sel, r = document) => Array.from(r.querySelectorAll(sel));
  const wait = (ms) => new Promise(res => setTimeout(res, ms));

  // ------------------ DOM refs ------------------
  const tabNearby = $("tabNearby");
  const tabLove   = $("tabLove");
  const tabSocial = $("tabSocial");
  const tabLuoghi = $("tabLuoghi");
  const luoghiMenu = $("luoghiMenu");

  const btnSearchPanel = $("btnSearchPanel");
  const btnPlus = $("btnPlus");

  const viewNearby = $("viewNearby");
  const viewLove   = $("viewLove");
  const viewSocial = $("viewSocial");
  const nearGrid = $("nearGrid");

  const loveCard = $("loveCard");
  const loveImg  = $("loveImg");
  const loveTitleTxt = $("loveTitleTxt");
  const loveMeta = $("loveMeta");
  const loveBio  = $("loveBio");
  const loveYes  = $("loveYes");
  const loveNo   = $("loveNo");

  const socialCard = $("socialCard");
  const socialImg  = $("socialImg");
  const socialTitleTxt = $("socialTitleTxt");
  const socialMeta = $("socialMeta");
  const socialBio  = $("socialBio");
  const socialYes  = $("socialYes");
  const socialNo   = $("socialNo");

  const profileSheet = $("profileSheet");
  const ppBody = $("ppBody");

  const chatPane = $("chatPane");
  const closeChatBtn = $("closeChat");
  const chatList = $("chatList");
  const chatComposer = $("chatComposer");
  const chatInput = $("chatInput");

  const selfiePage = $("selfiePage");
  const selfieBack = $("selfieBack");
  const selfieFullImg = $("selfieFullImg");
  const selfieCaption = $("selfieCaption");
  const selfieLike = $("selfieLike");
  const selfieLikeCount = $("selfieLikeCount");

  const searchPanel = $("searchPanel");
  const closeSearch = $("closeSearch");
  const breedInput = $("breedInput");
  const breedsList = $("breedsList");
  const distRange = $("distRange");
  const distLabel = $("distLabel");
  const sexFilter = $("sexFilter");
  const onlyVerified = $("onlyVerified");
  const matingInput = $("matingInput");
  const pedigreeInput = $("pedigreeInput");
  const microchipInput = $("microchipInput");
  const vacciniInput = $("vacciniInput");
  const titleInput = $("titleInput");
  const weightInput = $("weightInput");
  const heightInput = $("heightInput");
  const applyFilters = $("applyFilters");
  const resetFilters = $("resetFilters");

  const adBanner = $("adBanner");

  const sponsorLinkApp = $("sponsorLinkApp");
  const ethicsButtonApp = $("ethicsButtonApp");

  const btnLogin = $("btnLogin");
  const btnRegister = $("btnRegister");
  const langToggle = $("langToggle");

  // ------------------ Stato ------------------
  const state = {
    lang: (localStorage.getItem("lang") || autodetectLang()),
    plus: localStorage.getItem("plutoo_plus") === "1",
    swipeCount: parseInt(localStorage.getItem("swipes") || "0", 10),
    matches: parseInt(localStorage.getItem("matches") || "0", 10),
    curLove: parseInt(localStorage.getItem("curLove") || "0", 10),
    curSocial: parseInt(localStorage.getItem("curSocial") || "0", 10),
    filters: {
      breed: localStorage.getItem("f_breed") || "",
      distKm: parseInt(localStorage.getItem("f_distKm") || "5", 10),
      sex: localStorage.getItem("f_sex") || "",
      verified: localStorage.getItem("f_verified") === "1",
      mating: localStorage.getItem("f_mating") || "",
      pedigree: localStorage.getItem("f_pedigree") || "",
      microchip: localStorage.getItem("f_microchip") || "",
      vaccini: localStorage.getItem("f_vaccini") || "",
      title: localStorage.getItem("f_title") || "",
      weight: localStorage.getItem("f_weight") || "",
      height: localStorage.getItem("f_height") || ""
    },
    firstMsgRewardByDog: JSON.parse(localStorage.getItem("firstMsgRewardByDog") || "{}"),
    selfieUntilByDog: JSON.parse(localStorage.getItem("selfieUntilByDog") || "{}"),
    likesBySelfie: JSON.parse(localStorage.getItem("likesBySelfie") || "{}"),
    breeds: [],
    geo: null,
    currentView: "nearby",
    currentDogForSelfie: null,
  };

  function autodetectLang() {
    const l = (navigator.language || "it").toLowerCase();
    return l.startsWith("en") ? "en" : "it";
  }

  const I18N = {
    it: {
      sponsorUrl: "https://fido-gelato.it",
      watchVideo: "Guarda un breve video per continuare",
      videoPlaying: "Video in riproduzione…",
      mapsShelters: "canili vicino a me",
      mapsVets: "veterinari per animali vicino a me",
      mapsGroomers: "toelettature per cani vicino a me",
      mapsShops: "negozi animali vicino a me",
      mapsParks: "parchi per cani vicino a me",
      mapsTrainers: "addestratori per cani vicino a me",
      noProfiles: "Nessun profilo corrisponde ai filtri.",
      plusTitle: "✨ Plutoo Plus",
      plusCopy: "Rimuovi annunci e sblocca i filtri Gold (mock).",
      activateNow: "Attiva ora",
      close: "Chiudi",
    },
    en: {
      sponsorUrl: "https://fido-gelato.it",
      watchVideo: "Watch a short video to continue",
      videoPlaying: "Playing video…",
      mapsShelters: "animal shelters near me",
      mapsVets: "vets near me",
      mapsGroomers: "dog groomers near me",
      mapsShops: "pet shops near me",
      mapsParks: "dog parks near me",
      mapsTrainers: "dog trainers near me",
      noProfiles: "No profiles match your filters.",
      plusTitle: "✨ Plutoo Plus",
      plusCopy: "Remove ads and unlock Gold filters (mock).",
      activateNow: "Activate now",
      close: "Close",
    }
  };
  const t = (k) => (I18N[state.lang] && I18N[state.lang][k]) || k;

  // ------------------ Dataset mock ------------------
  // Nota: galleria usa lo stesso file per evitare 404 quando non ci sono varianti b/c/d
  const DOGS = [
    { id: "d1", name: "Luna",  age: 2, breed: "Golden Retriever", km: 1.2, sex: "F", verified: true,  mode: "love",   img: "dog1.jpg", gallery: ["dog1.jpg","dog1.jpg","dog1.jpg","dog1.jpg"], mating: "yes", pedigree: "ENCI", microchip: "yes", vaccini: "yes", title: "cucciolo" },
    { id: "d2", name: "Rex",   age: 4, breed: "Pastore Tedesco",  km: 3.4, sex: "M", verified: true,  mode: "social", img: "dog2.jpg", gallery: ["dog2.jpg","dog2.jpg","dog2.jpg","dog2.jpg"], mating: "no",  pedigree: "FCI",  microchip: "yes", vaccini: "yes", title: "adulto" },
    { id: "d3", name: "Maya",  age: 3, breed: "Bulldog Francese", km: 2.1, sex: "F", verified: false, mode: "love",   img: "dog3.jpg", gallery: ["dog3.jpg","dog3.jpg","dog3.jpg","dog3.jpg"], mating: "yes", pedigree: "",     microchip: "no",  vaccini: "no",  title: "adulto" },
    { id: "d4", name: "Rocky", age: 5, breed: "Beagle",           km: 4.0, sex: "M", verified: true,  mode: "social", img: "dog4.jpg", gallery: ["dog4.jpg","dog4.jpg","dog4.jpg","dog4.jpg"], mating: "yes", pedigree: "ENCI", microchip: "yes", vaccini: "yes", title: "campione" },
  ];

  // Razze da file + fallback
  fetch("breeds.json")
    .then(r => r.json())
    .then(arr => { if (Array.isArray(arr)) state.breeds = arr; })
    .catch(() => {
      state.breeds = [
        "Pastore Tedesco","Labrador","Golden Retriever","Jack Russell",
        "Bulldog Francese","Barboncino","Border Collie","Chihuahua",
        "Carlino","Beagle","Maltese","Shih Tzu","Husky","Bassotto","Cocker Spaniel"
      ];
    });

  // Geolocalizzazione per URL Maps
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      p => { state.geo = { lat: p.coords.latitude, lon: p.coords.longitude }; },
      () => {},
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 60000 }
    );
  }

  // ------------------ Init UI ------------------
  function initUI() {
    // Tabs
    tabNearby?.addEventListener("click", () => setActive("nearby"));
    tabLove?.addEventListener("click",   () => setActive("love"));
    tabSocial?.addEventListener("click", () => setActive("social"));

    // Dropdown Luoghi PET (toggle classe .open per mobile)
    tabLuoghi?.addEventListener("click", (e) => {
      e.stopPropagation();
      const dd = tabLuoghi.closest(".dropdown");
      const open = dd?.classList.toggle("open");
      tabLuoghi.setAttribute("aria-expanded", open ? "true" : "false");
    });
    document.addEventListener("click", () => {
      const dd = tabLuoghi?.closest(".dropdown");
      if (dd) dd.classList.remove("open");
      tabLuoghi?.setAttribute("aria-expanded", "false");
    });
    // Click voci menu Luoghi PET
    luoghiMenu?.querySelectorAll(".menu-item").forEach(btn => {
      btn.addEventListener("click", () => {
        const url = mapsUrlFor(btn.dataset.cat);
        safeOpenWithReward("Video rapido prima di aprire Maps", url);
        const dd = tabLuoghi?.closest(".dropdown");
        dd && dd.classList.remove("open");
        tabLuoghi?.setAttribute("aria-expanded","false");
      });
    });

    // Ricerca personalizzata
    btnSearchPanel?.addEventListener("click", () => searchPanel.classList.remove("hidden"));
    closeSearch?.addEventListener("click", () => searchPanel.classList.add("hidden"));

    distRange?.addEventListener("input", () => distLabel.textContent = `${distRange.value} km`);

    breedInput?.addEventListener("input", () => {
      const v = (breedInput.value || "").toLowerCase().trim();
      breedsList.innerHTML = "";
      breedsList.style.display = "none";
      if (!v) return;
      const matches = (state.breeds || [])
        .filter(b => b.toLowerCase().startsWith(v))
        .sort()
        .slice(0, 24);
      if (!matches.length) return;
      breedsList.innerHTML = matches.map(b => `<div class="item" role="option">${b}</div>`).join("");
      breedsList.style.display = "block";
      qa(".item", breedsList).forEach(it => it.addEventListener("click", () => {
        breedInput.value = it.textContent;
        breedsList.style.display = "none";
      }));
    });
    document.addEventListener("click", (e) => {
      if (e.target !== breedInput && !breedsList.contains(e.target)) breedsList.style.display = "none";
    });

    onlyVerified?.addEventListener("change", () => state.filters.verified = !!onlyVerified.checked);
    sexFilter?.addEventListener("change", () => state.filters.sex = sexFilter.value || "");

    applyFilters?.addEventListener("click", (e) => {
      e.preventDefault();
      const f = state.filters;
      f.breed   = (breedInput.value || "").trim();
      f.distKm  = parseInt(distRange.value || "5", 10);
      f.verified = !!onlyVerified.checked;
      f.sex     = sexFilter.value || "";

      if (state.plus) {
        f.mating   = (matingInput.value || "").trim();
        f.pedigree = (pedigreeInput.value || "").trim();
        f.microchip= (microchipInput.value || "").trim();
        f.vaccini  = (vacciniInput.value || "").trim();
        f.title    = (titleInput.value || "").trim();
        f.weight   = (weightInput.value || "").trim();
        f.height   = (heightInput.value || "").trim();
      }
      persistFilters();
      renderNearby();
      searchPanel.classList.add("hidden");
    });

    resetFilters?.addEventListener("click", () => {
      const f = state.filters;
      f.breed=""; f.distKm=5; f.sex=""; f.verified=false;
      f.mating=""; f.pedigree=""; f.microchip=""; f.vaccini="";
      f.title=""; f.weight=""; f.height="";
      breedInput.value="";
      distRange.value=5; distLabel.textContent="5 km";
      sexFilter.value=""; onlyVerified.checked=false;

      if (state.plus) {
        matingInput.value=""; pedigreeInput.value=""; microchipInput.value="";
        vacciniInput.value=""; titleInput.value=""; weightInput.value=""; heightInput.value="";
      }
      persistFilters();
      renderNearby();
    });

    // Sponsor (reward → pre-open tab → naviga)
    sponsorLinkApp?.addEventListener("click", (e) => {
      e.preventDefault();
      safeOpenWithReward("Video rapido prima di aprire lo sponsor", t("sponsorUrl"));
    });

    // Riquadro etico canili
    ethicsButtonApp?.addEventListener("click", () => {
      const url = mapsUrlFor("shelters");
      safeOpenWithReward("Video rapido prima di aprire i canili vicino a te", url);
    });

    // Chat
    closeChatBtn?.addEventListener("click", closeChat);
    chatComposer?.addEventListener("submit", onChatSubmit);

    // Selfie
    selfieBack?.addEventListener("click", closeSelfie);

    // Auth/lingua (mock)
    btnLogin?.addEventListener("click", () => alert("Login (mock)"));
    btnRegister?.addEventListener("click", () => alert("Registrazione (mock)"));
    langToggle?.addEventListener("click", () => {
      state.lang = state.lang === "it" ? "en" : "it";
      localStorage.setItem("lang", state.lang);
      alert("Lingua: " + state.lang.toUpperCase());
    });

    // Plus
    btnPlus?.addEventListener("click", openPlusDialog);

    // Stato iniziale UI
    breedInput.value = state.filters.breed;
    distRange.value = state.filters.distKm;
    distLabel.textContent = `${distRange.value} km`;
    sexFilter.value = state.filters.sex;
    onlyVerified.checked = !!state.filters.verified;

    if (state.plus) enableGoldInputs();
    else disableGoldInputs();

    // Banner mock
    adBanner && (adBanner.style.display = state.plus ? "none" : "block");

    // Carica vista iniziale: Vicino a te
    setActive("nearby");
    renderNearby();
  }

  // ------------------ Persistenza filtri ------------------
  function persistFilters() {
    const f = state.filters;
    localStorage.setItem("f_breed", f.breed);
    localStorage.setItem("f_distKm", String(f.distKm));
    localStorage.setItem("f_sex", f.sex);
    localStorage.setItem("f_verified", f.verified ? "1" : "0");
    localStorage.setItem("f_mating", f.mating);
    localStorage.setItem("f_pedigree", f.pedigree);
    localStorage.setItem("f_microchip", f.microchip);
    localStorage.setItem("f_vaccini", f.vaccini);
    localStorage.setItem("f_title", f.title);
    localStorage.setItem("f_weight", f.weight);
    localStorage.setItem("f_height", f.height);
  }

  // ------------------ Views ------------------
  function setActive(view) {
    state.currentView = view;
    [viewNearby, viewLove, viewSocial].forEach(v => v.classList.add("hidden"));
    [tabNearby, tabLove, tabSocial].forEach(t => t && t.classList.remove("active"));

    if (view === "nearby") {
      viewNearby.classList.remove("hidden");
      tabNearby?.classList.add("active");
      renderNearby();
      btnSearchPanel.disabled = false;
    }
    if (view === "love") {
      viewLove.classList.remove("hidden");
      tabLove?.classList.add("active");
      renderSwipe("love");
      btnSearchPanel.disabled = true;
    }
    if (view === "social") {
      viewSocial.classList.remove("hidden");
      tabSocial?.classList.add("active");
      renderSwipe("social");
      btnSearchPanel.disabled = true;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // ------------------ Nearby grid ------------------
  function applyFiltersList() {
    const f = state.filters;
    let arr = DOGS
      .filter(d => d.km <= (f.distKm || 999))
      .filter(d => !f.sex || d.sex === f.sex)
      .filter(d => !f.verified || d.verified)
      .filter(d => !f.breed || d.breed.toLowerCase().startsWith(f.breed.toLowerCase()));

    if (state.plus) {
      if (f.mating)    arr = arr.filter(d => d.mating === f.mating);
      if (f.pedigree)  arr = arr.filter(d => d.pedigree === f.pedigree);
      if (f.microchip) arr = arr.filter(d => d.microchip === f.microchip);
      if (f.vaccini)   arr = arr.filter(d => d.vaccini === f.vaccini);
      if (f.title)     arr = arr.filter(d => d.title === f.title);
      // weight/height potrebbero essere server-side; ignoriamo nel mock
    }
    return arr;
  }

  function renderNearby() {
    const list = applyFiltersList();
    if (!list.length) {
      nearGrid.innerHTML = `<p class="soft" style="padding:12px">${t("noProfiles")}</p>`;
      return;
    }
    nearGrid.innerHTML = list.map(d => `
      <article class="dog-card" data-id="${d.id}">
        <img src="${d.img}" alt="${d.name}">
        <div class="dog-info">
          <h4>${d.name} ${d.verified ? "✅" : ""}</h4>
          <p>${d.breed} · ${d.age}${state.lang === "it" ? " anni" : " yrs"} · ${d.km.toFixed(1)} km</p>
        </div>
      </article>
    `).join("");

    qa(".dog-card", nearGrid).forEach(card => {
      const id = card.getAttribute("data-id");
      const dog = DOGS.find(x => x.id === id);
      qs("img", card)?.addEventListener("click", () => openProfile(dog));
    });
  }

  // ------------------ Swipe (Amore / Social) ------------------
  function renderSwipe(mode) {
    const deck = DOGS.filter(d => d.mode === mode);
    if (!deck.length) {
      (mode === "love" ? viewLove : viewSocial).innerHTML = `<p class="soft" style="padding:12px">${t("noProfiles")}</p>`;
      return;
    }
    const idx = (mode === "love") ? (state.curLove % deck.length) : (state.curSocial % deck.length);
    const d = deck[idx];

    const img   = (mode === "love") ? loveImg : socialImg;
    const title = (mode === "love") ? loveTitleTxt : socialTitleTxt;
    const meta  = (mode === "love") ? loveMeta : socialMeta;
    const bio   = (mode === "love") ? loveBio : socialBio;
    const card  = (mode === "love") ? loveCard : socialCard;
    const yes   = (mode === "love") ? loveYes : socialYes;
    const no    = (mode === "love") ? loveNo  : socialNo;

    img.src = d.img;
    title.textContent = `${d.name} ${d.verified ? "✅" : ""}`;
    meta.textContent = `${d.breed} · ${d.age}${state.lang === "it" ? " anni" : " yrs"} · ${d.km.toFixed(1)} km`;
    bio.textContent = d.bio || "";
    img.onclick = () => openProfile(d);

    attachSwipe(card, async (dir) => {
      incrementSwipe();
      if (dir === "right") maybeMatch();
      if (mode === "love") {
        state.curLove++;
        localStorage.setItem("curLove", String(state.curLove));
      } else {
        state.curSocial++;
        localStorage.setItem("curSocial", String(state.curSocial));
      }
      await wait(10);
      renderSwipe(mode);
    });

    yes.onclick = () => simulateSwipe(card, "right");
    no.onclick  = () => simulateSwipe(card, "left");
  }

  // Scroll lock robusto durante swipe
  let swipeLock = false;
  function lockScroll(e) { if (swipeLock) e.preventDefault(); }
  document.addEventListener("touchmove", lockScroll, { passive: false });

  function attachSwipe(card, onDone) {
    if (card._pl_swipe) return;
    card._pl_swipe = true;
    let startX = 0, deltaX = 0, dragging = false;

    const start = (x) => {
      startX = x;
      deltaX = 0;
      dragging = true;
      swipeLock = true;
      document.body.style.overflow = "hidden";
      card.style.transition = "none";
    };
    const move = (x) => {
      if (!dragging) return;
      deltaX = x - startX;
      const rot = deltaX / 18;
      card.style.transform = `translate3d(${deltaX}px,0,0) rotate(${rot}deg)`;
    };
    const end = () => {
      if (!dragging) return;
      dragging = false;
      swipeLock = false;
      document.body.style.overflow = "";
      card.style.transition = "";
      const TH = 100; // soglia un po' maggiore per un gesto deciso
      if (deltaX > TH) {
        card.classList.add("swipe-out-right");
        setTimeout(() => { resetCard(card); onDone("right"); }, 550);
      } else if (deltaX < -TH) {
        card.classList.add("swipe-out-left");
        setTimeout(() => { resetCard(card); onDone("left"); }, 550);
      } else {
        resetCard(card);
      }
      deltaX = 0;
    };

    // Touch
    card.addEventListener("touchstart", e => start(e.touches[0].clientX), { passive: true });
    card.addEventListener("touchmove",  e => move(e.touches[0].clientX),  { passive: true });
    card.addEventListener("touchend", end);
    // Mouse
    card.addEventListener("mousedown", e => start(e.clientX));
    window.addEventListener("mousemove", e => move(e.clientX));
    window.addEventListener("mouseup", end);
  }

  function resetCard(card) {
    card.classList.remove("swipe-out-right", "swipe-out-left");
    card.style.transform = "";
  }

  function simulateSwipe(card, dir) {
    card.classList.add(dir === "right" ? "swipe-out-right" : "swipe-out-left");
    setTimeout(() => { resetCard(card); }, 560);
  }

  function incrementSwipe() {
    state.swipeCount++;
    localStorage.setItem("swipes", String(state.swipeCount));
    if (!state.plus) {
      if (state.swipeCount === 10 || (state.swipeCount > 10 && (state.swipeCount - 10) % 5 === 0)) {
        openRewardDialog("Video per continuare a fare swipe");
      }
    }
  }

  function maybeMatch() {
    if (Math.random() < 0.55) {
      state.matches++;
      localStorage.setItem("matches", String(state.matches));
      if (!state.plus && state.matches >= 1) {
        // Interstitial soft (mock) dopo ogni match
        showMatchBurst();
      } else {
        showMatchBurst();
      }
    }
  }

  function showMatchBurst() {
    const overlay = document.createElement("div");
    overlay.className = "match-popup";
    overlay.innerHTML = `<div class="heart">💛</div>`;
    document.body.appendChild(overlay);
    setTimeout(() => overlay.remove(), 1200);
  }

  // ------------------ Profilo & Selfie ------------------
  window.openProfile = (dog) => {
    profileSheet.classList.remove("hidden");
    setTimeout(() => profileSheet.classList.add("show"), 10);

    const selfieUnlocked = isSelfieUnlocked(dog.id);

    ppBody.innerHTML = `
      <div class="pp-hero">
        <img src="${dog.img}" alt="${dog.name}" style="width:100%;height:230px;object-fit:cover;border:3px solid #CDA434;border-radius:14px;">
      </div>
      <div class="pp-head" style="display:flex;align-items:center;gap:.6rem;flex-wrap:wrap;margin:.4rem 0 .6rem 0">
        <h2 class="pp-name gold-text" style="margin:0">${dog.name} ${dog.verified ? "✅" : ""}</h2>
        <div class="pp-badges" style="display:flex;gap:.4rem;align-items:center;flex-wrap:wrap">
          <span class="badge">Razza: ${dog.breed}</span>
          <span class="badge">Età: ${dog.age} ${state.lang==="it"?"anni":"yrs"}</span>
          <span class="badge">Distanza: ${dog.km.toFixed(1)} km</span>
          <span class="badge">Sesso: ${dog.sex === "M" ? "Maschio" : "Femmina"}</span>
        </div>
      </div>
      <div class="pp-meta soft">Profilo verificabile con documenti di cane e proprietario (mock).</div>

      <h3 class="section-title">Galleria</h3>
      <div class="gallery">
        ${dog.gallery.map(src => `<div class="ph"><img src="${src}" alt="${dog.name}"></div>`).join("")}
      </div>

      <div class="separator"></div>

      <h3 class="section-title">Selfie</h3>
      <div class="selfie ${selfieUnlocked ? "unlocked" : ""}">
        <img class="img" src="${dog.img}" alt="Selfie di ${dog.name}">
        <div class="over">
          <button id="unlockSelfie" class="btn small ${selfieUnlocked?'ghost':''}">${selfieUnlocked ? "Sbloccato 24h" : "Sblocca selfie"}</button>
          <button id="openSelfieFull" class="btn small" ${selfieUnlocked ? "" : "disabled"}>Apri</button>
        </div>
      </div>

      <div class="separator"></div>

      <h3 class="section-title">Impostazioni profilo</h3>
      <div class="pp-actions">
        <button id="btnDocsOwner" class="btn ghost small">Documenti proprietario (mock)</button>
        <button id="btnDocsDog" class="btn ghost small">Documenti cane (mock)</button>
        <label class="badge">Disponibile per accoppiamento:
          <select id="ppMating" class="btn small" style="background:#2a1c3b;color:#fff;border:1px solid rgba(205,164,52,.35)">
            <option value="yes" ${dog.mating==="yes"?"selected":""}>Sì</option>
            <option value="no"  ${dog.mating==="no" ?"selected":""}>No</option>
          </select>
        </label>
        <button id="btnOpenChat" class="btn small">Apri chat</button>
      </div>
    `;

    $("btnDocsOwner").onclick = () => { alert("Upload documenti proprietario (mock)"); dog.verified = true; renderNearby(); };
    $("btnDocsDog").onclick   = () => { alert("Upload documenti cane (mock)"); dog.verified = true; renderNearby(); };
    $("ppMating").onchange    = (e) => { dog.mating = e.target.value; };
    $("btnOpenChat").onclick  = () => { closeProfilePage(); setTimeout(() => openChat(dog), 180); };

    $("unlockSelfie").onclick = async () => {
      if (!isSelfieUnlocked(dog.id)) {
        await openRewardDialog("Video per sbloccare il selfie per 24h");
        state.selfieUntilByDog[dog.id] = Date.now() + 24 * 60 * 60 * 1000;
        localStorage.setItem("selfieUntilByDog", JSON.stringify(state.selfieUntilByDog));
        openProfile(dog); // rerender
      }
    };
    $("openSelfieFull").onclick = () => { if (isSelfieUnlocked(dog.id)) openSelfiePage(dog); };
  };

  window.closeProfilePage = () => {
    profileSheet.classList.remove("show");
    setTimeout(() => profileSheet.classList.add("hidden"), 250);
  };

  function isSelfieUnlocked(dogId) {
    return Date.now() < (state.selfieUntilByDog[dogId] || 0);
  }

  function openSelfiePage(dog) {
    state.currentDogForSelfie = dog;
    selfieFullImg.src = dog.img;
    selfieCaption.textContent = `Selfie di ${dog.name}`;
    selfieLikeCount.textContent = String(state.likesBySelfie[selfieKey(dog.id)] || 0);
    selfiePage.classList.remove("hidden");
  }

  function closeSelfie() {
    selfiePage.classList.add("hidden");
    state.currentDogForSelfie = null;
  }

  selfieLike?.addEventListener("click", () => {
    const dog = state.currentDogForSelfie;
    if (!dog) return;
    const key = selfieKey(dog.id);
    const cur = state.likesBySelfie[key] || 0;
    state.likesBySelfie[key] = cur + 1;
    localStorage.setItem("likesBySelfie", JSON.stringify(state.likesBySelfie));
    selfieLikeCount.textContent = String(state.likesBySelfie[key]);
  });

  const selfieKey = (id) => `selfieLike_${id}`;

  // ------------------ Chat ------------------
  function openChat(dog) {
    chatPane.classList.remove("hidden");
    setTimeout(() => chatPane.classList.add("show"), 10);
    chatPane.dataset.dogId = dog.id;
    chatList.innerHTML = `<div class="msg">Ciao ${dog.name}! 🐾</div>`;
    chatInput.value = "";
  }

  function closeChat() {
    chatPane.classList.remove("show");
    setTimeout(() => chatPane.classList.add("hidden"), 250);
  }

  async function onChatSubmit(e) {
    e.preventDefault();
    const text = (chatInput.value || "").trim();
    if (!text) return;
    const dogId = chatPane.dataset.dogId || "unknown";

    if (!state.plus && !state.firstMsgRewardByDog[dogId]) {
      await openRewardDialog("Video per inviare il primo messaggio");
      state.firstMsgRewardByDog[dogId] = true;
      localStorage.setItem("firstMsgRewardByDog", JSON.stringify(state.firstMsgRewardByDog));
    }

    const bubble = document.createElement("div");
    bubble.className = "msg me";
    bubble.textContent = text;
    chatList.appendChild(bubble);
    chatInput.value = "";
    chatList.scrollTop = chatList.scrollHeight;
  }

  // ------------------ Plus (mock) ------------------
  function openPlusDialog() {
    const panel = document.createElement("div");
    panel.className = "panel";
    panel.innerHTML = `
      <div class="panel-inner" style="text-align:center">
        <h3 style="color:#CDA434">${t("plusTitle")}</h3>
        <p class="soft">${t("plusCopy")}</p>
        <button id="plOn" class="btn primary">${t("activateNow")}</button>
        <button id="plClose" class="btn ghost small" style="margin-top:.6rem">${t("close")}</button>
      </div>
    `;
    document.body.appendChild(panel);
    $("plOn").onclick = () => {
      state.plus = true;
      localStorage.setItem("plutoo_plus", "1");
      enableGoldInputs();
      adBanner && (adBanner.style.display = "none");
      panel.remove();
      alert("Plutoo Plus attivato!");
    };
    $("plClose").onclick = () => panel.remove();
  }

  function enableGoldInputs() {
    [matingInput, pedigreeInput, microchipInput, vacciniInput, titleInput, weightInput, heightInput].forEach(el => {
      el && el.removeAttribute("disabled");
      el?.closest(".f-lock") && (el.closest(".f-lock").style.opacity = "1");
    });
  }

  function disableGoldInputs() {
    [matingInput, pedigreeInput, microchipInput, vacciniInput, titleInput, weightInput, heightInput].forEach(el => {
      el && el.setAttribute("disabled", "disabled");
      el?.closest(".f-lock") && (el.closest(".f-lock").style.opacity = "0.6");
    });
  }

  // ------------------ Reward (mock) ------------------
  function openRewardDialog(message, onDone) {
    if (state.plus) { onDone && onDone(); return; }
    const panel = document.createElement("div");
    panel.className = "panel";
    panel.innerHTML = `
      <div class="panel-inner" style="text-align:center">
        <h3 style="color:#CDA434">🎬 ${message || t("watchVideo")}</h3>
        <p class="soft">Demo: non vengono caricati annunci reali.</p>
        <button id="rwStart" class="btn primary">Guarda ora</button>
      </div>
    `;
    document.body.appendChild(panel);
    $("rwStart").onclick = async () => {
      qs(".panel-inner", panel).innerHTML = `<h3 style="color:#CDA434">${t("videoPlaying")}</h3>`;
      await wait(2200);
      panel.remove();
      onDone && onDone();
    };
  }

  // Apri URL esterno con pre-open (evita popup blocker) + reward
  function safeOpenWithReward(message, url) {
    if (state.plus) {
      window.open(url, "_blank");
      return;
    }
    let pre = window.open("", "_blank");
    openRewardDialog(message, () => {
      try {
        if (pre) pre.location = url;
        else window.open(url, "_blank");
      } catch {
        window.location.href = url;
      }
    });
  }

  // ------------------ Maps helper ------------------
  function mapsUrlFor(cat) {
    const q = {
      shelters: t("mapsShelters"),
      vets:     t("mapsVets"),
      groomers: t("mapsGroomers"),
      shops:    t("mapsShops"),
      parks:    t("mapsParks"),
      trainers: t("mapsTrainers")
    }[cat] || "servizi animali vicino a me";
    if (state.geo) return `geo:${state.geo.lat},${state.geo.lon}?q=${encodeURIComponent(q)}`;
    return `https://www.google.com/maps/search/${encodeURIComponent(q)}`;
  }

  // ------------------ Avvio ------------------
  initUI();

})();
