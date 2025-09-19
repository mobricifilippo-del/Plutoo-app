/* Plutoo adv1 – Ricerca Avanzata (UI + logica), mantiene tutte le funzioni esistenti */

/* ====== DATASET DEMO ====== */
const dogs = [
  // aggiunti campi nuovi per i filtri avanzati: sex, intact, size, pedigree, tests, heat, exp
  { id:1,  name:'Luna',  age:1, breed:'Jack Russell',     distance:2.2, image:'./dog2.jpg', online:true,
    verified:true, lastSeen:'2025-09-19T10:12:00Z',
    photos:['./dog2.jpg','./dog1.jpg','./dog3.jpg'],
    sex:'Femmina', intact:'intact', size:'Piccola', pedigree:true,
    tests:{HD:true,ED:true,ECVO:false,GEN:false}, heat:{inHeat:false}, exp:0,
    character:'Giocherellona', energy:'Alta',   living:'Ok con altri cani', area:'Ostia',
    posts:[ {id:1, text:'Passeggiata al parco!', ts:'2025-09-18 10:21'},
            {id:2, text:'Oggi ho imparato “seduta” 🐶', ts:'2025-09-17 18:05'} ] },
  { id:2,  name:'Rocky', age:3, breed:'Labrador',         distance:1.6, image:'./dog1.jpg', online:true,
    verified:true, lastSeen:'2025-09-19T09:40:00Z',
    photos:['./dog1.jpg','./dog4.jpg'],
    sex:'Maschio', intact:'intact', size:'Grande', pedigree:true,
    tests:{HD:true,ED:false,ECVO:false,GEN:true}, heat:{inHeat:false}, exp:1,
    character:'Dolce', energy:'Media', living:'Ok con bambini', area:'Garbatella',
    posts:[ {id:1, text:'Nuovo amico al laghetto 💦', ts:'2025-09-15 12:40'} ] },
  { id:3,  name:'Bella', age:2, breed:'Shiba Inu',        distance:3.2, image:'./dog3.jpg', online:true,
    verified:false, lastSeen:'2025-09-18T20:00:00Z',
    photos:['./dog3.jpg','./dog1.jpg','./dog4.jpg'],
    sex:'Femmina', intact:'fixed', size:'Media', pedigree:false,
    tests:{HD:false,ED:false,ECVO:false,GEN:false}, heat:{inHeat:true}, exp:0,
    character:'Curiosa', energy:'Media', living:'Meglio da sola', area:'EUR', posts:[] },
  { id:4,  name:'Max',   age:4, breed:'Golden Retriever', distance:5.9, image:'./dog4.jpg', online:true,
    verified:true, lastSeen:'2025-09-19T07:10:00Z',
    photos:['./dog4.jpg','./dog2.jpg'],
    sex:'Maschio', intact:'fixed', size:'Grande', pedigree:true,
    tests:{HD:true,ED:true,ECVO:true,GEN:true}, heat:{inHeat:false}, exp:2,
    character:'Tranquillo', energy:'Bassa', living:'Casa con giardino', area:'Prati',
    posts:[ {id:1, text:'Pennichella al sole ☀️', ts:'2025-09-16 15:12'} ] },
  { id:5,  name:'Milo',  age:1, breed:'Labrador',         distance:4.1, image:'./dog1.jpg', online:true,
    verified:false, lastSeen:'2025-09-18T11:30:00Z',
    photos:['./dog1.jpg','./dog2.jpg','./dog3.jpg','./dog4.jpg'],
    sex:'Maschio', intact:'intact', size:'Grande', pedigree:false,
    tests:{HD:false,ED:false,ECVO:false,GEN:false}, heat:{inHeat:false}, exp:0,
    character:'Vivace', energy:'Alta', living:'Ok tutti', area:'Trastevere', posts:[] },
  { id:6,  name:'Kira',  age:2, breed:'Jack Russell',     distance:2.9, image:'./dog2.jpg', online:false,
    verified:true, lastSeen:'2025-09-17T18:20:00Z',
    photos:['./dog2.jpg','./dog3.jpg'],
    sex:'Femmina', intact:'intact', size:'Piccola', pedigree:true,
    tests:{HD:false,ED:false,ECVO:false,GEN:true}, heat:{inHeat:false}, exp:1,
    character:'Attenta', energy:'Alta', living:'Casa e parco', area:'Centocelle', posts:[] },
  { id:7,  name:'Thor',  age:5, breed:'Golden Retriever', distance:7.0, image:'./dog4.jpg', online:true,
    verified:false, lastSeen:'2025-09-19T08:00:00Z',
    photos:['./dog4.jpg','./dog1.jpg'],
    sex:'Maschio', intact:'intact', size:'Grande', pedigree:false,
    tests:{HD:false,ED:false,ECVO:false,GEN:false}, heat:{inHeat:false}, exp:2,
    character:'Affettuoso', energy:'Media', living:'Famiglia', area:'Tiburtina', posts:[] },
  { id:8,  name:'Nala',  age:3, breed:'Shiba Inu',        distance:3.7, image:'./dog3.jpg', online:true,
    verified:true, lastSeen:'2025-09-19T10:00:00Z',
    photos:['./dog3.jpg','./dog2.jpg'],
    sex:'Femmina', intact:'fixed', size:'Media', pedigree:true,
    tests:{HD:true,ED:true,ECVO:false,GEN:false}, heat:{inHeat:false}, exp:1,
    character:'Indipendente', energy:'Media', living:'Meglio da sola', area:'San Paolo', posts:[] },
  { id:9,  name:'Zoe',   age:2, breed:'Labrador',         distance:2.4, image:'./dog1.jpg', online:true,
    verified:false, lastSeen:'2025-09-19T06:35:00Z',
    photos:['./dog1.jpg','./dog3.jpg'],
    sex:'Femmina', intact:'intact', size:'Grande', pedigree:false,
    tests:{HD:false,ED:false,ECVO:false,GEN:false}, heat:{inHeat:false}, exp:0,
    character:'Socievole', energy:'Alta', living:'Ok con cani', area:'Portuense', posts:[] },
  { id:10, name:'Otto',  age:4, breed:'Jack Russell',     distance:6.3, image:'./dog2.jpg', online:false,
    verified:false, lastSeen:'2025-09-16T21:03:00Z',
    photos:['./dog2.jpg','./dog1.jpg'],
    sex:'Maschio', intact:'fixed', size:'Piccola', pedigree:false,
    tests:{HD:false,ED:false,ECVO:false,GEN:false}, heat:{inHeat:false}, exp:1,
    character:'Cacciatore', energy:'Alta', living:'Passeggiate lunghe', area:'Anagnina', posts:[] },
  { id:11, name:'Paco',  age:3, breed:'Shiba Inu',        distance:5.1, image:'./dog3.jpg', online:true,
    verified:true, lastSeen:'2025-09-19T09:12:00Z',
    photos:['./dog3.jpg','./dog4.jpg'],
    sex:'Maschio', intact:'intact', size:'Media', pedigree:true,
    tests:{HD:true,ED:false,ECVO:false,GEN:false}, heat:{inHeat:false}, exp:2,
    character:'Furbo', energy:'Media', living:'Routine fissa', area:'Monti', posts:[] },
  { id:12, name:'Maya',  age:2, breed:'Golden Retriever', distance:4.8, image:'./dog4.jpg', online:true,
    verified:false, lastSeen:'2025-09-19T09:55:00Z',
    photos:['./dog4.jpg','./dog2.jpg'],
    sex:'Femmina', intact:'fixed', size:'Grande', pedigree:false,
    tests:{HD:false,ED:false,ECVO:true,GEN:false}, heat:{inHeat:false}, exp:0,
    character:'Solare', energy:'Alta', living:'Famiglia', area:'Parioli', posts:[] },
  { id:13, name:'Loki',  age:1, breed:'Labrador',         distance:3.5, image:'./dog1.jpg', online:true,
    verified:true, lastSeen:'2025-09-19T10:20:00Z',
    photos:['./dog1.jpg','./dog2.jpg','./dog4.jpg'],
    sex:'Maschio', intact:'intact', size:'Grande', pedigree:true,
    tests:{HD:true,ED:true,ECVO:true,GEN:true}, heat:{inHeat:false}, exp:0,
    character:'Esploratore', energy:'Alta', living:'Ok con gatti', area:'Testaccio', posts:[] },
  { id:14, name:'Daisy', age:5, breed:'Golden Retriever', distance:8.2, image:'./dog4.jpg', online:true,
    verified:false, lastSeen:'2025-09-19T08:45:00Z',
    photos:['./dog4.jpg','./dog1.jpg'],
    sex:'Femmina', intact:'fixed', size:'Grande', pedigree:false,
    tests:{HD:false,ED:false,ECVO:false,GEN:false}, heat:{inHeat:false}, exp:2,
    character:'Calma', energy:'Bassa', living:'Giardino', area:'Cassia', posts:[] },
  { id:15, name:'Trixie',age:2, breed:'Jack Russell',     distance:1.9, image:'./dog2.jpg', online:true,
    verified:true, lastSeen:'2025-09-19T07:50:00Z',
    photos:['./dog2.jpg','./dog3.jpg'],
    sex:'Femmina', intact:'intact', size:'Piccola', pedigree:true,
    tests:{HD:false,ED:false,ECVO:false,GEN:true}, heat:{inHeat:false}, exp:1,
    character:'Sprintosa', energy:'Alta', living:'Sportiva', area:'Marconi', posts:[] },
  { id:16, name:'Hachi', age:3, breed:'Shiba Inu',        distance:6.0, image:'./dog3.jpg', online:true,
    verified:true, lastSeen:'2025-09-19T09:05:00Z',
    photos:['./dog3.jpg','./dog1.jpg'],
    sex:'Maschio', intact:'fixed', size:'Media', pedigree:true,
    tests:{HD:true,ED:false,ECVO:true,GEN:false}, heat:{inHeat:false}, exp:1,
    character:'Leale', energy:'Media', living:'Tranquillità', area:'Balduina', posts:[] },
];

