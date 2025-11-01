/* =========================================================
   PLUTOO – app.js FINALE
   ✅ FIX #1: Reward swipe corretto (10, poi +5, no duplicati)
   ✅ FIX #3: Piano mensile + annuale (UI completa)
   ✅ FIX #4: Match con logo Plutoo animato
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
  const btnBack      = $("btnBack");
  const btnPlus      = $("btnPlus");

  const mainTopbar = $("mainTopbar");
  const btnBackLove = $("btnBackLove");
  const btnBackPlay = $("btnBackPlay");

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
  const planMonthly = $("planMonthly");
  const planYearly = $("planYearly");

  const chatPane   = $("chatPane");
  const closeChat  = $("closeChat");
  const chatList   = $("chatList");
  const chatComposer = $("chatComposer");
  const chatInput  = $("chatInput");

  const profileSheet = $("profileSheet");
  const closeProfile = $("closeProfile");
  const ppBody   = $("ppBody");

  const adBanner = $("adBanner");
  const matchOverlay = $("matchOverlay");

  // FIX #1: Stato globale per reward swipe con soglie precise
  const state = {
    lang: (localStorage.getItem("lang") || autodetectLang()),
    plus: localStorage.getItem("plutoo_plus")==="yes",
    plusPlan: localStorage.getItem("plusPlan") || "monthly",
    entered: localStorage.getItem("entered")==="1",
    swipeCount: parseInt(localStorage.getItem("swipes")||"0"),
    nextRewardAt: parseInt(localStorage.getItem("nextRewardAt")||"10"),
    rewardOpen: false,
    matches: JSON.parse(localStorage.getItem("matches")||"{}"),
    chatMessagesSent: JSON.parse(localStorage.getItem("chatMessagesSent")||"{}"),
    firstMsgRewardByDog: JSON.parse(localStorage.getItem("firstMsgRewardByDog")||"{}"),
    selfieUntilByDog: JSON.parse(localStorage.getItem("selfieUntilByDog")||"{}"),
    ownerDocsUploaded: JSON.parse(localStorage.getItem("ownerDocsUploaded")||"{}"),
    dogDocsUploaded: JSON.parse(localStorage.getItem("dogDocsUploaded")||"{}"),
    currentLoveIdx: 0,
    currentPlayIdx: 0,
    currentView: "nearby",
    viewHistory: [],
    currentDogProfile: null,
    filters: {
      breed: localStorage.getItem("f_breed") || "",
      distKm: parseInt(localStorage.getItem("f_distKm")||"50"),
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

  // I18N
  const I18N = {
    it: {
      brand: "Plutoo",
      login: "Login",
      register: "Registrati",
      enter: "Entra",
      sponsorTitle: "Sponsor ufficiale",
      sponsorCopy: "Fido, il gelato per i nostri amici a quattro zampe",
      sponsorUrl: "https://www.fido.it/",
      ethicsLine1: "Non abbandonare mai i tuoi amici",
      ethicsLine2: "(canili nelle vicinanze)",
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
      planMonthly: "Mensile",
      planYearly: "Annuale",
      planSave: "Risparmia €20!",
      plusPeriod: "/mese",
      activatePlus: "Attiva Plutoo Plus",
      cancel: "Annulla",
      mapsShelters: "canili nelle vicinanze",
      noProfiles: "Nessun profilo. Modifica i filtri.",
      years: "anni",
      playTogether: "Giochiamo insieme"
    },
    en: {
      brand: "Plutoo",
      login: "Login",
      register: "Sign up",
      enter: "Enter",
      sponsorTitle: "Official Sponsor",
      sponsorCopy: "Fido, ice cream for our four-legged friends",
      sponsorUrl: "https://www.fido.it/",
      ethicsLine1: "Never abandon your friends",
      ethicsLine2: "(animal shelters nearby)",
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
      planMonthly: "Monthly",
      planYearly: "Yearly",
      planSave: "Save €20!",
      plusPeriod: "/month",
      activatePlus: "Activate Plutoo Plus",
      cancel: "Cancel",
      mapsShelters: "animal shelters nearby",
      noProfiles: "No profiles. Adjust filters.",
      years: "yrs",
      playTogether: "Play together"
    }
  };
  const t = (k) => (I18N[state.lang] && I18N[state.lang][k]) || k;
  function autodetectLang(){ return (navigator.language||"it").toLowerCase().startsWith("en")?"en":"it"; }

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

  // 8 PROFILI DOG
  const DOGS = [
    { id:"d1", name:"Luna",   age:2, breed:"Golden Retriever", km:1.2, img:"dog1.jpg", bio:"Dolcissima e curiosa.", mode:"love", sex:"F", verified:true, weight:28, height:55, pedigree:true, breeding:false, size:"medium" },
    { id:"d2", name:"Rex",    age:4, breed:"Pastore Tedesco",  km:3.4, img:"dog2.jpg", bio:"Fedele e giocherellone.", mode:"play", sex:"M", verified:true, weight:35, height:62, pedigree:true, breeding:true, size:"large" },
    { id:"d3", name:"Maya",   age:3, breed:"Bulldog Francese", km:2.1, img:"dog3.jpg", bio:"Coccole e passeggiate.", mode:"love", sex:"F", verified:false, weight:12, height:30, pedigree:false, breeding:false, size:"small" },
    { id:"d4", name:"Rocky",  age:5, breed:"Beagle",           km:4.0, img:"dog4.jpg", bio:"Sempre in movimento.", mode:"play", sex:"M", verified:true, weight:15, height:38, pedigree:true, breeding:false, size:"medium" },
    { id:"d5", name:"Chicco", age:1, breed:"Barboncino",       km:0.8, img:"dog5.jpg", bio:"Piccolo fulmine.", mode:"love", sex:"M", verified:true, weight:8, height:28, pedigree:false, breeding:false, size:"small" },
    { id:"d6", name:"Kira",   age:6, breed:"Labrador",         km:5.1, img:"dog6.jpg", bio:"Acqua e palla.", mode:"play", sex:"F", verified:true, weight:30, height:58, pedigree:true, breeding:true, size:"large" },
    { id:"d7", name:"Toby",   age:2, breed:"Husky",            km:2.8, img:"dog7.jpg", bio:"Energia pura.", mode:"love", sex:"M", verified:true, weight:25, height:54, pedigree:true, breeding:true, size:"medium" },
    { id:"d8", name:"Bella",  age:4, breed:"Cocker Spaniel",   km:1.5, img:"dog8.jpg", bio:"Dolce compagna.", mode:"play", sex:"F", verified:false, weight:14, height:40, pedigree:false, breeding:false, size:"medium" }
  ];

  // Razze
  fetch("breeds.json").then(r=>r.json()).then(arr=>{
    if (Array.isArray(arr)) state.breeds = arr.sort();
  }).catch(()=>{ state.breeds = [
    "Barboncino","Bassotto","Beagle","Border Collie","Bulldog Francese",
    "Carlino","Chihuahua","Cocker Spaniel","Golden Retriever","Husky",
    "Jack Russell","Labrador","Maltese","Pastore Tedesco","Shih Tzu"
  ].sort(); });

  // Geo
  if (navigator.geolocation){
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
    }, 2500);
  });
    
  // Sponsor UFFICIALE Fido
  function openSponsor(){ window.open("https://www.fido.it/", "_blank", "noopener"); }
  sponsorLink?.addEventListener("click",(e)=>{ e.preventDefault(); openSponsor(); });
  sponsorLinkApp?.addEventListener("click",(e)=>{ e.preventDefault(); openSponsor(); });

  ethicsButton?.addEventListener("click", ()=> openSheltersMaps() );

  // FIX #3: PLUTOO PLUS con selettore piano mensile/annuale
  btnPlus?.addEventListener("click", ()=> openPlusModal() );
  closePlus?.addEventListener("click", ()=> closePlusModal() );
  cancelPlus?.addEventListener("click", ()=> closePlusModal() );

  planMonthly?.addEventListener("click", ()=>{
    state.plusPlan = "monthly";
    updatePlanSelector();
  });

  planYearly?.addEventListener("click", ()=>{
    state.plusPlan = "yearly";
    updatePlanSelector();
  });

  function updatePlanSelector(){
    if(planMonthly && planYearly){
      planMonthly.classList.toggle("active", state.plusPlan === "monthly");
      planYearly.classList.toggle("active", state.plusPlan === "yearly");
    }
  }

  activatePlus?.addEventListener("click", ()=> {
    state.plus = true;
    localStorage.setItem("plutoo_plus", "yes");
    localStorage.setItem("plusPlan", state.plusPlan);
    closePlusModal();
    updatePlusUI();
    const price = state.plusPlan === "yearly" ? "€40/anno" : "€4.99/mese";
    alert(state.lang==="it" ? `Plutoo Plus attivato! 💎\nPiano: ${price}` : `Plutoo Plus activated! 💎\nPlan: ${price}`);
  });

  function openPlusModal(){
    plusModal?.classList.remove("hidden");
    updatePlanSelector();
  }
  function closePlusModal(){
    plusModal?.classList.add("hidden");
  }
  function updatePlusUI(){
    const goldInputs = [onlyVerified, ageMin, ageMax, weightInput, heightInput, pedigreeFilter, breedingFilter, sizeFilter];
    goldInputs.forEach(inp => {
      if (inp) inp.disabled = !state.plus;
    });
    if (state.plus && adBanner) {
      adBanner.style.display = "none";
    } else if (adBanner) {
      adBanner.style.display = "";
    }
  }

  function handleGoldFieldClick(e){
    if (!state.plus && e.target.closest(".f-gold")){
      const input = e.target.closest(".f-gold").querySelector("input, select");
      if (input && input.disabled){
        openPlusModal();
      }
    }
  }
  searchPanel?.addEventListener("click", handleGoldFieldClick);

  // Tabs
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
    if (state.currentView !== name && state.currentView !== "profile"){
      state.viewHistory.push(state.currentView);
    }
    state.currentView = name;

    [viewNearby, viewLove, viewPlay].forEach(v=>v?.classList.remove("active"));
    [tabNearby, tabLove, tabPlay].forEach(t=>t?.classList.remove("active"));

    if (name === "profile"){
      mainTopbar?.classList.add("hidden");
    } else {
      mainTopbar?.classList.remove("hidden");
    }

    if (name==="nearby"){ 
      viewNearby.classList.add("active"); 
      tabNearby.classList.add("active"); 
      renderNearby(); 
      if(btnSearchPanel) btnSearchPanel.disabled=false; 
    }
    if (name==="love"){   
      viewLove.classList.add("active");   
      tabLove.classList.add("active");   
      renderSwipe("love"); 
      if(btnSearchPanel) btnSearchPanel.disabled=true; 
    }
    if (name==="play"){   
      viewPlay.classList.add("active");   
      tabPlay.classList.add("active");   
      renderSwipe("play"); 
      if(btnSearchPanel) btnSearchPanel.disabled=true; 
    }

    window.scrollTo({top:0,behavior:"smooth"});
  }

  btnBack?.addEventListener("click", ()=> goBack() );
  btnBackLove?.addEventListener("click", ()=> goBack() );
  btnBackPlay?.addEventListener("click", ()=> goBack() );

  function goBack(){
    if (state.currentView === "profile"){
      closeProfilePage();
      return;
    }

    if (state.currentView === "love" || state.currentView === "play"){
      setActiveView("nearby");
      return;
    }

    if (state.currentView === "nearby"){
      if (confirm(state.lang==="it" ? "Tornare alla Home?" : "Return to Home?")){
        localStorage.removeItem("entered");
        state.entered=false;
        appScreen.classList.add("hidden");
        homeScreen.classList.remove("hidden");
      }
    }
  }

  window.addEventListener("popstate", (e)=>{
    e.preventDefault();
    goBack();
  });

  if (state.entered){
    history.pushState({view: "app"}, "", "");
  }

  // Vicino a te
  function renderNearby(){
    if(!nearGrid) return;
    
    const list = filteredDogs();
    if (!list.length){ 
      nearGrid.innerHTML = `<p class="soft" style="padding:.5rem">${t("noProfiles")}</p>`; 
      return; 
    }
    nearGrid.innerHTML = list.map(cardHTML).join("");
    
    setTimeout(()=>{
      qa(".dog-card").forEach(card=>{
        const id = card.getAttribute("data-id");
        const d  = DOGS.find(x=>x.id===id);
        if(!d) return;
        
        card.addEventListener("click", ()=>{
          card.classList.add("flash-violet");
          setTimeout(()=>{
            card.classList.remove("flash-violet");
            openProfilePage(d);
          }, 500);
        });
      });
    }, 10);
  }
  
  function cardHTML(d){
    return `
      <article class="card dog-card" data-id="${d.id}">
        <img src="${d.img}" alt="${d.name}" class="card-img" loading="lazy" />
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

  // FIX #1: Swipe Decks con reward corretto (10, poi +5, no duplicati)
  function renderSwipe(mode){
    const deck = DOGS.filter(d=>d.mode===mode);
    if(!deck.length) return;
    
    const idx = (mode==="love"?state.currentLoveIdx:state.currentPlayIdx) % deck.length;
    const d = deck[idx];
    if(!d) return;

    const img   = mode==="love" ? loveImg : playImg;
    const title = mode==="love" ? loveTitleTxt : playTitleTxt;
    const meta  = mode==="love" ? loveMeta : playMeta;
    const bio   = mode==="love" ? loveBio : playBio;
    const card  = mode==="love" ? loveCard : playCard;
    const yesBtn = mode==="love" ? loveYes : playYes;
    const noBtn  = mode==="love" ? loveNo  : playNo;

    if(!img || !title || !meta || !bio || !card) return;

    img.src = d.img;
    title.textContent = `${d.name} ${d.verified?"✅":""}`;
    meta.textContent  = `${d.breed} · ${d.age} ${t("years")} · ${fmtKm(d.km)}`;
    bio.textContent   = d.bio || "";
    
    img.onclick = null;
    img.onclick = ()=>{
      card.classList.add("flash-violet");
      setTimeout(()=>{
        card.classList.remove("flash-violet");
        openProfilePage(d);
      }, 500);
    };

    card._sw = false;
    attachSwipe(card, dir=>{
      if (dir==="right"){
        const matchChance = Math.random();
        if (matchChance > 0.5){
          state.matches[d.id] = true;
          localStorage.setItem("matches", JSON.stringify(state.matches));
          showMatchAnimation();
        }
      }
      
      // FIX #1: Reward DOPO swipe completo, con soglia precisa
      checkSwipeReward();
      
      if (mode==="love") state.currentLoveIdx++; else state.currentPlayIdx++;
      setTimeout(()=>renderSwipe(mode), 10);
    });

    if(yesBtn) yesBtn.onclick = ()=>simulateSwipe(card,"right");
    if(noBtn) noBtn.onclick  = ()=>simulateSwipe(card,"left");
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
    setTimeout(()=>{ resetCard(card); }, 550);
  }

  // FIX #4: Match animation con logo Plutoo (violet+gold pulse)
  function showMatchAnimation(){
    if (!matchOverlay) return;
    
    matchOverlay.classList.remove("hidden");
    
    // Auto-dismiss dopo 1.2s
    setTimeout(()=>{
      matchOverlay.classList.add("hidden");
    }, 1200);
  }

  // FIX #1: Logica reward swipe CORRETTA (10, poi +5, no duplicati)
  function checkSwipeReward(){
    if (state.plus) return;
    if (state.rewardOpen) return;
    
    state.swipeCount++;
    localStorage.setItem("swipes", String(state.swipeCount));
    
    // LOGICA: 10, poi ogni +5 (15, 20, 25, 30...)
    if (state.swipeCount === state.nextRewardAt){
      state.rewardOpen = true;
      showRewardVideoMock("swipe", ()=>{
        state.rewardOpen = false;
        state.nextRewardAt += 5;
        localStorage.setItem("nextRewardAt", String(state.nextRewardAt));
      });
    }
  }
⚙️ FILE 3: app.js (PARTE 2/2 - FINALE)
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
    state.filters.distKm = parseInt(distRange.value||"50");
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
    breedInput.value=""; distRange.value=50; distLabel.textContent="50 km";
    onlyVerified.checked=false; sexFilter.value="";
    if (state.plus){
      ageMin.value=""; ageMax.value="";
      weightInput.value=""; heightInput.value="";
      pedigreeFilter.value=""; breedingFilter.value=""; sizeFilter.value="";
    }
    Object.assign(state.filters,{
      breed:"",distKm:50,verified:false,sex:"",
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

  // Profilo DOG
  window.openProfilePage = (d)=>{
    state.currentDogProfile = d;
    setActiveView("profile");
    
    history.pushState({view: "profile", dogId: d.id}, "", "");
    
    profileSheet.classList.remove("hidden");
    profileSheet.classList.add("profile-page");
    setTimeout(()=>profileSheet.classList.add("show"), 10);

    const selfieUnlocked = isSelfieUnlocked(d.id);
    const hasMatch = state.matches[d.id] || false;
    const ownerDocs = state.ownerDocsUploaded[d.id] || {};
    const dogDocs = state.dogDocsUploaded[d.id] || {};
    
    ppBody.innerHTML = `
      <div class="pp-hero"><img src="${d.img}" alt="${d.name}"></div>
      <div class="pp-head">
        <h2 class="pp-name">${d.name} ${d.verified?"✅":""}</h2>
        <div class="pp-badges">
          <span class="badge">${d.breed}</span>
          <span class="badge">${d.age} ${t("years")}</span>
          <span class="badge">${fmtKm(d.km)}</span>
          <span class="badge">${d.sex==="M"?(state.lang==="it"?"Maschio":"Male"):(state.lang==="it"?"Femmina":"Female")}</span>
        </div>
      </div>
      <div class="pp-meta soft">${d.bio||""}</div>

      <h3 class="section-title">${state.lang==="it"?"Galleria":"Gallery"}</h3>
      <div class="gallery">
        <div class="ph"><img src="${d.img}" alt=""></div>
        <div class="ph"><img src="${d.img}" alt=""></div>
        <div class="ph"><img src="${d.img}" alt=""></div>
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
      
      <div class="pp-docs-section">
        <h4 class="section-title" style="margin-top:0;font-size:1rem">${state.lang==="it"?"Documenti Proprietario DOG":"DOG Owner Documents"}</h4>
        <p style="font-size:.88rem;color:var(--muted);margin:.3rem 0 .6rem">${state.lang==="it"?"Obbligatorio per ottenere il badge verificato ✅":"Required to get verified badge ✅"}</p>
        <div class="pp-docs-grid">
          <div class="doc-item" data-doc="owner-identity" data-type="owner">
            <div class="doc-icon">🪪</div>
            <div class="doc-label">${state.lang==="it"?"Carta d'identità":"Identity Card"}</div>
            <div class="doc-status ${ownerDocs.identity?'uploaded':'pending'}">${ownerDocs.identity?(state.lang==="it"?"✓ Caricato":"✓ Uploaded"):(state.lang==="it"?"Da caricare":"Upload")}</div>
          </div>
        </div>
      </div>

      <div class="pp-docs-section" style="margin-top:1.2rem">
        <h4 class="section-title" style="margin-top:0;font-size:1rem">${state.lang==="it"?"Documenti DOG":"DOG Documents"}</h4>
        <p style="font-size:.88rem;color:var(--muted);margin:.3rem 0 .6rem">${state.lang==="it"?"Facoltativi (vaccini, pedigree, microchip)":"Optional (vaccines, pedigree, microchip)"}</p>
        <div class="pp-docs-grid">
          <div class="doc-item" data-doc="dog-vaccines" data-type="dog">
            <div class="doc-icon">💉</div>
            <div class="doc-label">${state.lang==="it"?"Vaccini":"Vaccines"}</div>
            <div class="doc-status ${dogDocs.vaccines?'uploaded':'pending'}">${dogDocs.vaccines?(state.lang==="it"?"✓ Caricato":"✓ Uploaded"):(state.lang==="it"?"Da caricare":"Upload")}</div>
          </div>
          <div class="doc-item" data-doc="dog-pedigree" data-type="dog">
            <div class="doc-icon">📜</div>
            <div class="doc-label">${state.lang==="it"?"Pedigree":"Pedigree"}</div>
            <div class="doc-status ${dogDocs.pedigree?'uploaded':'pending'}">${dogDocs.pedigree?(state.lang==="it"?"✓ Caricato":"✓ Uploaded"):(state.lang==="it"?"Da caricare":"Upload")}</div>
          </div>
          <div class="doc-item" data-doc="dog-microchip" data-type="dog">
            <div class="doc-icon">🔬</div>
            <div class="doc-label">${state.lang==="it"?"Microchip":"Microchip"}</div>
            <div class="doc-status ${dogDocs.microchip?'uploaded':'pending'}">${dogDocs.microchip?(state.lang==="it"?"✓ Caricato":"✓ Uploaded"):(state.lang==="it"?"Da caricare":"Upload")}</div>
          </div>
        </div>
      </div>

      <div class="pp-actions">
        <button id="btnLikeDog" class="btn accent">💛 Like</button>
        <button id="btnDislikeDog" class="btn outline">🥲 ${state.lang==="it"?"Passa":"Pass"}</button>
        <button id="btnOpenChat" class="btn primary">${state.lang==="it"?"Apri chat":"Open chat"}</button>
        <button id="btnPlayTogether" class="btn accent">🐕 ${t("playTogether")}</button>
      </div>
    `;

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

    qa(".doc-item", ppBody).forEach(item=>{
      item.addEventListener("click", ()=>{
        const docType = item.getAttribute("data-doc");
        const docCategory = item.getAttribute("data-type");
        
        if (docCategory === "owner"){
          if (!state.ownerDocsUploaded[d.id]) state.ownerDocsUploaded[d.id] = {};
          state.ownerDocsUploaded[d.id].identity = true;
          localStorage.setItem("ownerDocsUploaded", JSON.stringify(state.ownerDocsUploaded));
          
          if (!d.verified){
            d.verified = true;
            alert(state.lang==="it" ? "Badge verificato ottenuto! ✅" : "Verified badge obtained! ✅");
          }
        } else if (docCategory === "dog"){
          if (!state.dogDocsUploaded[d.id]) state.dogDocsUploaded[d.id] = {};
          const docName = docType.replace("dog-", "");
          state.dogDocsUploaded[d.id][docName] = true;
          localStorage.setItem("dogDocsUploaded", JSON.stringify(state.dogDocsUploaded));
        }
        
        openProfilePage(d);
      });
    });

    $("btnLikeDog").onclick = ()=>{
      state.matches[d.id] = true;
      localStorage.setItem("matches", JSON.stringify(state.matches));
      showMatchAnimation();
      closeProfilePage();
    };
    
    $("btnDislikeDog").onclick = ()=>{
      closeProfilePage();
    };

    $("btnOpenChat").onclick = ()=>{
      closeProfilePage();
      setTimeout(()=>openChat(d), 180);
    };

    $("btnPlayTogether").onclick = ()=>{
      alert(state.lang==="it" ? "Richiesta di gioco inviata! 🐕" : "Play request sent! 🐕");
    };

    $("uploadSelfie").onclick = ()=> alert(state.lang==="it" ? "Upload selfie (mock)" : "Upload selfie (mock)");
    
    $("unlockSelfie").onclick = ()=>{
      if (!isSelfieUnlocked(d.id)){
        if (!state.plus){
          showRewardVideoMock("selfie", ()=>{
            state.selfieUntilByDog[d.id] = Date.now() + 24*60*60*1000;
            localStorage.setItem("selfieUntilByDog", JSON.stringify(state.selfieUntilByDog));
            openProfilePage(d);
          });
        } else {
          state.selfieUntilByDog[d.id] = Date.now() + 24*60*60*1000;
          localStorage.setItem("selfieUntilByDog", JSON.stringify(state.selfieUntilByDog));
          openProfilePage(d);
        }
      }
    };
  };

  closeProfile?.addEventListener("click", ()=> closeProfilePage());

  window.closeProfilePage = ()=>{
    profileSheet.classList.remove("show");
    setTimeout(()=>{
      profileSheet.classList.add("hidden");
      profileSheet.classList.remove("profile-page");
      const previousView = state.viewHistory.pop() || "nearby";
      setActiveView(previousView);
      state.currentDogProfile = null;
    }, 250);
  };

  function isSelfieUnlocked(id){ return Date.now() < (state.selfieUntilByDog[id]||0); }

  function openChat(dog){
    const hasMatch = state.matches[dog.id] || false;
    const msgCount = state.chatMessagesSent[dog.id] || 0;

    chatPane.classList.remove("hidden");
    setTimeout(()=>chatPane.classList.add("show"), 10);
    chatPane.dataset.dogId = dog.id;
    chatList.innerHTML = `<div class="msg">${state.lang==="it"?"Ciao":"Hi"} ${dog.name}! 🐾</div>`;
    chatInput.value="";
    
    if (!state.plus){
      if (!hasMatch && msgCount >= 1){
        chatInput.disabled = true;
        chatInput.placeholder = state.lang==="it" ? "Match necessario per continuare" : "Match needed to continue";
      } else {
        chatInput.disabled = false;
        chatInput.placeholder = state.lang==="it" ? "Scrivi un messaggio…" : "Type a message…";
      }
    }
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
    
    const dogId = chatPane.dataset.dogId || "unknown";
    const hasMatch = state.matches[dogId] || false;
    const msgCount = state.chatMessagesSent[dogId] || 0;

    if (!state.plus){
      if (msgCount === 0){
        if (state.rewardOpen) return;
        state.rewardOpen = true;
        showRewardVideoMock("chat", ()=>{
          state.rewardOpen = false;
          sendChatMessage(text, dogId, hasMatch, msgCount);
        });
        return;
      } else if (!hasMatch && msgCount >= 1){
        alert(state.lang==="it" ? "Serve un match per continuare a chattare!" : "Match needed to continue chatting!");
        return;
      }
    }
    
    sendChatMessage(text, dogId, hasMatch, msgCount);
  });

  function sendChatMessage(text, dogId, hasMatch, msgCount){
    const bubble = document.createElement("div");
    bubble.className="msg me";
    bubble.textContent=text;
    chatList.appendChild(bubble);
    chatInput.value="";
    chatList.scrollTop = chatList.scrollHeight;

    state.chatMessagesSent[dogId] = (msgCount || 0) + 1;
    localStorage.setItem("chatMessagesSent", JSON.stringify(state.chatMessagesSent));

    if (!state.plus && !hasMatch && state.chatMessagesSent[dogId] >= 1){
      chatInput.disabled = true;
      chatInput.placeholder = state.lang==="it" ? "Match necessario per continuare" : "Match needed to continue";
    }
  }

  function openMapsCategory(cat){
    if (!state.plus && ["vets","groomers","shops"].includes(cat)){
      if (state.rewardOpen) return;
      state.rewardOpen = true;
      showRewardVideoMock("services", ()=>{
        state.rewardOpen = false;
        openMapsQueryAfterReward(cat);
      });
      return;
    }
    openMapsQueryAfterReward(cat);
  }

  function openMapsQueryAfterReward(cat){
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

  function showAdBanner(){
    if (!adBanner || state.plus) return;
    adBanner.textContent = "Banner Test AdMob • Bannerhome";
    adBanner.style.display = "";
  }

  function showRewardVideoMock(type, onClose){
    const msg = {
      it: {
        swipe: "🎬 Reward Video Mock\n(10° swipe, poi ogni +5)\n\nTipo: Swipe Unlock",
        selfie: "🎬 Reward Video Mock\n(prima di vedere selfie)\n\nTipo: Selfie Unlock",
        chat: "🎬 Reward Video Mock\n(primo messaggio)\n\nTipo: Chat Unlock",
        services: "🎬 Reward Video Mock\n(veterinari/toelettature/negozi)\n\nTipo: Services"
      },
      en: {
        swipe: "🎬 Reward Video Mock\n(10th swipe, then every +5)\n\nType: Swipe Unlock",
        selfie: "🎬 Reward Video Mock\n(before viewing selfie)\n\nType: Selfie Unlock",
        chat: "🎬 Reward Video Mock\n(first message)\n\nType: Chat Unlock",
        services: "🎬 Reward Video Mock\n(vets/groomers/shops)\n\nType: Services"
      }
    };
    const text = msg[state.lang][type] || msg.it[type];
    alert(text);
    if (onClose) onClose();
  }

  function init(){
    applyTranslations();
    updatePlusUI();

    if(breedInput) breedInput.value = state.filters.breed;
    if(distRange) distRange.value  = state.filters.distKm;
    if(distLabel) distLabel.textContent = `${distRange.value} km`;
    if(onlyVerified) onlyVerified.checked = !!state.filters.verified;
    if(sexFilter) sexFilter.value  = state.filters.sex;

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
