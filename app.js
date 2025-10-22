/* =====================================================
   PLUTOO – logica base (tema viola, no video reward)
   Nessun asset nuovo: usa dog1.jpg…dog4.jpg locali
   ===================================================== */

/* ---------- Helpers ---------- */
const $ = (sel,ctx=document)=>ctx.querySelector(sel);
const $$ = (sel,ctx=document)=>Array.from(ctx.querySelectorAll(sel));
const show = el => {el.classList.remove('hidden'); el.setAttribute('aria-hidden','false');};
const hide = el => {el.classList.add('hidden'); el.setAttribute('aria-hidden','true');};
const toast = (msg,ms=1400)=>{ const t=$('#toast'); const m=$('#toastMsg'); if(!t||!m) return; m.textContent=msg; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),ms); };

/* ---------- Stato ---------- */
const screens = {
  home: $('#homeScreen'),
  app:  $('#appScreen'),
  profile: $('#profilePage'),
};

/* ---------- Dati demo (locali, ordine fisso) ---------- */
const DOGS = [
  {id:1, name:'Luna',  sex:'Femmina', breed:'Labrador', dist:'1.2 km', img:'dog1.jpg', bio:'Amante dei parchi, dolcissima.', badge:true},
  {id:2, name:'Rocky', sex:'Maschio',  breed:'Beagle',   dist:'2.5 km', img:'dog2.jpg', bio:'Corre come il vento.',       badge:false},
  {id:3, name:'Maya',  sex:'Femmina', breed:'Husky',    dist:'3.1 km', img:'dog3.jpg', bio:'Occhi di ghiaccio, cuore caldo.', badge:false},
  {id:4, name:'Otto',  sex:'Maschio',  breed:'Maltese',  dist:'0.9 km', img:'dog4.jpg', bio:'Coccolone professionista.',   badge:true},
];

/* =====================================================
   HOME
   ===================================================== */
$('#btnEnter')?.addEventListener('click', ()=>{
  const logo = $('#heroLogo');
  logo?.classList.remove('violet-pulse'); // restart anim
  void logo?.offsetWidth;
  logo?.classList.add('violet-pulse');
  setTimeout(openApp, 1100);
});
$('#langIT')?.addEventListener('click', ()=>toast('Lingua: Italiano'));
$('#langEN')?.addEventListener('click', ()=>toast('Language: English'));

/* Sponsor e Canili (solo link) */
$('#sponsorLinkHome')?.addEventListener('click', ()=>{});
$('#ethicsButtonHome')?.addEventListener('click', ()=>{
  const q = encodeURIComponent('canili vicino a me');
  window.open(`https://www.google.com/maps/search/?api=1&query=${q}`,'_blank');
});

function openApp(){
  hide(screens.home); show(screens.app);
  renderNearby(DOGS);
  setActiveTab('nearby');
  window.scrollTo({top:0,behavior:'instant'});
}

/* =====================================================
   NAVIGAZIONE TOPBAR / TABS
   ===================================================== */
function setActiveTab(key){
  $$('.tab').forEach(b=>b.classList.remove('active'));
  const btn = $(`.tab[data-tab="${key}"]`) || $(`#tab${capitalize(key)}`);
  btn?.classList.add('active');

  $$('.view').forEach(v=>v.classList.remove('active'));
  if(key==='nearby') $('#viewNearby')?.classList.add('active');
  if(key==='love')   $('#viewLove')?.classList.add('active');
  if(key==='play')   $('#viewPlay')?.classList.add('active');
  if(key==='search') openSearchPanel();
}
function capitalize(s){return s? s[0].toUpperCase()+s.slice(1):s;}

$('#tabNearby')?.addEventListener('click', ()=>{ setActiveTab('nearby'); });
$('#tabLove')  ?.addEventListener('click', ()=>{ setActiveTab('love');   renderDeck('#loveDeck'); });
$('#tabPlay')  ?.addEventListener('click', ()=>{ setActiveTab('play');   renderDeck('#playDeck'); });
$('#btnBack')  ?.addEventListener('click', ()=>{
  hide(screens.app); show(screens.home);
  window.scrollTo({top:0,behavior:'instant'});
});

