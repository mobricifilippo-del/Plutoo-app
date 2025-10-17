/* =========================================================
   Plutoo — Gold Edition (app.js) • versione FIX
   - Navigazione Home → Nearby con ENTRA
   - Router su hash (#home / #nearby / #love / #play / #plus / #search / #places)
   - Chip centrali visibili solo “postlogin”
   - Grid “Vicino a te” mock + swipe “Amore”
   - Ricerca base (razza/sesso/verificato)
   - Luoghi PET → Google Maps
   ========================================================= */

(function(){
  "use strict";

  /* ========== Helpers base ========== */
  const qs  = (sel, root=document) => root.querySelector(sel);
  const qsa = (sel, root=document) => Array.from(root.querySelectorAll(sel));
  function $(sel, root=document){ return root.querySelector(sel); }
  function $$(sel, root=document){ return Array.from(root.querySelectorAll(sel)); }

  const show = el => { if (!el) return; el.classList.remove('hidden'); el.hidden = false; };
  const hide = el => { if (!el) return; el.classList.add('hidden'); el.hidden = true; };

  /* ========== Stato login / navigazione ========== */
  const PL_STATE_KEY = 'pl_postlogin';
  let navStack = [];

  const setPostlogin = v => localStorage.setItem(PL_STATE_KEY, v ? '1' : '0');
  const isPostlogin  = () => localStorage.getItem(PL_STATE_KEY) === '1';

  function showChips(visible){
    const bar = document.getElementById('chipsBar');
    if (bar){
      if (visible){
        bar.classList.remove('hidden');
        bar.removeAttribute('hidden');
      } else {
        bar.classList.add('hidden');
        bar.setAttribute('hidden','');
      }
    }
    qsa('#chipsBar .chip').forEach(btn => visible ? show(btn) : hide(btn));
  }

  /* ========== Router / cambio vista ========== */
  function updateBackButton(){
    const btnBack = qs('#btnBack');
    const atHome  = qs('#view-home')?.classList.contains('view-active');
    if (!isPostlogin() || atHome || navStack.length === 0) hide(btnBack);
    else show(btnBack);
  }

  function goTo(viewId){
    const targetId = `view-${viewId}`;
    const current = qs('.view.view-active');
    const next    = qs('#' + targetId);

    if (!next) return;

    if (current && current !== next){
      navStack.push(current.id);
      current.classList.remove('view-active');
      current.hidden = true;
    }
    next.hidden = false;
    next.classList.add('view-active');
    updateBackButton();
  }
  window.goTo = goTo;

  function routeFromHash(){
    const h = (location.hash||'').replace('#','') || 'home';
    const allowed = ['home','nearby','love','play','plus','search','places'];
    goTo( allowed.includes(h) ? h : 'home' );
  }
// ENTRA → abilita chip e porta a Nearby (forzo anche goTo)
window.addEventListener('DOMContentLoaded', () => {
  const btnEnter = document.getElementById('btnEnter');
  if (btnEnter) {
    btnEnter.addEventListener('click', (e) => {
      e.preventDefault();
      setPostlogin(true);
      showChips(true);
      goTo('nearby');              // <-- cambio vista subito
      location.hash = '#nearby';   // <-- aggiorno l'hash
      return false;
    });
  }
  routeFromHash(); // applica lo stato corrente
});

  window.addEventListener('hashchange', routeFromHash);
// LOGOUT → disconnette e torna alla Home
document.getElementById('btnLogout')?.addEventListener('click', () => {
  setPostlogin(false);
  showChips(false);
  navStack = [];
  location.hash = '#home'; // torna esplicitamente alla Home
});
/* ========== Stato app & storage minimo ========== */
  const STORAGE_KEYS = {
    lang: "pl_lang",
    gold: "pl_has_gold",
  };
  const storage = {
    get(k, f=null){ try{ const v=localStorage.getItem(k); return v==null?f:JSON.parse(v); }catch{ return f; } },
    set(k, v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch{} },
  };

  const App = window.Plutoo = window.Plutoo || {};
  App.state = {
    lang: storage.get(STORAGE_KEYS.lang, 'it'),
    hasGold: !!storage.get(STORAGE_KEYS.gold, false),
    dogs: [],
    swipeIndex: 0,
  };

  /* ========== Dataset mock ========== */
  const DEMO_DOGS = [
    { id:1, name:"Luna",  breed:"Labrador",         age:3, sex:"female", km:null, img:"./dog1.jpg", verified:true  },
    { id:2, name:"Rocky", breed:"Bulldog",          age:4, sex:"male",   km:null, img:"./dog2.jpg", verified:false },
    { id:3, name:"Milo",  breed:"Golden Retriever", age:2, sex:"male",   km:null, img:"./dog3.jpg", verified:true  },
    { id:4, name:"Bella", breed:"Barboncino",       age:1, sex:"female", km:null, img:"./dog4.jpg", verified:false },
  ];
  App.state.dogs = DEMO_DOGS.slice();
   renderNearby(); // mostra subito le card (i km si aggiornano dopo la geo)

  /* ========== Geolocalizzazione: assegna km mock se negata ========== */
  function initGeolocation(){
    if (!('geolocation' in navigator)){
      fallbackDistances(); return;
    }
    navigator.geolocation.getCurrentPosition(
      pos=>{
        App.state.dogs = App.state.dogs.map(d=> ({...d, km: d.km ?? (1 + Math.floor(Math.random()*10))}));
        renderNearby();
      },
      ()=>{ fallbackDistances(); },
      { enableHighAccuracy:true, timeout:8000, maximumAge:60000 }
    );
  }
  function fallbackDistances(){
    App.state.dogs = App.state.dogs.map(d=> ({...d, km: d.km ?? (3 + Math.floor(Math.random()*12))}));
    renderNearby();
  }
  document.addEventListener('DOMContentLoaded', ()=> setTimeout(initGeolocation, 400));

  /* ========== VICINO A TE: grid 2×N ========== */
  function renderNearby(list = App.state.dogs){
    const grid = $("#nearbyGrid");
    if (!grid) return;
    grid.innerHTML = "";
    list.forEach(d=>{
      const card = document.createElement("div");
      card.className = "card frame-gold";
      card.innerHTML = `
        <div class="card-photo"><img src="${d.img}" alt="${d.name}"></div>
        <div class="card-info small">
          <div><strong>${d.name}</strong>, ${d.age} · ${d.breed}</div>
          <div>${d.km!=null ? (d.km+" km") : ""}${d.verified ? ' · <span class="badge badge-inline">Gold</span>' : ""}</div>
        </div>`;
      grid.appendChild(card);
    });
  }
  document.addEventListener("DOMContentLoaded", renderNearby);

  /* ========== AMORE: singola card + swipe ========== */
  const swipeCard = $("#swipeCard");
  function currentDog(){ return App.state.dogs[ App.state.swipeIndex % App.state.dogs.length ]; }
  function renderSwipe(){
    if (!swipeCard || !App.state.dogs.length) return;
    const d = currentDog();
    swipeCard.innerHTML = `
      <div class="card-photo"><img src="${d.img}" alt="${d.name}" /></div>
      <div class="card-info small">
        <div><strong>${d.name}</strong>, ${d.age} · ${d.breed}</div>
        <div>${d.verified ? '<span class="badge badge-inline">Gold</span>' : ''}</div>
      </div>`;
  }
  document.addEventListener("DOMContentLoaded", renderSwipe);

  (function attachSwipe(){
    const area = $("#swipeArea");
    if (!area || !swipeCard) return;
    let startX=0, dx=0, dragging=false;

    function start(x){ dragging=true; startX=x; dx=0; swipeCard.style.transition=""; }
    function move(x){ if(!dragging) return; dx=x-startX; swipeCard.style.transform=`translateX(${dx}px) rotate(${dx/22}deg)`; }
    function end(){
      if(!dragging) return; dragging=false;
      const TH=120;
      if (dx>TH){ doLike(); }
      else if (dx<-TH){ doDislike(); }
      else { swipeCard.style.transition="transform .2s"; swipeCard.style.transform="translateX(0) rotate(0)"; }
    }
    area.addEventListener("touchstart", e=>start(e.touches[0].clientX), {passive:true});
    area.addEventListener("touchmove",  e=>move(e.touches[0].clientX),  {passive:true});
    area.addEventListener("touchend",   end, {passive:true});
    area.addEventListener("mousedown",  e=>start(e.clientX));
    window.addEventListener("mousemove", e=>move(e.clientX));
    window.addEventListener("mouseup",   end);
  })();

  $("#btnLike")?.addEventListener("click", doLike);
  $("#btnDislike")?.addEventListener("click", doDislike);

  function nextCard(){ App.state.swipeIndex = (App.state.swipeIndex + 1) % App.state.dogs.length; renderSwipe(); }
  function animateHeart(isGold){
    return new Promise(res=>{
      const n=document.createElement("div");
      n.style.cssText="position:fixed;inset:0;display:flex;align-items:center;justify-content:center;z-index:9999;pointer-events:none;animation:fade .6s ease forwards";
      n.innerHTML=`<div style="font-size:92px;filter:drop-shadow(0 10px 40px rgba(255,215,0,.5))">${isGold?"💛":"🥲"}</div>`;
      document.body.appendChild(n); setTimeout(()=>{n.remove();res();},600);
    });
  }
  function doLike(){ navigator.vibrate?.(20); animateHeart(true).then(nextCard); }
  function doDislike(){ navigator.vibrate?.(10); animateHeart(false).then(nextCard); }

  /* ========== Ricerca base ========== */
  const BREEDS = ["Labrador","Golden Retriever","Barboncino","Bulldog","Beagle","Chihuahua","Pastore Tedesco","Jack Russell","Cocker Spaniel","Carlino","Maltese","Border Collie","Husky","Bassotto","Dalmata","Pitbull","Shiba Inu","Rottweiler","Terranova","Samoyed"].sort();
  const breedInput = $("#breed");
  const breedSuggest = $("#breedSuggest");

  breedInput?.addEventListener("input", ()=>{
    const q=(breedInput.value||"").trim().toLowerCase();
    if(!q){ breedSuggest.innerHTML=""; breedSuggest.classList.remove("show"); return; }
    const m=BREEDS.filter(b=>b.toLowerCase().startsWith(q)).slice(0,8);
    if(!m.length){ breedSuggest.innerHTML=""; breedSuggest.classList.remove("show"); return; }
    breedSuggest.innerHTML = m.map(b=>`<button class="sugg" type="button">${b}</button>`).join("");
    breedSuggest.classList.add("show");
  });
  breedSuggest?.addEventListener("click", (e)=>{
    if (e.target.classList.contains("sugg")){
      breedInput.value = e.target.textContent;
      breedSuggest.classList.remove("show");
    }
  });

  $("#filtersForm")?.addEventListener("submit", (e)=>{
    e.preventDefault();
    const breed=(($("#breed").value)||"").trim().toLowerCase();
    const sex=$("#sex")?.value||"";
    const verified=$("#verified")?.checked||false;
    let list=App.state.dogs.slice();
    if(breed) list=list.filter(d=>d.breed.toLowerCase().startsWith(breed));
    if(sex) list=list.filter(d=>d.sex===sex);
    if(verified) list=list.filter(d=>d.verified);
    renderNearby(list);
    location.hash = '#nearby';
  });

  $("#filtersForm")?.addEventListener("reset", ()=> setTimeout(()=>renderNearby(App.state.dogs),0));

  /* ========== Luoghi PET → Maps ========== */
  const SERVICES_EN = {
    "veterinari":"veterinarians",
    "toelettature":"groomers",
    "negozi":"pet shops",
    "parchi":"dog parks",
    "addestratori":"dog trainers",
    "canili":"animal shelters",
  };
  $$(".dropdown-item").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const it = btn.dataset.service || "servizi pet";
      const q  = (App.state.lang==="it") ? it : (SERVICES_EN[it]||it);
      window.open("https://www.google.com/maps/search/"+encodeURIComponent(q+" near me"), "_blank", "noopener");
    });
  });

  /* ========== Topbar: chip, login, logout, back ========== */
  document.addEventListener('DOMContentLoaded', ()=>{
    const btnLogin   = qs('#btnLogin');
    const btnSignup  = qs('#btnSignup');
    const btnLogout  = qs('#btnLogout');
    const btnBack    = qs('#btnBack');

    if (isPostlogin()){
      showChips(true);
      hide(btnLogin); hide(btnSignup); show(btnLogout);
    } else {
      showChips(false);
      show(btnLogin); show(btnSignup); hide(btnLogout);
      goTo('home');
    }
    updateBackButton();

    ['#btnLogin','#btnEnter'].forEach(sel=>{
      const b=qs(sel); if(!b) return;
      b.addEventListener('click', ()=>{
        setPostlogin(true); showChips(true);
        hide(btnLogin); hide(btnSignup); show(btnLogout);
        updateBackButton();
      });
    });

    btnLogout?.addEventListener('click', ()=>{
      setPostlogin(false); showChips(false);
      navStack=[]; goTo('home');
      hide(btnLogout); show(btnLogin); show(btnSignup);
      updateBackButton();
    });

    qsa('.topbar-center .chip').forEach(ch=>{
      ch.addEventListener('click', ()=>{
        const target = ch.getAttribute('data-view');
        if (!target) return;
        location.hash = '#'+target;
      });
    });

    btnBack?.addEventListener('click', ()=>{
      if (navStack.length){
        const prevId = navStack.pop();
        const current = qs('.view.view-active');
        if (current){ current.classList.remove('view-active'); current.hidden = true; }
        const prev = qs('#'+prevId);
        if (prev){ prev.hidden = false; prev.classList.add('view-active'); }
      } else {
        location.hash = '#home';
      }
      updateBackButton();
    });
  });

})();
