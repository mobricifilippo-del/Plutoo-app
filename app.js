/* ======= DATI DEMO ======= */
const dogs = [
  { id:1, name:"Luna",  age:1, breed:"Jack Russell",    img1:"dog1.jpg", coords:{lat:41.898, lon:12.498}, bio:"Vivace e curiosa!", online:true },
  { id:2, name:"Rocky", age:4, breed:"Meticcio",        img1:"dog2.jpg", coords:{lat:41.901, lon:12.476}, bio:"Fedelissimo e coccolone.", online:true },
  { id:3, name:"Maya",  age:3, breed:"Shiba Inu",       img1:"dog3.jpg", coords:{lat:41.914, lon:12.495}, bio:"Passeggiate ogni giorno.", online:false },
  { id:4, name:"Sofia", age:5, breed:"Levriero Afgano", img1:"dog4.jpg", coords:{lat:41.887, lon:12.512}, bio:"Elegante e dolce.", online:true }
];

let userPos = null;
let matches = JSON.parse(localStorage.getItem("plutoo_matches") || "[]");
let swipeIndex = 0;

/* ======= UTILS ======= */
const $  = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const show = id => { $$('.screen').forEach(s=>s.classList.remove('active')); $(id).classList.add('active'); };
const km = (a,b)=>{ if(!a||!b) return null;
  const R=6371,dLat=(b.lat-a.lat)*Math.PI/180,dLon=(b.lon-a.lon)*Math.PI/180;
  const la1=a.lat*Math.PI/180, la2=b.lat*Math.PI/180;
  const x=Math.sin(dLat/2)**2 + Math.sin(dLon/2)**2*Math.cos(la1)*Math.cos(la2);
  return +(R*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x))).toFixed(1);
};
const randKm = ()=> +(Math.random()*7+0.5).toFixed(1);

/* ======= ENTRA (esposto anche globalmente come backup) ======= */
function goHome(){
  // Logo piccolo nella topbar dopo l'ingresso
  if(!document.querySelector('.brand-small')){
    const img=document.createElement('img');
    img.src='plutoo-icon-512.png'; img.alt='Plutoo'; img.className='brand-small';
    img.style.width='64px'; img.style.height='64px'; img.style.borderRadius='20px';
    img.style.boxShadow='0 14px 40px rgba(122,79,247,.18)'; img.style.background='#000';
    document.getElementById('topBrandSlot').appendChild(img);
  }
  show('#home');
  askGeo(); renderNear(); renderSwipe(); renderMatches();
}
window.__enter = goHome;

/* Aggancio event listeners quando il DOM è pronto */
document.addEventListener('DOMContentLoaded', ()=>{
  $('#ctaEnter')?.addEventListener('click', goHome);

  // Tabs
  $$('.tab').forEach(t=>{
    t.addEventListener('click',()=>{
      $$('.tab').forEach(x=>x.classList.remove('active'));
      $$('.tabpane').forEach(x=>x.classList.remove('active'));
      t.classList.add('active');
      document.getElementById(t.dataset.tab).classList.add('active');
      if(t.dataset.tab==='swipe') renderSwipe();
      if(t.dataset.tab==='near') renderNear();
      if(t.dataset.tab==='matches') renderMatches();
    });
  });

  // Sheets
  $('#btnLogin')?.addEventListener('click',()=>$('#sheetLogin').classList.add('show'));
  $('#btnRegister')?.addEventListener('click',()=>$('#sheetRegister').classList.add('show'));
  $('#loginSubmit')?.addEventListener('click',()=>$('#sheetLogin').classList.remove('show'));
  $('#registerSubmit')?.addEventListener('click',()=>$('#sheetRegister').classList.remove('show'));
  $$('.close').forEach(b=>b.addEventListener('click',()=>$('#'+b.dataset.close).classList.remove('show')));

  // Swipe actions
  $('#yesBtn')?.addEventListener('click', ()=>{ addMatch(dogs[swipeIndex%dogs.length]); swipeIndex++; renderSwipe(); });
  $('#noBtn')?.addEventListener('click',  ()=>{ swipeIndex++; renderSwipe(); });
});

