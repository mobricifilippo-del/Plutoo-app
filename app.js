/* ====== DATI DEMO (6 profili) ====== */
const dogs = [
  { id:1, name:'Luna',  age:1, breed:'Jack Russell',    img:'dog1.jpg', bio:'Curiosa e molto giocherellona.', coords:{lat:41.898, lon:12.498}, online:true,  verified:true  },
  { id:2, name:'Rocky', age:3, breed:'Labrador',        img:'dog2.jpg', bio:'Affettuoso e fedele.',          coords:{lat:41.901, lon:12.476}, online:true,  verified:false },
  { id:3, name:'Bella', age:2, breed:'Shiba Inu',       img:'dog3.jpg', bio:'Elegante e affettuosa.',        coords:{lat:41.914, lon:12.495}, online:true,  verified:true  },
  { id:4, name:'Max',   age:4, breed:'Golden Retriever',img:'dog4.jpg', bio:'Ama correre e giocare.',        coords:{lat:41.887, lon:12.512}, online:true,  verified:false },
  { id:5, name:'Daisy', age:2, breed:'Beagle',          img:'dog1.jpg', bio:'Adora esplorare.',              coords:{lat:41.905, lon:12.450}, online:true,  verified:false },
  { id:6, name:'Nero',  age:5, breed:'Meticcio',        img:'dog2.jpg', bio:'Tranquillo e dolce.',           coords:{lat:41.930, lon:12.500}, online:true,  verified:false },
];

let userPos = null;
let matches = JSON.parse(localStorage.getItem("plutoo_matches") || "[]");
let swipeIndex = 0;

/* ====== UTILS ====== */
const $  = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

function show(selector){
  $$('.screen').forEach(s=>s.classList.remove('active'));
  $(selector).classList.add('active');
}
function km(a,b){
  if(!a || !b) return null;
  const R=6371, dLat=(b.lat-a.lat)*Math.PI/180, dLon=(b.lon-a.lon)*Math.PI/180;
  const la1=a.lat*Math.PI/180, la2=b.lat*Math.PI/180;
  const x=Math.sin(dLat/2)**2 + Math.sin(dLon/2)**2*Math.cos(la1)*Math.cos(la2);
  return +(R*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x))).toFixed(1);
}
const randKm = ()=> +(Math.random()*7+0.7).toFixed(1);

/* ====== ENTRA ====== */
function goHome(){
  // logo piccolo se c'è lo slot (safe)
  const slot = document.getElementById('topBrandSlot');
  if (slot && !document.querySelector('.brand-small')) {
    const img = document.createElement('img');
    img.src = 'logo-32.jpg'; img.alt = 'Plutoo'; img.className='brand-small';
    img.style.width='64px'; img.style.height='64px'; img.style.borderRadius='20px';
    img.style.boxShadow='0 14px 40px rgba(122,79,247,.18)'; img.style.background='#000';
    slot.appendChild(img);
  }
  show('#home');
  askGeo();
  renderNear();
  renderSwipe();
  renderMatches();
}
window.goHome = goHome;

/* ====== DOM READY ====== */
document.addEventListener('DOMContentLoaded', ()=>{
  // Tabs
  $$('.tab').forEach(t=>{
    t.addEventListener('click', ()=>{
      $$('.tab').forEach(x=>x.classList.remove('active'));
      $$('.tabpane').forEach(x=>x.classList.remove('active'));
      t.classList.add('active');
      document.getElementById(t.dataset.tab).classList.add('active');
      if (t.dataset.tab==='near')    renderNear();
      if (t.dataset.tab==='swipe')   renderSwipe();
      if (t.dataset.tab==='matches') renderMatches();
    });
  });

  // Sheet open/close
  $('#btnLogin')?.addEventListener('click',()=>$('#sheetLogin').classList.add('show'));
  $('#btnRegister')?.addEventListener('click',()=>$('#sheetRegister').classList.add('show'));
  $('#loginSubmit')?.addEventListener('click',()=>$('#sheetLogin').classList.remove('show'));
  $('#registerSubmit')?.addEventListener('click',()=>$('#sheetRegister').classList.remove('show'));
  $$('.close').forEach(b=>b.addEventListener('click',()=>$('#'+b.dataset.close).classList.remove('show')));

  // Swipe actions
  $('#yesBtn')?.addEventListener('click', ()=>{ addMatch(dogs[swipeIndex%dogs.length]); swipeIndex++; renderSwipe(); });
  $('#noBtn')?.addEventListener('click',  ()=>{ swipeIndex++; renderSwipe(); });

  // Sponsor (puoi cambiare URL qui)
  const sponsorA = $('#sponsorLink');
  if (sponsorA) sponsorA.href = 'https://example.com';
});

