/* =========================================================
   Plutoo – app.js (stabile/base)
   - Tabs: Vicino / Scorri / Match
   - Filtri a tendina + chips
   - Scheda profilo (dialog) con badge verifica + upload finto
   - Match + chat (localStorage)
   - Monetizzazione: banner + interstitial (placeholder)
   - Emoji obbligatorie: 🥲 (NO)  ❤️ (SÌ)
   - AdMob IDs (commenti per porting Android)
     App ID:         ca-app-pub-5458345293928736~5749790476
     Banner Unit ID: ca-app-pub-5458345293928736/8955087050
     Interstitial:   INSERISCI_INTERSTITIAL_UNIT_ID
   ========================================================= */

/* ===================== DATI DEMO ===================== */
const dogs = [
  { id:1, name:'Luna',  age:1, breed:'Jack Russell',     sex:'F', size:'Piccola', coat:'Corto', energy:'Alta',  pedigree:'No', area:'Roma – Monteverde', desc:'Curiosa, vivace, ama correre al parco.', image:'dog1.jpg', online:true,  verified:true,  coords:{lat:41.898, lon:12.498} },
  { id:2, name:'Rocky', age:3, breed:'Labrador',         sex:'M', size:'Media',  coat:'Corto', energy:'Media', pedigree:'No', area:'Roma – Eur',        desc:'Affettuoso e fedele, ottimo con i bambini.', image:'dog2.jpg', online:true,  verified:false, coords:{lat:41.901, lon:12.476} },
  { id:3, name:'Bella', age:2, breed:'Shiba Inu',        sex:'F', size:'Piccola',coat:'Medio', energy:'Media', pedigree:'Sì', area:'Roma – Prati',      desc:'Elegante, intelligente, molto curiosa.', image:'dog3.jpg', online:true,  verified:true,  coords:{lat:41.914, lon:12.495} },
  { id:4, name:'Max',   age:4, breed:'Golden Retriever', sex:'M', size:'Grande', coat:'Lungo', energy:'Alta',  pedigree:'No', area:'Roma – Tuscolana',  desc:'Socievole con tutti, ama l’acqua.', image:'dog4.jpg', online:true,  verified:false, coords:{lat:41.887, lon:12.512} },
  { id:5, name:'Daisy', age:2, breed:'Beagle',           sex:'F', size:'Piccola',coat:'Corto', energy:'Alta',  pedigree:'No', area:'Roma – Garbatella', desc:'Instancabile esploratrice dal naso finissimo.', image:'dog1.jpg', online:true,  verified:false, coords:{lat:41.905, lon:12.450} },
  { id:6, name:'Nero',  age:5, breed:'Meticcio',         sex:'M', size:'Media',  coat:'Medio', energy:'Media', pedigree:'No', area:'Roma – Nomentana',  desc:'Tranquillo, dolcissimo con tutti.', image:'dog2.jpg', online:true,  verified:false, coords:{lat:41.930, lon:12.500} },
];

/* ===================== STATO ===================== */
let currentView = 'near'; // near | swipe | matches
let userPos = null;
let likeCount = +(localStorage.getItem('pl_like_count')||'0');

let filters = { breed:'', ageBand:'', sex:'', size:'', coat:'', energy:'', pedigree:'', distance:'' };

let matches = JSON.parse(localStorage.getItem('pl_matches') || '[]');
let swipeIndex = 0;

/* ===================== UTILS ===================== */
const $  = (s)=>document.querySelector(s);
const $$ = (s)=>document.querySelectorAll(s);

function km(a,b){
  if(!a || !b) return null;
  const R=6371;
  const dLat=(b.lat-a.lat)*Math.PI/180;
  const dLon=(b.lon-a.lon)*Math.PI/180;
  const la1=a.lat*Math.PI/180, la2=b.lat*Math.PI/180;
  const x=Math.sin(dLat/2)**2 + Math.sin(dLon/2)**2*Math.cos(la1)*Math.cos(la2);
  return +(R*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x))).toFixed(1);
}
const randKm = ()=> +(Math.random()*7+0.5).toFixed(1);

