/* =========================================================
   PLUTOO – logica client (mock dati + navigazione)
   ========================================================= */

const state = {
  entered: false,
  plus: false,
  deckBusy: false,
  geo: null,
  lang: localStorage.getItem("lang") || "it",
};

const qs = (s, root=document) => root.querySelector(s);
const qsa = (s, root=document) => Array.from(root.querySelectorAll(s));
const on = (el, ev, fn) => el && el.addEventListener(ev, fn);
const $home = qs("#homeScreen");
const $app  = qs("#appScreen");

/* ---------------------------------------------------------
   MOCK DATI (immagini vere per evitare carte vuote)
--------------------------------------------------------- */
const dogs = [
  { id:1, name:"Luna",   sex:"female", breed:"Labrador", age:"2", km:1.2, bio:"Amante dei parchi", img:"https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=1200&auto=format&fit=crop", gold:true },
  { id:2, name:"Rocky",  sex:"male",   breed:"Beagle",   age:"3", km:2.5, bio:"Corre come il vento", img:"https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=1200&auto=format&fit=crop", gold:false },
  { id:3, name:"Maya",   sex:"female", breed:"Husky",    age:"1", km:3.1, bio:"Dolcissima",        img:"https://images.unsplash.com/photo-1517849845537-4d257902454a?q=80&w=1200&auto=format&fit=crop", gold:true },
  { id:4, name:"Otto",   sex:"male",   breed:"Maltese",  age:"4", km:0.9, bio:"Coccolone",         img:"https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?q=80&w=1200&auto=format&fit=crop", gold:false },
];

/* ---------------------------------------------------------
   HOME → APP
--------------------------------------------------------- */
on(qs("#btnEnter"), "click", () => {
  // animazione più lunga sul logo
  qs("#heroLogo").classList.remove("gold-glow");
  void qs("#heroLogo").offsetWidth; // reflow
  qs("#heroLogo").classList.add("gold-glow");

  setTimeout(()=> {
    state.entered = true;
    localStorage.setItem("entered","1");
    showApp();
  }, 900); // lascia scorrere l'animazione
});

function showApp(){
  $home.classList.add("hidden");
  $app.classList.remove("hidden");
  $app.setAttribute("aria-hidden","false");
  initAppOnce();
}

/* ---------------------------------------------------------
   TOOLS
--------------------------------------------------------- */
function kmLabel(k){ return `${k.toFixed(1)}km`; }
function sexLabel(s){ return s==="male"?"Maschio":"Femmina"; }
function el(tag, cls, html){ const e=document.createElement(tag); if(cls) e.className=cls; if(html!=null) e.innerHTML=html; return e; }

/* ---------------------------------------------------------
   NAVBAR / TABS / DROPDOWN
--------------------------------------------------------- */
function setActiveView(viewId){
  qsa(".view").forEach(v=>v.classList.remove("active"));
  qs(`#${viewId}`).classList.add("active");
  qsa(".tab").forEach(t=>t.classList.remove("active"));
  const map = {viewNearby:"#tabNearby", viewLove:"#tabLove", viewPlay:"#tabPlay"};
  const btn = qs(map[viewId]);
  btn && btn.classList.add("active");
  window.scrollTo({top:0,behavior:"instant"});
}

on(qs("#tabNearby"), "click", ()=> setActiveView("viewNearby"));
on(qs("#tabLove"),   "click", ()=> setActiveView("viewLove"));
on(qs("#tabPlay"),   "click", ()=> setActiveView("viewPlay"));

const tabLuoghi = qs("#tabLuoghi");
const luoghiMenu = qs("#luoghiMenu");
on(tabLuoghi, "click", ()=>{
  const open = tabLuoghi.getAttribute("aria-expanded")==="true";
  tabLuoghi.setAttribute("aria-expanded", !open);
});

qsa("#luoghiMenu .menu-item").forEach(btn=>{
  on(btn,"click",()=>{
    // video reward (mock) poi Maps
    tabLuoghi.setAttribute("aria-expanded","false");
    toast("Apro i risultati vicini in Google Maps…");
    const type = btn.dataset.cat;
    const queryMap = {
      vets: "veterinari",
      shops: "negozi animali",
      groomers: "toelettatura",
      parks: "parco per cani",
      trainers: "addestratori cinofili"
    };
    openMaps(queryMap[type]);
  });
});

