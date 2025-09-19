/* v1.4 – Lista + Scorri + Match + Profilo + Ricerca personalizzata (tendina)
   - Mantiene il comportamento esistente
   - Aggiunge filtri con salvataggio in localStorage
*/

/* ====== Dataset demo ====== */
const dogs = [
  { id:1, name:'Luna',  age:1, breed:'Jack Russell',      distance:2.2, image:'./dog1.jpg', online:true,  sex:'F', size:'Piccola', coat:'Corto',  energy:'Alta',  pedigree:'si', verified:true },
  { id:2, name:'Rocky', age:3, breed:'Labrador',          distance:1.6, image:'./dog2.jpg', online:true,  sex:'M', size:'Grande', coat:'Corto',  energy:'Media', pedigree:'no', verified:true },
  { id:3, name:'Bella', age:2, breed:'Shiba Inu',         distance:3.2, image:'./dog3.jpg', online:false, sex:'F', size:'Media',  coat:'Medio',  energy:'Alta',  pedigree:'si', verified:false },
  { id:4, name:'Max',   age:4, breed:'Golden Retriever',  distance:5.9, image:'./dog4.jpg', online:true,  sex:'M', size:'Grande', coat:'Lungo',  energy:'Bassa', pedigree:'no', verified:true },
  // qualcosina in più per test filtri
  { id:5, name:'Milo',  age:1, breed:'Beagle',            distance:4.1, image:'./dog1.jpg', online:true,  sex:'M', size:'Piccola', coat:'Corto', energy:'Alta', pedigree:'no', verified:false },
  { id:6, name:'Nala',  age:6, breed:'Barboncino',        distance:2.4, image:'./dog2.jpg', online:true,  sex:'F', size:'Piccola', coat:'Lungo', energy:'Media', pedigree:'si', verified:true },
  { id:7, name:'Kira',  age:5, breed:'Border Collie',     distance:3.2, image:'./dog3.jpg', online:true,  sex:'F', size:'Media',  coat:'Medio', energy:'Alta', pedigree:'si', verified:false },
  { id:8, name:'Odin',  age:8, breed:'Pastore Tedesco',   distance:7.3, image:'./dog4.jpg', online:true,  sex:'M', size:'Grande', coat:'Medio', energy:'Media', pedigree:'no', verified:true },
  { id:9, name:'Zoe',   age:2, breed:'Meticcio',          distance:1.9, image:'./dog1.jpg', online:true,  sex:'F', size:'Media',  coat:'Corto', energy:'Bassa', pedigree:'no', verified:false },
  { id:10,name:'Argo',  age:4, breed:'Labrador',          distance:2.7, image:'./dog2.jpg', online:true,  sex:'M', size:'Grande', coat:'Corto', energy:'Alta', pedigree:'si', verified:true },
];

let matches = new Set();
let currentView = 'near'; // 'near' | 'browse' | 'match'

/* ====== Stato filtri (persistente) ====== */
const defaultFilters = {
  breed:'', age:'', sex:'', size:'', coat:'', energy:'', pedigree:'', distance:''
};
const saved = JSON.parse(localStorage.getItem('pl_filters') || 'null');
let filters = saved && typeof saved==='object' ? {...defaultFilters, ...saved} : {...defaultFilters};

/* ====== Helpers ====== */
const $  = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);

function saveFilters(){
  localStorage.setItem('pl_filters', JSON.stringify(filters));
}

function ageInRange(age, token){
  if(!token) return true;
  if(token==='0-1') return age<=1;
  if(token==='2-4') return age>=2 && age<=4;
  if(token==='5-7') return age>=5 && age<=7;
  if(token==='8+')  return age>=8;
  return true;
}

/* ====== Rendering ====== */
function applyFilters(list){
  return list.filter(d=>{
    if(filters.breed && d.breed !== filters.breed) return false;
    if(filters.sex && d.sex !== filters.sex) return false;
    if(filters.size && d.size !== filters.size) return false;
    if(filters.coat && d.coat !== filters.coat) return false;
    if(filters.energy && d.energy !== filters.energy) return false;
    if(filters.pedigree && d.pedigree !== filters.pedigree) return false;
    if(filters.distance && d.distance > Number(filters.distance)) return false;
    if(!ageInRange(d.age, filters.age)) return false;
    return true;
  });
}