function band(a){
  if(a<=1) return '0-1';
  if(a<=4) return '2-4';
  if(a<=7) return '5-7';
  return '8+';
}
function el(tag, attrs={}, html=''){
  const n = document.createElement(tag);
  Object.entries(attrs).forEach(([k,v])=>{
    if(k in n) n[k]=v; else n.setAttribute(k,v);
  });
  if(html) n.innerHTML = html;
  return n;
}

/* ===================== NAV/APP ===================== */
function show(sel){
  $$('.screen').forEach(s=>s.classList.remove('active'));
  const node = (typeof sel==='string') ? $(sel) : sel;
  node && node.classList.add('active');
}
function switchTab(tab){
  currentView = tab;
  $$('.tab').forEach(b=>b.classList.toggle('active', b.dataset.tab===tab));
  $$('.tabpane').forEach(p=>p.classList.remove('active'));
  $('#'+tab)?.classList.add('active');
  if(tab==='near') renderNear();
  if(tab==='swipe') renderSwipe();
  if(tab==='matches') renderMatches();
}
function goHome(){
  show('#app');
  $('#geoBar')?.classList.remove('hidden');
  renderNear();
  renderSwipe();
  renderMatches();
}
window.goHome = goHome;

/* ===================== GEO ===================== */
$('#enableGeo')?.addEventListener('click', ()=>{
  navigator.geolocation.getCurrentPosition(
    pos => { userPos={lat:pos.coords.latitude, lon:pos.coords.longitude}; $('#geoBar')?.classList.add('hidden'); renderNear(); renderSwipe(); },
    _   => { $('#geoBar')?.classList.add('hidden'); renderNear(); renderSwipe(); },
    { enableHighAccuracy:true, timeout:8000 }
  );
});
$('#dismissGeo')?.addEventListener('click', ()=> $('#geoBar')?.classList.add('hidden'));

/* ===================== FILTRI ===================== */
$('#filterToggle')?.addEventListener('click', ()=>{ const p=$('#filterPanel'); if(p) p.hidden=!p.hidden; });

function clearFilters(){
  filters = { breed:'', ageBand:'', sex:'', size:'', coat:'', energy:'', pedigree:'', distance:'' };
  $('#filterForm')?.reset();
  renderActiveChips();
  if(currentView==='near') renderNear(); else if(currentView==='swipe') renderSwipe(); else renderMatches();
}
window.clearFilters = clearFilters;

function apply(e){
  if(e) e.preventDefault?.();
  const f = $('#filterForm'); if(!f) return;
  filters.breed    = f.breed?.value || '';
  filters.ageBand  = f.ageBand?.value || '';
  filters.sex      = f.sex?.value || '';
  filters.size     = f.size?.value || '';
  filters.coat     = f.coat?.value || '';
  filters.energy   = f.energy?.value || '';
  filters.pedigree = f.pedigree?.value || '';
  filters.distance = f.distance?.value || '';
  $('#filterPanel').hidden = true;
  renderActiveChips();
  if(currentView==='near') renderNear(); else if(currentView==='swipe') renderSwipe(); else renderMatches();
}
$('#filterForm')?.addEventListener('submit', apply);
$('#filtersReset')?.addEventListener('click', clearFilters);

function renderActiveChips(){
  const c = $('#activeChips'); if(!c) return;
  c.innerHTML = '';
  const map = { breed:'Razza', ageBand:'Età', sex:'Sesso', size:'Taglia', coat:'Pelo', energy:'Energia', pedigree:'Pedigree', distance:'Distanza' };
  Object.entries(filters).forEach(([k,v])=>{
    if(v){
      const chip = el('span',{className:'chip'}, `${map[k]}: ${v}`);
      const x = el('button',{className:'chip-x', title:'Rimuovi', onclick:()=>{
        filters[k]=''; renderActiveChips();
        if(currentView==='near') renderNear();
        else if(currentView==='swipe') renderSwipe();
        else renderMatches();
      }}, '×');
      const wrap = el('span',{className:'chip-wrap'});
      wrap.append(chip,x);
      c.appendChild(wrap);
    }
  });
}

