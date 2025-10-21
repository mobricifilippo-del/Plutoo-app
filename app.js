/* =====================================================
   PLUTOO APP – VIOLET EDITION (completo)
   ===================================================== */

/* ---------- Helpers ---------- */
const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
const on = (el, ev, fn, opts) => el && el.addEventListener(ev, fn, opts);
const sleep = (ms) => new Promise(r=>setTimeout(r, ms));
const html = String.raw;

/* ---------- Stato ---------- */
const State = {
  currentTab: 'nearby',
  plus: false,
  currentDog: null,
  filters: { breed:'', sex:'', badge:'' },
};

const DOGS = [
  {id:1, name:'Luna',  breed:'Labrador', sex:'Femmina', km:1.2, img:'dog1.jpg', badge:true,  bio:'Amante dei parchi.'},
  {id:2, name:'Rocky', breed:'Beagle',   sex:'Maschio', km:2.5, img:'dog2.jpg', badge:false, bio:'Corre come il vento.'},
  {id:3, name:'Maya',  breed:'Husky',    sex:'Femmina', km:3.1, img:'dog3.jpg', badge:true,  bio:'Dolcissima.'},
  {id:4, name:'Otto',  breed:'Maltese',  sex:'Maschio', km:0.9, img:'dog4.jpg', badge:false, bio:'Coccolone.'},
];

/* ---------- DOM ---------- */
const homeScreen = $('#homeScreen');
const appScreen  = $('#appScreen');
const heroLogo = $('#heroLogo');
const btnEnter = $('#btnEnter');

const tabNearby = $('#tabNearby');
const tabLove   = $('#tabLove');
const tabPlay   = $('#tabPlay');
const btnSearch = $('#btnSearch');
const tabPlus   = $('#tabPlus');
const luoghiWrap= $('#luoghiTabWrap');
const luoghiBtn = $('#tabLuoghi');
const luoghiMenu= $('#luoghiMenu');

const viewNearby= $('#viewNearby');
const viewLove  = $('#viewLove');
const viewPlay  = $('#viewPlay');
const nearbyGrid= $('#nearbyGrid');
const loveDeck  = $('#loveDeck');
const playDeck  = $('#playDeck');

const panelSearch   = $('#panelSearch');
const btnCloseSearch= $('#btnCloseSearch');
const breedInput    = $('#breed');
const suggestionsEl = $('#suggestions');
const sexSelect     = $('#sex');
const badgeSelect   = $('#badge');
const btnApplyFilters = $('#btnApplyFilters');
const btnResetFilters  = $('#btnResetFilters');

const sponsorLinkHome = $('#sponsorLinkHome');
const ethicsButtonHome= $('#ethicsButtonHome');
const sponsorLinkApp  = $('#sponsorLinkApp');

const profilePage    = $('#profilePage');
const btnBackProfile = $('#btnBackProfile');
const profileName    = $('#profileName');
const profileMeta    = $('#profileMeta');
const profilePhoto   = $('#profilePhoto');
const profileBadges  = $('#profileBadges');
const profileBio     = $('#profileBio');
const profileGallery = $('#profileGallery');
const profileHeaderTitle = $('#profileHeaderTitle');

/* ---------- Router ---------- */
function showHome(){
  appScreen.classList.add('hidden');
  profilePage.classList.add('hidden');
  homeScreen.classList.remove('hidden');
  window.scrollTo(0,0);
}
function showApp(){
  homeScreen.classList.add('hidden');
  profilePage.classList.add('hidden');
  appScreen.classList.remove('hidden');
  window.scrollTo(0,0);
}
function showProfile(dog){
  State.currentDog = dog;
  appScreen.classList.add('hidden');
  homeScreen.classList.add('hidden');
  profilePage.classList.remove('hidden');

  profileHeaderTitle.textContent = dog.name;
  profileName.textContent = dog.name;
  profileMeta.textContent = `${dog.breed} · ${dog.sex} · ${dog.km}km`;
  profilePhoto.src = dog.img;
  profileBio.textContent = dog.bio || '';
  profileBadges.innerHTML = dog.badge ? `<span class="badge">✔︎ Verificato</span>` : '';
  profileGallery.innerHTML = `
    <img src="${dog.img}" alt="${dog.name}">
    <img src="${dog.img}" alt="${dog.name}">
    <img src="${dog.img}" alt="${dog.name}">
  `;
  window.scrollTo(0,0);
}

/* ---------- Home ---------- */
on(btnEnter,'click', async ()=>{
  heroLogo.classList.add('gold-glow');
  await sleep(950);
  showApp();
  setActiveTab('nearby');
});
on(ethicsButtonHome,'click', ()=>{
  const q = encodeURIComponent('Canili vicino a me');
  window.open(`https://www.google.com/maps/search/${q}`,'_blank');
});
on(sponsorLinkHome,'click', ()=>{ /* tracking opzionale */ });

/* ---------- Tabs ---------- */
function setActiveTab(name){
  State.currentTab = name;
  [tabNearby,tabLove,tabPlay].forEach(b=>b.classList.remove('active'));
  ({nearby:tabNearby,love:tabLove,play:tabPlay}[name]).classList.add('active');

  [viewNearby,viewLove,viewPlay].forEach(v=>v.classList.remove('active'));
  ({nearby:viewNearby,love:viewLove,play:viewPlay}[name]).classList.add('active');

  if(name==='nearby') renderNearby();
  if(name==='love')   renderDeck(loveDeck);
  if(name==='play')   renderDeck(playDeck);
}
on(tabNearby,'click', ()=>setActiveTab('nearby'));
on(tabLove,'click',   ()=>setActiveTab('love'));
on(tabPlay,'click',   ()=>setActiveTab('play'));