/* ====== RAZZE ====== */
const BREEDS = [
  'Labrador','Golden Retriever','Jack Russell','Shiba Inu',
  'Pastore Tedesco','Bulldog Francese','Bulldog Inglese','Beagle',
  'Barboncino (Poodle)','Chihuahua','Cocker Spaniel','Border Collie',
  'Carlino (Pug)','Dobermann','Rottweiler','Husky Siberiano',
  'Maltese','Bassotto','Yorkshire Terrier','Pinscher',
  'Akita Inu','Setter Inglese','Springer Spaniel','Shar Pei',
  'American Staffordshire','Boxer','Cane Corso','Dalmata',
  'Weimaraner','Whippet'
];

/* ====== STATO / DOM ====== */
let matches = new Set();
let currentView = 'near';   // near | browse | match
let deckIndex = 0;
const photoIndexByDog = new Map();

const $  = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

const cardsEl  = $('#cards');
const deckEl   = $('#deck');
const detailEl = $('#detail');
const sheetEl  = $('#dogsheet');

/* ====== FILTRI: UI ====== */
function initBreedOptions(){
  const sel = $('#breedFilter');
  if (!sel) return;
  sel.innerHTML = '<option value="">Razza (tutte)</option>' + BREEDS.map(b=>`<option>${b}</option>`).join('');
}
function toggleFiltersPanel(force){
  const p = $('#filtersPanel');
  if (!p) return;
  if (typeof force==='boolean'){ p.hidden = !force; return; }
  p.hidden = !p.hidden;
}