/* ===================== LISTE & RENDER ===================== */
function passesFilters(d, distanceKm){
  if(filters.breed && !d.breed.toLowerCase().includes(filters.breed.toLowerCase())) return false;
  if(filters.ageBand && band(d.age)!==filters.ageBand) return false;
  if(filters.sex && d.sex!==filters.sex) return false;
  if(filters.size && d.size!==filters.size) return false;
  if(filters.coat && d.coat!==filters.coat) return false;
  if(filters.energy && d.energy!==filters.energy) return false;
  if(filters.pedigree && d.pedigree!==filters.pedigree) return false;
  if(filters.distance){
    const maxd = parseFloat(filters.distance);
    if(!isNaN(maxd) && distanceKm!=null && distanceKm>maxd) return false;
  }
  return true;
}

function nameWithBadge(d){
  // Badge verificato: zampetta (emoji) solo se verified:true
  const paw = d.verified ? ' 🐾' : '';
  return `${d.name}, ${d.age} • ${d.breed}${paw}`;
}

function renderNear(){
  const wrap = $('#grid'); if(!wrap) return;
  wrap.innerHTML = '';

  const list = dogs.slice().sort((a,b)=>{
    const da = userPos ? km(userPos,a.coords) : randKm();
    const db = userPos ? km(userPos,b.coords) : randKm();
    return (da??9) - (db??9);
  });

  const filtered = [];
  list.forEach(d=>{
    const distance = userPos ? km(userPos,d.coords) : randKm();
    if(!passesFilters(d, distance)) return;
    filtered.push({d, distance});
  });

  filtered.forEach(({d, distance})=>{
    const card = el('article',{className:'card'});
    card.innerHTML = `
      ${d.online ? '<span class="online"></span>' : ''}
      <img src="${d.image}" alt="${d.name}" onerror="this.style.display='none'">
      <div class="card-info">
        <div class="title">
          <div class="name">${nameWithBadge(d)}</div>
          <div class="dist">${(distance??'-')} km</div>
        </div>
        <div class="actions">
          <button class="circle no">🥲</button>
          <button class="circle like">❤️</button>
        </div>
      </div>
    `;
    // bottoni
    card.querySelector('.no').onclick   = (ev)=>{ ev.stopPropagation(); card.remove(); };
    card.querySelector('.like').onclick = (ev)=>{ ev.stopPropagation(); addMatch(d); incLikesMaybeAd(); };

    // click su card -> profilo (dialog stile pagina)
    card.addEventListener('click', (ev)=>{
      if(ev.target.closest('.circle')) return;
      const dist = userPos ? km(userPos,d.coords) : randKm();
      openProfileModal(d, dist);
    });

    wrap.appendChild(card);
  });

  $('#counter')?.textContent = `Mostro ${filtered.length} profili`;
  $('#emptyNear')?.classList.toggle('hidden', filtered.length>0);
}

