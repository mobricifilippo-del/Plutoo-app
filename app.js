/* =====================================================
   PLUTOO – logica base (no random, sezioni stabili)
   ===================================================== */

/* ---------- Stato / helpers ---------- */
const $ = (sel,ctx=document)=>ctx.querySelector(sel);
const $$ = (sel,ctx=document)=>Array.from(ctx.querySelectorAll(sel));

const screens = {
  home: $('#homeScreen'),
  app:  $('#appScreen'),
  profile: $('#profilePage'),
};
function show(el){el.classList.remove('hidden'); el.setAttribute('aria-hidden','false');}
function hide(el){el.classList.add('hidden'); el.setAttribute('aria-hidden','true');}

/* ---------- Dati demo (ordine fisso) ---------- */
const DOGS = [
  {id:1, name:'Luna',   sex:'Femmina', breed:'Labrador', dist:'1.2km', img:'dog1.jpg', bio:'Amante dei parchi', badge:true},
  {id:2, name:'Rocky',  sex:'Maschio', breed:'Beagle',   dist:'2.5km', img:'dog2.jpg', bio:'Corre come il vento', badge:false},
  {id:3, name:'Maya',   sex:'Femmina', breed:'Husky',    dist:'3.1km', img:'dog3.jpg', bio:'Dolcissima', badge:false},
  {id:4, name:'Otto',   sex:'Maschio', breed:'Maltese',  dist:'0.9km', img:'dog4.jpg', bio:'Coccolone', badge:true},
];

/* ---------- HOME ---------- */
$('#btnEnter').addEventListener('click', ()=>{
  $('#heroLogo').classList.add('gold-glow');
  setTimeout(()=>openApp(), 900); // animazione un po’ più lunga
});
$('#btnEnterLink').addEventListener('click', (e)=>{ e.preventDefault(); openApp(); });

function openApp(){
  hide(screens.home); show(screens.app);
  renderNearby();
  setActiveTab('nearby');
}

/* Sponsor sempre cliccabile */
['#sponsorLinkHome','#sponsorLinkApp'].forEach(id=>{
  const el=$(id); if(el){ el.addEventListener('click',()=>{}) }
});

/* Canili SOLO Home → Google Maps */
$('#ethicsButtonHome').addEventListener('click', ()=>{
  const q = encodeURIComponent('canili vicino a me');
  window.open(`https://www.google.com/maps/search/?api=1&query=${q}`,'_blank');
});

/* ---------- TAB BAR ---------- */
const tabButtons = {
  nearby: $('#tabNearby'),
  love:   $('#tabLove'),
  play:   $('#tabPlay'),
};
function setActiveTab(key){
  $$('.tab').forEach(b=>b.classList.remove('active'));
  if(tabButtons[key]) tabButtons[key].classList.add('active');
  $$('.view').forEach(v=>v.classList.remove('active'));
  if(key==='nearby') $('#viewNearby').classList.add('active');
  if(key==='love')   $('#viewLove').classList.add('active');
  if(key==='play')   $('#viewPlay').classList.add('active');
}
tabButtons.nearby.addEventListener('click', ()=>{ setActiveTab('nearby'); });
tabButtons.love.addEventListener('click',   ()=>{ setActiveTab('love');   renderDeck('#loveDeck'); });
tabButtons.play.addEventListener('click',   ()=>{ setActiveTab('play');   renderDeck('#playDeck'); });

/* Dropdown Luoghi PET */
const luoghiBtn  = $('#tabLuoghi');
const luoghiWrap = $('#luoghiTabWrap');
const luoghiMenu = $('#luoghiMenu');
luoghiBtn.addEventListener('click', (e)=>{
  const expanded = luoghiBtn.getAttribute('aria-expanded')==='true';
  luoghiBtn.setAttribute('aria-expanded', String(!expanded));
  if(!expanded) luoghiWrap.setAttribute('aria-expanded','true');
  else luoghiWrap.removeAttribute('aria-expanded');
});
luoghiMenu.addEventListener('click', (e)=>{
  const item = e.target.closest('.menu-item'); if(!item) return;
  const q = encodeURIComponent(item.dataset.query || 'Animali vicino a me');
  window.open(`https://www.google.com/maps/search/?api=1&query=${q}`,'_blank');
  luoghiBtn.setAttribute('aria-expanded','false'); luoghiWrap.removeAttribute('aria-expanded');
});

/* Ricerca personalizzata */
const panel = $('#panelSearch');
$('#btnSearch').addEventListener('click', ()=> panel.setAttribute('aria-hidden','false'));
$('#btnCloseSearch').addEventListener('click', ()=> panel.setAttribute('aria-hidden','true'));
$('#btnResetFilters').addEventListener('click', ()=>{
  $('#breed').value=''; $('#sex').value=''; $('#badge').value=''; $('#distance').value=20;
  $('#suggestions').classList.remove('show'); $('#suggestions').innerHTML='';
});
$('#btnApplyFilters').addEventListener('click', ()=>{
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
  panel.setAttribute('aria-hidden','true');
});

