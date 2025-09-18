/* ---------- DATA (demo) ---------- */
const dogs = [
  { id:1, name:'Rocky', age:3, breed:'Labrador',         distance:1.6, image:'./dog1.jpg', online:true,
    character:'Giocherellone', energy:'Alta', living:'Ok altri cani / bimbi', area:'Roma Sud' },
  { id:2, name:'Luna',  age:1, breed:'Jack Russell',     distance:2.2, image:'./dog2.jpg', online:true,
    character:'Curiosa', energy:'Media', living:'Meglio giardino', area:'Roma Nord' },
  { id:3, name:'Bella', age:2, breed:'Shiba Inu',        distance:3.2, image:'./dog3.jpg', online:false,
    character:'Indipendente', energy:'Media', living:'Meglio cani tranquilli', area:'Roma Centro' },
  { id:4, name:'Max',   age:4, breed:'Golden Retriever', distance:5.9, image:'./dog4.jpg', online:true,
    character:'Dolce', energy:'Bassa', living:'Perfetto con famiglie', area:'Ostia' }
];

/* ---------- STATE ---------- */
let liked = new Set();
let currentTab = 'near';       // near | browse | match
let browseIndex = 0;           // indice per SCORRI (una card)

/* ---------- HELPERS ---------- */
const $  = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

function navigate(hash){
  const h = (hash || location.hash || '#home').replace('#','');
  $('#view-home').style.display   = (h==='home')   ? 'block' : 'none';
  $('#view-list').style.display   = (h==='list')   ? 'block' : 'none';
  $('#view-profile').style.display= (h.startsWith('profile')) ? 'block' : 'none';

  if(h==='list'){ render(); }
  if(h.startsWith('profile')){ const id = Number(h.split('-')[1]||'0'); renderProfile(id); }
}

/* ---------- RENDER LIST ---------- */
function render(){
  const wrap = $('#cards');
  wrap.classList.remove('single','single-wrap');
  wrap.innerHTML = '';

  let list = [...dogs];
  if(currentTab==='near'){
    list = list.filter(d=>d.online).sort((a,b)=>a.distance-b.distance);
    // 2 colonne
    wrap.className = 'grid';
    list.forEach(d => wrap.appendChild(cardHTML(d)));
  }
  else if(currentTab==='browse'){
    // 1 card sola, stile “Tinder”
    wrap.className = 'single-wrap';
    const d = list[browseIndex % list.length];
    const c = cardHTML(d,true);
    c.classList.add('single');
    wrap.appendChild(c);
  }
  else { // match
    list = list.filter(d=>liked.has(d.id));
    wrap.className = 'grid';
    if(list.length===0){ wrap.innerHTML = `<p style="padding:14px;color:#6b7280">Ancora nessun match. Premi ❤️ per aggiungere.</p>`; return; }
    list.forEach(d => wrap.appendChild(cardHTML(d)));
  }
}

function cardHTML(d, big=false){
  const el = document.createElement('article');
  el.className = 'card';
  el.innerHTML = `
    <div class="pic">
      <img src="${d.image}" alt="Foto di ${d.name}" data-open="${d.id}">
      <span class="badge">${d.distance.toFixed(1)} km</span>
      ${d.online ? '<span class="dot"></span>' : ''}
    </div>
    <div class="body">
      <div class="name" data-open="${d.id}">${d.name}, ${d.age}</div>
      <div class="breed">${d.breed}</div>
      <div class="actions">
        <button class="btn-round btn-no" data-act="no"  data-id="${d.id}">😭</button>
        <button class="btn-round btn-yes" data-act="yes" data-id="${d.id}">❤️</button>
      </div>
    </div>
  `;
  if(big){ el.querySelector('.pic img').style.height='280px'; }
  return el;
}

/* ---------- RENDER PROFILE ---------- */
function renderProfile(id){
  const d = dogs.find(x=>x.id===id);
  const box = $('#profileContent');
  if(!d){ box.innerHTML = `<p style="padding:16px">Profilo non trovato.</p>`; return; }
  box.innerHTML = `
    <div class="hero"><img src="${d.image}" alt="Foto di ${d.name}"></div>
    <div class="title">${d.name}, ${d.age}</div>
    <div class="sub">${d.breed} · ${d.distance.toFixed(1)} km</div>
    <dl>
      <dt>Carattere</dt><dd>${d.character}</dd>
      <dt>Energia</dt><dd>${d.energy}</dd>
      <dt>Convivenza</dt><dd>${d.living}</dd>
      <dt>Zona</dt><dd>${d.area}</dd>
    </dl>
  `;
}

/* ---------- EVENTS ---------- */
// routing
window.addEventListener('hashchange', ()=>navigate());
navigate(location.hash||'#home');

// forziamo #home se nessun hash
if(!location.hash) location.hash = '#home';

// tabs
$$('.tab').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    $$('.tab').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    currentTab = btn.dataset.view;
    render();
  });
});

// like / dislike + open profile + browse advance
$('#cards').addEventListener('click', (e)=>{
  const open = e.target.closest('[data-open]');
  if(open){ location.hash = `#profile-${open.dataset.open}`; return; }

  const btn = e.target.closest('button[data-id]');
  if(!btn) return;
  const id = Number(btn.dataset.id);

  if(btn.dataset.act==='yes'){
    liked.add(id);
  }else{
    // dislike: su SCORRI passiamo al prossimo
    if(currentTab==='browse'){ browseIndex = (browseIndex+1) % dogs.length; }
  }
  render();
});

// geoloc demo
$('#locOn').addEventListener('click',()=>alert('Posizione attivata (demo)'));
$('#locLater').addEventListener('click',()=>alert('Ok, più tardi'));