/* Luoghi PET dropdown */
const luoghiBtn  = $('#tabLuoghi');
const luoghiWrap = $('#luoghiTabWrap');
const luoghiMenu = $('#luoghiMenu');
luoghiBtn?.addEventListener('click', ()=>{
  const expanded = luoghiBtn.getAttribute('aria-expanded')==='true';
  luoghiBtn.setAttribute('aria-expanded', String(!expanded));
  luoghiWrap.setAttribute('aria-expanded', String(!expanded));
});
luoghiMenu?.addEventListener('click', (e)=>{
  const item = e.target.closest('.menu-item'); if(!item) return;
  const q = encodeURIComponent(item.dataset.query || 'Animali vicino a me');
  window.open(`https://www.google.com/maps/search/?api=1&query=${q}`,'_blank');
  luoghiBtn.setAttribute('aria-expanded','false');
  luoghiWrap.setAttribute('aria-expanded','false');
});

/* Ricerca personalizzata (overlay) */
const panel = $('#panelSearch');
function openSearchPanel(){ panel?.setAttribute('aria-hidden','false'); }
$('#btnSearch')     ?.addEventListener('click', openSearchPanel);
$('#btnCloseSearch')?.addEventListener('click', ()=> panel?.setAttribute('aria-hidden','true'));
$('#btnResetFilters')?.addEventListener('click', ()=>{
  $('#breed').value=''; $('#sex').value=''; $('#badge').value=''; $('#distance').value=20;
  $('#suggestions').classList.remove('show'); $('#suggestions').innerHTML='';
});
$('#btnApplyFilters')?.addEventListener('click', ()=>{
  const breed = $('#breed').value.trim().toLowerCase();
  const sex   = $('#sex').value;
  const badge = $('#badge').value;
  const filtered = DOGS.filter(d=>{
    let ok=true;
    if(breed) ok = ok && d.breed.toLowerCase().includes(breed);
    if(sex)   ok = ok && d.sex===sex;
    if(badge) ok = ok && (String(!!d.badge)===badge);
    return ok;
  });
  renderNearby(filtered);
  panel?.setAttribute('aria-hidden','true');
});

/* Autosuggest razze (lista locale) */
const ALL_BREEDS = ['Labrador','Beagle','Husky','Maltese','Maremmano','Terrier','Volpino','Setter','Pastore Tedesco','Pastore Maremmano'];
$('#breed')?.addEventListener('input', (e)=>{
  const v = e.target.value.trim().toLowerCase();
  const box = $('#suggestions');
  if(!v){ box.classList.remove('show'); box.innerHTML=''; return; }
  const list = ALL_BREEDS.filter(b=>b.toLowerCase().startsWith(v)).sort();
  box.innerHTML = list.map(b=>`<div class="item" role="option">${b}</div>`).join('');
  box.classList.toggle('show', list.length>0);
});
$('#suggestions')?.addEventListener('click',(e)=>{
  const it = e.target.closest('.item'); if(!it) return;
  $('#breed').value = it.textContent;
  $('#suggestions').classList.remove('show'); $('#suggestions').innerHTML='';
});

/* =====================================================
   VICINO A TE (griglia 2 col, click → profilo)
   ===================================================== */
