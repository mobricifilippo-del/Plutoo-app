/* =========================================================
   PLUTOO – GOLD EDITION (JS Base + UI Polish)
   Basato sulla tua versione stabile. Nessuna modifica di logica,
   solo rifiniture: gold pulse su ENTRA, micro-UX coerenti.
   ========================================================= */

(() => {
  "use strict";

  // --------------- Shortcuts ---------------
  const qs  = (sel, el=document) => el.querySelector(sel);
  const qa  = (sel, el=document) => Array.from(el.querySelectorAll(sel));
  const on  = (el, ev, fn, opt) => el && el.addEventListener(ev, fn, opt);

  // --------------- Elements ---------------
  const homeScreen    = qs("#homeScreen");
  const appScreen     = qs("#appScreen");
  const btnEnter      = qs("#btnEnter");
  const heroLogo      = qs("#heroLogo");
  const sponsorLink   = qs("#sponsorLink");

  const tabNearby     = qs("#tabNearby");
  const tabLove       = qs("#tabLove");
  const tabSocial     = qs("#tabSocial");
  const tabLuoghi     = qs("#tabLuoghi");
  const luoghiMenu    = qs("#luoghiMenu");

  const viewNearby    = qs("#viewNearby");
  const viewLove      = qs("#viewLove");
  const viewSocial    = qs("#viewSocial");

  const profileSheet  = qs("#profilePanel");
  const ppBody        = qs("#ppBody");

  const panelSearch   = qs("#panelSearch");
  const btnCloseSearch= qs("#btnCloseSearch");

  const ethicsHome    = qs("#ethicsButton");
  const ethicsApp     = qs("#ethicsButtonApp");

  const nearGrid      = qs("#nearbyGrid");
  const loveDeck      = qs("#loveDeck");
  const socialDeck    = qs("#socialDeck");

  // --------------- I18n (mock minimal) ---------------
  const LOCALE = {
    it: {
      sponsorUrl: "https://example.com/fido-gelato",
      noProfiles: "Nessun profilo disponibile.",
    },
    en: {
      sponsorUrl: "https://example.com/fido-gelato",
      noProfiles: "No profiles available.",
    }
  };
  function autodetectLang(){
    const nav = (navigator.language || "").toLowerCase();
    if (nav.startsWith("it")) return "it";
    return "en";
  }
  function t(key){
    return LOCALE[state.lang]?.[key] ?? LOCALE.it[key] ?? key;
  }

  // --------------- Toast / Reward mocks (base) ---------------
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

  // --------------- Dummy data (breve) ---------------
  const DOGS = [
    {id:"1", name:"Luna",  breed:"Labrador", age:"2", dist:"1.2km", verified:true,  img:"dog1.jpg", bio:"Amante dei parchi"},
    {id:"2", name:"Rocky", breed:"Beagle",   age:"3", dist:"2.5km", verified:false, img:"dog2.jpg", bio:"Corre come il vento"},
    {id:"3", name:"Maya",  breed:"Husky",    age:"1", dist:"3.1km", verified:true,  img:"dog3.jpg", bio:"Dolcissima"},
    {id:"4", name:"Otto",  breed:"Maltese",  age:"4", dist:"0.9km", verified:false, img:"dog4.jpg", bio:"Coccolone"},
  ];

  // --------------- UI helpers ---------------
  function setActiveView(view){
    qa(".view").forEach(v=>v.classList.remove("active"));
    if (view==="nearby") viewNearby.classList.add("active");
    if (view==="love")   viewLove.classList.add("active");
    if (view==="social") viewSocial.classList.add("active");

    qa(".tab").forEach(t=>t.classList.remove("active"));
    if (view==="nearby") tabNearby.classList.add("active");
    if (view==="love")   tabLove.classList.add("active");
    if (view==="social") tabSocial.classList.add("active");
  }

  // --------------- Geoloc (mock-safe) ---------------
  function ensureGeo(){
    try{
      navigator.geolocation.getCurrentPosition(
        ()=>{}, ()=>{}, {enableHighAccuracy:true, timeout:4000, maximumAge:60000 }
      );
    }catch(e){}
  }

  // ---------------- Stato ----------------
  const state = {
    lang: (localStorage.getItem("lang") || autodetectLang()),
    plus: localStorage.getItem("plutoo_plus")==="1",
    entered: localStorage.getItem("entered")==="1",
    swipeCount: parseInt(localStorage.getItem("swipes")||"0"),
    matches: parseInt(localStorage.getItem("matches")||"0"),
    firstMsgRewardByDog: JSON.parse(localStorage.getItem("firstMsgRewardByDog")||"{}"),
    selfieUntilByDog: JSON.parse(localStorage.getItem("selfieUntilByDog")||"{}"),
    currentLoveIdx: 0,
    currentSocialIdx: 0,
  };

  // --------------- HOME ↔ APP ---------------
  initHome();

  function initHome(){
    // MODIFICA A: Mostra Home di default; salta alla app solo se l'URL ha ?app=1
    const startApp = new URLSearchParams(location.search).has("app");
    if (state.entered && startApp){
      homeScreen.classList.add("hidden");
      appScreen.classList.remove("hidden");
    }

    // ENTRA → gold pulse (1.5s) → Nearby
    on(btnEnter, "click", ()=>{
      heroLogo.classList.add("gold-glow");
      setTimeout(()=>{
        heroLogo.classList.remove("gold-glow");
        state.entered=true; localStorage.setItem("entered","1");
        homeScreen.classList.add("hidden");
        appScreen.classList.remove("hidden");
        setActiveView("nearby");
      }, 1500);
    });

    // Sponsor con reward (coerente con base)
    on(sponsorLink, "click",(e)=>{
      e.preventDefault();
      reward("Video prima di aprire lo sponsor").then(()=>{
        window.open(t("sponsorUrl"), "_blank", "noopener");
      });
    });

    // Etica (home e app) → Maps dopo reward
    on(ethicsHome, "click", async ()=>{
      await reward("Video prima di aprire Google Maps (canili)");
      openSheltersMaps();
    });
    on(ethicsApp, "click", async ()=>{
      await reward("Video prima di aprire Google Maps (canili)");
      openSheltersMaps();
    });
  }

  function openSheltersMaps(){
    const isIT = (state.lang==="it");
    const q = isIT ? "canili vicino a me" : "animal shelters near me";
    window.open(`https://www.google.com/maps?q=${encodeURIComponent(q)}`,"_blank","noopener");
  }

  // --------------- Tabs & Views ---------------
  on(tabNearby, "click", ()=>setActiveView("nearby"));
  on(tabLove,   "click", ()=>setActiveView("love"));
  on(tabSocial, "click", ()=>setActiveView("social"));

  // Luoghi Pet: dropdown + apertura Maps con reward
  on(tabLuoghi, "click", (e)=>{
    e.stopPropagation();
    const expanded = tabLuoghi.getAttribute("aria-expanded")==="true";
    tabLuoghi.setAttribute("aria-expanded", expanded ? "false" : "true");
  });
  on(document, "click", (e)=>{
    if (!tabLuoghi.contains(e.target)) tabLuoghi.setAttribute("aria-expanded","false");
  });
  qa(".menu-item", luoghiMenu).forEach(btn=>{
    on(btn, "click", async ()=>{
      const cat = btn.getAttribute("data-cat") || "vets";
      const qMap = {
        vets:"veterinari", groomers:"toelettature", shops:"negozi",
        parks:"parchi", trainers:"addestratori", shelters:"canili"
      };
      const it = qMap[cat] || "veterinari";
      const en = {vets:"veterinarians", groomers:"dog groomers", shops:"pet shops", parks:"dog parks", trainers:"dog trainers", shelters:"animal shelters"}[cat] || "veterinarians";
      await reward("Video prima di aprire Google Maps");
      const q = (state.lang==="it" ? `${it} vicino a me` : `${en} near me`);
      window.open(`https://www.google.com/maps?q=${encodeURIComponent(q)}`,"_blank","noopener");
    });
  });

  // --------------- Nearby (grid) ---------------
  setActiveView("nearby");
  renderNearby();

  function renderNearby(){
    ensureGeo();
    if (!nearGrid) return;
    if (!DOGS.length){ nearGrid.innerHTML = `<p class="muted" style="padding:.5rem">${t("noProfiles")}</p>`; return; }
    nearGrid.innerHTML = DOGS.map(cardHTML).join("");
    qa(".dog-card").forEach(card=>{
      const id = card.getAttribute("data-id");
      const d  = DOGS.find(x=>x.id===id);
      const img = qs("img", card);
      // Click foto → Apri profilo (già previsto)
      img?.addEventListener("click", ()=>openProfile(d));
      // CTA "Apri profilo" con reward (coerente con tua base)
      qs(".open-profile", card)?.addEventListener("click", async ()=>{
        await reward("Video prima di aprire il profilo");
        openProfile(d);
      });
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
        <div class="card-cta" style="padding:.5rem .85rem .9rem">
          <button class="btn ghost open-profile" type="button">Apri profilo</button>
        </div>
      </article>
    `;
  }

  // --------------- Profilo cane (sheet) ---------------
  function openProfile(d){
    if (!d) return;
    profileSheet?.setAttribute("aria-hidden","false");
    profileSheet?.classList.remove("hidden");
    setTimeout(()=>profileSheet?.classList.add("show"), 10);

    ppBody.innerHTML = `
      <div class="photo">
        <img src="${d.img}" alt="${d.name}" style="width:100%;height:100%;object-fit:cover;object-position:center" />
      </div>
      <div class="meta">
        <h2 style="margin:.2rem 0 .2rem">${d.name} ${d.verified?'<span title="Gold">★</span>':''}</h2>
        <p style="margin:.2rem 0;color:var(--muted)">${d.breed} · ${d.age} anni</p>
        <p>${d.bio||""}</p>
        <div style="display:flex;gap:.6rem;margin-top:.6rem">
          <button class="btn ghost" id="btnMessage">Messaggia</button>
          <button class="btn primary" id="btnSelfie">Vedi selfie</button>
        </div>
      </div>
    `;

    on(qs("#btnMessage", ppBody), "click", async ()=>{
      await maybeFirstMessageReward(d.id);
      openChat(d);
    });

    on(qs("#btnSelfie", ppBody), "click", async ()=>{
      if (isSelfieUnlocked(d.id)){ toast("Selfie già sbloccato ✅", 1200); return; }
      await reward("Video per sbloccare il selfie (24h)");
      const until = Date.now() + 24*60*60*1000;
      state.selfieUntilByDog[d.id] = until;
      localStorage.setItem("selfieUntilByDog", JSON.stringify(state.selfieUntilByDog));
      toast("Selfie sbloccato per 24h ✅", 1200);
    });
  }
  window.closeProfilePage = ()=>{
    profileSheet.classList.remove("show");
    setTimeout(()=>profileSheet.classList.add("hidden"), 250);
  };
  function isSelfieUnlocked(id){ return Date.now() < (state.selfieUntilByDog[id]||0); }

  // --------------- Chat (first message reward) ---------------
  function openChat(dog){
    // overlay minimale mock, invariato
    const wrap = document.createElement("div");
    wrap.className = "chat-pane";
    wrap.innerHTML = `
      <div class="chat-head">
        <div style="display:flex;align-items:center;gap:.6rem">
          <img src="${dog.img}" alt="${dog.name}" style="width:36px;height:36px;border-radius:10px" />
          <strong>${dog.name}</strong>
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
    on(qs("#chatClose", wrap),"click",()=>wrap.remove());

    const send = async ()=>{
      await maybeFirstMessageReward(dog.id);
      const f = qs("#chatField", wrap);
      const v = (f.value||"").trim();
      if (!v) return;
      const body = qs(".chat-body", wrap);
      const b = document.createElement("div");
      b.className="msg mine";
      b.textContent = v;
      body.appendChild(b);
      f.value="";
      body.scrollTop = body.scrollHeight;
    };
    on(qs("#chatSend", wrap), "click", send);
  }
  async function maybeFirstMessageReward(dogId){
    const done = state.firstMsgRewardByDog[dogId];
    if (state.plus || done) return true;
    await reward("Video prima del primo messaggio");
    state.firstMsgRewardByDog[dogId] = true;
    localStorage.setItem("firstMsgRewardByDog", JSON.stringify(state.firstMsgRewardByDog));
    return true;
  }

  // --------------- Love / Social (swipe) ---------------
  initDecks();

  function initDecks(){
    buildDeck(loveDeck,  "love");
    buildDeck(socialDeck,"social");
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
      enableSwipe(card, d);
    });
  }

  // Swipe base (invariato)
  function enableSwipe(card, d){
    let startX=0, dx=0, dragging=false;
    function start(x){ dragging=true; startX=x; card.style.transition="none"; }
    function move(x){
      if (!dragging) return;
      dx = x - startX;
      const rot = Math.max(-12, Math.min(12, dx/14));
      card.style.transform = `translateX(${dx}px) rotate(${rot}deg)`;
    }
    function end(){
      if (!dragging) return;
      dragging=false; card.style.transition="";
      if (dx>120){ simulateSwipe(card, "right"); incSwipe(); }
      else if (dx<-120){ simulateSwipe(card, "left"); incSwipe(); }
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
  function resetCard(card){ card.classList.remove("swipe-out-right","swipe-out-left"); card.style.transform=""; }
  function simulateSwipe(card, dir){
    card.classList.add(dir==="right"?"swipe-out-right":"swipe-out-left");
    setTimeout(()=>{ resetCard(card); card.dispatchEvent(new CustomEvent("swiped",{detail:{dir}})); }, 550);
  }
  function incSwipe(){
    state.swipeCount++; localStorage.setItem("swipes", String(state.swipeCount));
    if (!state.plus){
      if (state.swipeCount===10 || (state.swipeCount>10 && (state.swipeCount-10)%5===0)){
        reward("Video per continuare a fare swipe");
      }
    }
  }

  // --------------- Ricerca (apri/chiudi) ---------------
  on(qs("#btnSearch"), "click", ()=>{
    panelSearch?.setAttribute("aria-hidden","false");
  });
  on(btnCloseSearch, "click", ()=>{
    panelSearch?.setAttribute("aria-hidden","true");
  });

  // --------------- Avvio ---------------
  (function preload(){
    const imgs = ["dog1.jpg","dog2.jpg","dog3.jpg","dog4.jpg","plutoo-icon-512.png"];
    imgs.forEach(src=>{ const i=new Image(); i.src=src; });
  })();

})();