/* ======= GEO ======= */
function askGeo(){ $('#geoBar')?.classList.remove('hidden'); }
$('#enableGeo')?.addEventListener('click',()=>{
  navigator.geolocation.getCurrentPosition(
    pos => { userPos={lat:pos.coords.latitude, lon:pos.coords.longitude}; $('#geoBar')?.classList.add('hidden'); renderNear(); renderSwipe(); },
    _   => { $('#geoBar')?.classList.add('hidden'); renderNear(); renderSwipe(); },
    { enableHighAccuracy:true, timeout:8000 }
  );
});
$('#dismissGeo')?.addEventListener('click',()=> $('#geoBar')?.classList.add('hidden'));

/* ======= VICINO A TE (UNA FOTO) ======= */
function renderNear(){
  const wrap = $('#grid'); if(!wrap) return; wrap.innerHTML='';
  const list = dogs.slice().sort((a,b)=>{
    const da = userPos ? km(userPos,a.coords) : randKm();
    const db = userPos ? km(userPos,b.coords) : randKm();
    return da-db;
  });
  list.forEach(d=>{
    const distance = userPos ? km(userPos,d.coords) : randKm();
    const card = document.createElement('article');
    card.className='card';
    card.innerHTML = `
      ${d.online ? '<span class="online"></span>' : ''}
      <img src="${d.img1}" alt="${d.name}">
      <div class="card-info">
        <div class="title">
          <div class="name">${d.name}, ${d.age} • ${d.breed}</div>
          <div class="dist">${distance} km</div>
        </div>
        <div class="actions">
          <button class="circle no">✖</button>
          <button class="circle like">❤</button>
        </div>
      </div>`;
    card.querySelector('.no').onclick   = ()=> card.remove();
    card.querySelector('.like').onclick = ()=> addMatch(d);
    wrap.appendChild(card);
  });
  $('#emptyNear')?.classList.toggle('hidden', wrap.children.length>0);
}

/* ======= SCORRI ======= */
function renderSwipe(){
  const d = dogs[swipeIndex % dogs.length];
  const distance = userPos ? km(userPos,d.coords) : randKm();
  $('#swipeImg').src   = d.img1;
  $('#swipeTitle').textContent = `${d.name}, ${d.age} • ${d.breed}`;
  $('#swipeMeta').textContent  = `${distance} km da te`;
  $('#swipeBio').textContent   = d.bio;
}

/* ======= MATCH & CHAT ======= */
function addMatch(d){
  if (!matches.find(m=>m.id===d.id)) {
    matches.push({id:d.id, name:d.name, img:d.img1});
    localStorage.setItem("plutoo_matches", JSON.stringify(matches));
  }
  renderMatches();
}
function renderMatches(){
  const box = $('#matchList'); if(!box) return; box.innerHTML = '';
  matches.forEach(m=>{
    const row = document.createElement('div'); row.className='item';
    row.innerHTML = `
      <img src="${m.img}" alt="${m.name}">
      <div>
        <div><strong>${m.name}</strong></div>
        <div class="muted small">Match</div>
      </div>
      <button class="btn go primary pill">Chat</button>`;
    row.querySelector('.go').onclick = ()=>openChat(m);
    box.appendChild(row);
  });
  $('#emptyMatch').style.display = matches.length ? 'none' : 'block';
}
function openChat(m){
  $('#chatAvatar').src = m.img;
  $('#chatName').textContent = m.name;
  $('#thread').innerHTML = '<div class="bubble">Ciao! 🐾 Siamo un match!</div>';
  $('#chat').classList.add('show');
}
$('#sendBtn')?.addEventListener('click', ()=>{
  const txt = ($('#chatInput').value||'').trim();
  if(!txt) return;
  const b = document.createElement('div'); b.className='bubble me'; b.textContent = txt;
  $('#thread').appendChild(b);
  $('#chatInput').value=''; $('#thread').scrollTop = $('#thread').scrollHeight;
});
