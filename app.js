// ====== DATI DEMO ======
const DOGS = [
  { id:1, name:"Luna", age:1, breed:"Jack Russell", img:"dog4.jpg" },
  { id:2, name:"Sofia", age:5, breed:"Levriero Afgano", img:"dog1.jpg" },
  { id:3, name:"Rocky", age:4, breed:"Meticcio", img:"dog3.jpg" },
  { id:4, name:"Maya", age:3, breed:"Shiba Inu", img:"dog2.jpg" }
];

let favourites = new Set(); // match simulati
let lastCoords = null;

// ====== DOM ======
const enterBtn = document.getElementById('enterBtn');
const appEl   = document.getElementById('app');
const cardsEl = document.getElementById('cards');
const matchesEl = document.getElementById('matches');

const tabs = document.querySelectorAll('.tab');
const tabNearby = document.querySelector('[data-tab="nearby"]');
const tabMatches = document.querySelector('[data-tab="matches"]');

const locEnable = document.getElementById('locEnable');
const locLater  = document.getElementById('locLater');

// ====== FUNZIONI UTILI ======
function km(x){ return `${x.toFixed(1)} km`; }

function randomDistance(){
  // se ho posizione reale, simulerei una distanza in base alle coordinate;
  // per la demo basta random 0.8–6.5 km
  return 0.8 + Math.random()*5.7;
}

function renderCards(){
  const html = DOGS.map(d => {
    const dist = km(randomDistance());
    return `
      <article class="card" data-id="${d.id}">
        <div class="img-wrap">
          <img src="${d.img}" alt="${d.name}" loading="lazy">
          <span class="dot-online"></span>
        </div>
        <div class="info">
          <p class="name">${d.name}, ${d.age}</p>
          <p class="meta">${d.breed} <span class="km">${dist}</span></p>
        </div>
        <div class="actions">
          <button class="btn-round btn-no" data-action="no">✕</button>
          <button class="btn-round btn-yes" data-action="yes">❤</button>
        </div>
      </article>
    `;
  }).join('');
  cardsEl.innerHTML = html;
}

function renderMatches(){
  if(!favourites.size){
    matchesEl.innerHTML = `<p class="empty">Ancora nessun match. Metti qualche <span class="heart">❤️</span>!</p>`;
    return;
  }
  const selected = DOGS.filter(d => favourites.has(d.id));
  matchesEl.innerHTML = selected.map(d => `
    <article class="card">
      <div class="img-wrap"><img src="${d.img}" alt="${d.name}"></div>
      <div class="info">
        <p class="name">${d.name}, ${d.age}</p>
        <p class="meta">${d.breed}</p>
      </div>
    </article>
  `).join('');
}

// ====== EVENTI ======
enterBtn.addEventListener('click', () => {
  appEl.classList.remove('hidden');
  appEl.setAttribute('aria-hidden','false');
  document.getElementById('home').scrollIntoView({behavior:'smooth', block:'start'});
  renderCards();
});

// attiva posizione (demo: memorizzo coords se disponibili)
locEnable.addEventListener('click', () => {
  if(!navigator.geolocation){
    alert("Geolocalizzazione non disponibile sul dispositivo.");
    return;
  }
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      lastCoords = { lat: pos.coords.latitude, lon: pos.coords.longitude };
      renderCards(); // ricalcola (random) le distanze
    },
    () => { /* rifiutata: continuo con random */ renderCards(); }
  );
});

locLater.addEventListener('click', () => {
  renderCards();
});

// like / dislike
cardsEl.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-action]');
  if(!btn) return;
  const card = e.target.closest('.card');
  const id = Number(card.dataset.id);

  if(btn.dataset.action === 'yes'){
    favourites.add(id);
    btn.textContent = '❤'; // feedback
  }else{
    favourites.delete(id);
    card.style.opacity = .6;
  }
});

// tab switching
tabs.forEach(t => t.addEventListener('click', () => {
  tabs.forEach(x => x.classList.remove('active'));
  t.classList.add('active');

  const tab = t.dataset.tab;
  if(tab === 'nearby'){
    cardsEl.classList.remove('hidden');
    matchesEl.classList.add('hidden');
    renderCards();
  }else{
    cardsEl.classList.add('hidden');
    matchesEl.classList.remove('hidden');
    renderMatches();
  }
}));
