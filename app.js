// ===================
// Dati demo
// ===================
const DOGS = [
  { id:1, name:'Luna',  age:1, breed:'Jack Russell',     dist:2.2, img:'dog3.jpg', online:true },
  { id:2, name:'Sofia', age:5, breed:'Levriero Afgano',  dist:1.6, img:'dog1.jpg', online:true },
  { id:3, name:'Rocky', age:4, breed:'Meticcio',         dist:5.9, img:'dog2.jpg', online:true },
  { id:4, name:'Maya',  age:3, breed:'Shiba Inu',        dist:3.2, img:'dog4.jpg', online:true },
];

let likes = new Set();     // id dei like
let swipeIndex = 0;        // indice per la modalità "Scorri"

// Utility DOM
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

// ===================
// Inizializzazione
// ===================
document.addEventListener('DOMContentLoaded', () => {
  // Stato iniziale: home
  document.body.classList.add('page-home');

  bindEnter();
  bindTabs();
  renderNearby();
  initSwipe();
  renderMatches(); // vuoto all’inizio
});

// ===================
// HOME → LISTS
// ===================
function bindEnter(){
  const btn = $('#enterBtn');
  if(!btn) return;
  btn.addEventListener('click', e => {
    e.preventDefault();
    goLists();
  });
}

function goLists(){
  document.body.classList.remove('page-home');
  document.body.classList.add('page-lists');
  // vista predefinita: "Vicino a te"
  switchTab('nearby');
  window.scrollTo({top:0, behavior:'instant'});
}

// ===================
// Tabs
// ===================
function bindTabs(){
  $$('.tab').forEach(t => {
    t.addEventListener('click', () => {
      $$('.tab').forEach(x=>x.classList.remove('active'));
      t.classList.add('active');
      switchTab(t.dataset.tab);
    });
  });
}

function switchTab(id){
  $$('.tabpanel, .tabpanel').forEach(p => p.classList.remove('active')); // compatibilità
  const panel = document.getElementById(id);
  if(panel) panel.classList.add('active');
  // aria
  $$('.tab').forEach(tab=>{
    tab.setAttribute('aria-selected', tab.dataset.tab===id ? 'true' : 'false');
  });
}

// ===================
// VICINO A TE (griglia)
// ===================
function renderNearby(){
  const grid = $('#cardsGrid');
  if(!grid) return;
  grid.innerHTML = '';

  DOGS.forEach(d => {
    const card = document.createElement('article');
    card.className = 'card';

    card.innerHTML = `
      <img class="photo" src="${d.img}" alt="${d.name}" />
      <div class="meta">
        <div class="row">
          <div class="name">${d.name}, ${d.age}</div>
          <div class="distance">${d.dist} km</div>
        </div>
        <div class="grey">${d.breed}</div>
      </div>
      <div class="actions">
        <button class="btn-nix" data-id="${d.id}">✖</button>
        <button class="btn-like" data-id="${d.id}">❤</button>
      </div>
    `;

    card.querySelector('.btn-like').addEventListener('click', () => {
      likes.add(d.id);
      renderMatches();
    });
    card.querySelector('.btn-nix').addEventListener('click', () => {
      // azione demo: rimuove la card dalla vista
      card.style.pointerEvents='none';
      card.style.opacity='.4';
    });

    grid.appendChild(card);
  });
}

// ===================
// SCORRI
// ===================
function initSwipe(){
  swipeIndex = 0;
  updateSwipe();
  const yes = $('#btnYes'), no = $('#btnNo');
  if(yes) yes.addEventListener('click', likeCurrent);
  if(no)  no.addEventListener('click', skipCurrent);
}

function currentDog(){
  return DOGS[swipeIndex] || null;
}

function updateSwipe(){
  const dog = currentDog();
  const card = $('#swipeCard');
  const empty = $('#swipeEmpty');
  if(!card || !empty) return;

  if(!dog){
    card.classList.add('is-empty');
    empty.classList.remove('hidden');
    return;
  }

  empty.classList.add('hidden');
  card.classList.remove('is-empty');
  $('#swipePhoto').src = dog.img;
  $('#swipePhoto').alt = dog.name;
  $('#swipeName').textContent = dog.name;
  $('#swipeAge').textContent = dog.age;
  $('#swipeBreed').textContent = dog.breed;
  $('#swipeDist').textContent = `${dog.dist} km`;
}

function likeCurrent(){
  const dog = currentDog();
  if(!dog) return;
  likes.add(dog.id);
  renderMatches();
  swipeIndex++;
  updateSwipe();
}

function skipCurrent(){
  swipeIndex++;
  updateSwipe();
}

// ===================
// MATCH
// ===================
function renderMatches(){
  const list = $('#matchList');
  const empty = $('#matchEmpty');
  if(!list || !empty) return;

  const items = DOGS.filter(d => likes.has(d.id));
  list.innerHTML = '';

  if(items.length === 0){
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';

  items.forEach(d => {
    const row = document.createElement('div');
    row.className = 'match';
    row.innerHTML = `
      <img src="${d.img}" alt="${d.name}" />
      <div>
        <div class="title">${d.name}</div>
        <div class="grey">${d.breed}</div>
      </div>
    `;
    list.appendChild(row);
  });
}

// ===================
// GEO (demo)
// ===================
const geoEnable = $('#geoEnable');
const geoLater  = $('#geoLater');
if(geoEnable){
  geoEnable.addEventListener('click', ()=>{
    geoEnable.textContent = 'Ok!';
    geoEnable.disabled = true;
  });
}
if(geoLater){
  geoLater.addEventListener('click', ()=> {
    document.querySelector('.geo-banner')?.remove();
  });
}
