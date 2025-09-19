/* ====== DATASET AMPLIATO ====== */
const dogs = [
  { id:1,  name:'Luna',  age:1, breed:'Jack Russell',     distance:2.2, image:'./dog2.jpg', online:true,  character:'Giocherellona', energy:'Alta', living:'Ok con altri cani', area:'Ostia' },
  { id:2,  name:'Rocky', age:3, breed:'Labrador',         distance:1.6, image:'./dog1.jpg', online:true,  character:'Dolce',         energy:'Media',living:'Ok con bambini',   area:'Garbatella' },
  { id:3,  name:'Bella', age:2, breed:'Shiba Inu',        distance:3.2, image:'./dog3.jpg', online:true,  character:'Curiosa',       energy:'Media',living:'Meglio da sola',   area:'EUR' },
  { id:4,  name:'Max',   age:4, breed:'Golden Retriever', distance:5.9, image:'./dog4.jpg', online:true,  character:'Tranquillo',    energy:'Bassa',living:'Giardino',         area:'Prati' },
  { id:5,  name:'Milo',  age:1, breed:'Labrador',         distance:4.1, image:'./dog1.jpg', online:true,  character:'Vivace',        energy:'Alta', living:'Ok tutti',         area:'Trastevere' },
  { id:6,  name:'Kira',  age:2, breed:'Jack Russell',     distance:2.9, image:'./dog2.jpg', online:false, character:'Attenta',       energy:'Alta', living:'Casa e parco',     area:'Centocelle' },
  { id:7,  name:'Thor',  age:5, breed:'Golden Retriever', distance:7.0, image:'./dog4.jpg', online:true,  character:'Affettuoso',    energy:'Media',living:'Famiglia',         area:'Tiburtina' },
  { id:8,  name:'Nala',  age:3, breed:'Shiba Inu',        distance:3.7, image:'./dog3.jpg', online:true,  character:'Indipendente',  energy:'Media',living:'Meglio da sola',   area:'San Paolo' },
  { id:9,  name:'Zoe',   age:2, breed:'Labrador',         distance:2.4, image:'./dog1.jpg', online:true,  character:'Socievole',     energy:'Alta', living:'Ok con cani',      area:'Portuense' },
  { id:10, name:'Otto',  age:4, breed:'Jack Russell',     distance:6.3, image:'./dog2.jpg', online:false, character:'Cacciatore',    energy:'Alta', living:'Passeggiate lunghe',area:'Anagnina' },
  { id:11, name:'Paco',  age:3, breed:'Shiba Inu',        distance:5.1, image:'./dog3.jpg', online:true,  character:'Furbo',         energy:'Media',living:'Routine fissa',    area:'Monti' },
  { id:12, name:'Maya',  age:2, breed:'Golden Retriever', distance:4.8, image:'./dog4.jpg', online:true,  character:'Solare',        energy:'Alta', living:'Famiglia',         area:'Parioli' },
  { id:13, name:'Loki',  age:1, breed:'Labrador',         distance:3.5, image:'./dog1.jpg', online:true,  character:'Esploratore',   energy:'Alta', living:'Ok con gatti',     area:'Testaccio' },
  { id:14, name:'Daisy', age:5, breed:'Golden Retriever', distance:8.2, image:'./dog4.jpg', online:true,  character:'Calma',         energy:'Bassa',living:'Giardino',         area:'Cassia' },
  { id:15, name:'Trixie',age:2, breed:'Jack Russell',     distance:1.9, image:'./dog2.jpg', online:true,  character:'Sprintosa',     energy:'Alta', living:'Sportiva',         area:'Marconi' },
  { id:16, name:'Hachi', age:3, breed:'Shiba Inu',        distance:6.0, image:'./dog3.jpg', online:true,  character:'Leale',         energy:'Media',living:'Tranquillità',     area:'Balduina' },
];

/* ====== STATO ====== */
let matches = new Set();
let currentView = 'near';   // near | browse | match
let deckIndex = 0;

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
      <div class="pic">
        <img src="${d.image}" alt="Foto di ${d.name}" data-open="${d.id}">
        <span class="badge">${d.distance.toFixed(1)} km</span>
        ${d.online ? '<span class="dot"></span>' : ''}
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
      <div class="pic">
        <img src="${d.image}" alt="Foto di ${d.name}" data-open="${d.id}">
        <span class="badge">${d.distance.toFixed(1)} km</span>
        ${d.online ? '<span class="dot"></span>' : ''}
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
function openDetail(id){
  const d = dogs.find(x=>x.id===id);
  if (!d) return;
  sheetEl.innerHTML = `
    <img class="dphoto" src="${d.image}" alt="Foto di ${d.name}">
    <div class="dinfo">
      <h2 style="margin:0 0 6px">${d.name}, ${d.age}</h2>
      <div class="dmeta">${d.breed} • ${d.distance.toFixed(1)} km</div>
      <div class="drow"><strong>Carattere:</strong> ${d.character}</div>
      <div class="drow"><strong>Energia:</strong> ${d.energy}</div>
      <div class="drow"><strong>Convivenza:</strong> ${d.living}</div>
      <div class="drow"><strong>Zona:</strong> ${d.area}</div>
      <div class="profile-actions">
        <button class="btn-round btn-no" data-act="no"  data-id="${d.id}"><span class="emoji">🥲</span></button>
        <button class="btn-round btn-yes" data-act="yes" data-id="${d.id}"><span class="emoji">❤️</span></button>
      </div>
    </div>`;
  showDetailOverlay();
}

/* ====== ANIMAZIONI ====== */
function animateGridAction(button, yes){
  const card = button.closest('.card');
  if (!card) return;

  if (yes){
    // Pop + fade
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
    // Shake leggero
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

  // Like/Nope
  const b = e.target.closest('button[data-id]');
  if (!b) return;
  const id  = Number(b.dataset.id);
  const act = b.dataset.act;
  const yes = (act === 'yes');

  if (yes) matches.add(id);
  else {
    // sposta il cane in fondo (skip)
    const i = dogs.findIndex(d=>d.id===id);
    if (i>=0) dogs.push(...dogs.splice(i,1));
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
