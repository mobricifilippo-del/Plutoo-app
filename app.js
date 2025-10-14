/* =========================================================
   Plutoo v1.0 stable — app.js
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  console.log("🐾 Plutoo avviato");

  // ---------- Riferimenti ----------
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

  // ---------- Stato ----------
  let swipeCount = 0;
  let selfieUnlockedUntil = parseInt(localStorage.getItem("selfieUnlockedUntil") || 0);
  let plusActive = localStorage.getItem("plusActive") === "true";
  let breeds = [];

  // ---------- Utility ----------
  const show = (el) => el && el.classList.add("show");
  const hide = (el) => el && el.classList.remove("show");

  function isSelfieUnlocked() {
    return Date.now() < selfieUnlockedUntil;
  }

  function unlockSelfie() {
    selfieUnlockedUntil = Date.now() + 24 * 60 * 60 * 1000;
    localStorage.setItem("selfieUnlockedUntil", selfieUnlockedUntil);
    selfieImg.classList.remove("blur");
    unlockBtn.disabled = true;
  }

  function lockSelfie() {
    selfieImg.classList.add("blur");
    unlockBtn.disabled = false;
  }

  // ---------- Swipe ----------
  function swipeYes() {
    swipeCount++;
    if (!plusActive && swipeCount > 3 && swipeCount % 5 === 0) {
      openRewardDialog("Guarda un video per continuare a swippare");
    } else {
      showMatch();
    }
  }

  function swipeNo() {
    swipeCount++;
  }

  function showMatch() {
    const popup = document.createElement("div");
    popup.className = "sheet show";
    popup.innerHTML = `
      <div class="sheet-inner center">
        <h2>💘 È un Match!</h2>
        <p>Avete fatto amicizia!</p>
        <button class="btn" onclick="this.closest('.sheet').remove()">Chiudi</button>
      </div>`;
    document.body.appendChild(popup);
  }

  yesBtn.addEventListener("click", swipeYes);
  noBtn.addEventListener("click", swipeNo);

  // ---------- Reward ----------
  window.openRewardDialog = (msg = "Guarda un video per continuare") => {
    alert(msg + "\n(Mock video completato)");
  };

  // ---------- Plus ----------
  window.openPlusDialog = () => {
    const goPlus = confirm("Vuoi attivare Plutoo Plus (rimuove pubblicità)?");
    if (goPlus) {
      plusActive = true;
      localStorage.setItem("plusActive", "true");
      alert("Plutoo Plus attivo ✅");
    }
  };

  // ---------- Chat ----------
  const openChat = (dogName) => {
    show(chatPane);
    chatList.innerHTML = `<div class="msg">Ciao ${dogName}! 🐶</div>`;
  };

  const closeChat = () => hide(chatPane);

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

  // ---------- Selfie ----------
  if (isSelfieUnlocked()) unlockSelfie();
  else lockSelfie();

  unlockBtn.addEventListener("click", () => {
    if (!plusActive) openRewardDialog("Guarda un video per sbloccare il selfie");
    unlockSelfie();
  });

  // ---------- Razze ----------
  fetch("breeds.json")
    .then((r) => r.json())
    .then((data) => (breeds = data))
    .catch(() => console.warn("Impossibile caricare razze"));

  breedInput.addEventListener("input", () => {
    const val = breedInput.value.toLowerCase();
    breedsList.innerHTML = "";
    if (!val) {
      breedsList.classList.remove("show");
      return;
    }
    const matches = breeds.filter((b) => b.toLowerCase().includes(val)).slice(0, 10);
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

  // ---------- Distanza ----------
  distRange.addEventListener("input", () => {
    distLabel.textContent = distRange.value + " km";
  });

  // ---------- Vicino a te ----------
  function loadNearby() {
    nearGrid.innerHTML = "";
    const dogs = [
      { name: "Luna", breed: "Golden Retriever", km: 1.2, img: "dog1.jpg" },
      { name: "Rex", breed: "Pastore Tedesco", km: 3.4, img: "dog2.jpg" },
      { name: "Maya", breed: "Bulldog Francese", km: 2.1, img: "dog3.jpg" },
      { name: "Rocky", breed: "Beagle", km: 4.0, img: "dog4.jpg" },
    ];
    dogs.forEach((d) => {
      const el = document.createElement("div");
      el.className = "tile";
      el.innerHTML = `
        <img src="${d.img}" alt="${d.name}" class="thumb" />
        <div class="tinfo">
          <div class="tname">${d.name}</div>
          <div class="tmeta">${d.breed} • ${d.km} km</div>
        </div>`;
      el.addEventListener("click", () => {
        if (!plusActive) openRewardDialog("Guarda un video prima di aprire il profilo");
        openProfile(d);
      });
      nearGrid.appendChild(el);
    });
  }

  loadNearby();

  // ---------- Profilo ----------
  window.openProfile = (dog) => {
    show(profileSheet);
    const body = document.getElementById("ppBody");
    body.innerHTML = `
      <div class="center">
        <img src="${dog.img}" alt="${dog.name}" style="width:100%;border-radius:12px;max-height:300px;object-fit:cover;">
      </div>
      <h2>${dog.name}</h2>
      <p>${dog.breed} • ${dog.km} km</p>
      <p>Mi piace giocare e fare passeggiate. 🐕</p>
      <button class="btn" onclick="startChat('${dog.name}')">Apri chat</button>`;
  };

  window.closeProfilePage = () => hide(profileSheet);

  window.startChat = (name) => {
    closeProfilePage();
    setTimeout(() => openChat(name), 300);
  };

  // ---------- Geo ----------
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      (pos) => console.log("Posizione:", pos.coords.latitude, pos.coords.longitude),
      (err) => console.warn("Geo non concessa:", err.message)
    );
  }

  console.log("✅ Plutoo pronto");
});