function renderSwipe(){
  // usa la card già presente in HTML (#swipeImg, #swipeTitle, #swipeMeta, #swipeBio)
  const list = dogs.filter(d=>{
    const dist = userPos ? km(userPos,d.coords) : randKm();
    return passesFilters(d, dist);
  });
  const img   = $('#swipeImg');
  const title = $('#swipeTitle');
  const meta  = $('#swipeMeta');
  const bio   = $('#swipeBio');
  const bigCard = $('#swipe .card.big');

  if(!list.length){
    if(img) img.style.display='none';
    if(title) title.textContent='';
    if(meta) meta.textContent='';
    if(bio) bio.textContent='Nessun profilo per questi filtri.';
    return;
  }

  const d = list[swipeIndex % list.length];
  const distance = userPos ? km(userPos,d.coords) : randKm();

  if(img){ img.src=d.image; img.alt=d.name; img.onerror=function(){this.style.display='none';}; img.style.display='block'; }
  if(title) title.innerHTML = nameWithBadge(d);
  if(meta)  meta.textContent = `${distance} km`;
  if(bio)   bio.textContent = d.desc;

  if(bigCard){
    bigCard.classList.remove('pulse'); void bigCard.offsetWidth; bigCard.classList.add('pulse');

    // tap card -> profilo
    bigCard.onclick = (ev)=>{ if(ev.target.closest('.circle')) return; openProfileModal(d, distance); };

    // swipe gesture semplice (orizzontale)
    attachSwipeGestures(bigCard, ()=>{ swipe('yes', d); }, ()=>{ swipe('no'); });
  }

  $('#noBtn')?.addEventListener('click', ()=>{
    tinyBump('#noBtn');
    if(bigCard){ bigCard.classList.add('swipe-left'); setTimeout(()=> swipe('no'), 200); } else swipe('no');
  }, {once:true});

  $('#yesBtn')?.addEventListener('click', ()=>{
    tinyBump('#yesBtn');
    if(bigCard){ bigCard.classList.add('swipe-right'); setTimeout(()=> swipe('yes', d), 200); } else swipe('yes', d);
  }, {once:true});
}

function tinyBump(sel){ const e=$(sel); if(!e) return; e.classList.remove('button-bump'); void e.offsetWidth; e.classList.add('button-bump'); }

function swipe(type,d){
  if(type==='yes' && d){ addMatch(d); incLikesMaybeAd(); }
  swipeIndex++;
  renderSwipe();
}

function attachSwipeGestures(node,onRight,onLeft){
  let sx=0, sy=0, dx=0, dy=0, dragging=false;
  node.addEventListener('touchstart',e=>{const t=e.touches[0]; sx=t.clientX; sy=t.clientY; dragging=true; node.style.transition='none';},{passive:true});
  node.addEventListener('touchmove',e=>{
    if(!dragging) return;
    const t=e.touches[0]; dx=t.clientX-sx; dy=t.clientY-sy;
    if(Math.abs(dy) > Math.abs(dx)) return; // preferisci scroll verticale
    const rot = Math.max(-10, Math.min(10, dx/10));
    node.style.transform = `translateX(${dx}px) rotate(${rot}deg)`;
    node.style.opacity = String(Math.max(.4, 1 - Math.abs(dx)/300));
  },{passive:true});
  node.addEventListener('touchend',()=>{
    if(!dragging) return;
    dragging=false; node.style.transition='transform .18s ease, opacity .18s ease';
    if(dx>80){ node.style.transform='translateX(40%) rotate(6deg)'; node.style.opacity='0'; setTimeout(()=> onRight&&onRight(),180); }
    else if(dx<-80){ node.style.transform='translateX(-40%) rotate(-6deg)'; node.style.opacity='0'; setTimeout(()=> onLeft&&onLeft(),180); }
    else { node.style.transform=''; node.style.opacity=''; }
    dx=dy=0;
  },{passive:true});
}

/* ===================== PROFILO / MODAL ===================== */
function openProfileModal(d, distance){
  const dlg = $('#dogModal');
  const body = $('#modalBody');
  if(!dlg || !body) return;

  body.innerHTML = `
    <img class="cover" src="${d.image}" alt="${d.name}" onerror="this.style.display='none'">
    <div class="pad">
      <h2 class="modal-name">${d.name}, ${d.age} ${d.verified ? '🐾' : ''}</h2>
      <div class="meta">${d.breed} · ${d.sex==='F'?'Femmina':'Maschio'} · ${d.size} · ${d.coat}</div>
      <div class="meta"><b>Energia:</b> ${d.energy} · <b>Pedigree:</b> ${d.pedigree} · <b>Zona:</b> ${d.area}</div>
      <div class="meta"><b>Distanza:</b> ${(distance??'-')} km</div>
      <p class="desc">${d.desc}</p>

      ${!d.verified ? `<div class="verify-wrap">
          <button id="askVerify" class="btn light">Carica documenti per badge</button>
        </div>` : ''}

      <div class="actions" style="margin-top:10px">
        <button id="mdNo" class="circle no">🥲</button>
        <button id="mdYes" class="circle like">❤️</button>
      </div>
    </div>
  `;
  try{ dlg.showModal(); }catch(_){ dlg.setAttribute('open',''); }

  $('#mdNo').onclick = ()=> dlg.close();
  $('#mdYes').onclick = ()=>{ addMatch(d); incLikesMaybeAd(); dlg.close(); };
  if($('#askVerify')){
    $('#askVerify').onclick = ()=> openVerifyModal(d);
  }
}

