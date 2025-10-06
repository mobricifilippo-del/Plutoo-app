/* =========================================================
   Plutoo – app.js  (Android-first, single file, NO dipendenze)
   - Usa dog1.jpg…dog4.jpg (non "cane*.jpg")
   - Carica razze da breeds.json → datalist #breedList (index.html)
   - Griglia "Vicino a te" + deck "Amore" e "Giocare/Camminare"
   - Emoji: 🥲 (no)  /  ❤️ (like)
   - Match list
   - Pannello "Ricerca personalizzata" funzionante
   - Sponsor footer: testo formattato come richiesto
   - Codice difensivo: se un nodo non esiste, salta senza rompere
   ========================================================= */

(() => {
  // -------------------------------
  // Helpers
  // -------------------------------
  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  const on = (el, ev, fn, opt) => el && el.addEventListener(ev, fn, opt);

  // -------------------------------
  // Stato
  // -------------------------------
  const state = {
    allProfiles: [],
    filtered: [],
    idxLove: 0,
    idxSoc: 0,
    likedIds: new Set(),
    matches: [],
    breeds: [],
    filters: {
      breed: '',
      ageBand: '',
      sex: '',
      size: '',
      coat: '',
      energy: '',
      pedigree: '',
      distance: ''
    }
  };

  // -------------------------------
  // Bootstrap
  // -------------------------------
  document.addEventListener('DOMContentLoaded', init);

  async function init () {
    fixSponsorBlocks();        // forza la dicitura corretta
    wireBasicNav();            // Entra + link privacy/termini
    wireTabs();                // cambia vista
    wireFilterPanel();         // apertura/chiusura + submit/reset
    wireSheetsAndDialogs();    // login/register/chat/legali

    await loadBreeds();        // popola datalist
    prepareLocalProfiles();    // mock con dog1..4
    applyFilters();            // calcola state.filtered

    renderNearGrid();          // griglia iniziale
    renderLoveDeck();          // card Amore
    renderSocDeck();           // card Social
    renderMatches();           // lista match
  }

  // -------------------------------
  // Dati
  // -------------------------------
  async function loadBreeds () {
    try {
      const res = await fetch('breeds.json', { cache: 'no-store' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const arr = await res.json();
      if (Array.isArray(arr)) state.breeds = arr.map(String);
      // datalist
      const dl = $('#breedList');
      if (dl) {
        dl.innerHTML = '';
        state.breeds.forEach(b => {
          const opt = document.createElement('option');
          opt.value = b;
          dl.appendChild(opt);
        });
      }
    } catch (e) {
      console.warn('breeds.json mancante o invalido (si continua):', e);
    }
  }

  function prepareLocalProfiles () {
    const imgs = ['dog1.jpg','dog2.jpg','dog3.jpg','dog4.jpg'];
    const names = ['Luna','Fido','Bruno','Maya','Kira','Rocky','Zoe','Leo'];
    let id = 1;
    state.allProfiles = Array.from({ length: 12 }).map((_, i) => {
      const name = names[i % names.length];
      return {
        id: id++,
        name,
        age: 1 + (i % 8),
        sex: i % 2 ? 'F' : 'M',
        breed: guessBreed(name),
        size: ['Piccola','Media','Grande'][i % 3],
        coat: ['Corto','Medio','Lungo'][i % 3],
        energy: ['Bassa','Media','Alta'][i % 3],
        pedigree: i % 2 ? 'Sì' : 'No',
        distanceKm: (1 + i * 1.2).toFixed(1),
        img: imgs[i % imgs.length],
        bio: `${name} ha ${1 + (i % 8)} anni, ${i % 2 ? 'femmina' : 'maschio'}, taglia ${['piccola','media','grande'][i%3]}, pelo ${['corto','medio','lungo'][i%3]}, energia ${['bassa','media','alta'][i%3]}.`
      };
    });

    // precarico
    state.allProfiles.forEach(p => { const im = new Image(); im.src = p.img; });

    function guessBreed (n) {
      const list = ['Labrador Retriever','Bulldog Francese','Shiba Inu','Pastore Tedesco',
                    'Barboncino','Beagle','Golden Retriever','Meticcio'];
      return list[n.charCodeAt(0) % list.length];
    }
  }

  // -------------------------------
  // Filtri
  // -------------------------------
  function applyFilters () {
    const f = state.filters;
    state.filtered = state.allProfiles.filter(p => {
      if (f.breed && !p.breed.toLowerCase().includes(f.breed.toLowerCase())) return false;
      if (f.ageBand) {
        const [a,b] = f.ageBand === '8+' ? [8, 100] : f.ageBand.split('–').map(Number);
        if (!(p.age >= a && p.age <= b)) return false;
      }
      if (f.sex && p.sex !== f.sex) return false;
      if (f.size && p.size !== f.size) return false;
      if (f.coat && p.coat !== f.coat) return false;
      if (f.energy && p.energy !== f.energy) return false;
      if (f.pedigree && p.pedigree !== f.pedigree) return false;
      if (f.distance) {
        const max = parseFloat(f.distance);
        if (!isNaN(max) && parseFloat(p.distanceKm) > max) return false;
      }
      return true;
    });
    // reset indici deck
    state.idxLove = 0;
    state.idxSoc  = 0;
    // render chips
    paintActiveChips();
  }

  // -------------------------------
  // NAV / HOME
  // -------------------------------
  function wireBasicNav () {
    const goHome = () => {
      $('#landing')?.classList.remove('active');
      $('#app')?.classList.add('active');
      // scroll a inizio
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    on($('#ctaEnter'), 'click', (e) => { e.preventDefault(); goHome(); });
    // hash
    if (location.hash === '#app') goHome();
    window.addEventListener('hashchange', () => { if (location.hash === '#app') goHome(); });

    // apertura privacy/termini
    on($('#openPrivacy'),'click',()=>$('#privacyDlg')?.showModal());
    on($('#openTerms'),'click',()=>$('#termsDlg')?.showModal());
  }

  // -------------------------------
  // Tabs
  // -------------------------------
  function wireTabs () {
    const tabButtons = $$('.tabs .tab');
    tabButtons.forEach(btn => {
      on(btn, 'click', () => {
        tabButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const tab = btn.getAttribute('data-tab'); // near | love | social | matches
        $$('.tabpane').forEach(p => p.classList.remove('active'));
        $('#' + tab)?.classList.add('active');

        // quando cambio, aggiorno rendering se serve
        if (tab === 'near')   renderNearGrid();
        if (tab === 'love')   renderLoveDeck();
        if (tab === 'social') renderSocDeck();
        if (tab === 'matches') renderMatches();
      });
    });
  }

  // -------------------------------
  // Pannello Ricerca personalizzata
  // -------------------------------
  function wireFilterPanel () {
    const panel = $('#filterPanel');
    const toggle = $('#filterToggle');
    const form   = $('#filterForm');
    const reset  = $('#filtersReset');

    on(toggle, 'click', () => {
      const hidden = panel.hasAttribute('hidden');
      if (hidden) panel.removeAttribute('hidden');
      else panel.setAttribute('hidden','');
      // aggiorna freccetta ▼/▲
      toggle.textContent = hidden ? 'Ricerca personalizzata ▲' : 'Ricerca personalizzata ▾';
    });

    on(form, 'submit', (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      state.filters.breed    = (fd.get('breed')||'').trim();
      state.filters.ageBand  = fd.get('ageBand') || '';
      state.filters.sex      = fd.get('sex') || '';
      state.filters.size     = fd.get('size') || '';
      state.filters.coat     = fd.get('coat') || '';
      state.filters.energy   = fd.get('energy') || '';
      state.filters.pedigree = fd.get('pedigree') || '';
      state.filters.distance = (fd.get('distance')||'').toString();

      applyFilters();
      renderNearGrid();
      renderLoveDeck();
      renderSocDeck();
    });

    on(reset, 'click', () => {
      form?.reset();
      state.filters = { breed:'', ageBand:'', sex:'', size:'', coat:'', energy:'', pedigree:'', distance:'' };
      applyFilters();
      renderNearGrid();
      renderLoveDeck();
      renderSocDeck();
    });
  }

  function paintActiveChips () {
    const host = $('#activeChips');
    if (!host) return;
    host.innerHTML = '';
    const labels = {
      breed: 'Razza', ageBand: 'Età', sex: 'Sesso', size: 'Taglia',
      coat: 'Pelo', energy: 'Energia', pedigree: 'Pedigree', distance: 'Distanza'
    };
    Object.entries(state.filters).forEach(([k,v]) => {
      if (!v) return;
      const chip = document.createElement('div');
      chip.className = 'chip-wrap';
      chip.innerHTML = `<span class="chip">${labels[k]}: ${v}</span><button class="chip-x" aria-label="Rimuovi">×</button>`;
      on($('.chip-x', chip), 'click', () => {
        state.filters[k] = '';
        const form = $('#filterForm');
        if (form && form.elements[k]) form.elements[k].value = '';
        applyFilters();
        renderNearGrid(); renderLoveDeck(); renderSocDeck();
      });
      host.appendChild(chip);
    });
  }

  // -------------------------------
  // VICINO A TE – griglia
  // -------------------------------
  function renderNearGrid () {
    const grid = $('#grid');
    const counter = $('#counter');
    if (!grid || !counter) return;

    const arr = state.filtered.length ? state.filtered : state.allProfiles;
    counter.textContent = `${arr.length} profili trovati`;

    grid.innerHTML = '';
    if (!arr.length) {
      $('#emptyNear')?.classList.remove('hidden');
      return;
    }
    $('#emptyNear')?.classList.add('hidden');

    arr.forEach(p => {
      const card = document.createElement('article');
      card.className = 'card';
      card.innerHTML = `
        <div class="online"></div>
        <img src="${p.img}" alt="${p.name}"
             onerror="this.src='sponsor-logo.png'">
        <div class="card-info">
          <div class="title">
            <div class="name">${p.name}</div>
            <div class="dist">${p.distanceKm} km</div>
          </div>
          <div class="intent-pill">${p.breed}</div>
          <div class="actions">
            <button class="circle no"   title="No">🥲</button>
            <button class="circle like" title="Mi piace">❤️</button>
          </div>
        </div>`;
      on($('.circle.like', card), 'click', () => likeProfile(p));
      on($('.circle.no', card), 'click', () => nopeProfile(p));
      grid.appendChild(card);
    });
  }

  // -------------------------------
  // AMORE – deck
  // -------------------------------
  function renderLoveDeck () {
    const p = (state.filtered.length ? state.filtered : state.allProfiles)[state.idxLove];
    const img = $('#loveImg'), title = $('#loveTitle'), meta = $('#loveMeta'), bio = $('#loveBio');
    const no = $('#loveNo'), yes = $('#loveYes');
    if (!img || !title || !meta || !bio || !no || !yes) return;

    if (!p) {
      img.src = 'sponsor-logo.png'; title.textContent = '—'; meta.textContent = '—'; bio.textContent = 'Nessun profilo';
      return;
    }
    img.src = p.img;
    img.onerror = () => (img.src = 'sponsor-logo.png');
    title.textContent = p.name;
    meta.textContent = `${p.breed} · ${p.distanceKm} km`;
    bio.textContent = p.bio;

    no.onclick = () => { nopeProfile(p); nextLove(); };
    yes.onclick = () => { likeProfile(p); nextLove(); };

    function nextLove () {
      state.idxLove = (state.idxLove + 1) % (state.filtered.length || state.allProfiles.length);
      renderLoveDeck();
    }
  }

  // -------------------------------
  // GIOCARE/CAMMINARE – deck
  // -------------------------------
  function renderSocDeck () {
    const p = (state.filtered.length ? state.filtered : state.allProfiles)[state.idxSoc];
    const img = $('#socImg'), title = $('#socTitle'), meta = $('#socMeta'), bio = $('#socBio');
    const no = $('#socNo'), yes = $('#socYes');
    if (!img || !title || !meta || !bio || !no || !yes) return;

    if (!p) {
      img.src = 'sponsor-logo.png'; title.textContent = '—'; meta.textContent = '—'; bio.textContent = 'Nessun profilo';
      return;
    }
    img.src = p.img;
    img.onerror = () => (img.src = 'sponsor-logo.png');
    title.textContent = p.name;
    meta.textContent = `${p.breed} · ${p.distanceKm} km`;
    bio.textContent = p.bio;

    no.onclick = () => { nopeProfile(p); nextSoc(); };
    yes.onclick = () => { likeProfile(p); nextSoc(); };

    function nextSoc () {
      state.idxSoc = (state.idxSoc + 1) % (state.filtered.length || state.allProfiles.length);
      renderSocDeck();
    }
  }

  // -------------------------------
  // Like / No + Match
  // -------------------------------
  function likeProfile (p) {
    if (!state.likedIds.has(p.id)) {
      state.likedIds.add(p.id);
      state.matches.unshift(p);
      toast(`${p.name} aggiunto ai match ❤️`);
      renderMatches();
    }
  }
  function nopeProfile (p) {
    toast(`Ok, niente con ${p.name} 🥲`);
  }

  function renderMatches () {
    const host = $('#matchList');
    const empty = $('#emptyMatch');
    if (!host || !empty) return;
    host.innerHTML = '';
    if (!state.matches.length) {
      empty.classList.remove('hidden');
      return;
    }
    empty.classList.add('hidden');

    state.matches.forEach(p => {
      const row = document.createElement('div');
      row.className = 'item';
      row.innerHTML = `
        <img src="${p.img}" alt="${p.name}" onerror="this.src='sponsor-logo.png'">
        <div>
          <div class="name">${p.name}</div>
          <div class="dist">${p.breed} · ${p.distanceKm} km</div>
        </div>
        <button class="btn pill light">Chat</button>
      `;
      on($('.btn', row), 'click', () => openChatWith(p));
      host.appendChild(row);
    });
  }

  // -------------------------------
  // Chat fittizia
  // -------------------------------
  function openChatWith (p) {
    const sh = $('#chat');
    if (!sh) return;
    $('#chatName').textContent = p.name;
    const av = $('#chatAvatar');
    if (av) { av.src = p.img; av.onerror = () => (av.src = 'sponsor-logo.png'); }
    const thread = $('#thread'); if (thread) thread.innerHTML = '';
    sh.classList.add('show');
  }

  // -------------------------------
  // Sponsor (forza testo richiesto)
  // -------------------------------
  function fixSponsorBlocks () {
    // HOME
    const blocks = $$('.sponsor-block, .sponsor-app');
    blocks.forEach(b => {
      let label = $('.sponsor-label', b);
      if (!label) {
        label = document.createElement('div');
        label.className = 'sponsor-label';
        b.prepend(label);
      }
      label.textContent = 'Sponsor ufficiale — “Fido” il gelato per i tuoi amici a quattro zampe';
      const img = $('.sponsor-img', b);
      if (img && !img.getAttribute('src')) img.src = 'sponsor-logo.png';
    });
  }

  // -------------------------------
  // Dialog/Sheet base
  // -------------------------------
  function wireSheetsAndDialogs () {
    // Chiudi sheet by [data-close]
    $$('.close[data-close]').forEach(btn => {
      on(btn, 'click', () => {
        const id = btn.getAttribute('data-close');
        const el = document.getElementById(id);
        el && el.classList.remove('show');
      });
    });
    // Mostra login/register (topbar)
    on($('#btnLoginTop'), 'click', () => $('#sheetLogin')?.classList.add('show'));
    on($('#btnRegisterTop'), 'click', () => $('#sheetRegister')?.classList.add('show'));
    on($('#btnLoginUnder'), 'click', () => $('#sheetLogin')?.classList.add('show'));
  }

  // -------------------------------
  // Toast
  // -------------------------------
  let toastT;
  function toast (msg) {
    let t = $('#toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'toast';
      t.style.cssText = `
        position:fixed;left:50%;bottom:16px;transform:translateX(-50%);
        background:rgba(22,27,58,.96);color:#fff;padding:10px 14px;border-radius:12px;
        font-size:14px;z-index:9999;opacity:0;transition:opacity .18s ease;
      `;
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.opacity = '1';
    clearTimeout(toastT);
    toastT = setTimeout(()=>t.style.opacity='0',1600);
  }

})();
