/* === Dataset demo === */
const dogs = [
  { id:1, name:'Luna',  age:1, breed:'Jack Russell',      distance:2.2, image:'./dog2.jpg', online:true  },
  { id:2, name:'Rocky', age:3, breed:'Labrador',          distance:1.6, image:'./dog1.jpg', online:true  },
  { id:3, name:'Milo',  age:1, breed:'Labrador',          distance:4.1, image:'./dog1.jpg', online:true  },
  { id:4, name:'Max',   age:4, breed:'Golden Retriever',  distance:5.9, image:'./dog4.jpg', online:true  },
];

let matches = new Set();
let currentView = 'near';      // near | browse | match
let browseIndex = 0;           // indice per Scorri (una card alla volta)

const $  = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

/* ===== Render ===== */
function render() {
  const wrap = $('#cards');
  wrap.innerHTML = '';

  let list = [];

  if (currentView === 'near') {
    wrap.classList.remove('single');
    list = dogs.filter(d=>d.online).sort((a,b)=>a.distance-b.distance);
  }

  if (currentView === 'browse') {
    wrap.classList.add('single');
    list = [ dogs[browseIndex % dogs.length] ];   // UNA card
  }

  if (currentView === 'match') {
    wrap.classList.remove('single');
    list = dogs.filter(d=>matches.has(d.id));
  }

  if (!list.length) {
    wrap.innerHTML = `<p style="color:#6b7280;padding:10px;text-align:center">Nessun risultato qui.</p>`;
    return;
  }

  list.forEach(d=>{
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <div class="pic">
        <img src="${d.image}" alt="Foto di ${d.name}">
        <span class="badge">${d.distance.toFixed(1)} km</span>
        ${d.online ? '<span class="dot-online"></span>' : ''}
      </div>
      <div class="body">
        <div class="name">${d.name}, ${d.age}</div>
        <div class="breed">${d.breed}</div>
        <div class="actions">
          <button class="btn-round btn-no"  data-act="no"  data-id="${d.id}" aria-label="Scarta">🥲</button>
          <button class="btn-round btn-yes" data-act="yes" data-id="${d.id}" aria-label="Mi piace">❤️</button>
        </div>
      </div>`;
    wrap.appendChild(card);

    // click card → profilo (placeholder)
    card.addEventListener('click',(e)=>{
      if (e.target.closest('button')) return;
      alert(`Profilo di ${d.name} (placeholder).`);
    });
  });
}

/* ===== Eventi ===== */
// Tabs
$$('.tab').forEach(btn=>{
  btn.addEventListener('click',()=>{
    $$('.tab').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    currentView = btn.dataset.view;       // near | browse | match
    render();
  });
});
// Attiva tab iniziale
document.querySelector('.tab[data-view="near"]').classList.add('active');

// Like/No
$('#cards').addEventListener('click', (e)=>{
  const t = e.target.closest('button[data-id]');
  if (!t) return;
  const id = Number(t.dataset.id);

  if (t.dataset.act === 'yes') matches.add(id);

  if (currentView === 'browse') {
    browseIndex = (browseIndex + 1) % dogs.length;  // passa al prossimo
  } else {
    t.animate([{transform:'scale(1)'},{transform:'scale(1.08)'},{transform:'scale(1)'}],{duration:180});
  }
  render();
});

// Geo (demo)
$('#locOn').addEventListener('click',()=>alert('Posizione attivata (demo).'));
$('#locLater').addEventListener('click',()=>alert('Ok, più tardi.'));

// Start
render();