function updateChips(){
  const host = $('#activeChips');
  host.innerHTML = '';
  const nice = {
    breed:'Razza', age:'Età', sex:'Sesso', size:'Taglia', coat:'Pelo',
    energy:'Energia', pedigree:'Pedigree', distance:'Distanza'
  };
  Object.entries(filters).forEach(([k,v])=>{
    if(!v) return;
    const c = document.createElement('span');
    c.className='chip-x';
    c.innerHTML = `<strong>${nice[k]}:</strong> ${v} <button aria-label="rimuovi" data-del="${k}">×</button>`;
    host.appendChild(c);
  });
  host.addEventListener('click', (e)=>{
    const b = e.target.closest('button[data-del]');
    if(!b) return;
    const key = b.dataset.del;
    filters[key] = '';
    syncFormFromState();
    saveFilters();
    render();
  }, {once:true});
}

function render(){
  const wrap = $('#cards');
  const countLabel = $('#countLabel');
  wrap.className = (currentView==='browse') ? 'deck' : 'grid';
  wrap.innerHTML = '';

  let list = [...dogs];

  if (currentView === 'near') {
    list = list.filter(d => d.online).sort((a,b) => a.distance - b.distance);
  } else if (currentView === 'browse') {
    // tutti, ordine come sono
  } else if (currentView === 'match') {
    list = list.filter(d => matches.has(d.id));
  }

  // applica filtri personalizzati
  list = applyFilters(list);

  // conteggio
  countLabel.textContent = `Mostro ${list.length} cani`;

  if (list.length === 0) {
    wrap.innerHTML = `<p style="color:#6b7280;padding:10px 14px">Nessun risultato con questi filtri.</p>`;
    return;
  }

  if (currentView==='browse') {
    // UNO alla volta (deck)
    const d = list[0];
    wrap.innerHTML = buildCardHtml(d, true);
    return;
  }

  // griglia
  list.forEach(d => {
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = buildCardHtml(d, false);
    wrap.appendChild(card);
  });

  updateChips();
}

function buildCardHtml(d, big){
  const verify = d.verified ? `<span class="badge-verify" title="Profilo verificato"><span class="paw">🐾</span></span>` : '';
  const img = `<div class="pic">
      <img src="${d.image}" alt="Foto di ${d.name}">
      <span class="badge">${d.distance.toFixed(1)} km</span>
      ${d.online ? '<span class="dot-online"></span>' : ''}
    </div>`;
  const body = `<div class="body">
      <div class="name">
        ${d.name}, ${d.age}
        ${verify}
      </div>
      <div class="breed">${d.breed}</div>
      <div class="actions">
        <button class="btn-round btn-no" data-act="no" data-id="${d.id}" title="Scarta"><span class="emoji">🥲</span></button>
        <button class="btn-round btn-yes" data-act="yes" data-id="${d.id}" title="Mi piace"><span class="emoji">❤️</span></button>
      </div>
    </div>`;
  if (big) {
    return `<article class="card card-big" data-card="${d.id}">
      ${img}${body}
    </article>`;
  }
  return img + body;
}

/* ====== Eventi UI ====== */
// Entra → hash #list (già fa lo switch, qui niente)
$('#enterLink')?.addEventListener('click', ()=>{ /* solo per future analytics */ });

