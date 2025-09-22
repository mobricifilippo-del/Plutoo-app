/* ===== DATASET DEMO ===== */
const dogs = [
  { id:1, name:'Luna',  age:1, breed:'Jack Russell',      distance:2.2,
    sex:'F', size:'Piccola', coat:'Corto', energy:'Alta', pedigree:'No', area:'Roma – Monteverde',
    desc:'Curiosa e molto giocherellona.', image:'./dog1.jpg', online:true,  verified:true },
  { id:2, name:'Rocky', age:3, breed:'Labrador',          distance:1.6,
    sex:'M', size:'Media',  coat:'Corto', energy:'Media', pedigree:'No', area:'Roma – Eur',
    desc:'Affettuoso e molto fedele.', image:'./dog2.jpg', online:true,  verified:false },
  { id:3, name:'Bella', age:2, breed:'Shiba Inu',         distance:3.2,
    sex:'F', size:'Piccola', coat:'Medio', energy:'Media', pedigree:'Sì', area:'Roma – Prati',
    desc:'Elegante, intelligente e affettuosa.', image:'./dog3.jpg', online:false, verified:true },
  { id:4, name:'Max',   age:4, breed:'Golden Retriever',  distance:5.9,
    sex:'M', size:'Grande', coat:'Lungo', energy:'Alta', pedigree:'No', area:'Roma – Tuscolana',
    desc:'Socievole con tutti, ama correre.', image:'./dog4.jpg', online:true,  verified:false },
];

let matches = new Set(JSON.parse(localStorage.getItem('plutoo_matches')||'[]'));
let currentView = 'near'; // near | swipe | match
let likeCounter = Number(localStorage.getItem('plutoo_like_counter')||0);
let currentSwipeIndex = 0;
let currentDetailId = null;

const $  = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

const el = {
  near:  $('#near'),
  swipe: $('#swipe'),
  match: $('#match'),
  tabs:  $$('.chip[data-view]'),
  filterToggle: $('#filterToggle'),
  filterPanel:  $('#filterPanel'),
  filterForm:   $('#filterForm'),
  chips: $('#activeChips'),
  countLabel: null, // opzionale
  // detail
  detail: $('#detail'),
  dPhoto: $('#dPhoto'),
  dTitle: $('#dTitle'),
  dMeta:  $('#dMeta'),
  dEnergy: $('#dEnergy'),
  dPedigree: $('#dPedigree'),
  dArea: $('#dArea'),
  dDesc: $('#dDesc'),
  closeDetail: $('#closeDetail'),
  verifyForm: $('#verifyForm'),
  verifyStatus: $('#verifyStatus'),
  adSticky: $('#adSticky'),
  cookie: $('#cookie-banner'),
  sponsorLink: $('#sponsorLink'),
};

/* ===== Banner sticky on/off ===== */
function showBanner(){
  document.body.classList.add('hasAd');
  el.adSticky.style.display = 'block';
  try{ (window.adsbygoogle = window.adsbygoogle || []).push({}); }catch(e){}
}
function hideBanner(){
  document.body.classList.remove('hasAd');
  el.adSticky.style.display = 'none';
}

/* ===== Cookie banner (semplice) ===== */
(function(){
  const KEY='plutoo_cookie_ok_v1';
  try{ const ok = localStorage.getItem(KEY)==='true';
    if(!ok) el.cookie.style.display='flex';
    $('#acceptCookies').addEventListener('click', ()=>{
      try{localStorage.setItem(KEY,'true')}catch(e){}
      el.cookie.style.display='none';
    });
  }catch(e){ el.cookie.style.display='flex'; }
})();

/* ===== Sponsor: interstitial finto prima del click (3s) ===== */
if (el.sponsorLink){
  el.sponsorLink.addEventListener('click', (ev)=>{
    ev.preventDefault();
    showInterstitial('sponsor');
    setTimeout(()=> window.open(el.sponsorLink.href,'_blank'), 3200);
  });
}

