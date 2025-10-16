/* =========================================================
   Plutoo — Gold Edition (app.js)
   File completo ed esteso. Funziona con index/style dello ZIP.
   Questo blocco: namespace, stato, storage, i18n, router base.
   ========================================================= */

(function(){
  "use strict";
   /* ============ Plutoo — navigazione & stato postlogin ============ */
const PL_STATE_KEY = 'pl_postlogin';
let navStack = [];

const qs  = sel => document.querySelector(sel);
const qsa = sel => Array.from(document.querySelectorAll(sel));

const show = el => { if (!el) return; el.classList.remove('hidden'); el.hidden = false; };
const hide = el => { if (!el) return; el.classList.add('hidden'); el.hidden = true; };

const setPostlogin = v => localStorage.setItem(PL_STATE_KEY, v ? '1' : '0');
const isPostlogin  = () => localStorage.getItem(PL_STATE_KEY) === '1';

/* mostra/nasconde le chip centrali della topbar */
function showChips(visible){
  qsa('.topbar-center .chip').forEach(btn => visible ? show(btn) : hide(btn));
}

/* cambia vista gestendo lo stack per il tasto ← */
function goTo(viewId){
  const current = qs('.view.view-active');
  if (current && current.id !== `view-${viewId}`) {
    navStack.push(current.id);
    current.classList.remove('view-active');
    current.hidden = true;
  }
  const next = qs(`#view-${viewId}`);
  if (next) {
    next.hidden = false;
    next.classList.add('view-active');
  }
  updateBackButton();
}

/* mostra/nasconde il tasto ← in base al contesto */
function updateBackButton(){
  const btnBack = qs('#btnBack');
  const atHome  = qs('#view-home')?.classList.contains('view-active');
  if (!isPostlogin() || atHome || navStack.length === 0) hide(btnBack);
  else show(btnBack);
}

  /* -------------------- NAMESPACE -------------------- */
  const App = window.Plutoo = window.Plutoo || {};

  /* -------------------- COSTANTI --------------------- */
  const GOLD_PRICE = "€39,90/anno";
  const STORAGE_KEYS = {
    lang: "pl_lang",
    user: "pl_user",
    likesFree: "pl_free_likes_left",
    gold: "pl_has_gold",
    selfieUnlock: "pl_selfie_unlock_until", // timestamp ms
    seenDogs: "pl_seen_dogs",               // Set IDs per swipe
  };

  const SERVICES_EN = {
    "veterinari": "veterinarians",
    "toelettature": "groomers",
    "negozi": "pet shops",
    "parchi": "dog parks",
    "addestratori": "dog trainers",
    "canili": "animal shelters",
  };

  /* -------------------- STATO RUNTIME ---------------- */
  App.state = {
    view: "home",
    user: null,                // {id,name,city,...}
    hasGold: false,
    likesFreeLeft: 3,
    lang: "it",
    dogs: [],                  // dataset card
    breeds: [],                // per autocomplete
    swipeIndex: 0,
    matches: [],               // array {idA, idB, ts}
    chat: {},                  // chat by matchId
    geo: null,                 // {lat,lng,acc}
  };

  /* -------------------- STORAGE HELPERS -------------- */
  const storage = {
    get(k, fallback=null){
      try{ const v = localStorage.getItem(k); return (v==null?fallback:JSON.parse(v)); }
      catch(e){ return fallback; }
    },
    set(k, v){ try{ localStorage.setItem(k, JSON.stringify(v)); } catch(e){} },
    remove(k){ try{ localStorage.removeItem(k); } catch(e){} }
  };

  /* -------------------- I18N COMPLETO ---------------- */
  const I18N = {
    it:{
      tab_love:"Amore 🥲💛", tab_play:"Giochiamo insieme 🥲🐕", tab_plus:"Plus ⭐",
      tab_search:"Ricerca 🔍", tab_places:"Luoghi PET 🐾", tab_nearby:"Vicino a te",
      login:"Login", signup:"Registrati", logout:"Esci",
      enter:"ENTRA", sponsor_badge:"Sponsor ufficiale", sponsor_title:"Fido",
      sponsor_sub:"Il gelato per i nostri amici a quattro zampe",
      sponsor_url:"https://www.fido.it/",
      ethic_cta:"Non abbandonare mai i tuoi amici 🐾 (canili vicino a me)",
      f_breed:"Razza", f_age:"Età", f_weight:"Peso", f_height:"Altezza", f_sex:"Sesso",
      any:"Qualsiasi", male:"Maschio", female:"Femmina", distance:"Distanza",
      f_verified:"Badge verificato Gold", f_mating:"Disponibile accoppiamento",
      f_gene:"Genealogia (Gold)", reset:"Reset", apply:"Applica",
      plus_1:"Rimuove tutti gli annunci", plus_2:"Filtri Gold e funzioni Premium",
      plus_3:"Supporto prioritario", plus_buy:`Attiva ${GOLD_PRICE}`,
      likes_title:"Like ricevuti", likes_free_left:"Like gratuiti rimasti: {n}",
      likes_unlock:"Guarda un video per sbloccare altri like",
      selfie_locked:"Selfie sfocato — sbloccalo con un reward video (24h)",
      selfie_unlocked:"Selfie sbloccato (24h)", docs_title:"Documenti",
      doc_vacc:"Vaccini", doc_ped:"Pedigree", doc_chip:"Microchip",
      verified_gold:"Verificato Gold", open_chat:"Apri chat", first_msg_gate:"Guarda un video per inviare il primo messaggio",
      svc_vet:"Veterinari", svc_groom:"Toelettature", svc_shop:"Negozi",
      svc_parks:"Parchi", svc_train:"Addestratori", svc_shelter:"Canili",
      gold_needed:"Richiede Plutoo Gold",
      home_title:"Plutoo — Home",
      match_toast:"È un Match! 💛",
    },
    en:{
      tab_love:"Love 🥲💛", tab_play:"Play together 🥲🐕", tab_plus:"Gold ⭐",
      tab_search:"Search 🔍", tab_places:"PET places 🐾", tab_nearby:"Nearby",
      login:"Login", signup:"Sign up", logout:"Logout",
      enter:"ENTER", sponsor_badge:"Official sponsor", sponsor_title:"Fido",
      sponsor_sub:"Ice cream for our four-legged friends",
      sponsor_url:"https://www.fido.it/",
      ethic_cta:"Never abandon your friends 🐾 (shelters near me)",
      f_breed:"Breed", f_age:"Age", f_weight:"Weight", f_height:"Height", f_sex:"Sex",
      any:"Any", male:"Male", female:"Female", distance:"Distance",
      f_verified:"Gold verified badge", f_mating:"Available for mating",
      f_gene:"Pedigree (Gold)", reset:"Reset", apply:"Apply",
      plus_1:"Removes all ads", plus_2:"Gold filters & Premium features",
      plus_3:"Priority support", plus_buy:`Activate ${GOLD_PRICE}`,
      likes_title:"Likes received", likes_free_left:"Free likes left: {n}",
      likes_unlock:"Watch a video to unlock more likes",
      selfie_locked:"Blurred selfie — unlock with a reward video (24h)",
      selfie_unlocked:"Selfie unlocked (24h)", docs_title:"Documents",
      doc_vacc:"Vaccines", doc_ped:"Pedigree", doc_chip:"Microchip",
      verified_gold:"Gold Verified", open_chat:"Open chat", first_msg_gate:"Watch a video to send the first message",
      svc_vet:"Veterinarians", svc_groom:"Groomers", svc_shop:"Pet shops",
      svc_parks:"Dog parks", svc_train:"Dog trainers", svc_shelter:"Animal shelters",
      gold_needed:"Requires Plutoo Gold",
      home_title:"Plutoo — Home",
      match_toast:"It's a Match! 💛",
    }
  };

  function getLang(){
    const saved = storage.get(STORAGE_KEYS.lang);
    if (saved) return saved;
    return (navigator.language||"").toLowerCase().startsWith("it") ? "it" : "en";
  }

  function t(key, vars={}){
    const lang = App.state.lang;
    const str = (I18N[lang] && I18N[lang][key]) || key;
    return str.replace(/\{(\w+)\}/g, (_,k)=> vars[k] ?? "");
  }

  function applyI18n(){
    document.querySelectorAll("[data-i18n]").forEach(el=>{
      const key = el.getAttribute("data-i18n");
      if (I18N[App.state.lang] && I18N[App.state.lang][key]){
        el.textContent = I18N[App.state.lang][key];
      }
    });
    document.title = t("home_title");
  }

  /* -------------------- ROUTER BASE ------------------ */
  function $(sel, root=document){ return root.querySelector(sel); }
  function $$(sel, root=document){ return Array.from(root.querySelectorAll(sel)); }

  App.show = function(view){
    App.state.view = view;
    $$(".view").forEach(v=>{
      if (v.id === "view-"+view){ v.classList.add("view-active"); v.removeAttribute("hidden"); }
      else { v.classList.remove("view-active"); v.setAttribute("hidden",""); }
    });
    window.scrollTo({top:0, behavior:"smooth"});
    if (view === "nearby") renderNearby();
  };

  document.addEventListener("click", (e)=>{
    const b = e.target.closest("[data-view]");
    if (!b) return;
    const view = b.dataset.view;
    if (view){ e.preventDefault(); App.show(view); }
  });

  /* -------------------- INIT ------------------------- */
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

  // eventi bandiere
  $("#lang-it")?.addEventListener("click", ()=>saveLang("it"));
  $("#lang-en")?.addEventListener("click", ()=>saveLang("en"));

  // login/logout dummy (non invade la tua auth reale)
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

  function showNearbyTab(show){
    const nearTab = $("#tab-nearby");
    if (!nearTab) return;
    nearTab.style.display = show ? "" : "none";
  }

  /* -------------------- UI TOAST --------------------- */
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

  /* -------------------- LIFECYCLE -------------------- */
  document.addEventListener("DOMContentLoaded", ()=>{
    initStateFromStorage();
    applyI18n();
    showNearbyTab(!!App.state.user);
    // default: home
    App.show("home");
  });

  /* esposizione alcune utilità */
  App.t = t;
  App.storage = storage;
  App.toast = toast;

  /* il resto delle funzioni (swipe, nearby, profili, chat, reward, places)
     continua nei blocchi successivi */
 /* =========================================================
     BLOCCO 2/6 — Dataset cani, Nearby grid 2×2, Profilo, Geo
     ========================================================= */

  /* -------------------- DATASET CANI -------------------- */
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

  /* -------------------- RENDER NEARBY ------------------- */
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
          <div>${d.km!=null ? (d.km+" km") : ""}${d.verified ? ' · <span class="badge badge-inline">'+App.t("verified_gold")+'</span>' : ""}</div>
        </div>
      `;
      card.addEventListener("click", ()=> openProfile(d.id));
      grid.appendChild(card);
    });
  }

  /* -------------------- PROFILO (SHEET) ------------------ */
  function openProfile(id){
    const d = App.state.dogs.find(x=>x.id===id);
    if (!d) return;
    const sheet = $("#profilePage");
    $(".sheet-inner .profile-name", sheet)?.remove; // no-op, placeholder

    $("#profileMainPhoto").innerHTML = `<img src="${d.img}" alt="${d.name}" style="width:100%;height:100%;object-fit:cover;border-radius:12px">`;
    $("#profileName").textContent = d.name;
    $("#profileInfo").textContent = `${d.breed}, ${d.age} · ${d.sex==="male"?"♂":"♀"}${d.km!=null?(" · "+d.km+" km"):""}`;
    $("#badgeVerified").hidden = !d.verified;

    // documenti (sezione semplice sotto info)
    let docHTML = `<div class="profile-docs"><strong>${App.t("docs_title")}:</strong> `;
    const docs = [];
    if (d.docs?.vacc) docs.push(App.t("doc_vacc"));
    if (d.docs?.ped)  docs.push(App.t("doc_ped"));
    if (d.docs?.chip) docs.push(App.t("doc_chip"));
    docHTML += docs.join(" · ") + `</div>`;

    // selfie blur (mock: badge se bloccato)
    const unlockedUntil = App.storage.get(STORAGE_KEYS.selfieUnlock, 0);
    const now = Date.now();
    const unlocked = unlockedUntil && now < unlockedUntil;
    const selfieTip = unlocked ? App.t("selfie_unlocked") : App.t("selfie_locked");

    $("#profileInfo").insertAdjacentHTML("beforeend", docHTML + `<div style="opacity:.85;margin-top:6px">${selfieTip}</div>`);

    sheet.hidden = false;
    sheet.classList.add("show");
  }

  $("#btnCloseProfile")?.addEventListener("click", ()=>{
    const sheet = $("#profilePage");
    sheet.hidden = true;
    sheet.classList.remove("show");
  });

  /* -------------------- SPONSOR & ETICA ------------------ */
  function openMaps(query){
    window.open("https://www.google.com/maps/search/"+encodeURIComponent(query), "_blank", "noopener");
  }

  $("#sponsorFido")?.addEventListener("click", ()=>{
    window.open("https://www.fido.it/", "_blank", "noopener");
  });

  $$(".sponsor-inline").forEach(el=>{
    el.addEventListener("click", ()=> window.open("https://www.fido.it/", "_blank", "noopener"));
  });

  $$(".ethic-cta").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const q = App.state.lang==="it" ? "canili vicino a me" : "animal shelters near me";
      openMaps(q);
    });
  });

  /* -------------------- GEOLOCALIZZAZIONE ---------------- */
  function initGeolocation(){
    if (!("geolocation" in navigator)){
      fallbackDistances();
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos=>{
        App.state.geo = { lat:pos.coords.latitude, lng:pos.coords.longitude, acc:pos.coords.accuracy };
        // se avessimo coordinate reali dei cani, calcoleremmo km; per ora mock coerente
        App.state.dogs = App.state.dogs.map(d=> ({...d, km: d.km ?? (1 + Math.floor(Math.random()*12))}));
        renderNearby();
      },
      err=>{
        console.warn("Geo denied:", err?.message||err);
        fallbackDistances();
      },
      { enableHighAccuracy:true, timeout:10000, maximumAge:60000 }
    );
  }

  function fallbackDistances(){
    App.state.dogs = App.state.dogs.map(d=> ({...d, km: d.km ?? (3 + Math.floor(Math.random()*10))}));
    renderNearby();
  }

  // avvio geo poco dopo il boot
  document.addEventListener("DOMContentLoaded", ()=> setTimeout(initGeolocation, 400));

  // ENTRA porta a Nearby con grid render
  $("#btnEnter")?.addEventListener("click", (e)=>{ e.preventDefault(); App.show("nearby"); });

  // se l’utente è loggato, il tab “Vicino a te” è già mostrato (gestito nel blocco 1)
  // qui assicuriamo che la griglia appaia anche se l’utente entra da router
  if (App.state.view === "nearby") renderNearby();

  /* -------------------------------------------------------
     Fine BLOCCO 2/6
     (Swipe/Match, Chat/Reward/Likes, Ricerca/Autocomplete,
      Plus/Abbonamento e Luoghi PET nei blocchi successivi)
     ------------------------------------------------------- */
 /* =========================================================
     BLOCCO 3/6 — Swipe singola card, Like/Dislike, Match + interstitial
     ========================================================= */

  /* --------- Render carta swipe --------- */
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
        <div>${d.verified ? '<span class="badge badge-inline">'+App.t('verified_gold')+'</span>' : ''}</div>
      </div>
    `;
  }
  document.addEventListener("DOMContentLoaded", renderSwipe);

  /* --------- Effetto swipe (touch/mouse) --------- */
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
      if(!dragging) return;
      dragging=false;
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

  /* --------- Like / Dislike --------- */
  $("#btnLike")?.addEventListener("click", doLike);
  $("#btnDislike")?.addEventListener("click", doDislike);

  function nextCard(){
    App.state.swipeIndex = (App.state.swipeIndex + 1) % App.state.dogs.length;
    renderSwipe();
  }

  function doLike(){
    navigator.vibrate?.(20);
    // match mock: 1 su 3
    const isMatch = Math.random() < 1/3;
    if (isMatch){
      App.toast(App.t("match_toast"));
      showInterstitial("Videomatch"); // interstitial dopo ogni match
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
        pointer-events:none; z-index:9999; background:transparent;
        animation: fadeOut .6s ease forwards;
      `;
      burst.innerHTML = `<div style="
        font-size:96px; filter: drop-shadow(0 10px 40px rgba(255,215,0,.5));
      ">${isGold ? "💛" : "🥲"}</div>`;
      document.body.appendChild(burst);
      setTimeout(()=> { burst.remove(); resolve(); }, 600);
    });
  }

  /* --------- Interstitial mock --------- */
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
     BLOCCO 4/6 — Chat (primo messaggio reward), Selfie 24h, Likes gating
     ========================================================= */

  /* --------- Chat minimale (dialog dinamico) --------- */
  function openChat(dog){
    const dlg = document.createElement("dialog");
    dlg.innerHTML = `
      <div style="padding:0; width:min(560px, 92vw); background:#0F0F14; border-radius:12px; overflow:hidden">
        <div style="padding:12px 14px; border-bottom:1px solid rgba(255,255,255,.08); display:flex; justify-content:space-between; align-items:center">
          <strong>Chat — ${dog.name}</strong>
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

      // reward al primo messaggio
      if (!firstSent){
        await showReward("chat_first", App.t("first_msg_gate"));
        firstSent = true;
      }
      appendMessage(text, true);
      input.value = "";
      setTimeout(()=> appendMessage("🐾 Bau!", false), 700);
    });
  }

  // collega la chat al profilo (se hai un pulsante "Apri chat", id optional #btnOpenChat)
  document.getElementById("btnOpenChat")?.addEventListener("click", ()=>{
    const d = currentDog(); if (d) openChat(d);
  });

  /* --------- Selfie unlock 24h --------- */
  async function unlockSelfie(){
    const until = Date.now() + 24*60*60*1000;
    await showReward("selfie", App.t("selfie_locked"));
    storage.set(STORAGE_KEYS.selfieUnlock, until);
    App.toast(App.t("selfie_unlocked"));
  }
  // se metti un pulsante nel profilo: <button id="btnUnlockSelfie">Sblocca selfie</button>
  document.getElementById("btnUnlockSelfie")?.addEventListener("click", unlockSelfie);

  /* --------- Likes ricevuti: 3 gratis, poi video --------- */
  const LIKES_KEY = STORAGE_KEYS.likesFree;
  if (storage.get(LIKES_KEY) == null) storage.set(LIKES_KEY, 3);

  async function openLikes(){
    let left = storage.get(LIKES_KEY, 0);
    if (left <= 0){
      await showReward("likes", App.t("likes_unlock"));
      storage.set(LIKES_KEY, 1);
      left = 1;
    } else {
      storage.set(LIKES_KEY, left - 1);
      left = left - 1;
    }
    const dlg = document.createElement("dialog");
    dlg.innerHTML = `
      <div style="padding:18px;max-width:420px">
        <h3 style="margin:0 0 8px">${App.t("likes_title")}</h3>
        <p style="opacity:.85">${App.t("likes_free_left",{n:left})}</p>
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
  // Se hai un trigger in UI: <button id="btnViewLikes">Like ricevuti</button>
  document.getElementById("btnViewLikes")?.addEventListener("click", openLikes);

  /* --------- Helper Reward generico --------- */
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
     BLOCCO 5/6 — Ricerca personalizzata + Autocomplete razze + Filtri Gold
     ========================================================= */

  /* --------- Dataset razze (prefisso) --------- */
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

  /* --------- Applica filtri --------- */
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

  $("#filtersForm")?.addEventListener("reset", ()=>{
    setTimeout(()=> { renderNearby(App.state.dogs); }, 0);
  });
   /* =========================================================
     BLOCCO 6/6 — Plus (mock), Luoghi PET reward→Maps, UX & final
     ========================================================= */

  /* --------- Plus (mock abbonamento) --------- */
  $("#btnBuyPlus")?.addEventListener("click", ()=>{
    if (confirm(App.state.lang==="it"
      ? `Attivare Plutoo Gold e rimuovere tutte le pubblicità?\n${GOLD_PRICE}`
      : `Activate Plutoo Gold and remove all ads?\n${GOLD_PRICE}`)) {
      App.state.hasGold = true;
      storage.set(STORAGE_KEYS.gold, true);
      App.toast("Plutoo Gold attivato");
    }
  });

  /* --------- Luoghi PET: reward → Google Maps (localizzato) --------- */
  $$(".dropdown-item").forEach(btn=>{
    btn.addEventListener("click", async ()=>{
      await showReward("places", ""); // gating
      const it = btn.dataset.service;
      const q  = (App.state.lang==="it") ? it : (SERVICES_EN[it] || it);
      window.open("https://www.google.com/maps/search/"+encodeURIComponent(q+" near me"), "_blank", "noopener");
    });
  });

  /* --------- UX micro (già in parte nel blocco 3) --------- */
  // blocco scroll durante swipe è nel blocco 3
  // evidenzia tab attivo
  document.addEventListener("click", (e)=>{
    const b = e.target.closest("[data-view]");
    if (!b) return;
    $$(".chip").forEach(c=> c.classList.toggle("active", c===b));
  });

  // fine namespace IIFE
})();
document.addEventListener('DOMContentLoaded', () => {
  // 1) Stato iniziale: chip visibili solo se già "dentro"
  if (isPostlogin()) {
    showChips(true);
    // atterraggio come nello ZIP: "Vicino a te"
    goTo('nearby');
  } else {
    showChips(false);
    // assicura che la Home sia attiva
    qsa('.view').forEach(v => { v.hidden = true; v.classList.remove('view-active'); });
    const home = qs('#view-home'); if (home){ home.hidden = false; home.classList.add('view-active'); }
  }
  updateBackButton();

  // 2) Chip di navigazione (centrali)
  qsa('.topbar-center .chip').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-view');
      if (target) goTo(target);
    });
  });

  // 3) ENTRA / LOGIN → entra, mostra chip, vai su "Vicino a te"
  ['#btnEnter', '#btnLogin'].forEach(sel => {
    const b = qs(sel);
    if (b) b.addEventListener('click', () => {
      setPostlogin(true);
      showChips(true);
      goTo('nearby');
    });
  });

  // 4) Bottone ←
  const back = qs('#btnBack');
  if (back) back.addEventListener('click', () => {
    if (navStack.length) {
      const prevId = navStack.pop();
      const current = qs('.view.view-active');
      if (current) { current.classList.remove('view-active'); current.hidden = true; }
      const prev = qs('#' + prevId);
      if (prev) { prev.hidden = false; prev.classList.add('view-active'); }
    } else {
      // fallback: torna a Home
      qsa('.view').forEach(v => { v.hidden = true; v.classList.remove('view-active'); });
      const home = qs('#view-home'); if (home){ home.hidden = false; home.classList.add('view-active'); }
    }
    updateBackButton();
  });

  // 5) Back hardware / popstate → simula il click su ←
  window.addEventListener('popstate', () => {
    qs('#btnBack')?.click();
  });
});
