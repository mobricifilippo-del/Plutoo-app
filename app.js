/* ====== DATASET ====== */
/* La galleria usa immagini esistenti (dog1..dog4.jpg) per evitare 404 in demo */
const dogs = [
  { id:1,  name:'Luna',  age:1, breed:'Jack Russell',     distance:2.2, image:'./dog2.jpg', online:true,
    verified:true, lastSeen:'2025-09-19T10:12:00Z',
    photos:['./dog2.jpg','./dog1.jpg','./dog3.jpg'],
    character:'Giocherellona', energy:'Alta',   living:'Ok con altri cani', area:'Ostia',
    posts:[ {id:1, text:'Passeggiata al parco!', ts:'2025-09-18 10:21'},
            {id:2, text:'Oggi ho imparato “seduta” 🐶', ts:'2025-09-17 18:05'} ] },
  { id:2,  name:'Rocky', age:3, breed:'Labrador',         distance:1.6, image:'./dog1.jpg', online:true,
    verified:true, lastSeen:'2025-09-19T09:40:00Z',
    photos:['./dog1.jpg','./dog4.jpg'],
    character:'Dolce', energy:'Media', living:'Ok con bambini', area:'Garbatella',
    posts:[ {id:1, text:'Nuovo amico al laghetto 💦', ts:'2025-09-15 12:40'} ] },
  { id:3,  name:'Bella', age:2, breed:'Shiba Inu',        distance:3.2, image:'./dog3.jpg', online:true,
    verified:false, lastSeen:'2025-09-18T20:00:00Z',
    photos:['./dog3.jpg','./dog1.jpg','./dog4.jpg'],
    character:'Curiosa', energy:'Media', living:'Meglio da sola', area:'EUR', posts:[] },
  { id:4,  name:'Max',   age:4, breed:'Golden Retriever', distance:5.9, image:'./dog4.jpg', online:true,
    verified:true, lastSeen:'2025-09-19T07:10:00Z',
    photos:['./dog4.jpg','./dog2.jpg'],
    character:'Tranquillo', energy:'Bassa', living:'Casa con giardino', area:'Prati',
    posts:[ {id:1, text:'Pennichella al sole ☀️', ts:'2025-09-16 15:12'} ] },
  { id:5,  name:'Milo',  age:1, breed:'Labrador',         distance:4.1, image:'./dog1.jpg', online:true,
    verified:false, lastSeen:'2025-09-18T11:30:00Z',
    photos:['./dog1.jpg','./dog2.jpg','./dog3.jpg','./dog4.jpg'],
    character:'Vivace', energy:'Alta', living:'Ok tutti', area:'Trastevere', posts:[] },
  { id:6,  name:'Kira',  age:2, breed:'Jack Russell',     distance:2.9, image:'./dog2.jpg', online:false,
    verified:true, lastSeen:'2025-09-17T18:20:00Z',
    photos:['./dog2.jpg','./dog3.jpg'],
    character:'Attenta', energy:'Alta', living:'Casa e parco', area:'Centocelle', posts:[] },
  { id:7,  name:'Thor',  age:5, breed:'Golden Retriever', distance:7.0, image:'./dog4.jpg', online:true,
    verified:false, lastSeen:'2025-09-19T08:00:00Z',
    photos:['./dog4.jpg','./dog1.jpg'],
    character:'Affettuoso', energy:'Media', living:'Famiglia', area:'Tiburtina', posts:[] },
  { id:8,  name:'Nala',  age:3, breed:'Shiba Inu',        distance:3.7, image:'./dog3.jpg', online:true,
    verified:true, lastSeen:'2025-09-19T10:00:00Z',
    photos:['./dog3.jpg','./dog2.jpg'],
    character:'Indipendente', energy:'Media', living:'Meglio da sola', area:'San Paolo', posts:[] },
  { id:9,  name:'Zoe',   age:2, breed:'Labrador',         distance:2.4, image:'./dog1.jpg', online:true,
    verified:false, lastSeen:'2025-09-19T06:35:00Z',
    photos:['./dog1.jpg','./dog3.jpg'],
    character:'Socievole', energy:'Alta', living:'Ok con cani', area:'Portuense', posts:[] },
  { id:10, name:'Otto',  age:4, breed:'Jack Russell',     distance:6.3, image:'./dog2.jpg', online:false,
    verified:false, lastSeen:'2025-09-16T21:03:00Z',
    photos:['./dog2.jpg','./dog1.jpg'],
    character:'Cacciatore', energy:'Alta', living:'Passeggiate lunghe', area:'Anagnina', posts:[] },
  { id:11, name:'Paco',  age:3, breed:'Shiba Inu',        distance:5.1, image:'./dog3.jpg', online:true,
    verified:true, lastSeen:'2025-09-19T09:12:00Z',
    photos:['./dog3.jpg','./dog4.jpg'],
    character:'Furbo', energy:'Media', living:'Routine fissa', area:'Monti', posts:[] },
  { id:12, name:'Maya',  age:2, breed:'Golden Retriever', distance:4.8, image:'./dog4.jpg', online:true,
    verified:false, lastSeen:'2025-09-19T09:55:00Z',
    photos:['./dog4.jpg','./dog2.jpg'],
    character:'Solare', energy:'Alta', living:'Famiglia', area:'Parioli', posts:[] },
  { id:13, name:'Loki',  age:1, breed:'Labrador',         distance:3.5, image:'./dog1.jpg', online:true,
    verified:true, lastSeen:'2025-09-19T10:20:00Z',
    photos:['./dog1.jpg','./dog2.jpg','./dog4.jpg'],
    character:'Esploratore', energy:'Alta', living:'Ok con gatti', area:'Testaccio', posts:[] },
  { id:14, name:'Daisy', age:5, breed:'Golden Retriever', distance:8.2, image:'./dog4.jpg', online:true,
    verified:false, lastSeen:'2025-09-19T08:45:00Z',
    photos:['./dog4.jpg','./dog1.jpg'],
    character:'Calma', energy:'Bassa', living:'Giardino', area:'Cassia', posts:[] },
  { id:15, name:'Trixie',age:2, breed:'Jack Russell',     distance:1.9, image:'./dog2.jpg', online:true,
    verified:true, lastSeen:'2025-09-19T07:50:00Z',
    photos:['./dog2.jpg','./dog3.jpg'],
    character:'Sprintosa', energy:'Alta', living:'Sportiva', area:'Marconi', posts:[] },
  { id:16, name:'Hachi', age:3, breed:'Shiba Inu',        distance:6.0, image:'./dog3.jpg', online:true,
    verified:true, lastSeen:'2025-09-19T09:05:00Z',
    photos:['./dog3.jpg','./dog1.jpg'],
    character:'Leale', energy:'Media', living:'Tranquillità', area:'Balduina', posts:[] },
];