/* ---------------------------------------------------------
   RICERCA PERSONALIZZATA
--------------------------------------------------------- */
const panelSearch = qs("#panelSearch");
on(qs("#btnSearch"), "click", ()=>{
  panelSearch.setAttribute("aria-hidden","false");
  document.body.classList.add("noscroll");
});
on(qs("#btnCloseSearch"), "click", ()=>{
  panelSearch.setAttribute("aria-hidden","true");
  document.body.classList.remove("noscroll");
});
on(qs("#btnResetFilters"), "click", ()=>{
  qs("#breed").value=""; qs("#sex").value=""; qs("#badge").value=""; qs("#distance").value=20;
  qs("#suggestions").classList.remove("show"); qs("#suggestions").innerHTML="";
});
on(qs("#btnApplyFilters"), "click", ()=>{
  panelSearch.setAttribute("aria-hidden","true");
  document.body.classList.remove("noscroll");
  toast("Filtri applicati (mock)");
});

// Typeahead razze (lista base)
const BREEDS = ["Beagle","Border Collie","Bulldog","Chihuahua","Dobermann","Golden Retriever","Husky","Labrador","Maltese","Pitbull","Pastore Tedesco","Terranova","Volpino"];
on(qs("#breed"), "input", (e)=>{
  const v = e.target.value.trim().toLowerCase();
  const s = qs("#suggestions");
  if(!v){ s.classList.remove("show"); s.innerHTML=""; return; }
  const out = BREEDS.filter(b=>b.toLowerCase().startsWith(v)).sort();
  s.innerHTML = out.map(b=>`<div class="item" role="option">${b}</div>`).join("");
  s.classList.toggle("show", out.length>0);
});
on(qs("#suggestions"), "click", (e)=>{
  const it = e.target.closest(".item"); if(!it) return;
  qs("#breed").value = it.textContent;
  qs("#suggestions").classList.remove("show");
});

/* ---------------------------------------------------------
   VICINO A TE (griglia stabile)
--------------------------------------------------------- */
function renderNearby(list=dogs){
  const grid = qs("#nearbyGrid");
  grid.innerHTML = "";
  list.forEach(d=>{
    const card = el("article","card");
    const img = el("img","card-img"); img.src = d.img; img.alt = d.name;
    const info = el("div","card-info");
    info.innerHTML = `
      <h3>${d.name}</h3>
      <p class="meta">${sexLabel(d.sex)} · ${d.breed} · ${kmLabel(d.km)}</p>
      <p class="bio">${d.bio}</p>
      <div class="card-actions" role="group">
        <button class="btn no" title="🥲">🥲</button>
        <button class="btn yes" title="💜">💜</button>
      </div>
    `;
    card.append(img, info);
    img.addEventListener("click", ()=> openProfile(d));
    grid.append(card);
  });
}

/* ---------------------------------------------------------
   DECK SWIPE (centrale, pagina ferma)
--------------------------------------------------------- */
function renderDeck(rootId, list=dogs){
  const root = qs(`#${rootId}`);
  root.innerHTML = "";
  const stack = [...list].reverse(); // ultima in DOM = sotto
  stack.forEach(d=>{
    const card = el("article","card");
    card.style.transform="translate(-50%, -50%)";
    const img = el("img","card-img"); img.src=d.img; img.alt=d.name;
    const info = el("div","card-info");
    info.innerHTML = `
      <h3>${d.name}</h3>
      <p class="meta">${sexLabel(d.sex)} · ${d.breed} · ${kmLabel(d.km)}</p>
      <div class="card-actions">
        <button class="btn no" title="🥲">🥲</button>
        <button class="btn yes" title="💜">💜</button>
      </div>
    `;
    card.append(img, info);
    root.append(card);
  });

  // Gestione swipe su top card, senza muovere la pagina
  let startX=0, dx=0, active=null, lastTime=0;

  const bindTop = ()=>{
    const cards = qsa(".love-deck .card", root.parentElement);
    active = cards[cards.length-1]; // top
    if(!active){ return; }
    const move = (x)=>{
      dx = x-startX;
      active.style.transition="none";
      active.style.transform = `translate(-50%, -50%) translateX(${dx}px) rotate(${dx/18}deg)`;
    };
    const end = ()=>{
      document.removeEventListener("touchmove", touchMove, {passive:false});
      document.removeEventListener("mousemove", mouseMove);
      document.removeEventListener("touchend", touchEnd);
      document.removeEventListener("mouseup", mouseEnd);
      const abs = Math.abs(dx);
      active.style.transition="";
      if(abs>120){
        const dir = dx>0 ? "right" : "left";
        active.classList.add(dir==="right"?"swipe-out-right":"swipe-out-left");
        setTimeout(()=>{ active.remove(); bindTop(); }, 380);
      }else{
        active.style.transform="translate(-50%, -50%)";
      }
      dx=0; startX=0;
    };
    function touchMove(e){ e.preventDefault(); move(e.touches[0].clientX); }
    function mouseMove(e){ move(e.clientX); }
    function touchEnd(){ end(); }
    function mouseEnd(){ end(); }

    const start = (x, t)=>{
      // debounce per evitare doppio swipe
      if(t - lastTime < 150) return;
      lastTime = t;
      startX = x;
      document.addEventListener("touchmove", touchMove, {passive:false});
      document.addEventListener("mousemove", mouseMove);
      document.addEventListener("touchend", touchEnd);
      document.addEventListener("mouseup", mouseEnd);
    };

    active.addEventListener("touchstart", e=> start(e.touches[0].clientX, e.timeStamp), {passive:true});
    active.addEventListener("mousedown", e=> start(e.clientX, e.timeStamp));
    // click immagine → profilo
    active.querySelector(".card-img").addEventListener("click", ()=> {
      if(Math.abs(dx)<6) openProfile(list[list.length-1]); // top logical
    });
  };
  bindTop();
}

