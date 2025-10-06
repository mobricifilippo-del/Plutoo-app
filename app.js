/* Plutoo – app.js
   Versione “stabile mobile” – niente limiti finti, niente pop-up “hai solo 10 like”.
   – Ricerca razze: legge razze.json e fa autocompletamento
   – Swipe deck: mai schermo nero; a fine lista ricicla i profili o mostra messaggio + bottone “Ricarica”
   – Match animation più lunga e visibile (Web Animations API ~1.8s)
   – Footer sponsor: testo forzato (fallback) se manca in HTML
   – Tutto difensivo: se un nodo non esiste, lo saltiamo senza rompere l’app
*/

(() => {
  // -------------------------------
  // Utilities
  // -------------------------------
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  // Log silenzioso (disattivabile)
  const LOG = (...args) => { /* console.log('[Plutoo]', ...args); */ };

  // -------------------------------
  // Stato applicazione
  // -------------------------------
  const state = {
    profiles: [],        // profili caricati (mock locale con foto cane1.jpg…)
    queue: [],           // coda corrente per lo swipe
    currentIndex: 0,     // indice nel deck
    liked: new Set(),    // id piaciuti
    rejected: new Set(), // id skippati
    filters: {
      purpose: 'amore',  // vicino, amore, gioco, match (placeholder)
      breed: null,       // razza selezionata
    },
    breeds: [],          // elenco razze da razze.json
  };

  // -------------------------------
  // Inizializzazione
  // -------------------------------
  document.addEventListener('DOMContentLoaded', init);

  async function init() {
    LOG('Init start');

    // 1) Carica razze per auto-complete
    await loadBreeds();

    // 2) Prepara profili (mock locale: cane1.jpg…)
    prepareLocalProfiles();

    // 3) Costruisce/aggiorna UI (difensivo)
    wireSearch();
    wireTabs();
    wireSwipe();
    wireFooterSponsor();

    // 4) Carica deck iniziale
    buildDeck();

    LOG('Init done');
  }

  // -------------------------------
  // Razze (autocompletamento)
  // -------------------------------
  async function loadBreeds() {
    try {
      const res = await fetch('razze.json', { cache: 'no-store' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const list = await res.json();
      if (Array.isArray(list)) {
        state.breeds = list.map(String);
      }
      // Popola eventuale <datalist id="breed-list"> o <select id="breed-select">
      const dl = $('#breed-list');
      const sel = $('#breed-select');
      if (dl) {
        dl.innerHTML = '';
        state.breeds.forEach(b => {
          const opt = document.createElement('option');
          opt.value = b;
          dl.appendChild(opt);
        });
      }
      if (sel) {
        sel.innerHTML = '';
        const optAll = document.createElement('option');
        optAll.value = '';
        optAll.textContent = 'Tutte';
        sel.appendChild(optAll);
        state.breeds.forEach(b => {
          const opt = document.createElement('option');
          opt.value = b;
          opt.textContent = b;
          sel.appendChild(opt);
        });
      }
    } catch (err) {
      LOG('Errore caricamento razze.json', err);
      // Non blocchiamo l’app se razze.json manca: l’input rimane libero
    }
  }

  function wireSearch() {
    // Input testo con datalist (preferito su mobile)
    const input = $('#breed-input');        // <input id="breed-input" list="breed-list">
    const select = $('#breed-select');      // alternativa <select id="breed-select">
    const applyBtn = $('#btn-apply-breed'); // bottone “Applica” nella Ricerca personalizzata
    const clearBtn = $('#btn-clear-breed');

    if (input) {
      input.addEventListener('input', () => {
        const v = input.value?.trim() || '';
        state.filters.breed = v || null;
      });
    }
    if (select) {
      select.addEventListener('change', () => {
        state.filters.breed = select.value || null;
      });
    }
    if (applyBtn) {
      applyBtn.addEventListener('click', () => {
        // Refiltra il deck
        buildDeck();
        toast('Filtro razza applicato');
      });
    }
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        state.filters.breed = null;
        if (input) input.value = '';
        if (select) select.value = '';
        buildDeck();
        toast('Filtro razza rimosso');
      });
    }
  }

  // -------------------------------
  // Tabs (Vicino / Amore / Giocare / Match)
  // -------------------------------
  function wireTabs() {
    const map = {
      near: ['[data-tab="near"]', 'Vicino a te'],
      love: ['[data-tab="love"]', 'Amore'],
      play: ['[data-tab="play"]', 'Giocare/Camminare'],
      match: ['[data-tab="match"]', 'Match']
    };
    Object.entries(map).forEach(([key, [sel]]) => {
      const btn = $(sel);
      if (btn) {
        btn.addEventListener('click', () => {
          state.filters.purpose = key;
          // evidenziazione semplice
          $$('.tab-active').forEach(n => n.classList.remove('tab-active'));
          btn.classList.add('tab-active');
          buildDeck();
        });
      }
    });
  }

  // -------------------------------
  // Profili locali (mock)
  // -------------------------------
  function prepareLocalProfiles() {
    // Se hai più immagini aggiungile qui (o caricale da JSON remoto in futuro)
    const imgs = ['cane1.jpg', 'cane2.jpg', 'cane3.jpg', 'cane4.jpg'];
    const fallback = 'sponsor-logo.png'; // in caso manchi un file
    const names = ['Luna', 'Fido', 'Bruno', 'Maya', 'Kira', 'Rocky', 'Zoe', 'Leo'];

    let id = 1;
    state.profiles = imgs.map((src, i) => ({
      id: id++,
      name: names[i % names.length],
      age: 2 + (i % 7),
      breed: guessBreedFromName(names[i % names.length]),
      img: src,
      distanceKm: 1 + i, // placeholder
    }));

    // Precarica immagini per evitare flash nero
    state.profiles.forEach(p => {
      const img = new Image();
      img.src = p.img;
    });

    function guessBreedFromName(n) {
      // puro placeholder simpatico
      const list = ['Labrador', 'Jack Russell', 'Shiba Inu', 'Golden Retriever', 'Beagle', 'Bulldog Francese', 'Barboncino', 'Pastore Tedesco', 'Meticcio'];
      return list[n.charCodeAt(0) % list.length];
    }
  }

  // -------------------------------
  // Costruzione Deck + Rendering
  // -------------------------------
  function buildDeck() {
    const deck = $('#deck'); // contenitore delle card
    if (!deck) return;

    // Filtri
    const byBreed = (p) => {
      if (!state.filters.breed) return true;
      const bsel = (state.filters.breed || '').toLowerCase();
      return (p.breed || '').toLowerCase().includes(bsel);
    };

    // (Per ora) il filtro purpose non incide nei mock, ma lo lasciamo per future sorgenti dati
    const filtered = state.profiles.filter(byBreed);

    // Mescola per varietà
    const shuffled = filtered.sort(() => Math.random() - 0.5);

    state.queue = shuffled;
    state.currentIndex = 0;

    renderCurrentCard();
  }

  function renderCurrentCard() {
    const deck = $('#deck');
    if (!deck) return;

    deck.innerHTML = ''; // pulisci

    const p = state.queue[state.currentIndex];

    if (!p) {
      deck.appendChild(emptyDeckNode());
      return;
    }

    const card = document.createElement('div');
    card.className = 'card';

    card.innerHTML = `
      <div class="card-img-wrap">
        <img src="${p.img}" alt="${p.name}" onerror="this.src='sponsor-logo.png'; this.closest('.card-img-wrap')?.classList.add('img-fallback');">
      </div>
      <div class="card-body">
        <div class="card-title">${p.name} • ${p.age}</div>
        <div class="card-sub">${p.breed} · ~${p.distanceKm} km</div>
        <div class="card-actions">
          <button id="btn-skip" class="btn btn-outline" aria-label="Salta">Salta</button>
          <button id="btn-like" class="btn btn-primary" aria-label="Mi piace">Mi piace</button>
        </div>
      </div>
    `;

    deck.appendChild(card);

    // Binder
    const like = $('#btn-like', card);
    const skip = $('#btn-skip', card);
    like && like.addEventListener('click', () => onLike(p, card));
    skip && skip.addEventListener('click', () => onSkip(p, card));
  }

  function emptyDeckNode() {
    const wrap = document.createElement('div');
    wrap.className = 'empty-deck';

    wrap.innerHTML = `
      <p>Hai visto tutti i profili disponibili.</p>
      <div class="empty-actions">
        <button id="btn-reload" class="btn btn-primary">Ricarica</button>
        <button id="btn-clear-filters" class="btn btn-outline">Rimuovi filtri</button>
      </div>
    `;

    $('#btn-reload', wrap)?.addEventListener('click', () => {
      // Ricrea una nuova coda casuale dalle stesse fonti
      buildDeck();
    });

    $('#btn-clear-filters', wrap)?.addEventListener('click', () => {
      state.filters.breed = null;
      const input = $('#breed-input'); if (input) input.value = '';
      const select = $('#breed-select'); if (select) select.value = '';
      buildDeck();
    });

    return wrap;
  }

  // -------------------------------
  // Swipe / Like / Skip
  // -------------------------------
  function wireSwipe() {
    const deck = $('#deck');
    if (!deck) return;

    // Supporto gesture basilare (drag orizzontale)
    let startX = 0;
    deck.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
    }, { passive: true });

    deck.addEventListener('touchend', (e) => {
      const endX = e.changedTouches[0].clientX;
      const delta = endX - startX;
      if (Math.abs(delta) < 40) return; // ignora tap
      const p = state.queue[state.currentIndex];
      const card = $('.card', deck);
      if (!p || !card) return;
      if (delta > 0) onLike(p, card);   // swipe a destra -> like
      else onSkip(p, card);             // swipe a sinistra -> skip
    });
  }

  async function onLike(profile, cardEl) {
    state.liked.add(profile.id);
    await animateMatch(cardEl); // animazione “match” più lunga
    nextCard();
  }

  function onSkip(profile, cardEl) {
    state.rejected.add(profile.id);
    animateDismiss(cardEl).then(nextCard);
  }

  function nextCard() {
    state.currentIndex += 1;
    if (state.currentIndex >= state.queue.length) {
      // Niente schermo nero: o ricicliamo subito, o mostriamo il messaggio
      renderCurrentCard(); // mostriamo l'empty-deck con bottone “Ricarica”
      return;
    }
    renderCurrentCard();
  }

  // -------------------------------
  // Animazioni
  // -------------------------------
  async function animateMatch(cardEl) {
    // Evidente e fluida (~1800ms)
    if (!cardEl || !cardEl.animate) return;
    const keyframes = [
      { transform: 'scale(1)', opacity: 1, filter: 'drop-shadow(0 0 0 rgba(0,0,0,0))' },
      { transform: 'scale(1.04)', filter: 'drop-shadow(0 8px 22px rgba(0,0,0,.35))', offset: 0.25 },
      { transform: 'scale(1)',   filter: 'drop-shadow(0 6px 18px rgba(0,0,0,.25))', offset: 0.55 },
      { transform: 'translateX(120%) rotate(6deg)', opacity: 0 }
    ];
    const opts = { duration: 1800, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'forwards' };
    cardEl.animate(keyframes, opts);
    await sleep(opts.duration * 0.95);
  }

  function animateDismiss(cardEl) {
    if (!cardEl || !cardEl.animate) return Promise.resolve();
    const anim = cardEl.animate(
      [
        { transform: 'translateX(0)', opacity: 1 },
        { transform: 'translateX(-110%) rotate(-4deg)', opacity: 0 }
      ],
      { duration: 500, easing: 'ease-in', fill: 'forwards' }
    );
    return anim.finished.catch(() => {});
  }

  // -------------------------------
  // Sponsor footer (fallback testo)
  // -------------------------------
  function wireFooterSponsor() {
    // Se l’HTML non lo gestisce già, forziamo noi il testo richiesto.
    // Struttura attesa:
    // <div id="sponsor-footer"><div class="sponsor-title">Sponsor ufficiale</div><img ...><div class="sponsor-sub">Fido, il gelato…</div></div>
    const host = $('#sponsor-footer');
    if (!host) return;

    const title = $('.sponsor-title', host) || document.createElement('div');
    title.className = 'sponsor-title';
    title.textContent = 'Sponsor ufficiale';

    const logo = $('img', host) || document.createElement('img');
    if (!logo.src) logo.src = 'sponsor-logo.png';
    logo.alt = 'Fido — sponsor';

    const sub = $('.sponsor-sub', host) || document.createElement('div');
    sub.className = 'sponsor-sub';
    sub.textContent = '“Fido”, il gelato per i tuoi amici a quattro zampe';

    host.innerHTML = '';
    host.appendChild(title);
    host.appendChild(logo);
    host.appendChild(sub);
  }

  // -------------------------------
  // Piccolo toast testuale (non intrusivo)
  // -------------------------------
  let toastTimer;
  function toast(msg = '') {
    let t = $('#toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'toast';
      t.style.cssText = `
        position: fixed; left: 50%; bottom: 16px; transform: translateX(-50%);
        background: rgba(32,32,40,.95); color: #fff; padding: 10px 14px; border-radius: 10px;
        font-size: 14px; z-index: 9999; opacity: 0; transition: opacity .18s ease;
      `;
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.opacity = '1';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => (t.style.opacity = '0'), 1600);
  }

})();
