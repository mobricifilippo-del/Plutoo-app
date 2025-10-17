/* =========================================================
   Plutoo — Gold Edition (app.js)
   File completo ed esteso. Funziona con index/style dello ZIP.
   ========================================================= */
alert('BOOT OK');                                // <-- test: capiamo se lo script parte
window.addEventListener('error', e => alert('JS ERROR: ' + e.message));
(function(){
  "use strict";

  /* ========= helpers base ========= */
  const qs  = sel => document.querySelector(sel);
  const qsa = sel => Array.from(document.querySelectorAll(sel));
  function $(sel, root=document){ return root.querySelector(sel); }
  function $$(sel, root=document){ return Array.from(root.querySelectorAll(sel)); }

  const show = el => { if (!el) return; el.classList.remove('hidden'); el.hidden = false; };
  const hide = el => { if (!el) return; el.classList.add('hidden'); el.hidden = true; };

  /* ========= stato login / navigazione ========= */
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

  function updateBackButton(){
    const btnBack = qs('#btnBack');
    const atHome  = qs('#view-home')?.classList.contains('view-active');
    if (!isPostlogin() || atHome || navStack.length === 0) hide(btnBack);
    else show(btnBack);
  }

  /* ========= App namespace ========= */
  const App = window.Plutoo = window.Plutoo || {};

  App.show = (viewId)=>{
    const current = qs('.view.view-active');
    if (current && current.id !== `view-${viewId}`) {
      navStack.push(current.id);
      current.classList.remove('view-active');
      current.hidden = true;
    }
    qsa('.view').forEach(v=>{ if(v.id===`view-${viewId}`){ v.hidden=false; v.classList.add('view-active'); } });
    updateBackButton();
  };

  /* ========= i18n minimo / stato / storage ========= */
  const GOLD_PRICE = "€39,90/anno";
  const STORAGE_KEYS = {
    lang: "pl_lang",
    user: "pl_user",
    likesFree: "pl_free_likes_left",
    gold: "pl_has_gold",
    selfieUnlock: "pl_selfie_unlock_until",
    seenDogs: "pl_seen_dogs",
  };

  const SERVICES_EN = {
    "veterinari": "veterinarians",
    "toelettature": "groomers",
    "negozi": "pet shops",
    "parchi": "dog parks",
    "addestratori": "dog trainers",
    "canili": "animal shelters",
  };

  App.state = {
    view: "home",
    user: null,
    hasGold: false,
    likesFreeLeft: 3,
    lang: "it",
    dogs: [],
    breeds: [],
    swipeIndex: 0,
    matches: [],
    chat: {},
    geo: null,
  };

  const storage = {
    get(k, fallback=null){
      try{ const v = localStorage.getItem(k); return (v==null?fallback:JSON.parse(v)); }
      catch(e){ return fallback; }
    },
    set(k, v){ try{ localStorage.setItem(k, JSON.stringify(v)); } catch(e){} },
    remove(k){ try{ localStorage.removeItem(k); } catch(e){} }
  };

  /* ========= Router (hash solo per ENTRA diretto) ========= */
  function goTo(viewId){
    App.show(viewId);
  }
  window.goTo = goTo;

  function routeFromHash(){
    const h = location.hash.slice(1);
    if (h === 'nearby')        goTo('nearby');
    else if (!h || h === 'home') goTo('home');
  }

  window.addEventListener('DOMContentLoaded', () => {
    const btnEnter = document.getElementById('btnEnter');
    if (btnEnter) {
      btnEnter.addEventListener('click', (e) => {
        e.preventDefault();
        setPostlogin(true);
        showChips(true);
        location.hash = '#nearby';
      }, { once: true });
    }
    routeFromHash();
  });

  window.addEventListener('hashchange', routeFromHash);

  /* ========= Init stato da storage / login dummy ========= */
  function getLang(){
    const l = storage.get(STORAGE_KEYS.lang, null);
    if (l) return l;
    return (navigator.language||"it").toLowerCase().startsWith("en") ? "en" : "it";
  }

  function applyI18n(){ /* placeholder: testi già in italiano */ }

  function initStateFromStorage(){
    App.state.lang = getLang();
    App.state.user = storage.get(STORAGE_KEYS.user, null);
    App.state.hasGold = !!storage.get(STORAGE_KEYS.gold, false);
    const likes = storage.get(STORAGE_KEYS.likesFree);
    App.state.likesFreeLeft = (typeof likes === "number") ? likes : 3;
  }

  function saveLang(lang){
    App.state.lang = lang;
    storage.set(STORAGE_KEYS.lang, lang);
    applyI18n();
  }

  $("#lang-it")?.addEventListener("click", ()=>saveLang("it"));
  $("#lang-en")?.addEventListener("click", ()=>saveLang("en"));

  function showNearbyTab(show){
    const nearTab = $("#tab-nearby");
    if (!nearTab) return;
    nearTab.style.display = show ? "" : "none";
  }

  function toast(msg){
    let t = $("#pl-toast");
    if (!t){
      t = document.createElement("div");
      t.id = "pl-toast";
      t.style.cssText = "position:fixed;left:50%;bottom:18px;transform:translateX(-50%);background:rgba(0,0,0,.75);color:#fff;padding:10px 14px;border-radius:12px;z-index:9999;border:1px solid rgba(255,255,255,.12)";
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.opacity = "1";
    setTimeout(()=> t.style.opacity="0", 1800);
  }
  App.toast = toast;

  $("#btnLogin")?.addEventListener("click", ()=>{
    if (!App.state.user){
      App.state.user = { id:"u1", name:"Guest"};
      storage.set(STORAGE_KEYS.user, App.state.user);
      showNearbyTab(true);
      toast("Login OK");
    }
  });
  $("#btnSignup")?.addEventListener("click", ()=>{
    if (!App.state.user){
      App.state.user = { id:"u2", name:"New"};
      storage.set(STORAGE_KEYS.user, App.state.user);
      showNearbyTab(true);
      toast("Registrato");
    }
  });

  /* ========= Boot ========= */
  document.addEventListener("DOMContentLoaded", ()=>{
    initStateFromStorage();
    applyI18n();
    showNearbyTab(!!App.state.user);

    if (isPostlogin()){
      showChips(true);
      goTo('nearby');
    } else {
      showChips(false);
      qsa('.view').forEach(v => { v.hidden = true; v.classList.remove('view-active'); });
      const home = qs('#view-home'); if (home){ home.hidden = false; home.classList.add('view-active'); }
    }
    updateBackButton();

    // chip di navigazione
    qsa('.topbar-center .chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-view');
        if (target) goTo(target);
      });
    });

    // bottone ←
    const back = qs('#btnBack');
    back?.addEventListener('click', () => {
      if (navStack.length) {
        const prevId = navStack.pop();
        const current = qs('.view.view-active');
        if (current) { current.classList.remove('view-active'); current.hidden = true; }
        const prev = qs('#' + prevId);
        if (prev) { prev.hidden = false; prev.classList.add('view-active'); }
      } else {
        qsa('.view').forEach(v => { v.hidden = true; v.classList.remove('view-active'); });
        const home = qs('#view-home'); if (home){ home.hidden = false; home.classList.add('view-active'); }
      }
      updateBackButton();
    });

    // back hardware
    window.addEventListener('popstate', () => { back?.click(); });
  });

  /* =========================================================
     DATASET, NEARBY GRID, PROFILO (fallback senza HTML dedicato)
     ========================================================= */
  const DEMO_DOGS = [
    { id:1, name:"Luna",  breed:"Labrador",          age:3, sex:"female", km:null, img:"./dog1.jpg", verified:true,
      docs:{ vacc:true, ped:true, chip:true }, selfie:"./dog1.jpg" },
    { id:2, name:"Rocky", breed:"Bulldog",           age:4, sex:"male",   km:null, img:"./dog2.jpg", verified:false,
      docs:{ vacc:true, ped:false, chip:true }, selfie:"./dog2.jpg" },
    { id:3, name:"Milo",  breed:"Golden Retriever",  age:2, sex:"male",   km:null, img:"./dog3.jpg", verified:true,
      docs:{ vacc:true, ped:true, chip:true }, selfie:"./dog3.jpg" },
    { id:4, name:"Bella", breed:"Barboncino",        age:1, sex:"female", km:null, img:"./dog4.jpg", verified:false,
      docs:{ vacc:true, ped:false, chip:true }, selfie:"./dog4.jpg" },
  ];
  App.state.dogs = DEMO_DOGS.slice();

  function renderNearby(list = App.state.dogs){
    const grid = $("#nearbyGrid");
    if (!grid) return;
    grid.innerHTML = "";
    list.forEach(d=>{
      const card = document.createElement("div");
      card.className = "card frame-gold";
      card.innerHTML = `
        <div class="card-photo">
          <img src="${d.img}" alt="${d.name}">
        </div>
        <div class="card-info small">
          <div><strong>${d.name}</strong>, ${d.age} · ${d.breed}</div>
          <div>${d.km!=null ? (d.km+" km") : ""}${d.verified ? ' · <span class="badge badge-inline">Verificato</span>' : ""}</div>
        </div>
      `;
      card.addEventListener("click", ()=> openProfile(d));
      grid.appendChild(card);
    });
  }

  // Profilo: fallback dialog se l’HTML dedicato non c’è
  function openProfile(d){
    const hasSheet = $("#profilePage");
    if (!hasSheet){
      const dlg = document.createElement("dialog");
      dlg.innerHTML = `
        <div style="padding:0; width:min(560px,92vw); background:#0F0F14; border-radius:12px; overflow:hidden">
          <div style="padding:12px 14px;border-bottom:1px solid rgba(255,255,255,.08);display:flex;justify-content:space-between;align-items:center">
            <strong>${d.name}</strong>
            <button class="btn btn-ghost" id="ppClose">✕</button>
          </div>
          <div style="padding:12px">
            <img src="${d.img}" alt="${d.name}" style="width:100%;height:240px;object-fit:cover;border-radius:12px;margin-bottom:8px">
            <div>${d.breed}, ${d.age} · ${d.sex==="male"?"♂":"♀"} ${d.km!=null?(" · "+d.km+" km"):""}</div>
            <div style="opacity:.85;margin-top:6px">${d.verified ? "Profilo verificato (documenti)" : "Non verificato"}</div>
            <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap">
              <button class="btn btn-gold" id="btnOpenChat">Apri chat</button>
              <button class="btn btn-ghost" id="btnUnlockSelfie">Sblocca selfie (24h)</button>
            </div>
          </div>
        </div>`;
      document.body.appendChild(dlg);
      dlg.showModal();
      dlg.querySelector("#ppClose")?.addEventListener("click", ()=>{ dlg.close(); dlg.remove(); });
      dlg.querySelector("#btnOpenChat")?.addEventListener("click", ()=>{ openChat(d); });
      dlg.querySelector("#btnUnlockSelfie")?.addEventListener("click", unlockSelfie);
      return;
    }
    // se esistesse l’HTML nativo del profilo, qui potresti popolarlo
  }

  /* ========= Geolocalizzazione (mock km) ========= */
  function initGeolocation(){
    if (!("geolocation" in navigator)){
      fallbackDistances(); return;
    }
    navigator.geolocation.getCurrentPosition(
      pos=>{
        App.state.geo = { lat:pos.coords.latitude, lng:pos.coords.longitude, acc:pos.coords.accuracy };
        App.state.dogs = App.state.dogs.map(d=> ({...d, km: d.km ?? (1 + Math.floor(Math.random()*12))}));
        renderNearby();
      },
      ()=>{
        fallbackDistances();
      },
      { enableHighAccuracy:true, timeout:10000, maximumAge:60000 }
    );
  }
  function fallbackDistances(){
    App.state.dogs = App.state.dogs.map(d=> ({...d, km: d.km ?? (3 + Math.floor(Math.random()*10))}));
    renderNearby();
  }
  document.addEventListener("DOMContentLoaded", ()=> setTimeout(initGeolocation, 400));

  // ENTRA (ulteriore sicurezza senza hash)
  $("#btnEnter")?.addEventListener("click", (e)=>{ e.preventDefault(); setPostlogin(true); showChips(true); App.show("nearby"); });

  /* =========================================================
     SWIPE / MATCH / INTERSTITIAL
     ========================================================= */
  const swipeCard = $("#swipeCard");
  function currentDog(){
    return App.state.dogs[ App.state.swipeIndex % App.state.dogs.length ];
  }
  function renderSwipe(){
    if (!swipeCard || !App.state.dogs.length) return;
    const d = currentDog();
    swipeCard.innerHTML = `
      <div class="card-photo"><img src="${d.img}" alt="${d.name}" /></div>
      <div class="card-info small">
        <div><strong>${d.name}</strong>, ${d.age} · ${d.breed}</div>
        <div>${d.verified ? '<span class="badge badge-inline">Verificato</span>' : ''}</div>
      </div>
    `;
  }
  document.addEventListener("DOMContentLoaded", renderSwipe);

  (function(){
    const area = $("#swipeArea");
    if (!area || !swipeCard) return;
    let startX=0, dx=0, dragging=false;
    function start(x){ dragging=true; startX=x; dx=0; swipeCard.style.transition=""; }
    function move(x){
      if(!dragging) return;
      dx = x - startX;
      swipeCard.style.transform = `translateX(${dx}px) rotate(${dx/20}deg)`;
      swipeCard.style.boxShadow = `0 10px 30px rgba(255,215,0,${Math.min(Math.abs(dx)/240, .35)})`;
    }
    function end(){
      if(!dragging) return; dragging=false;
      const TH = 120;
      if (dx > TH) { doLike(); }
      else if (dx < -TH) { doDislike(); }
      else {
        swipeCard.style.transition="transform .2s ease, box-shadow .2s ease";
        swipeCard.style.transform="translateX(0) rotate(0)";
        swipeCard.style.boxShadow="";
      }
    }
    area.addEventListener("touchstart", e=> start(e.touches[0].clientX), {passive:true});
    area.addEventListener("touchmove",  e=> move(e.touches[0].clientX),  {passive:true});
    area.addEventListener("touchend",   end, {passive:true});
    area.addEventListener("mousedown",  e=> start(e.clientX));
    window.addEventListener("mousemove", e=> move(e.clientX));
    window.addEventListener("mouseup",   end);
  })();

  $("#btnLike")?.addEventListener("click", doLike);
  $("#btnDislike")?.addEventListener("click", doDislike);

  function nextCard(){
    App.state.swipeIndex = (App.state.swipeIndex + 1) % App.state.dogs.length;
    renderSwipe();
  }

  function doLike(){
    navigator.vibrate?.(20);
    const isMatch = Math.random() < 1/3;
    if (isMatch){
      App.toast("È un match! 💛");
      showInterstitial("Videomatch");
    }
    animateHeart(true).then(nextCard);
  }
  function doDislike(){
    navigator.vibrate?.(10);
    animateHeart(false).then(nextCard);
  }
  function animateHeart(isGold){
    return new Promise(resolve=>{
      const burst = document.createElement("div");
      burst.style.cssText = `
        position:fixed; inset:0; display:flex; align-items:center; justify-content:center;
        pointer-events:none; z-index:9999; background:transparent; animation: fadeOut .6s ease forwards;
      `;
      burst.innerHTML = `<div style="font-size:96px; filter: drop-shadow(0 10px 40px rgba(255,215,0,.5));">${isGold ? "💛" : "🥲"}</div>`;
      document.body.appendChild(burst);
      setTimeout(()=> { burst.remove(); resolve(); }, 600);
    });
  }
  function showInterstitial(title="Videomatch"){
    const dlg = $("#rewardDialog") || document.createElement("dialog");
    if (!dlg.id) { dlg.id="rewardDialog"; document.body.appendChild(dlg); }
    dlg.innerHTML = `
      <div style="padding:18px;max-width:340px">
        <h3 style="margin:0 0 8px">${title}</h3>
        <p style="opacity:.85;margin:0 0 14px">Video pubblicitario…</p>
        <button class="btn btn-gold" id="vmok">Chiudi</button>
      </div>`;
    dlg.showModal();
    dlg.querySelector("#vmok").addEventListener("click", ()=> dlg.close(), {once:true});
  }

  /* =========================================================
     CHAT / SELFIE 24H / LIKES GATING
     ========================================================= */
  function openChat(d){
    const dlg = document.createElement("dialog");
    dlg.innerHTML = `
      <div style="padding:0; width:min(560px, 92vw); background:#0F0F14; border-radius:12px; overflow:hidden">
        <div style="padding:12px 14px; border-bottom:1px solid rgba(255,255,255,.08); display:flex; justify-content:space-between; align-items:center">
          <strong>Chat — ${d.name}</strong>
          <button class="btn btn-ghost" id="chatClose">✕</button>
        </div>
        <div id="chatMessages" style="height:320px; overflow:auto; padding:12px"></div>
        <form id="chatForm" style="display:flex; gap:8px; padding:12px; border-top:1px solid rgba(255,255,255,.08)">
          <input id="chatText" placeholder="Scrivi un messaggio…" style="flex:1; padding:10px; border-radius:10px; border:1px solid rgba(255,255,255,.12); background:#14141A; color:#fff" />
          <button class="btn btn-gold">Invia</button>
        </form>
      </div>`;
    document.body.appendChild(dlg);
    dlg.showModal();

    const msgs = dlg.querySelector("#chatMessages");
    function appendMessage(txt, me=false){
      const div = document.createElement("div");
      div.style.cssText="margin:8px 0; padding:8px 10px; border-radius:10px; max-width:80%";
      div.style.background = me ? "rgba(255,215,0,.12)" : "rgba(255,255,255,.07)";
      div.style.marginLeft = me ? "auto" : "0";
      div.textContent = txt;
      msgs.appendChild(div);
      msgs.scrollTop = msgs.scrollHeight;
    }

    dlg.querySelector("#chatClose").addEventListener("click", ()=>{ dlg.close(); dlg.remove(); });

    let firstSent = false;
    dlg.querySelector("#chatForm").addEventListener("submit", async (e)=>{
      e.preventDefault();
      const input = dlg.querySelector("#chatText");
      const text = input.value.trim();
      if (!text) return;

      if (!firstSent){
        await showReward("chat_first", "Guarda un breve video per inviare il primo messaggio");
        firstSent = true;
      }
      appendMessage(text, true);
      input.value = "";
      setTimeout(()=> appendMessage("🐾 Bau!", false), 700);
    });
  }

  async function unlockSelfie(){
    const until = Date.now() + 24*60*60*1000;
    await showReward("selfie", "Sblocca il selfie per 24 ore");
    storage.set(STORAGE_KEYS.selfieUnlock, until);
    App.toast("Selfie sbloccato per 24 ore");
  }

  const LIKES_KEY = STORAGE_KEYS.likesFree;
  if (storage.get(LIKES_KEY) == null) storage.set(LIKES_KEY, 3);

  async function openLikes(){
    let left = storage.get(LIKES_KEY, 0);
    if (left <= 0){
      await showReward("likes", "Guarda un video per sbloccare i like");
      storage.set(LIKES_KEY, 1);
      left = 1;
    } else {
      storage.set(LIKES_KEY, left - 1);
      left = left - 1;
    }
    const dlg = document.createElement("dialog");
    dlg.innerHTML = `
      <div style="padding:18px;max-width:420px">
        <h3 style="margin:0 0 8px">Like ricevuti</h3>
        <p style="opacity:.85">Like gratuiti rimasti: ${left}</p>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:10px">
          ${App.state.dogs.slice(0,6).map(d=>`<img src="${d.img}" alt="${d.name}" style="width:100%;height:90px;object-fit:cover;border-radius:10px">`).join("")}
        </div>
        <div style="margin-top:12px;display:flex;justify-content:flex-end">
          <button class="btn btn-gold" id="lkok">OK</button>
        </div>
      </div>`;
    document.body.appendChild(dlg); dlg.showModal();
    dlg.querySelector("#lkok").addEventListener("click", ()=>{ dlg.close(); dlg.remove(); }, {once:true});
  }

  function showReward(name, msg){
    return new Promise(resolve=>{
      const dlg = $("#rewardDialog") || document.createElement("dialog");
      if (!dlg.id){ dlg.id="rewardDialog"; document.body.appendChild(dlg); }
      dlg.innerHTML = `
        <div style="padding:18px;max-width:360px">
          <h3 style="margin:0 0 8px">Reward</h3>
          <p style="opacity:.85;margin:0 0 14px">${msg || ""}</p>
          <button class="btn btn-gold" id="rwok">Guarda</button>
        </div>`;
      dlg.showModal();
      dlg.querySelector("#rwok").addEventListener("click", ()=>{ dlg.close(); resolve(); }, {once:true});
    });
  }

  /* =========================================================
     RICERCA / AUTOCOMPLETE / PLACES / PLUS
     ========================================================= */
  const BREEDS = [
    "Labrador", "Golden Retriever", "Barboncino", "Bulldog", "Beagle", "Chihuahua",
    "Pastore Tedesco", "Jack Russell", "Cocker Spaniel", "Carlino", "Maltese",
    "Border Collie", "Husky", "Bassotto", "Dalmata", "Pitbull", "Shiba Inu",
    "Rottweiler", "Terranova", "Samoyed"
  ].sort();
  App.state.breeds = BREEDS;

  const breedInput  = $("#breed");
  const breedSuggest= $("#breedSuggest");

  breedInput?.addEventListener("input", ()=>{
    const q = (breedInput.value||"").trim().toLowerCase();
    if (!q) { breedSuggest.innerHTML=""; breedSuggest.classList.remove("show"); return; }
    const matches = BREEDS.filter(b=> b.toLowerCase().startsWith(q)).slice(0,8);
    if (!matches.length){ breedSuggest.innerHTML=""; breedSuggest.classList.remove("show"); return; }
    breedSuggest.innerHTML = matches.map(b=>`<button class="sugg" type="button">${b}</button>`).join("");
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
    const breed   = ($("#breed").value||"").trim().toLowerCase();
    const sex     = $("#sex")?.value || "";
    const verified= $("#verified")?.checked || false;

    let list = App.state.dogs.slice();
    if (breed) list = list.filter(d=> d.breed.toLowerCase().startsWith(breed));
    if (sex)   list = list.filter(d=> d.sex === sex);
    if (verified) list = list.filter(d=> d.verified);

    renderNearby(list);
    App.show("nearby");
  });
  $("#filtersForm")?.addEventListener("reset", ()=> setTimeout(()=> renderNearby(App.state.dogs), 0));

  $("#btnBuyPlus")?.addEventListener("click", ()=>{
    if (confirm(App.state.lang==="it"
      ? `Attivare Plutoo Gold e rimuovere tutte le pubblicità?\n${GOLD_PRICE}`
      : `Activate Plutoo Gold and remove all ads?\n${GOLD_PRICE}`)) {
      App.state.hasGold = true;
      storage.set(STORAGE_KEYS.gold, true);
      App.toast("Plutoo Gold attivato");
    }
  });

  $$(".dropdown-item").forEach(btn=>{
    btn.addEventListener("click", async ()=>{
      await showReward("places", "");
      const it = btn.dataset.service;
      const q  = (App.state.lang==="it") ? it : (SERVICES_EN[it] || it);
      const url = (App.state.lang==="it")
        ? `https://www.google.com/maps/search/${encodeURIComponent(q)}`
        : `https://www.google.com/maps/search/${encodeURIComponent(q+" near me")}`;
      window.open(url, "_blank", "noopener");
    });
  });

  // Sponsor
  $("#sponsorLink")?.addEventListener("click", (e)=>{
    // opzionale: reward prima dello sponsor
    // e.preventDefault(); showReward("sponsor","").then(()=> window.open("https://www.fido.it/","_blank","noopener"));
  });

  // prima render
  document.addEventListener("DOMContentLoaded", ()=> {
    if (qs('#view-nearby') && qs('#view-nearby').hidden === false) renderNearby();
  });

})(); // <<< fine IIFE — nessun codice dopo questa riga
