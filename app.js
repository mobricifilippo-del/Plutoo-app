/* ===== Dataset demo ===== */
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
let currentView = 'near'; // near | browse | match
let likeCounter = Number(localStorage.getItem('plutoo_likes_count')||0);

const $  = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

const els = {
  cards: $('#cards'),
  count: $('#countLabel'),
  tabs: $$('.tab'),
  filterToggle: $('#filterToggle'),
  filterPanel: $('#filterPanel'),
  filterForm:  $('#filterForm'),
  chips: $('#activeChips'),

  // dettaglio
  detail: $('#detail'),
  dPhoto: $('#dPhoto'),
  dTitle: $('#dTitle'),
  dMeta: $('#dMeta'),
  dEnergy: $('#dEnergy'),
  dPedigree: $('#dPedigree'),
  dArea: $('#dArea'),
  dDesc: $('#dDesc'),
  closeDetail: $('#closeDetail'),
};

/* ===== Ads (banner sticky + “vignette” via auto-ads) ===== */
const Ads = (function(){
  function onEnterListView(){
    try{
      const main = document.getElementById('list');
      const sticky = document.getElementById('adSticky');
      if (main && sticky){
        main.classList.add('has-ad');
        sticky.style.display='block';
        try{ (window.adsbygoogle = window.adsbygoogle || []).push({}); }catch(e){}
      }
    }catch(e){}
  }
  function onLeaveListView(){
    try{
      const main = document.getElementById('list');
      const sticky = document.getElementById('adSticky');
      if (main && sticky){
        main.classList.remove('has-ad');
        sticky.style.display='none';
      }
    }catch(e){}
  }
  // “Interstitial” finto (placeholder). Le vignette reali arrivano da AdSense auto-ads.
  function showInterstitial(reason){
    const ov = document.createElement('div');
    ov.style = 'position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:99999;display:flex;align-items:center;justify-content:center;color:#fff;font:600 18px system-ui';
    ov.innerHTML = `<div style="background:#111;border-radius:12px;padding:18px 22px;max-width:320px;text-align:center;">
      <div style="margin-bottom:8px">Annuncio video</div>
      <div style="opacity:.8;font-weight:400">(${reason}) Sto caricando…</div>
    </div>`;
    document.body.appendChild(ov);
    setTimeout(()=>{ document.body.removeChild(ov); }, 3000);
  }
  // Sponsor: mostra “interstitial” finto prima di aprire (opzionale)
  (function wireSponsor(){
    const a = document.getElementById('sponsorLink');
    if (!a) return;
    a.addEventListener('click',(ev)=>{
      ev.preventDefault();
      showInterstitial('sponsor');
      setTimeout(()=> window.open(a.href,'_blank'), 3200);
    });
  })();

  return { onEnterListView, onLeaveListView, showInterstitial };
})();

/* ===== Helpers ===== */
function filteredList(){
  const data = new FormData(els.filterForm || new HTMLFormElement());
  let list = [...dogs];

  const breed = data.get('breed')||'';
  const age   = data.get('age')||'';
  const sex   = data.get('sex')||'';
  const size  = data.get('size')||'';
  const coat  = data.get('coat')||'';
  const dist  = parseFloat(data.get('distance')||'0');
  const verifiedOnly = data.get('verifiedOnly') === 'on';

  if (currentView==='near'){
    list = list.filter(d => d.online).sort((a,b)=>a.distance-b.distance);
  } else if (currentView==='match'){
    list = list.filter(d => matches.has(d.id));
  }

  if (breed) list = list.filter(d => d.breed===breed);
  if (sex)   list = list.filter(d => d.sex===sex);
  if (size)  list = list.filter(d => d.size===size);
  if (coat)  list = list.filter(d => d.coat===coat);
  if (!isNaN(dist) && dist>0) list = list.filter(d => d.distance<=dist);
  if (verifiedOnly) list = list.filter(d => d.verified === true);

  if (age){
    if (age==='0-1') list=list.filter(d=>d.age<=1);
    if (age==='2-4') list=list.filter(d=>d.age>=2 && d.age<=4);
    if (age==='5-7') list=list.filter(d=>d.age>=5 && d.age<=7);
    if (age==='8+')  list=list.filter(d=>d.age>=8);
  }
  return list;
}

function render(){
  const list = filteredList();
  els.cards.innerHTML = '';
  els.count.textContent = `Mostro ${list.length} profili`;

  if (currentView==='browse'){
    renderBrowse(list);
    return;
  }

  list.forEach(d => {
    const badge = d.verified ? `<span class="verify-badge" title="Verificato 🐾">🐾</span>` : ``;
    const card = document.createElement('article');
    card.className = 'card';
    card.setAttribute('data-id', d.id);
    card.innerHTML = `
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
    `;
    els.cards.appendChild(card);
  });
}

