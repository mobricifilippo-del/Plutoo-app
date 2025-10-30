/* =========================================================
   PLUTOO – app.js (Violet Edition + Gold Sponsor)
   Aggiunte: Plutoo Plus, filtri Gold, animazioni viola,
   profilo pagina dedicata, bilingue IT/EN, ads mock test
   ========================================================= */
document.getElementById('plutooSplash')?.remove();
document.getElementById('splash')?.remove();
document.addEventListener("DOMContentLoaded", () => {
   
  // Helpers
  const $  = (id) => document.getElementById(id);
  const qs = (s, r=document) => r.querySelector(s);
  const qa = (s, r=document) => Array.from(r.querySelectorAll(s));

  // DOM refs
  const homeScreen   = $("homeScreen");
  const appScreen    = $("appScreen");
  const heroLogo     = $("heroLogo");
  const btnEnter     = $("btnEnter");
  const sponsorLink  = $("sponsorLink");
  const sponsorLinkApp = $("sponsorLinkApp");
  const ethicsButton = $("ethicsButton");
  const ethicsButtonApp = $("ethicsButtonApp");
  const btnBack      = $("btnBack");
  const btnPlus      = $("btnPlus");

  const tabNearby = $("tabNearby");
  const tabLove   = $("tabLove");
  const tabPlay   = $("tabPlay");
  const tabLuoghi = $("tabLuoghi");
  const luoghiMenu = $("luoghiMenu");

  const viewNearby = $("viewNearby");
  const viewLove   = $("viewLove");
  const viewPlay   = $("viewPlay");
  const nearGrid   = $("nearGrid");

  const loveCard = $("loveCard");
  const loveImg  = $("loveImg");
  const loveTitleTxt = $("loveTitleTxt");
  const loveMeta = $("loveMeta");
  const loveBio  = $("loveBio");
  const loveNo   = $("loveNo");
  const loveYes  = $("loveYes");

  const playCard = $("playCard");
  const playImg  = $("playImg");
  const playTitleTxt = $("playTitleTxt");
  const playMeta  = $("playMeta");
  const playBio   = $("playBio");
  const playNo    = $("playNo");
  const playYes   = $("playYes");

  const btnSearchPanel = $("btnSearchPanel");
  const searchPanel = $("searchPanel");
  const closeSearch = $("closeSearch");
  const breedInput  = $("breedInput");
  const breedsList  = $("breedsList");
  const distRange   = $("distRange");
  const distLabel   = $("distLabel");
  const onlyVerified = $("onlyVerified");
  const sexFilter   = $("sexFilter");
  const ageMin      = $("ageMin");
  const ageMax      = $("ageMax");
  const weightInput = $("weightInput");
  const heightInput = $("heightInput");
  const pedigreeFilter = $("pedigreeFilter");
  const breedingFilter = $("breedingFilter");
  const sizeFilter  = $("sizeFilter");
  const applyFilters = $("applyFilters");
  const resetFilters = $("resetFilters");

  const plusModal = $("plusModal");
  const closePlus = $("closePlus");
  const cancelPlus = $("cancelPlus");
  const activatePlus = $("activatePlus");

  const chatPane   = $("chatPane");
  const closeChat  = $("closeChat");
  const chatList   = $("chatList");
  const chatComposer = $("chatComposer");
  const chatInput  = $("chatInput");

  const profileSheet = $("profileSheet");
  const ppBody   = $("ppBody");

  const adBanner = $("adBanner");

  // Stato
  const state = {
    lang: (localStorage.getItem("lang") || autodetectLang()),
    plus: localStorage.getItem("plutoo_plus")==="yes",
    entered: localStorage.getItem("entered")==="1",
    swipeCount: parseInt(localStorage.getItem("swipes")||"0"),
    matches: parseInt(localStorage.getItem("matches")||"0"),
    firstMsgRewardByDog: JSON.parse(localStorage.getItem("firstMsgRewardByDog")||"{}"),
    selfieUntilByDog: JSON.parse(localStorage.getItem("selfieUntilByDog")||"{}"),
    currentLoveIdx: 0,
    currentPlayIdx: 0,
    filters: {
      breed: localStorage.getItem("f_breed") || "",
      distKm: parseInt(localStorage.getItem("f_distKm")||"5"),
      verified: localStorage.getItem("f_verified")==="1",
      sex: localStorage.getItem("f_sex") || "",
      ageMin: localStorage.getItem("f_ageMin") || "",
      ageMax: localStorage.getItem("f_ageMax") || "",
      weight: localStorage.getItem("f_weight") || "",
      height: localStorage.getItem("f_height") || "",
      pedigree: localStorage.getItem("f_pedigree") || "",
      breeding: localStorage.getItem("f_breeding") || "",
      size: localStorage.getItem("f_size") || ""
    },
    geo: null,
    breeds: []
  };

  // I18N completo IT/EN
  const I18N = {
    it: {
      brand: "Plutoo",
      login: "Login",
      register: "Registrati",
      enter: "Entra",
      sponsorTitle: "Sponsor ufficiale",
      sponsorCopy: "Fido, il gelato per i nostri amici a quattro zampe",
      sponsorUrl: "https://example.com/fido-gelato",
      ethicsLine1: "Non abbandonare mai i tuoi amici",
      ethicsLine2: "(canili vicino a me)",
      terms: "Termini",
      privacy: "Privacy",
      nearby: "Vicino a te",
      love: "Amore",
      searchAdvanced: "Ricerca personalizzata",
      plusBtn: "PLUS",
      chat: "Chat",
      profile: "Profilo",
      typeMessage: "Scrivi un messaggio…",
      send: "Invia",
      freeFilters: "Filtri base",
      goldFilters: "Filtri Gold",
      sexFilter: "Sesso",
      sexAll: "Tutti",
      sexMale: "Maschio",
      sexFemale: "Femmina",
      distance: "Distanza",
      breed: "Razza",
      breedPh: "Cerca razza…",
      onlyVerified: "Solo con badge verificato ✅",
      ageMin: "Età minima (anni)",
      ageMax: "Età massima (anni)",
      weight: "Peso (kg)",
      height: "Altezza (cm)",
      pedigree: "Pedigree",
      breeding: "Disponibile per accoppiamento",
      size: "Taglia",
      indifferent: "Indifferente",
      yes: "Sì",
      no: "No",
      sizeSmall: "Piccola",
      sizeMedium: "Media",
      sizeLarge: "Grande",
      apply: "Applica",
      reset: "Reset",
      unlockHint: "Vuoi sbloccare i filtri Gold? Attiva <strong>Plutoo Plus 💎</strong>",
      plusTitle: "Plutoo Plus",
      plusSubtitle: "Sblocca tutte le funzionalità premium",
      plusFeature1: "Nessuna pubblicità",
      plusFeature2: "Swipe illimitati",
      plusFeature3: "Messaggi illimitati",
      plusFeature4: "Tutti i filtri Gold sbloccati",
      plusFeature5: "Supporto prioritario",
      plusPeriod: "/mese",
      activatePlus: "Attiva Plutoo Plus",
      cancel: "Annulla",
      mapsShelters: "canili vicino a me",
      noProfiles: "Nessun profilo. Modifica i filtri.",
      years: "anni"
    },
    en: {
      brand: "Plutoo",
      login: "Login",
      register: "Sign up",
      enter: "Enter",
      sponsorTitle: "Official Sponsor",
      sponsorCopy: "Fido, ice cream for our four-legged friends",
      sponsorUrl: "https://example.com/fido-gelato",
      ethicsLine1: "Never abandon your friends",
      ethicsLine2: "(animal shelters near me)",
      terms: "Terms",
      privacy: "Privacy",
      nearby: "Nearby",
      love: "Love",
      searchAdvanced: "Advanced Search",
      plusBtn: "PLUS",
      chat: "Chat",
      profile: "Profile",
      typeMessage: "Type a message…",
      send: "Send",
      freeFilters: "Basic Filters",
      goldFilters: "Gold Filters",
      sexFilter: "Sex",
      sexAll: "All",
      sexMale: "Male",
      sexFemale: "Female",
      distance: "Distance",
      breed: "Breed",
      breedPh: "Search breed…",
      onlyVerified: "Only verified badges ✅",
      ageMin: "Min age (years)",
      ageMax: "Max age (years)",
      weight: "Weight (kg)",
      height: "Height (cm)",
      pedigree: "Pedigree",
      breeding: "Available for breeding",
      size: "Size",
      indifferent: "Any",
      yes: "Yes",
      no: "No",
      sizeSmall: "Small",
      sizeMedium: "Medium",
      sizeLarge: "Large",
      apply: "Apply",
      reset: "Reset",
      unlockHint: "Want to unlock Gold filters? Activate <strong>Plutoo Plus 💎</strong>",
      plusTitle: "Plutoo Plus",
      plusSubtitle: "Unlock all premium features",
      plusFeature1: "No ads",
      plusFeature2: "Unlimited swipes",
      plusFeature3: "Unlimited messages",
      plusFeature4: "All Gold filters unlocked",
      plusFeature5: "Priority support",
      plusPeriod: "/month",
      activatePlus: "Activate Plutoo Plus",
      cancel: "Cancel",
      mapsShelters: "animal shelters near me",
      noProfiles: "No profiles. Adjust filters.",
      years: "yrs"
    }
  };
  const t = (k) => (I18N[state.lang] && I18N[state.lang][k]) || k;
  function autodetectLang(){ return (navigator.language||"it").toLowerCase().startsWith("en")?"en":"it"; }

  // Applica traduzioni dinamiche
  function applyTranslations(){
    qa("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      if (I18N[state.lang] && I18N[state.lang][key]) {
        el.textContent = I18N[state.lang][key];
      }
    });
    qa("[data-i18n-placeholder]").forEach(el => {
      const key = el.getAttribute("data-i18n-placeholder");
      if (I18N[state.lang] && I18N[state.lang][key]) {
        el.placeholder = I18N[state.lang][key];
      }
    });
  }

  // Lang flags
  $("langIT")?.addEventListener("click", ()=>{
    state.lang="it";
    localStorage.setItem("lang","it");
    applyTranslations();
    if(state.entered) renderNearby();
  });
  $("langEN")?.addEventListener("click", ()=>{
    state.lang="en";
    localStorage.setItem("lang","en");
    applyTranslations();
    if(state.entered) renderNearby();
  });

  // Dati mock (8 profili, immagini variegate)
  const DOGS = [
    { id:"d1", name:"Luna",   age:2, breed:"Golden Retriever", km:1.2, img:"dog1.jpg", bio:"Dolcissima e curiosa.", mode:"love", sex:"F", verified:true, weight:28, height:55, pedigree:true, breeding:false, size:"medium" },
    { id:"d2", name:"Rex",    age:4, breed:"Pastore Tedesco",  km:3.4, img:"dog2.jpg", bio:"Fedele e giocherellone.", mode:"play", sex:"M", verified:true, weight:35, height:62, pedigree:true, breeding:true, size:"large" },
    { id:"d3", name:"Maya",   age:3, breed:"Bulldog Francese", km:2.1, img:"dog3.jpg", bio:"Coccole e passeggiate.", mode:"love", sex:"F", verified:false, weight:12, height:30, pedigree:false, breeding:false, size:"small" },
    { id:"d4", name:"Rocky",  age:5, breed:"Beagle",           km:4.0, img:"dog4.jpg", bio:"Sempre in movimento.", mode:"play", sex:"M", verified:true, weight:15, height:38, pedigree:true, breeding:false, size:"medium" },
    { id:"d5", name:"Chicco", age:1, breed:"Barboncino",       km:0.8, img:"dog1.jpg", bio:"Piccolo fulmine.", mode:"love", sex:"M", verified:true, weight:8, height:28, pedigree:false, breeding:false, size:"small" },
    { id:"d6", name:"Kira",   age:6, breed:"Labrador",         km:5.1, img:"dog2.jpg", bio:"Acqua e palla.", mode:"play", sex:"F", verified:true, weight:30, height:58, pedigree:true, breeding:true, size:"large" },
    { id:"d7", name:"Toby",   age:2, breed:"Husky",            km:2.8, img:"dog3.jpg", bio:"Energia pura.", mode:"love", sex:"M", verified:true, weight:25, height:54, pedigree:true, breeding:true, size:"medium" },
    { id:"d8", name:"Bella",  age:4, breed:"Cocker Spaniel",   km:1.5, img:"dog4.jpg", bio:"Dolce compagna.", mode:"play", sex:"F", verified:false, weight:14, height:40, pedigree:false, breeding:false, size:"medium" }
  ];

  // Razze
  fetch("breeds.json").then(r=>r.json()).then(arr=>{
    if (Array.isArray(arr)) state.breeds = arr.sort();
  }).catch(()=>{ state.breeds = [
    "Pastore Tedesco","Labrador","Golden Retriever","Jack Russell",
    "Bulldog Francese","Barboncino","Border Collie","Chihuahua",
    "Carlino","Beagle","Maltese","Shih Tzu","Husky","Bassotto","Cocker Spaniel"
  ].sort();});

  // Geo
  if ("geolocation" in navigator){
    navigator.geolocation.getCurrentPosition(
      p=>{ state.geo = { lat:p.coords.latitude, lon:p.coords.longitude }; },
      ()=>{}, { enableHighAccuracy:true, timeout:5000, maximumAge:60000 }
    );
  }

  // HOME ↔ APP
  if (state.entered) {
    homeScreen.classList.add("hidden");
    appScreen.classList.remove("hidden");
    setActiveView("nearby");
    showAdBanner();
  }

  // Entra: animazione heartbeat viola (1.5s) poi entra
  btnEnter?.addEventListener("click", ()=>{
    heroLogo?.classList.remove("heartbeat-violet");
    void heroLogo?.offsetWidth;
    heroLogo?.classList.add("heartbeat-violet");

    setTimeout(()=>{
      state.entered = true;
      localStorage.setItem("entered","1");
      homeScreen.classList.add("hidden");
      appScreen.classList.remove("hidden");
      setActiveView("nearby");
      showAdBanner();
    }, 1500);
  });
    
  // Sponsor click (Home + App)
  function openSponsor(){ window.open(t("sponsorUrl"), "_blank", "noopener"); }
  sponsorLink?.addEventListener("click",(e)=>{ e.preventDefault(); openSponsor(); });
  sponsorLinkApp?.addEventListener("click",(e)=>{ e.preventDefault(); openSponsor(); });

  // Etico canili (solo Home)
  ethicsButton?.addEventListener("click", ()=> openSheltersMaps() );

  // 💎 PLUTOO PLUS
  btnPlus?.addEventListener("click", ()=> openPlusModal() );
  closePlus?.addEventListener("click", ()=> closePlusModal() );
  cancelPlus?.addEventListener("click", ()=> closePlusModal() );
  activatePlus?.addEventListener("click", ()=> {
    state.plus = true;
    localStorage.setItem("plutoo_plus", "yes");
    closePlusModal();
    updatePlusUI();
    alert(state.lang==="it" ? "Plutoo Plus attivato! 💎" : "Plutoo Plus activated! 💎");
  });

  function openPlusModal(){
    plusModal?.classList.remove("hidden");
  }
  function closePlusModal(){
    plusModal?.classList.add("hidden");
  }
  function updatePlusUI(){
    // Abilita/disabilita filtri Gold
    const goldInputs = [onlyVerified, ageMin, ageMax, weightInput, heightInput, pedigreeFilter, breedingFilter, sizeFilter];
    goldInputs.forEach(inp => {
      if (inp) inp.disabled = !state.plus;
    });
    // Nasconde banner se Plus
    if (state.plus && adBanner) {
      adBanner.style.display = "none";
    } else if (adBanner) {
      adBanner.style.display = "";
    }
  }

  // Gestione clic su campi Gold bloccati
  function handleGoldFieldClick(e){
    if (!state.plus && e.target.closest(".f-gold")){
      const input = e.target.closest(".f-gold").querySelector("input, select");
      if (input && input.disabled){
        openPlusModal();
      }
    }
  }
  searchPanel?.addEventListener("click", handleGoldFieldClick);

  // Tabs & Views
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

  function setActiveView(name){
    [viewNearby, viewLove, viewPlay].forEach(v=>v?.classList.remove("active"));
    [tabNearby, tabLove, tabPlay].forEach(t=>t?.classList.remove("active"));

    if (name==="nearby"){ viewNearby.classList.add("active"); tabNearby.classList.add("active"); renderNearby(); btnSearchPanel.disabled=false; }
    if (name==="love"){   viewLove.classList.add("active");   tabLove.classList.add("active");   renderSwipe("love"); btnSearchPanel.disabled=true; }
    if (name==="play"){   viewPlay.classList.add("active");   tabPlay.classList.add("active");   renderSwipe("play"); btnSearchPanel.disabled=true; }

    window.scrollTo({top:0,behavior:"smooth"});
  }

  // Back
  btnBack?.addEventListener("click", ()=>{
    if (!viewNearby.classList.contains("active")) { setActiveView("nearby"); return; }
    if (confirm(state.lang==="it" ? "Tornare alla Home?" : "Return to Home?")){
      localStorage.removeItem("entered");
      state.entered=false;
      appScreen.classList.add("hidden");
      homeScreen.classList.remove("hidden");
    }
  });
   // Nearby (grid 2×4 = 8 profili)
  function renderNearby(){
    const list = filteredDogs();
    if (!list.length){ nearGrid.innerHTML = `<p class="soft" style="padding:.5rem">${t("noProfiles")}</p>`; return; }
    nearGrid.innerHTML = list.map(cardHTML).join("");
    qa(".dog-card").forEach(card=>{
      const id = card.getAttribute("data-id");
      const d  = DOGS.find(x=>x.id===id);
      card.addEventListener("click", ()=>{
        // Flash viola (0.5s) poi apri profilo
        card.classList.add("flash-violet");
        setTimeout(()=>{
          card.classList.remove("flash-violet");
          openProfilePage(d);
        }, 500);
      });
    });
  }
  function cardHTML(d){
    return `
      <article class="card dog-card" data-id="${d.id}">
        <img src="${d.img}" alt="${d.name}" class="card-img" />
        <div class="card-info">
          <h3>${d.name} ${d.verified?"✅":""}</h3>
          <p class="meta">${d.breed} · ${d.age} ${t("years")} · ${fmtKm(d.km)}</p>
          <p class="bio">${d.bio||""}</p>
        </div>
      </article>`;
  }
  const fmtKm = n => `${n.toFixed(1)} km`;

  function filteredDogs(){
    const f = state.filters;
    return DOGS
      .filter(d => d.km <= (f.distKm||999))
      .filter(d => (!f.verified || !state.plus) ? true : d.verified)
      .filter(d => (!f.sex) ? true : d.sex===f.sex)
      .filter(d => (!f.breed) ? true : d.breed.toLowerCase().startsWith(f.breed.toLowerCase()))
      .filter(d => {
        if (!state.plus || !f.ageMin) return true;
        return d.age >= parseInt(f.ageMin);
      })
      .filter(d => {
        if (!state.plus || !f.ageMax) return true;
        return d.age <= parseInt(f.ageMax);
      })
      .filter(d => {
        if (!state.plus || !f.weight) return true;
        return d.weight >= parseInt(f.weight);
      })
      .filter(d => {
        if (!state.plus || !f.height) return true;
        return d.height >= parseInt(f.height);
      })
      .filter(d => {
        if (!state.plus || !f.pedigree) return true;
        return f.pedigree==="yes" ? d.pedigree : !d.pedigree;
      })
      .filter(d => {
        if (!state.plus || !f.breeding) return true;
        return f.breeding==="yes" ? d.breeding : !d.breeding;
      })
      .filter(d => {
        if (!state.plus || !f.size) return true;
        return d.size === f.size;
      });
  }

  // Swipe Decks (Amore/Giochiamo)
  function renderSwipe(mode){
    const deck = DOGS.filter(d=>d.mode===mode);
    const idx = (mode==="love"?state.currentLoveIdx:state.currentPlayIdx) % (deck.length||1);
    const d = deck[idx] || DOGS[0];

    const img   = mode==="love" ? loveImg : playImg;
    const title = mode==="love" ? loveTitleTxt : playTitleTxt;
    const meta  = mode==="love" ? loveMeta : playMeta;
    const bio   = mode==="love" ? loveBio : playBio;
    const card  = mode==="love" ? loveCard : playCard;
    const yesBtn = mode==="love" ? loveYes : playYes;
    const noBtn  = mode==="love" ? loveNo  : playNo;

    img.src = d.img;
    title.textContent = `${d.name} ${d.verified?"✅":""}`;
    meta.textContent  = `${d.breed} · ${d.age} ${t("years")} · ${fmtKm(d.km)}`;
    bio.textContent   = d.bio || "";
    img.onclick = ()=>{
      // Flash viola poi apri profilo
      card.classList.add("flash-violet");
      setTimeout(()=>{
        card.classList.remove("flash-violet");
        openProfilePage(d);
      }, 500);
    };

    attachSwipe(card, dir=>{
      checkSwipeReward();
      if (mode==="love") state.currentLoveIdx++; else state.currentPlayIdx++;
      setTimeout(()=>renderSwipe(mode), 10);
    });

    yesBtn.onclick = ()=>simulateSwipe(card,"right");
    noBtn.onclick  = ()=>simulateSwipe(card,"left");
  }

  function attachSwipe(card, cb){
    if (card._sw) return;
    card._sw = true;
    let sx=0, dx=0, dragging=false;
    const start=(x)=>{ sx=x; dragging=true; card.style.transition="none"; };
    const move =(x)=>{ if(!dragging) return; dx=x-sx; const rot=dx/18; card.style.transform=`translate3d(${dx}px,0,0) rotate(${rot}deg)`; };
    const end =()=>{ if(!dragging) return; dragging=false; card.style.transition=""; const th=90;
      if (dx>th){ card.classList.add("swipe-out-right"); setTimeout(()=>{ resetCard(card); cb("right"); }, 550); }
      else if (dx<-th){ card.classList.add("swipe-out-left"); setTimeout(()=>{ resetCard(card); cb("left"); }, 550); }
      else { resetCard(card); }
      dx=0;
    };
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

  // Reward Ads Mock (ogni 10 swipe e +5)
  function checkSwipeReward(){
    if (state.plus) return;
    state.swipeCount++;
    localStorage.setItem("swipes", String(state.swipeCount));
    if (state.swipeCount===10 || (state.swipeCount>10 && (state.swipeCount-10)%5===0)){
      showRewardVideoMock("swipe");
    }
  }

  // Ricerca panel
  btnSearchPanel?.addEventListener("click", ()=>searchPanel.classList.remove("hidden"));
  closeSearch?.addEventListener("click", ()=>searchPanel.classList.add("hidden"));
  distRange?.addEventListener("input", ()=> distLabel.textContent = `${distRange.value} km`);

  breedInput?.addEventListener("input", ()=>{
    const v = (breedInput.value||"").trim().toLowerCase();
    breedsList.innerHTML=""; breedsList.style.display="none";
    if (!v) return;
    const matches = state.breeds.filter(b=>b.toLowerCase().startsWith(v)).slice(0,16);
    if (!matches.length) return;
    breedsList.innerHTML = matches.map(b=>`<div class="item">${b}</div>`).join("");
    breedsList.style.display = "block";
    qa(".item",breedsList).forEach(it=>it.addEventListener("click",()=>{
      breedInput.value = it.textContent; breedsList.style.display="none";
    }));
  });
  document.addEventListener("click",(e)=>{
    if (e.target!==breedInput && !breedsList.contains(e.target)) breedsList.style.display="none";
  });

  onlyVerified?.addEventListener("change", ()=> state.filters.verified = !!onlyVerified.checked);
  sexFilter?.addEventListener("change", ()=> state.filters.sex = sexFilter.value || "");

  applyFilters?.addEventListener("click",(e)=>{
    e.preventDefault();
    state.filters.breed = (breedInput.value||"").trim();
    state.filters.distKm = parseInt(distRange.value||"5");
    state.filters.sex = sexFilter.value || "";
    state.filters.verified = !!onlyVerified.checked;
    if (state.plus){
      state.filters.ageMin = (ageMin.value||"").trim();
      state.filters.ageMax = (ageMax.value||"").trim();
      state.filters.weight = (weightInput.value||"").trim();
      state.filters.height = (heightInput.value||"").trim();
      state.filters.pedigree = pedigreeFilter.value || "";
      state.filters.breeding = breedingFilter.value || "";
      state.filters.size = sizeFilter.value || "";
    }
    persistFilters();
    renderNearby();
    searchPanel.classList.add("hidden");
  });

  resetFilters?.addEventListener("click",()=>{
    breedInput.value=""; distRange.value=5; distLabel.textContent="5 km";
    onlyVerified.checked=false; sexFilter.value="";
    if (state.plus){
      ageMin.value=""; ageMax.value="";
      weightInput.value=""; heightInput.value="";
      pedigreeFilter.value=""; breedingFilter.value=""; sizeFilter.value="";
    }
    Object.assign(state.filters,{
      breed:"",distKm:5,verified:false,sex:"",
      ageMin:"",ageMax:"",weight:"",height:"",
      pedigree:"",breeding:"",size:""
    });
    persistFilters(); renderNearby();
  });

  function persistFilters(){
    localStorage.setItem("f_breed", state.filters.breed);
    localStorage.setItem("f_distKm", String(state.filters.distKm));
    localStorage.setItem("f_verified", state.filters.verified?"1":"0");
    localStorage.setItem("f_sex", state.filters.sex);
    localStorage.setItem("f_ageMin", state.filters.ageMin||"");
    localStorage.setItem("f_ageMax", state.filters.ageMax||"");
    localStorage.setItem("f_weight", state.filters.weight||"");
    localStorage.setItem("f_height", state.filters.height||"");
    localStorage.setItem("f_pedigree", state.filters.pedigree||"");
    localStorage.setItem("f_breeding", state.filters.breeding||"");
    localStorage.setItem("f_size", state.filters.size||"");
  }

  // Profilo (PAGINA DEDICATA, non sheet) + lightbox galleria
  window.openProfilePage = (d)=>{
    // Apre come pagina dedicata (sheet full)
    profileSheet.classList.remove("hidden");
    setTimeout(()=>profileSheet.classList.add("show"), 10);

    const selfieUnlocked = isSelfieUnlocked(d.id);
    ppBody.innerHTML = `
      <div class="pp-hero"><img src="${d.img}" alt="${d.name}"></div>
      <div class="pp-head">
        <h2 class="pp-name">${d.name} ${d.verified?"✅":""}</h2>
        <div class="pp-badges">
          <span class="badge">${d.breed}</span>
          <span class="badge">${d.age} ${t("years")}</span>
          <span class="badge">${fmtKm(d.km)}</span>
        </div>
      </div>
      <div class="pp-meta soft">${d.bio||""}</div>

      <h3 class="section-title">Galleria</h3>
      <div class="gallery">
        <div class="ph"><img src="${d.img}" alt=""></div>
        <div class="ph"><img src="dog2.jpg" alt=""></div>
        <div class="ph"><img src="dog3.jpg" alt=""></div>
        <div class="ph"><button class="add-photo">+ ${state.lang==="it"?"Aggiungi":"Add"}</button></div>
      </div>

      <h3 class="section-title">Selfie</h3>
      <div class="selfie ${selfieUnlocked?'unlocked':''}">
        <img class="img" src="${d.img}" alt="Selfie">
        <div class="over">
          <button id="unlockSelfie" class="btn accent small">${selfieUnlocked?(state.lang==="it"?"Sbloccato 24h":"Unlocked 24h"):(state.lang==="it"?"Sblocca selfie":"Unlock selfie")}</button>
          <button id="uploadSelfie" class="btn accent small">${state.lang==="it"?"Carica selfie":"Upload selfie"}</button>
        </div>
      </div>

      <h3 class="section-title">${state.lang==="it"?"Documenti":"Documents"}</h3>
      <div class="pp-actions">
        <button id="btnDocsOwner" class="btn outline">${state.lang==="it"?"Documenti proprietario":"Owner docs"}</button>
        <button id="btnDocsDog"   class="btn outline">${state.lang==="it"?"Documenti dog":"Dog docs"}</button>
        <button id="btnOpenChat"  class="btn accent">${state.lang==="it"?"Apri chat":"Open chat"}</button>
      </div>
    `;

    // Lightbox sulle foto
    qa(".gallery img", ppBody).forEach(img=>{
      img.addEventListener("click", ()=>{
        const lb = document.createElement("div");
        lb.className = "lightbox";
        lb.innerHTML = `<button class="close" aria-label="Chiudi">✕</button><img src="${img.src}" alt="">`;
        document.body.appendChild(lb);
        qs(".close", lb).onclick = ()=> lb.remove();
        lb.addEventListener("click", (e)=>{ if(e.target===lb) lb.remove(); });
      });
    });

    $("btnDocsOwner").onclick = ()=>{
      alert(state.lang==="it" ? "Upload documenti proprietario (mock)" : "Upload owner docs (mock)");
      d.verified=true;
      renderNearby();
    };
    $("btnDocsDog").onclick = ()=>{
      alert(state.lang==="it" ? "Upload documenti dog (mock)" : "Upload dog docs (mock)");
      d.verified=true;
      renderNearby();
    };
    $("btnOpenChat").onclick = ()=>{
      closeProfilePage();
      setTimeout(()=>openChat(d), 180);
    };

    $("uploadSelfie").onclick = ()=> alert(state.lang==="it" ? "Upload selfie (mock)" : "Upload selfie (mock)");
    $("unlockSelfie").onclick = ()=>{
      if (!isSelfieUnlocked(d.id)){
        if (!state.plus){
          showRewardVideoMock("selfie");
        }
        // Sblocca 24h
        state.selfieUntilByDog[d.id] = Date.now() + 24*60*60*1000;
        localStorage.setItem("selfieUntilByDog", JSON.stringify(state.selfieUntilByDog));
        openProfilePage(d);
      }
    };
  };

  window.closeProfilePage = ()=>{
    profileSheet.classList.remove("show");
    setTimeout(()=>profileSheet.classList.add("hidden"), 250);
  };

  function isSelfieUnlocked(id){ return Date.now() < (state.selfieUntilByDog[id]||0); }

  // Chat
  function openChat(dog){
    // Primo messaggio → reward video mock se non Plus
    if (!state.plus && !state.firstMsgRewardByDog[dog.id]){
      showRewardVideoMock("chat");
      state.firstMsgRewardByDog[dog.id] = true;
      localStorage.setItem("firstMsgRewardByDog", JSON.stringify(state.firstMsgRewardByDog));
    }

    chatPane.classList.remove("hidden");
    setTimeout(()=>chatPane.classList.add("show"), 10);
    chatPane.dataset.dogId = dog.id;
    chatList.innerHTML = `<div class="msg">${state.lang==="it"?"Ciao":"Hi"} ${dog.name}! 🐾</div>`;
    chatInput.value="";
  }
  function closeChatPane(){
    chatPane.classList.remove("show");
    setTimeout(()=>chatPane.classList.add("hidden"), 250);
  }
  closeChat?.addEventListener("click", closeChatPane);

  chatComposer?.addEventListener("submit", (e)=>{
    e.preventDefault();
    const text = chatInput.value.trim();
    if (!text) return;
    const bubble = document.createElement("div");
    bubble.className="msg me";
    bubble.textContent=text;
    chatList.appendChild(bubble);
    chatInput.value="";
    chatList.scrollTop = chatList.scrollHeight;
  });

  // Maps helpers (Luoghi PET esteso)
  function openMapsCategory(cat){
    // Reward video mock per servizi se non Plus
    if (!state.plus && ["vets","groomers","shops"].includes(cat)){
      showRewardVideoMock("services");
    }

    const map = {
      vets: state.lang==="it" ? "cliniche veterinarie vicino a me" : "veterinary clinics near me",
      groomers: state.lang==="it" ? "toelettature vicino a me" : "pet groomers near me",
      shops: state.lang==="it" ? "negozi per animali vicino a me" : "pet shops near me",
      trainers: state.lang==="it" ? "addestratori cani vicino a me" : "dog trainers near me",
      kennels: state.lang==="it" ? "pensioni per dogs vicino a me" : "dog kennels near me",
      parks: state.lang==="it" ? "parchi vicino a me" : "parks near me"
    };
    const q = map[cat] || (state.lang==="it" ? "servizi animali vicino a me" : "pet services near me");
    openMapsQuery(q);
  }

  function openSheltersMaps(){
    openMapsQuery(t("mapsShelters"));
  }

  function openMapsQuery(q){
    if (state.geo){
      const url = `geo:${state.geo.lat},${state.geo.lon}?q=${encodeURIComponent(q)}`;
      window.open(url,"_blank","noopener");
    } else {
      window.open(`https://www.google.com/maps/search/${encodeURIComponent(q)}`,"_blank","noopener");
    }
  }

  // ADS MOCK TEST
  function showAdBanner(){
    if (!adBanner || state.plus) return;
    adBanner.textContent = "Banner Test AdMob • Bannerhome";
    adBanner.style.display = "";
  }

  function showRewardVideoMock(type){
    const msg = {
      it: {
        swipe: "🎬 Reward Video Mock\n(ogni 10 swipe e +5)\n\nTipo: Swipe Unlock",
        selfie: "🎬 Reward Video Mock\n(prima di vedere selfie)\n\nTipo: Selfie Unlock",
        chat: "🎬 Reward Video Mock\n(primo messaggio in chat)\n\nTipo: Chat Unlock",
        services: "🎬 Reward Video Mock\n(veterinari/toelettature/negozi)\n\nTipo: Services"
      },
      en: {
        swipe: "🎬 Reward Video Mock\n(every 10 swipes and +5)\n\nType: Swipe Unlock",
        selfie: "🎬 Reward Video Mock\n(before viewing selfie)\n\nType: Selfie Unlock",
        chat: "🎬 Reward Video Mock\n(first message in chat)\n\nType: Chat Unlock",
        services: "🎬 Reward Video Mock\n(vets/groomers/shops)\n\nType: Services"
      }
    };
    const text = msg[state.lang][type] || msg.it[type];
    alert(text);
  }

  function showInterstitialMock(){
    alert(state.lang==="it" ? "🎬 Interstitial Mock\n(Videomatch dopo match)" : "🎬 Interstitial Mock\n(Videomatch after match)");
  }

  // Ricerca UI preset + primo rendering
  function init(){
    applyTranslations();
    updatePlusUI();

    breedInput.value = state.filters.breed;
    distRange.value  = state.filters.distKm;
    distLabel.textContent = `${distRange.value} km`;
    onlyVerified.checked = !!state.filters.verified;
    sexFilter.value  = state.filters.sex;

    if (state.plus){
      if (ageMin) ageMin.value = state.filters.ageMin;
      if (ageMax) ageMax.value = state.filters.ageMax;
      if (weightInput) weightInput.value = state.filters.weight;
      if (heightInput) heightInput.value = state.filters.height;
      if (pedigreeFilter) pedigreeFilter.value = state.filters.pedigree;
      if (breedingFilter) breedingFilter.value = state.filters.breeding;
      if (sizeFilter) sizeFilter.value = state.filters.size;
    }

    if (state.entered){
      setActiveView("nearby");
    }
  }

  init();
});
