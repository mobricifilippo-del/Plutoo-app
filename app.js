/* =====================================================
   PLUTOO APP – VIOLET EDITION
   Tutta la logica dell'app in modo modulare.
   ===================================================== */

/* ----------------------- Utils ----------------------- */
const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
const on = (el, ev, fn, opts) => el && el.addEventListener(ev, fn, opts);
const sleep = (ms) => new Promise(r=>setTimeout(r, ms));
const clamp = (v,min,max)=>Math.max(min,Math.min(max,v));
const html = String.raw; // per template literal leggibile

/* Debounce per input */
function debounce(fn, wait=250){
  let t; return (...args)=>{ clearTimeout(t); t=setTimeout(()=>fn(...args), wait); };
}

/* ----------------------- Stato ----------------------- */
const State = {
  currentTab: 'nearby',       // nearby | love | play
  lang: 'it',                 // it | en
  plus: false,                // gating filtri avanzati
  dogs: [],                   // dataset mock
  filters: { breed:'', sex:'', badge:'' },
  geo: null,                  // {lat, lng}
};

/* ----------------------- Dataset mock ----------------------- */
const DOGS = [
  {id:1, name:'Luna',  breed:'Labrador', sex:'Femmina', km:1.2, img:'dog1.jpg', badge:true},
  {id:2, name:'Rocky', breed:'Beagle',   sex:'Maschio', km:2.5, img:'dog2.jpg', badge:false},
  {id:3, name:'Maya',  breed:'Husky',    sex:'Femmina', km:3.1, img:'dog3.jpg', badge:true},
  {id:4, name:'Otto',  breed:'Maltese',  sex:'Maschio', km:0.9, img:'dog4.jpg', badge:false},
  {id:5, name:'Kira',  breed:'Shiba Inu',sex:'Femmina', km:4.8, img:'dog5.jpg', badge:true},
  {id:6, name:'Bobby', breed:'Cocker',   sex:'Maschio', km:1.9, img:'dog6.jpg', badge:false},
];

/* Razze per suggerimenti */
const BREEDS = [
  "Akita","Barboncino","Beagle","Border Collie","Bulldog",
  "Chihuahua","Cocker","Dalmata","Dobermann","Husky",
  "Labrador","Maltese","Pastore Tedesco","Shiba Inu","Shih Tzu"
];

/* ----------------------- Elementi DOM ----------------------- */
// schermate principali
const homeScreen = $('#homeScreen');
const appScreen  = $('#appScreen');

// home
const heroLogo = $('#heroLogo');
const btnEnter = $('#btnEnter');
const btnEnterLink = $('#btnEnterLink');
const ethicsButtonHome = $('#ethicsButtonHome');
const sponsorLinkHome  = $('#sponsorLinkHome');

// topbar app
const tabNearby = $('#tabNearby');
const tabLove   = $('#tabLove');
const tabPlay   = $('#tabPlay');
const btnSearch = $('#btnSearch');
const tabPlus   = $('#tabPlus');

// luoghi PET
const luoghiWrap = $('#luoghiTabWrap');
const luoghiBtn  = $('#tabLuoghi');
const luoghiMenu = $('#luoghiMenu');

// viste
const viewNearby = $('#viewNearby');
const viewLove   = $('#viewLove');
const viewPlay   = $('#viewPlay');

const nearbyGrid = $('#nearbyGrid');
const loveDeck   = $('#loveDeck');
const playDeck   = $('#playDeck');

// ricerca overlay
const panelSearch   = $('#panelSearch');
const btnCloseSearch= $('#btnCloseSearch');
const breedInput    = $('#breed');
const suggestionsEl = $('#suggestions');
const sexSelect     = $('#sex');
const badgeSelect   = $('#badge');
const btnApplyFilters = $('#btnApplyFilters');
const btnResetFilters  = $('#btnResetFilters');

// sponsor in app
const sponsorLinkApp = $('#sponsorLinkApp');

/* ---------------------- Router / UI ---------------------- */
function showHome(){
  appScreen.classList.add('hidden');
  homeScreen.classList.remove('hidden');
  window.scrollTo(0,0);
}

function showApp(){
  homeScreen.classList.add('hidden');
  appScreen.classList.remove('hidden');
  window.scrollTo(0,0);
}

