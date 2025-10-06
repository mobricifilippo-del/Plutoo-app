/* =========================================================
   Plutoo – app.js
   Build mobile-first (Android), robusto e senza sorprese
   - Usa dog1.jpg..dog4.jpg (non cane*.jpg)
   - Tabs: Vicino / Amore / Giocare / Match
   - Ricerca personalizzata con filtri & chips
   - Swipe deck (Amore/Giocare) con emoji 🥲 / ❤️
   - Griglia “Vicino” con card compatte
   - Lista match
   - Sponsor footer coerente (fallback testo se manca)
   - Difensivo: nessun errore blocca l’app
   ========================================================= */

(() => {
  // ---------- helpers ----------
  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

  // ---------- stato ----------
  const state = {
    allProfiles: [],         // dataset completo
    queueLove: [],           // coda per deck "Amore"
    queueSoc:  [],           // coda per deck "Giocare"
    idxLove: 0,
    idxSoc:  0,
    likedIds: new Set(),
    rejectedIds: new Set(),
    matches: [],

    filters: {
      breed: '',
      ageBand: '',
      sex: '',
      size: '',
      coat: '',
      energy: '',
      pedigree: '',
      distance: ''
    },

    breeds: []
  };

  // ============== bootstrap ==============
  document.addEventListener('DOMContentLoaded', init);

  async function init(){
    wireBasicNav();                 // ENTRA, login/registrazione/chiudi sheet
    wireSheetsAndDialogs();         // privacy/termini/chat
    wireFilterPanel();              // form + chips + toggle
    await loadBreeds();             // razze.json o breeds.json → datalist
    prepareLocalProfiles();         // crea profili mock con dog*.jpg
    wireTabs();                     // tab switching
    wireDecks();                    // like/skip swipe
    fixSponsorBlocks();             // testo → logo → claim

    renderNearGrid();               // prima vista
    buildDecks();                   // popola le due code
    renderLoveCard();
    renderSocCard();
    renderMatches();
  }

  // ============== NAV / HOME ==============
  function wireBasicNav(){
    // ENTRA
    const cta = $('#ctaEnter');
    cta && cta.addEventListener('click', (e)=>{
      e.preventDefault();
      goHome();
    });

    // link “Accedi/Registrati” (aprono sheet fittizi)
    const btnLoginTop = $('#btnLoginTop');
    const btnLoginUnder = $('#btnLoginUnder');
    const btnRegisterTop = $('#btnRegisterTop');

    const openSheet = id => { const n = $('#'+id); if(n){ n.classList.add('show'); } };

    btnLoginTop    && btnLoginTop.addEventListener('click', ()=>openSheet('sheetLogin'));
    btnLoginUnder  && btnLoginUnder.addEventListener('click', ()=>openSheet('sheetLogin'));
    btnRegisterTop && btnRegisterTop.addEventListener('click', ()=>openSheet('sheetRegister'));
  }

  // “Entra” dalla landing: mostra #app, nasconde #landing
  window.goHome = function goHome(){
    const l = $('#landing'); const a = $('#app');
    if (l && a) { l.classList.remove('active'); a.classList.add('active'); }
    location.hash = '#app';
  };

  // ============== Sheets / Dialogs ==============
  function wireSheetsAndDialogs(){
    // chiusura generica
    $$('[data-close]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const id = btn.getAttribute('data-close');
        const sheet = $('#'+id);
        if (sheet) sheet.classList.remove('show');
      });
    });

    // Apri privacy/termini
    $('#openPrivacy') && $('#openPrivacy').addEventListener('click', ()=>{
      $('#privacyDlg')?.showModal?.();
    });
    $('#openTerms') && $('#openTerms').addEventListener('click', ()=>{
      $('#termsDlg')?.showModal?.();
    });

    // invio fittizio login/registrazione
    $('#loginSubmit') && $('#loginSubmit').addEventListener('click', ()=>{
      toast('Login fittizio completato');
      $('#sheetLogin')?.classList.remove('show');
    });
    $('#registerSubmit') && $('#registerSubmit').addEventListener('click', ()=>{
      toast('Registrazione fittizia completata');
      $('#sheetRegister')?.classList.remove('show');
    });
  }

  // ============== Filtri / Ricerca personalizzata ==============
  function wireFilterPanel(){
    const panel = $('#filterPanel');
    const toggle = $('#filterToggle');
    const form = $('#filterForm');
    const resetBtn = $('#filtersReset');

    // toggle
    toggle && toggle.addEventListener('click', ()=>{
      const hidden = panel?.hasAttribute('hidden');
      if (!panel) return;
      if (hidden) { panel.removeAttribute('hidden'); toggle.textContent = 'Ricerca personalizzata ▲'; }
      else { panel.setAttribute('hidden', ''); toggle.textContent = 'Ricerca personalizzata ▾'; }
    });

    // submit → applica
    form && form.addEventListener('submit', (e)=>{
      e.preventDefault();
      const fd = new FormData(form);
      for (const k of Object.keys(state.filters)) {
        state.filters[k] = (fd.get(k) || '').toString().trim();
      }
      renderActiveChips();
      renderNearGrid();
      buildDecks();
      renderLoveCard();
      renderSocCard();
      toast('Filtri applicati');
    });

    // reset rapido
    resetBtn && resetBtn.addEventListener('click', ()=>{
      form?.reset();
      for (const k of Object.keys(state.filters)) state.filters[k] = '';
      renderActiveChips();
      renderNearGrid();
      buildDecks();
      renderLoveCard();
      renderSocCard();
      toast('Filtri rimossi');
    });
  }

  function renderActiveChips(){
    const host = $('#activeChips');
    if(!host) return;
    host.innerHTML = '';
    const entries = Object.entries(state.filters).filter(([,v])=>v);
    if (!entries.length){ host.textContent = ''; return; }
    entries.forEach(([k,v])=>{
      const w = document.createElement('div');
      w.className = 'chip-wrap';
      const c = document.createElement('div');
      c.className = 'chip';
      c.textContent = `${labelOf(k)}: ${v}`;
      const x = document.createElement('button');
      x.className = 'chip-x';
      x.textContent = '×';
      x.addEventListener('click', ()=>{
        state.filters[k] = '';
        // aggiorna form se presente
        const el = $(`[name="${k}"]`);
        if (el) el.value = '';
        renderActiveChips();
        renderNearGrid();
        buildDecks();
        renderLoveCard();
        renderSocCard();
      });
      w.appendChild(c); w.appendChild(x);
      host.appendChild(w);
    });

    function labelOf(key){
      return {
        breed: 'Razza',
        ageBand: 'Età',
        sex: 'Sesso',
        size: 'Taglia',
        coat: 'Pelo',
        energy: 'Energia',
        pedigree: 'Pedigree',
        distance: 'Distanza'
      }[key] || key;
    }
  }

  // ============== Caricamento razze (datalist) ==============
  async function loadBreeds(){
    // Prova razze.json, poi breeds.json (per compatibilità con repo)
    const tryFetch = async (url) => {
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) throw new Error('HTTP '+res.status);
      return res.json();
    };
    try{
      let list;
      try { list = await tryFetch('razze.json'); }
      catch { list = await tryFetch('breeds.json'); }
      if (Array.isArray(list)) state.breeds = list.map(String);

      // datalist (index.html usa id="breedList" e input id="breedInput")
      const dl = $('#breedList');
      if (dl){
        dl.innerHTML = '';
        state.breeds.forEach(b=>{
          const opt = document.createElement('option');
          opt.value = b;
          dl.appendChild(opt);
        });
      }

      // binding input
      const input = $('#breedInput');
      input && input.addEventListener('input', ()=>{
        state.filters.breed = input.value.trim();
      });
    }catch(err){
      // se manca, pazienza: l'input rimane libero
      console.warn('Breeds load fallback:', err);
    }
  }

  // ============== Dataset locale ==============
  function prepareLocalProfiles(){
    const imgs = ['dog1.jpg','dog2.jpg','dog3.jpg','dog4.jpg'];
    const names = ['Luna','Fido','Bruno','Maya','Kira','Rocky','Zoe','Leo'];
    let id = 1;
    state.allProfiles = imgs.map((src,i)=>({
      id: id++,
      name: names[i%names.length],
      sex: (i%2===0?'F':'M'),
      age: 1 + (i%8),
      ageBand: bandOf(1 + (i%8)),
      size: ['Piccola','Media','Grande'][i%3],
      coat: ['Corto','Medio','Lungo'][i%3],
      energy: ['Bassa','Media','Alta'][i%3],
      pedigree: (i%2===0?'Sì':'No'),
      breed: ['Barboncino','Bulldog Francese','Shiba Inu','Pastore Tedesco'][i%4],
      distanceKm: 0.8 + i*1.2,
      img: src,
      bio: `${names[i%names.length]} ha ${1 + (i%8)} anni, ${i%2===0?'femmina':'maschio'}, taglia ${['piccola','media','grande'][i%3]}, pelo ${['corto','medio','lungo'][i%3]}, energia ${['bassa','media','alta'][i%3]}.`
    }));

    // precarica
    state.allProfiles.forEach(p=>{ const im=new Image(); im.src=p.img; });

    function bandOf(n){
      if (n<=1) return '0–1';
      if (n<=4) return '2–4';
      if (n<=7) return '5–7';
      return '8+';
    }
  }

  // ============== Filtri applicati a un profilo ==============
  function passFilters(p){
    const f = state.filters;
    if (f.breed   && !p.breed.toLowerCase().includes(f.breed.toLowerCase())) return false;
    if (f.ageBand && p.ageBand !== f.ageBand) return false;
    if (f.sex     && p.sex !== f.sex) return false;
    if (f.size    && p.size !== f.size) return false;
    if (f.coat    && p.coat !== f.coat) return false;
    if (f.energy  && p.energy !== f.energy) return false;
    if (f.pedigree&& p.pedigree !== f.pedigree) return false;
    if (f.distance){
      const lim = parseFloat(f.distance);
      if (!isNaN(lim) && p.distanceKm > lim) return false;
    }
    return true;
  }

  // ============== VICINO A TE (griglia) ==============
  function renderNearGrid(){
    const grid = $('#grid');
    const counter = $('#counter');
    const empty = $('#emptyNear');
    if (!grid || !counter) return;

    const data = state.allProfiles.filter(passFilters);
    grid.innerHTML = '';
    if (!data.length){
      empty?.classList.remove('hidden');
      counter.textContent = '0 profili trovati';
      return;
    }
    empty?.classList.add('hidden');
    counter.textContent = `${data.length} profili trovati`;

    data.forEach(p=>{
      const card = document.createElement('article');
      card.className = 'card';
      card.innerHTML = `
        <div class="online" title="online"></div>
        <img src="${p.img}" alt="${p.name}"
             onerror="this.src='sponsor-logo.png'">
        <div class="card-info">
          <div class="title">
            <div class="name">${p.name}</div>
            <div class="dist">${p.distanceKm.toFixed(1)} km</div>
          </div>
          <div class="intent-pill">${p.breed}</div>
          <div class="actions">
            <button class="circle no" title="No">🥲</button>
            <button class="circle like" title="Mi piace">❤️</button>
          </div>
        </div>
      `;
      // like/no qui aggiornano anche il deck "match"
      const no = card.querySelector('.no');
      const like = card.querySelector('.like');
      no && no.addEventListener('click', ()=> rejectProfile(p));
      like && like.addEventListener('click', ()=> likeProfile(p));
      grid.appendChild(card);
    });
  }

  // ============== TABS ==============
  function wireTabs(){
    const tabs = $$('.tabs .tab');
    tabs.forEach(btn=>{
      btn.addEventListener('click', ()=>{
        tabs.forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');

        const target = btn.getAttribute('data-tab');
        // mostra il pane corrispondente
        $$('.tabpane').forEach(p=>p.classList.remove('active'));
        $('#'+target)?.classList.add('active');

        // quando entro in Amore/Social, aggiorno card corrente
        if (target==='love') renderLoveCard();
        if (target==='social') renderSocCard();
        if (target==='matches') renderMatches();
      });
    });
  }

  // ============== Deck (Amore / Giocare) ==============
  function buildDecks(){
    const base = state.allProfiles.filter(passFilters);
    state.queueLove = shuffle(base.slice());
    state.queueSoc  = shuffle(base.slice());
    state.idxLove = 0;
    state.idxSoc  = 0;
  }

  function wireDecks(){
    // Amore
    $('#loveNo')  && $('#loveNo').addEventListener('click', ()=>{
      const p = state.queueLove[state.idxLove]; if (!p) return;
      rejectProfile(p); animateCard('#loveImg',-1); nextLove();
    });
    $('#loveYes') && $('#loveYes').addEventListener('click', ()=>{
      const p = state.queueLove[state.idxLove]; if (!p) return;
      likeProfile(p);  animateCard('#loveImg',+1,true); nextLove();
    });

    // Social
    $('#socNo')  && $('#socNo').addEventListener('click', ()=>{
      const p = state.queueSoc[state.idxSoc]; if (!p) return;
      rejectProfile(p); animateCard('#socImg',-1); nextSoc();
    });
    $('#socYes') && $('#socYes').addEventListener('click', ()=>{
      const p = state.queueSoc[state.idxSoc]; if (!p) return;
      likeProfile(p);  animateCard('#socImg',+1,true); nextSoc();
    });

    // swipe gesture basilare (touch)
    const attachSwipe = (imgSel, nextFn, likeFn, rejectFn) => {
      const img = $(imgSel);
      if (!img) return;
      let sx=0;
      img.addEventListener('touchstart', e=>{ sx=e.touches[0].clientX; }, {passive:true});
      img.addEventListener('touchend', e=>{
        const dx = e.changedTouches[0].clientX - sx;
        if (Math.abs(dx)<40) return; // tap
        if (dx>0){ likeFn(); animateCard(imgSel,+1,true); }
        else { rejectFn(); animateCard(imgSel,-1); }
        nextFn();
      }, {passive:true});
    };

    attachSwipe('#loveImg', nextLove,
      ()=>{ const p=state.queueLove[state.idxLove]; p && likeProfile(p); },
      ()=>{ const p=state.queueLove[state.idxLove]; p && rejectProfile(p); }
    );
    attachSwipe('#socImg', nextSoc,
      ()=>{ const p=state.queueSoc[state.idxSoc]; p && likeProfile(p); },
      ()=>{ const p=state.queueSoc[state.idxSoc]; p && rejectProfile(p); }
    );
  }

  function renderLoveCard(){
    const p = state.queueLove[state.idxLove];
    renderDeckCard(p, {img:'#loveImg', title:'#loveTitle', meta:'#loveMeta', bio:'#loveBio'});
  }
  function renderSocCard(){
    const p = state.queueSoc[state.idxSoc];
    renderDeckCard(p, {img:'#socImg', title:'#socTitle', meta:'#socMeta', bio:'#socBio'});
  }

  function renderDeckCard(p, map){
    const img = $(map.img), t=$(map.title), m=$(map.meta), b=$(map.bio);
    if (!img||!t||!m||!b) return;

    if (!p){
      img.src = 'sponsor-logo.png';
      t.textContent = '—';
      m.textContent = 'Nessun profilo';
      b.textContent = 'Hai visto tutto! Tocca “Ricerca personalizzata” o torna su “Vicino a te”.';
      return;
    }
    img.src = p.img;
    img.alt = p.name;
    img.onerror = ()=>{ img.src='sponsor-logo.png'; };
    t.textContent = p.name;
    m.textContent = `${p.breed} · ${p.distanceKm.toFixed(1)} km`;
    b.textContent = p.bio || '';
  }

  function nextLove(){
    state.idxLove = clamp(state.idxLove+1, 0, state.queueLove.length);
    renderLoveCard();
  }
  function nextSoc(){
    state.idxSoc = clamp(state.idxSoc+1, 0, state.queueSoc.length);
    renderSocCard();
  }

  function likeProfile(p){
    if (!p) return;
    state.likedIds.add(p.id);
    if (!state.matches.find(m=>m.id===p.id)) state.matches.push(p);
    renderMatches();
    toast('Match aggiunto ❤️');
  }
  function rejectProfile(p){
    if (!p) return;
    state.rejectedIds.add(p.id);
  }

  function renderMatches(){
    const host = $('#matchList');
    const empty = $('#emptyMatch');
    if (!host) return;
    host.innerHTML = '';
    if (!state.matches.length){
      empty?.classList.remove('hidden');
      return;
    }
    empty?.classList.add('hidden');
    state.matches.forEach(p=>{
      const row = document.createElement('div');
      row.className = 'item';
      row.innerHTML = `
        <img src="${p.img}" alt="${p.name}" onerror="this.src='sponsor-logo.png'">
        <div>
          <strong>${p.name}</strong><br>
          <span class="muted">${p.breed} · ${p.distanceKm.toFixed(1)} km</span>
        </div>
        <button class="btn pill primary">Apri chat</button>
      `;
      // chat fittizia
      row.querySelector('.btn')?.addEventListener('click', ()=>{
        const s = $('#chat'); if (s) {
          $('#chatName').textContent = p.name;
          $('#chatAvatar').src = p.img;
          $('#thread').innerHTML = `
            <div class="bubble">Ciao! 🐾</div>
            <div class="bubble me">Ciao ${p.name}! Facciamo una passeggiata?</div>
          `;
          s.classList.add('show');
        }
      });
      host.appendChild(row);
    });
  }

  // ============== Sponsor footer fix (fallback) ==============
  function fixSponsorBlocks(){
    // blocco in home
    const blockHome = $('.sponsor-block');
    if (blockHome){
      const label = $('.sponsor-label', blockHome);
      if (label) label.textContent = 'Sponsor ufficiale — “Fido” il gelato per i tuoi amici a quattro zampe';
    }
    // blocco in-app
    const appFoot = $('.sponsor-app');
    if (appFoot){
      const label = $('.sponsor-label', appFoot);
      if (label) label.textContent = 'Sponsor ufficiale — “Fido” il gelato per i tuoi amici a quattro zampe';
    }
  }

  // ============== Animazioni piccole ==============
  function animateCard(imgSel, dir = +1, heart = false){
    const img = (typeof imgSel==='string') ? $(imgSel) : imgSel;
    if (!img) return;
    img.classList.add('pulse');
    const dx = dir>0 ? 60 : -60;
    img.animate([
      { transform: 'translateX(0)',    opacity: 1 },
      { transform: `translateX(${dx}px) rotate(${dir>0?6:-6}deg)`, opacity: 0 }
    ], { duration: 220, easing: 'ease-in' }).finished.then(()=>{
      img.style.opacity = '';
      img.style.transform = '';
    }).catch(()=>{});
    if (heart){
      const span = document.createElement('span');
      span.className = 'heart-pop';
      span.textContent = '❤️';
      span.style.left = 'calc(50% - 14px)';
      span.style.top = '45%';
      img.parentElement?.appendChild(span);
      setTimeout(()=>span.remove(), 800);
    }
    setTimeout(()=>img.classList.remove('pulse'), 320);
  }

  // ============== util varie ==============
  function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }

  // piccolo toast
  let tmr;
  function toast(msg=''){
    let t = $('#toast');
    if(!t){
      t = document.createElement('div');
      t.id='toast';
      t.style.cssText = `
        position:fixed;left:50%;bottom:16px;transform:translateX(-50%);
        background:rgba(19,22,45,.96);color:#fff;padding:10px 14px;border-radius:12px;
        font-size:14px;z-index:2000;opacity:0;transition:opacity .18s ease`;
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.opacity='1';
    clearTimeout(tmr);
    tmr = setTimeout(()=> t.style.opacity='0', 1600);
  }

})();
```0
