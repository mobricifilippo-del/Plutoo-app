/* ======= DATI DEMO ======= */
const cani = [
  { id:1, name:"Luna", age:1, breed:"Jack Russell", img1:"dog1.jpg", coords:{lat:41.898, lon:12.498}, bio:"Vivace e curiosa!", online:true },
  { id:2, nome:"Rocky", età:4, razza:"Meticcio", img1:"dog2.jpg", coordinate:{lat:41.901, lon:12.476}, bio:"Fedelissimo e coccolone.", online:true },
  { id:3, nome:"Maya", età:3, razza:"Shiba Inu", img1:"dog3.jpg", coordinate:{lat:41.914, lon:12.495}, bio:"Passeggiate ogni giorno.", online:false },
  { id:4, nome:"Sofia", età:5, razza:"Levriero Afgano", img1:"dog4.jpg", coordinate:{lat:41.887, lon:12.512}, bio:"Elegante e dolce.", online:true }
];

lascia userPos = null;
lascia corrispondenze = JSON.parse(localStorage.getItem("plutoo_matches") || "[]");
lascia che swipeIndex = 0;

/* ======= UTILITA' ======= */
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const show = id => { $$('.screen').forEach(s=>s.classList.remove('attivo')); $(id).classList.add('attivo'); };
const km = (a,b)=>{ if(!a||!b) return null;
  const R=6371,dLat=(b.lat-a.lat)*Math.PI/180,dLon=(b.lon-a.lon)*Math.PI/180;
  const la1=a.lat*Math.PI/180, la2=b.lat*Math.PI/180;
  const x=Math.sin(dLat/2)**2 + Math.sin(dLon/2)**2*Math.cos(la1)*Math.cos(la2);
  restituisci +(R*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x))).toFixed(1);
};
const randKm = ()=> +(Math.random()*7+0.5).toFixed(1);

/* ======= ENTRA (esposto anche globalmente come backup) ======= */
funzione goHome(){
  // Logo piccolo nella topbar dopo l'ingresso
  if(!document.querySelector('.brand-small')){
    const img=document.createElement('img');
    img.src='plutoo-icon-512.png'; img.alt='Plutoo'; img.className='brand-small';
    img.style.width='64px'; img.style.height='64px'; img.style.borderRadius='20px';
    img.style.boxShadow='0 14px 40px rgba(122,79,247,.18)'; img.style.background='#000';
    document.getElementById('topBrandSlot').appendChild(img);
  }
  mostra('#casa');
  askGeo(); renderNear(); renderSwipe(); renderMatches();
}
window.__enter = goHome;

/* Aggancio agli ascoltatori dell'evento quando il DOM è pronto */
document.addEventListener('DOMContentLoaded', ()=>{
  $('#ctaEnter')?.addEventListener('clic', goHome);

  // Schede
  $$('.tab').forEach(t=>{
    t.addEventListener('clic',()=>{
      $$('.tab').forEach(x=>x.classList.remove('attivo'));
      $$('.tabpane').forEach(x=>x.classList.remove('attivo'));
      t.classList.add('attivo');
      document.getElementById(t.dataset.tab).classList.add('attivo');
      if(t.dataset.tab==='swipe') renderSwipe();
      if(t.dataset.tab==='vicino') renderNear();
      if(t.dataset.tab==='corrisponde') renderMatches();
    });
  });

  // Fogli
  $('#btnLogin')?.addEventListener('click',()=>$('#sheetLogin').classList.add('show'));
  $('#btnRegister')?.addEventListener('click',()=>$('#sheetRegister').classList.add('show'));
  $('#loginSubmit')?.addEventListener('click',()=>$('#sheetLogin').classList.remove('show'));
  $('#registerSubmit')?.addEventListener('click',()=>$('#sheetRegister').classList.remove('show'));
  $$('.close').forEach(b=>b.addEventListener('click',()=>$('#'+b.dataset.close).classList.remove('show')));

  // Azioni di scorrimento
  $('#yesBtn')?.addEventListener('clic', ()=>{ addMatch(cani[swipeIndex%cani.lunghezza]); swipeIndex++; renderSwipe(); });
  $('#noBtn')?.addEventListener('clic', ()=>{ swipeIndex++; renderSwipe(); });
});

