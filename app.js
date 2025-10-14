/* =========================================================
   Plutoo — app.js (final, test-ready for Play Console)
   Tema: Viola/ Oro / Rosa · Mock monetization ON
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  console.log("🐾 Plutoo avviato");

  /* ---------- Element refs (safe) ---------- */
  const $ = (id) => document.getElementById(id);

  // Home
  const homeScreen = $("homeScreen");
  const btnEnter = $("btnEnter");
  const sponsorLink = $("sponsorLink");

  // App shell
  const appScreen = $("appScreen");
  const btnPlus = $("btnPlus");
  const tabLove = $("tabLove");
  const tabSocial = $("tabSocial");
  const tabPlus = $("tabPlus"); // solo trigger Plus

  // Swipe card
  const socCard = $("socCard");
  const socImg = $("socImg");
  const socTitle = $("socTitle");
  const socMeta = $("socMeta");
  const socBio = $("socBio");

  // Actions (Amore)
  const loveActions = $("loveActions");
  const btnNo = $("socNo");
  const btnYes = $("socYes");

  // Actions (Social)
  const socialActions = $("socialActions");
  const btnPlayNo = $("socPlayNo");
  const btnPlayYes = $("socPlayYes");

  // Selfie
  const selfieImg = $("selfieImg");
  const unlockBtn = $("unlockBtn");
  const uploadSelfie = $("uploadSelfie");

  // Filters + list
  const breedInput = $("breedInput");
  const breedsList = $("breedsList");
  const weightInput = $("weightInput");
  const heightInput = $("heightInput");
  const distRange = $("distRange");
  const distLabel = $("distLabel");
  const nearList = $("nearList");

  // Chat
  const chatPane = $("chatPane");
  const closeChatBtn = $("closeChat");
  const chatList = $("chatList");
  const chatComposer = $("chatComposer");
  const chatInput = $("chatInput");

  // Profile
  const profileSheet = $("profileSheet");
  const ppBody = $("ppBody");

  // Ads area
  const adBanner = $("adBanner");

  /* ---------- State ---------- */
  const state = {
    deck: "love",            // "love" | "social"
    dogs: [],                // dataset cani
    breeds: [],              // elenco razze
    currentIdx: 0,           // indice card corrente (deck)
    swipeCount: parseInt(localStorage.getItem("swipeCount") || "0"),
    matchesCount: parseInt(localStorage.getItem("matchesCount") || "0"),
    selfieUnlockedUntil: parseInt(localStorage.getItem("selfieUnlockedUntil") || "0"),
    plusActive: localStorage.getItem("plusActive") === "true",
    chatRewardsDone: JSON.parse(localStorage.getItem("chatRewardsDone") || "{}"), // {dogId:true}
    verifiedProfiles: new Set(), // mock: id profili con badge
    geo: null,
  };

  /* ---------- Helpers ---------- */
  const show = (el) => el && el.classList.add("show");
  const hide = (el) => el && el.classList.remove("show");
  const unhide = (el) => el && el.classList.remove("hidden");
  const conceal = (el) => el && el.classList.add("hidden");
  const fmtKm = (n) => `${n.toFixed(1)} km`;
  const isSelfieUnlocked = () => Date.now() < state.selfieUnlockedUntil;
  const save = (k, v) => localStorage.setItem(k, v);

  // Mock Reward: single entry point (replace with AdMob later)
  function showReward(message = "Guarda un breve video per continuare") {
    // non-bloccante per i test: alert che simula completamento
    alert(`${message}\n\n(Mock completato)`);
  }

  // Banner mock
  function renderBanner() {
    if (!adBanner) return;
    adBanner.textContent = state.plusActive ? "Plutoo Plus attivo — niente banner" : "Banner pubblicitario (mock)";
  }

  // Plus mock
  window.openPlusDialog = () => {
    if (state.plusActive) {
      const off = confirm("Plutoo Plus è attivo. Vuoi disattivarlo (mock)?");
      if (off) {
        state.plusActive = false;
        save("plusActive", "false");
        renderBanner();
        alert("Plutoo Plus disattivato (mock).");
      }
      return;
    }
    const go = confirm("Attivare Plutoo Plus (mock)? Rimuove banner e video.");
    if (go) {
      state.plusActive = true;
      save("plusActive", "true");
      renderBanner();
      alert("Plutoo Plus attivato (mock).");
    }
  };

  /* ---------- Home → App ---------- */
  sponsorLink?.addEventListener("click", (e) => {
    e.preventDefault();
    // Reward sul click sponsor (monetizzazione)
    if (!state.plusActive) showReward("Video prima di aprire lo sponsor");
    window.open("https://example.com/fido-gelato", "_blank", "noopener");
  });

  btnEnter?.addEventListener("click", () => {
    // piccola animazione heart (già CSS pulse); delay per sensazione "ingresso"
    conceal(homeScreen);
    unhide(appScreen);
    appScreen.setAttribute("aria-hidden", "false");
    // persist minimal session
    save("entered", "1");
  });

  // Autologin mock (se già entrato)
  if (localStorage.getItem("entered") === "1") {
    conceal(homeScreen);
    unhide(appScreen);
    appScreen.setAttribute("aria-hidden", "false");
  }

  /* ---------- Tabs (deck switching) ---------- */
  function setDeck(mode) {
    state.deck = mode; // "love" | "social"
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
    // reset card index
    state.currentIdx = 0;
    renderCurrentCard();
  }

  tabLove?.addEventListener("click", () => setDeck("love"));
  tabSocial?.addEventListener("click", () => setDeck("social"));

  /* ---------- Dataset (mock locale) ---------- */
  const MOCK_DOGS = [
    { id: "d1", name: "Luna",   age: 2, breed: "Golden Retriever", km: 1.2, mode: "love",   bio: "Dolcissima e giocherellona.", img: "dog1.jpg", verified: true },
    { id: "d2", name: "Rex",    age: 4, breed: "Pastore Tedesco",  km: 3.4, mode: "social", bio: "Adoro la palla e correre.",   img: "dog2.jpg", verified: true },
    { id: "d3", name: "Maya",   age: 3, breed: "Bulldog Francese", km: 2.1, mode: "love",   bio: "Coccole e passeggiate.",     img: "dog3.jpg", verified: false },
    { id: "d4", name: "Rocky",  age: 5, breed: "Beagle",           km: 4.0, mode: "social", bio: "Naso infallibile, amici ovunque.", img: "dog4.jpg", verified: true },
  ];

  function loadDogs() {
    // In futuro: fetch da backend; qui mock locale + shuffle leggero
    state.dogs = [...MOCK_DOGS];
    state.verifiedProfiles = new Set(state.dogs.filter(d => d.verified).map(d => d.id));
  }

  // Breeds
  function loadBreeds() {
    fetch("breeds.json")
      .then(res => res.json())
      .then(list => {
        state.breeds = Array.isArray(list) ? list : [];
      })
      .catch(() => { state.breeds = []; });
  }

  /* ---------- Render Card ---------- */
  function getDeckDogs() {
    return state.dogs.filter(d => d.mode === (state.deck === "love" ? "love" : "social"));
  }

  function renderCurrentCard() {
    const deckDogs = getDeckDogs();
    if (deckDogs.length === 0) {
      socImg.src = "dog1.jpg";
      socTitle.textContent = "Nessun profilo";
      socMeta.textContent = "Modifica i filtri o riprova più tardi";
      socBio.textContent = "—";
      return;
    }
    const d = deckDogs[Math.min(state.currentIdx, deckDogs.length - 1)];
    socImg.src = d.img;
    socTitle.textContent = `${d.name}, ${d.age} anni`;
    socMeta.textContent = `${d.breed} • ${fmtKm(d.km)} • ${state.deck === "love" ? "Amore" : "Giochiamo"}`;
    socBio.textContent = d.bio || "—";
    // click su immagine → profilo
    socImg.onclick = () => openProfile(d);
  }

  /* ---------- Swipe / Match / Gating ---------- */
  function afterSwipe() {
    state.swipeCount++;
    save("swipeCount", String(state.swipeCount));
    // gating: dopo 10 swipe, poi ogni +5
    if (!state.plusActive) {
      if (state.swipeCount === 10 || (state.swipeCount > 10 && (state.swipeCount - 10) % 5 === 0)) {
        showReward("Video per continuare a fare swipe");
      }
    }
    // prossima card
    state.currentIdx = (state.currentIdx + 1) % Math.max(1, getDeckDogs().length);
    renderCurrentCard();
  }

  function showMatchPopup() {
    const popup = document.createElement("div");
    popup.className = "sheet show";
    popup.innerHTML = `
      <div class="sheet-header">
        <div style="font-weight:800;color:#f7c6d9">È un Match! 💘</div>
        <button class="icon close" aria-label="Chiudi" onclick="this.closest('.sheet').remove()">✕</button>
      </div>
      <div class="sheet-body">
        <p style="margin-top:0">Avete fatto amicizia! Invia un primo messaggio per rompere il ghiaccio.</p>
        <button class="btn" onclick="document.querySelector('.sheet').remove()">Chiudi</button>
      </div>`;
    document.body.appendChild(popup);
  }

  function handleYes() {
    // like → possibile match (mock: 50% chance)
    const matched = Math.random() < 0.5;
    if (matched) {
      state.matchesCount++;
      save("matchesCount", String(state.matchesCount));
      // gating: dal 4° match in poi → reward
      if (!state.plusActive && state.matchesCount >= 4) {
        showReward("Video per sbloccare il nuovo match");
      }
      showMatchPopup();
    }
    afterSwipe();
  }

  function handleNo() {
    afterSwipe();
  }

  // Amore
  btnYes?.addEventListener("click", handleYes);
  btnNo?.addEventListener("click", handleNo);
  // Social
  btnPlayYes?.addEventListener("click", handleYes);
  btnPlayNo?.addEventListener("click", handleNo);

  /* ---------- Selfie blur (24h) ---------- */
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

  unlockBtn?.addEventListener("click", () => {
    if (!state.plusActive) showReward("Video per sbloccare il selfie");
    state.selfieUnlockedUntil = Date.now() + 24 * 60 * 60 * 1000;
    save("selfieUnlockedUntil", String(state.selfieUnlockedUntil));
    updateSelfieUI();
  });

  uploadSelfie?.addEventListener("click", () => {
    alert("Upload selfie (mock). In futuro: file picker + upload sicuro.");
  });

  /* ---------- Nearby list + Filtri ---------- */
  function applyFiltersAndRenderList() {
    const breed = (breedInput.value || "").toLowerCase().trim();
    const w = parseFloat(weightInput.value || "0");
    const h = parseFloat(heightInput.value || "0");
    const maxKm = parseInt(distRange.value || "50");

    const result = state.dogs
      .filter(d => d.km <= maxKm)
      .filter(d => !breed || d.breed.toLowerCase().includes(breed))
      .filter(d => !w || d.weight ? d.weight <= w : true) // weight mock (non presente in dataset)
      .filter(d => !h || d.height ? d.height <= h : true); // height mock

    nearList.innerHTML = "";
    if (!result.length) {
      nearList.innerHTML = `<div class="row"><div></div><div><p class="rtitle">Nessun cane trovato</p><p class="rmeta">Prova ad allargare i filtri</p></div><div></div></div>`;
      return;
    }

    result.forEach(d => {
      const row = document.createElement("div");
      row.className = "row";
      row.innerHTML = `
        <img src="${d.img}" alt="${d.name}">
        <div>
          <p class="rtitle">${d.name} ${d.verified ? "✅" : ""}</p>
          <p class="rmeta">${d.breed} • ${fmtKm(d.km)} • ${d.age} anni • ${d.mode === "love" ? "Amore" : "Giochiamo"}</p>
        </div>
        <div>
          <button class="btn ghost" type="button">Apri profilo</button>
        </div>`;
      row.querySelector(".btn").addEventListener("click", () => {
        if (!state.plusActive) showReward("Video prima di aprire il profilo");
        openProfile(d);
      });
      nearList.appendChild(row);
    });
  }

  distRange?.addEventListener("input", () => {
    distLabel.textContent = `${distRange.value} km`;
    applyFiltersAndRenderList();
  });

  [weightInput, heightInput].forEach(el => {
    el?.addEventListener("input", applyFiltersAndRenderList);
  });

  breedInput?.addEventListener("input", () => {
    const val = breedInput.value.toLowerCase();
    breedsList.innerHTML = "";
    if (!val) { breedsList.classList.remove("show"); return; }
    const matches = state.breeds.filter(b => b.toLowerCase().includes(val)).slice(0, 12);
    if (matches.length) {
      breedsList.classList.add("show");
      breedsList.innerHTML = matches.map(b => `<div class="item" role="option">${b}</div>`).join("");
      breedsList.querySelectorAll(".item").forEach(el => {
        el.addEventListener("click", () => {
          breedInput.value = el.textContent;
          breedsList.classList.remove("show");
          applyFiltersAndRenderList();
        });
      });
    } else {
      breedsList.classList.remove("show");
    }
  });

  document.addEventListener("click", (e) => {
    if (!breedsList.contains(e.target) && e.target !== breedInput) {
      breedsList.classList.remove("show");
    }
  });

  /* ---------- Profilo (documenti & badge mock) ---------- */
  window.openProfile = (d) => {
    show(profileSheet);
    profileSheet.classList.add("show");
    ppBody.innerHTML = `
      <div class="center" style="margin-bottom:10px;">
        <img src="${d.img}" alt="${d.name}" style="width:100%;max-height:300px;object-fit:cover;border-radius:12px;border:1px solid #3a2a44;">
      </div>
      <h2 style="margin:.2rem 0 0">${d.name} ${d.verified ? "✅" : ""}</h2>
      <p class="rmeta" style="margin:.2rem 0">${d.breed} • ${fmtKm(d.km)} • ${d.age} anni</p>
      <p style="margin:.4rem 0 1rem">${d.bio || ""}</p>

      <div style="display:grid;gap:8px;margin-bottom:10px;">
        <button class="btn outline" id="btnDocs">Carica documenti (vaccini, microchip, proprietario)</button>
        <button class="btn" id="btnChat">Apri chat</button>
      </div>

      <div class="sponsor-wrap" style="border-top:1px solid #2a1f32;padding-top:10px;">
        <div class="sponsor-title">Sponsor ufficiale</div>
        <img src="sponsor-logo.png" alt="Fido" class="sponsor-logo" />
        <p class="sponsor-copy">Fido, il gelato per i nostri amici a quattro zampe</p>
      </div>
    `;

    $("btnDocs").addEventListener("click", () => {
      alert("Upload documenti (mock). Al completamento, il profilo diventa Verificato.");
      d.verified = true;
      state.verifiedProfiles.add(d.id);
      applyFiltersAndRenderList();
      openProfile(d); // refresh sheet
    });

    $("btnChat").addEventListener("click", () => {
      closeProfilePage();
      setTimeout(() => openChat(d), 180);
    });
  };

  window.closeProfilePage = () => {
    profileSheet.classList.remove("show");
    setTimeout(() => hide(profileSheet), 250);
  };

  /* ---------- Chat (reward solo primo messaggio post-match) ---------- */
  function openChat(dog) {
    show(chatPane);
    chatPane.classList.add("show");
    chatList.innerHTML = `<div class="msg">Ciao ${dog.name}! 🐶</div>`;
    chatInput.value = "";
    chatList.scrollTop = chatList.scrollHeight;
    chatPane.dataset.dogId = dog.id;
  }

  function closeChat() {
    chatPane.classList.remove("show");
    setTimeout(() => hide(chatPane), 250);
  }

  closeChatBtn?.addEventListener("click", closeChat);

  chatComposer?.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (!text) return;

    const dogId = chatPane.dataset.dogId || "unknown";
    const isFirstMsg = !state.chatRewardsDone[dogId];

    // Regola: video SOLO al primo messaggio dopo match (per questa chat)
    if (!state.plusActive && isFirstMsg) {
      showReward("Video per inviare il primo messaggio");
      state.chatRewardsDone[dogId] = true;
      save("chatRewardsDone", JSON.stringify(state.chatRewardsDone));
    }

    const msg = document.createElement("div");
    msg.className = "msg me";
    msg.textContent = text;
    chatList.appendChild(msg);
    chatInput.value = "";
    chatList.scrollTop = chatList.scrollHeight;
  });

  /* ---------- Geolocalizzazione (servizi) ---------- */
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        state.geo = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        console.log("Geo OK:", state.geo);
      },
      (err) => { console.warn("Geo non concessa:", err.message); }
    );
  }

  // servizi: mock open (reward → open)
  function openService(url) {
    if (!state.plusActive) showReward("Video prima di aprire il servizio");
    window.open(url, "_blank", "noopener");
  }
  // (Ui dei servizi potrà essere aggiunta come lista; qui abbiamo l’API pronta)

  /* ---------- Init ---------- */
  function init() {
    renderBanner();
    loadDogs();
    loadBreeds();
    setDeck("love"); // default
    distLabel.textContent = `${distRange.value} km`;
    renderCurrentCard();
    applyFiltersAndRenderList();
  }

  init();
});
