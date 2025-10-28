/* =========================================================
   PLUTOO – app.js (Gold/Violet Edition)
   - 8 profili DOGS fissi
   - Back hardware: history.pushState + onpopstate
   - Animazioni: Entra (violet glow), apertura profilo (violet),
                 Match (cuore dorato) per Amore e Giochiamo
   - Campo Gold "Disponibile per accoppiamento" (profilo + ricerca)
   - Reset animazioni + tap-glow fix (600ms)
   ========================================================= */

document.getElementById('plutooSplash')?.remove();
document.getElementById('splash')?.remove();

document.addEventListener("DOMContentLoaded", () => {

  /* ---------------- Helpers ---------------- */
  const $  = (id) => document.getElementById(id);
  const qs = (s, r=document) => r.querySelector(s);
  const qa = (s, r=document) => Array.from(r.querySelectorAll(s));
  const wait = (ms) => new Promise(res => setTimeout(res, ms));

  const fmtKm = (km) => (km < 1 ? `${Math.round(km*1000)} m` : `${km} km`);
  const choose = (arr) => arr[Math.floor(Math.random()*arr.length)];

  /* ---------------- Stato ---------------- */
  const state = {
    plus: localStorage.getItem("plutoo_plus") === "yes",
    entered: localStorage.getItem("entered") === "1",
    currentView: "home",
    lastGridScroll: 0,
    loveIdx: 0,
    playIdx: 0,
    filters: {
      breed: "",
      sex: "",
      pairing: "", // "si" | "no" | ""
      verified: false
    }
  };

  /* ---------------- Dati (8 profili fissi) ---------------- */
  const DOGS = [
    { id:"d1", name:"Luna", age:2, breed:"Golden Retriever", km:1, img:"dog1.jpg", bio:"Coccolona e giocherellona.", mode:"love", sex:"F", verified:true, pairing:"si" },
    { id:"d2", name:"Rocky", age:3, breed:"Labrador", km:2, img:"dog2.jpg", bio:"Palline e acqua = vita.", mode:"play", sex:"M", verified:true, pairing:"no" },
    { id:"d3", name:"Maya", age:1, breed:"Border Collie", km:4, img:"dog3.jpg", bio:"Intelligente e attiva.", mode:"love", sex:"F", verified:false, pairing:"si" },
    { id:"d4", name:"Otto", age:4, breed:"Husky", km:6, img:"dog4.jpg", bio:"Ama correre al freddo.", mode:"play", sex:"M", verified:true, pairing:"no" },
    { id:"d5", name:"Chloe", age:2, breed:"Beagle", km:3, img:"dog1.jpg", bio:"Nasino sempre in funzione.", mode:"love", sex:"F", verified:false, pairing:"si" },
    { id:"d6", name:"Thor", age:5, breed:"Pastore Tedesco", km:7, img:"dog2.jpg", bio:"Leale e protettivo.", mode:"play", sex:"M", verified:true, pairing:"no" },
    { id:"d7", name:"Nina", age:2, breed:"Pomerania", km:2, img:"dog3.jpg", bio:"Piccola ma coraggiosa.", mode:"love", sex:"F", verified:true, pairing:"si" },
    { id:"d8", name:"Zeno", age:3, breed:"Maremmano", km:9, img:"dog4.jpg", bio:"Calmo e saggio.", mode:"play", sex:"M", verified:false, pairing:"no" },
  ];

  /* ---------------- Riferimenti DOM ---------------- */
  // Home/App
  const homeScreen = $("homeScreen");
  const appScreen  = $("appScreen");
  const profilePage = $("profilePage");

  const btnEnter = $("btnEnter");
  const btnBack  = $("btnBack");

  // Tabs (topbar + deck actions)
  const tabs = qa(".tab");
  const viewNearby = $("viewNearby");
  const viewLove   = $("viewLove");
  const viewPlay   = $("viewPlay");
  const viewSearch = $("viewSearch");
  const viewServices = $("viewServices");

  const nearbyGrid = $("nearbyGrid");

  const loveDeck = $("loveDeck");
  const btnLikeLove = $("btnLikeLove");
  const btnDislikeLove = $("btnDislikeLove");

  const playDeck = $("playDeck");
  const btnLikePlay = $("btnLikePlay");
  const btnDislikePlay = $("btnDislikePlay");

  // Profile fields
  const profileName = $("profileName");
  const profileBreed = $("profileBreed");
  const profileAge = $("profileAge");
  const profileKm = $("profileKm");
  const profileSex = $("profileSex");
  const profilePhoto = $("profilePhoto");
  const profileBadge = $("profileBadge");
  const profileGallery = $("profileGallery");
  const btnCloseProfile = $("btnCloseProfile");
  const btnMessage = $("btnMessage");
  const pairingInput = $("pairingInput"); // Gold field in profile

  // Search filters
  const breedInput = $("breedInput");
  const sexFilter = $("sexFilter");
  const badgeFilter = $("badgeFilter");
  const pairingFilter = $("pairingFilter"); // Gold filter
  const btnApplyFilters = $("btnApplyFilters");
  const btnResetFilters = $("btnResetFilters");
  const searchResults = $("searchResults");

  // Plus modal
  const plusModal = $("plusModal");
  const btnPlus = $("btnPlus");
  const btnOpenPlus = $("btnOpenPlus");
  const getPlus = $("getPlus");
  const laterPlus = $("laterPlus");
  const closePlus = $("closePlus");

  // Overlays (animazioni)
  const transitionOverlay = $("transitionOverlay");
  const matchOverlay = $("matchOverlay");

  // Ethics & Sponsor
  const btnShelters = $("btnShelters");
  const sponsorLink = $("sponsorLink");
  const sponsorLinkProfile = $("sponsorLinkProfile");

  /* ---------------- Plus: gating visuale ---------------- */
  function applyPlusGating(){
    qa('[data-plus-only]').forEach(el => {
      if (state.plus) {
        el.classList.remove("hidden");
        el.removeAttribute("aria-hidden");
        // eventuali controlli disabled
        qs("select, input", el)?.removeAttribute("disabled");
      } else {
        el.classList.add("hidden");
        el.setAttribute("aria-hidden","true");
        qs("select, input", el)?.setAttribute("disabled","disabled");
      }
    });
  }

  /* ---------------- Animazioni ---------------- */
  async function playEnterAnimation(){
    if (!transitionOverlay) return;
    transitionOverlay.classList.remove("hidden");
    // la .overlay-violet ha già l'animazione CSS (violetEnterFlash)
    await wait(760);
    transitionOverlay.classList.add("hidden");
  }

  async function playProfileOpenAnimation(){
    if (!transitionOverlay) return;
    transitionOverlay.classList.remove("hidden");
    await wait(420);
    transitionOverlay.classList.add("hidden");
  }

  async function showMatchOverlay(){
    if (!matchOverlay) return;
    matchOverlay.classList.remove("hidden");
    await wait(1100);
    matchOverlay.classList.add("hidden");
  }

  // tap-glow fix: 600ms per coerenza con CSS
  document.addEventListener("click", (e) => {
    const img = e.target.closest(".card-img");
    if (!img) return;
    img.classList.add("tap-glow");
    setTimeout(()=> img.classList.remove("tap-glow"), 600);
  });

  /* ---------------- Navigazione / History ---------------- */
  function showView(id){
    [viewNearby, viewLove, viewPlay, viewSearch, viewServices].forEach(v=>{
      if(!v) return;
      v.classList.toggle("hidden", v.id !== id);
      v.setAttribute("aria-hidden", v.id !== id ? "true" : "false");
    });
    tabs.forEach(t=>{
      const target = t.getAttribute("data-tab");
      t.classList.toggle("active", target === id);
    });
    state.currentView = id;
  }

  function enterApp(push=true){
    homeScreen.classList.add("hidden");
    appScreen.classList.remove("hidden");
    appScreen.setAttribute("aria-hidden","false");
    state.entered = true;
    localStorage.setItem("entered","1");
    showView("viewNearby");
    if (push) history.pushState({page:"app", view:"viewNearby"}, "", "");
  }

  function backToHome(push=true){
    appScreen.classList.add("hidden");
    appScreen.setAttribute("aria-hidden","true");
    profilePage.classList.add("hidden");
    profilePage.setAttribute("aria-hidden","true");
    homeScreen.classList.remove("hidden");
    homeScreen.setAttribute("aria-hidden","false");
    state.currentView = "home";
    if (push) history.pushState({page:"home"}, "", "");
  }

  function openProfile(dog, push=true){
    if (!dog) return;
    fillProfile(dog);
    profilePage.classList.remove("hidden");
    profilePage.setAttribute("aria-hidden","false");
    playProfileOpenAnimation();
    if (push) history.pushState({page:"profile", dogId:dog.id}, "", "");
  }

  function closeProfile(push=true){
    profilePage.classList.add("hidden");
    profilePage.setAttribute("aria-hidden","true");
    if (push) history.pushState({page:"app", view:state.currentView||"viewNearby"}, "", "");
  }

  window.onpopstate = (ev)=>{
    const s = ev.state || {};
    if (!s || !s.page){
      // fallback: torna a home
      backToHome(false);
      return;
    }
    if (s.page === "home"){
      backToHome(false);
      return;
    }
    if (s.page === "app"){
      homeScreen.classList.add("hidden");
      appScreen.classList.remove("hidden");
      profilePage.classList.add("hidden");
      showView(s.view || "viewNearby");
      return;
    }
    if (s.page === "profile"){
      homeScreen.classList.add("hidden");
      appScreen.classList.remove("hidden");
      showView(state.currentView || "viewNearby");
      profilePage.classList.remove("hidden");
      return;
    }
  };

  /* ---------------- Render: Vicino a te ---------------- */
  function applyFiltersList(list){
    let out = list.slice();
    const f = state.filters;
    if (f.breed) out = out.filter(d => d.breed.toLowerCase().startsWith(f.breed.toLowerCase()));
    if (f.sex)   out = out.filter(d => d.sex === f.sex);
    if (f.verified) out = out.filter(d => d.verified);
    if (state.plus && f.pairing) out = out.filter(d => d.pairing === f.pairing);
    return out;
  }

  function renderNearby(){
    const list = applyFiltersList(DOGS);
    if (!list.length){
      nearbyGrid.innerHTML = `<p class="soft" style="padding:.6rem">Nessun profilo. Modifica i filtri.</p>`;
      return;
    }
    nearbyGrid.innerHTML = list.map(cardHTML).join("");
    qa(".dog-card").forEach(card=>{
      const id = card.getAttribute("data-id");
      const d  = DOGS.find(x=>x.id===id);
      qs("img", card)?.addEventListener("click", ()=> openProfile(d));
      qs(".open-profile", card)?.addEventListener("click", ()=> openProfile(d));
    });
  }

  function cardHTML(d){
    return `
      <article class="card dog-card" data-id="${d.id}">
        <img src="${d.img}" alt="${d.name}" class="card-img" />
        <div class="card-info">
          <h3>${d.name} ${d.verified ? "✔" : ""}</h3>
          <p class="meta">${d.breed} · ${d.age} ${"anni"} · ${fmtKm(d.km)}</p>
          <p class="bio">${d.bio||""}</p>
        </div>
        <div class="card-actions">
          <button class="btn ghost open-profile" type="button">Apri profilo</button>
        </div>
      </article>
    `;
  }

  /* ---------------- Profilo ---------------- */
  function fillProfile(d){
    profileName.textContent = d.name;
    profileBreed.textContent = d.breed;
    profileAge.textContent = d.age;
    profileKm.textContent = fmtKm(d.km);
    profileSex.textContent = d.sex === "M" ? "Maschio" : "Femmina";
    profilePhoto.src = d.img;
    profileBadge.hidden = !d.verified;

    // pairing default
    if (pairingInput){
      pairingInput.value = d.pairing || "";
    }

    // galleria semplice (replica immagine con varianti)
    const pics = [d.img, d.img, d.img];
    profileGallery.innerHTML = pics.map((src,i)=>`<img src="${src}" alt="Foto ${i+1} di ${d.name}" />`).join("");

    // animazione card open (CSS)
    profilePage.classList.remove("anim-card-open");
    // reflow
    void profilePage.offsetWidth;
    profilePage.classList.add("anim-card-open");
  }

  btnCloseProfile?.addEventListener("click", ()=> closeProfile(true));

  btnMessage?.addEventListener("click", ()=>{
    // qui si potrebbe integrare rewarded per "primo messaggio" (mock o AdMob in futuro)
    alert("Messaggio: aprire chat (stub).");
  });

  /* ---------------- Deck Amore & Play ---------------- */
  function nextCard(mode){
    const src = DOGS.filter(d => d.mode === mode);
    const idx = mode==="love" ? state.loveIdx : state.playIdx;
    return src[idx % src.length];
  }

  function renderDecks(){
    // LOVE
    const dLove = nextCard("love");
    if (dLove){
      loveDeck.innerHTML = `
        <article class="card-swipe">
          <img src="${dLove.img}" alt="${dLove.name}" />
          <div class="grad"></div>
          <div class="info">
            <div class="name">${dLove.name} ${dLove.verified ? "✔" : ""}</div>
            <div class="sub">${dLove.breed} · ${dLove.age} anni · ${fmtKm(dLove.km)}</div>
          </div>
        </article>
      `;
    }
    // PLAY
    const dPlay = nextCard("play");
    if (dPlay){
      playDeck.innerHTML = `
        <article class="card-swipe">
          <img src="${dPlay.img}" alt="${dPlay.name}" />
          <div class="grad"></div>
          <div class="info">
            <div class="name">${dPlay.name} ${dPlay.verified ? "✔" : ""}</div>
            <div class="sub">${dPlay.breed} · ${dPlay.age} anni · ${fmtKm(dPlay.km)}</div>
          </div>
        </article>
      `;
    }
  }

  function doSwipe(mode, liked){
    // animazione swipe
    const deck = mode==="love" ? loveDeck : playDeck;
    const card = qs(".card-swipe", deck);
    if (card){
      card.classList.add(liked ? "swipe-like" : "swipe-nope");
      setTimeout(()=> {
        if (mode==="love") state.loveIdx++;
        else state.playIdx++;
        renderDecks();
      }, 460);
    } else {
      if (mode==="love") state.loveIdx++;
      else state.playIdx++;
      renderDecks();
    }

    // se like → match probabilistico + cuore dorato
    if (liked){
      const matched = Math.random() < 0.35; // 35% match fittizio
      if (matched) {
        showMatchOverlay();
        // Qui, in futuro: interstitial al match (se non Plus)
      }
    }
  }

  btnLikeLove?.addEventListener("click", ()=> doSwipe("love", true));
  btnDislikeLove?.addEventListener("click", ()=> doSwipe("love", false));
  btnLikePlay?.addEventListener("click", ()=> doSwipe("play", true));
  btnDislikePlay?.addEventListener("click", ()=> doSwipe("play", false));

  /* ---------------- Filtri Ricerca ---------------- */
  btnApplyFilters?.addEventListener("click", (e)=>{
    e.preventDefault();
    state.filters.breed = (breedInput?.value||"").trim();
    state.filters.sex = (sexFilter?.value||"");
    state.filters.verified = (badgeFilter?.value||"") === "yes";
    if (state.plus){
      state.filters.pairing = (pairingFilter?.value||"");
    } else {
      state.filters.pairing = "";
    }
    renderNearby();
  });

  btnResetFilters?.addEventListener("click", (e)=>{
    e.preventDefault();
    if (breedInput) breedInput.value="";
    if (sexFilter) sexFilter.value="";
    if (badgeFilter) badgeFilter.value="";
    if (pairingFilter) pairingFilter.value="";
    Object.assign(state.filters, {breed:"", sex:"", verified:false, pairing:""});
    renderNearby();
  });

  /* ---------------- Plus Modal ---------------- */
  function openPlus(){
    plusModal?.classList.remove("hidden");
    plusModal?.setAttribute("aria-hidden","false");
    document.body.style.overflow="hidden";
  }
  function closePlusModal(){
    plusModal?.classList.add("hidden");
    plusModal?.setAttribute("aria-hidden","true");
    document.body.style.overflow="";
  }
  btnPlus?.addEventListener("click", openPlus);
  btnOpenPlus?.addEventListener("click", openPlus);
  closePlus?.addEventListener("click", (e)=>{ e.preventDefault(); closePlusModal(); });
  laterPlus?.addEventListener("click", (e)=>{ e.preventDefault(); closePlusModal(); });
  getPlus?.addEventListener("click", ()=>{
    localStorage.setItem("plutoo_plus","yes");
    state.plus = true;
    applyPlusGating();
    closePlusModal();
    // piccolo toast visivo
    try{
      const b=document.createElement("div");
      b.textContent="Plutoo Plus attivato!";
      b.style.position="fixed"; b.style.bottom="16px"; b.style.left="50%"; b.style.transform="translateX(-50%)";
      b.style.padding="10px 14px"; b.style.background="#1a1a1f"; b.style.color="#fff"; b.style.borderRadius="10px"; b.style.border="1px solid rgba(255,255,255,.15)";
      b.style.zIndex="3001"; document.body.appendChild(b);
      setTimeout(()=> b.remove(), 1800);
    }catch(_){}
  });

  /* ---------------- Etico & Sponsor ---------------- */
  btnShelters?.addEventListener("click", (e)=>{
    e.preventDefault();
    // niente reward qui (etico): apri Maps
    const q = encodeURIComponent("canili nelle vicinanze");
    window.open(`https://www.google.com/maps/search/${q}`, "_blank");
  });

  sponsorLink?.addEventListener("click", (e)=>{
    e.preventDefault();
    window.open("https://www.gelatofido.it/", "_blank");
  });
  sponsorLinkProfile?.addEventListener("click", (e)=>{
    e.preventDefault();
    window.open("https://www.gelatofido.it/", "_blank");
  });

  /* ---------------- Eventi UI ---------------- */
  btnEnter?.addEventListener("click", async ()=>{
    await playEnterAnimation();
    enterApp(true);
  });
  btnBack?.addEventListener("click", ()=>{
    // back: se profilo aperto chiudi, altrimenti torna a home se sei su app
    if (!profilePage.classList.contains("hidden")){
      closeProfile(true);
    } else {
      backToHome(true);
    }
  });

  // Gestione tab click
  tabs.forEach(t=>{
    t.addEventListener("click", ()=>{
      const id = t.getAttribute("data-tab");
      if (!id) return;
      showView(id);
      history.pushState({page:"app", view:id}, "", "");
      // reset piccole animazioni se si torna a Nearby
      if (id === "viewNearby"){
        // niente
      }
    });
  });

  /* ---------------- Init ---------------- */
  function init(){
    applyPlusGating();
    if (state.entered){
      enterApp(false);
    } else {
      backToHome(false);
    }
    renderNearby();
    renderDecks();

    // Stato iniziale di history
    if (state.entered){
      // siamo nell'app
      history.replaceState({page:"app", view:"viewNearby"}, "", "");
    } else {
      history.replaceState({page:"home"}, "", "");
    }
  }

  init();

}); // DOMContentLoaded chiusura