/* ======= GEO ======= */
funzione askGeo(){ $('#geoBar')?.classList.remove('nascosto'); }
$('#enableGeo')?.addEventListener('clic',()=>{
  navigator.geolocation.getCurrentPosition(
    pos => { userPos={lat:pos.coords.latitude, lon:pos.coords.longitude}; $('#geoBar')?.classList.add('hidden'); renderNear(); renderSwipe(); },
    _ => { $('#geoBar')?.classList.add('hidden'); renderNear(); renderSwipe(); },
    { enableHighAccuracy:true, timeout:8000 }
  );
});
$('#dismissGeo')?.addEventListener('click',()=> $('#geoBar')?.classList.add('hidden'));

/* ======= VICINO A TE (UNA FOTO) ======= */
funzione renderNear(){
  const wrap = $('#grid'); if(!wrap) return; wrap.innerHTML='';
  elenco costante = dogs.slice().sort((a,b)=>{
    const da = userPos ? km(userPos,a.coords) : randKm();
    const db = userPos? km(userPos,b.coords): randKm();
    restituisci da-db;
  });
  list.forEach(d=>{
    distanza costante = userPos ? km(userPos,d.coords): randKm();
    const card = document.createElement('articolo');
    card.className='carta';
    card.innerHTML = `
      ${d.online ? '<span class="online"></span>' : ''}
      <img src="${d.img1}" alt="${d.name}">
      <div class="card-info">
        <div class="titolo">
          <div class="name">${d.name}, ${d.age} • ${d.breed}</div>
          <div class="dist">${distanza} km</div>
        </div>
        <div class="azioni">
          <button class="circle no">âœ–</button>
          <button class="circle like">â ¤</button>
        </div>
      </div>`;
    card.querySelector('.no').onclick = ()=> card.remove();
    card.querySelector('.like').onclick = ()=> addMatch(d);
    wrap.appendChild(card);
  });
  $('#emptyNear')?.classList.toggle('nascosto', wrap.children.length>0);
}

/* ======= SCORRI ======= */
funzione renderSwipe(){
  const d = dogs[swipeIndex % dogs.length];
  distanza costante = userPos ? km(userPos,d.coords): randKm();
  $('#swipeImg').src = d.img1;
  $('#swipeTitle').textContent = `${d.name}, ${d.age} â€¢ ${d.breed}`;
  $('#swipeMeta').textContent = `${distanza} km da te`;
  $('#swipeBio').textContent = d.bio;
}

/* ======= PARTITA E CHATTA ======= */
funzione addMatch(d){
  se (!matches.find(m=>m.id===d.id)) {
    corrispondenze.push({id:d.id, nome:d.name, img:d.img1});
    localStorage.setItem("plutoo_matches", JSON.stringify(matches));
  }
  renderMatches();
}
funzione renderMatches(){
  const box = $('#matchList'); if(!box) return; box.innerHTML = '';
  corrispondenze.perOgni(m=>{
    const row = document.createElement('div'); row.className='item';
    riga.HTML interno = `
      <img src="${m.img}" alt="${m.name}">
      <div>
        <div><strong>${m.name}</strong></div>
        <div class="muted small">Corrispondenza</div>
      </div>
      <button class="btn go primary pill">Chat</button>`;
    row.querySelector('.go').onclick = ()=>openChat(m);
    box.appendChild(riga);
  });
  $('#emptyMatch').style.display = matches.length ? 'none' : 'block';
}
funzione openChat(m){
  $('#chatAvatar').src = m.img;
  $('#chatName').textContent = m.name;
  $('#thread').innerHTML = '<div class="bubble">Ciao! ðŸ ¾ Siamo un match!</div>';
  $('#chat').classList.add('mostra');
}
$('#sendBtn')?.addEventListener('clic', ()=>{
  const txt = ($('#chatInput').value||'').trim();
  se(!txt) ritorno;
  const b = document.createElement('div'); b.className='mettimi in bolla'; b.textContent = txt;
  $('#thread').appendChild(b);
  $('#chatInput').value=''; $('#thread').scrollTop = $('#thread').scrollHeight;
});