/* Salvataggio preferenze filtri */
const FILTER_KEYS = ['breedFilter','ageFilter','sexFilter','intactFilter','sizeFilter','distanceFilter',
  'pedigreeFilter','inHeatFilter','expFilter','testHD','testED','testECVO','testGEN'];
function saveFilters(){
  if (!$('#rememberFilters')?.checked) return;
  const data = {};
  FILTER_KEYS.forEach(k=>{
    const el = document.getElementById(k);
    if (!el) return;
    data[k] = (el.type==='checkbox') ? el.checked : el.value;
  });
  localStorage.setItem('plutooFilters', JSON.stringify(data));
}
function loadFilters(){
  const raw = localStorage.getItem('plutooFilters');
  if (!raw) return;
  try{
    const data = JSON.parse(raw);
    FILTER_KEYS.forEach(k=>{
      const el = document.getElementById(k);
      if (!el || data[k]===undefined) return;
      if (el.type==='checkbox') el.checked = !!data[k];
      else el.value = data[k];
    });
    const any = Object.values(data).some(v => v && v!=='' && v!==false);
    if (any) toggleFiltersPanel(true);
  }catch{}
}

/* ====== FILTRI: LOGICA ====== */
function getFilters(){
  return {
    breed:  $('#breedFilter')?.value || '',
    age:    $('#ageFilter')?.value || '',
    sex:    $('#sexFilter')?.value || '',
    intact: $('#intactFilter')?.value || '',
    size:   $('#sizeFilter')?.value || '',
    dist:   $('#distanceFilter')?.value || '',
    pedigree: $('#pedigreeFilter')?.value || '',
    inHeat:   $('#inHeatFilter')?.value || '',
    exp:      $('#expFilter')?.value || '',
    tests:{
      HD:  $('#testHD')?.checked || false,
      ED:  $('#testED')?.checked || false,
      ECVO:$('#testECVO')?.checked || false,
      GEN: $('#testGEN')?.checked || false,
    }
  };
}
function withinDistance(d, limit){
  if (!limit) return true;
  const L = Number(limit);
  if (!Number.isFinite(L)) return true;
  return d.distance <= L + 1e-9;
}
function applyFilters(list){
  const f = getFilters();
  let out = [...list];

  if (f.breed) out = out.filter(d => d.breed === f.breed);

  if (f.age === '0-1') out = out.filter(d => d.age <= 1);
  if (f.age === '2-3') out = out.filter(d => d.age >= 2 && d.age <= 3);
  if (f.age === '4+')  out = out.filter(d => d.age >= 4);

  if (f.sex)   out = out.filter(d => d.sex === f.sex);
  if (f.intact==='intact') out = out.filter(d => d.intact === 'intact');
  if (f.intact==='fixed')  out = out.filter(d => d.intact === 'fixed');

  if (f.size) out = out.filter(d => d.size === f.size);
  if (f.dist) out = out.filter(d => withinDistance(d, f.dist));

  if (f.pedigree==='yes') out = out.filter(d => d.pedigree === true);
  if (f.pedigree==='no')  out = out.filter(d => d.pedigree === false);

  // Test sanitari: se spuntati, devono essere true
  if (f.tests.HD)   out = out.filter(d => d.tests?.HD === true);
  if (f.tests.ED)   out = out.filter(d => d.tests?.ED === true);
  if (f.tests.ECVO) out = out.filter(d => d.tests?.ECVO === true);
  if (f.tests.GEN)  out = out.filter(d => d.tests?.GEN === true);

  if (f.inHeat==='yes') out = out.filter(d => d.heat?.inHeat === true);
  if (f.inHeat==='no')  out = out.filter(d => d.heat?.inHeat === false);

  if (f.exp==='0')  out = out.filter(d => (d.exp||0) === 0);
  if (f.exp==='1')  out = out.filter(d => (d.exp||0) === 1);
  if (f.exp==='2+') out = out.filter(d => (d.exp||0) >= 2);

  return out;
}