/* ===== Helpers: filtri ===== */
function getFilters(){
  const fd = new FormData(el.filterForm || new HTMLFormElement());
  return {
    breed: fd.get('breed')||'',
    age: fd.get('age')||'',
    sex: fd.get('sex')||'',
    size: fd.get('size')||'',
    coat: fd.get('coat')||'',
    dist: parseFloat(fd.get('distance')||'0'),
    verifiedOnly: fd.get('verifiedOnly') === 'on'
  };
}
function applyFilters(list){
  const f = getFilters();
  let out = [...list];
  if (currentView==='near') out = out.filter(d=>d.online).sort((a,b)=>a.distance-b.distance);
  if (currentView==='match') out = out.filter(d=>matches.has(d.id));

  if (f.breed) out = out.filter(d=>d.breed===f.breed);
  if (f.sex)   out = out.filter(d=>d.sex===f.sex);
  if (f.size)  out = out.filter(d=>d.size===f.size);
  if (f.coat)  out = out.filter(d=>d.coat===f.coat);
  if (!isNaN(f.dist) && f.dist>0) out = out.filter(d=>d.distance<=f.dist);
  if (f.verifiedOnly) out = out.filter(d=>d.verified===true);

  if (f.age){
    if (f.age==='0-1') out=out.filter(d=>d.age<=1);
    if (f.age==='2-4') out=out.filter(d=>d.age>=2&&d.age<=4);
    if (f.age==='5-7') out=out.filter(d=>d.age>=5&&d.age<=7);
    if (f.age==='8+')  out=out.filter(d=>d.age>=8);
  }
  return out;
}

/* ===== Render ===== */
function render(){
  if (currentView==='near'){
    const list = applyFilters(dogs);
    el.near.innerHTML = list.map(cardHTML).join('');
    el.swipe.hidden = true; el.match.hidden = true; el.near.hidden=false;
    showBanner();
  }
  else if (currentView==='match'){
    const list = applyFilters(dogs);
    el.match.innerHTML = list.map(cardHTML).join('');
    el.near.hidden = true; el.swipe.hidden = true; el.match.hidden=false;
    showBanner();
  }
  else { // swipe
    const list = applyFilters(dogs);
    currentSwipeIndex = 0;
    renderSwipe(list);
    el.near.hidden = true; el.match.hidden = true; el.swipe.hidden=false;
    showBanner();
  }
}

function cardHTML(d){
  const badge = d.verified ? `<span class="verify-badge" title="Verificato 🐾">🐾</span>` : ``;
  return `
  <article class="card card-enter" data-id="${d.id}">
    <div class="pic">
      <img src="${d.image}" alt="Foto di ${d.name}">
      <span class="badge">${d.distance.toFixed(1)} km</span>
      ${d.online ? '<span class="dot"></span>' : ''}
    </div>
    <div class="body">
      <div class="name">${d.name}, ${d.age} ${badge}</div>
      <div class="breed">${d.breed}</div>
      <div class="actions">
        <button class="btn-round btn-no"  data-act="no"  data-id="${d.id}"><span class="emoji">🥲</span></button>
        <button class="btn-round btn-yes" data-act="yes" data-id="${d.id}"><span class="emoji">❤️</span></button>
      </div>
    </div>
  </article>`;
}

function renderSwipe(list){
  if (list.length===0){ el.swipe.innerHTML = `<p style="color:#6b7280">Nessun profilo.</p>`; return; }
  const d = list[currentSwipeIndex % list.length];
  const badge = d.verified ? `<span class="verify-badge" title="Verificato 🐾">🐾</span>` : ``;
  el.swipe.innerHTML = `
    <article class="card card-big card-enter" data-id="${d.id}">
      <div class="pic">
        <img src="${d.image}" alt="Foto di ${d.name}">
        <span class="badge">${d.distance.toFixed(1)} km</span>
        ${d.online ? '<span class="dot"></span>' : ''}
      </div>
      <div class="body" style="text-align:center">
        <div class="name">${d.name}, ${d.age} ${badge}</div>
        <div class="breed">${d.breed}</div>
        <div class="swipe-actions">
          <button class="btn-round btn-no"  data-act="no"  data-id="${d.id}"><span class="emoji">🥲</span></button>
          <button class="btn-round btn-yes" data-act="yes" data-id="${d.id}"><span class="emoji">❤️</span></button>
        </div>
      </div>
    </article>
  `;
}

/* ===== Tabs ===== */
el.tabs.forEach(b=>{
  b.addEventListener('click', ()=>{
    el.tabs.forEach(x=>x.classList.remove('active'));
    b.classList.add('active');
    currentView = b.dataset.view;
    render();
  });
});