/* ====== STATO ====== */
let matches = new Set();
let currentView = 'near';   // near | browse | match
let deckIndex = 0;
// indice foto per ogni cane nel profilo
const photoIndexByDog = new Map();

const $  = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

const cardsEl  = $('#cards');
const deckEl   = $('#deck');
const detailEl = $('#detail');
const sheetEl  = $('#dogsheet');

/* ====== FILTRI ====== */
function getFilters(){
  const breed = $('#breedFilter')?.value || '';
  const age   = $('#ageFilter')?.value || '';
  return { breed, age };
}
function applyFilters(list){
  const { breed, age } = getFilters();
  let out = [...list];
  if (breed) out = out.filter(d => d.breed === breed);
  if (age === '0-1') out = out.filter(d => d.age <= 1);
  if (age === '2-3') out = out.filter(d => d.age >= 2 && d.age <= 3);
  if (age === '4+')  out = out.filter(d => d.age >= 4);
  return out;
}

/* ====== UTILS ====== */
function timeSince(iso){
  if (!iso) return '';
  const then = new Date(iso).getTime();
  const now  = Date.now();
  const diff = Math.max(0, now - then);
  const sec = Math.floor(diff/1000);
  const min = Math.floor(sec/60);
  const hr  = Math.floor(min/60);
  const day = Math.floor(hr/24);
  if (day>0) return `${day}g fa`;
  if (hr>0)  return `${hr}h fa`;
  if (min>0) return `${min}m fa`;
  return `ora`;
}

/* ====== RENDER ====== */
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
    if (!list.length){ deckEl.innerHTML=''; return; }
    if (deckIndex >= list.length) deckIndex = 0;
    renderDeck(list[deckIndex]);
  }
}

/* ====== GRID (Vicino/Match) ====== */
function renderGrid(list){
  if (!list.length){
    cardsEl.innerHTML = `<p style="padding:12px 16px;color:#6b7280">Nessun risultato qui.</p>`;
    return;
  }
  cardsEl.innerHTML = '';
  list.forEach(d=>{
    const el = document.createElement('article');
    el.className = 'card';
    el.innerHTML = `
      <div class="pic" style="position:relative">
        <img src="${d.image}" alt="Foto di ${d.name}" data-open="${d.id}">
        <span class="badge">${d.distance.toFixed(1)} km</span>
        ${d.online ? '<span class="dot"></span>' : ''}
        ${d.verified ? '<span title="Profilo verificato" style="position:absolute;left:10px;bottom:10px;background:#e0f2fe;color:#0369a1;border-radius:999px;padding:4px 8px;font-size:.8rem;font-weight:800;box-shadow:0 4px 12px rgba(0,0,0,.15)">✔️</span>' : ''}
      </div>
      <div class="body">
        <div class="name">${d.name}, ${d.age}</div>
        <div class="breed">${d.breed}</div>
        <div class="actions">
          <button class="btn-round btn-no" data-act="no"  data-id="${d.id}"><span class="emoji">🥲</span></button>
          <button class="btn-round btn-yes" data-act="yes" data-id="${d.id}"><span class="emoji">❤️</span></button>
        </div>
      </div>`;
    cardsEl.appendChild(el);
  });
}