/* ====== UTILS ====== */
function timeSince(iso){
  if (!iso) return '';
  const then = new Date(iso).getTime();
  const diff = Math.max(0, Date.now() - then);
  const m = Math.floor(diff/60000), h = Math.floor(m/60), d = Math.floor(h/24);
  if (d>0) return `${d}g fa`;
  if (h>0) return `${h}h fa`;
  if (m>0) return `${m}m fa`;
  return 'ora';
}
function updateResultsInfo(count){
  const el = $('#resultsInfo'); if (!el) return;
  el.textContent = `Mostro ${count} cane${count===1?'':'i'}`;
}

/* ====== RENDER ====== */
let currentView = 'near';
let deckIndex = 0;
let matches = new Set();

function render(){
  const isDeck = (currentView === 'browse');
  cardsEl.hidden = isDeck;
  deckEl.hidden  = !isDeck;

  let list = applyFilters(dogs);

  if (currentView === 'near'){
    list = list.filter(d => d.online).sort((a,b)=>a.distance-b.distance);
    renderGrid(list);
  } else if (currentView === 'match'){
    list = list.filter(d => matches.has(d.id));
    renderGrid(list);
  } else {
    if (!list.length){ deckEl.innerHTML=''; updateResultsInfo(0); return; }
    if (deckIndex >= list.length) deckIndex = 0;
    updateResultsInfo(list.length);
    renderDeck(list[deckIndex]);
  }
}

