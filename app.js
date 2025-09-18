/* ===== Dataset demo ===== */
const dogs = [
  { id:1, name:'Rocky', age:3, breed:'Labrador',         distance:1.6, image:'./dog1.jpg', online:true  },
  { id:2, name:'Luna',  age:1, breed:'Jack Russell',     distance:2.2, image:'./dog2.jpg', online:true  },
  { id:3, name:'Bella', age:2, breed:'Shiba Inu',        distance:2.9, image:'./dog3.jpg', online:true  },
  { id:4, name:'Max',   age:4, breed:'Afghan Hound',     distance:3.2, image:'./dog4.jpg', online:true  },
  { id:5, name:'Milo',  age:2, breed:'Border Collie',    distance:3.9, image:'./dog1.jpg', online:true  }
];

let matches = new Set();
let currentView = 'near'; // near | browse | match

/* ===== Helpers ===== */
const $  = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

/* ===== Gestione viste ===== */
function showView(which){
  const home = $('#home');
  const list = $('#list');
  if (which === 'home'){
    home.style.display = 'block';
    list.style.display = 'none';
  } else {
    home.style.display = 'none';
    list.style.display = 'block';
  }
}
function goHome(){ showView('home'); }
function goList(){ showView('list'); }

$('#enterLink').addEventListener('click', goList);
$('#backHome').addEventListener('click', goHome);

/* ===== Render ===== */
function render(){
  const wrap = $('#cards');
  wrap.innerHTML = '';

  // griglia in base alla vista
  if (currentView === 'browse') {
    wrap.classList.remove('two'); wrap.classList.add('one');
  } else {
    wrap.classList.remove('one'); wrap.classList.add('two'); // 2 colonne
  }

  let list = [...dogs];
  if (currentView === 'near'){
    list = list.filter(d => d.online).sort((a,b)=>a.distance - b.distance);
  } else if (currentView === 'match'){
    list = list.filter(d => matches.has(d.id));
  }

  if (list.length === 0){
    wrap.innerHTML = `<p class="empty">Nessun risultato qui.</p>`;
    return;
  }

  // se "Scorri": un cane alla volta → prendiamo il primo
  if (currentView === 'browse'){ list = [list[0]]; }

  list.forEach(d => {
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
          <button class="btn-round btn-no"  data-act="no"  data-id="${d.id}">🥲</button>
          <button class="btn-round btn-yes" data-act="yes" data-id="${d.id}">❤️</button>
        </div>
      </div>
    `;
    wrap.appendChild(card);
  });
}

/* ===== Tabs ===== */
$$('.tab').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    $$('.tab').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    currentView = btn.dataset.view;
    render();
  });
});
// attiva “Vicino a te” all’avvio
document.querySelector('.tab[data-view="near"]').classList.add('active');

/* ===== Azioni sui cani ===== */
$('#cards').addEventListener('click', e=>{
  const t = e.target.closest('button[data-id]');
  if (!t) return;
  const id = Number(t.dataset.id);
  if (t.dataset.act === 'yes'){
    matches.add(id);
    t.animate([{ transform:'scale(1)' },{ transform:'scale(1.1)' },{ transform:'scale(1)' }], { duration: 160 });
  } else {
    // in "Scorri" simula skip → rigenera mostrando il prossimo
    if (currentView === 'browse'){
      const idx = dogs.findIndex(d=>d.id===id);
      if (idx>-1) dogs.push(...dogs.splice(idx,1));
    }
  }
  render();
});

/* ===== Geoloc (demo) ===== */
$('#locOn').addEventListener('click', ()=>alert('Posizione attivata (demo).'));
$('#locLater').addEventListener('click', ()=>alert('Ok, più tardi.'));

render(); // primo disegno
