// ======== DATA DEMO ========
const DOGS = [
  { id: 1, name: "Luna",   age: 1, breed: "Jack Russell", photo: "dog1.jpg",  lat: 41.9028, lon: 12.4964 }, // Roma
  { id: 2, name: "Sofia",  age: 5, breed: "Levriero Afgano", photo: "dog2.jpg", lat: 45.4642, lon: 9.1900 },  // Milano
  { id: 3, name: "Rocky",  age: 4, breed: "Meticcio", photo: "dog3.jpg", lat: 40.8518, lon: 14.2681 },       // Napoli
  { id: 4, name: "Maya",   age: 3, breed: "Shiba Inu", photo: "dog4.jpg", lat: 44.4949, lon: 11.3426 }       // Bologna
];

let userPos = null;
let liked = [];
let swipeIndex = 0;

// ======== ROUTER SEMPLICE ========
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('is-active'));
  document.getElementById(id).classList.add('is-active');
  window.scrollTo({ top: 0, behavior: 'instant' });
}

function showView(viewId) {
  document.querySelectorAll('#page-explore .view').forEach(v => v.classList.remove('is-active'));
  document.getElementById(viewId).classList.add('is-active');

  document.querySelectorAll('.tabs .tab').forEach(t => t.classList.remove('is-active'));
  const tabBtn = document.querySelector(`.tabs .tab[data-tab="${viewId.replace('view-','')}"]`);
  if (tabBtn) tabBtn.classList.add('is-active');
}

// ======== DISTANZA ========
function haversineKm(a, b) {
  const R = 6371;
  const dLat = (b.lat - a.lat) * Math.PI/180;
  const dLon = (b.lon - a.lon) * Math.PI/180;
  const la1 = a.lat * Math.PI/180;
  const la2 = b.lat * Math.PI/180;
  const x = Math.sin(dLat/2)**2 + Math.sin(dLon/2)**2 * Math.cos(la1) * Math.cos(la2);
  return R * 2 * Math.asin(Math.sqrt(x));
}

function formatKm(km) {
  return `${(Math.round(km*10)/10).toFixed(1)} km`;
}

// ======== RENDER VICINO A TE ========
function renderNearby() {
  const grid = document.getElementById('nearby-grid');
  grid.innerHTML = '';

  DOGS.forEach(d => {
    let km = 3 + Math.random()*4; // fallback
    if (userPos) {
      km = haversineKm(userPos, {lat:d.lat, lon:d.lon});
    }

    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <img class="card-photo" src="${d.photo}" alt="${d.name}" />
      <div class="card-body">
        <div class="card-meta">
          <div>
            <h3 class="card-title">${d.name}, ${d.age}</h3>
            <p class="card-sub">${d.breed}</p>
          </div>
          <div class="km">${formatKm(km)}</div>
        </div>
      </div>
      <div class="card-actions">
        <button class="btn red" data-act="dislike" data-id="${d.id}">✖</button>
        <button class="btn green" data-act="like" data-id="${d.id}">❤</button>
      </div>
    `;
    grid.appendChild(card);
  });

  grid.addEventListener('click', onGridAction);
}

function onGridAction(e) {
  const btn = e.target.closest('button[data-act]');
  if (!btn) return;
  const id = Number(btn.dataset.id);
  if (btn.dataset.act === 'like') {
    if (!liked.includes(id)) liked.push(id);
    renderMatches();
  }
}

// ======== SWIPE ========
function currentSwipeDog() {
  const ids = DOGS.map(d => d.id).filter(id => !liked.includes(id));
  if (ids.length === 0) return null;
  const dogId = ids[swipeIndex % ids.length];
  return DOGS.find(d => d.id === dogId);
}

function renderSwipe() {
  const box = document.getElementById('swipe-card');
  const d = currentSwipeDog();
  if (!d) {
    box.innerHTML = `<div class="empty" style="padding:24px">Hai visto tutti i profili! Vai ai Match ❤</div>`;
    return;
  }
  box.innerHTML = `
    <img class="swipe-photo" src="${d.photo}" alt="${d.name}" />
    <div class="swipe-body">
      <h3 class="swipe-title">${d.name}, ${d.age}</h3>
      <p class="swipe-sub">${d.breed}</p>
    </div>
  `;
}

function handleSwipe(like) {
  const d = currentSwipeDog();
  if (!d) return;
  if (like && !liked.includes(d.id)) liked.push(d.id);
  swipeIndex++;
  renderSwipe();
  renderMatches();
}

// ======== MATCHES ========
function renderMatches() {
  const wrap = document.getElementById('matches-grid');
  const empty = document.getElementById('matches-empty');
  wrap.innerHTML = '';

  const list = DOGS.filter(d => liked.includes(d.id));
  if (list.length === 0) {
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');

  list.forEach(d => {
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <img class="card-photo" src="${d.photo}" alt="${d.name}" />
      <div class="card-body">
        <h3 class="card-title">${d.name}, ${d.age}</h3>
        <p class="card-sub">${d.breed}</p>
      </div>
    `;
    wrap.appendChild(card);
  });
}

// ======== GEO ========
function enableGeolocation() {
  if (!('geolocation' in navigator)) {
    alert('Geolocalizzazione non disponibile, uso distanze demo.');
    return;
  }
  navigator.geolocation.getCurrentPosition(
    pos => {
      userPos = { lat: pos.coords.latitude, lon: pos.coords.longitude };
      renderNearby();
    },
    () => {
      alert('Permesso negato. Useremo distanze demo.');
    },
    { enableHighAccuracy: true, timeout: 8000 }
  );
}

// ======== EVENTI UI ========
document.getElementById('btn-enter').addEventListener('click', () => {
  showPage('page-explore');
  showView('view-nearby');
});

document.querySelectorAll('.tabs .tab').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.tab;
    showView(`view-${target}`);
    if (target === 'nearby') renderNearby();
    if (target === 'swipe') renderSwipe();
    if (target === 'matches') renderMatches();
  });
});

document.getElementById('btn-enable-geo').addEventListener('click', enableGeolocation);
document.getElementById('btn-later').addEventListener('click', () => alert('Ok, potrai attivarla più tardi.'));

document.getElementById('btn-like').addEventListener('click', () => handleSwipe(true));
document.getElementById('btn-dislike').addEventListener('click', () => handleSwipe(false));

// Render iniziale
renderNearby();
