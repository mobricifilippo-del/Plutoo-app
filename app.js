/* =========================================================
   PLUTOO – GOLD EDITION (JS Base + UI Polish, Monetization mock)
   - Home default (app solo con ?app=1)
   - Entra: gold pulse + cuore scenografico
   - Nearby: "amici" con click → pagina profilo dedicata
   - Ricerca overlay stabile + autocomplete Razza (inizio parola)
   - Decks swipe con gating 10 → +5 → poi ogni 5
   - Messaggi: primo messaggio gratuito → poi reward (se non match)
   - Selfie 24h dopo reward; upload documenti mock
   - Luoghi PET: reward → Maps; Canili footer; Sponsor con reward
   - Back funzionante ovunque; banner mock rispettato
   ========================================================= */
(() => {
  "use strict";

  // ---------- Shortcuts ----------
  const qs  = (sel, el=document) => el.querySelector(sel);
  const qa  = (sel, el=document) => Array.from(el.querySelectorAll(sel));
  const on  = (el, ev, fn, opt) => el && el.addEventListener(ev, fn, opt);

  // ---------- Elements ----------
  const homeScreen     = qs("#homeScreen");
  const appScreen      = qs("#appScreen");
  const btnEnter       = qs("#btnEnter");
  const heroLogo       = qs("#heroLogo");
  const heartBurst     = qs("#goldHeartBurst");

  const sponsorLink    = qs("#sponsorLink");
  const ethicsHome     = qs("#ethicsButton");
  const ethicsApp      = qs("#ethicsButtonApp");

  const btnBack        = qs("#btnBack");
  const tabNearby      = qs("#tabNearby");
  const tabLove        = qs("#tabLove");
  const tabSocial      = qs("#tabSocial");
  const tabPlay        = qs("#tabPlay");
  const tabLuoghi      = qs("#tabLuoghi");
  const luoghiMenu     = qs("#luoghiMenu");
  const btnSearch      = qs("#btnSearch");
  const tabPlus        = qs("#tabPlus");

  const viewNearby     = qs("#viewNearby");
  const viewLove       = qs("#viewLove");
  const viewSocial     = qs("#viewSocial");
  const viewPlay       = qs("#viewPlay");

  const nearGrid       = qs("#nearbyGrid");
  const loveDeck       = qs("#loveDeck");
  const socialDeck     = qs("#socialDeck");
  const playDeck       = qs("#playDeck");

  const panelSearch    = qs("#panelSearch");
  const btnCloseSearch = qs("#btnCloseSearch");

  const profilePage    = qs("#profilePage");
  const btnBackProfile = qs("#btnBackProfile");
  const profilePhoto   = qs("#profilePhoto");
  const profileName    = qs("#profileName");
  const profileMeta    = qs("#profileMeta");
  const profileBio     = qs("#profileBio");
  const profileGallery = qs("#profileGallery");
  const btnSeeSelfie   = qs("#btnSeeSelfie");
  const btnUploadSelfie= qs("#btnUploadSelfie");
  const btnUploadDogDocs   = qs("#btnUploadDogDocs");
  const btnUploadOwnerDocs = qs("#btnUploadOwnerDocs");

  // ---------- i18n (minimal) ----------
  const LOCALE = {
    it: {
      sponsorUrl: "https://example.com/fido-gelato",
      sheltersQ:  "canili vicino a me",
      vetsQ:      "veterinari vicino a me",
      shopsQ:     "negozi per animali vicino a me",
      groomersQ:  "toelettature vicino a me",
      parksQ:     "parchi per cani vicino a me",
      trainersQ:  "addestratori cani vicino a me",
      noProfiles: "Nessun amico disponibile.",
      profile:    "Profilo amico",
    },
    en: {
      sponsorUrl: "https://example.com/fido-gelato",
      sheltersQ:  "animal shelters near me",
      vetsQ:      "veterinarians near me",
      shopsQ:     "pet shops near me",
      groomersQ:  "dog groomers near me",
      parksQ:     "dog parks near me",
      trainersQ:  "dog trainers near me",
      noProfiles: "No friends available.",
      profile:    "Friend profile",
    }
  };
  function autodetectLang(){
    const nav = (navigator.language || "").toLowerCase();
    if (nav.startsWith("it")) return "it"; return "en";
  }
  function t(key){ return LOCALE[state.lang]?.[key] ?? LOCALE.it[key] ?? key; }

  // ---------- Breeds (sample list; filter by startsWith) ----------
  const BREEDS = [
    "Akita","Alano","Barboncino","Beagle","Bichon Frisé","Border Collie","Boxer","Bulldog",
    "Cavalier King","Chihuahua","Cocker Spaniel","Dalmata","Dobermann","Husky","Jack Russell",
    "Labrador","Maltese","Pastore Tedesco","Pinscher","Pug","Rottweiler","Samoyed","Setter",
    "Shiba Inu","Spitz","Terranova","Volpino"
  ];

  // ---------- Dummy data (friends) ----------
  const DOGS = [
    {id:"1", name:"Luna",  breed:"Labrador", age:"2", dist:"1.2km", verified:true,  img:"dog1.jpg", bio:"Amante dei parchi"},
    {id:"2", name:"Rocky", breed:"Beagle",   age:"3", dist:"2.5km", verified:false, img:"dog2.jpg", bio:"Corre come il vento"},
    {id:"3", name:"Maya",  breed:"Husky",    age:"1", dist:"3.1km", verified:true,  img:"dog3.jpg", bio:"Dolcissima"},
    {id:"4", name:"Otto",  breed:"Maltese",  age:"4", dist:"0.9km", verified:false, img:"dog4.jpg", bio:"Coccolone"},
  ];

  // ---------- State ----------
  const state = {
    lang: (localStorage.getItem("lang") || autodetectLang()),
    plus: localStorage.getItem("plutoo_plus")==="1",
    entered: localStorage.getItem("entered")==="1",
    swipeCount: parseInt(localStorage.getItem("swipes")||"0"),
    matches: parseInt(localStorage.getItem("matches")||"0"),
    firstMsgRewardDone: JSON.parse(localStorage.getItem("firstMsgRewardDone")||"{}"), // {dogId:true}
    selfieUntilByDog: JSON.parse(localStorage.getItem("selfieUntilByDog")||"{}"),      // {dogId:ts}
    lastView: "nearby",
  };

  // ---------- Toast / Reward / Interstitial (mock) ----------
  function toast(msg, ms=1400){
    const wrap = document.createElement("div");
    wrap.className = "toast";
    wrap.innerHTML = `<div class="toast-box">${msg}</div>`;
    document.body.appendChild(wrap);
    setTimeout(()=>wrap.classList.add("show"), 20);
    setTimeout(()=>{
      wrap.classList.remove("show");
      setTimeout(()=>wrap.remove(), 300);
    }, ms);
  }
  function reward(label="Video reward"){
    if (state.plus) return Promise.resolve(true);
    return new Promise(res=>{
      const box = document.createElement("div");
      box.className = "reward-box";
      box.innerHTML = `
        <div class="reward-inner">
          <div class="rw-title">Reward</div>
          <div class="rw-msg">${label}</div>
          <button class="btn primary" id="rwOk">Guarda</button>
        </div>
      `;
      document.body.appendChild(box);
      qs("#rwOk", box)?.addEventListener("click", ()=>{
        setTimeout(()=>{
          box.remove(); toast("Grazie 🙏", 900); res(true);
        }, 800);
      });
    });
  }
  function interstitialMatch(){
    const box = document.createElement("div");
    box.className = "reward-box";
    box.innerHTML = `
      <div class="reward-inner">
        <div class="rw-title">Videomatch</div>
        <div class="rw-msg">Annuncio dopo il match 💛</div>
        <button class="btn primary" id="rwOk2">Chiudi</button>
      </div>
    `;
    document.body.appendChild(box);
    qs("#rwOk2", box)?.addEventListener("click", ()=>{ box.remove(); });
  }

  // ---------- Geoloc (non bloccante) ----------
  function ensureGeo(){
    try{
      navigator.geolocation.getCurrentPosition(()=>{}, ()=>{}, {enableHighAccuracy:true, timeout:3500, maximumAge:60000});
    }catch(e){}
  }

  // =========================================================
  // HOME ↔ APP
  // =========================================================
  initHome();

  function initHome(){
    // Home di default; entra in app direttamente solo con ?app=1
    const startApp = new URLSearchParams(location.search).has("app");
    if (state.entered && startApp){
      homeScreen.classList.add("hidden");
      appScreen.classList.remove("hidden");
    }

    // ENTRA → gold pulse + cuore → vicino a te
    on(btnEnter, "click", ()=>{
      heroLogo.classList.add("gold-glow");
      heartBurst?.classList.add("show");
      setTimeout(()=>{
        heroLogo.classList.remove("gold-glow");
        heartBurst?.classList.remove("show");
        state.entered = true; localStorage.setItem("entered","1");
        homeScreen.classList.add("hidden");
        appScreen.classList.remove("hidden");
        setActiveView("nearby");
      }, 1500);
    });

    // Sponsor: reward → apri sponsor
    on(sponsorLink, "click", (e)=>{
      e.preventDefault();
      reward("Video prima di aprire lo sponsor").then(()=>{
        window.open(t("sponsorUrl"), "_blank", "noopener");
      });
    });

    // Etico (Home e App): reward → Maps canili
    on(ethicsHome, "click", async ()=>{
      await reward("Video prima di aprire Google Maps (canili)");
      openMaps(t("sheltersQ"));
    });
    on(ethicsApp, "click", async ()=>{
      await reward("Video prima di aprire Google Maps (canili)");
      openMaps(t("sheltersQ"));
    });
  }

  function openMaps(q){ window.open(`https://www.google.com/maps?q=${encodeURIComponent(q)}`,"_blank","noopener"); }

  // =========================================================
  // NAVIGAZIONE / TABS / BACK
  // =========================================================
  on(btnBack, "click", ()=>{
    // Dall'app → Home
    appScreen.classList.add("hidden");
    homeScreen.classList.remove("hidden");
  });

  on(tabNearby, "click", ()=>setActiveView("nearby"));
  on(tabLove,   "click", ()=>setActiveView("love"));
  on(tabSocial, "click", ()=>setActiveView("social"));
  on(tabPlay,   "click", ()=>setActiveView("play"));

  // Luoghi PET: dropdown + reward → Maps (senza canili)
  on(tabLuoghi, "click", (e)=>{
    e.stopPropagation();
    const expanded = tabLuoghi.getAttribute("aria-expanded")==="true";
    tabLuoghi.setAttribute("aria-expanded", expanded ? "false" : "true");
  });
  on(document, "click", (e)=>{
    if (!qs("#luoghiTabWrap")?.contains(e.target)) tabLuoghi?.setAttribute("aria-expanded","false");
  });
  qa(".menu-item", luoghiMenu).forEach(btn=>{
    on(btn, "click", async ()=>{
      const cat = btn.getAttribute("data-cat");
      const qKey = {vets:"vetsQ",shops:"shopsQ",groomers:"groomersQ",parks:"parksQ",trainers:"trainersQ"}[cat] || "vetsQ";
      await reward("Video prima di aprire Google Maps");
      openMaps(t(qKey));
    });
  });

  // Ricerca overlay: apri/chiudi (stabile, niente spostamenti layout)
  on(btnSearch, "click", ()=>{
    panelSearch?.setAttribute("aria-hidden","false");
    btnSearch?.setAttribute("aria-expanded","true");
    document.body.classList.add("noscroll");
  });
  on(btnCloseSearch, "click", ()=>{
    panelSearch?.setAttribute("aria-hidden","true");
    btnSearch?.setAttribute("aria-expanded","false");
    document.body.classList.remove("noscroll");
  });

  // Back dalla pagina profilo
  on(btnBackProfile, "click", ()=>{
    showProfile(false);
    setActiveView(state.lastView || "nearby");
  });

  function setActiveView(view){
    state.lastView = view;
    qa(".view").forEach(v=>v.classList.remove("active"));
    qa(".tab").forEach(t=>t.classList.remove("active"));
    if (view==="nearby"){ viewNearby.classList.add("active"); tabNearby.classList.add("active"); }
    if (view==="love"){   viewLove.classList.add("active");   tabLove.classList.add("active"); }
    if (view==="social"){ viewSocial.classList.add("active"); tabSocial.classList.add("active"); }
    if (view==="play"){   viewPlay.classList.add("active");   tabPlay.classList.add("active"); }
  }

  // =========================================================
  // VICINO A TE (AMICI)
  // =========================================================
  setActiveView("nearby");
  renderNearby();
  ensureGeo();

  function renderNearby(){
    if (!nearGrid) return;
    if (!DOGS.length){ nearGrid.innerHTML = `<p class="muted" style="padding:.5rem">${t("noProfiles")}</p>`; return; }
    nearGrid.innerHTML = DOGS.map(cardHTML).join("");
    qa(".dog-card").forEach(card=>{
      const id = card.getAttribute("data-id");
      const d  = DOGS.find(x=>x.id===id);
      const img = qs("img", card);
      // Click foto → pagina profilo dedicata
      img?.addEventListener("click", ()=>openProfilePage(d));
      // Pulsante "Apri profilo" (se presente)
      qs(".open-profile", card)?.addEventListener("click", ()=>openProfilePage(d));
      // Bottoni like/dislike (non cambiamo logica core)
      qs(".btn.yes", card)?.addEventListener("click", ()=>{ maybeMatch(); });
    });
  }
  function cardHTML(d){
    return `
      <article class="card dog-card" data-id="${d.id}">
        <img class="card-img" src="${d.img}" alt="${d.name}" />
        <div class="card-info">
          <h3>${d.name}</h3>
          <p class="meta">${d.breed} · ${d.age} anni · ${d.dist} ${d.verified ? ' · <span title="Verificato">★ Gold</span>' : ''}</p>
          <p class="bio">${d.bio||""}</p>
        </div>
        <div class="card-actions">
          <button class="btn no"   data-act="no">🥲</button>
          <button class="btn yes"  data-act="yes">💛</button>
        </div>
      </article>
    `;
  }

  // =========================================================
  // PAGINA PROFILO AMICO (DEDICATA)
  // =========================================================
  function showProfile(show){
    if (show){
      profilePage?.classList.remove("hidden");
      profilePage?.setAttribute("aria-hidden","false");
    }else{
      profilePage?.classList.add("hidden");
      profilePage?.setAttribute("aria-hidden","true");
    }
  }
  function openProfilePage(d){
    if (!d) return;
    // Popola contenuti
    profilePhoto.src = d.img;
    profilePhoto.alt = d.name;
    profileName.textContent = d.name + (d.verified ? " ★" : "");
    profileMeta.textContent = `${d.breed} · ${d.age} anni`;
    profileBio.textContent  = d.bio || "";

    // Gallery mock
    profileGallery.innerHTML = `
      <img src="${d.img}" alt="${d.name}" />
      <img src="${d.img}" alt="${d.name}" />
      <img src="${d.img}" alt="${d.name}" />
    `;

    // Selfie: visibilità 24h dopo reward
    on(btnSeeSelfie, "click", async ()=>{
      if (isSelfieUnlocked(d.id)){ toast("Selfie già sbloccato ✅", 1000); return; }
      await reward("Video per sbloccare il selfie (24h)");
      state.selfieUntilByDog[d.id] = Date.now() + 24*60*60*1000;
      localStorage.setItem("selfieUntilByDog", JSON.stringify(state.selfieUntilByDog));
      toast("Selfie sbloccato per 24h ✅", 1200);
    }, {once:true});

    // Upload selfie (mock)
    on(btnUploadSelfie, "click", ()=>{
      toast("Apri selettore foto (selfie con il tuo amico) 📷", 1400);
    });

    // Upload documenti (mock)
    on(btnUploadDogDocs, "click", ()=>{ toast("Carica documenti dell’amico 🐾", 1200); });
    on(btnUploadOwnerDocs, "click", ()=>{ toast("Carica documenti del proprietario 👤", 1200); });

    // Mostra la pagina profilo
    qa(".view").forEach(v=>v.classList.remove("active"));
    showProfile(true);
  }
  function isSelfieUnlocked(id){ return Date.now() < (state.selfieUntilByDog[id]||0); }

  // =========================================================
  // LOVE / SOCIAL / GIOCHIAMO (SWIPE DECKS)
  // =========================================================
  initDecks();

  function initDecks(){
    buildDeck(loveDeck,  "love");
    buildDeck(socialDeck,"social");
    buildDeck(playDeck,  "play");
  }

  function buildDeck(container, type){
    if (!container) return;
    container.innerHTML = "";
    const data = DOGS.slice(0); // mock

    data.forEach(d=>{
      const card = document.createElement("article");
      card.className = "card";
      card.setAttribute("data-id", d.id);
      card.style.top = "0";

      card.innerHTML = `
        <img class="card-img" src="${d.img}" alt="${d.name}" />
        <div class="card-info">
          <h3>${d.name}</h3>
          <p class="meta">${d.breed} · ${d.age} anni ${d.verified ? ' · <span title="Verificato">★ Gold</span>' : ''}</p>
        </div>
        <div class="card-actions">
          <button class="btn no"  data-act="no">🥲</button>
          <button class="btn yes" data-act="yes">💛</button>
        </div>
      `;
      container.appendChild(card);
      enableSwipe(card, d, type);
    });
  }

  function enableSwipe(card, d, type){
    let startX=0, dx=0, dragging=false;
    function start(x){ dragging=true; startX=x; card.style.transition="none"; }
    function move(x){
      if (!dragging) return;
      dx = x - startX;
      const rot = Math.max(-12, Math.min(12, dx/14));
      card.style.transform = `translateX(${dx}px) rotate(${rot}deg)`;
    }
    async function end(){
      if (!dragging) return;
      dragging=false; card.style.transition="";
      if (dx>120){ await onSwipe(card, d, "right", type); }
      else if (dx<-120){ await onSwipe(card, d, "left", type); }
      else { card.style.transform=""; }
      dx=0;
    }
    card.addEventListener("touchstart", e=>start(e.touches[0].clientX), {passive:true});
    card.addEventListener("touchmove",  e=>move(e.touches[0].clientX),  {passive:true});
    card.addEventListener("touchend", end);
    card.addEventListener("mousedown", e=>start(e.clientX));
    window.addEventListener("mousemove", e=>move(e.clientX));
    window.addEventListener("mouseup", end);
  }

  async function onSwipe(card, d, dir, type){
    card.classList.add(dir==="right" ? "swipe-out-right" : "swipe-out-left");
    // Gating: 10 → +5 → poi ogni 5 (solo se non Plus)
    if (!state.plus){
      state.swipeCount++; localStorage.setItem("swipes", String(state.swipeCount));
      if (state.swipeCount===10 || (state.swipeCount>10 && (state.swipeCount-10)%5===0)){
        await reward("Video per continuare a fare swipe");
      }
    }
    // Match casuale (mock) sul like
    if (dir==="right" && Math.random() < 0.5){
      state.matches++; localStorage.setItem("matches", String(state.matches));
      interstitialMatch();
      toast("It’s a match! 💛", 1200);
    }
    // Rimuovi carta
    setTimeout(()=>{ card.remove(); }, 520);
  }

  // =========================================================
  // RICERCA PERSONALIZZATA (OVERLAY) — Autocomplete Razza
  // =========================================================
  const breedInput = qs("#breed");
  const suggestions= qs("#suggestions");
  const sexSelect  = qs("#sex");
  const heightSelect = qs("#height");
  const distanceInput= qs("#distance");
  const btnApply   = qs("#btnApplyFilters");
  const btnReset   = qs("#btnResetFilters");

  if (breedInput && suggestions){
    on(breedInput, "input", ()=>{
      const q = (breedInput.value||"").trim().toLowerCase();
      if (!q){ suggestions.classList.remove("show"); suggestions.innerHTML=""; return; }
      // Solo razze che INIZIANO con q
      const items = BREEDS.filter(b => b.toLowerCase().startsWith(q)).sort();
      if (!items.length){ suggestions.classList.remove("show"); suggestions.innerHTML=""; return; }
      suggestions.innerHTML = items.map(b=>`<div class="item" data-v="${b}">${b}</div>`).join("");
      suggestions.classList.add("show");
      qa(".item", suggestions).forEach(it=>{
        on(it, "click", ()=>{
          breedInput.value = it.getAttribute("data-v");
          suggestions.classList.remove("show");
          suggestions.innerHTML="";
        });
      });
    });
    on(document, "click", (e)=>{
      if (!qs(".f", panelSearch)?.contains(e.target)){
        suggestions.classList.remove("show");
      }
    });
  }

  on(btnApply, "click", ()=>{
    // Applica filtri base (mock — nessun cambio logica dati)
    toast("Filtri applicati ✅", 1000);
    panelSearch?.setAttribute("aria-hidden","true");
    btnSearch?.setAttribute("aria-expanded","false");
    document.body.classList.remove("noscroll");
  });
  on(btnReset, "click", ()=>{
    breedInput.value=""; sexSelect.value=""; heightSelect.value=""; distanceInput.value="20";
    suggestions.classList.remove("show"); suggestions.innerHTML="";
  });

  // =========================================================
  // MESSAGGI: Primo messaggio gratis → poi reward (se non match)
  // =========================================================
  function openChat(d){
    const wrap = document.createElement("div");
    wrap.className = "chat-pane";
    wrap.innerHTML = `
      <div class="chat-head">
        <div style="display:flex;align-items:center;gap:.6rem">
          <img src="${d.img}" alt="${d.name}" style="width:36px;height:36px;border-radius:10px" />
          <strong>${d.name}</strong>
        </div>
        <button class="btn tiny ghost" id="chatClose">✕</button>
      </div>
      <div class="chat-body">
        <div class="msg theirs">Ciao! 🐾</div>
      </div>
      <div class="chat-input">
        <input id="chatField" type="text" placeholder="Scrivi un messaggio..." />
        <button id="chatSend" class="btn primary">Invia</button>
      </div>
    `;
    document.body.appendChild(wrap);
    const chatClose = qs("#chatClose", wrap);
    const chatSend  = qs("#chatSend", wrap);
    const chatField = qs("#chatField", wrap);
    const chatBody  = qs(".chat-body", wrap);
    on(chatClose,"click",()=>wrap.remove());

    on(chatSend, "click", async ()=>{
      const v = (chatField.value||"").trim();
      if (!v) return;
      // Primo messaggio SEMPRE gratuito (appendo subito)
      const b = document.createElement("div");
      b.className="msg mine"; b.textContent = v;
      chatBody.appendChild(b);
      chatField.value = ""; chatBody.scrollTop = chatBody.scrollHeight;

      // Dopo l'invio del PRIMO messaggio (se non match) → reward
      if (!state.plus && !isMatchedWith(d.id) && !state.firstMsgRewardDone[d.id]){
        await reward("Video dopo il primo messaggio");
        state.firstMsgRewardDone[d.id] = true;
        localStorage.setItem("firstMsgRewardDone", JSON.stringify(state.firstMsgRewardDone));
      }
    });
  }
  function isMatchedWith(dogId){
    // Mock: se matches > 0, consideriamo "potenziale match"
    return state.matches > 0; // (sostituibile con logica reale)
  }

  // =========================================================
  // PRELOAD IMMAGINI
  // =========================================================
  (function preload(){
    const imgs = ["dog1.jpg","dog2.jpg","dog3.jpg","dog4.jpg","plutoo-icon-512.png","sponsor-logo.png"];
    imgs.forEach(src=>{ const i=new Image(); i.src=src; });
  })();

})();
