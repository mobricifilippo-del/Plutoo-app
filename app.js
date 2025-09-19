/* ====== Dataset demo ====== */
const dogs = [
  { id:1, name:'Luna',  age:1, breed:'Jack Russell',      distance:2.2, image:'./dog1.jpg', online:true,  verified:true,
    photos:['./dog1.jpg','./dog1b.jpg'], posts:[{text:'Passeggiata al parco!',ts:'2025-09-10'}] },
  { id:2, name:'Rocky', age:3, breed:'Labrador',          distance:1.6, image:'./dog2.jpg', online:true,  verified:true,
    photos:['./dog2.jpg'], posts:[] },
  { id:3, name:'Bella', age:2, breed:'Shiba Inu',         distance:3.2, image:'./dog3.jpg', online:false, verified:false,
    photos:['./dog3.jpg'], posts:[{text:'Riposo sotto il sole ☀️',ts:'2025-09-12'}] },
  { id:4, name:'Max',   age:4, breed:'Golden Retriever',  distance:5.9, image:'./dog4.jpg', online:true,  verified:true,
    photos:['./dog4.jpg','./dog4b.jpg','./dog4c.jpg'], posts:[] },
];

let matches = new Set();
let currentView = 'near'; // 'near' | 'browse' | 'match'
let currentDog = null;

/* ====== Helpers ====== */
const $ = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);

/* ====== Render list/grid ====== */
function render() {
  const wrap = $('#cards');
  wrap.innerHTML = '';

  let list = [...dogs];
  if (currentView === 'near') {
    list = list.filter(d => d.online).sort((a,b) => a.distance - b.distance);
  } else if (currentView === 'browse') {
    // tutti
  } else if (currentView === 'match') {
    list = list.filter(d => matches.has(d.id));
  }

  if (list.length === 0) {
    wrap.innerHTML = `<p style="color:#6b7280;padding:10px 0">Nessun cane trovato.</p>`;
    return;
  }

  list.forEach(d => {
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <div class="pic">
        <img src="${d.image}" alt="Foto di ${d.name}" data-id="${d.id}" class="dog-link">
        <span class="badge">${d.distance.toFixed(1)} km</span>
        ${d.online ? '<span class="dot"></span>' : ''}
      </div>
      <div class="body">
        <div class="name">
          ${d.name}, ${d.age}
          ${d.verified ? '<span class="badge-verify">🐾</span>' : ''}
        </div>
        <div class="breed">${d.breed}</div>
        <div class="actions">
          <button class="btn-round btn-no" data-act="no" data-id="${d.id}">🥲</button>
          <button class="btn-round btn-yes" data-act="yes" data-id="${d.id}">❤</button>
        </div>
      </div>
    `;
    wrap.appendChild(card);
  });
}

/* ====== Profilo dettagliato ====== */
function openDetail(dog) {
  currentDog = dog;
  const detail = $('#detail');
  detail.innerHTML = `
    <div class="dogsheet">
      <img src="${dog.photos[0] || dog.image}" class="dphoto" alt="${dog.name}">
      <div class="dinfo">
        <h2>${dog.name}, ${dog.age} ${dog.verified ? '<span class="badge-verify">🐾</span>' : ''}</h2>
        <div class="dmeta">${dog.breed} · ${dog.distance.toFixed(1)} km ${dog.online ? '· 🟢 Online' : ''}</div>
        <div class="drow"><strong>Carattere:</strong> Giocherellone</div>
        <div class="drow"><strong>Energia:</strong> Alta</div>
        <div class="drow"><strong>Zona:</strong> Roma</div>
        <h3>Aggiornamenti</h3>
        <div class="posts">
          ${dog.posts && dog.posts.length ? dog.posts.map(p => `
            <div class="post"><div class="ptxt">${p.text}</div><div class="pts">${p.ts}</div></div>
          `).join('') : '<p>Nessun aggiornamento.</p>'}
        </div>
      </div>
      <div class="profile-actions">
        <button class="btn-round btn-no" data-act="no" data-id="${dog.id}">🥲</button>
        <button class="btn-round btn-yes" data-act="yes" data-id="${dog.id}">❤</button>
      </div>
      <button id="closeDetail" class="chip" style="margin:16px">Chiudi</button>
    </div>
  `;
  detail.hidden = false;
}

function closeDetail() {
  $('#detail').hidden = true;
  currentDog = null;
}

/* ====== Eventi ====== */
$('#cards').addEventListener('click', (e) => {
  const img = e.target.closest('.dog-link');
  if (img) {
    const id = Number(img.dataset.id);
    const dog = dogs.find(d => d.id === id);
    if (dog) openDetail(dog);
  }
  const btn = e.target.closest('button[data-id]');
  if (!btn) return;
  const id = Number(btn.dataset.id);
  if (btn.dataset.act === 'yes') {
    matches.add(id);
  } else {
    const idx = dogs.findIndex(d => d.id === id);
    if (idx >= 0) dogs.push(...dogs.splice(idx,1));
  }
  render();
});

document.body.addEventListener('click', e => {
  if (e.target.id === 'closeDetail') closeDetail();
});

/* Tabs */
$$('.tab').forEach(btn => {
  btn.addEventListener('click', () => {
    $$('.tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentView = btn.dataset.view;
    render();
  });
});

/* Geolocalizzazione demo */
$('#locOn').addEventListener('click', () => alert('Posizione attivata (demo).'));
$('#locLater').addEventListener('click', () => alert('Ok, più tardi.'));

/* ====== Start ====== */
render();
