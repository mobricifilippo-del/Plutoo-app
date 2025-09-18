/* ===== Dataset demo ===== */
const dogs = [
  { id:1, name:'Luna',  age:1, breed:'Jack Russell',      distance:2.2, image:'./dog1.jpg', online:true,
    profile:{ char:'Dolce e curiosa', energy:'Alta', home:'Bimbi ok • Gatti no', zone:'Roma EUR' } },
  { id:2, name:'Rocky', age:3, breed:'Labrador',          distance:1.6, image:'./dog2.jpg', online:true,
    profile:{ char:'Socievole', energy:'Media', home:'Tutti ok', zone:'Roma Ostia' } },
  { id:3, name:'Bella', age:2, breed:'Shiba Inu',         distance:3.2, image:'./dog3.jpg', online:false,
    profile:{ char:'Indipendente', energy:'Media', home:'Solo cani', zone:'Roma Prati' } },
  { id:4, name:'Max',   age:4, breed:'Golden Retriever',  distance:5.9, image:'./dog4.jpg', online:true,
    profile:{ char:'Giocherellone', energy:'Alta', home:'Tutti ok', zone:'Roma Centro' } },
  { id:5, name:'Milo',  age:2, breed:'Beagle',            distance:4.4, image:'./dog1.jpg', online:true,
    profile:{ char:'Testardo simpatico', energy:'Alta', home:'Bimbi ok', zone:'Roma Tiburtina' } },
];

let matches = new Set();
let currentView = 'near';    // near | scroll | match
let scrollIndex = 0;

/* ===== Helpers ===== */
const $  = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

function byNear(list){ return list.filter(d => d.online).sort((a,b)=>a.distance-b.distance); }

/* ===== Rendering ===== */
function renderList(){
  const wrap = $('#cards');
  wrap.classList.remove('two-cols');
  wrap.innerHTML = '';

  let list = [...dogs];

  if (currentView === 'near'){
    list = byNear(list);
    wrap.classList.add('two-cols');        // 2 colonne
  } else if (currentView === 'match'){
    list = list.filter(d => matches.has(d.id));
    wrap.classList.add('two-cols');
  } else if (currentView === 'scroll'){
    const base = byNear(list);
    if (base.length === 0){ wrap.innerHTML = emptyMsg(); return; }
    if (scrollIndex >= base.length) scrollIndex = 0;
    list = [ base[scrollIndex] ];
  }

  if (list.length === 0){ wrap.innerHTML = emptyMsg(); return; }

  list.forEach(d => wrap.appendChild(cardEl(d)));
}

function cardEl(d){
  const el = document.createElement('article');
  el.className = 'card';
  el.innerHTML = `
    <div class="pic">
      <img src="${d.image}" alt="Foto di ${d.name}">
      <span class="badge">${d.distance.toFixed(1)} km</span>
      ${d.online ? '<span class="dot" title="online"></span>' : ''}
    </div>
    <div class="body">
      <div class="name">${d.name}, ${d.age}</div>
      <div class="breed">${d.breed}</div>
      <div class="actions">
        <button class="btn-round btn-no" data-act="no" data-id="${d.id}" title="Passo">🥲</button>
        <button class="btn-round btn-yes" data-act="yes" data-id="${d.id}" title="Mi piace">❤️</button>
      </div>
    </div>
  `;
  el.querySelector('.pic img').addEventListener('click', ()=>openProfile(d));
  el.querySelector('.name').addEventListener('click', ()=>openProfile(d));
  return el;
}

function emptyMsg(){ return `<p class="muted" style="padding:14px;text-align:center">Nessun risultato qui.</p>`; }

/* ===== Profilo ===== */
function openProfile(d){
  const sec = $('#profile');
  $('#pImage').src = d.image; $('#pImage').alt = `Foto di ${d.name}`;
  $('#pName').textContent = `${d.name}, ${d.age}`;
  $('#pBreed').textContent = d.breed;
  $('#profileTitle').textContent = d.name;
  $('#pChar').textContent   = d.profile?.char   ?? '—';
  $('#pEnergy').textContent = d.profile?.energy ?? '—';
  $('#pHome').textContent   = d.profile?.home   ?? '—';
  $('#pZone').textContent   = d.profile?.zone   ?? '—';
  $('#pYes').onclick = ()=>{ matches.add(d.id); closeProfile(); renderList(); };
  $('#pNo').onclick  = ()=>{ skip(d.id); closeProfile(); renderList(); };
  sec.classList.remove('hidden'); sec.setAttribute('aria-hidden','false');
  location.hash = '#profile';
}
function closeProfile(){
  const sec = $('#profile');
  sec.classList.add('hidden'); sec.setAttribute('aria-hidden','true');
  location.hash = '#list';
}

/* ===== Azioni ===== */
function like(id){ matches.add(id); }
function skip(id){ const idx = dogs.findIndex(d => d.id === id); if (idx>=0){ dogs.push(...dogs.splice(idx,1)); } }

/* ===== Eventi globali ===== */
$('#cards').addEventListener('click',(e)=>{
  const btn = e.target.closest('button[data-id]'); if (!btn) return;
  const id = Number(btn.dataset.id);
  if (btn.dataset.act === 'yes'){ like(id); } else { skip(id); }
  if (currentView === 'scroll'){ scrollIndex = 0; }
  renderList();
});
$$('.tab').forEach(t => t.addEventListener('click', ()=>{
  $$('.tab').forEach(x => x.classList.remove('active'));
  t.classList.add('active');
  currentView = t.dataset.view;
  renderList();
}));
$('#locOn')?.addEventListener('click', ()=>alert('Posizione attivata (demo).'));
$('#locLater')?.addEventListener('click', ()=>alert('Ok, più tardi.'));
$('#profileBack').addEventListener('click', (e)=>{ e.preventDefault(); closeProfile(); });

/* ===== Avvio ===== */
function init(){ if (location.hash === '#list' || location.hash === '') currentView = 'near'; renderList(); }
window.addEventListener('hashchange', ()=>{ if (location.hash === '#list'){ closeProfile(); } });
init();