/* Autosuggest razze (demo) */
const ALL_BREEDS = ['Labrador','Beagle','Husky','Maltese','Maremmano','Terrier','Volpino','Setter','Pastore Tedesco','Pastore Maremmano'];
$('#breed').addEventListener('input', (e)=>{
  const v = e.target.value.trim().toLowerCase();
  const box = $('#suggestions');
  if(!v){ box.classList.remove('show'); box.innerHTML=''; return; }
  const list = ALL_BREEDS.filter(b=>b.toLowerCase().startsWith(v)).sort();
  box.innerHTML = list.map(b=>`<div class="item" role="option">${b}</div>`).join('');
  box.classList.toggle('show', list.length>0);
});
$('#suggestions').addEventListener('click',(e)=>{
  const it = e.target.closest('.item'); if(!it) return;
  $('#breed').value = it.textContent;
  $('#suggestions').classList.remove('show'); $('#suggestions').innerHTML='';
});

/* ---------- RENDER: Vicino a te ---------- */
function renderNearby(list=DOGS){
  const grid = $('#nearbyGrid');
  grid.innerHTML = list.map(d=>cardHTML(d)).join('');
  // click su card -> profilo
  $$('#nearbyGrid .card').forEach(card=>{
    card.addEventListener('click', (e)=>{
      if(e.target.closest('.btn')) return; // ignora bottoni
      openProfile(Number(card.dataset.id));
    });
  });
}
function cardHTML(d){
  return `
  <article class="card" data-id="${d.id}" aria-label="${d.name}">
    <img class="card-img" src="${d.img}" alt="${d.name}" loading="lazy" />
    <div class="card-info">
      <h3>${d.name}</h3>
      <p class="meta">${d.breed} · ${d.sex} · ${d.dist}</p>
    </div>
    <div class="card-actions">
      <button class="btn no"  type="button" aria-label="Passa">🙂</button>
      <button class="btn yes" type="button" aria-label="Mi piace">💜</button>
    </div>
  </article>`;
}

/* ---------- RENDER: Deck (Amore / Giochiamo) ---------- */
function renderDeck(sel){
  const wrap = $(sel);
  // una card alla volta, centrata
  wrap.innerHTML = cardHTML(DOGS[0]);
  const card = $('.card', wrap);
  let startX=0, dx=0;
  card.addEventListener('touchstart', e=>{ startX = e.touches[0].clientX; card.style.transition='none'; }, {passive:true});
  card.addEventListener('touchmove',  e=>{ dx = e.touches[0].clientX - startX; card.style.transform=`translateX(${dx}px) rotate(${dx/25}deg)`; }, {passive:true});
  card.addEventListener('touchend',   ()=>{
    card.style.transition='transform .25s ease';
    if(Math.abs(dx)>90){ card.style.transform=`translateX(${dx>0?400:-400}px) rotate(${dx/15}deg)`; setTimeout(()=>renderDeck(sel),260); }
    else { card.style.transform='translateX(0) rotate(0)'; }
    dx=0;
  }, {passive:true});
}

/* ---------- PROFILO ---------- */
function openProfile(id){
  const d = DOGS.find(x=>x.id===id); if(!d) return;
  // popolamento
  $('#profilePhoto').src = d.img;
  $('#profileName').textContent = d.name;
  $('#profileMeta').textContent = `${d.breed} · ${d.sex} · ${d.dist}`;
  $('#profileBio').textContent  = d.bio || '—';
  const badges = $('#profileBadges');
  badges.innerHTML = d.badge ? `<span class="badge">✔︎ Verificato</span>` : '';
  // mostra pagina dedicata
  show(screens.profile); hide($('#viewNearby').closest('.view')); hide($('#viewLove').closest('.view')); hide($('#viewPlay').closest('.view'));
  // nasconde top content per evitare “scroll che si muove”
  window.scrollTo({top:0,behavior:'instant'});
}
$('#btnBackProfile').addEventListener('click', ()=>{
  hide(screens.profile);
  setActiveTab('nearby');
});

/* ---------- Torna alla HOME ---------- */
$('#btnBack').addEventListener('click', ()=>{
  hide(screens.app); show(screens.home);
  window.scrollTo({top:0,behavior:'instant'});
});

/* ---------- Lingue (placeholder demo) ---------- */
$('#langIT').addEventListener('click', ()=>alert('Lingua impostata: Italiano'));
$('#langEN').addEventListener('click', ()=>alert('Language set: English'));

/* ---------- Plus (placeholder) ---------- */
$('#tabPlus').addEventListener('click', ()=>alert('Plutoo Plus in arrivo!'));
