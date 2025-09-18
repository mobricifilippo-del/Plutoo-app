/* v1.4 – PWA + privacy banner + filtri + report; base perfetta intatta */

/* Dati demo (aggiunta taglia) */
const dogs = [
  { id:1, name:'Luna',  age:1, breed:'Jack Russell',     size:'S', distance:2.2, image:'./dog1.jpg',
    online:true,  about:'Cucciola sprint, ama inseguire la pallina.',
    temper:'Giocherellona', energy:'Alta', social:'Ottima con cani piccoli', area:'Centro', verified:true },
  { id:2, name:'Rocky', age:3, breed:'Labrador',         size:'L', distance:1.6, image:'./dog2.jpg',
    online:true,  about:'Socievole, adora correre al parco.',
    temper:'Dolce', energy:'Media', social:'Perfetto con bimbi', area:'Lungomare', verified:true },
  { id:3, name:'Bella', age:2, breed:'Shiba Inu',        size:'M', distance:3.2, image:'./dog3.jpg',
    online:true,  about:'Tranquilla, passeggiate soft.',
    temper:'Indipendente', energy:'Media', social:'Selettiva', area:'Parco Nord', verified:false },
  { id:4, name:'Max',   age:4, breed:'Golden Retriever', size:'L', distance:5.9, image:'./dog4.jpg',
    online:true,  about:'Super coccolone, educatissimo.',
    temper:'Gentile', energy:'Alta', social:'Ama compagnia', area:'Periferia', verified:true },
  { id:5, name:'Maya',  age:2, breed:'Border Collie',    size:'M', distance:2.9, image:'./dog2.jpg',
    online:true,  about:'Intelligentissima e attiva.',
    temper:'Vivace', energy:'Altissima', social:'Ottima con cani energici', area:'Villa', verified:true },
];

let liked = new Set();
let currentView = 'near';     // 'near' | 'browse' | 'match'
let browseIndex  = 0;

/* Helpers */
const $  = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const show = (el, on) => { el.hidden = !on; };

/* Router: #detail-<id> via JS, #list/#home via CSS :target */
function route(){
  const h = location.hash || '#home';
  if (h.startsWith('#detail-')) {
    $('#list').style.display = 'none'; $('#home').style.display = 'none';
    show($('#detail'), true);
    const id = Number(h.replace('#detail-',''));
    openDetail(id);
  } else {
    $('#list').style.display = ''; $('#home').style.display = '';
    show($('#detail'), false);
    if (h === '#list') { render(); window.scrollTo(0,0); }
  }
}
window.addEventListener('hashchange', route);

/* Render list/deck */
function render(){
  if (currentView === 'browse') {
    show($('#deck'), true); show($('#cards'), false);
    const pool = applyFilters(dogs);
    if (pool.length === 0) { $('#deckCard').innerHTML = `<div class="card" style="padding:16px">Nessun amico con questi filtri.</div>`; return; }
    if (browseIndex >= pool.length) browseIndex = 0;
    paintDeck(pool[browseIndex], pool);
    return;
  }
  show($('#deck'), false); show($('#cards'), true);

  let list = applyFilters(dogs);
  if (currentView === 'near') list = list.filter(d => d.online).sort((a,b)=> a.distance - b.distance);
  if (currentView === 'match') list = list.filter(d => liked.has(d.id));

  const wrap = $('#cards'); wrap.innerHTML = '';
  if (list.length === 0) { wrap.innerHTML = `<p style="padding:10px;color:#6b7280">Nessun amico con questi filtri.</p>`; return; }
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
  card.querySelector('[data-open]').addEventListener('click', ()=>{ location.hash = `#detail-${d.id}`; });
  card.querySelector('.btn-yes').addEventListener('click', ()=> liked.add(d.id));
  return card;
}

/* Scorri */
function paintDeck(d, pool){
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

  $('#swipeYes').onclick = ()=>{ liked.add(d.id); browseIndex = (browseIndex+1)%pool.length; paintDeck(pool[browseIndex], pool); };
  $('#swipeNo').onclick  = ()=>{ browseIndex = (browseIndex+1)%pool.length; paintDeck(pool[browseIndex], pool); };
}

/* Dettaglio */
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

  $('#pYes').onclick = ()=>{ liked.add(d.id); alert('Aggiunto ai preferiti ❤'); };
  $('#pNo').onclick  = ()=>{};
  $('#pReport').onclick = ()=>{ alert('Grazie. La tua segnalazione è stata inviata.'); };
}

/* Tabs (indice 0/1/2 → near/browse/match) */
const tabs = $$('.tab'); const views = ['near','browse','match'];
tabs.forEach((btn,i)=> btn.addEventListener('click', ()=>{ tabs.forEach(b=>b.classList.remove('active')); btn.classList.add('active'); currentView = views[i]||'near'; render(); }));

/* Geo demo */
$('#locOn').addEventListener('click', ()=> alert('Posizione attivata (demo).'));
$('#locLater').addEventListener('click', ()=> alert('Ok, più tardi.'));

/* Drawer filtri */
const drawer = $('#filters');
$('#openFilters').addEventListener('click', ()=> drawer.hidden = false);
$('#closeFilters').addEventListener('click', ()=> drawer.hidden = true);
$('#resetFilters').addEventListener('click', ()=>{ $('#fBreed').value=''; $('#fSize').value=''; $('#fAge').value=''; saveFilters(); render(); });
$('#filterForm').addEventListener('submit', e=>{ e.preventDefault(); saveFilters(); drawer.hidden = true; render(); });

function saveFilters(){
  const data = { breed: $('#fBreed').value.trim(), size: $('#fSize').value, age: Number($('#fAge').value||0) };
  localStorage.setItem('plutoo_filters', JSON.stringify(data));
}
function loadFilters(){
  try{
    const data = JSON.parse(localStorage.getItem('plutoo_filters')||'{}');
    if(data.breed) $('#fBreed').value = data.breed;
    if(data.size)  $('#fSize').value  = data.size;
    if(data.age)   $('#fAge').value   = data.age;
    return data;
  }catch{ return {}; }
}
function applyFilters(arr){
  const f = loadFilters();
  return arr.filter(d=>{
    if(f.breed && d.breed !== f.breed) return false;
    if(f.size  && d.size  !== f.size)  return false;
    if(f.age   && d.age   >  f.age)    return false;
    return true;
  });
}

/* Cookie/Privacy banner */
(function cookieBanner(){
  const bar = $('#cookieBar'), btn = $('#cookieOk');
  if(!localStorage.getItem('plutoo_cookie_ok')){
    bar.hidden = false;
    btn.onclick = ()=>{ localStorage.setItem('plutoo_cookie_ok','1'); bar.hidden = true; };
  }
})();

/* PWA: registra service worker se presente */
if('serviceWorker' in navigator){
  window.addEventListener('load', ()=> navigator.serviceWorker.register('./service-worker.js').catch(()=>{}));
}

/* Avvio */
route(); // applica hash corrente
