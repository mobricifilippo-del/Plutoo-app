/* ===============================
   PLUTOO – App demo senza backend
   =============================== */

// --- Stato semplice in memoria
const state = {
  tab: 'near',                // near | browse | match
  likes: new Set(),           // id cani piaciuti
  dogs: [
    { id: 'd1', name: 'Luna', age: 1, breed: 'Jack Russell', km: 2.2, img: 'dog3.jpg', online: true },
    { id: 'd2', name: 'Sofia', age: 5, breed: 'Levriero Afgano', km: 1.6, img: 'dog2.jpg', online: true },
    { id: 'd3', name: 'Rocky', age: 4, breed: 'Meticcio', km: 5.9, img: 'dog1.jpg', online: false },
    { id: 'd4', name: 'Maya', age: 3, breed: 'Shiba Inu', km: 3.2, img: 'dog4.jpg', online: true },
  ],
};

// --- Selettori principali
const enterBtn = document.getElementById('enterBtn');
const appMain  = document.getElementById('app');
const grid     = document.getElementById('dogsGrid');
const emptyMatch = document.getElementById('emptyMatch');

// Auth dialog demo
const authDialog = document.getElementById('authDialog');
document.getElementById('btnLogin').addEventListener('click', (e) => {
  e.preventDefault();
  document.getElementById('authTitle').textContent = 'Accedi';
  authDialog.showModal();
});
document.getElementById('btnRegister').addEventListener('click', (e) => {
  e.preventDefault();
  document.getElementById('authTitle').textContent = 'Registrati';
  authDialog.showModal();
});

// Entra: mostra la pagina app
enterBtn.addEventListener('click', () => {
  document.getElementById('home').classList.add('hidden');
  appMain.classList.remove('hidden');
  appMain.setAttribute('aria-hidden', 'false');
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Tabs
document.querySelectorAll('.tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(b => b.classList.remove('tab--active'));
    btn.classList.add('tab--active');
    state.tab = btn.dataset.tab;
    render();
  });
});

// Geolocalizzazione (demo)
document.getElementById('btnEnableGeo').addEventListener('click', () => {
  // Demo: non facciamo nulla, simuliamo successo
  const geo = document.querySelector('.geo');
  geo.style.display = 'none';
});
document.getElementById('btnLater').addEventListener('click', () => {
  const geo = document.querySelector('.geo');
  geo.style.display = 'none';
});

// --- Render grid in base al tab
function render() {
  let list = state.dogs.slice();

  if (state.tab === 'match') {
    list = list.filter(d => state.likes.has(d.id));
  } else if (state.tab === 'near') {
    // potrebbe essere ordinata per distanza
    list.sort((a, b) => a.km - b.km);
  }

  // Contenuto
  grid.innerHTML = list.map(d => dogCardHTML(d)).join('');

  // Mostra/occulta messaggio vuoto nei match
  if (state.tab === 'match' && list.length === 0) {
    emptyMatch.classList.remove('hidden');
  } else {
    emptyMatch.classList.add('hidden');
  }
}

// --- Template HTML card (singola immagine per cane)
function dogCardHTML(d) {
  return `
    <article class="dog-card" data-id="${d.id}">
      <img class="dog-photo" src="${d.img}" alt="${d.name}" />
      <div class="dog-body">
        <div class="dog-row">
          <div>
            <div class="dog-name">${d.name}, ${d.age}</div>
            <div class="dog-meta">${d.breed}</div>
          </div>
          <div style="text-align:right">
            ${d.online ? '<span class="badge-online" title="online"></span>' : ''}
            <div style="color:#6a54ff;font-weight:900">${d.km.toFixed(1)} <span style="color:#7a6cff">km</span></div>
          </div>
        </div>
        <div class="actions">
          <button class="action btn-nope" data-act="nope">✖</button>
          <button class="action btn-like" data-act="like">❤</button>
        </div>
      </div>
    </article>
  `;
}

// --- Like / Nope (delegation)
document.addEventListener('click', (e) => {
  const likeBtn = e.target.closest('[data-act="like"]');
  const nopeBtn = e.target.closest('[data-act="nope"]');
  if (!likeBtn && !nopeBtn) return;

  const card = (likeBtn || nopeBtn).closest('.dog-card');
  const id = card?.dataset.id;
  if (!id) return;

  if (likeBtn) {
    state.likes.add(id);
  }
  if (nopeBtn) {
    state.likes.delete(id);
  }

  // feedback visivo (non invasivo) - MICRO SWIPE
  const cls = likeBtn ? 'swipe-like' : 'swipe-nope';
  card.classList.add(cls);
  setTimeout(() => card.classList.remove(cls), 280);

  // se sono in "near/browse" rendo immediata la rimozione visiva
  if (state.tab !== 'match') {
    card.style.pointerEvents = 'none';
    card.style.opacity = '0';
    setTimeout(() => {
      card.remove();
      // se svuoto tutto e sono in near/browse non faccio altro
    }, 220);
  } else {
    // nei match ricalcolo la lista
    render();
  }
});

// Render iniziale (se l’utente atterra direttamente qui)
if (!document.getElementById('home') || document.getElementById('home').classList.contains('hidden')) {
  render();
}
