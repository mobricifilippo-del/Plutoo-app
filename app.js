/* ===== Dataset demo (aggiunti campi per dettaglio) ===== */
const dogs = [
  { id:1, name:'Rocky', age:3, breed:'Labrador', distance:1.6, image:'./dog1.jpg', online:true,
    about:'Socievole e giocherellone, adora correre al parco.',
    temper:'Affettuoso, curioso', energy:'Alta', social:'Ottimo con altri cani', area:'Quartiere Centro' },
  { id:2, name:'Luna', age:1, breed:'Jack Russell', distance:2.2, image:'./dog2.jpg', online:true,
    about:'Cucciola sprint, ama inseguire la pallina.',
    temper:'Vivace, dolce', energy:'Molto alta', social:'Buona con cani piccoli', area:'Lungomare' },
  { id:3, name:'Bella', age:2, breed:'Shiba Inu', distance:3.2, image:'./dog3.jpg', online:false,
    about:'Più tranquilla, le piace passeggiare con calma.',
    temper:'Indipendente', energy:'Media', social:'Selettiva', area:'Parco Nord' },
  { id:4, name:'Max', age:4, breed:'Golden Retriever', distance:5.9, image:'./dog4.jpg', online:true,
    about:'Super coccolone, educatissimo.',
    temper:'Gentile', energy:'Media', social:'Perfetto con famiglie', area:'Borgo Sud' },
];

let matches = new Set();
let currentView = 'near';              // 'near' | 'browse' | 'match'
let browseIndex = 0;                   // indice corrente per “Scorri”

/* ===== Helpers ===== */
const $  = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);

/* ===== Render ===== */
function render() {
  const wrap = $('#cards');
  wrap.innerHTML = '';

  let list = [...dogs];

  if (currentView === 'near') {
    $('#cards').classList.remove('one'); $('#cards').classList.add('two');
    list = list.filter(d => d.online).sort((a,b) => a.distance - b.distance);
  }
  if (currentView === 'match') {
    $('#cards').classList.remove('one'); $('#cards').classList.add('two');
    list = list.filter(d => matches.has(d.id));
  }
  if (currentView === 'browse') {
    $('#cards').classList.remove('two'); $('#cards').classList.add('one');
    // mostra UN SOLO cane: quello a browseIndex (ciclico sui soli online)
    const pool = dogs.filter(d => d.online).sort((a,b)=>a.distance-b.distance);
    if (pool.length === 0){
      wrap.innerHTML = `<p style="color:#6b7280;padding:10px 0">Nessuno online ora.</p>`;
      return;
    }
    const d = pool[(browseIndex % pool.length + pool.length) % pool.length];
    wrap.appendChild(makeCard(d, true)); // true = “solo” big card
    return;
  }

  if (list.length === 0) {
    wrap.innerHTML = `<p style="color:#6b7280;padding:10px 0">Ancora nessun match. Metti qualche ❤️!</p>`;
    return;
  }

  list.forEach(d => wrap.appendChild(makeCard(d, false)));
}

function makeCard(d, single){
  const card = document.createElement('article');
  card.className = 'card';
  card.dataset.id = d.id;
  card.innerHTML = `
    <div class="pic" data-open="1">
      <img src="${d.image}" alt="Foto di ${d.name}">
      <span class="badge">${d.distance.toFixed(1)} km</span>
      ${d.online ? '<span class="dot"></span>' : ''}
    </div>
    <div class="body">
      <div class="name">${d.name}, ${d.age}</div>
      <div class="breed">${d.breed}</div>
      <div class="actions">
        <button class="btn-round btn-no" data-act="no"   data-id="${d.id}">😢</button>
        <button class="btn-round btn-yes" data-act="yes"  data-id="${d.id}">❤️</button>
      </div>
    </div>
  `;
  // clic sulla foto → dettaglio
  card.querySelector('[data-open]').addEventListener('click', () => openDetail(d.id));
  return card;
}

/* ===== Dettaglio ===== */
function openDetail(id){
  const d = dogs.find(x => x.id === id);
  if(!d) return;
  $('#dPhoto').src = d.image;  $('#dPhoto').alt = `Foto di ${d.name}`;
  $('#dName').textContent = `${d.name}, ${d.age}`;
  $('#dMeta').textContent = `${d.breed} · ${d.distance.toFixed(1)} km ${d.online ? '· online' : ''}`;
  $('#dAbout').textContent = d.about || '';
  $('#dTemper').textContent = d.temper || '—';
  $('#dEnergy').textContent = d.energy || '—';
  $('#dSocial').textContent = d.social || '—';
  $('#dArea').textContent   = d.area   || '—';

  // mostra sezione detail
  $('#detail').classList.remove('hidden');
  // nasconde list & home
  $('#list').style.display = 'none';
  $('#home').style.display = 'none';
  // aggiorna hash (back funziona)
  location.hash = '#detail';
}

function closeDetail(){
  $('#detail').classList.add('hidden');
  $('#list').style.display = '';
}

/* ===== Eventi globali ===== */
$('#enterLink').addEventListener('click', () => {
  // solo smooth scroll se già su list nella stessa pagina
  // (ma usiamo hash per “schermate”, quindi basta il link)
});

// tabs
$('#tabs').addEventListener('click', (e)=>{
  const t = e.target.closest('.tab'); if(!t) return;
  $$('.tab').forEach(b=>b.classList.remove('active'));
  t.classList.add('active');
  currentView = t.dataset.view;
  render();
});

// Like/No
$('#cards').addEventListener('click', (e)=>{
  const btn = e.target.closest('button[data-id]');
  if(!btn) return;
  const id = Number(btn.dataset.id);

  if (btn.dataset.act === 'yes'){
    matches.add(id);
    btn.animate([{transform:'scale(1)'},{transform:'scale(1.12)'},{transform:'scale(1)'}], {duration:160});
    if(currentView==='browse'){ browseIndex++; }
  } else {
    // no → in browse avanza, in altre liste “sposta in fondo”
    if(currentView==='browse'){ browseIndex++; }
    else{
      const idx = dogs.findIndex(d=>d.id===id);
      if(idx>=0) dogs.push(...dogs.splice(idx,1));
    }
  }
  render();
});

// geo (demo)
$('#locOn').addEventListener('click', ()=> alert('Posizione attivata (demo).'));
$('#locLater').addEventListener('click', ()=> alert('Ok, più tardi.'));

// Gestione back da dettaglio
window.addEventListener('hashchange', ()=>{
  if(location.hash !== '#detail' && !$('#detail').classList.contains('hidden')){
    closeDetail();
  }
});

/* ===== Avvio ===== */
render();