/* ====== DECK (Scorri) — 1 card ====== */
function renderDeck(d){
  deckEl.innerHTML = `
    <article class="card card-big" id="deckCard">
      <div class="pic" style="position:relative">
        <img src="${d.image}" alt="Foto di ${d.name}" data-open="${d.id}">
        <span class="badge">${d.distance.toFixed(1)} km</span>
        ${d.online ? '<span class="dot"></span>' : ''}
        ${d.verified ? '<span title="Profilo verificato" style="position:absolute;left:10px;bottom:10px;background:#e0f2fe;color:#0369a1;border-radius:999px;padding:4px 8px;font-size:.8rem;font-weight:800;box-shadow:0 4px 12px rgba(0,0,0,.15)">✔️</span>' : ''}
      </div>
      <div class="body">
        <div class="name">${d.name}, ${d.age}</div>
        <div class="breed">${d.breed}</div>
        <div class="swipe-actions">
          <button class="btn-round btn-no" data-act="no"  data-id="${d.id}"><span class="emoji">🥲</span></button>
          <button class="btn-round btn-yes" data-act="yes" data-id="${d.id}"><span class="emoji">❤️</span></button>
        </div>
      </div>
    </article>`;
}

/* ====== DETTAGLIO a schermo intero (overlay JS, no CSS) ====== */
let savedScrollY = 0;
function showDetailOverlay(){
  savedScrollY = window.scrollY || 0;
  document.body.style.position = 'fixed';
  document.body.style.top = `-${savedScrollY}px`;
  document.body.style.left = '0';
  document.body.style.right = '0';
  document.body.style.width = '100%';

  detailEl.hidden = false;
  Object.assign(detailEl.style, {
    position:'fixed', inset:'0', background:'#fff', zIndex:'9999', overflowY:'auto'
  });
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

/* ====== PROFILO (galleria + post + badge + online) ====== */
function renderDetail(d){
  const photos = d.photos && d.photos.length ? d.photos : [d.image];
  const idx = photoIndexByDog.get(d.id) ?? 0;
  const total = photos.length;
  const current = ((idx % total) + total) % total;

  const thumbHtml = photos.map((p,i)=>`
    <img src="${p}" data-thumb="${i}" alt="thumb ${i+1}" 
         style="width:64px;height:64px;object-fit:cover;border-radius:10px;opacity:${i===current?1:.6};outline:${i===current?'3px solid #e9d5ff':'none'}">
  `).join('');

  const postsHtml = (d.posts && d.posts.length)
    ? d.posts.map(po=>`
        <div style="background:#fff;border-radius:14px;padding:12px;box-shadow:0 8px 20px rgba(0,0,0,.06);margin:10px 0">
          <div style="font-weight:700;margin-bottom:6px">${d.name}</div>
          <div style="color:#6b7280;font-size:.9rem;margin-bottom:8px">${po.ts}</div>
          <div>${po.text}</div>
        </div>
      `).join('')
    : `<div style="color:#9ca3af">Nessun aggiornamento ancora.</div>`;

  const verifiedBadge = d.verified
    ? `<span title="Profilo verificato" style="display:inline-flex;align-items:center;gap:6px;margin-left:8px;background:#e0f2fe;color:#0369a1;border-radius:999px;padding:4px 8px;font-size:.85rem;font-weight:700">✔️ Verificato</span>`
    : '';

  const onlineRow = d.online
    ? `<div class="drow"><strong>Stato:</strong> <span style="color:#10b981">🟢 Online ora</span></div>`
    : `<div class="drow"><strong>Stato:</strong> <span style="color:#6b7280">Ultimo accesso: ${timeSince(d.lastSeen)}</span></div>`;

  sheetEl.innerHTML = `
    <!-- Foto grande con contatore -->
    <div style="position:relative">
      <img id="bigPhoto" class="dphoto" src="${photos[current]}" alt="Foto di ${d.name}" 
           data-id="${d.id}" data-idx="${current}">
      <div style="position:absolute;right:10px;bottom:10px;background:#00000080;color:#fff;padding:6px 10px;border-radius:12px;font-weight:700">
        ${current+1}/${total}
      </div>
    </div>

    <!-- Thumbs -->
    <div style="display:flex;gap:10px;overflow:auto;padding:10px 12px 6px">
      ${thumbHtml}
    </div>

    <!-- Info -->
    <div class="dinfo">
      <h2 style="margin:0 0 6px;display:flex;align-items:center;flex-wrap:wrap;gap:6px">
        <span>${d.name}, ${d.age}</span>${verifiedBadge}
      </h2>
      <div class="dmeta">${d.breed} • ${d.distance.toFixed(1)} km</div>
      ${onlineRow}
      <div class="drow"><strong>Carattere:</strong> ${d.character}</div>
      <div class="drow"><strong>Energia:</strong> ${d.energy}</div>
      <div class="drow"><strong>Convivenza:</strong> ${d.living}</div>
      <div class="drow"><strong>Zona:</strong> ${d.area}</div>

      <div class="profile-actions">
        <button class="btn-round btn-no" data-act="no"  data-id="${d.id}"><span class="emoji">🥲</span></button>
        <button class="btn-round btn-yes" data-act="yes" data-id="${d.id}"><span class="emoji">❤️</span></button>
      </div>

      <h3 style="margin:16px 0 8px">Aggiornamenti</h3>
      ${postsHtml}
    </div>
  `;

  // swipe su foto grande (mobile)
  const big = document.getElementById('bigPhoto');
  let touchX = null;
  big.addEventListener('touchstart', (e)=>{
    touchX = e.changedTouches[0].clientX;
  }, {passive:true});
  big.addEventListener('touchend', (e)=>{
    if (touchX == null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    touchX = null;
    if (Math.abs(dx) < 30) return; // soglia
    const dir = dx < 0 ? 1 : -1;   // verso
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
  const card = button.closest('.card');
  if (!card) return;

  if (yes){
    card.animate(
      [
        { transform:'scale(1)', opacity:1 },
        { transform:'scale(1.04)', opacity:1 },
        { transform:'scale(.96)', opacity:.9 },
        { transform:'scale(.98)', opacity:.85 },
        { transform:'scale(1)', opacity:0 }
      ],
      { duration:280, easing:'ease-in-out' }
    ).onfinish = ()=> { render(); };
  } else {
    card.animate(
      [
        { transform:'translateX(0)' },
        { transform:'translateX(-6px)' },
        { transform:'translateX(6px)' },
        { transform:'translateX(-4px)' },
        { transform:'translateX(0)' }
      ],
      { duration:220, easing:'ease-in-out' }
    );
  }
}

function animateDeckAction(yes){
  const card = $('#deckCard');
  if (!card) return;

  const dir = yes ? 1 : -1;
  card.animate(
    [
      { transform:'translateX(0) rotate(0deg)', opacity:1 },
      { transform:`translateX(${dir*20}px) rotate(${dir*2}deg)`, opacity:1 },
      { transform:`translateX(${dir*120}px) rotate(${dir*8}deg)`, opacity:.0 }
    ],
    { duration:260, easing:'ease-in-out' }
  ).onfinish = ()=>{
    deckIndex = (deckIndex + 1) % applyFilters(dogs).length;
    render();
  };
}

/* ====== EVENTI ====== */
// Tabs
$$('.tab').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    $$('.tab').forEach(x=>x.classList.remove('active'));
    btn.classList.add('active');
    currentView = btn.dataset.view; // near | browse | match
    if (currentView === 'browse') deckIndex = 0;
    render();
  });
});