function openVerifyModal(d){
  const dlg = $('#verifyModal');
  if(!dlg) return;
  $('#verifyMsg')?.setAttribute('hidden','hidden');
  try{ dlg.showModal(); }catch(_){ dlg.setAttribute('open',''); }
  $('#sendVerify')?.addEventListener('click', ()=>{
    // demo: non salviamo nulla, solo messaggio
    $('#verifyMsg')?.removeAttribute('hidden');
    setTimeout(()=> dlg.close(), 1200);
  }, {once:true});
}

/* ===================== MATCH & CHAT ===================== */
function addMatch(d){
  if(!matches.find(m=>m.id===d.id)){
    matches.push({id:d.id, name:d.name, img:d.image});
    localStorage.setItem('pl_matches', JSON.stringify(matches));
  }
  renderMatches();
}

function renderMatches(){
  const box = $('#matchList'); if(!box) return;
  box.innerHTML = '';
  matches.forEach(m=>{
    const row = el('div',{className:'item'});
    row.innerHTML = `
      <img src="${m.img}" alt="${m.name}">
      <div>
        <div><strong>${m.name}</strong></div>
        <div class="muted small">Match</div>
      </div>
      <button class="btn primary pill go">Chat</button>
    `;
    row.querySelector('.go').onclick = ()=> openChat(m);
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
  const b = el('div',{className:'bubble me'}, t);
  $('#thread').appendChild(b);
  $('#chatInput').value='';
  $('#thread').scrollTop = $('#thread').scrollHeight;
});
$$('.close').forEach(b=> b.addEventListener('click', ()=> $('#'+b.dataset.close)?.classList.remove('show')));

/* ===================== ADV PLACEHOLDER ===================== */
function incLikesMaybeAd(){
  likeCount++;
  localStorage.setItem('pl_like_count', String(likeCount));
  if(likeCount % 10 === 0){
    try{ $('#interstitial').showModal(); }catch(_){ $('#interstitial').setAttribute('open',''); }
  }
}

/* ===================== EVENTI GLOBALI ===================== */
document.addEventListener('DOMContentLoaded', ()=>{
  // Entra / Accedi
  $('#ctaEnter')?.addEventListener('click', (e)=>{ e.preventDefault(); goHome(); });
  $('#btnLoginUnder')?.addEventListener('click', ()=> $('#sheetLogin')?.classList.add('show'));
  $('#btnLoginTop')?.addEventListener('click',   ()=> $('#sheetLogin')?.classList.add('show'));
  $('#btnRegisterTop')?.addEventListener('click',()=> $('#sheetRegister')?.classList.add('show'));

  // Tabs
  $$('.tab').forEach(t=> t.addEventListener('click', ()=> switchTab(t.dataset.tab)));

  // Sheets
  $('#loginSubmit')?.addEventListener('click', ()=> $('#sheetLogin')?.classList.remove('show'));
  $('#registerSubmit')?.addEventListener('click', ()=> $('#sheetRegister')?.classList.remove('show'));

  // Legal
  $('#openPrivacy')?.addEventListener('click', ()=> { try{$('#privacyDlg').showModal();}catch(_){$('#privacyDlg').setAttribute('open','');} });
  $('#openTerms')?.addEventListener('click',   ()=> { try{$('#termsDlg').showModal();}catch(_){$('#termsDlg').setAttribute('open','');} });

  // Filtri (già agganciati sopra su submit/reset)
  renderActiveChips();

  // Avvio: resta in Home finché non si preme Entra
});
