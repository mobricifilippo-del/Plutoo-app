/* =========================================================
   PLUTOO – app.js (Ricerca completa + Gold 🔒 + hash back)
   - Nessun cambio struttura/ID
   - Pannello Ricerca sempre apribile
   - Filtri liberi: Sesso, Razza (autocomplete prefix), Distanza (slider+numero)
   - Filtri Gold 🔒 (solo Plus): Solo verificati, Accoppiamento, Peso, Altezza
   - Persistenza localStorage
   - Back hardware sicuro via hash (#nearby | #love | #play | #profile-<id>)
   - Nessun codice dopo la chiusura del DOMContentLoaded
   ========================================================= */

document.getElementById('plutooSplash')?.remove();
document.getElementById('splash')?.remove();

document.addEventListener("DOMContentLoaded", () => {

  // -----------------------
  // Helpers
  // -----------------------
  const $  = (id) => document.getElementById(id);
  const qs = (s, r=document) => r.querySelector(s);
  const qa = (s, r=document) => Array.from(r.querySelectorAll(s));

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const fmtKm = n => `${(+n).toFixed(1)} km`;

  // -----------------------
  // DOM refs
  // -----------------------
  const homeScreen   = $("homeScreen");
  const appScreen    = $("appScreen");

  const btnEnter     = $("btnEnter");
  const heroLogo     = $("heroLogo");

  const tabNearby    = $("tabNearby");
  const tabLove      = $("tabLove");
  const tabPlay      = $("tabPlay");
  const tabLuoghi    = $("tabLuoghi");
  const luoghiMenu   = $("luoghiMenu");

  const btnSearchPanel = $("btnSearchPanel");
  const searchPanel  = $("searchPanel");
  const closePanel   = $("closePanel");

  // Filtri (liberi)
  const sexInput     = $("sexInput");
  const breedInput   = $("breedInput");
  const breedSuggest = $("breedSuggest");
  const distInput    = $("distInput");
  const distNum      = $("distNum");

  // Filtri Gold (data-plus-only)
  const onlyVerified = $("onlyVerified");
  const mateAvail    = $("mateAvail");
  const weightMin    = $("weightMin");
  const weightMax    = $("weightMax");
  const heightMin    = $("heightMin");
  const heightMax    = $("heightMax");

  const applyFilters = $("applyFilters");
  const resetFilters = $("resetFilters");

  const profilePage  = $("profilePage");
  const ppBody       = $("ppBody");
  const btnBack      = $("closeProfile");

  const chatPane   = $("chatPane");
  const closeChat  = $("closeChat");
  const chatList   = $("chatList");
  const chatComposer = $("chatComposer");
  const chatInput  = $("chatInput");

  const sponsorLink    = $("sponsorLink");
  const sponsorLinkApp = $("sponsorLinkApp");
  const btnEthics      = $("btnEthics");

  // Viste
  const viewNearby = $("viewNearby");
  const viewLove   = $("viewLove");
  const viewPlay   = $("viewPlay");
  const nearGrid   = $("nearGrid");

  const loveCard   = $("loveCard");
  const loveImg    = $("loveImg");
  const loveTitleTxt = $("loveTitleTxt");
  const loveMeta   = $("loveMeta");
  const loveBio    = $("loveBio");
  const loveNo     = $("loveNo");
  const loveYes    = $("loveYes");

  const playCard   = $("playCard");
  const playImg    = $("playImg");
  const playTitleTxt = $("playTitleTxt");
  const playMeta   = $("playMeta");
  const playBio    = $("playBio");
  const playNo     = $("playNo");
  const playYes    = $("playYes");

  const btnPlus    = $("btnPlus");
  const plusModal  = $("plusModal");

  let lastViewId = "viewNearby";

  // -----------------------
  // Stato & i18n
  // -----------------------
  const STRINGS = {
    it:{
      noProfiles:"Nessun profilo disponibile al momento.",
      unlockSelfie:"Guarda un video per vedere il selfie (24h).",
      rewardDone:"Ricompensa vista! ✅",
      sponsorUrl:"https://www.google.com/search?q=Fido+gelato+per+cani",
      onlyPlus:"Disponibile con Plus",
    },
    en:{
      noProfiles:"No profiles available right now.",
      unlockSelfie:"Watch a video to view selfie (24h).",
      rewardDone:"Reward watched! ✅",
      sponsorUrl:"https://www.google.com/search?q=Fido+ice+cream+for+dogs",
      onlyPlus:"Available with Plus",
    }
  };
  const lang = (localStorage.getItem("lang") || autodetectLang());
  const t = (k)=>STRINGS[lang]?.[k] || k;

  const state = {
    lang,
    plus: localStorage.getItem("plutoo_plus")==="yes",
    entered: localStorage.getItem("entered")==="1",
    swipeCount: parseInt(localStorage.getItem("swipes")||"0",10) || 0,
    matches: parseInt(localStorage.getItem("matches")||"0",10) || 0,
    currentLoveIdx: parseInt(localStorage.getItem("idx_love")||"0",10) || 0,
    currentPlayIdx: parseInt(localStorage.getItem("idx_play")||"0",10) || 0,
    // Filtri (persistiti)
    filters: {
      sex:         localStorage.getItem("f_sex") || "",
      breed:       localStorage.getItem("f_breed") || "",
      distKm:      parseInt(localStorage.getItem("f_distKm")||"5",10),
      onlyVerified:localStorage.getItem("f_onlyVerified")==="1",   // Gold
      mateAvail:   localStorage.getItem("f_mateAvail") || "",      // "si" | "no" | ""
      weightMin:   numOrNull(localStorage.getItem("f_weightMin")),
      weightMax:   numOrNull(localStorage.getItem("f_weightMax")),
      heightMin:   numOrNull(localStorage.getItem("f_heightMin")),
      heightMax:   numOrNull(localStorage.getItem("f_heightMax")),
    }
  };

  function numOrNull(v){ return v===""||v===null||v===undefined ? null : Number(v); }

  function autodetectLang(){
    const n = (navigator.language||"it").slice(0,2);
    return (n==="it"||n==="en")?n:"it";
  }

  // -----------------------
  // Dataset DOGS (foto fisse, coerenza tra viste)
  // Aggiunti: weightKg, heightCm, mate ("si"/"no")
  // -----------------------
  const DOGS = [
    { id:"d1", name:"Luna",  sex:"F", age:2, breed:"Golden Retriever", km:1.2, img:"dog1.jpg", bio:"Dolcissima e curiosa.", verified:true,  mode:"love", weightKg:28, heightCm:55, mate:"si" },
    { id:"d2", name:"Rex",   sex:"M", age:4, breed:"Pastore Tedesco",  km:2.5, img:"dog2.jpg", bio:"Fedele e giocherellone.",verified:true,  mode:"play", weightKg:34, heightCm:62, mate:"no" },
    { id:"d3", name:"Maya",  sex:"F", age:3, breed:"Bulldog Francese", km:3.2, img:"dog3.jpg", bio:"Coccole e passeggiate.", verified:false, mode:"love", weightKg:11, heightCm:30, mate:"si" },
    { id:"d4", name:"Rocky", sex:"M", age:5, breed:"Beagle",           km:4.1, img:"dog4.jpg", bio:"Sempre in movimento.",   verified:true,  mode:"play", weightKg:13, heightCm:38, mate:"si" },
    { id:"d5", name:"Chicco",sex:"M", age:1, breed:"Barboncino",       km:0.8, img:"dog5.jpg", bio:"Piccolo fulmine.",       verified:true,  mode:"love", weightKg:6,  heightCm:28, mate:"no" },
    { id:"d6", name:"Kira",  sex:"F", age:6, breed:"Labrador",         km:5.6, img:"dog6.jpg", bio:"Acqua e palla.",         verified:true,  mode:"play", weightKg:29, heightCm:56, mate:"no" },
  ];

  // -----------------------
  // Razze (autocomplete)
  // -----------------------
  fetch("breeds.json").then(r=>r.json()).then(arr=>{
    if (Array.isArray(arr)) window.ALL_BREEDS = arr;
  }).catch(()=>{ window.ALL_BREEDS = [
    "Pastore Tedesco","Labrador","Golden Retriever","Jack Russell",
    "Bulldog Francese","Barboncino","Border Collie","Chihuahua",
    "Carlino","Beagle","Maltese","Shih Tzu","Husky","Bassotto","Cocker Spaniel"
  ];});

  breedInput?.addEventListener("input", ()=>{
    const q = (breedInput.value||"").trim().toLowerCase();
    if (!q){ breedSuggest.innerHTML=""; breedSuggest.style.display="none"; return; }
    const src = (window.ALL_BREEDS||[]).filter(x=>x.toLowerCase().startsWith(q)).slice(0,20);
    breedSuggest.innerHTML = src.map(x=>`<li>${x}</li>`).join("");
    breedSuggest.style.display = src.length ? "block" : "none";
    qa("li",breedSuggest).forEach(li=>{
      li.addEventListener("click",()=>{
        breedInput.value = li.textContent;
        breedSuggest.innerHTML=""; breedSuggest.style.display="none";
      });
    });
  });

  // -----------------------
  // Entrata App / Home
  // -----------------------
  btnEnter?.addEventListener("click", ()=>{
    try{ heroLogo?.classList.add("glow-vg"); }catch(e){}
    setTimeout(()=>{
      state.entered = true;
      localStorage.setItem("entered","1");
      homeScreen.classList.add("hidden");
      appScreen.classList.remove("hidden");
      setActiveView("nearby");
    }, 220);
  });

  // Etico (solo Home)
  btnEthics?.addEventListener("click",(e)=>{
    e.preventDefault();
    if (state.plus){
      window.open("https://www.google.com/maps/search/"+encodeURIComponent("canili vicino a me"), "_blank","noopener");
    } else {
      // Reward mock → poi Maps
      toast("Video…"); 
      setTimeout(()=>window.open("https://www.google.com/maps/search/"+encodeURIComponent("canili vicino a me"), "_blank","noopener"), 800);
    }
  });

  // Sponsor
  function openSponsor(){ window.open(t("sponsorUrl"), "_blank", "noopener"); }
  sponsorLink?.addEventListener("click",(e)=>{ e.preventDefault(); openSponsor(); });
  sponsorLinkApp?.addEventListener("click",(e)=>{ e.preventDefault(); openSponsor(); });

  // -----------------------
  // Tabs & menu Luoghi
  // -----------------------
  tabNearby?.addEventListener("click", ()=>setActiveView("nearby"));
  tabLove?.addEventListener("click",   ()=>setActiveView("love"));
  tabPlay?.addEventListener("click",   ()=>setActiveView("play"));

  tabLuoghi?.addEventListener("click",(e)=>{
    e.stopPropagation();
    const wrap = tabLuoghi.parentElement;
    const expanded = wrap.classList.toggle("open");
    tabLuoghi.setAttribute("aria-expanded", expanded ? "true" : "false");
  });
  document.addEventListener("click",()=>tabLuoghi?.parentElement.classList.remove("open"));

  qa(".menu-item", luoghiMenu).forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const cat = btn.getAttribute("data-cat");
      tabLuoghi.parentElement.classList.remove("open");
      openMapsCategory(cat);
    });
  });

  function openMapsCategory(cat){
    const qMap = {
      veterinari:"veterinari per cani vicino a me",
      toelettatura:"toelettatura per cani vicino a me",
      negozi:"negozi animali vicino a me",
      parchi:"parchi per cani vicino a me",
      addestratori:"addestratori cani vicino a me",
      canili:"canili vicino a me"
    }[cat]||"negozi animali vicino a me";
    // Reward opzionale (mock) se non Plus
    if (!state.plus){ toast("Video…"); setTimeout(()=>window.open(`https://www.google.com/maps/search/${encodeURIComponent(qMap)}`,"_blank","noopener"),800); }
    else { window.open(`https://www.google.com/maps/search/${encodeURIComponent(qMap)}`,"_blank","noopener"); }
  }

  // -----------------------
  // Back hardware via hash
  // -----------------------
  function showView(id){
    qa(".view").forEach(v => v.classList.remove("active"));
    $(id)?.classList.add("active");
    lastViewId = id;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function setActiveView(name){
    [viewNearby, viewLove, viewPlay].forEach(v=>v?.classList.remove("active"));
    [tabNearby, tabLove, tabPlay].forEach(t=>t?.classList.remove("active"));

    if (name==="nearby"){
      viewNearby.classList.add("active");
      tabNearby.classList.add("active");
      renderNearby();
      if (location.hash !== "#nearby") location.hash = "#nearby";
      lastViewId = "viewNearby";
    }
    if (name==="love"){
      viewLove.classList.add("active");
      tabLove.classList.add("active");
      renderSwipe("love");
      if (location.hash !== "#love") location.hash = "#love";
      lastViewId = "viewLove";
    }
    if (name==="play"){
      viewPlay.classList.add("active");
      tabPlay.classList.add("active");
      renderSwipe("play");
      if (location.hash !== "#play") location.hash = "#play";
      lastViewId = "viewPlay";
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  window.addEventListener("hashchange", ()=>{
    const h = (location.hash||"").replace(/^#/, "");
    if (!h) return;
    if (h.startsWith("profile-")){
      const id = h.slice("profile-".length);
      const d = DOGS.find(x=>x.id===id);
      if (d){
        homeScreen.classList.add("hidden");
        appScreen.classList.remove("hidden");
        openProfile(d);
        return;
      }
    }
    if (h==="nearby"||h==="love"||h==="play"){
      profilePage?.classList.add("hidden");
      setActiveView(h);
      return;
    }
  });

  (function honorHashOnLoad(){
    if (!state.entered) return;
    const h = (location.hash||"").replace(/^#/, "");
    if (h==="nearby"||h==="love"||h==="play"){ setActiveView(h); }
    else if (h.startsWith("profile-")){
      const id = h.slice("profile-".length);
      const d = DOGS.find(x=>x.id===id);
      if (d) openProfile(d);
    }
  })();

  // -----------------------
  // Ricerca personalizzata
  // -----------------------

  // Pannello SEMPRE apribile (gating solo sui campi Gold)
  btnSearchPanel?.addEventListener("click", ()=>{
    restoreFiltersToUI();
    handlePlusLockUI();
    searchPanel.classList.remove("hidden");
  });
  closePanel?.addEventListener("click", ()=>searchPanel.classList.add("hidden"));

  // Sync distanza slider ↔ numero (1..50)
  function syncDistFromSlider(){
    const v = clamp(parseInt(distInput.value||"5",10),1,50);
    distInput.value = String(v);
    distNum.value   = String(v);
  }
  function syncDistFromNumber(){
    const v = clamp(parseInt(distNum.value||"5",10),1,50);
    distNum.value   = String(v);
    distInput.value = String(v);
  }
  distInput?.addEventListener("input", syncDistFromSlider);
  distNum?.addEventListener("input",   syncDistFromNumber);

  // Gating Gold: disabilita campi con data-plus-only se non Plus
  function handlePlusLockUI(){
    const isPlus = state.plus === true;
    qa("[data-plus-only]").forEach(el=>{
      el.disabled = !isPlus;
      // click/tap su elemento disabilitato → apri Plus
      const openPlus = (ev)=>{
        if (!isPlus){
          ev.preventDefault();
          ev.stopPropagation();
          plusModal?.classList.remove("hidden");
          return false;
        }
      };
      // Bind su eventi principali
      el.onpointerdown = openPlus;
      el.onfocus = openPlus;
      el.onclick = openPlus;
    });
    // Decorazione visiva (testo "gold-locked" già nel markup/CSS)
  }

  // Salvataggio / ripristino filtri
  function persistFiltersFromUI(){
    state.filters.sex         = sexInput.value || "";
    state.filters.breed       = (breedInput.value||"").trim();
    state.filters.distKm      = clamp(parseInt(distInput.value||"5",10),1,50);
    state.filters.onlyVerified= !!onlyVerified.checked;
    state.filters.mateAvail   = mateAvail.value || "";
    state.filters.weightMin   = valOrNull(weightMin.value);
    state.filters.weightMax   = valOrNull(weightMax.value);
    state.filters.heightMin   = valOrNull(heightMin.value);
    state.filters.heightMax   = valOrNull(heightMax.value);

    localStorage.setItem("f_sex", state.filters.sex);
    localStorage.setItem("f_breed", state.filters.breed);
    localStorage.setItem("f_distKm", String(state.filters.distKm));
    localStorage.setItem("f_onlyVerified", state.filters.onlyVerified ? "1" : "");
    localStorage.setItem("f_mateAvail", state.filters.mateAvail);
    localStorage.setItem("f_weightMin", state.filters.weightMin ?? "");
    localStorage.setItem("f_weightMax", state.filters.weightMax ?? "");
    localStorage.setItem("f_heightMin", state.filters.heightMin ?? "");
    localStorage.setItem("f_heightMax", state.filters.heightMax ?? "");
  }
  function valOrNull(v){ return (v===null || v===undefined || v==="") ? null : Number(v); }

  function restoreFiltersToUI(){
    sexInput.value   = state.filters.sex || "";
    breedInput.value = state.filters.breed || "";
    distInput.value  = String(clamp(state.filters.distKm||5,1,50));
    distNum.value    = distInput.value;

    onlyVerified.checked = !!state.filters.onlyVerified;
    mateAvail.value      = state.filters.mateAvail || "";

    weightMin.value = state.filters.weightMin ?? "";
    weightMax.value = state.filters.weightMax ?? "";
    heightMin.value = state.filters.heightMin ?? "";
    heightMax.value = state.filters.heightMax ?? "";
  }

  applyFilters?.addEventListener("click", ()=>{
    persistFiltersFromUI();
    searchPanel.classList.add("hidden");
    renderNearby();
    // Se ci troviamo su Love/Play, non ricarichiamo le card qui (restano indipendenti)
  });

  resetFilters?.addEventListener("click", ()=>{
    sexInput.value=""; breedInput.value=""; distInput.value="5"; distNum.value="5";
    onlyVerified.checked=false; mateAvail.value="";
    weightMin.value=""; weightMax.value=""; heightMin.value=""; heightMax.value="";
    persistFiltersFromUI();
    breedSuggest.innerHTML=""; breedSuggest.style.display="none";
    renderNearby();
  });

  // -----------------------
  // Rendering liste
  // -----------------------
  function cardHTML(d){
    return `
      <article class="card dog-card" data-id="${d.id}">
        <img src="${d.img}" alt="${d.name}" class="card-img" />
        <div class="card-info">
          <h3>${d.name} ${d.verified?"✅":""}</h3>
          <p class="meta">${d.breed} · ${d.age} ${state.lang==="it"?"anni":"yrs"} · ${fmtKm(d.km)}</p>
          <p class="bio">${d.bio||""}</p>
        </div>
        <div class="card-actions">
          <button class="btn ghost small open-profile">Apri profilo</button>
        </div>
      </article>`;
  }

  function filteredDogs(){
    const f = state.filters;
    let list = DOGS.slice();

    // Filtri liberi
    if (f.sex)   list = list.filter(d => d.sex === f.sex);
    if (f.breed) list = list.filter(d => d.breed.toLowerCase().startsWith(f.breed.toLowerCase()));
    list = list.filter(d => d.km <= (f.distKm||999));

    // Filtri Gold solo se Plus; se non Plus, non influiscono (ma restano in UI)
    if (state.plus){
      if (f.onlyVerified) list = list.filter(d => d.verified === true);
      if (f.mateAvail)    list = list.filter(d => d.mate === f.mateAvail); // "si"/"no"
      if (f.weightMin!=null) list = list.filter(d => (d.weightKg ?? 0) >= f.weightMin);
      if (f.weightMax!=null) list = list.filter(d => (d.weightKg ?? 0) <= f.weightMax);
      if (f.heightMin!=null) list = list.filter(d => (d.heightCm ?? 0) >= f.heightMin);
      if (f.heightMax!=null) list = list.filter(d => (d.heightCm ?? 0) <= f.heightMax);
    }

    return list;
  }

  function renderNearby(){
    const list = filteredDogs();
    if (!list.length){
      nearGrid.innerHTML = `<p class="soft" style="padding:.5rem">${t("noProfiles")}</p>`;
      return;
    }
    nearGrid.innerHTML = list.map(cardHTML).join("");
    qa(".dog-card").forEach(card=>{
      const id = card.getAttribute("data-id");
      const d  = DOGS.find(x=>x.id===id);
      const img = qs(".card-img", card);
      img?.addEventListener("click", ()=>{
        img.classList.add("tap-glow");
        setTimeout(()=>img.classList.remove("tap-glow"), 450);
        openProfile(d);
      });
      qs(".open-profile", card)?.addEventListener("click", ()=>openProfile(d));
    });
  }

  // -----------------------
  // Swipe Decks (Love/Play)
  // -----------------------
  function attachSwipe(card, cb){
    if (card._sw) return;
    card._sw = true;
    let sx=0, dx=0, dragging=false;
    const start=(x)=>{ sx=x; dragging=true; card.style.transition="none"; };
    const move =(x)=>{ if(!dragging) return; dx=x-sx; const rot=Math.max(-12,Math.min(12,dx/12)); card.style.transform=`translate3d(${dx}px,0,0) rotate(${rot}deg)`; };
    const resetCard = (c)=>{ c.style.transition="transform .45s ease"; c.style.transform="translate3d(0,0,0) rotate(0)"; c.classList.remove("swipe-out-left","swipe-out-right"); };
    const end =()=>{ if(!dragging) return; dragging=false; card.style.transition=""; const th=90;
      if (dx>th){ card.classList.add("swipe-out-right"); setTimeout(()=>{ resetCard(card); cb("right"); }, 550); }
      else if (dx<-th){ card.classList.add("swipe-out-left"); setTimeout(()=>{ resetCard(card); cb("left"); }, 550); }
      else { resetCard(card); }
      dx=0;
    };
    card.addEventListener("touchstart", e=>start(e.touches[0].clientX), {passive:true});
    card.addEventListener("touchmove",  e=>move(e.touches[0].clientX),  {passive:true});
    card.addEventListener("touchend", end);
  }

  function simulateSwipe(card, side){
    if (side==="right"){ card.classList.add("swipe-out-right"); }
    if (side==="left") { card.classList.add("swipe-out-left"); }
    setTimeout(()=>card.dispatchEvent(new Event("touchend")), 350);
  }

  function pickNext(mode){
    const list = DOGS.filter(d=>d.mode===mode);
    const idx  = mode==="love" ? (state.currentLoveIdx % list.length) : (state.currentPlayIdx % list.length);
    return list[idx];
  }

  function renderSwipe(mode){
    const d = pickNext(mode);
    const card = mode==="love" ? loveCard : playCard;
    const img  = mode==="love" ? loveImg  : playImg;
    const title= mode==="love" ? loveTitleTxt : playTitleTxt;
    const meta = mode==="love" ? loveMeta : playMeta;
    const bio  = mode==="love" ? loveBio  : playBio;
    const yesBtn= mode==="love" ? loveYes : playYes;
    const noBtn = mode==="love" ? loveNo  : playNo;

    img.src = d.img;
    title.textContent = `${d.name} ${d.verified?"✅":""}`;
    meta.textContent  = `${d.breed} · ${d.age} ${state.lang==="it"?"anni":"yrs"} · ${fmtKm(d.km)}`;
    bio.textContent   = d.bio || "";
    img.onclick = ()=>openProfile(d);

    attachSwipe(card, dir=>{
      if (mode==="love") state.currentLoveIdx++; else state.currentPlayIdx++;
      localStorage.setItem("idx_love", String(state.currentLoveIdx));
      localStorage.setItem("idx_play", String(state.currentPlayIdx));
      setTimeout(()=>renderSwipe(mode), 10);
    });

    yesBtn.onclick = ()=>simulateSwipe(card,"right");
    noBtn.onclick  = ()=>simulateSwipe(card,"left");
  }

  // -----------------------
  // Profilo
  // -----------------------
  window.openProfile = (d) => {
    if (!d) return;
    try { if (d && location.hash !== "#profile-"+d.id) location.hash = "#profile-"+d.id; } catch(e){}
    ppBody.innerHTML = `
      <div class="photo"><img src="${d.img}" alt="${d.name}"></div>
      <h2>${d.name}</h2>
      <div class="dog-attr">${d.breed} · ${d.age} ${state.lang==="it"?"anni":"yrs"} · ${fmtKm(d.km)}</div>
      ${d.verified?`<div class="badge-verified">Verificato</div>`:""}
      <div class="profile-actions" style="display:flex;gap:.5rem;margin-top:.6rem">
        <button id="openChat" class="btn accent">Messaggio</button>
        <button id="viewSelfie" class="btn ghost">Vedi selfie</button>
      </div>
    `;
    profilePage.classList.remove("hidden");
    $("openChat")?.addEventListener("click", openChat);
    $("viewSelfie")?.addEventListener("click", ()=>viewSelfie(d));
  };

  btnBack?.addEventListener("click", ()=>{
    profilePage.classList.add("hidden");
    if (location.hash.startsWith("#profile-")){ history.back(); return; }
    setActiveView("nearby");
  });

  // -----------------------
  // Chat & Selfie (mock reward)
  // -----------------------
  function openChat(){
    chatPane.classList.remove("hidden");
    chatList.innerHTML = "";
  }
  closeChat?.addEventListener("click", ()=>chatPane.classList.add("hidden"));

  function viewSelfie(d){
    if (state.plus){ toast("Selfie sempre visibile con Plus ✅"); return; }
    const key = "selfie_"+d.id;
    const until = parseInt(localStorage.getItem(key)||"0",10);
    const now = Date.now();
    if (now < until){ toast("Selfie già sbloccato ✅"); return; }
    toast(t("unlockSelfie"));
    setTimeout(()=>{
      const next = now + 24*60*60*1000;
      localStorage.setItem(key, String(next));
      toast(t("rewardDone"));
    }, 800);
  }

  // -----------------------
  // TOAST utility
  // -----------------------
  function toast(msg){
    try{
      const b = document.createElement("div");
      b.textContent = msg;
      b.style.position = "fixed";
      b.style.bottom = "1rem";
      b.style.left = "50%";
      b.style.transform = "translateX(-50%)";
      b.style.padding = ".6rem 1rem";
      b.style.background = "rgba(0,0,0,.85)";
      b.style.color = "#fff";
      b.style.border = "1px solid rgba(255,255,255,.15)";
      b.style.borderRadius = "10px";
      b.style.zIndex = "1000";
      document.body.appendChild(b);
      setTimeout(() => b.remove(), 2000);
    } catch (e) {}
  }

  // -----------------------
  // Avvio
  // -----------------------
  if (state.entered){
    homeScreen.classList.add("hidden");
    appScreen.classList.remove("hidden");
    setActiveView("nearby");
  } else {
    homeScreen.classList.remove("hidden");
    appScreen.classList.add("hidden");
  }

  function init(){ /* hook per eventuali inizializzazioni future */ }
  init();
}); // <-- chiusura unica corretta del DOMContentLoaded