// Filtri
['breedFilter','ageFilter'].forEach(id=>{
  const el = document.getElementById(id);
  el?.addEventListener('change', ()=>{ deckIndex = 0; render(); });
});

// Geo (demo)
$('#locOn').addEventListener('click', ()=> alert('Posizione attivata (demo).'));
$('#locLater').addEventListener('click', ()=> alert('Ok, più tardi.'));

// Click globali
document.addEventListener('click', (e)=>{
  // Apri profilo
  const open = e.target.closest('[data-open]');
  if (open){ openDetail(Number(open.dataset.open)); return; }

  // Thumbnails nel profilo
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

  // Like/Nope
  const b = e.target.closest('button[data-id]');
  if (!b) return;
  const id  = Number(b.dataset.id);
  const act = b.dataset.act;
  const yes = (act === 'yes');

  if (yes) matches.add(id);
  else {
    const i = dogs.findIndex(d=>d.id===id);
    if (i>=0) dogs.push(...dogs.splice(i,1)); // skip → fondo
  }

  if (e.target.closest('.profile-actions')){
    // azione dal profilo: feedback rapido senza ricaricare tutto
    b.animate([{transform:'scale(1)'},{transform:'scale(1.12)'},{transform:'scale(1)'}],{duration:160});
    return;
  }

  if (currentView === 'browse') {
    animateDeckAction(yes);
  } else {
    animateGridAction(b, yes);
  }
});

// Chiudi profilo
$('#closeDetail').addEventListener('click', (e)=>{
  e.preventDefault();
  hideDetailOverlay();
});

/* ====== AVVIO ====== */
render();
