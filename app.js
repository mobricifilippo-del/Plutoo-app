/* v1.3 – Adattato al tuo HTML “lungo” (Entra = <a href="#list">, tab senza data-attr) */

/* ===== Dati demo (tutti online) ===== */
const dogs = [
  { id:1, name:'Luna',  age:1, breed:'Jack Russell',     distance:2.2, image:'./dog1.jpg',
    online:true, about:'Cucciola sprint, ama inseguire la pallina.',
    temper:'Giocherellona', energy:'Alta', social:'Ottima con cani piccoli', area:'Centro', verified:true },
  { id:2, name:'Rocky', age:3, breed:'Labrador',         distance:1.6, image:'./dog2.jpg',
    online:true, about:'Socievole, adora correre al parco.',
    temper:'Dolce', energy:'Media', social:'Perfetto con bimbi', area:'Lungomare', verified:true },
  { id:3, name:'Bella', age:2, breed:'Shiba Inu',        distance:3.2, image:'./dog3.jpg',
    online:true, about:'Tranquilla, passeggiate soft.',
    temper:'Indipendente', energy:'Media', social:'Selettiva', area:'Parco Nord', verified:false },
  { id:4, name:'Max',   age:4, breed:'Golden Retriever', distance:5.9, image:'./dog4.jpg',
    online:true, about:'Super coccolone, educatissimo.',
    temper:'Gentile', energy:'Alta', social:'Ama compagnia', area:'Periferia', verified:true },
  // quinto per riempire di più la griglia (riusa un’immagine)
  { id:5, name:'Maya',  age:2, breed:'Border Collie',    distance:2.9, image:'./dog2.jpg',
    online:true, about:'Intelligentissima e attiva.',
    temper:'Vivace', energy:'Altissima', social:'Ottima con cani energici', area:'Villa', verified:true },
];

let liked = new Set();
let currentView = 'near';     // 'near' | 'browse' | 'match'
let browseIndex  = 0;

/* ===== Helpers ===== */
const $  = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const show = (el, on) => { el.hidden = !on; };

/* ===== Router: #detail-<id> gestito via JS, #list/#home via CSS :target ===== */
function route(){
  const h = location.hash || '#home';
  if (h.startsWith('#detail-')) {
    // nascondi list & home (anche se :target mostra list, lo forziamo)
    $('#list').style.display = 'none';
    $('#home').style.display = 'none';
    show($('#detail'), true);
    const id = Number(h.replace('#detail-',''));
    openDetail(id);
  } else {
    // ritorna il controllo a CSS :target
    $('#list').style.display = '';
    $('#home').style.display = '';
    show($('#detail'), false);
    if (h === '#list') {
      // quando entri in list, renderizza la vista attuale e scrollTop
      render();
      window.scrollTo(0,0);
    }
  }
}
window.addEventListener('hashchange', route);

/* ===== Render LIST ===== */
function render(){
  if (currentView === 'browse') {
    show($('#deck'), true);
    show($('#cards'), false);
    const pool = [...dogs]; // tutti (tutti online in demo)
    if (pool.length === 0) { $('#deckCard').innerHTML = `<div style="padding:16px">Nessun amico.</div>`; return; }
    if (browseIndex >= pool.length) browseIndex = 0;
    paintDeck(pool[browseIndex]);
    return;
  }

  // near/match → griglia a coppie
  show($('#deck'), false);
  show($('#cards'), true);

  let list = [...dogs];
  if (currentView === 'near') {
    list = list.filter(d => d.online).sort((a,b)=> a.distance - b.distance);
  } else { // match
    list = list.filter(d => liked.has(d.id));
  }

  const wrap = $('#cards');
  wrap.innerHTML = '';
  if (list.length === 0) {
    wrap.innerHTML = `<p style="color:#6b7280;padding:10px 0">Ancora nessun match. Premi ❤️.</p>`;
    return;
  }

  list.forEach(d => wrap.appendChild(makeCard(d)));
}

function makeCard(d){
  const card = document.createElement('article');
  card.className = 'card';
  card.innerHTML = `
    <div class="pic" data-open="${d.id}">
      <img loading="lazy" src="${d.image}" alt="Foto di ${d.name}">
      <span class="badge">${d.distance.toFixed(1)} km</span>
      ${d.online ? '<span class="dot"></span>' : ''}
    </div>
    <div class="body">
      <div class="name">${d.name}, ${d.age}</div>
      <div class="breed">${d.breed}</div>
      <div class="actions">
        <button class="btn-round btn-no"  aria-label="No"><span class="emoji">🥲</span></button>
        <button class="btn-round btn-yes" aria-label="Mi piace"><span class="emoji">❤️</span></button>
      </div>
    </div>
  `;
  // apri profilo
  card.querySelector('[data-open]').addEventListener('click', ()=>{ location.hash = `#detail-${d.id}`; });
  // like
  card.querySelector('.btn-yes').addEventListener('click', ()=> liked.add(d.id));
  return card;
}

/* ===== Scorri (una card) ===== */
function paintDeck(d){
  const card = $('#deckCard');
  card.className = 'card card-big';
  card.innerHTML = `
    <div class="pic" data-open="${d.id}">
      <img loading="lazy" src="${d.image}" alt="Foto di ${d.name}">
      <span class="badge">${d.distance.toFixed(1)} km</span>
      ${d.online ? '<span class="dot"></span>' : ''}
    </div>
    <div class="body">
      <div class="name">${d.name}, ${d.age}</div>
      <div class="breed">${d.breed}</div>
    </div>
  `;
  card.querySelector('[data-open]').addEventListener('click', ()=>{ location.hash = `#detail-${d.id}`; });

  $('#swipeYes').onclick = ()=>{ liked.add(d.id); browseIndex = (browseIndex+1)%dogs.length; paintDeck(dogs[browseIndex]); };
  $('#swipeNo').onclick  = ()=>{ browseIndex = (browseIndex+1)%dogs.length; paintDeck(dogs[browseIndex]); };
}

/* ===== Dettaglio ===== */
function openDetail(id){
  const d = dogs.find(x => x.id === id);
  if (!d) { location.hash = '#list'; return; }
  $('#dPhoto').src = d.image; $('#dPhoto').alt = `Foto di ${d.name}`;
  $('#dName').textContent = `${d.name}, ${d.age}`;
  $('#dMeta').textContent = `${d.breed} · ${d.distance.toFixed(1)} km ${d.online ? '· online' : ''} ${d.verified ? '· 🔒 profilo sicuro' : ''}`;
  $('#dAbout').textContent = d.about || '';
  $('#dTemper').textContent = d.temper || '—';
  $('#dEnergy').textContent = d.energy || '—';
  $('#dSocial').textContent = d.social || '—';
  $('#dArea').textContent   = d.area   || '—';

  // azioni nel profilo
  $('#pYes').onclick = ()=>{ liked.add(d.id); alert('Aggiunto ai preferiti ❤'); };
  $('#pNo').onclick  = ()=>{};
}

/* ===== Tabs (senza data-view nell’HTML): mappo per indice ===== */
const tabs = $$('.tab');
const views = ['near','browse','match'];
tabs.forEach((btn, i) => {
  btn.addEventListener('click', () => {
    tabs.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentView = views[i] || 'near';
    render();
  });
});

/* ===== Geo demo ===== */
$('#locOn').addEventListener('click', ()=> alert('Posizione attivata (demo).'));
$('#locLater').addEventListener('click', ()=> alert('Ok, più tardi.'));

/* ===== Avvio ===== */
route();                // applica subito la logica hash/home/list/detail
// se non c’è hash, resta su HOME (CSS gestisce)