function renderGrid(list){
  updateResultsInfo(list.length);
  if (!list.length){
    cardsEl.innerHTML = `<p style="padding:12px 16px;color:#6b7280">Nessun risultato qui.</p>`;
    return;
  }
  cardsEl.innerHTML = '';
  list.forEach(d=>{
    const el = document.createElement('article');
    el.className = 'card';
    el.innerHTML = `
      <div class="pic">
        <img src="${d.image}" alt="Foto di ${d.name}" data-open="${d.id}">
        <span class="badge">${d.distance.toFixed(1)} km</span>
        ${d.online ? '<span class="dot"></span>' : ''}
      </div>
      <div class="body">
        <div class="name">${d.name}, ${d.age}${d.verified ? '<span class="badge-verify">🐾</span>' : ''}</div>
        <div class="breed">${d.breed}</div>
        <div class="actions">
          <button class="btn-round btn-no" data-act="no"  data-id="${d.id}"><span class="emoji">🥲</span></button>
          <button class="btn-round btn-yes" data-act="yes" data-id="${d.id}"><span class="emoji">❤️</span></button>
        </div>
      </div>`;
    cardsEl.appendChild(el);
  });
}

function renderDeck(d){
  deckEl.innerHTML = `
    <article class="card card-big" id="deckCard">
      <div class="pic">
        <img src="${d.image}" alt="Foto di ${d.name}" data-open="${d.id}">
        <span class="badge">${d.distance.toFixed(1)} km</span>
        ${d.online ? '<span class="dot"></span>' : ''}
      </div>
      <div class="body">
        <div class="name">${d.name}, ${d.age}${d.verified ? '<span class="badge-verify">🐾</span>' : ''}</div>
        <div class="breed">${d.breed}</div>
        <div class="swipe-actions">
          <button class="btn-round btn-no" data-act="no"  data-id="${d.id}"><span class="emoji">🥲</span></button>
          <button class="btn-round btn-yes" data-act="yes" data-id="${d.id}"><span class="emoji">❤️</span></button>
        </div>
      </div>
    </article>`;
}

/* ====== OVERLAY PROFILO ====== */
let savedScrollY = 0;
function showDetailOverlay(){
  savedScrollY = window.scrollY || 0;
  document.body.style.position = 'fixed';
  document.body.style.top = `-${savedScrollY}px`;
  document.body.style.left = '0';
  document.body.style.right = '0';
  document.body.style.width = '100%';
  detailEl.hidden = false;
  Object.assign(detailEl.style,{position:'fixed',inset:'0',background:'#fff',zIndex:'9999',overflowY:'auto'});
}
function hideDetailOverlay(){
  detailEl.hidden = true;
  detailEl.removeAttribute('style');
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.left = '';
  document.body.style.right = '';
  document.body.style.width = '';
  window.scrollTo(0, savedScrollY || 0);
}