function setActiveTab(name){
  State.currentTab = name;

  // attiva/disattiva bottoni
  [tabNearby,tabLove,tabPlay].forEach(b=>b && b.classList.remove('active'));
  if(name==='nearby') tabNearby?.classList.add('active');
  if(name==='love')   tabLove?.classList.add('active');
  if(name==='play')   tabPlay?.classList.add('active');

  // mostra vista
  [viewNearby,viewLove,viewPlay].forEach(v=>v && v.classList.remove('active'));
  if(name==='nearby') viewNearby?.classList.add('active');
  if(name==='love')   viewLove?.classList.add('active');
  if(name==='play')   viewPlay?.classList.add('active');

  // render dedicato
  if(name==='nearby') renderNearby();
  if(name==='love')   renderDeck(loveDeck);
  if(name==='play')   renderDeck(playDeck);
}

/* ------------------ HOME: interazioni ------------------ */
on(btnEnter,'click', async ()=>{
  heroLogo.classList.add('gold-glow'); // (viola adesso)
  await sleep(950); // animazione un po' più lunga
  showApp();
  setActiveTab('nearby');
});
on(btnEnterLink,'click', e=>{ e.preventDefault(); btnEnter.click(); });

on(ethicsButtonHome,'click', ()=>{
  const q = encodeURIComponent('Canili vicino a me');
  window.open(`https://www.google.com/maps/search/${q}`,'_blank');
});
on(sponsorLinkHome,'click', ()=>{/* solo tracking se serve */});

/* ------------------ TOPBAR: tabs & plus ------------------ */
on(tabNearby, 'click', ()=>setActiveTab('nearby'));
on(tabLove,   'click', ()=>setActiveTab('love'));
on(tabPlay,   'click', ()=>setActiveTab('play'));

on(tabPlus, 'click', ()=>{
  State.plus = !State.plus;
  alert(State.plus ? 'Plutoo Plus attivato (demo).' : 'Plutoo Plus disattivato (demo).');
});

/* ------------------ Dropdown Luoghi PET ------------------ */
on(luoghiBtn,'click', ()=>{
  const exp = luoghiWrap.getAttribute('aria-expanded')==='true';
  luoghiWrap.setAttribute('aria-expanded', String(!exp));
});
document.addEventListener('click', (e)=>{
  if(!luoghiWrap) return;
  if(!luoghiWrap.contains(e.target)) luoghiWrap.setAttribute('aria-expanded','false');
});
on(luoghiMenu, 'click', (e)=>{
  const item = e.target.closest('.menu-item'); if(!item) return;
  const q = encodeURIComponent(item.dataset.map || 'Servizi per animali vicino a me');
  window.open(`https://www.google.com/maps/search/${q}`, '_blank');
  luoghiWrap.setAttribute('aria-expanded','false');
});

/* ------------------ Ricerca personalizzata ------------------ */
on(btnSearch,'click', ()=>{
  panelSearch.setAttribute('aria-hidden','false');
  btnSearch.setAttribute('aria-expanded','true');
});
on(btnCloseSearch,'click', ()=>{
  panelSearch.setAttribute('aria-hidden','true');
  btnSearch.setAttribute('aria-expanded','false');
});

on(btnApplyFilters,'click', ()=>{
  State.filters = {
    breed:  (breedInput.value||'').trim(),
    sex:    sexSelect.value||'',
    badge:  badgeSelect.value||''
  };
  // i filtri avanzati sarebbero dietro Plus (mock)
  renderNearby();
  panelSearch.setAttribute('aria-hidden','true');
  btnSearch.setAttribute('aria-expanded','false');
});
on(btnResetFilters,'click', ()=>{
  breedInput.value=''; sexSelect.value=''; badgeSelect.value='';
  State.filters = {breed:'',sex:'',badge:''};
  renderNearby();
});

/* Suggerimenti razze (startsWith + ord. alfabetico) */
on(breedInput,'input', debounce(()=>{
  const v = (breedInput.value||'').trim().toLowerCase();
  const items = v ? BREEDS.filter(b => b.toLowerCase().startsWith(v)).sort() : [];
  suggestionsEl.innerHTML = items.map(b=>`<div class="item" role="option">${b}</div>`).join('');
  suggestionsEl.classList.toggle('show', items.length>0);
}, 120));
on(suggestionsEl,'click', e=>{
  const it = e.target.closest('.item'); if(!it) return;
  breedInput.value = it.textContent; suggestionsEl.classList.remove('show');
});

