/* =========================================================
   Plutoo — app.js (Gold Edition) — Ott 2025
   - Splash screen all’avvio
   - Home → Entra → pulse → App (Vicino a te)
   - Tabs: Nearby / Love / Social / Luoghi Pet (menu) / Plus
   - Griglia 2×N con cornici dorate; click foto → Profilo (sheet)
   - Swipe deck (Amore/Social) con tilt + swipe-out + match burst
   - Ricerca personalizzata: prefisso razza, peso/altezza/distanza,
     "Solo verificati" e filtro sesso cane
   - Chat: reward solo al 1° messaggio col profilo
   - Selfie blur 24h nel profilo (reward)
   - Luoghi Pet: menu → reward → Google Maps (geo/fallback)
   - Bottone etico (home+app): reward → Maps “canili vicino a me”
   - Sponsor click (home): reward → pagina sponsor
   - Plus mock (togglable) + banner mock
   - Back/Exit: tasto Indietro in topbar
   - i18n IT/EN, persistenze locali
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  /* --------------------- Shorthand --------------------- */
  const $  = (id) => document.getElementById(id);
  const qs = (sel, root = document) => root.querySelector(sel);
  const qa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* --------------------- Riferimenti DOM --------------------- */
  // Home
  const homeScreen   = $("homeScreen");
  const heroLogo     = $("heroLogo");
  const btnEnter     = $("btnEnter");
  const sponsorLink  = $("sponsorLink");
  const ethicsButton = $("ethicsButton");
  const langToggle   = $("langToggle");

  // App
  const appScreen  = $("appScreen");
  const btnBack    = $("btnBack");
  const btnSearchPanel = $("btnSearchPanel");
  const adBanner   = $("adBanner");

  // Tabs & Views
  const tabNearby = $("tabNearby");
  const tabLove   = $("tabLove");
  const tabSocial = $("tabSocial");
  const tabServices = $("tabServices"); // non presente: usato menu Luoghi Pet
  const tabLuoghi = $("tabLuoghi");
  const luoghiMenu = $("luoghiMenu");
  const tabPlus   = $("tabPlus");
  const viewNearby = $("viewNearby");
  const viewLove   = $("viewLove");
  const viewSocial = $("viewSocial");
  const viewServices = $("viewServices"); // non presente

  // Nearby
  const nearGrid = $("nearGrid");

  // Swipe Love
  const loveCard = $("loveCard");
  const loveImg  = $("loveImg");
  const loveTitleTxt = $("loveTitleTxt");
  const loveMeta = $("loveMeta");
  const loveBio  = $("loveBio");
  const loveNo   = $("loveNo");
  const loveYes  = $("loveYes");

  // Swipe Social
  const socialCard = $("socialCard");
  const socialImg  = $("socialImg");
  const socialTitleTxt = $("socialTitleTxt");
  const socialMeta = $("socialMeta");
  const socialBio  = $("socialBio");
  const socialNo   = $("socialNo");
  const socialYes  = $("socialYes");

  // Search panel
  const searchPanel  = $("searchPanel");
  const closeSearch  = $("closeSearch");
  const searchForm   = $("searchForm");
  const breedInput   = $("breedInput");
  const breedsList   = $("breedsList");
  const weightInput  = $("weightInput");
  const heightInput  = $("heightInput");
  const distRange    = $("distRange");
  const distLabel    = $("distLabel");
  const onlyVerified = $("onlyVerified");
  const sexFilter    = $("sexFilter");
  const applyFilters = $("applyFilters");
  const resetFilters = $("resetFilters");

  // Chat
  const chatPane   = $("chatPane");
  const closeChatBtn = $("closeChat");
  const chatList   = $("chatList");
  const chatComposer = $("chatComposer");
  const chatInput  = $("chatInput");

  // Profilo
  const profileSheet = $("profileSheet");
  const ppBody       = $("ppBody");

  // Footer etico (app)
  const ethicsButtonApp = $("ethicsButtonApp");

  /* --------------------- Splash all’avvio --------------------- */
  makeSplash();

  function makeSplash() {
    const splash = document.createElement("div");
    splash.id = "plutooSplash";
    splash.style.cssText = `
      position:fixed;inset:0;z-index:1000;background:#000;
      display:flex;align-items:center;justify-content:center;
    `;
    splash.innerHTML = `
      <div style="text-align:center">
        <img src="plutoo-icon-512.png" alt="Plutoo" style="width:120px;height:120px;filter:drop-shadow(0 0 24px rgba(205,164,52,.35));opacity:0;transform:scale(.9);transition:all .8s ease" id="splashLogo">
        <div style="margin-top:10px;color:#cda434;font-weight:700;letter-spacing:.5px;opacity:0;transition:opacity .8s ease" id="splashText">Plutoo</div>
      </div>
    `;
    document.body.appendChild(splash);
    requestAnimationFrame(() => {
      $("splashLogo").style.opacity = "1";
      $("splashLogo").style.transform = "scale(1)";
      $("splashText").style.opacity = "1";
    });
    setTimeout(() => splash.remove(), 1500);
  }

  /* --------------------- Stato --------------------- */
  const state = {
    lang: localStorage.getItem("lang") || autodetectLang(),
    plus: localStorage.getItem("plusActive") === "true",
    entered: localStorage.getItem("entered") === "1",
    swipeCount: parseInt(localStorage.getItem("swipeCount")||"0"),
    matchesCount: parseInt(localStorage.getItem("matchesCount")||"0"),
    chatRewardsDone: JSON.parse(localStorage.getItem("chatRewardsDone") || "{}"),
    selfieUnlockedUntilByDog: JSON.parse(localStorage.getItem("selfieUnlockedUntilByDog") || "{}"),
    geo: null,

    dogs: [],
    services: [],
    breeds: [],
    currentLoveIdx: 0,
    currentSocialIdx: 0,

    filters: {
      breed: localStorage.getItem("filter_breed") || "",
      weight: localStorage.getItem("filter_weight") || "",
      height: localStorage.getItem("filter_height") || "",
      maxKm: parseInt(localStorage.getItem("filter_maxKm") || "5"),
      onlyVerified: localStorage.getItem("filter_onlyVerified") === "true",
      sex: localStorage.getItem("filter_sex") || "" // M/F/""
    }
  };

  /* --------------------- i18n --------------------- */
  const I18N = {
    it: {
      brand:"Plutoo",
      login:"Login", register:"Registrati", enter:"Entra",
      sponsorTitle:"Sponsor ufficiale",
      sponsorCopy:"Fido, il gelato per i nostri amici a quattro zampe",
      nearby:"Vicino a te", love:"Amore", social:"Social", services:"Servizi",
      searchAdvanced:"Ricerca personalizzata",
      vets:"Veterinari", groomers:"Toelettature", shops:"Negozi", parks:"Parchi", trainers:"Addestratori", shelters:"Canili & Adozioni",
      openSheltersMaps:"Apri canili nelle vicinanze (Maps)",
      chat:"Chat", send:"Invia", typeMessage:"Scrivi un messaggio…",
      profile:"Profilo", ethicsLine1:"Non abbandonare mai i tuoi amici", ethicsLine2:"(canili vicino a me)",
      breed:"Razza", breedPh:"Cerca razza…", weight:"Peso (kg)", weightPh:"Es. 12", height:"Altezza (cm)", heightPh:"Es. 45", distance:"Distanza:",
      apply:"Applica", reset:"Reset",
      noProfiles:"Nessun profilo. Modifica i filtri.",
      openProfile:"Apri profilo",
      bannerPlus:"Plutoo Plus attivo — niente banner",
      bannerMock:"Banner pubblicitario (mock)",
      sponsorUrl:"https://example.com/fido-gelato",
      mapsQueryShelters:"canili vicino a me"
    },
    en: {
      brand:"Plutoo",
      login:"Log in", register:"Sign up", enter:"Enter",
      sponsorTitle:"Official sponsor",
      sponsorCopy:"Fido, the gelato for our four-legged friends",
      nearby:"Nearby", love:"Love", social:"Social", services:"Services",
      searchAdvanced:"Advanced search",
      vets:"Vets", groomers:"Groomers", shops:"Pet shops", parks:"Parks", trainers:"Trainers", shelters:"Shelters & Adoption",
      openSheltersMaps:"Open nearby shelters (Maps)",
      chat:"Chat", send:"Send", typeMessage:"Type a message…",
      profile:"Profile", ethicsLine1:"Never abandon your friends", ethicsLine2:"(shelters near me)",
      breed:"Breed", breedPh:"Search breed…", weight:"Weight (kg)", weightPh:"e.g., 12", height:"Height (cm)", heightPh:"e.g., 45", distance:"Distance:",
      apply:"Apply", reset:"Reset",
      noProfiles:"No profiles. Adjust filters.",
      openProfile:"Open profile",
      bannerPlus:"Plutoo Plus active — no banner",
      bannerMock:"Ad banner (mock)",
      sponsorUrl:"https://example.com/fido-gelato",
      mapsQueryShelters:"animal shelters near me"
    }
  };
  function t(k){ return (I18N[state.lang] && I18N[state.lang][k]) || k; }
  function autodetectLang(){ return (navigator.language||"it").toLowerCase().startsWith("en") ? "en":"it"; }

  function applyI18n(){
    qa("[data-i18n]").forEach(el => el.textContent = t(el.getAttribute("data-i18n")));
    qa("[data-i18n-placeholder]").forEach(el => el.setAttribute("placeholder", t(el.getAttribute("data-i18n-placeholder"))));
    if (distLabel) distLabel.textContent = `${distRange.value} km`;
    if (sponsorLink) sponsorLink.href = t("sponsorUrl");
  }

  langToggle?.addEventListener("click", () => {
    state.lang = state.lang === "it" ? "en":"it";
    localStorage.setItem("lang", state.lang);
    applyI18n();
  });

  /* --------------------- Monetizzazione mock --------------------- */
  function reward(msg="Guarda un breve video per continuare"){
    if (state.plus) return Promise.resolve(true);
    return new Promise(res=>{
      alert(`${msg}\n\n(Mock completato ✅)`);
      res(true);
    });
  }
  function renderBanner(){
    if (!adBanner) return;
    adBanner.textContent = state.plus ? t("bannerPlus") : t("bannerMock");
  }
  window.openPlusDialog = () => {
    if (state.plus){
      if (confirm("Disattivare Plutoo Plus (mock)?")){
        state.plus=false; localStorage.setItem("plusActive","false"); renderBanner();
      }
    } else {
      if (confirm("Attivare Plutoo Plus (mock)? Rimuove banner e video.")){
        state.plus=true; localStorage.setItem("plusActive","true"); renderBanner();
      }
    }
  };

  /* --------------------- HOME ↔ APP --------------------- */
  if (state.entered){
    homeScreen.classList.add("hidden");
    appScreen.classList.remove("hidden");
  } else {
    homeScreen.classList.remove("hidden");
    appScreen.classList.add("hidden");
  }
  applyI18n(); renderBanner();

  btnEnter?.addEventListener("click", () => {
    // Pulse forte del logo poi entra
    heroLogo.classList.add("pulse");
    setTimeout(()=>{
      heroLogo.classList.remove("pulse");
      state.entered = true;
      localStorage.setItem("entered","1");
      showApp();
    }, 900);
  });

  sponsorLink?.addEventListener("click", (e)=>{
    e.preventDefault();
    reward("Video prima di aprire lo sponsor").then(()=>window.open(t("sponsorUrl"), "_blank", "noopener"));
  });

  ethicsButton?.addEventListener("click", async ()=>{
    await reward("Video prima di aprire Google Maps (canili)");
    openSheltersMaps();
  });
  ethicsButtonApp?.addEventListener("click", async ()=>{
    await reward("Video prima di aprire Google Maps (canili)");
    openSheltersMaps();
  });

  btnBack?.addEventListener("click", ()=>{
    // Se non sei in Nearby → torna a Nearby
    if (!viewNearby.classList.contains("active")){
      setActiveView("nearby");
      return;
    }
    // Sei in Nearby → chiedi se tornare alla Home
    if (confirm("Tornare alla Home?")){
      localStorage.removeItem("entered");
      state.entered=false;
      homeScreen.classList.remove("hidden");
      appScreen.classList.add("hidden");
      window.scrollTo(0,0);
    }
  });

  function showApp(){
    homeScreen.classList.add("hidden");
    appScreen.classList.remove("hidden");
    setActiveView("nearby");
  }

  /* --------------------- Tabs / Views --------------------- */
  tabNearby?.addEventListener("click", ()=>setActiveView("nearby"));
  tabLove?.addEventListener("click",   ()=>setActiveView("love"));
  tabSocial?.addEventListener("click", ()=>setActiveView("social"));

  // Luoghi Pet menu → open Maps
  qa(".menu-item", luoghiMenu).forEach(btn=>{
    btn.addEventListener("click", async ()=>{
      const cat = btn.getAttribute("data-cat");
      await reward("Video prima di aprire Google Maps");
      openMapsCategory(cat);
    });
  });

  function setActiveView(name){
    [viewNearby, viewLove, viewSocial].forEach(v=>v?.classList.remove("active"));
    [tabNearby, tabLove, tabSocial].forEach(t=>t?.classList.remove("active"));

    if (name==="nearby"){
      viewNearby.classList.add("active"); tabNearby.classList.add("active");
      btnSearchPanel.disabled=false;
      renderNearby();
    }
    if (name==="love"){
      viewLove.classList.add("active"); tabLove.classList.add("active");
      btnSearchPanel.disabled=true;
      renderSwipe("love");
    }
    if (name==="social"){
      viewSocial.classList.add("active"); tabSocial.classList.add("active");
      btnSearchPanel.disabled=true;
      renderSwipe("social");
    }
    window.scrollTo({top:0,behavior:"smooth"});
  }

  /* --------------------- Dati (mock) --------------------- */
  const DOGS = [
    { id:"d1", name:"Luna",   age:2, breed:"Golden Retriever", km:1.2, img:"dog1.jpg", bio:"Dolcissima e giocherellona.", mode:"love",   sex:"F", verified:true  },
    { id:"d2", name:"Rex",    age:4, breed:"Pastore Tedesco",  km:3.4, img:"dog2.jpg", bio:"Adoro correre e giocare.",    mode:"social", sex:"M", verified:true  },
    { id:"d3", name:"Maya",   age:3, breed:"Bulldog Francese", km:2.1, img:"dog3.jpg", bio:"Coccole e passeggiate.",      mode:"love",   sex:"F", verified:false },
    { id:"d4", name:"Rocky",  age:5, breed:"Beagle",           km:4.0, img:"dog4.jpg", bio:"Naso infallibile, amicone.",  mode:"social", sex:"M", verified:true  },
    { id:"d5", name:"Chicco", age:1, breed:"Barboncino",       km:0.8, img:"dog1.jpg", bio:"Piccolo fulmine di allegria.",mode:"love",   sex:"M", verified:true  },
    { id:"d6", name:"Kira",   age:6, breed:"Labrador",         km:5.1, img:"dog2.jpg", bio:"Acqua, palla e carezze.",     mode:"social", sex:"F", verified:true  },
  ];
  state.dogs = DOGS;

  // Breeds
  fetch("breeds.json").then(r=>r.json()).then(b=>state.breeds = Array.isArray(b)?b:[]).catch(()=>state.breeds=[]);

  // Geo
  if ("geolocation" in navigator){
    navigator.geolocation.getCurrentPosition(
      (pos)=>{ state.geo = { lat:pos.coords.latitude, lon:pos.coords.longitude }; },
      ()=>{}, { enableHighAccuracy:true, timeout:5000, maximumAge:60000 }
    );
  }

  /* --------------------- Nearby (grid 2×N) --------------------- */
  function renderNearby(){
    const list = filteredDogs();
    if (!list.length){
      nearGrid.innerHTML = `<p style="opacity:.8">${t("noProfiles")}</p>`;
      return;
    }
    nearGrid.innerHTML = list.map(d => dogCardHTML(d)).join("");
    qa(".dog-card").forEach(card=>{
      const id = card.getAttribute("data-id");
      const d = state.dogs.find(x=>x.id===id);
      card.querySelector("img").addEventListener("click", ()=>openProfile(d));
      card.querySelector(".open-profile").addEventListener("click", async ()=>{
        await reward("Video prima di aprire il profilo");
        openProfile(d);
      });
    });
  }

  function dogCardHTML(d){
    const sexClass = d.sex==="M" ? "male" : (d.sex==="F"?"female":"");
    const sexLabel = d.sex==="M" ? "♂" : "♀";
    return `
      <article class="card dog-card ${sexClass}" data-id="${d.id}">
        <img src="${d.img}" alt="${d.name}" class="card-img" />
        <div class="card-info">
          <h3>${d.name} ${sexLabel} ${d.verified?"✅":""}</h3>
          <p class="meta">${d.breed} · ${fmtKm(d.km)} · ${d.age} ${state.lang==="it"?"anni":"yrs"}</p>
          <p class="bio">${d.bio||""}</p>
        </div>
        <div class="card-actions">
          <button class="btn ghost small open-profile">${t("openProfile")}</button>
        </div>
      </article>
    `;
  }
  function fmtKm(n){ return `${n.toFixed(1)} km`; }

  /* --------------------- Filtri (panel) --------------------- */
  btnSearchPanel?.addEventListener("click", ()=>{
    searchPanel.classList.remove("hidden");
  });
  closeSearch?.addEventListener("click", ()=>{
    searchPanel.classList.add("hidden");
  });

  distRange?.addEventListener("input", ()=> distLabel.textContent = `${distRange.value} km`);

  resetFilters?.addEventListener("click", ()=>{
    breedInput.value=""; weightInput.value=""; heightInput.value="";
    distRange.value=5; onlyVerified.checked=false; sexFilter.value="";
    distLabel.textContent = `5 km`;
    Object.assign(state.filters, {breed:"",weight:"",height:"",maxKm:5,onlyVerified:false,sex:""});
    persistFilters();
    renderNearby();
  });

  searchForm?.addEventListener("submit",(e)=>{
    e.preventDefault();
    state.filters.breed  = (breedInput.value||"").trim();
    state.filters.weight = (weightInput.value||"").trim();
    state.filters.height = (heightInput.value||"").trim();
    state.filters.maxKm  = parseInt(distRange.value||"5");
    state.filters.onlyVerified = !!onlyVerified.checked;
    state.filters.sex = sexFilter.value || "";
    persistFilters();
    renderNearby();
    closeSearch.click();
  });

  function persistFilters(){
    localStorage.setItem("filter_breed", state.filters.breed);
    localStorage.setItem("filter_weight", state.filters.weight);
    localStorage.setItem("filter_height", state.filters.height);
    localStorage.setItem("filter_maxKm", String(state.filters.maxKm));
    localStorage.setItem("filter_onlyVerified", String(state.filters.onlyVerified));
    localStorage.setItem("filter_sex", state.filters.sex);
  }

  function filteredDogs(){
    const { breed, weight, height, maxKm, onlyVerified, sex } = state.filters;
    return state.dogs
      .filter(d => d.km <= (maxKm || 999))
      .filter(d => (!breed ? true : d.breed.toLowerCase().startsWith(breed.toLowerCase())))
      .filter(d => (onlyVerified ? d.verified : true))
      .filter(d => (!sex ? true : d.sex === sex))
      .filter(d => (!weight ? true : (d.weight ? d.weight <= parseFloat(weight) : true)))
      .filter(d => (!height ? true : (d.height ? d.height <= parseFloat(height) : true)));
  }

  // Autocomplete razze (prefisso)
  breedInput?.addEventListener("input", ()=>{
    const v = (breedInput.value||"").trim().toLowerCase();
    breedsList.innerHTML=""; breedsList.style.display = "none";
    if (!v) return;
    const matches = state.breeds
      .filter(b => b.toLowerCase().startsWith(v))
      .sort((a,b)=>a.localeCompare(b))
      .slice(0,16);
    if (!matches.length) return;
    breedsList.innerHTML = matches.map(b=>`<div class="item" role="option">${b}</div>`).join("");
    breedsList.style.display = "block";
    qa(".item",breedsList).forEach(it=>it.addEventListener("click", ()=>{
      breedInput.value = it.textContent; breedsList.style.display="none";
    }));
  });
  document.addEventListener("click",(e)=>{
    if (e.target!==breedInput && !breedsList.contains(e.target)) breedsList.style.display="none";
  });

  /* --------------------- Swipe Decks --------------------- */
  function renderSwipe(mode){
    const deck = state.dogs.filter(d=>d.mode===mode);
    if (!deck.length){
      const tgt = mode==="love" ? {img:loveImg, title:loveTitleTxt, meta:loveMeta, bio:loveBio}
                                : {img:socialImg, title:socialTitleTxt, meta:socialMeta, bio:socialBio};
      tgt.img.src="dog1.jpg"; tgt.title.textContent=t("noProfiles");
      tgt.meta.textContent=""; tgt.bio.textContent="";
      return;
    }
    const idx = (mode==="love" ? state.currentLoveIdx : state.currentSocialIdx) % deck.length;
    const d = deck[idx];
    const img   = mode==="love" ? loveImg   : socialImg;
    const title = mode==="love" ? loveTitleTxt : socialTitleTxt;
    const meta  = mode==="love" ? loveMeta  : socialMeta;
    const bio   = mode==="love" ? loveBio   : socialBio;
    const card  = mode==="love" ? loveCard  : socialCard;

    img.src = d.img;
    title.textContent = `${d.name}, ${d.age} ${state.lang==="it"?"anni":"yrs"} ${d.sex==="M"?"♂":"♀"} ${d.verified?"✅":""}`;
    meta.textContent  = `${d.breed} · ${fmtKm(d.km)} · ${mode==="love"?t("love"):t("social")}`;
    bio.textContent   = d.bio || "";
    img.onclick = () => openProfile(d);

    attachSwipe(card, (dir)=>{
      incrementSwipe();
      // glow dorato durante swipe (classe temporanea)
      card.style.boxShadow = "0 0 24px rgba(205,164,52,.45)";
      setTimeout(()=> card.style.boxShadow = "", 400);

      if (dir==="right"){ // possibile match
        if (Math.random()<0.55){
          onMatch();
        }
      }
      if (mode==="love"){ state.currentLoveIdx++; } else { state.currentSocialIdx++; }
      renderSwipe(mode);
    });

    // Fallback buttons
    (mode==="love"?loveYes:socialYes).onclick = ()=>{ simulateSwipe(card,"right"); };
    (mode==="love"?loveNo:socialNo).onclick   = ()=>{ simulateSwipe(card,"left");  };
  }

  function simulateSwipe(card, dir){
    card.classList.add(dir==="right"?"swipe-out-right":"swipe-out-left");
    setTimeout(()=>{ card.classList.remove("swipe-out-right","swipe-out-left"); }, 350);
    card.dispatchEvent(new CustomEvent("swiped",{detail:{dir}}));
  }

  function attachSwipe(card, cb){
    if (card._bound) return;
    card._bound = true;

    let sx=0, sy=0, dx=0, dragging=false;
    const start = (x,y)=>{ sx=x; sy=y; dragging=true; card.style.transition="none"; };
    const move  = (x,y)=>{ if(!dragging) return; dx=x-sx;
      const rot = dx/18; card.style.transform = `translate3d(${dx}px,0,0) rotate(${rot}deg)`;
    };
    const end   = ()=>{ if(!dragging) return; dragging=false; card.style.transition="";
      const th=90;
      if (dx>th){ card.classList.add("swipe-out-right"); setTimeout(()=>{ card.classList.remove("swipe-out-right"); card.style.transform=""; cb("right"); }, 330); }
      else if (dx<-th){ card.classList.add("swipe-out-left"); setTimeout(()=>{ card.classList.remove("swipe-out-left"); card.style.transform=""; cb("left"); }, 330); }
      else { card.style.transform=""; }
      dx=0;
    };

    card.addEventListener("touchstart",e=>start(e.touches[0].clientX,e.touches[0].clientY),{passive:true});
    card.addEventListener("touchmove", e=>move(e.touches[0].clientX,e.touches[0].clientY),{passive:true});
    card.addEventListener("touchend", end);
    card.addEventListener("mousedown", e=>start(e.clientX,e.clientY));
    window.addEventListener("mousemove", e=>move(e.clientX,e.clientY));
    window.addEventListener("mouseup", end);
  }

  function incrementSwipe(){
    state.swipeCount++; localStorage.setItem("swipeCount", String(state.swipeCount));
    if (!state.plus){
      if (state.swipeCount===10 || (state.swipeCount>10 && (state.swipeCount-10)%5===0)){
        reward("Video per continuare a fare swipe");
      }
    }
  }

  function onMatch(){
    state.matchesCount++; localStorage.setItem("matchesCount", String(state.matchesCount));
    if (!state.plus && state.matchesCount>=4){ reward("Video per sbloccare il nuovo match"); }
    // Burst dorato
    const burst = document.createElement("div");
    burst.className = "match-burst";
    burst.textContent = "💖";
    document.body.appendChild(burst);
    setTimeout(()=>burst.remove(), 900);
  }

  /* --------------------- Profilo (sheet) --------------------- */
  window.openProfile = (d) => {
    profileSheet.classList.remove("hidden");
    profileSheet.classList.add("show");
    const sexLabel = d.sex==="M" ? "♂" : "♀";
    ppBody.innerHTML = `
      <div class="center" style="margin-bottom:10px;">
        <img src="${d.img}" alt="${d.name}" style="width:100%;max-height:320px;object-fit:cover;border-radius:12px;border:1px solid #2a2a3a;">
      </div>
      <h2 style="margin:.2rem 0 0">${d.name} ${sexLabel} ${d.verified?"✅":""}</h2>
      <p class="rmeta" style="margin:.2rem 0">${d.breed} · ${fmtKm(d.km)} · ${d.age} ${state.lang==='it'?'anni':'yrs'}</p>
      <p style="margin:.4rem 0 1rem">${d.bio||""}</p>

      <!-- Galleria (solo cane) -->
      <div style="margin:10px 0">
        <button class="btn ghost small" id="btnAddPhoto">Aggiungi foto del cane</button>
      </div>

      <!-- Selfie blur -->
      <div class="selfie">
        <h3 style="color:#cda434;margin:6px 0 8px;">Selfie</h3>
        <img id="selfieImg" src="${d.img}" alt="Selfie" class="selfie-target ${isSelfieUnlocked(d.id)?'':'selfie-blur'}" style="width:100%;height:280px;object-fit:cover;border-radius:12px;border:1px solid #2a2a3a;">
        <div class="selfie-actions">
          <button id="unlockBtn" class="btn ghost small">Sblocca selfie</button>
          <button id="uploadSelfie" class="btn small">Carica selfie</button>
        </div>
      </div>

      <!-- Documenti -->
      <div style="display:grid;gap:8px;margin:12px 0;">
        <button class="btn outline" id="btnDocsOwner">Carica documenti proprietario</button>
        <button class="btn outline" id="btnDocsDog">Carica documenti cane</button>
      </div>

      <!-- Chat -->
      <div style="display:grid;gap:8px;margin:12px 0;">
        <button class="btn" id="btnChatOpen">${t("chat")}</button>
      </div>
    `;

    // Bind
    $("btnAddPhoto").onclick = ()=>alert("Upload foto del cane (mock).");
    $("btnDocsOwner").onclick = ()=>{ alert("Documenti proprietario caricati (mock)."); maybeVerify(d); };
    $("btnDocsDog").onclick   = ()=>{ alert("Documenti cane caricati (mock)."); maybeVerify(d); };
    $("btnChatOpen").onclick  = ()=>{ closeProfilePage(); setTimeout(()=>openChat(d), 160); };

    const unlockBtn = $("unlockBtn");
    const uploadSelfie = $("uploadSelfie");
    const selfieImg = $("selfieImg");
    updateSelfieUI(d.id, selfieImg, unlockBtn);

    unlockBtn.onclick = async ()=>{
      await reward("Video per sbloccare il selfie");
      state.selfieUnlockedUntilByDog[d.id] = Date.now() + 24*60*60*1000;
      localStorage.setItem("selfieUnlockedUntilByDog", JSON.stringify(state.selfieUnlockedUntilByDog));
      updateSelfieUI(d.id, selfieImg, unlockBtn);
    };
    uploadSelfie.onclick = ()=>alert("Upload selfie (mock).");
  };

  window.closeProfilePage = ()=>{
    profileSheet.classList.remove("show");
    setTimeout(()=>profileSheet.classList.add("hidden"), 200);
  };

  function maybeVerify(d){
    // mock: qualsiasi caricamento imposta verificato
    d.verified = true; renderNearby();
  }

  function isSelfieUnlocked(dogId){
    const until = state.selfieUnlockedUntilByDog[dogId] || 0;
    return Date.now() < until;
  }
  function updateSelfieUI(dogId, img, btn){
    if (isSelfieUnlocked(dogId)){ img.classList.remove("selfie-blur"); btn.disabled=true; }
    else { img.classList.add("selfie-blur"); btn.disabled=false; }
  }

  /* --------------------- Chat --------------------- */
  function openChat(dog){
    chatPane.classList.remove("hidden");
    setTimeout(()=>chatPane.classList.add("show"), 10);
    chatPane.dataset.dogId = dog.id;
    chatList.innerHTML = `<div class="msg">Ciao ${dog.name}! 🐶</div>`;
    chatInput.value="";
  }
  function closeChat(){ chatPane.classList.remove("show"); setTimeout(()=>chatPane.classList.add("hidden"), 200); }
  closeChatBtn?.addEventListener("click", closeChat);

  chatComposer?.addEventListener("submit", async (e)=>{
    e.preventDefault();
    const text = chatInput.value.trim(); if (!text) return;
    const dogId = chatPane.dataset.dogId || "unknown";
    if (!state.plus && !state.chatRewardsDone[dogId]){
      await reward("Video per inviare il primo messaggio");
      state.chatRewardsDone[dogId]=true;
      localStorage.setItem("chatRewardsDone", JSON.stringify(state.chatRewardsDone));
    }
    const msg = document.createElement("div");
    msg.className = "msg me"; msg.textContent = text;
    chatList.appendChild(msg); chatInput.value=""; chatList.scrollTop = chatList.scrollHeight;
  });

  /* --------------------- Luoghi Pet / Maps --------------------- */
  function openMapsCategory(cat){
    const map = {
      vets: t("vets"), groomers: t("groomers"), shops:t("shops"),
      parks:t("parks"), trainers:t("trainers"), shelters:t("shelters")
    };
    const query = (map[cat] || "pet");
    if (state.geo){
      const url = `geo:${state.geo.lat},${state.geo.lon}?q=${encodeURIComponent(query)}`;
      window.open(url,"_blank","noopener");
    } else {
      const url = `https://www.google.com/maps/search/${encodeURIComponent(query)}`;
      window.open(url,"_blank","noopener");
    }
  }
  function openSheltersMaps(){
    const q = t("mapsQueryShelters");
    if (state.geo){
      window.open(`geo:${state.geo.lat},${state.geo.lon}?q=${encodeURIComponent(q)}`,"_blank","noopener");
    } else {
      window.open(`https://www.google.com/maps/search/${encodeURIComponent(q)}`,"_blank","noopener");
    }
  }

  /* --------------------- Init --------------------- */
  function init(){
    // Precarica filtri in UI
    if (breedInput) breedInput.value = state.filters.breed;
    if (weightInput) weightInput.value = state.filters.weight;
    if (heightInput) heightInput.value = state.filters.height;
    if (distRange){ distRange.value = state.filters.maxKm; distLabel.textContent = `${distRange.value} km`; }
    if (onlyVerified) onlyVerified.checked = !!state.filters.onlyVerified;
    if (sexFilter) sexFilter.value = state.filters.sex;

    if (state.entered) setActiveView("nearby");
  }
  init();
});