/* ===== Filtri ===== */
$('#filterToggle').addEventListener('click', ()=>{
  const v = el.filterPanel.hidden;
  el.filterPanel.hidden = !v;
  $('#filterToggle').setAttribute('aria-expanded', String(v));
});
$('#filtersReset').addEventListener('click', ()=>{ el.filterForm.reset(); render(); });
el.filterForm.addEventListener('submit', (e)=>{ e.preventDefault(); render(); });

/* ===== Like/No + click card ===== */
document.addEventListener('click', (e)=>{
  // azioni like/no ovunque
  const btn = e.target.closest('button[data-act]');
  if (btn){
    const id = Number(btn.dataset.id);
    if (btn.dataset.act==='yes'){
      matches.add(id);
      localStorage.setItem('plutoo_matches', JSON.stringify([...matches]));
      likePulse(btn);
      likeCounter++; localStorage.setItem('plutoo_like_counter', String(likeCounter));
      if (likeCounter>=10){ likeCounter=0; localStorage.setItem('plutoo_like_counter','0'); showInterstitial('10-like'); }
      if (currentView==='swipe'){
        const list = applyFilters(dogs);
        currentSwipeIndex = (currentSwipeIndex+1) % Math.max(list.length,1);
        renderSwipe(list);
      } else {
        render();
      }
    } else {
      // sposta in fondo per simulare skip
      const idx = dogs.findIndex(d=>d.id===id);
      if (idx>=0) dogs.push(...dogs.splice(idx,1));
      if (currentView==='swipe'){
        const list = applyFilters(dogs);
        currentSwipeIndex = (currentSwipeIndex+1) % Math.max(list.length,1);
        renderSwipe(list);
      } else {
        render();
      }
    }
    return;
  }

  // click su card → apri dettaglio
  const card = e.target.closest('.card[data-id]');
  if (card){
    const id = Number(card.dataset.id);
    openDetail(id);
  }
});

function likePulse(btn){
  btn.classList.add('pulse');
  setTimeout(()=>btn.classList.remove('pulse'), 200);
}

/* ===== Dettaglio ===== */
function openDetail(id){
  const d = dogs.find(x=>x.id===id);
  if (!d) return;
  currentDetailId = id;
  el.dPhoto.src = d.image;
  el.dTitle.textContent = `${d.name}, ${d.age} ${d.verified?'🐾':''}`;
  el.dMeta.textContent  = `${d.breed} · ${d.sex==='M'?'Maschio':'Femmina'} · ${d.size} · ${d.coat} · ${d.distance.toFixed(1)} km`;
  el.dEnergy.textContent = d.energy;
  el.dPedigree.textContent = d.pedigree;
  el.dArea.textContent = d.area;
  el.dDesc.textContent = d.desc;
  el.detail.hidden = false;
}
el.closeDetail.addEventListener('click', ()=> el.detail.hidden=true);
document.addEventListener('keydown', e=>{ if (e.key==='Escape') el.detail.hidden=true; });

/* ===== Verifica: caricamento documenti (demo) ===== */
el.verifyForm.addEventListener('submit', (e)=>{
  e.preventDefault();
  const id = currentDetailId;
  if (!id) return;
  const dog = dogs.find(d=>d.id===id);
  if (!dog) return;
  el.verifyStatus.textContent = 'Caricamento…';
  setTimeout(()=>{
    dog.verified = true; // simulazione esito ok
    el.verifyStatus.textContent = 'Verificato! 🐾';
    // aggiorna header titolo con badge
    el.dTitle.textContent = `${dog.name}, ${dog.age} 🐾`;
    // refresh liste
    render();
  }, 900);
});

/* ===== Interstitial/Reward (demo web) ===== */
function showInterstitial(reason){
  // qui solo overlay finto; per AdMob nativo integri SDK nella webview
  const ov = document.createElement('div');
  ov.style = 'position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:99999;display:flex;align-items:center;justify-content:center;color:#fff;font:600 18px system-ui';
  ov.innerHTML = `<div style="background:#111;border-radius:12px;padding:18px 22px;max-width:320px;text-align:center;">
    <div style="margin-bottom:8px">Annuncio video</div>
    <div style="opacity:.8;font-weight:400">(${reason}) Sto caricando…</div>
  </div>`;
  document.body.appendChild(ov);
  setTimeout(()=>{ document.body.removeChild(ov); }, 3000);
}

/* ===== Init ===== */
render();
showBanner();