// Tabs
$$('.tab').forEach(btn => {
  btn.addEventListener('click', () => {
    $$('.tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentView = btn.dataset.view;
    render();
  });
});

// Like / Dislike + apertura profilo
$('#cards').addEventListener('click', (e) => {
  const likeBtn = e.target.closest('button[data-id]');
  if (likeBtn) {
    const id = Number(likeBtn.dataset.id);
    if (likeBtn.dataset.act === 'yes') {
      matches.add(id);
      likeBtn.animate([{ transform:'scale(1)' },{ transform:'scale(1.1)' },{ transform:'scale(1)' }], { duration: 160 });
    } else {
      // invia la card in fondo (simula "skippa")
      const idx = dogs.findIndex(d => d.id === id);
      if (idx >= 0) dogs.push(...dogs.splice(idx,1));
    }
    render();
    return;
  }
  // click su immagine → profilo
  const card = e.target.closest('[data-card], .card .pic, .card .body');
  if (!card) return;
  const art = e.target.closest('.card, .card-big');
  if (!art) return;
  const img = art.querySelector('img');
  if (!img) return;
  const nameEl = art.querySelector('.name');
  const nameText = nameEl ? nameEl.textContent : '';
  const dog = findDogFromCard(art) || dogs.find(d => nameText?.includes(d.name));
  if (!dog) return;
  openDogProfile(dog);
});

function findDogFromCard(art){
  // prova con badge distanza unico
  const title = art.querySelector('.breed')?.textContent;
  if(!title) return null;
  const name = art.querySelector('.name')?.textContent?.split(',')[0]?.trim();
  return dogs.find(d => d.name===name);
}

/* ====== Profili ====== */
function openDogProfile(d){
  // Sostituisce il contenuto di #cards con la scheda completa
  const wrap = $('#cards');
  $('#countLabel').textContent = '';
  wrap.className = 'detail';
  wrap.innerHTML = `
    <article class="dogsheet">
      <img class="dphoto" src="${d.image}" alt="Foto di ${d.name}">
      <div class="dinfo">
        <h2>${d.name}, ${d.age} ${d.verified ? '<span class="badge-verify"><span class="paw">🐾</span></span>' : ''}</h2>
        <div class="dmeta">${d.breed} · ${d.sex==='M'?'Maschio':'Femmina'} · Taglia ${d.size}</div>
        <div class="drow"><strong>Pelo:</strong> ${d.coat}</div>
        <div class="drow"><strong>Energia:</strong> ${d.energy}</div>
        <div class="drow"><strong>Pedigree:</strong> ${d.pedigree==='si'?'Sì':'No'}</div>
        <div class="drow"><strong>Distanza:</strong> ${d.distance.toFixed(1)} km</div>
        <div class="profile-actions">
          <button class="chip btn-no" data-act="no" data-id="${d.id}">🥲</button>
          <button class="chip chip-primary btn-yes" data-act="yes" data-id="${d.id}">❤️</button>
          <button class="chip" id="backToList">Torna alla lista</button>
        </div>
      </div>
    </article>
  `;

  $('#backToList').addEventListener('click', render);
}

/* ====== Geolocalizzazione (finto feedback) ====== */
$('#locOn').addEventListener('click', () => alert('Posizione attivata (demo).'));
$('#locLater').addEventListener('click', () => alert('Ok, più tardi.'));

/* ====== Pannello filtri ====== */
const panel = $('#filterPanel');
$('#filterToggle').addEventListener('click', ()=>{
  const isHidden = panel.hasAttribute('hidden');
  if(isHidden) panel.removeAttribute('hidden'); else panel.setAttribute('hidden','');
});

function syncFormFromState(){
  const form = $('#filterForm');
  Object.entries(filters).forEach(([k,v])=>{
    const el = form.elements[k];
    if(!el) return;
    el.value = v ?? '';
  });
  updateChips();
}

$('#filterForm').addEventListener('submit', (e)=>{
  e.preventDefault();
  const fd = new FormData(e.currentTarget);
  filters = {...defaultFilters};
  for (const [k,v] of fd.entries()){
    filters[k] = (v ?? '').toString().trim();
  }
  saveFilters();
  panel.setAttribute('hidden','');
  render();
});

$('#filtersReset').addEventListener('click', ()=>{
  filters = {...defaultFilters};
  saveFilters();
  syncFormFromState();
  render();
});

/* ====== Avvio ====== */
syncFormFromState();
render();