/* ---------------------------------------------------------
   PROFILO
--------------------------------------------------------- */
function openProfile(d){
  qs("#profileName").textContent = d.name;
  qs("#profileMeta").textContent = `${d.breed} · ${sexLabel(d.sex)} · ${d.age} anni`;
  qs("#profilePhoto").src = d.img;
  const badges = qs("#profileBadges");
  badges.innerHTML = d.gold ? `<span class="badge">Verificato ⭐</span>` : `<span class="badge">Non verificato</span>`;

  // gallery mock
  const gal = qs("#profileGallery");
  gal.innerHTML = "";
  [d.img,d.img,d.img].forEach(src=>{
    const im = new Image(); im.src=src; im.alt=d.name; gal.append(im);
  });

  // apri pagina profilo
  qs("#profilePage").classList.remove("hidden");
  $app.classList.add("noscroll");
  window.history.pushState({p:"profile"}, "", "#profile");
}

on(qs("#btnBackProfile"), "click", ()=>{
  qs("#profilePage").classList.add("hidden");
  $app.classList.remove("noscroll");
  window.history.back();
});

/* ---------------------------------------------------------
   SPONSOR & CANILI
--------------------------------------------------------- */
on(qs("#ethicsButtonHome"), "click", ()=> {
  // NO video: sempre libero
  openMaps("canile");
});
function openMaps(query){
  if(navigator.geolocation){
    navigator.geolocation.getCurrentPosition(pos=>{
      const {latitude,longitude} = pos.coords;
      window.open(`https://www.google.com/maps/search/${encodeURIComponent(query)}/@${latitude},${longitude},14z`, "_blank");
    }, ()=>{
      window.open(`https://www.google.com/maps/search/${encodeURIComponent(query)}`, "_blank");
    }, {enableHighAccuracy:true, timeout:5000});
  }else{
    window.open(`https://www.google.com/maps/search/${encodeURIComponent(query)}`, "_blank");
  }
}

/* ---------------------------------------------------------
   TOAST (mock)
--------------------------------------------------------- */
function toast(msg){
  let box = qs("#toastBox");
  if(!box){
    box = document.createElement("div");
    box.className = "toast";
    box.id = "toastBox";
    box.innerHTML = `<div class="toast-box" id="toastInner"></div>`;
    document.body.append(box);
  }
  qs("#toastInner").textContent = msg;
  box.classList.add("show");
  setTimeout(()=>box.classList.remove("show"), 1200);
}

/* ---------------------------------------------------------
   INIZIALIZZAZIONE APP
--------------------------------------------------------- */
let appInited = false;
function initAppOnce(){
  if(appInited) return; appInited = true;

  // griglia vicini
  renderNearby(dogs);

  // deck amore/gioco
  renderDeck("loveDeck", dogs);
  renderDeck("playDeck", dogs);

  // sponsor cliccabile già via <a>
  // back pulsante
  on(qs("#btnBack"), "click", ()=>{
    // torna alla pagina precedente (non home forzata)
    history.back();
  });

  // geolocalizzazione base
  if(navigator.geolocation){
    navigator.geolocation.getCurrentPosition(p=>{ state.geo = p.coords; }, ()=>{}, {enableHighAccuracy:true, timeout:5000});
  }
}

/* ---------------------------------------------------------
   AVVIO
--------------------------------------------------------- */
if(localStorage.getItem("entered")==="1"){ showApp(); }

/* evitare scroll orizzontali involontari su deck */
["touchmove","wheel"].forEach(ev=>{
  on(qs("#loveDeck"), ev, (e)=>{ if(e.type==="wheel") return; if(Math.abs(e.deltaY||0)===0) e.preventDefault(); }, {passive:false});
  on(qs("#playDeck"), ev, (e)=>{ if(e.type==="wheel") return; if(Math.abs(e.deltaY||0)===0) e.preventDefault(); }, {passive:false});
});
