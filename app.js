/* =========================================================
   Plutoo — app.js (core)
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  console.log("🐾 Plutoo avviato");

  /* ---------- Elementi principali ---------- */
  const card = document.getElementById("socCard");
  const yesBtn = document.getElementById("socYes");
  const noBtn = document.getElementById("socNo");
  const selfieImg = document.getElementById("selfieImg");
  const unlockBtn = document.getElementById("unlockBtn");
  const breedInput = document.getElementById("breedInput");
  const breedsList = document.getElementById("breedsList");
  const nearGrid = document.getElementById("nearGrid");
  const distRange = document.getElementById("distRange");
  const distLabel = document.getElementById("distLabel");
  const chatPane = document.getElementById("chatPane");
  const chatList = document.getElementById("chatList");
  const chatComposer = document.getElementById("chatComposer");
  const chatInput = document.getElementById("chatInput");
  const profileSheet = document.getElementById("profileSheet");

  /* ---------- Stato base ---------- */
  let swipeCount = 0;
  let selfieUnlockedUntil = 0;
  let plusActive = localStorage.getItem("plusActive") === "true";
  let currentBreedData = [];

  /* ---------- Helper ---------- */
  const show = (el) => el && el.classList.remove("hidden");
  const hide = (el) => el && el.classList.add("hidden");
  const toggle = (el) => el && el.classList.toggle("hidden");
  const safe = (cb) => { try { cb(); } catch (e) { console.warn(e); } };

  const isSelfieUnlocked = () => Date.now() < selfieUnlockedUntil;
  const lockSelfie = () => {
    selfieImg.classList.add("selfie-blur");
    unlockBtn.disabled = false;
  };
  const unlockSelfie = () => {
    selfieUnlockedUntil = Date.now() + 24 * 60 * 60 * 1000; // 24h
    selfieImg.classList.remove("selfie-blur");
    unlockBtn.disabled = true;
    localStorage.setItem("selfieUnlockedUntil", selfieUnlockedUntil);
  };

  /* ---------- Swipe / Match ---------- */
  const swipeYes = () => {
    swipeCount++;
    if (!plusActive && swipeCount > 3 && swipeCount % 5 === 0) {
      openRewardDialog("Video ricompensa per continuare a swippare");
    } else {
      showMatchPopup();
    }
  };

  const swipeNo = () => {
    swipeCount++;
  };

  const showMatchPopup = () => {
    const popup = document.createElement("div");
    popup.className = "match-popup";
    popup.innerHTML = `
      <div class="match-box">
        <h2>💘 È un Match!</h2>
        <p>Avete fatto amicizia!</p>
        <button class="btn yes" onclick="this.parentElement.parentElement.remove()">Chiudi</button>
      </div>`;
    document.body.appendChild(popup);
    setTimeout(() => popup.classList.add("show"), 50);
  };

  /* ---------- Reward mock ---------- */
  window.openRewardDialog = (msg = "Guarda un breve video per continuare") => {
    alert(msg + "\n(Mock video completato)");
  };

  /* ---------- Plus mock ---------- */
  window.openPlusDialog = () => {
    const goPlus = confirm("Vuoi attivare Plutoo Plus (rimuove pubblicità)?");
    if (goPlus) {
      plusActive = true;
      localStorage.setItem("plusActive", "true");
      alert("Plutoo Plus attivo ✅");
    }
  };

  /* ---------- Chat ---------- */
  const openChat = (dogName) => {
    show(chatPane);
    chatPane.classList.add("show");
    chatList.innerHTML = `<div class="msg">Ciao ${dogName}! 🐶</div>`;
  };
  const closeChat = () => {
    chatPane.classList.remove("show");
    setTimeout(() => hide(chatPane), 250);
  };
  document.getElementById("closeChat").addEventListener("click", closeChat);

  chatComposer.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (!text) return;
    if (!plusActive && chatList.childElementCount === 1) {
      openRewardDialog("Guarda un video per inviare il primo messaggio");
    }
    const msg = document.createElement("div");
    msg.className = "msg me";
    msg.textContent = text;
    chatList.appendChild(msg);
    chatInput.value = "";
    chatList.scrollTop = chatList.scrollHeight;
  });

  /* ---------- Selfie Blur ---------- */
  if (localStorage.getItem("selfieUnlockedUntil")) {
    selfieUnlockedUntil = parseInt(localStorage.getItem("selfieUnlockedUntil"));
  }
  if (isSelfieUnlocked()) unlockSelfie(); else lockSelfie();

  unlockBtn.addEventListener("click", () => {
    if (!plusActive) openRewardDialog("Guarda un video per sbloccare il selfie");
    unlockSelfie();
  });

  /* ---------- Filtri & Razze ---------- */
  fetch("breeds.json")
    .then((r) => r.json())
    .then((data) => { currentBreedData = data; })
    .catch(() => console.warn("Impossibile caricare razze"));

  breedInput.addEventListener("input", () => {
    const val = breedInput.value.toLowerCase();
    breedsList.innerHTML = "";
    if (!val) { breedsList.classList.remove("show"); return; }
    const matches = currentBreedData.filter((b) => b.toLowerCase().includes(val)).slice(0, 10);
    if (matches.length) {
      breedsList.classList.add("show");
      breedsList.innerHTML = matches.map((b) => `<div class="item">${b}</div>`).join("");
      breedsList.querySelectorAll(".item").forEach((el) =>
        el.addEventListener("click", () => {
          breedInput.value = el.textContent;
          breedsList.classList.remove("show");
        })
      );
    } else {
      breedsList.classList.remove("show");
    }
  });

  /* ---------- Distanza ---------- */
  distRange.addEventListener("input", () => {
    distLabel.textContent = distRange.value + " km";
  });

  /* ---------- Vicino a te ---------- */
  function loadNearby() {
    nearGrid.innerHTML = "";
    const items = [
      { name: "Luna", breed: "Golden Retriever", km: 1.2, img: "dog1.jpg" },
      { name: "Rex", breed: "Pastore Tedesco", km: 3.4, img: "dog2.jpg" },
      { name: "Maya", breed: "Bulldog Francese", km: 2.1, img: "dog3.jpg" },
      { name: "Rocky", breed: "Beagle", km: 4.0, img: "dog4.jpg" },
    ];
    items.forEach((d) => {
      const el = document.createElement("div");
      el.className = "tile";
      el.innerHTML = `
        <img src="${d.img}" alt="${d.name}" class="thumb" />
        <div class="tinfo">
          <div class="tname">${d.name}</div>
          <div class="tmeta">${d.breed} • ${d.km} km</div>
        </div>`;
      el.addEventListener("click", () => {
        if (!plusActive) openRewardDialog("Video prima di aprire il profilo");
        openProfile(d);
      });
      nearGrid.appendChild(el);
    });
  }

  loadNearby();

  /* ---------- Profilo ---------- */
  window.openProfile = (dog) => {
    const body = document.getElementById("ppBody");
    show(profileSheet);
    profileSheet.classList.add("show");
    body.innerHTML = `
      <div class="center"><img src="${dog.img}" alt="${dog.name}" style="width:100%;border-radius:12px;max-height:300px;object-fit:cover;"></div>
      <h2>${dog.name}</h2>
      <p>${dog.breed} • ${dog.km} km</p>
      <div class="badge">Profilo verificato</div>
      <p style="margin-top:8px;">Mi piace giocare e fare passeggiate. 🐕</p>
      <button class="btn yes" onclick="startChat('${dog.name}')">Apri chat</button>`;
  };

  window.closeProfilePage = () => {
    profileSheet.classList.remove("show");
    setTimeout(() => hide(profileSheet), 250);
  };

  /* ---------- Chat da profilo ---------- */
  window.startChat = (name) => {
    closeProfilePage();
    setTimeout(() => openChat(name), 300);
  };

  /* ---------- Swipe eventi ---------- */
  yesBtn.addEventListener("click", swipeYes);
  noBtn.addEventListener("click", swipeNo);

  /* ---------- Geolocalizzazione ---------- */
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      (pos) => console.log("Posizione:", pos.coords.latitude, pos.coords.longitude),
      (err) => console.warn("Geo non concessa:", err.message)
    );
  }

  console.log("✅ Plutoo pronto");
});