function cardHTML(d){
  return `
  <article class="card" data-id="${d.id}" aria-label="${d.name}">
    <img class="card-img" src="${d.img}" alt="${d.name}" />
    <div class="card-info">
      <h3>${d.name}</h3>
      <p class="meta">${d.breed} · ${d.sex} · ${d.dist}</p>
    </div>
    <div class="card-actions">
      <button class="btn no"  type="button" aria-label="Saluta">😊</button>
      <button class="btn yes" type="button" aria-label="Mi piace">💜</button>
    </div>
  </article>`;
}
function renderNearby(list=DOGS){
  const grid = $('#nearbyGrid'); if(!grid) return;
  grid.innerHTML = list.map(d=>cardHTML(d)).join('');
  // click su card -> profilo (ignora bottoni)
  $$('#nearbyGrid .card').forEach(card=>{
    card.addEventListener('click', (e)=>{
      if(e.target.closest('.btn')) return;
      openProfile(Number(card.dataset.id));
    });
  });
}

/* =====================================================
   AMORE / GIOCHIAMO (deck centrato, swipe senza muovere pagina)
   ===================================================== */
function renderDeck(sel){
  const wrap = $(sel); if(!wrap) return;
  wrap.innerHTML = cardHTML(DOGS[0]);
  const card = $('.card', wrap);
  let startX=0, dx=0;

  card.addEventListener('touchstart', e=>{
    startX = e.touches[0].clientX;
    card.style.transition='none';
  }, {passive:false});

  card.addEventListener('touchmove', e=>{
    e.preventDefault(); // evita scroll della pagina
    dx = e.touches[0].clientX - startX;
    card.style.transform = `translateX(${dx}px) rotate(${dx/25}deg)`;
  }, {passive:false});

  card.addEventListener('touchend', ()=>{
    card.style.transition='transform .25s ease';
    if(Math.abs(dx)>90){
      card.style.transform=`translateX(${dx>0?480:-480}px) rotate(${dx/14}deg)`;
      setTimeout(()=>renderDeck(sel),260);
    }else{
      card.style.transform='translateX(0) rotate(0)';
    }
    dx=0;
  }, {passive:false});
}

/* =====================================================
   PROFILO (pagina dedicata) + Selfie mock (senza video)
   ===================================================== */
function openProfile(id){
  const d = DOGS.find(x=>x.id===id); if(!d) return;

  // Popola
  $('#profilePhoto').src = d.img;
  $('#profileName').textContent = d.name;
  $('#profileMeta').textContent = `${d.breed} · ${d.sex} · ${d.dist}`;
  $('#profileBio').textContent  = d.bio || '—';
  $('#profileBadges').innerHTML = d.badge ? `<span class="badge">✔︎ Verificato</span>` : '';
  $('#profileSelfie').src = d.img;
  $('#profileSelfie').classList.remove('blur-on');
  $('#profileSelfie').classList.add('blur-off');

  // Mini galleria
  $('#profileGallery').innerHTML = `
    <img src="${d.img}" alt="">
    <img src="dog2.jpg" alt="">
    <img src="dog3.jpg" alt="">
  `;

  // Mostra pagina profilo
  hide(screens.app); show(screens.profile);
  window.scrollTo({top:0,behavior:'instant'});
}
$('#btnBackProfile')?.addEventListener('click', ()=>{
  hide(screens.profile); show(screens.app);
  setActiveTab('nearby');
});

/* Selfie: pulsante (mock, niente reward) */
$('#btnSeeSelfie')?.addEventListener('click', ()=>{
  const s = $('#profileSelfie'); if(!s) return;
  s.classList.toggle('blur-on');
  s.classList.toggle('blur-off');
});

/* Placeholder azioni */
$('#btnUploadSelfie') ?.addEventListener('click', ()=>toast('Upload selfie (mock)'));
$('#btnUploadDogDocs')?.addEventListener('click', ()=>toast('Carica documenti dog (mock)'));
$('#btnUploadOwnerDocs')?.addEventListener('click', ()=>toast('Carica documenti personali (mock)'));
$('#btnOpenChat')      ?.addEventListener('click', ()=>toast('Chat (mock) — primo messaggio gratis'));

/* =====================================================
   AVVIO
   ===================================================== */
document.addEventListener('DOMContentLoaded', ()=>{
  // non registriamo il SW durante i test per evitare cache
  // render iniziale rimandato a openApp() dopo "Entra"
});
