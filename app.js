/* =========================================================
   Plutoo — app.js (tema viola/oro/rosa, test-ready)
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  console.log("🐾 Plutoo avviato");

  const $ = (id) => document.getElementById(id);

  /* ---------- Riferimenti principali ---------- */
  const homeScreen = $("homeScreen");
  const heroLogo = $("heroLogo");
  const btnEnter = $("btnEnter");
  const sponsorLink = $("sponsorLink");
  const appScreen = $("appScreen");
  const adBanner = $("adBanner");

  const tabLove = $("tabLove");
  const tabSocial = $("tabSocial");
  const loveActions = $("loveActions");
  const socialActions = $("socialActions");
  const socImg = $("socImg");
  const socTitle = $("socTitle");
  const socMeta = $("socMeta");
  const socBio = $("socBio");

  const btnNo = $("socNo");
  const btnYes = $("socYes");
  const btnPlayNo = $("socPlayNo");
  const btnPlayYes = $("socPlayYes");

  const breedInput = $("breedInput");
  const breedsList = $("breedsList");
  const weightInput = $("weightInput");
  const heightInput = $("heightInput");
  const distRange = $("distRange");
  const distLabel = $("distLabel");
  const nearList = $("nearList");

  const selfieImg = $("selfieImg");
  const unlockBtn = $("unlockBtn");
  const uploadSelfie = $("uploadSelfie");

  const chatPane = $("chatPane");
  const chatList = $("chatList");
  const chatComposer = $("chatComposer");
  const chatInput = $("chatInput");
  const closeChatBtn = $("closeChat");

  const profileSheet = $("profileSheet");
  const ppBody = $("ppBody");

  /* ---------- Stato ---------- */
  const state = {
    deck: "love",
    dogs: [],
    breeds: [],
    currentIdx: 0,
    swipeCount: parseInt(localStorage.getItem("swipeCount") || "0"),
    matchesCount: parseInt(localStorage.getItem("matchesCount") || "0"),
    selfieUnlockedUntil: parseInt(localStorage.getItem("selfieUnlockedUntil") || "0"),
    plusActive: localStorage.getItem("plusActive") === "true",
    chatRewardsDone: JSON.parse(localStorage.getItem("chatRewardsDone") || "{}"),
    verifiedProfiles: new Set(),
    geo: null,
  };

  /* ---------- Helpers ---------- */
  const show = (el) => el && el.classList.add("show");
  const hide = (el) => el && el.classList.remove("show");
  const conceal = (el) => el && el.classList.add("hidden");
  const unhide = (el) => el && el.classList.remove("hidden");
  const fmtKm = (n) => `${n.toFixed(1)} km`;
  const isSelfieUnlocked = () => Date.now() < state.selfieUnlockedUntil;
  const save = (k, v) => localStorage.setItem(k, v);

  function showReward(msg = "Guarda un breve video per continuare") {
    alert(`${msg}\n\n(Mock completato ✅)`);
  }

  function renderBanner() {
    adBanner.textContent = state.plusActive
      ? "Plutoo Plus attivo — niente banner"
      : "Banner pubblicitario (mock)";
  }

  window.openPlusDialog = () => {
    if (state.plusActive) {
      if (confirm("Vuoi disattivare Plutoo Plus (mock)?")) {
        state.plusActive = false;
        save("plusActive", "false");
        renderBanner();
        alert("Plutoo Plus disattivato.");
      }
      return;
    }
    if (confirm("Attivare Plutoo Plus (mock)? Rimuove banner e video.")) {
      state.plusActive = true;
      save("plusActive", "true");
      renderBanner();
      alert("Plutoo Plus attivato!");
    }
  };

  /* ---------- HOME → APP ---------- */
  sponsorLink?.addEventListener("click", (e) => {
    e.preventDefault();
    if (!state.plusActive) showReward("Video prima di aprire lo sponsor");
    window.open("https://example.com/fido-gelato", "_blank", "noopener");
  });

  btnEnter?.addEventListener("click", () => {
    // battito cuore logo
    heroLogo.classList.add("pulse");
    setTimeout(() => {
      heroLogo.classList.remove("pulse");
      conceal(homeScreen);
      unhide(appScreen);
      save("entered", "1");
    }, 1300);
  });

  // autologin mock
  if (localStorage.getItem("entered") === "1") {
    conceal(homeScreen);
    unhide(appScreen);
  }

  /* ---------- Tabs ---------- */
  function setDeck(mode) {
    state.deck = mode;
    if (mode === "love") {
      tabLove.classList.add("active");
      tabSocial.classList.remove("active");
      unhide(loveActions);
      conceal(socialActions);
    } else {
      tabSocial.classList.add("active");
      tabLove.classList.remove("active");
      unhide(socialActions);
      conceal(loveActions);
    }
    state.currentIdx = 0;
    renderCard();
  }
  tabLove?.addEventListener("click", () => setDeck("love"));
  tabSocial?.addEventListener("click", () => setDeck("social"));

  /* ---------- Dati mock ---------- */
  const MOCK_DOGS = [
    { id: "d1", name: "Luna", age: 2, breed: "Golden Retriever", km: 1.2, mode: "love", bio: "Dolcissima e giocherellona.", img: "dog1.jpg", verified: true },
    { id: "d2", name: "Rex", age: 4, breed: "Pastore Tedesco", km: 3.4, mode: "social", bio: "Adoro la palla e correre.", img: "dog2.jpg", verified: true },
    { id: "d3", name: "Maya", age: 3, breed: "Bulldog Francese", km: 2.1, mode: "love", bio: "Coccole e passeggiate.", img: "dog3.jpg", verified: false },
    { id: "d4", name: "Rocky", age: 5, breed: "Beagle", km: 4.0, mode: "social", bio: "Naso infallibile e amici ovunque.", img: "dog4.jpg", verified: true },
  ];

  function loadDogs() {
    state.dogs = [...MOCK_DOGS];
    state.verifiedProfiles = new Set(state.dogs.filter(d => d.verified).map(d => d.id));
  }

  function loadBreeds() {
    fetch("breeds.json")
      .then(res => res.json())
      .then(list => state.breeds = Array.isArray(list) ? list : [])
      .catch(() => state.breeds = []);
  }

  /* ---------- Card ---------- */
  function getDeckDogs() {
    return state.dogs.filter(d => d.mode === state.deck);
  }

  function renderCard() {
    const deck = getDeckDogs();
    if (!deck.length) {
      socImg.src = "dog1.jpg";
      socTitle.textContent = "Nessun profilo";
      socMeta.textContent = "Modifica i filtri";
      socBio.textContent = "—";
      return;
    }
    const d = deck[state.currentIdx % deck.length];
    socImg.src = d.img;
    socTitle.textContent = `${d.name}, ${d.age} anni`;
    socMeta.textContent = `${d.breed} • ${fmtKm(d.km)} • ${state.deck === "love" ? "Amore" : "Giochiamo"}`;
    socBio.textContent = d.bio;
    socImg.onclick = () => openProfile(d);
  }

  function afterSwipe() {
    state.swipeCount++;
    save("swipeCount", state.swipeCount);
    if (!state.plusActive) {
      if (state.swipeCount === 10 || (state.swipeCount > 10 && (state.swipeCount - 10) % 5 === 0)) {
        showReward("Video per continuare a fare swipe");
      }
    }
    state.currentIdx = (state.currentIdx + 1) % getDeckDogs().length;
    renderCard();
  }

  function showMatchPopup() {
    const pop = document.createElement("div");
    pop.className = "sheet show";
    pop.innerHTML = `
      <div class="sheet-header"><strong style="color:#F7C6D9">È un Match! 💘</strong>
        <button class="icon close" onclick="this.closest('.sheet').remove()">✕</button>
      </div>
      <div class="sheet-body center">
        <p>Hai trovato un nuovo amico! Manda un messaggio per iniziare 🐾</p>
        <button class="btn" onclick="this.closest('.sheet').remove()">Chiudi</button>
      </div>`;
    document.body.appendChild(pop);
  }

  function handleYes() {
    if (Math.random() < 0.5) {
      state.matchesCount++;
      save("matchesCount", state.matchesCount);
      if (!state.plusActive && state.matchesCount >= 4) {
        showReward("Video per sbloccare il nuovo match");
      }
      showMatchPopup();
    }
    afterSwipe();
  }

  btnYes.addEventListener("click", handleYes);
  btnNo.addEventListener("click", afterSwipe);
  btnPlayYes.addEventListener("click", handleYes);
  btnPlayNo.addEventListener("click", afterSwipe);

  /* ---------- Selfie ---------- */
  function updateSelfie() {
    if (isSelfieUnlocked()) {
      selfieImg.classList.remove("selfie-blur");
      unlockBtn.disabled = true;
    } else {
      selfieImg.classList.add("selfie-blur");
      unlockBtn.disabled = false;
    }
  }
  updateSelfie();

  unlockBtn.addEventListener("click", () => {
    if (!state.plusActive) showReward("Video per sbloccare il selfie");
    state.selfieUnlockedUntil = Date.now() + 24 * 60 * 60 * 1000;
    save("selfieUnlockedUntil", state.selfieUnlockedUntil);
    updateSelfie();
  });

  /* ---------- Filtri e lista ---------- */
  function applyFilters() {
    const maxKm = parseInt(distRange.value || "50");
    const breed = (breedInput.value || "").toLowerCase();
    const list = state.dogs.filter(d => d.km <= maxKm && d.breed.toLowerCase().includes(breed));
    nearList.innerHTML = list.map(d => `
      <div class="row">
        <img src="${d.img}" alt="${d.name}">
        <div>
          <p class="rtitle">${d.name} ${d.verified ? "✅" : ""}</p>
          <p class="rmeta">${d.breed} • ${fmtKm(d.km)} • ${d.age} anni</p>
        </div>
        <div><button class="btn ghost">Apri profilo</button></div>
      </div>`).join("");

    nearList.querySelectorAll(".btn").forEach((b, i) => {
      b.addEventListener("click", () => {
        if (!state.plusActive) showReward("Video prima di aprire il profilo");
        openProfile(list[i]);
      });
    });
  }
  distRange.addEventListener("input", () => {
    distLabel.textContent = `${distRange.value} km`;
    applyFilters();
  });
  breedInput.addEventListener("input", applyFilters);

  /* ---------- Profilo ---------- */
  window.openProfile = (d) => {
    show(profileSheet);
    ppBody.innerHTML = `
      <div class="center"><img src="${d.img}" style="width:100%;border-radius:12px;"></div>
      <h2>${d.name} ${d.verified ? "✅" : ""}</h2>
      <p class="rmeta">${d.breed} • ${fmtKm(d.km)} • ${d.age} anni</p>
      <p>${d.bio}</p>
      <div style="margin-top:10px">
        <button class="btn outline" id="btnDocs">Carica documenti</button>
        <button class="btn" id="btnChat">Apri chat</button>
      </div>`;
    $("btnDocs").onclick = () => {
      alert("Upload documenti completato (mock).");
      d.verified = true;
      state.verifiedProfiles.add(d.id);
      applyFilters();
      openProfile(d);
    };
    $("btnChat").onclick = () => {
      closeProfilePage();
      setTimeout(() => openChat(d), 200);
    };
  };
  window.closeProfilePage = () => profileSheet.classList.remove("show");

  /* ---------- Chat ---------- */
  function openChat(d) {
    show(chatPane);
    chatList.innerHTML = `<div class="msg">Ciao ${d.name}! 🐶</div>`;
    chatPane.dataset.dogId = d.id;
  }
  function closeChat() { chatPane.classList.remove("show"); }
  closeChatBtn.addEventListener("click", closeChat);

  chatComposer.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (!text) return;
    const dogId = chatPane.dataset.dogId;
    if (!state.plusActive && !state.chatRewardsDone[dogId]) {
      showReward("Video per inviare il primo messaggio");
      state.chatRewardsDone[dogId] = true;
      save("chatRewardsDone", JSON.stringify(state.chatRewardsDone));
    }
    const msg = document.createElement("div");
    msg.className = "msg me";
    msg.textContent = text;
    chatList.appendChild(msg);
    chatInput.value = "";
  });

  /* ---------- Geo ---------- */
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      pos => state.geo = { lat: pos.coords.latitude, lon: pos.coords.longitude },
      err => console.warn("Geo non concessa:", err.message)
    );
  }

  /* ---------- Init ---------- */
  function init() {
    renderBanner();
    loadDogs();
    loadBreeds();
    renderCard();
    applyFilters();
    distLabel.textContent = `${distRange.value} km`;
  }
  init();
});
