/* ====== Dataset demo ====== */
const dogs = [
  { id:1, name:'Luna',  age:1, breed:'Jack Russell',      distance:2.2, image:'./dog2.jpg', online:true,
    character:'Giocherellona', energy:'Alta',   living:'Ok con altri cani', area:'Ostia' },
  { id:2, name:'Rocky', age:3, breed:'Labrador',          distance:1.6, image:'./dog1.jpg', online:true,
    character:'Dolce',        energy:'Media',  living:'Ok con bambini',     area:'Garbatella' },
  { id:3, name:'Bella', age:2, breed:'Shiba Inu',         distance:3.2, image:'./dog3.jpg', online:true,
    character:'Curiosa',      energy:'Media',  living:'Meglio da sola',     area:'EUR' },
  { id:4, name:'Max',   age:4, breed:'Golden Retriever',  distance:5.9, image:'./dog4.jpg', online:true,
    character:'Tranquillo',   energy:'Bassa',  living:'Casa con giardino',  area:'Prati' },
  { id:5, name:'Milo',  age:1, breed:'Labrador',          distance:4.1, image:'./dog1.jpg', online:true,
    character:'Vivace',       energy:'Alta',   living:'Ok tutti',           area:'Trastevere' },
];

let matches = new Set();
let currentView = 'near';   // near | browse | match
let deckIndex = 0;

const $  = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

const cardsEl  = $('#cards');
const deckEl   = $('#deck');
const detailEl = $('#detail');
const sheetEl  = $('#dogsheet');

/* ===== Filtri ===== */
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

/* ===== Render ===== */
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
    if (list.length === 0){ deckEl.innerHTML=''; return; }
    if (deckIndex >= list.length) deckIndex = 0;
    renderDeck(list[deckIndex]);
  }
}

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

function renderDeck(d){
  deckEl.innerHTML = `
    <article class="card card-big">
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

/* ===== Dettaglio ===== */
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
  detailEl.hidden = false;
  detailEl.scrollIntoView({behavior:'smooth',block:'start'});
}

/* ===== Eventi ===== */
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

// Geoloc (demo)
$('#locOn').addEventListener('click', ()=> alert('Posizione attivata (demo).'));
$('#locLater').addEventListener('click', ()=> alert('Ok, più tardi.'));

// Like / Nope + Profilo
document.addEventListener('click', (e)=>{
  const open = e.target.closest('[data-open]');
  if (open){ openDetail(Number(open.dataset.open)); return; }

  const b = e.target.closest('button[data-id]');
  if (!b) return;
  const id  = Number(b.dataset.id);
  const act = b.dataset.act;

  if (act === 'yes') matches.add(id);
  else {
    const i = dogs.findIndex(d=>d.id===id);
    if (i>=0) dogs.push(...dogs.splice(i,1)); // manda in fondo
  }

  if (currentView === 'browse') deckIndex++;
  render();
});

// Chiudi dettaglio
$('#closeDetail').addEventListener('click', ()=> { detailEl.hidden = true; });

// Avvio
render();
