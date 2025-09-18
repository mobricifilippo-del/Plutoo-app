/* ===== dataset demo ===== */
const dogs = [
  { id:1, name:'Luna',  age:1, breed:'Jack Russell',      distance:2.2, image:'./dog1.jpg', online:true  },
  { id:2, name:'Rocky', age:3, breed:'Labrador',          distance:1.6, image:'./dog2.jpg', online:true  },
  { id:3, name:'Bella', age:2, breed:'Shiba Inu',         distance:3.2, image:'./dog3.jpg', online:false },
  { id:4, name:'Max',   age:4, breed:'Golden Retriever',  distance:5.9, image:'./dog4.jpg', online:true  },
  { id:5, name:'Milo',  age:1, breed:'Labrador',          distance:4.1, image:'./dog2.jpg', online:true  },
];

let matches = new Set();
let currentView = 'near'; // near | browse | match
let filters = { breed:'', age:'' };

const $  = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

function applyFilters(list){
  let out = [...list];
  if (filters.breed) out = out.filter(d => d.breed === filters.breed);
  if (filters.age){
    const [min,max] = filters.age.split('-').map(Number);
    out = out.filter(d => d.age >= min && d.age <= max);
  }
  return out;
}

function render(){
  const wrap = $('#cards');
  const grid = wrap.classList;
  wrap.innerHTML = '';

  let list = [...dogs];

  if (currentView === 'near'){
    list = list.filter(d => d.online).sort((a,b)=>a.distance-b.distance);
    grid.remove('single');
  }
  else if (currentView === 'browse'){
    grid.add('single');        // 1 card alla volta
  }
  else if (currentView === 'match'){
    list = list.filter(d => matches.has(d.id));
    grid.add('single');
  }

  list = applyFilters(list);

  if (list.length === 0){
    wrap.innerHTML = `<p style="color:#6b7280;padding:16px">Nessun risultato qui.</p>`;
    return;
  }

  list.forEach(d=>{
    const el = document.createElement('article');
    el.className = 'card';
    el.innerHTML = `
      <div class="pic">
        <img src="${d.image}" alt="Foto di ${d.name}">
        <span class="badge">${d.distance.toFixed(1)} km</span>
        ${d.online ? '<span class="dot"></span>' : ''}
      </div>
      <div class="body">
        <div class="name">${d.name}, ${d.age}</div>
        <div class="breed">${d.breed}</div>
        <div class="actions">
          <button class="btn-round btn-no"  data-id="${d.id}" data-act="no">✖</button>
          <button class="btn-round btn-yes" data-id="${d.id}" data-act="yes">❤</button>
        </div>
      </div>
    `;
    wrap.appendChild(el);
  });
}

/* ---- routing semplice con hash (#home / #list) ---- */
function go(view){
  if (view === 'list'){
    $('#home').style.display = 'none';
    $('#list').style.display = 'block';
  } else {
    $('#home').style.display = 'block';
    $('#list').style.display = 'none';
  }
}
window.addEventListener('hashchange', () => {
  go(location.hash.replace('#','') || 'home');
});
go(location.hash.replace('#','') || 'home');

/* ---- eventi ---- */
$('#enterLink').addEventListener('click', ()=> {
  location.hash = '#list';
});

$$('.tab').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    $$('.tab').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    currentView = btn.dataset.view;
    render();
  });
});

$('#cards').addEventListener('click',(e)=>{
  const b = e.target.closest('button[data-id]');
  if(!b) return;
  const id = +b.dataset.id;
  if (b.dataset.act==='yes'){
    matches.add(id);
  } else {
    const i = dogs.findIndex(d=>d.id===id);
    if (i>=0) dogs.push(...dogs.splice(i,1));
  }
  render();
});

/* filtri */
$('#filterBtn').addEventListener('click', ()=>{
  $('#filters').classList.toggle('hidden');
});
$('#applyFilters').addEventListener('click', ()=>{
  filters.breed = $('#breed').value.trim();
  filters.age   = $('#age').value.trim();
  render();
});
$('#clearFilters').addEventListener('click', ()=>{
  filters = {breed:'', age:''};
  $('#breed').value = ''; $('#age').value = '';
  render();
});

/* geoloc (demo) */
$('#locOn').addEventListener('click', ()=> alert('Posizione attivata (demo)'));
$('#locLater').addEventListener('click', ()=> alert('Ok, più tardi.'));

render();