function renderDetail(d){
  const photos = d.photos && d.photos.length ? d.photos : [d.image];
  const idx = photoIndexByDog.get(d.id) ?? 0;
  const total = photos.length;
  const current = ((idx % total) + total) % total;

  const thumbHtml = photos.map((p,i)=>`
    <img src="${p}" data-thumb="${i}" alt="thumb ${i+1}"
         style="width:64px;height:64px;object-fit:cover;border-radius:10px;opacity:${i===current?1:.6};outline:${i===current?'3px solid #e9d5ff':'none'}">
  `).join('');

  const onlineRow = d.online
    ? `<div class="drow"><strong>Stato:</strong> <span style="color:#10b981">🟢 Online ora</span></div>`
    : `<div class="drow"><strong>Stato:</strong> <span style="color:#6b7280">Ultimo accesso: ${timeSince(d.lastSeen)}</span></div>`;

  const testsLine = ['HD','ED','ECVO','GEN'].filter(k=>d.tests?.[k]).join(', ') || '—';

  sheetEl.innerHTML = `
    <div style="position:relative">
      <img id="bigPhoto" class="dphoto" src="${photos[current]}" alt="Foto di ${d.name}"
           data-id="${d.id}" data-idx="${current}">
      <div style="position:absolute;right:10px;bottom:10px;background:#00000080;color:#fff;padding:6px 10px;border-radius:12px;font-weight:700">
        ${current+1}/${total}
      </div>
    </div>

    <div style="display:flex;gap:10px;overflow:auto;padding:10px 12px 6px">${thumbHtml}</div>

    <div class="dinfo">
      <h2 style="margin:0 0 6px;display:flex;align-items:center;gap:6px">
        <span>${d.name}, ${d.age}</span>${d.verified ? '<span class="badge-verify">🐾</span>' : ''}
      </h2>
      <div class="dmeta">${d.breed} • ${d.distance.toFixed(1)} km</div>
      ${onlineRow}
      <div class="drow"><strong>Sesso:</strong> ${d.sex} • <strong>Stato:</strong> ${d.intact==='intact'?'Integro':'Sterilizzato/Castrato'}</div>
      <div class="drow"><strong>Taglia:</strong> ${d.size} • <strong>Pedigree:</strong> ${d.pedigree?'Sì':'No'}</div>
      <div class="drow"><strong>Test sanitari:</strong> ${testsLine}</div>
      ${d.sex==='Femmina' ? `<div class="drow"><strong>In calore:</strong> ${d.heat?.inHeat?'Sì':'No'}</div>` : ''}
      <div class="drow"><strong>Carattere:</strong> ${d.character}</div>
      <div class="drow"><strong>Energia:</strong> ${d.energy}</div>
      <div class="drow"><strong>Convivenza:</strong> ${d.living}</div>
      <div class="drow"><strong>Zona:</strong> ${d.area}</div>

      <div class="profile-actions">
        <button class="btn-round btn-no" data-act="no"  data-id="${d.id}"><span class="emoji">🥲</span></button>
        <button class="btn-round btn-yes" data-act="yes" data-id="${d.id}"><span class="emoji">❤️</span></button>
      </div>

      <h3 style="margin:16px 0 8px">Aggiornamenti</h3>
      ${
        (d.posts && d.posts.length)
        ? d.posts.map(po=>`
          <div style="background:#fff;border-radius:14px;padding:12px;box-shadow:0 8px 20px rgba(0,0,0,.06);margin:10px 0">
            <div style="font-weight:700;margin-bottom:6px">${d.name}</div>
            <div style="color:#6b7280;font-size:.9rem;margin-bottom:8px">${po.ts}</div>
            <div>${po.text}</div>
          </div>`).join('')
        : `<div style="color:#9ca3af">Nessun aggiornamento ancora.</div>`
      }
    </div>
  `;

  // Swipe foto
  const big = document.getElementById('bigPhoto');
  let touchX = null;
  big.addEventListener('touchstart', e=>{ touchX = e.changedTouches[0].clientX; }, {passive:true});
  big.addEventListener('touchend', e=>{
    if (touchX == null) return;
    const dx = e.changedTouches[0].clientX - touchX; touchX = null;
    if (Math.abs(dx) < 30) return;
    const dir = dx < 0 ? 1 : -1;
    const next = ((current + dir) % total + total) % total;
    photoIndexByDog.set(d.id, next);
    renderDetail(d);
  }, {passive:true});
}

function openDetail(id){
  const d = dogs.find(x=>x.id===id);
  if (!d) return;
  if (!photoIndexByDog.has(d.id)) photoIndexByDog.set(d.id, 0);
  renderDetail(d);
  showDetailOverlay();
}

/* ====== ANIMAZIONI ====== */
function animateGridAction(button, yes){
  const card = button.closest('.card'); if (!card) return;
  if (yes){
    card.animate(
      [{transform:'scale(1)',opacity:1},{transform:'scale(1.04)',opacity:1},{transform:'scale(.96)',opacity:.9},
       {transform:'scale(.98)',opacity:.85},{transform:'scale(1)',opacity:0}],
      {duration:280,easing:'ease-in-out'}
    ).onfinish = ()=> render();
  } else {
    card.animate(
      [{transform:'translateX(0)'},{transform:'translateX(-6px)'},{transform:'translateX(6px)'},
       {transform:'translateX(-4px)'},{transform:'translateX(0)'}],
      {duration:220,easing:'ease-in-out'}
    );
  }
}
function animateDeckAction(yes){
  const card = $('#deckCard'); if (!card) return;
  const dir = yes ? 1 : -1;
  card.animate(
    [{transform:'translateX(0) rotate(0deg)',opacity:1},
     {transform:`translateX(${dir*20}px) rotate(${dir*2}deg)`,opacity:1},
     {transform:`translateX(${dir*120}px) rotate(${dir*8}deg)`,opacity:0}],
    {duration:260,easing:'ease-in-out'}
  ).onfinish = ()=>{
    const filtered = applyFilters(dogs);
    deckIndex = (deckIndex + 1) % (filtered.length || 1);
    render();
  };
}

