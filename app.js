/* ===== Dataset demo con info profilo ===== */
const dogs = [
  { id:1, name:'Luna',  age:1, breed:'Jack Russell',     distance:2.2, image:'./dog1.jpg',
    online:true,  char:'Giocherellona, curiosa', energy:'Alta', mate:'Convive bene con altri cani', zone:'Centro' , verified:true },
  { id:2, name:'Rocky', age:3, breed:'Labrador',         distance:1.6, image:'./dog2.jpg',
    online:true,  char:'Dolce e paziente',    energy:'Media', mate:'Ottimo con bambini',         zone:'Lungomare', verified:true },
  { id:3, name:'Bella', age:2, breed:'Shiba Inu',        distance:3.2, image:'./dog3.jpg',
    online:false, char:'Indipendente',        energy:'Media', mate:'Meglio cani piccoli',        zone:'Parco Nord', verified:false },
  { id:4, name:'Max',   age:4, breed:'Golden Retriever', distance:5.9, image:'./dog4.jpg',
    online:true,  char:'Affettuoso',          energy:'Alta',  mate:'Ama compagnia',              zone:'Periferia', verified:true },
];

/* ===== Stato ===== */
let matches = new Set();
let currentView = 'near';   // 'near' | 'browse' | 'match'
let swipeIndex  = 0;        // per la vista "Scorri"

/* ===== Helpers ===== */
const $  = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const show = (el, v) => (el.hidden = !v);

/* ===== Routing semplice su hash ===== */
function route() {
  const hash = location.hash || '#home';
  show($('#home'),    hash === '#home');
  show($('#list'),    hash === '#list');
  show($('#profile'), hash.startsWith('#profile'));

  if (hash === '#list') {
    setView(currentView);   // render secondo tab
  } else if (hash.startsWith('#profile')) {
    const id = Number(new URLSearchParams(hash.split('?')[1]).get('id'));
    openProfile(id);
  }
}
window.addEventListener('hashchange', route);

/* ===== Render LISTA a coppie ===== */
function renderGrid(list) {
  const wrap = $('#grid');
  wrap.innerHTML = '';
  list.forEach(d => {
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <div class="pic">
        <img src="${d.image}" alt="Foto di ${d.name}">
        <span class="badge">${d.distance.toFixed(1)} km</span>
        ${d.online ? '<span class="dot"></span>' : ''}
      </div>
      <div class="body">
        <div class="name">${d.name}, ${d.age}</div>
        <div class="breed">${d.breed}</div>
        <div class="actions">
          <button class="btn-round btn-no" aria-label="No"><span class="emoji">😭</span></button>
          <button class="btn-round btn-yes" aria-label="Mi piace"><span class="emoji">❤️</span></button>
        </div>
      </div>
    `;
    // click apre profilo
    card.querySelector('.pic').addEventListener('click', () => {
      location.hash = `#profile?id=${d.id}`;
    });
    // like / dislike
    card.querySelector('.btn-yes').addEventListener('click', () => { matches.add(d.id); });
    card.querySelector('.btn-no').addEventListener('click',  () => {});
    wrap.appendChild(card);
  });
}

/* ===== Render DECK singola card (Scorri) ===== */
function renderDeck(list) {
  const card = $('#deckCard');
  card.innerHTML = '';
  if (list.length === 0) {
    card.innerHTML = `<div class="card body" style="padding:20px">Nessun elemento.</div>`;
    return;
  }
  if (swipeIndex >= list.length) swipeIndex = 0;
  const d = list[swipeIndex];

  card.className = 'card card-big';
  card.innerHTML = `
    <div class="pic">
      <img src="${d.image}" alt="Foto di ${d.name}">
      <span class="badge">${d.distance.toFixed(1)} km</span>
      ${d.online ? '<span class="dot"></span>' : ''}
    </div>
    <div class="body">
      <div class="name">${d.name}, ${d.age}</div>
      <div class="breed">${d.breed}</div>
    </div>
  `;

  card.querySelector('.pic').addEventListener('click', () => {
    location.hash = `#profile?id=${d.id}`;
  });

  $('#swipeYes').onclick = () => { matches.add(d.id); swipeIndex++; renderDeck(list); };
  $('#swipeNo').onclick  = () => { swipeIndex++; renderDeck(list); };
}

/* ===== Tabs / viste ===== */
function setView(view) {
  currentView = view;
  $$('.tab').forEach(b => b.classList.toggle('active', b.dataset.view === view));

  let list = [...dogs];
  if (view === 'near')  list = list.filter(d => d.online).sort((a,b)=>a.distance-b.distance);
  if (view === 'match') list = list.filter(d => matches.has(d.id));

  const useDeck = (view === 'browse');  // “Scorri” = una sola card
  show($('#deck'), useDeck);
  show($('#grid'), !useDeck);

  if (useDeck) { renderDeck(list); }
  else         { renderGrid(list);  }
}

/* ===== Profilo ===== */
function openProfile(id) {
  const d = dogs.find(x => x.id === id);
  if (!d) return location.hash = '#list';

  $('#pImg').src = d.image;
  $('#pImg').alt = `Foto di ${d.name}`;
  $('#pName').textContent = `${d.name}, ${d.age}`;
  $('#pBreed').textContent = d.breed;
  $('#pChar').textContent = d.char;
  $('#pEnergy').textContent = d.energy;
  $('#pMate').textContent = d.mate;
  $('#pZone').textContent = d.zone;
  $('#pBadge').style.display = d.verified ? 'inline-flex' : 'none';

  $('#pYes').onclick = () => { matches.add(d.id); alert('Aggiunto ai preferiti ❤'); };
  $('#pNo').onclick  = () => { alert('Capito 😭'); };
}

/* ===== Eventi iniziali ===== */
$('#locOn').addEventListener('click', () => alert('Posizione attivata (demo).'));
$('#locLater').addEventListener('click', () => alert('Ok, più tardi.'));

$$('.tab').forEach(btn => btn.addEventListener('click', () => setView(btn.dataset.view)));

route();           // prima render secondo hash
if (!location.hash) location.hash = '#home';
