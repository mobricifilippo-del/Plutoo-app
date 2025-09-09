// Dati demo (singola foto per cane)
const DOGS = [
  {id:1, name:'Luna',  age:1, breed:'Jack Russell',   dist:2.2, img:'dog3.jpg'},
  {id:2, name:'Sofia', age:5, breed:'Levriero Afgano',dist:1.6, img:'dog1.jpg'},
  {id:3, name:'Rocky', age:4, breed:'Meticcio',       dist:5.9, img:'dog2.jpg'},
  {id:4, name:'Maya',  age:3, breed:'Shiba Inu',      dist:3.2, img:'dog4.jpg'}
];

const qs = s => document.querySelector(s);
const qsa = s => [...document.querySelectorAll(s)];

function showPage(id){
  qsa('.page').forEach(p => p.classList.add('hidden'));
  qs('#'+id).classList.remove('hidden');
}

function setActiveTab(which){
  qsa('.tab').forEach(t => t.classList.remove('active'));
  qsa('.tab-content').forEach(c => c.classList.add('hidden'));
  qs(`.tab[data-tab="${which}"]`).classList.add('active');
  qs(`#tab-${which}`).classList.remove('hidden');
}

// Render “Vicino a te”
function renderNearby(){
  const wrap = qs('#nearbyList');
  wrap.innerHTML = '';
  DOGS.forEach(d => {
    wrap.insertAdjacentHTML('beforeend', `
      <article class="card">
        <img src="${d.img}" alt="${d.name}">
        <div class="info">
          <div class="row">
            <div class="name">${d.name}, ${d.age}</div>
            <div class="meta">${d.dist} km</div>
          </div>
          <div class="meta">${d.breed}</div>
        </div>
        <div class="actions">
          <button class="no"  data-id="${d.id}">✖</button>
          <button class="yes" data-id="${d.id}">❤</button>
        </div>
      </article>
    `);
  });
}

// Render stack “Scorri”
function renderSwipe(){
  const stack = qs('#swipeStack');
  stack.innerHTML = '';
  [...DOGS].reverse().forEach(d => {
    const card = document.createElement('div');
    card.className = 'swipe-card';
    card.dataset.id = d.id;
    card.innerHTML = `
      <img src="${d.img}" alt="${d.name}">
      <div class="info">
        <div class="row">
          <div class="name">${d.name}, ${d.age}</div>
          <div class="meta">${d.dist} km</div>
        </div>
        <div class="meta">${d.breed}</div>
      </div>`;
    stack.appendChild(card);
  });
}

function likeTop(liked){
  const stack = qs('#swipeStack');
  const top = stack.lastElementChild;
  if(!top) return;
  top.style.transition = 'transform .25s ease, opacity .25s ease';
  top.style.transform = `translate(${liked?'+120':'-120'}%, -10%) rotate(${liked?'+12':'-12'}deg)`;
  top.style.opacity = '0';
  setTimeout(()=> top.remove(), 250);
  if(liked){
    const id = +top.dataset.id;
    const dog = DOGS.find(d=>d.id===id);
    addMatch(dog);
  }
}

function addMatch(d){
  const list = qs('#matchList');
  qs('#matchEmpty').style.display = 'none';
  list.insertAdjacentHTML('afterbegin', `
    <article class="card">
      <img src="${d.img}" alt="${d.name}">
      <div class="info">
        <div class="row">
          <div class="name">${d.name}, ${d.age}</div>
          <div class="meta">Match!</div>
        </div>
        <div class="meta">${d.breed}</div>
      </div>
    </article>
  `);
}

document.addEventListener('DOMContentLoaded', () => {
  // 1) Entra → va alla pagina liste
  qs('#enterBtn').addEventListener('click', () => {
    showPage('lists');
    setActiveTab('nearby');
    renderNearby();
    renderSwipe();
  });

  // 2) Tabs
  qsa('.tab').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const name = btn.dataset.tab;
      setActiveTab(name);
    });
  });

  // 3) Bottoni swipe
  qs('#btnNo').addEventListener('click', ()=> likeTop(false));
  qs('#btnYes').addEventListener('click',()=> likeTop(true));

  // 4) Like/No direttamente dalle card “Vicino a te”
  qs('#lists').addEventListener('click', (e)=>{
    if(e.target.matches('.actions .yes')){
      const id = +e.target.dataset.id;
      const dog = DOGS.find(d=>d.id===id);
      addMatch(dog);
    }
    if(e.target.matches('.actions .no')){
      e.target.closest('.card').remove();
    }
  });

  // (opzionale) finta geolocalizzazione
  qs('#enableGeo').addEventListener('click', ()=>{
    alert('Geolocalizzazione attivata (demo)');
  });
});
