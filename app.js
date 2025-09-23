/* =========================================================
   Plutoo – app.js (completo)
   - Mobile-first, no framework
   - Tabs: Vicino / Scorri / Match
   - Filtri a tendina + chips
   - Scheda profilo (modal) con badge verifica + upload finto
   - Match + chat (localStorage)
   - Monetizzazione: banner + interstitial (placeholder web)
   - Emoji: 🥲 (NO)  ❤️ (SÌ)
   - AdMob IDs (commento) per porting Android (Capacitor/Cordova)
     App ID:         ca-app-pub-5458345293928736~5749790476
     Banner Unit ID: ca-app-pub-5458345293928736/8955087050
     Interstitial:   INSERISCI_INTERSTITIAL_UNIT_ID
   ========================================================= */

/* ===================== DATI DEMO ===================== */
const dogs = [
  {
    id:1, name:'Luna', age:1, breed:'Jack Russell', sex:'F', size:'Piccola', coat:'Corto',
    energy:'Alta', pedigree:'No', area:'Roma – Monteverde',
    desc:'Curiosa, vivace, ama correre al parco.',
    image:'dog1.jpg', online:true, verified:true,
    coords:{lat:41.898, lon:12.498},
  },
  {
    id:2, name:'Rocky', age:3, breed:'Labrador', sex:'M', size:'Media', coat:'Corto',
    energy:'Media', pedigree:'No', area:'Roma – Eur',
    desc:'Affettuoso e fedele, ottimo con i bambini.',
    image:'dog2.jpg', online:true, verified:false,
    coords:{lat:41.901, lon:12.476},
  },
  {
    id:3, name:'Bella', age:2, breed:'Shiba Inu', sex:'F', size:'Piccola', coat:'Medio',
    energy:'Media', pedigree:'Sì', area:'Roma – Prati',
    desc:'Elegante, intelligente, molto curiosa.',
    image:'dog3.jpg', online:true, verified:true,
    coords:{lat:41.914, lon:12.495},
  },
  {
    id:4, name:'Max', age:4, breed:'Golden Retriever', sex:'M', size:'Grande', coat:'Lungo',
    energy:'Alta', pedigree:'No', area:'Roma – Tuscolana',
    desc:'Socievole con tutti, ama l’acqua.',
    image:'dog4.jpg', online:true, verified:false,
    coords:{lat:41.887, lon:12.512},
  },
  {
    id:5, name:'Daisy', age:2, breed:'Beagle', sex:'F', size:'Piccola', coat:'Corto',
    energy:'Alta', pedigree:'No', area:'Roma – Garbatella',
    desc:'Instancabile esploratrice dal naso finissimo.',
    image:'dog1.jpg', online:true, verified:false,
    coords:{lat:41.905, lon:12.450},
  },
  {
    id:6, name:'Nero', age:5, breed:'Meticcio', sex:'M', size:'Media', coat:'Medio',
    energy:'Media', pedigree:'No', area:'Roma – Nomentana',
    desc:'Tranquillo, dolcissimo con tutti.',
    image:'dog2.jpg', online:true, verified:false,
    coords:{lat:41.930, lon:12.500},
  },
];

/* ===================== STATO ===================== */
let currentView = 'near'; // near | swipe | matches
let userPos = null;
let likeCount = +(localStorage.getItem('pl_like_count')||'0');

let filters = {
  breed:'', age:'', sex:'', size:'', coat:'', energy:'', pedigree:'', distance:''
};

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