/* ------------------ Render: Vicino a te ------------------ */
function dogCard(d){
  return html`
  <article class="card" data-id="${d.id}" tabindex="0">
    <img class="card-img" src="${d.img}" alt="${d.name}" loading="lazy"/>
    <div class="card-info">
      <h3>${d.name}</h3>
      <p class="meta">${d.breed} · ${d.sex} · ${d.km}km</p>
    </div>
    <div class="card-actions">
      <div class="round" data-act="smile" title="Saluta">😊</div>
      <div class="round" data-act="like"  title="Mi piace">💜</div>
    </div>
  </article>`;
}

function applyFilters(list){
  const f = State.filters;
  return list.filter(d=>{
    if(f.breed && !d.breed.toLowerCase().startsWith(f.breed.toLowerCase())) return false;
    if(f.sex && d.sex.toLowerCase() !== (f.sex==='male'?'maschio':'femmina')) return false;
    if(f.badge){
      const need = f.badge==='yes';
      if(Boolean(d.badge)!==need) return false;
    }
    return true;
  });
}

function renderNearby(){
  const data = applyFilters(DOGS);
  nearbyGrid.innerHTML = data.map(dogCard).join('');
}

/* Click card → profilo (mock, pagina dedicata verrà dopo) */
on(nearbyGrid, 'click', e=>{
  const card = e.target.closest('.card'); if(!card) return;
  const d = DOGS.find(x=>x.id == card.dataset.id);
  if(!d) return;
  alert(`Apri profilo: ${d.name}\n(la pagina profilo dedicata verrà collegata qui)`);
});

/* ------------------ Render: Deck (Love/Play) ------------------ */
function renderDeck(container){
  const d = DOGS[Math.floor(Math.random()*DOGS.length)];
  container.innerHTML = dogCard(d).replace('card"', 'card love-card"');
  enableSwipe(container);
}

/* Swipe che muove SOLO la card (pagina ferma) */
function enableSwipe(container){
  const card = container.querySelector('.love-card');
  if(!card) return;

  let startX=0, dx=0, dragging=false;

  function onStart(ev){
    dragging = true;
    const t = ev.touches? ev.touches[0] : ev;
    startX = t.clientX; dx=0;
    // impedisce lo scroll pagina durante il drag
    document.body.style.overflow='hidden';
    card.style.transition='none';
  }
  function onMove(ev){
    if(!dragging) return;
    const t = ev.touches? ev.touches[0] : ev;
    dx = t.clientX - startX;
    if(ev.cancelable) ev.preventDefault();
    card.style.transform = `translateX(${dx}px) rotate(${dx/25}deg)`;
  }
  function onEnd(){
    if(!dragging) return;
    dragging=false;
    document.body.style.overflow='';
    const TH = 120;
    if(Math.abs(dx)>TH){
      card.style.transition='transform .25s ease, opacity .25s ease';
      card.style.transform = `translateX(${dx>0?600:-600}px) rotate(${dx>0?14:-14}deg)`;
      card.style.opacity='0';
      setTimeout(()=>renderDeck(container), 260);
    }else{
      card.style.transition='transform .2s ease';
      card.style.transform='translateX(0) rotate(0)';
    }
  }

  on(card,'touchstart',onStart,{passive:true});
  on(card,'touchmove', onMove, {passive:false});
  on(card,'touchend',  onEnd);
  on(card,'mousedown',onStart);
  on(window,'mousemove',onMove);
  on(window,'mouseup', onEnd);
}

/* ------------------ Geolocalizzazione (base) ------------------ */
async function initGeo(){
  if(!('geolocation' in navigator)) return;
  navigator.geolocation.getCurrentPosition(
    pos=>{ State.geo={lat:pos.coords.latitude,lng:pos.coords.longitude}; },
    ()=>{}, {enableHighAccuracy:true, timeout:5000, maximumAge:60000}
  );
}

/* ------------------ Sponsor link (app) ------------------ */
on(sponsorLinkApp,'click', ()=>{/* tracking opzionale */});

/* ------------------ Bootstrap ------------------ */
function boot(){
  // dataset
  State.dogs = DOGS.slice();
  // prima vista
  renderNearby();
  renderDeck(loveDeck);
  renderDeck(playDeck);
  initGeo();
}
boot();

/* ------------------ Service Worker ------------------ */
if('serviceWorker' in navigator){
  addEventListener('load', ()=>navigator.serviceWorker.register('service-worker.js').catch(()=>{}));
}