/* ====== EVENTI ====== */
$$('.tab').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    $$('.tab').forEach(x=>x.classList.remove('active'));
    btn.classList.add('active');
    currentView = btn.dataset.view;
    if (currentView === 'browse') deckIndex = 0;
    render();
  });
});

// Toggle pannello
$('#filtersToggle').addEventListener('click', ()=> toggleFiltersPanel());

// Applica filtri
$('#applyFilters').addEventListener('click', ()=>{
  saveFilters();
  deckIndex = 0;
  render();
});

// Azzera
$('#resetFilters').addEventListener('click', ()=>{
  ['breedFilter','ageFilter','sexFilter','intactFilter','sizeFilter','distanceFilter',
   'pedigreeFilter','inHeatFilter','expFilter'].forEach(id=>{
    const el = document.getElementById(id); if (el) el.value = '';
  });
  ['testHD','testED','testECVO','testGEN'].forEach(id=>{
    const el = document.getElementById(id); if (el) el.checked = false;
  });
  deckIndex = 0;
  render();
  updateResultsInfo(applyFilters(dogs).length);
});

// Filtri base reattivi
['breedFilter','ageFilter'].forEach(id=>{
  const el = document.getElementById(id);
  el?.addEventListener('change', ()=>{ deckIndex = 0; render(); });
});

// Geo (demo)
$('#locOn').addEventListener('click', ()=> alert('Posizione attivata (demo).'));
$('#locLater').addEventListener('click', ()=> alert('Ok, più tardi.'));

// Click globali (apri profilo / thumbs / like)
document.addEventListener('click', (e)=>{
  const open = e.target.closest('[data-open]');
  if (open){ openDetail(Number(open.dataset.open)); return; }

  const th = e.target.closest('[data-thumb]');
  if (th){
    const big = document.getElementById('bigPhoto');
    const dogId = Number(big?.dataset.id);
    const idx   = Number(th.dataset.thumb);
    if (!isNaN(dogId) && !isNaN(idx)){
      photoIndexByDog.set(dogId, idx);
      const d = dogs.find(x=>x.id===dogId);
      if (d) renderDetail(d);
    }
    return;
  }

  const b = e.target.closest('button[data-id]');
  if (!b) return;
  const id  = Number(b.dataset.id);
  const yes = (b.dataset.act === 'yes');

  if (yes) matches.add(id);
  else {
    const i = dogs.findIndex(d=>d.id===id);
    if (i>=0) dogs.push(...dogs.splice(i,1));
  }

  if (e.target.closest('.profile-actions')){
    b.animate([{transform:'scale(1)'},{transform:'scale(1.12)'},{transform:'scale(1)'}],{duration:160});
    return;
  }

  if (currentView === 'browse') animateDeckAction(yes);
  else animateGridAction(b, yes);
});

// Chiudi profilo
$('#closeDetail').addEventListener('click', (e)=>{
  e.preventDefault();
  hideDetailOverlay();
});

/* ====== SMART LANDING ====== */
function smartLanding(){
  const params = new URLSearchParams(location.search);
  const wantsList = params.get('start') === 'list';
  const alreadyVisited = localStorage.getItem('plutooVisited') === '1';
  if (!location.hash && (wantsList || alreadyVisited)) location.hash = '#list';
  document.addEventListener('click', (e)=>{
    const a = e.target.closest('#enterLink');
    if (a) localStorage.setItem('plutooVisited', '1');
  }, {passive:true});
}

/* ====== AVVIO ====== */
initBreedOptions();
loadFilters();
smartLanding();
render();