/* ====== GEO ====== */
function askGeo(){ $('#geoBar')?.classList.remove('hidden'); }
$('#enableGeo')?.addEventListener('click',()=>{
  navigator.geolocation.getCurrentPosition(
    pos => { userPos={lat:pos.coords.latitude, lon:pos.coords.longitude}; $('#geoBar')?.classList.add('hidden'); renderNear(); renderSwipe(); },
    _   => { $('#geoBar')?.classList.add('hidden'); renderNear(); renderSwipe(); },
    { enableHighAccuracy:true, timeout:8000 }
  );
});
$('#dismissGeo')?.addEventListener('click',()=> $('#geoBar')?.classList.add('hidden'));

/* ====== VICINO ====== */
function renderNear(){
  const wrap = $('#grid'); if(!wrap) return; wrap.innerHTML = '';
  const list = dogs.slice().sort((a,b)=>{
    const da = userPos ? km(userPos,a.coords) : randKm();
    const db = userPos ? km(userPos,b.coords) : randKm();
    return da-db;
  });
  list.forEach(d=>{
    const distance = userPos ? km(userPos,d.coords) : randKm();
    const el = document.createElement('article');
    el.className = 'card';
    el.innerHTML = `
      ${d.online ? '<span class="online"></span>' : ''}
      <img src="${d.img}" alt="${d.name}" onerror="this.style.display='none'">
      <div class="card-info">
        <div class="title">
          <div class="name">${d.name}, ${d.age} • ${d.breed}</div>
          <div class="dist">${distance} km</div>
        </div>
        <div class="actions">
          <button class="circle no">🥲</button>
          <button class="circle like">❤️</button>
        </div>
      </div>`;
    // like / dislike
    el.querySelector('.no').onclick   = ()=> el.remove();
    el.querySelector('.like').onclick = ()=> addMatch(d);
    // click card -> dettagli
    el.addEventListener('click', (ev)=>{ if(ev.target.closest('.circle')) return; openModal(d, distance); });
    wrap.appendChild(el);
  });
  $('#counter').textContent = `Mostro ${list.length} profili`;
  $('#emptyNear')?.classList.toggle('hidden', !!wrap.children.length);
}

/* ====== SCORRI ====== */
function renderSwipe(){
  const d = dogs[swipeIndex % dogs.length];
  const distance = userPos ? km(userPos,d.coords) : randKm();
  $('#swipeImg').src   = d.img;
  $('#swipeTitle').textContent = `${d.name}, ${d.age} • ${d.breed}`;
  $('#swipeMeta').textContent  = `${distance} km da te`;
  $('#swipeBio').textContent   = d.bio;
  // piccolo effetto
  const card = $('.card.big'); card.classList.remove('pulse'); void card.offsetWidth; card.classList.add('pulse');
}

/* ====== MODAL PROFILO ====== */
function openModal(d, distance){
  const dlg = $('#dogModal');
  $('#modalBody').innerHTML = `
    <img class="cover" src="${d.img}" alt="${d.name}">
    <div class="pad">
      <h2 style="margin:6px 0 4px">${d.name}, ${d.age}</h2>
      <div class="muted">${d.breed} · ${distance ?? '-'} km</div>
      <p style="margin:10px 0">${d.bio}</p>
      <div class="actions" style="margin-top:8px">
        <button class="circle no" onclick="document.getElementById('dogModal').close()">🥲</button>
        <button class="circle like" onclick="(${addMatch})( ${JSON.stringify({id:d.id,name:d.name,img:d.img})} ); document.getElementById('dogModal').close()">❤️</button>
      </div>
    </div>`;
  dlg.showModal();
}

/* ====== MATCH & CHAT ====== */
function addMatch(d){
  if (!matches.find(m=>m.id===d.id)) {
    matches.push({id:d.id, name:d.name, img:d.img});
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
      <button class="btn primary pill go">Chat</button>`;
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
  const t = ($('#chatInput').value||'').trim();
  if(!t) return;
  const b = document.createElement('div'); b.className='bubble me'; b.textContent = t;
  $('#thread').appendChild(b);
  $('#chatInput').value=''; $('#thread').scrollTop = $('#thread').scrollHeight;
});