function renderBrowse(list){
  els.cards.innerHTML = '';
  if (list.length===0){
    els.cards.innerHTML = `<p style="color:#6b7280;padding:10px 0">Nessun profilo da mostrare.</p>`;
    return;
  }
  const d = list[0];
  const badge = d.verified ? `<span class="verify-badge" title="Verificato 🐾">🐾</span>` : ``;
  const card = document.createElement('article');
  card.className = 'card card-big';
  card.setAttribute('data-id', d.id);
  card.innerHTML = `
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
  `;
  els.cards.appendChild(card);
}

/* ===== Eventi ===== */
els.tabs.forEach(btn=>{
  btn.addEventListener('click',()=>{
    els.tabs.forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    currentView = btn.dataset.view;
    render();
    if (location.hash === '#list') Ads.onEnterListView();
  });
});

// like/dislike + dettaglio
els.cards.addEventListener('click',(e)=>{
  const btn = e.target.closest('button[data-act]');
  const card = e.target.closest('.card');
  if (!card) return;
  const id = Number(card.getAttribute('data-id'));
  const dog = dogs.find(x=>x.id===id);
  if (!dog) return;

  if (btn){
    if (btn.dataset.act==='yes'){
      matches.add(id);
      localStorage.setItem('plutoo_matches', JSON.stringify([...matches]));
      likeCounter++; localStorage.setItem('plutoo_likes_count', String(likeCounter));
      // animazione cuore
      btn.animate([{transform:'scale(1)'},{transform:'scale(1.18)'},{transform:'scale(1)'}],{duration:180});
      // ogni 10 like → “interstitial” finto; le vignette vere le fa AdSense auto-ads
      if (likeCounter>=10){
        likeCounter=0; localStorage.setItem('plutoo_likes_count','0');
        Ads.showInterstitial('10-like');
      }
      if (currentView==='browse'){
        const idx = dogs.findIndex(d=>d.id===id);
        if (idx>=0) dogs.push(...dogs.splice(idx,1));
      }
      render();
      return;
    } else if (btn.dataset.act==='no'){
      const idx = dogs.findIndex(d=>d.id===id);
      if (idx>=0) dogs.push(...dogs.splice(idx,1));
      render();
      return;
    }
  }

  // click card → dettaglio
  openDetail(dog);
});

function openDetail(d){
  els.dPhoto.src = d.image;
  els.dTitle.textContent = `${d.name}, ${d.age} ${d.verified ? '🐾' : ''}`;
  els.dMeta.textContent  = `${d.breed} · ${d.sex==='M'?'Maschio':'Femmina'} · ${d.size} · ${d.coat} · ${d.distance.toFixed(1)} km`;
  els.dEnergy.textContent = d.energy;
  els.dPedigree.textContent = d.pedigree;
  els.dArea.textContent = d.area;
  els.dDesc.textContent = d.desc;
  els.detail.hidden = false;
}
els.closeDetail.addEventListener('click',()=> els.detail.hidden = true);
document.addEventListener('keydown',e=>{ if (e.key==='Escape') els.detail.hidden=true; });

// Filtro tendina
$('#filterToggle').addEventListener('click', ()=> els.filterPanel.hidden = !els.filterPanel.hidden);
$('#filtersReset').addEventListener('click', ()=>{ els.filterForm.reset(); render(); });
els.filterForm.addEventListener('submit', (e)=>{ e.preventDefault(); render(); });

// Geolocalizzazione (demo)
$('#locOn').addEventListener('click', ()=> alert('Posizione attivata (demo).'));
$('#locLater').addEventListener('click', ()=> alert('Ok, più tardi.'));

// Hash → attiva/disattiva banner sticky
window.addEventListener('hashchange', ()=>{
  if (location.hash==='#list') Ads.onEnterListView();
  else Ads.onLeaveListView();
});
if (location.hash==='#list') Ads.onEnterListView();

/* ===== Cookie banner ===== */
(function(){
  const KEY='plutoo_cookies_v2';
  const el = document.getElementById('cookie-banner');
  const btn = document.getElementById('acceptCookies');
  try {
    const ok = localStorage.getItem(KEY)==='true';
    if (!ok) el.style.display='flex';
  } catch(e) { el.style.display='flex'; }
  btn?.addEventListener('click',()=>{
    try{ localStorage.setItem(KEY,'true'); }catch(e){}
    el.style.display='none';
  });
})();

/* ===== Avvio ===== */
render();