function textAgeBand(a){
  if(a<=1) return '0–1';
  if(a<=4) return '2–4';
  if(a<=7) return '5–7';
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
function goHome(){
  // Top mini-logo (safe)
  const slot = $('#topBrandSlot');
  if(slot && !slot.querySelector('.brand-small')){
    const img = el('img',{src:'plutoo-icon-512.png', alt:'Plutoo', className:'brand-small'});
    img.style.width='44px'; img.style.height='44px'; img.style.borderRadius='12px';
    img.style.boxShadow='0 12px 28px rgba(122,79,247,.18)';
    slot.prepend(img);
  }
  // Mostra app
  show('#home');
  askGeo();
  renderNear();
  renderSwipe();
  renderMatches();
  ensureSponsorFooter();
  ensureAdBanner();
}
window.goHome = goHome;

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

/* ===================== GEO ===================== */
function askGeo(){
  $('#geoBar')?.classList.remove('hidden');
}
$('#enableGeo')?.addEventListener('click', ()=>{
  navigator.geolocation.getCurrentPosition(
    pos => { userPos={lat:pos.coords.latitude, lon:pos.coords.longitude}; $('#geoBar')?.classList.add('hidden'); renderNear(); renderSwipe(); },
    _   => { $('#geoBar')?.classList.add('hidden'); renderNear(); renderSwipe(); },
    { enableHighAccuracy:true, timeout:8000 }
  );
});
$('#dismissGeo')?.addEventListener('click', ()=> $('#geoBar')?.classList.add('hidden'));

/* ===================== FILTRI ===================== */
function toggleSearch(){
  const p = $('#filterPanel');
  if(!p) return;
  p.hidden = !p.hidden;
}
window.toggleSearch = toggleSearch;

function clearFilters(){
  filters = { breed:'', age:'', sex:'', size:'', coat:'', energy:'', pedigree:'', distance:'' };
  const f = $('#filterForm');
  if(f) f.reset();
  renderActiveChips();
  if(currentView==='near') renderNear();
  if(currentView==='swipe') renderSwipe();
  if(currentView==='matches') renderMatches();
}
window.clearFilters = clearFilters;

function apply(e){
  if(e) e.preventDefault?.();
  const f = $('#filterForm');
  if(!f) return;
  filters.breed    = f.breed?.value || '';
  filters.age      = f.age?.value || '';
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
window.apply = apply;

function renderActiveChips(){
  const c = $('#activeChips');
  if(!c) return;
  c.innerHTML = '';
  const map = {
    breed:'Razza', age:'Età', sex:'Sesso', size:'Taglia', coat:'Pelo', energy:'Energia', pedigree:'Pedigree', distance:'Distanza'
  };
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
  if(filters.age){
    if(textAgeBand(d.age)!==filters.age) return false;
  }
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
          <div class="name">${verifiedName(d)}</div>
          <div class="dist">${(distance??'-')} km</div>
        </div>
        <div class="actions">
          <button class="circle no">🥲</button>
          <button class="circle like">❤️</button>
        </div>
      </div>
    `;
    // bottoni
    card.querySelector('.no').onclick   = ()=> card.remove();
    card.querySelector('.like').onclick = ()=> { addMatch(d); incLikesMaybeAd(); };

    // click su card -> profilo
    card.addEventListener('click', (ev)=>{
      if(ev.target.closest('.circle')) return; // non aprire se ho cliccato i bottoni
      openProfileModal(d, distance);
    });

    wrap.appendChild(card);
  });

  $('#countLabel')?.textContent = `Mostro ${filtered.length} profili`;
  $('#emptyNear')?.classList.toggle('hidden', filtered.length>0);
}

function renderSwipe(){
  const root = $('#deckCard') || $('#swipe'); // compatibilità
  if(!root) return;
  // scegli la lista filtrata per coerenza con near
  const list = dogs.filter(d=>{
    const dist = userPos ? km(userPos,d.coords) : randKm();
    return passesFilters(d, dist);
  });
  if(!list.length){
    const target = root.querySelector('.card-big') || root;
    target.innerHTML = `<div class="empty">Nessun profilo per questi filtri.</div>`;
    return;
  }
  const d = list[swipeIndex % list.length];
  const distance = userPos ? km(userPos,d.coords) : randKm();

  const container = root.querySelector('.card-big') || root;
  container.innerHTML = `
    <article class="card big">
      <img class="card-img" src="${d.image}" alt="${d.name}" onerror="this.style.display='none'">
      <div class="card-info">
        <div class="title">
          <div class="name">${verifiedName(d)}</div>
          <div class="dist">${distance} km</div>
        </div>
        <p class="bio">${d.desc}</p>
        <div class="actions">
          <button id="swNo" class="circle no">🥲</button>
          <button id="swYes" class="circle like">❤️</button>
        </div>
      </div>
    </article>
  `;
  const card = container.querySelector('.card');
  // animazione ingresso
  card.classList.remove('pulse'); void card.offsetWidth; card.classList.add('pulse');

  // azioni
  container.querySelector('#swNo').onclick  = ()=>{ swipe('no'); };
  container.querySelector('#swYes').onclick = ()=>{ swipe('yes'); };
  // click su card -> profilo
  card.addEventListener('click',(ev)=>{
    if(ev.target.closest('.circle')) return;
    openProfileModal(d, distance);
  });
}

function swipe(type){
  if(type==='yes'){
    const d = dogs[swipeIndex % dogs.length];
    addMatch(d);
    incLikesMaybeAd();
  }
  swipeIndex++;
  renderSwipe();
}

/* ===================== PROFILO / MODAL ===================== */
function verifiedName(d){
  const paw = d.verified ? ' <span class="paw" title="Profilo verificato">🐾</span>' : '';
  return `${d.name}, ${d.age} • ${d.breed}${paw}`;
}

function openProfileModal(d, distance){
  ensureProfileModal();
  const dlg = $('#dogModal');
  const body = $('#modalBody');
  if(!dlg || !body) return;

  body.innerHTML = `
    <img class="cover" src="${d.image}" alt="${d.name}" onerror="this.style.display='none'">
    <div class="pad">
      <h2 class="modal-name">${d.name}, ${d.age} ${d.verified ? '<span class="paw">🐾</span>' : ''}</h2>
      <div class="meta">${d.breed} · ${d.sex==='F'?'Femmina':'Maschio'} · ${d.size} · ${d.coat}</div>
      <div class="meta"><b>Energia:</b> ${d.energy} · <b>Pedigree:</b> ${d.pedigree} · <b>Zona:</b> ${d.area}</div>
      <div class="meta"><b>Distanza:</b> ${(distance??'-')} km</div>
      <p class="desc">${d.desc}</p>
      ${!d.verified ? `<div class="verify-wrap">
          <button id="askVerify" class="btn light">Carica documenti per badge</button>
        </div>` : ''}
      <div class="actions">
        <button id="mdNo" class="circle no">🥲</button>
        <button id="mdYes" class="circle like">❤️</button>
      </div>
    </div>
  `;
  dlg.showModal();

  $('#mdNo').onclick = ()=> dlg.close();
  $('#mdYes').onclick = ()=>{
    addMatch(d); incLikesMaybeAd(); dlg.close();
  };
  if($('#askVerify')){
    $('#askVerify').onclick = ()=> openVerifyModal(d);
  }
}

function ensureProfileModal(){
  if($('#dogModal')) return;
  const dlg = el('dialog',{id:'dogModal', className:'modal'});
  dlg.innerHTML = `<div id="modalBody"></div><button class="close-modal" onclick="document.getElementById('dogModal').close()">Chiudi</button>`;
  document.body.appendChild(dlg);
}

function openVerifyModal(d){
  ensureVerifyModal();
  const dlg = $('#verifyModal');
  const body = $('#verifyBody');
  if(!dlg || !body) return;
  body.innerHTML = `
    <h3>Richiesta badge per ${d.name}</h3>
    <p>Carica i documenti richiesti. La verifica è manuale (demo).</p>
    <label class="upl">Documento proprietario <input type="file" /></label>
    <label class="upl">Documento del cane <input type="file" /></label>
    <button id="sendVerify" class="btn primary full">Invia</button>
  `;
  dlg.showModal();
  $('#sendVerify').onclick = ()=>{
    body.innerHTML = `<p>✅ Richiesta inviata. Riceverai un aggiornamento dopo la revisione.</p>`;
    setTimeout(()=> dlg.close(), 1400);
  };
}
function ensureVerifyModal(){
  if($('#verifyModal')) return;
  const dlg = el('dialog',{id:'verifyModal', className:'modal'});
  dlg.innerHTML = `<div id="verifyBody" class="pad"></div><button class="close-modal" onclick="document.getElementById('verifyModal').close()">Chiudi</button>`;
  document.body.appendChild(dlg);
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
  const empty = $('#emptyMatch');
  if(empty) empty.style.display = matches.length ? 'none' : 'block';
}

function openChat(m){
  ensureChatSheet();
  $('#chatAvatar').src = m.img;
  $('#chatName').textContent = m.name;
  $('#thread').innerHTML = '<div class="bubble">Ciao! 🐾 Siamo un match!</div>';
  $('#chat').classList.add('show');
}

/* crea chat sheet se manca (compatibilità) */
function ensureChatSheet(){
  if($('#chat')) return;
  const sheet = el('div',{id:'chat', className:'sheet show'});
  sheet.innerHTML = `
    <div class="sheet-box">
      <div class="sheet-head">
        <div class="chat-head">
          <img id="chatAvatar" class="avatar" src="" alt="">
          <div id="chatName" class="chat-name">Chat</div>
        </div>
        <button class="close" data-close="chat">×</button>
      </div>
      <div class="sheet-body chat-body">
        <div id="thread" class="thread"></div>
        <div class="chat-send">
          <input id="chatInput" class="inp" placeholder="Scrivi…">
          <button id="sendBtn" class="btn primary">Invia</button>
        </div>
      </div>
    </div>`;
  document.body.appendChild(sheet);
  sheet.querySelector('.close').onclick = ()=> sheet.classList.remove('show');
  sheet.querySelector('#sendBtn').onclick = ()=>{
    const t = (sheet.querySelector('#chatInput').value||'').trim();
    if(!t) return;
    const b = el('div',{className:'bubble me'}, t);
    sheet.querySelector('#thread').appendChild(b);
    sheet.querySelector('#chatInput').value='';
    sheet.querySelector('#thread').scrollTop = sheet.querySelector('#thread').scrollHeight;
  };
}

/* ===================== MONETIZZAZIONE (PLACEHOLDER WEB) ===================== */
function ensureAdBanner(){
  // Inserisci un banner sticky in basso (solo se manca e solo fuori dalla Home)
  if($('#adBanner')) return;
  const b = el('div',{id:'adBanner', className:'ad-banner'}, 'Banner pubblicitario (placeholder)');
  document.body.appendChild(b);
}

function showInterstitial(){
  ensureInterstitial();
  $('#adModal').showModal();
}
function ensureInterstitial(){
  if($('#adModal')) return;
  const dlg = el('dialog',{id:'adModal', className:'modal'});
  dlg.innerHTML = `
    <div class="pad">
      <h3>Annuncio video (placeholder)</h3>
      <p>Qui comparirà l’interstitial/video quando integrerai AdMob nell’app Android.</p>
      <button class="btn primary" onclick="document.getElementById('adModal').close()">Chiudi</button>
    </div>`;
  document.body.appendChild(dlg);
}

function incLikesMaybeAd(){
  likeCount++;
  localStorage.setItem('pl_like_count', String(likeCount));
  if(likeCount % 10 === 0){
    showInterstitial();
  }
}

/* ===================== SPONSOR FOOTER ===================== */
function ensureSponsorFooter(){
  // crea sponsor centrato in fondo all’app (se non presente)
  if($('#sponsorFooter')) return;
  const foot = el('div',{id:'sponsorFooter', className:'sponsor-foot'});
  foot.innerHTML = `
    <div class="sponsor-label">Sponsor ufficiale</div>
    <a href="https://www.gelatofido.it/" target="_blank" rel="noopener">
      <img src="sponsor-logo.png" alt="Sponsor Fido" class="sponsor-img" onerror="this.style.display='none'">
    </a>`;
  // append in fondo alla sezione app (#home) se esiste, altrimenti in body
  const host = $('#home') || document.body;
  host.appendChild(foot);
}

/* ===================== EVENTI GLOBALI ===================== */
document.addEventListener('DOMContentLoaded', ()=>{
  // CTA Entra (oltre all’onclick inline, per sicurezza)
  $('#ctaEnter')?.addEventListener('click', goHome);

  // Tabs
  $$('.tab').forEach(t=>{
    t.addEventListener('click', ()=> switchTab(t.dataset.tab));
  });

  // Filtri
  $('#filterForm')?.addEventListener('submit', apply);
  $('#filtersReset')?.addEventListener('click', clearFilters);

  // Sheets login/register (dummy)
  $('#btnLogin')?.addEventListener('click',()=> $('#sheetLogin')?.classList.add('show'));
  $('#btnRegister')?.addEventListener('click',()=> $('#sheetRegister')?.classList.add('show'));
  $('#loginSubmit')?.addEventListener('click',()=> $('#sheetLogin')?.classList.remove('show'));
  $('#registerSubmit')?.addEventListener('click',()=> $('#sheetRegister')?.classList.remove('show'));
  $$('.close').forEach(b=> b.addEventListener('click', ()=> $('#'+b.dataset.close)?.classList.remove('show')));

  // Sponsor link home (se presente)
  const sponsorHome = $('#sponsorLinkHome');
  if(sponsorHome) sponsorHome.href = 'https://www.gelatofido.it/';

  // Avvio: resta in Home finché non si preme Entra
  // (Se vuoi avviare direttamente l’app, chiama goHome() qui)
});

/* ===================== FINE app.js ===================== */
```0
