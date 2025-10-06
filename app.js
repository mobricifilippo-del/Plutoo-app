/* =========================================================
   Plutoo – app.js (mobile-first, robusto)
   - Popola datalist razze da razze.json
   - Pannello "Ricerca personalizzata" funzionante
   - Tabs: Vicino / Amore / Giocare-Camminare / Match
   - Griglia "Vicino a te" con card e apertura profilo
   - Deck swipe per Amore e Social (like/skip + match list)
   - Chat fittizia
   - Geolocalizzazione (best effort) e distanza fittizia
   - Sponsor footer: testo/struttura forzata al centro
   - Tutto difensivo: se un nodo manca, l’app non si rompe
   ========================================================= */

(() => {
  // ------------------------- helpers -------------------------
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const on = (el, ev, fn, opt) => el && el.addEventListener(ev, fn, opt);
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  const fallbackImg = (e) => { e.target.src = 'sponsor-logo.png'; e.target.onerror = null; };

  // ------------------------- stato ---------------------------
  const state = {
    // posizione approssimata utente
    userLoc: null,      // {lat, lon}
    // profili mock locali
    allProfiles: [],
    // deck per amore/social
    loveIdx: 0,
    socIdx : 0,
    likedIds: new Set(),
    matches: [],
    // filtri
    filters: {
      breed: '',
      ageBand: '',
      sex: '',
      size: '',
      coat: '',
      energy: '',
      pedigree: '',
      distance: ''   // km
    },
    breeds: []
  };

  // =============== bootstrap ===============
  document.addEventListener('DOMContentLoaded', init);

  async function init(){
    wireBasicNav();           // ENTRA, login, register, legal, sponsor
    wireFilterPanel();        // toggle + submit/reset + chips
    wireTabs();               // tab switching
    wireGeoBar();             // posizione

    await loadBreeds();       // razze.json -> datalist

    prepareLocalProfiles();   // crea profili (cane1..4)
    renderNearGrid();         // vista iniziale
    wireDecks();              // Amore/Social
    rebuildMatches();         // lista match
  }

  // =============== NAV / HOME ===============
  function wireBasicNav(){
    // ENTRA (dalla landing) — goHome() è usata anche dall’HTML
    window.goHome = () => {
      const landing = $('#landing');
      const app = $('#app');
      landing && landing.classList.remove('active');
      app && app.classList.add('active');
      // alla prima apertura: assicurati che la tab "near" sia attiva
      selectTab('near');
    };

    // bottoni header
    on($('#btnLoginTop'), 'click', () => openSheet('#sheetLogin'));
    on($('#btnLoginUnder'), 'click', () => openSheet('#sheetLogin'));
    on($('#btnRegisterTop'), 'click', () => openSheet('#sheetRegister'));

    // chiusura sheet/dialog generica (x)
    $$('.close').forEach(btn => {
      on(btn, 'click', () => {
        const id = btn.getAttribute('data-close');
        if (id) closeSheet('#' + id);
      });
    });

    // privacy / termini
    on($('#openPrivacy'), 'click', () => $('#privacyDlg')?.showModal());
    on($('#openTerms'), 'click', () => $('#termsDlg')?.showModal());

    // sponsor footer (forza struttura/centro)
    fixSponsorFooter();
  }

  function openSheet(sel){ const n = $(sel); if (n) n.classList.add('show'); }
  function closeSheet(sel){ const n = $(sel); if (n) n.classList.remove('show'); }

  // =============== GEO ======================
  function wireGeoBar(){
    const bar = $('#geoBar');
    on($('#dismissGeo'), 'click', () => bar?.classList.add('hidden'));
    on($('#enableGeo'), 'click', async () => {
      try{
        const perm = await navigator.permissions?.query?.({name:'geolocation'}).catch(()=>null);
        navigator.geolocation.getCurrentPosition(
          pos => {
            state.userLoc = { lat: pos.coords.latitude, lon: pos.coords.longitude };
            bar?.classList.add('hidden');
            renderNearGrid(); // aggiorna distance
          },
          () => { bar?.classList.add('hidden'); }
        );
      }catch{ bar?.classList.add('hidden'); }
    });
  }

  // =============== RAZZE ====================
  async function loadBreeds(){
    try{
      const res = await fetch('razze.json', {cache:'no-store'});
      if(!res.ok) throw new Error('HTTP '+res.status);
      const data = await res.json();
      state.breeds = Array.isArray(data) ? data.map(String) : [];
      const dl = $('#breedList');
      if (dl){
        dl.innerHTML = '';
        state.breeds.forEach(b => {
          const o = document.createElement('option');
          o.value = b;
          dl.appendChild(o);
        });
      }
    }catch(_){ /* se manca, l’input rimane libero */ }
  }

  // =============== FILTRI ===================
  function wireFilterPanel(){
    const panel = $('#filterPanel');
    on($('#filterToggle'), 'click', () => {
      if (!panel) return;
      panel.hidden = !panel.hidden;
      $('#filterToggle').textContent = panel.hidden ? 'Ricerca personalizzata ▾' : 'Ricerca personalizzata ▴';
    });

    // leggi form su submit
    const form = $('#filterForm');
    on(form, 'submit', e => {
      e.preventDefault();
      const fd = new FormData(form);
      state.filters.breed    = (fd.get('breed')||'').trim();
      state.filters.ageBand  = fd.get('ageBand')||'';
      state.filters.sex      = fd.get('sex')||'';
      state.filters.size     = fd.get('size')||'';
      state.filters.coat     = fd.get('coat')||'';
      state.filters.energy   = fd.get('energy')||'';
      state.filters.pedigree = fd.get('pedigree')||'';
      state.filters.distance = fd.get('distance')||'';
      renderChips();
      renderNearGrid();
      rebuildDeckSources();
    });

    // reset
    on($('#filtersReset'), 'click', () => {
      form?.reset();
      Object.keys(state.filters).forEach(k => state.filters[k]='');
      renderChips();
      renderNearGrid();
      rebuildDeckSources();
    });

    // autoupdate breed typing
    const breedInput = $('#breedInput');
    on(breedInput, 'input', () => {
      state.filters.breed = (breedInput.value||'').trim();
    });
  }

  function renderChips(){
    const host = $('#activeChips');
    if (!host) return;
    host.innerHTML = '';
    const map = {
      breed:'Razza', ageBand:'Età', sex:'Sesso', size:'Taglia',
      coat:'Pelo', energy:'Energia', pedigree:'Pedigree', distance:'Distanza'
    };
    Object.entries(map).forEach(([k, label])=>{
      const v = (state.filters[k]||'').toString().trim();
      if(!v) return;
      const wrap = document.createElement('div');
      wrap.className = 'chip-wrap';
      wrap.innerHTML = `<span class="chip">${label}: ${v}</span><button class="chip-x">×</button>`;
      on($('.chip-x', wrap), 'click', () => {
        state.filters[k]='';
        // sincronizza form
        const el = $(`[name="${k}"]`);
        if (el) el.value = '';
        renderChips();
        renderNearGrid();
        rebuildDeckSources();
      });
      host.appendChild(wrap);
    });
  }

  // =============== DATI / PROFILI ===========
  function prepareLocalProfiles(){
    const imgs = ['cane1.jpg','cane2.jpg','cane3.jpg','cane4.jpg'];
    const names = ['Luna','Fido','Bruno','Maya','Kira','Rocky','Zoe','Leo'];
    let id=1;
    const base = imgs.map((src,i)=>({
      id: id++,
      name: names[i%names.length],
      age : 1 + (i%10),
      sex : (i%2 ? 'F' : 'M'),
      size: ['Piccola','Media','Grande'][i%3],
      coat: ['Corto','Medio','Lungo'][i%3],
      energy: ['Bassa','Media','Alta'][i%3],
      pedigree: (i%2 ? 'Sì' : 'No'),
      breed: guessBreed(names[i%names.length]),
      img: src,
      km: 1 + i*1.2
    }));
    // duplica per avere più card
    state.allProfiles = [...base, ...base.map(p=>({...p,id:id++})), ...base.map(p=>({...p,id:id++}))];

    // precarica immagini
    state.allProfiles.forEach(p => { const im=new Image(); im.src=p.img; });
  }
  function guessBreed(name){
    const list = ['Labrador','Beagle','Shiba Inu','Golden Retriever','Barboncino','Pastore Tedesco','Bulldog Francese','Meticcio'];
    return list[name.charCodeAt(0)%list.length];
  }

  // filtro comune
  function passesFilters(p){
    const F = state.filters;
    if (F.breed && !p.breed.toLowerCase().includes(F.breed.toLowerCase())) return false;
    if (F.sex && p.sex !== F.sex) return false;
    if (F.size && p.size !== F.size) return false;
    if (F.coat && p.coat !== F.coat) return false;
    if (F.energy && p.energy !== F.energy) return false;
    if (F.pedigree && p.pedigree !== F.pedigree) return false;
    if (F.ageBand){
      const [a,b] = F.ageBand.split('–');
      const min = parseInt(a||'0',10);
      const max = b?.includes('+') ? 99 : parseInt(b||'99',10);
      if (p.age < min || p.age > max) return false;
    }
    if (F.distance){
      const maxKm = parseFloat(F.distance)||0;
      if (maxKm && p.km > maxKm) return false;
    }
    return true;
  }

  // =============== VICINO (griglia) =========
  function renderNearGrid(){
    const grid = $('#grid');
    const counter = $('#counter');
    const empty = $('#emptyNear');
    if (!grid || !counter || !empty) return;

    const list = state.allProfiles.filter(passesFilters);
    counter.textContent = `${list.length} profili trovati`;

    grid.innerHTML = '';
    if (!list.length){
      empty.classList.remove('hidden');
      return;
    }
    empty.classList.add('hidden');

    list.forEach(p => {
      const card = document.createElement('article');
      card.className = 'card';
      card.innerHTML = `
        <span class="online"></span>
        <img src="${p.img}" alt="${p.name}" onerror="this.src='sponsor-logo.png'">
        <div class="card-info">
          <div class="title">
            <div class="name">${p.name}</div>
            <div class="dist">${p.km.toFixed(1)} km</div>
          </div>
          <span class="intent-pill">${p.breed}</span>
          <div class="actions">
            <button class="circle no" aria-label="Salta">🥲</button>
            <button class="circle like" aria-label="Mi piace">❤️</button>
          </div>
        </div>
      `;
      on($('.circle.no', card), 'click', (e)=>{ e.stopPropagation(); /* niente */ });
      on($('.circle.like', card), 'click', (e)=>{ e.stopPropagation(); likeProfile(p); });
      on(card, 'click', ()=> openProfilePage(p));
      grid.appendChild(card);
    });
  }

  // =============== TABS =====================
  function wireTabs(){
    $$('.tab').forEach(btn=>{
      on(btn,'click', ()=>{
        $$('.tab').forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
        const target = btn.getAttribute('data-tab');
        selectTab(target);
      });
    });
  }

  function selectTab(key){
    // tabpane: #near, #love, #social, #matches
    ['near','love','social','matches'].forEach(id=>{
      const n = $('#'+id);
      if(n) n.classList.toggle('active', id===key);
    });
    if (key==='love' || key==='social') ensureDeckRendered(key);
    if (key==='matches') rebuildMatches();
  }

  // =============== DECK (Amore/Social) =====
  function wireDecks(){
    // bottoni love
    on($('#loveYes'), 'click', ()=> deckLike('love'));
    on($('#loveNo' ), 'click', ()=> deckSkip('love'));
    // bottoni social
    on($('#socYes'),  'click', ()=> deckLike('social'));
    on($('#socNo' ),  'click', ()=> deckSkip('social'));

    // swipe touch
    makeSwipe($('#love .card.big'), ()=>deckLike('love'), ()=>deckSkip('love'));
    makeSwipe($('#social .card.big'), ()=>deckLike('social'), ()=>deckSkip('social'));

    // prima render
    ensureDeckRendered('love');
    ensureDeckRendered('social');
  }

  function rebuildDeckSources(){
    state.loveIdx = 0;
    state.socIdx  = 0;
    ensureDeckRendered('love');
    ensureDeckRendered('social');
  }

  function ensureDeckRendered(which){
    const src = state.allProfiles.filter(passesFilters);
    if (!src.length){
      if (which==='love') fillDeckUI('love', null);
      if (which==='social') fillDeckUI('social', null);
      return;
    }
    if (which==='love'){
      const p = src[state.loveIdx % src.length];
      fillDeckUI('love', p);
    } else {
      const p = src[state.socIdx % src.length];
      fillDeckUI('social', p);
    }
  }

  function fillDeckUI(which, p){
    if (which==='love'){
      $('#loveImg').src = p ? p.img : 'sponsor-logo.png';
      $('#loveImg').onerror = fallbackImg;
      $('#loveTitle').textContent = p ? p.name : '—';
      $('#loveMeta').textContent  = p ? `${p.breed} · ${p.km.toFixed(1)} km` : '—';
      $('#loveBio').textContent   = p ? descr(p) : 'Nessun profilo disponibile.';
    } else {
      $('#socImg').src = p ? p.img : 'sponsor-logo.png';
      $('#socImg').onerror = fallbackImg;
      $('#socTitle').textContent = p ? p.name : '—';
      $('#socMeta').textContent  = p ? `${p.breed} · ${p.km.toFixed(1)} km` : '—';
      $('#socBio').textContent   = p ? descr(p) : 'Nessun profilo disponibile.';
    }
  }

  function deckLike(which){
    const src = state.allProfiles.filter(passesFilters);
    if (!src.length) return;
    if (which==='love'){
      const p = src[state.loveIdx % src.length];
      likeProfile(p); state.loveIdx++; ensureDeckRendered('love');
    } else {
      const p = src[state.socIdx % src.length];
      likeProfile(p); state.socIdx++; ensureDeckRendered('social');
    }
  }
  function deckSkip(which){
    const src = state.allProfiles.filter(passesFilters);
    if (!src.length) return;
    if (which==='love'){ state.loveIdx++; ensureDeckRendered('love'); }
    else { state.socIdx++; ensureDeckRendered('social'); }
  }

  function likeProfile(p){
    if (!p) return;
    if (!state.likedIds.has(p.id)){
      state.likedIds.add(p.id);
      state.matches.unshift(p);
      rebuildMatches();
      heartToast(p.img);
    }
  }

  function makeSwipe(el, onRight, onLeft){
    if (!el) return;
    let x0 = null;
    on(el, 'touchstart', e => { x0 = e.touches[0].clientX; }, {passive:true});
    on(el, 'touchend',   e => {
      if (x0==null) return;
      const dx = e.changedTouches[0].clientX - x0;
      x0 = null;
      if (Math.abs(dx) < 40) return;
      dx > 0 ? onRight?.() : onLeft?.();
    }, {passive:true});
  }

  function descr(p){
    return `${p.name} ha ${p.age} anni, ${p.sex==='M'?'maschio':'femmina'}, taglia ${p.size.toLowerCase()}, pelo ${p.coat.toLowerCase()}, energia ${p.energy.toLowerCase()}.`;
  }

  // =============== MATCH LIST ==============
  function rebuildMatches(){
    const host = $('#matchList');
    const empty = $('#emptyMatch');
    if (!host || !empty) return;
    host.innerHTML = '';
    if (!state.matches.length){
      empty.classList.remove('hidden');
      return;
    }
    empty.classList.add('hidden');

    state.matches.forEach(p=>{
      const row = document.createElement('div');
      row.className = 'item';
      row.innerHTML = `
        <img src="${p.img}" alt="${p.name}" onerror="this.src='sponsor-logo.png'">
        <div>
          <div class="name">${p.name}</div>
          <div class="dist small muted">${p.breed} · ${p.km.toFixed(1)} km</div>
        </div>
        <button class="btn pill primary">Chatta</button>
      `;
      on($('.btn', row), 'click', ()=> openChat(p));
      host.appendChild(row);
    });
  }

  // =============== PROFILO FULLSCREEN ======
  function openProfilePage(p){
    const page = $('#profilePage'); const body = $('#ppBody'); const title = $('#ppTitle');
    if (!page || !body || !title) return;
    title.textContent = p.name;
    body.innerHTML = `
      <img class="pp-cover" src="${p.img}" alt="${p.name}" onerror="this.src='sponsor-logo.png'">
      <div class="pp-section">
        <h3>${p.name} • ${p.age}</h3>
        <p class="muted">${p.breed} — ${p.size}, pelo ${p.coat}, energia ${p.energy}, ${p.pedigree==='Sì'?'con pedigree':'senza pedigree'}.</p>
      </div>
      <div class="pp-section">
        <h4>Galleria</h4>
        <div class="pp-gallery">
          <img class="pp-thumb" src="${p.img}" alt="" onerror="this.src='sponsor-logo.png'">
          <img class="pp-thumb" src="cane2.jpg" alt="" onerror="this.src='sponsor-logo.png'">
          <img class="pp-thumb" src="cane3.jpg" alt="" onerror="this.src='sponsor-logo.png'">
        </div>
      </div>
      <div class="pp-actions">
        <button class="btn primary" id="ppLike">Mi piace</button>
        <button class="btn light" id="ppChat">Chatta</button>
      </div>
    `;
    on($('#ppLike', body), 'click', ()=>{ likeProfile(p); });
    on($('#ppChat', body), 'click', ()=> openChat(p));
    page.classList.add('show');
  }
  window.closeProfilePage = function(){ $('#profilePage')?.classList.remove('show'); };

  // =============== CHAT ====================
  function openChat(p){
    $('#chatName').textContent = p.name;
    const av = $('#chatAvatar'); if (av){ av.src = p.img; av.onerror = fallbackImg; }
    const thread = $('#thread'); thread.innerHTML = '';
    openSheet('#chat');
  }
  // invio messaggio
  on($('#sendBtn'), 'click', sendMsg);
  on($('#chatInput'), 'keydown', e => { if(e.key==='Enter'){ e.preventDefault(); sendMsg(); }});
  function sendMsg(){
    const input = $('#chatInput'); const thread = $('#thread');
    const txt = (input?.value||'').trim(); if(!txt) return;
    const bubble = document.createElement('div');
    bubble.className = 'bubble me';
    bubble.textContent = txt;
    thread.appendChild(bubble);
    input.value = '';
    thread.scrollTop = thread.scrollHeight;
  }

  // =============== SPONSOR FOOTER ==========
  function fixSponsorFooter(){
    // Nell’HTML c’è <div class="sponsor-app">…</div>.
    // Qui garantiamo l’ordine richiesto: testo sopra, logo al centro, tagline sotto.
    const host = $('.sponsor-app'); if (!host) return;
    const hasLabel = $('.sponsor-label', host);
    const hasImg   = $('.sponsor-img', host);
    if (!hasLabel){
      const l = document.createElement('div');
      l.className = 'sponsor-label';
      l.textContent = 'Sponsor ufficiale';
      host.insertAdjacentElement('afterbegin', l);
    } else {
      hasLabel.textContent = 'Sponsor ufficiale';
    }
    if (hasImg){ hasImg.alt = 'Fido'; hasImg.onerror = fallbackImg; }
    // aggiungi tagline sotto il logo
    if (!$('.sponsor-tagline', host)){
      const t = document.createElement('div');
      t.className = 'sponsor-label sponsor-tagline';
      t.textContent = '“Fido”, il gelato per i tuoi amici a quattro zampe';
      host.appendChild(t);
    }
  }

  // =============== MATCH TOAST ============
  function heartToast(imgSrc){
    // micro notifica visuale, non invasiva
    let wrap = $('#matchToast');
    if (!wrap){
      wrap = document.createElement('div');
      wrap.id = 'matchToast';
      wrap.className = 'match-toast';
      document.body.appendChild(wrap);
    }
    const b = document.createElement('div');
    b.className = 'match-bubble';
    b.innerHTML = `<img class="match-logo" src="${imgSrc}" onerror="this.src='sponsor-logo.png'"><strong>Match!</strong>`;
    wrap.appendChild(b);
    setTimeout(()=>{ b.remove(); }, 1800);
  }

})();