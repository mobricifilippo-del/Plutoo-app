/* Plutoo – app.js (fix richiesti)
   1) Sponsor footer gestito da CSS (niente logo gigante fuori posto)
   2) Swipe con il dito su Amore/Social (→ like, ← skip)
   3) Animazione “kiss” quando fai like
   4) Tap sulla card “Vicino a te” apre la scheda profilo
*/

(() => {
  const $  = (s, r=document)=>r.querySelector(s);
  const $$ = (s, r=document)=>[...r.querySelectorAll(s)];

  const state = {
    filters: { breed:null },
    profiles: [],
    queue: [],
    currentIndex: 0,
    liked: new Map(),    // id -> profile (per Match)
  };

  document.addEventListener('DOMContentLoaded', init);

  async function init(){
    wireNav();
    wireSheets();
    wireFilterPanel();
    await loadBreeds();
    prepareLocalProfiles();
    renderNearGrid();
    wireTabs();
    wireBigCards();
    wireSwipeBigCards();   // <— swipe dito
  }

  /* ========== NAV/HOME ========== */
  function wireNav(){
    $('#ctaEnter')?.addEventListener('click', (e)=>{
      e.preventDefault();
      $('#landing')?.classList.remove('active');
      $('#app')?.classList.add('active');
    });
  }

  function wireSheets(){
    $$('.close').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const id = btn.getAttribute('data-close');
        if (id) $('#'+id)?.classList.remove('show');
      });
    });
    $('#btnLoginTop')?.addEventListener('click', ()=> $('#sheetLogin')?.classList.add('show'));
    $('#btnRegisterTop')?.addEventListener('click', ()=> $('#sheetRegister')?.classList.add('show'));
    $('#btnLoginUnder')?.addEventListener('click', ()=> $('#sheetLogin')?.classList.add('show'));
  }

  /* ========== FILTRI ========== */
  function wireFilterPanel(){
    $('#filterToggle')?.addEventListener('click', ()=>{
      const p = $('#filterPanel'); if (!p) return;
      p.hidden = !p.hidden;
      $('#filterToggle').textContent = p.hidden ? 'Ricerca personalizzata ▾' : 'Ricerca personalizzata ▴';
    });

    $('#filterForm')?.addEventListener('submit', (e)=>{
      e.preventDefault();
      state.filters.breed = $('#breedInput')?.value?.trim() || null;
      renderNearGrid();
    });

    $('#filtersReset')?.addEventListener('click', ()=>{
      state.filters.breed = null;
      if ($('#breedInput')) $('#breedInput').value = '';
      renderNearGrid();
    });
  }

  async function loadBreeds(){
    try{
      const res = await fetch('breeds.json', {cache:'no-store'});
      const list = await res.json();
      const dl = $('#breedList');
      if (dl) {
        dl.innerHTML = '';
        list.forEach(b=>{
          const o = document.createElement('option');
          o.value = b; dl.appendChild(o);
        });
      }
    }catch(_){}
  }

  /* ========== DATI MOCK (dog1..dog4) ========== */
  function prepareLocalProfiles(){
    const imgs = ['dog1.jpg','dog2.jpg','dog3.jpg','dog4.jpg'];
    const names = ['Luna','Fido','Bruno','Maya','Kira','Rocky','Zoe','Leo'];
    let id=1;
    state.profiles = Array.from({length:12}).map((_,i)=>({
      id: id++,
      name: names[i%names.length],
      age: 1 + (i%7),
      sex: (i%2)?'F':'M',
      size: ['Piccola','Media','Grande'][i%3],
      coat: ['Corto','Medio','Lungo'][i%3],
      energy: ['Bassa','Media','Alta'][i%3],
      breed: ['Barboncino','Bulldog Francese','Shiba Inu','Pastore Tedesco'][i%4],
      img: imgs[i%imgs.length],
      distanceKm: (1+i*1.2).toFixed(1)
    }));
    state.queue = [...state.profiles];
    state.currentIndex = 0;
    hydrateBigCards();
  }

  /* ========== TABS ========== */
  function wireTabs(){
    $$('.tab').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        $$('.tab').forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
        $$('.tabpane').forEach(p=>p.classList.remove('active'));
        const pane = $('#'+btn.dataset.tab);
        pane?.classList.add('active');
        if (btn.dataset.tab==='matches') renderMatches();
        if (btn.dataset.tab==='love' || btn.dataset.tab==='social') hydrateBigCards();
      });
    });
  }

  /* ========== LISTA VICINO A TE ========== */
  function renderNearGrid(){
    const grid = $('#grid'); if(!grid) return;
    const counter = $('#counter');

    let list = [...state.profiles];
    if (state.filters.breed){
      const b = state.filters.breed.toLowerCase();
      list = list.filter(p=> (p.breed||'').toLowerCase().includes(b));
    }

    grid.innerHTML = list.map(p => cardHTML(p)).join('');
    counter.textContent = `${list.length} profili trovati`;

    list.forEach(p=>{
      $('#like-'+p.id)?.addEventListener('click', ()=>{ onLike(p); });
      $('#no-'+p.id)?.addEventListener('click', ()=>{ nextCard(); });
      // tap immagine -> profilo
      $('#img-'+p.id)?.addEventListener('click', ()=> openProfile(p));
    });
  }

  function cardHTML(p){
    return `
    <article class="card">
      <span class="online"></span>
      <img id="img-${p.id}" src="${p.img}" alt="${p.name}">
      <div class="card-info">
        <div class="title">
          <div class="name">${p.name}</div>
          <div class="dist">${p.distanceKm} km</div>
        </div>
        <div class="dist"><span class="muted">${p.breed}</span></div>
        <div class="actions">
          <button id="no-${p.id}" class="circle no">🥲</button>
          <button id="like-${p.id}" class="circle like">❤️</button>
        </div>
      </div>
    </article>`;
  }

  /* ========== CARTE GRANDI (Amore/Social) ========== */
  function hydrateBigCards(){
    const p = state.queue[state.currentIndex] || state.profiles[0];
    if (!p) return;

    // Amore
    $('#loveImg')?.setAttribute('src', p.img);
    if ($('#loveTitle')) $('#loveTitle').textContent = p.name;
    if ($('#loveMeta'))  $('#loveMeta').textContent  = `${p.breed} · ${p.distanceKm} km`;
    if ($('#loveBio'))   $('#loveBio').textContent   = `${p.name} ha ${p.age} anni, ${p.sex==='M'?'maschio':'femmina'}, taglia ${p.size.toLowerCase()}, pelo ${p.coat.toLowerCase()}, energia ${p.energy.toLowerCase()}.`;

    // Social
    $('#socImg')?.setAttribute('src', p.img);
    if ($('#socTitle')) $('#socTitle').textContent = p.name;
    if ($('#socMeta'))  $('#socMeta').textContent  = `${p.breed} · ${p.distanceKm} km`;
    if ($('#socBio'))   $('#socBio').textContent   = `Cerchi amici per giocare/camminare? ${p.name} è perfetto per te.`;
  }

  function wireBigCards(){
    $('#loveYes')?.addEventListener('click', ()=>{
      const p = current(); if (p){ onLike(p); nextCard(); }
    });
    $('#loveNo')?.addEventListener('click', ()=> nextCard());

    $('#socYes')?.addEventListener('click', ()=>{
      const p = current(); if (p){ onLike(p); nextCard(); }
    });
    $('#socNo')?.addEventListener('click', ()=> nextCard());
  }

  function current(){ return state.queue[state.currentIndex]; }

  /* Swipe dito su card grande */
  function wireSwipeBigCards(){
    const card = $('.deck .card.big'); if(!card) return;

    let startX=0, startY=0, swiping=false;
    card.addEventListener('touchstart', e=>{
      const t=e.touches[0]; startX=t.clientX; startY=t.clientY; swiping=true;
    }, {passive:true});

    card.addEventListener('touchend', e=>{
      if(!swiping) return; swiping=false;
      const dx = e.changedTouches[0].clientX - startX;
      const dy = e.changedTouches[0].clientY - startY;
      if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;

      const p = current(); if(!p) return;
      if (dx > 0){ onLike(p); } // destra = like
      nextCard();
    }, {passive:true});
  }

  function nextCard(){
    state.currentIndex = (state.currentIndex+1) % state.queue.length;
    hydrateBigCards();
  }

  /* ========== LIKE / MATCH ========== */
  function onLike(p){
    if (!state.liked.has(p.id)) state.liked.set(p.id, p);
    renderMatches();
    showKiss(p.img);  // animazione
  }

  function renderMatches(){
    const list = $('#matchList');
    const empty = $('#emptyMatch');
    if (!list || !empty) return;

    const arr = [...state.liked.values()];
    if (!arr.length){
      list.innerHTML = '';
      empty.style.display = '';
      return;
    }
    empty.style.display = 'none';
    list.innerHTML = arr.map(p=>`
      <div class="item" style="display:flex;align-items:center;gap:12px;background:#161b3a;border-radius:12px;padding:10px;box-shadow:0 6px 18px rgba(0,0,0,.25)">
        <img src="${p.img}" alt="${p.name}" style="width:56px;height:56px;border-radius:50%;object-fit:cover;background:#11152b">
        <div>
          <div class="name">${p.name}</div>
          <div class="muted">${p.breed}</div>
        </div>
        <button class="btn primary" style="margin-left:auto;border-radius:999px;padding:8px 14px" onclick="openChat('${p.name}','${p.img}')">Chat</button>
      </div>
    `).join('');
  }

  /* Animazione bacio */
  function showKiss(img){
    const w = document.createElement('div');
    w.className = 'kiss-wrap';
    w.innerHTML = `
      <div class="kiss-bubble">
        <img class="kiss-dog kiss-left"  src="${img}" alt="">
        <div class="kiss-heart">💗</div>
        <img class="kiss-dog kiss-right" src="${img}" alt="">
      </div>`;
    document.body.appendChild(w);
    setTimeout(()=> w.remove(), 1000);
  }

  /* ========== SCHEDA PROFILO ========== */
  function openProfile(p){
    const page = $('#profilePage'); const body = $('#ppBody'); const title = $('#ppTitle');
    if (!page || !body || !title) return;
    title.textContent = p.name;
    body.innerHTML = `
      <img class="pp-cover" src="${p.img}" alt="${p.name}">
      <div class="pp-section">
        <h3>${p.breed}</h3>
        <p class="muted">${p.distanceKm} km · ${p.age} anni · ${p.sex==='M'?'Maschio':'Femmina'}</p>
      </div>
      <div class="pp-section">
        <h4>Descrizione</h4>
        <p>${p.name} è un cane di taglia ${p.size.toLowerCase()}, pelo ${p.coat.toLowerCase()}, energia ${p.energy.toLowerCase()}.</p>
      </div>
      <div class="pp-actions">
        <button class="btn light" onclick="history.back()">Indietro</button>
        <button class="btn primary" onclick="openChat('${p.name}','${p.img}')">Invia messaggio</button>
      </div>
    `;
    page.classList.add('show');
  }
  window.openProfile = openProfile;

  /* Chat quick open (già presente nello UI) */
  window.openChat = (name, img)=>{
    const sheet = $('#chat');
    const a = $('#chatAvatar'); const n = $('#chatName');
    if (a) a.src = img || 'dog1.jpg';
    if (n) n.textContent = name || 'Chat';
    sheet?.classList.add('show');
  };

})();