/* ---------- Luoghi PET dropdown ---------- */
on(luoghiBtn,'click', ()=>{
  const exp = luoghiWrap.getAttribute('aria-expanded')==='true';
  luoghiWrap.setAttribute('aria-expanded', String(!exp));
});
document.addEventListener('click', (e)=>{
  if(!luoghiWrap) return;
  if(!luoghiWrap.contains(e.target)) luoghiWrap.setAttribute('aria-expanded','false');
});
on(luoghiMenu,'click', (e)=>{
  const item = e.target.closest('.menu-item'); if(!item) return;
  const q = encodeURIComponent(item.dataset.map);
  window.open(`https://www.google.com/maps/search/${q}`,'_blank');
  luoghiWrap.setAttribute('aria-expanded','false');
});

/* ---------- Ricerca ---------- */
const BREEDS = ["Akita","Barboncino","Beagle","Border Collie","Bulldog","Chihuahua","Cocker","Dalmata","Dobermann","Husky","Labrador","Maltese","Pastore Tedesco","Shiba Inu","Shih Tzu"];

function debounce(fn, wait=160){ let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a),wait); }; }
on(btnSearch,'click', ()=>{
  panelSearch.setAttribute('aria-hidden','false');
  btnSearch.setAttribute('aria-expanded','true');
});
on(btnCloseSearch,'click', ()=>{
  panelSearch.setAttribute('aria-hidden','true');
  btnSearch.setAttribute('aria-expanded','false');
});
on(breedInput,'input', debounce(()=>{
  const v = (breedInput.value||'').trim().toLowerCase();
  const arr = v ? BREEDS.filter(b=>b.toLowerCase().startsWith(v)).sort() : [];
  suggestionsEl.innerHTML = arr.map(b=>`<div class="item" role="option">${b}</div>`).join('');
  suggestionsEl.classList.toggle('show', arr.length>0);
}, 100));
on(suggestionsEl,'click', e=>{
  const it = e.target.closest('.item'); if(!it) return;
  breedInput.value = it.textContent; suggestionsEl.classList.remove('show');
});
on(btnApplyFilters,'click', ()=>{
  State.filters = {
    breed:(breedInput.value||'').trim(),
    sex:sexSelect.value||'',
    badge:badgeSelect.value||''
  };
  renderNearby();
  panelSearch.setAttribute('aria-hidden','true');
  btnSearch.setAttribute('aria-expanded','false');
});
on(btnResetFilters,'click', ()=>{
  breedInput.value=''; sexSelect.value=''; badgeSelect.value='';
  State.filters = {breed:'',sex:'',badge:''};
  renderNearby();
});

/* ---------- Nearby (griglia) ---------- */
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
    if(f.sex){
      const sx = f.sex==='male'?'Maschio':'Femmina';
      if(d.sex!==sx) return false;
    }
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
on(nearbyGrid,'click', e=>{
  const card = e.target.closest('.card'); if(!card) return;
  const dog = DOGS.find(x=>x.id==card.dataset.id);
  if(dog) showProfile(dog);
});

/* ---------- Deck (Love/Play) con swipe senza muovere pagina ---------- */
function renderDeck(container){
  const d = DOGS[Math.floor(Math.random()*DOGS.length)];
  container.innerHTML = dogCard(d).replace('card"', 'card love-card"');
  enableSwipe(container, d);
}
function enableSwipe(container, dog){
  const card = container.querySelector('.love-card'); if(!card) return;

  let startX=0, dx=0, dragging=false;

  function start(ev){
    dragging=true;
    const t = ev.touches? ev.touches[0]:ev;
    startX = t.clientX; dx=0;
    document.body.style.overflow='hidden';
    card.style.transition='none';
  }
  function move(ev){
    if(!dragging) return;
    const t = ev.touches? ev.touches[0]:ev;
    dx = t.clientX - startX;
    if(ev.cancelable) ev.preventDefault();
    card.style.transform = `translateX(${dx}px) rotate(${dx/25}deg)`;
  }
  function end(){
    if(!dragging) return; dragging=false;
    document.body.style.overflow='';
    const TH=120;
    if(Math.abs(dx)>TH){
      card.style.transition='transform .25s ease, opacity .25s ease';
      card.style.transform=`translateX(${dx>0?600:-600}px) rotate(${dx>0?14:-14}deg)`; card.style.opacity='0';
      setTimeout(()=>renderDeck(container),260);
    }else{
      card.style.transition='transform .2s ease'; card.style.transform='translateX(0) rotate(0)';
    }
  }
  on(card,'touchstart',start,{passive:true});
  on(card,'touchmove', move,{passive:false});
  on(card,'touchend',  end);
  on(card,'mousedown',start);
  on(window,'mousemove',move);
  on(window,'mouseup', end);

  // click sulla card apre profilo
  on(card,'click', (e)=>{
    if(Math.abs(dx)<10) showProfile(dog);
  });
}

/* ---------- Profilo ---------- */
on(btnBackProfile,'click', ()=>{
  showApp();
  setActiveTab(State.currentTab || 'nearby');
});

/* ---------- Sponsor ---------- */
on(sponsorLinkApp,'click', ()=>{/* tracking opz. */});

/* ---------- Boot ---------- */
function boot(){
  showHome();      // avvio sulla home
  renderNearby();  // pre-render
  renderDeck(loveDeck);
  renderDeck(playDeck);
}
boot();

/* ---------- SW ---------- */
if('serviceWorker' in navigator){
  addEventListener('load', ()=>navigator.serviceWorker.register('service-worker.js').catch(()=>{}));
}
