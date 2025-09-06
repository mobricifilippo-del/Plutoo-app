/* ====== DATI DEMO ====== */
const DOGS = [
  { id:1, name:"Luna",  age:1, breed:"Jack Russell",    img:"dog1.jpg", distKm:2.2, online:true },
  { id:2, name:"Rocky", age:4, breed:"Meticcio",        img:"dog2.jpg", distKm:5.9, online:true },
  { id:3, name:"Maya",  age:3, breed:"Shiba Inu",       img:"dog3.jpg", distKm:3.2, online:false },
  { id:4, name:"Sofia", age:5, breed:"Levriero Afgano", img:"dog4.jpg", distKm:1.6, online:true },
];

const state = {
  view: 'near',            // near | swipe | matches
  liked: new Set(),
  swipeIndex: 0
};

/* ====== DOM ====== */
const $ = (s)=>document.querySelector(s);
const $$= (s)=>document.querySelectorAll(s);

const landing = $('#landing');
const app     = $('#app');

const tabs = $$('.tab');
const viewNear = $('#viewNear');
const nearGrid = $('#nearGrid');

const viewSwipe = $('#viewSwipe');
const swipeCard = $('#swipeCard');
const swipeImg  = $('#swipeImg');
const swipeName = $('#swipeName');
const swipeAge  = $('#swipeAge');
const swipeBreed= $('#swipeBreed');
const swipeDist = $('#swipeDist');
const swipeEmpty= $('#swipeEmpty');

const viewMatches = $('#viewMatches');
const matchList   = $('#matchList');
const matchEmpty  = $('#matchEmpty');

/* ====== ENTRA ====== */
$('#btnEnter').addEventListener('click', ()=>{
  landing.classList.add('hidden');
  app.classList.remove('hidden');
  app.setAttribute('aria-hidden','false');
  setView('near');
});

/* ====== GEO (demo: nasconde il banner, non obbligatoria) ====== */
$('#geoEnable').addEventListener('click', ()=> $('#geoBar').classList.add('hidden'));
$('#geoLater').addEventListener('click',  ()=> $('#geoBar').classList.add('hidden'));

/* ====== TABS ====== */
tabs.forEach(t=>{
  t.addEventListener('click', ()=>{
    tabs.forEach(x=>x.classList.remove('active'));
    t.classList.add('active');
    setView(t.dataset.view);
  });
});

function setView(view){
  state.view = view;
  viewNear.classList.toggle('hidden', view!=='near');
  viewSwipe.classList.toggle('hidden', view!=='swipe');
  viewMatches.classList.toggle('hidden', view!=='matches');

  if(view==='near')   renderNear();
  if(view==='swipe')  renderSwipe();
  if(view==='matches')renderMatches();
}

/* ====== VICINO A TE (griglia UNA foto) ====== */
function renderNear(){
  nearGrid.innerHTML = '';
  DOGS.forEach(d=>{
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <img src="${d.img}" alt="${d.name}">
      <div class="body">
        <div class="title">${d.name}, ${d.age}</div>
        <div class="sub">${d.breed}</div>
        <div class="row">
          <div style="display:flex;align-items:center;gap:10px;">
            ${d.online?'<span class="badge" title="online"></span>':''}
            <span class="km">${d.distKm.toFixed(1)} km</span>
          </div>
          <div style="display:flex;gap:10px;">
            <button class="btn rowbtn danger" data-act="no"   data-id="${d.id}">✖</button>
            <button class="btn rowbtn success" data-act="like" data-id="${d.id}">❤</button>
          </div>
        </div>
      </div>
    `;
    nearGrid.appendChild(card);
  });
}

/* Click su like/no nelle card della griglia */
nearGrid.addEventListener('click', (e)=>{
  const btn = e.target.closest('[data-act]');
  if(!btn) return;
  const id = Number(btn.dataset.id);
  if(btn.dataset.act==='like'){
    state.liked.add(id);
  }else{
    state.liked.delete(id);
  }
  // feedback veloce
  btn.style.transform='scale(.96)'; setTimeout(()=>btn.style.transform='',120);
});

/* ====== SWIPE (card singola) ====== */
function currentDog(){
  return DOGS[state.swipeIndex] || null;
}
function renderSwipe(){
  const d = currentDog();
  if(!d){ swipeCard.classList.add('hidden'); swipeEmpty.classList.remove('hidden'); return; }
  swipeEmpty.classList.add('hidden'); swipeCard.classList.remove('hidden');
  swipeImg.src = d.img;
  swipeName.textContent = d.name;
  swipeAge.textContent  = `· ${d.age}`;
  swipeBreed.textContent= d.breed;
  swipeDist.textContent = `${d.distKm.toFixed(1)} km${d.online?' • online':''}`;
}
$('#btnYes').addEventListener('click', ()=>{
  const d = currentDog(); if(d) state.liked.add(d.id);
  state.swipeIndex = Math.min(state.swipeIndex+1, DOGS.length);
  renderSwipe();
});
$('#btnNo').addEventListener('click', ()=>{
  state.swipeIndex = Math.min(state.swipeIndex+1, DOGS.length);
  renderSwipe();
});

/* ====== MATCH ====== */
function renderMatches(){
  const liked = DOGS.filter(d=>state.liked.has(d.id));
  matchList.innerHTML = liked.map(d=>`
    <article class="card">
      <img src="${d.img}" alt="${d.name}">
      <div class="body">
        <div class="title">${d.name}, ${d.age}</div>
        <div class="sub">${d.breed}</div>
        <div class="row"><span class="km">${d.distKm.toFixed(1)} km</span><span>❤ Match</span></div>
      </div>
    </article>
  `).join('');
  matchEmpty.style.display = liked.length ? 'none':'block';
}

/* ====== AVVIO ====== */
renderNear(); // se uno atterra già sulla pagina
