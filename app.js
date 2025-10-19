// app.js - Plutoo Violet Edition
// Gestisce navigazione, topbar tabs, deck swipe, ricerca overlay, geolocalizzazione, sponsor/canili

/* -------------------------
   Helper / DOM
   ------------------------- */
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

// Screens
const homeScreen = $('#homeScreen');
const appScreen = $('#appScreen');
const profilePage = $('#profilePage');

// Topbar + tabs
const tabs = {
  nearby: $('#tabNearby'),
  love: $('#tabLove'),
  play: $('#tabPlay'),
  search: $('#btnSearchTab'),
  luoghiWrap: $('#luoghiTabWrap'),
  luoghiMenu: $('#luoghiMenu'),
  plus: $('#tabPlus')
};

// Buttons
const btnEnter = $('#btnEnter');
const btnBack = $('#btnBack');
const sponsorLinkHome = $('#sponsorLinkHome');
const sponsorLinkApp = $('#sponsorLinkApp');
const ethicsButtonHome = $('#ethicsButtonHome');
const ethicsButtonApp = $('#ethicsButtonApp');

// Views
const viewNearby = $('#viewNearby');
const viewLove = $('#viewLove');
const viewPlay = $('#viewPlay');

// Decks
const loveDeck = $('#loveDeck');
const playDeck = $('#playDeck');

// Search panel
const panelSearch = $('#panelSearch');
const btnCloseSearch = $('#btnCloseSearch');
const breedInput = $('#breed');
const suggestionsBox = $('#suggestions');
const sexSelect = $('#sex');
const badgeCheckbox = null; // eventually map to a control if present

// Other
const adBannerHome = $('#adBannerHome');

// State
let state = {
  currentView: 'home', // home, app, profile
  activeTab: 'nearby',
  swipeCount: 0, // count swipes for reward logic
  lastSwipeTime: 0,
  plus: (localStorage.getItem('plutoo_plus') === 'true'),
  breeds: [
    'Akita','Alano','Barboncino','Beagle','Bichon Frise','Border Collie','Boxer','Bulldog','Chihuahua','Cocker Spaniel',
    'Dachshund','Doberman','Husky','Labrador','Maltese','Pastore Tedesco','Pomerania','Rottweiler','Shiba Inu','Yorkshire'
  ],
  deckLove: [],
  deckPlay: [],
  isSwiping: false
};

/* -------------------------
   Utility: navigation
   ------------------------- */
function showHome() {
  state.currentView = 'home';
  homeScreen.classList.remove('hidden');
  appScreen.classList.add('hidden');
  profilePage.classList.add('hidden');
  window.scrollTo(0,0);
}
function showApp() {
  state.currentView = 'app';
  homeScreen.classList.add('hidden');
  appScreen.classList.remove('hidden');
  profilePage.classList.add('hidden');
  // default to nearby
  activateTab('nearby');
}
function showProfile() {
  state.currentView = 'profile';
  homeScreen.classList.add('hidden');
  appScreen.classList.add('hidden');
  profilePage.classList.remove('hidden');
}

/* -------------------------
   Event wiring: Home -> App
   ------------------------- */
btnEnter.addEventListener('click', ()=> {
  // animate logo with violet pulse
  const logo = $('#heroLogo');
  logo.classList.remove('violet-pulse');
  void logo.offsetWidth;
  logo.classList.add('violet-pulse');

  // navigate to app after a short timeout
  setTimeout(()=> {
    showApp();
  }, 420);
});

// Back button behaviour: go to previous page (profile -> app, app -> home)
btnBack.addEventListener('click', ()=> {
  if (state.currentView === 'profile') {
    showApp();
  } else if (state.currentView === 'app') {
    showHome();
  } else {
    showHome();
  }
});

// Sponsor clickable everywhere
sponsorLinkHome?.addEventListener('click', e => {
  // open in new tab
  window.open(sponsorLinkHome.href, '_blank', 'noopener');
});
sponsorLinkApp?.addEventListener('click', e => {
  window.open(sponsorLinkApp.href, '_blank', 'noopener');
});

/* -------------------------
   Canili -> Google Maps
   - Only in Home & Footer App buttons (ethics)
   ------------------------- */
async function openCaniliNearby() {
  // Try geolocation
  const q = encodeURIComponent('canili vicino a me');
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      const url = `https://www.google.com/maps/search/canili+vicino+a+me/@${lat},${lng},13z`;
      window.open(url, '_blank', 'noopener');
    }, err => {
      // fallback to text query
      window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, '_blank', 'noopener');
    }, {timeout:7000});
  } else {
    window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, '_blank', 'noopener');
  }
}
ethicsButtonHome?.addEventListener('click', e => {
  // reward video before open (mock)
  showRewardVideo('Guarda il video per sbloccare i canili', ()=> openCaniliNearby());
});
ethicsButtonApp?.addEventListener('click', e => {
  // App footer ethics button also opens maps, but we want canili only in home per requests.
  // Here we will behave the same as home by default to be safe; if you truly want it only in home,
  // remove the listener for ethicsButtonApp.
  showRewardVideo('Guarda il video per sbloccare i canili', ()=> openCaniliNearby());
});

/* -------------------------
   LUOGHI PET dropdown
   - when selecting an item => show reward then open maps for that category
   ------------------------- */
$('#luoghiMenu')?.addEventListener('click', (ev) => {
  const item = ev.target.closest('.menu-item');
  if (!item) return;
  const cat = item.dataset.cat;
  if (!cat) return;
  // mapping category -> query text
  const map = {
    vets: 'veterinari vicino a me',
    groomers: 'toelettature vicino a me',
    shops: 'negozi per animali vicino a me',
    parks: 'parchi per cani vicino a me',
    trainers: 'addestratori vicino a me'
  };
  const query = map[cat] || 'animali vicino a me';
  showRewardVideo('Guarda il video per vedere i risultati', ()=> openMapsQuery(query));
});

function openMapsQuery(text) {
  const q = encodeURIComponent(text);
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      const url = `https://www.google.com/maps/search/${q}/@${lat},${lng},13z`;
      window.open(url, '_blank', 'noopener');
    }, err => {
      window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, '_blank', 'noopener');
    }, {timeout:7000});
  } else {
    window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, '_blank', 'noopener');
  }
}

/* Dropdown toggle */
tabs.luoghiWrap?.addEventListener('click', (ev) => {
  const wrap = tabs.luoghiWrap;
  const expanded = wrap.getAttribute('aria-expanded') === 'true';
  wrap.setAttribute('aria-expanded', (!expanded).toString());
});

/* -------------------------
   Search overlay + breeds suggestion (simple)
   ------------------------- */
btnCloseSearch?.addEventListener('click', ()=> {
  panelSearch.setAttribute('aria-hidden','true');
  panelSearch.style.display = 'none';
  $('#btnSearchTab').classList.remove('active');
});
$('#btnSearchTab')?.addEventListener('click', ()=> {
  panelSearch.setAttribute('aria-hidden','false');
  panelSearch.style.display = 'block';
  $('#btnSearchTab').classList.add('active');
  breedInput.focus();
});

/* breed suggestions: filter by first letters typed, alphabetic */
breedInput?.addEventListener('input', (ev) => {
  const q = ev.target.value.trim().toLowerCase();
  suggestionsBox.innerHTML = '';
  if (!q) { suggestionsBox.classList.remove('show'); return; }
  const matches = state.breeds.filter(b => b.toLowerCase().startsWith(q)).sort();
  if (matches.length === 0) { suggestionsBox.classList.remove('show'); return; }
  matches.forEach(m => {
    const div = document.createElement('div');
    div.className = 'item';
    div.tabIndex = 0;
    div.textContent = m;
    div.addEventListener('click', ()=> {
      breedInput.value = m;
      suggestionsBox.classList.remove('show');
    });
    suggestionsBox.appendChild(div);
  });
  suggestionsBox.classList.add('show');
});

/* Apply filters (just console for now) */
$('#btnApplyFilters')?.addEventListener('click', ()=> {
  const filters = {
    breed: breedInput.value.trim(),
    sex: sexSelect.value,
    distance: $('#distance').value,
    plus: state.plus
  };
  // close panel
  panelSearch.setAttribute('aria-hidden','true');
  panelSearch.style.display = 'none';
  $('#btnSearchTab').classList.remove('active');
  // TODO: apply filter to data source (mock)
  console.log('Filters applied', filters);
});

/* -------------------------
   Tabs navigation logic (activateTab)
   ------------------------- */
function activateTab(name) {
  state.activeTab = name;
  // remove active from all tabs
  $$('.tab').forEach(t => t.classList.remove('active'));
  $('#tabNearby').classList.toggle('active', name === 'nearby');
  $('#tabLove').classList.toggle('active', name === 'love');
  $('#tabPlay').classList.toggle('active', name === 'play');
  $('#btnSearchTab').classList.toggle('active', name === 'search');

  // show / hide views
  viewNearby.classList.toggle('active', name === 'nearby');
  viewLove.classList.toggle('active', name === 'love');
  viewPlay.classList.toggle('active', name === 'play');

  // add a small focus animation
  const activeBtn = name === 'nearby' ? $('#tabNearby') : name === 'love' ? $('#tabLove') : name === 'play' ? $('#tabPlay') : $('#btnSearchTab');
  if (activeBtn) {
    activeBtn.animate([{transform:'scale(1)'},{transform:'scale(1.02)'}],{duration:180,fill:'forwards'});
  }
}

// Tab clicks
$('#tabNearby')?.addEventListener('click', ()=> activateTab('nearby'));
$('#tabLove')?.addEventListener('click', ()=> activateTab('love'));
$('#tabPlay')?.addEventListener('click', ()=> activateTab('play'));

/* -------------------------
   Deck logic: render one card at a time (mock data)
   ------------------------- */
function mockCards() {
  // sample mock cards
  const dogs = [
    {id:1,name:'Toby',breed:'Beagle',age:'3 anni',distance:'2 km',img:'dog1.jpg',verified:true,sex:'male'},
    {id:2,name:'Luna',breed:'Labrador',age:'4 anni',distance:'5 km',img:'dog2.jpg',verified:false,sex:'female'},
    {id:3,name:'Rex',breed:'Boxer',age:'2 anni',distance:'1.2 km',img:'dog3.jpg',verified:true,sex:'male'},
    {id:4,name:'Mia',breed:'Shiba Inu',age:'1 anno',distance:'3.4 km',img:'dog4.jpg',verified:false,sex:'female'}
  ];
  state.deckLove = [...dogs];
  state.deckPlay = [...dogs.map(d=>({...d}))];
}

function renderDeck(container, deck) {
  container.innerHTML = '';
  if (!deck || deck.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'muted';
    empty.textContent = 'Nessun amico trovato.';
    container.appendChild(empty);
    return;
  }
  const cardData = deck[0];
  const card = buildCard(cardData);
  container.appendChild(card);
  attachSwipeHandlers(card, deck, container);
}

function buildCard(d) {
  const wrapper = document.createElement('div');
  wrapper.className = 'card';
  wrapper.innerHTML = `
    <img class="card-img" src="${d.img}" alt="${d.name}">
    <div class="card-info">
      <h3>${d.name} ${d.verified ? '✅' : ''}</h3>
      <div class="meta">${d.breed} · ${d.age} · ${d.distance}</div>
    </div>
    <div class="card-actions">
      <button class="btn no" data-action="no">🥲</button>
      <button class="btn yes" data-action="yes">💜</button>
    </div>
  `;
  // click on image opens profile dedicated
  wrapper.querySelector('.card-img').addEventListener('click', ()=> openProfile(d));
  return wrapper;
}

function openProfile(d) {
  // populate profile page
  $('#profilePhoto').src = d.img;
  $('#profileName').textContent = d.name;
  $('#profileMeta').textContent = `${d.breed} · ${d.sex === 'male' ? 'Maschio' : 'Femmina'} · ${d.age}`;
  // badges
  const badges = $('#profileBadges');
  badges.innerHTML = '';
  if (d.verified) {
    const b = document.createElement('span'); b.className='badge'; b.textContent='Verificato';
    badges.appendChild(b);
  }
  showProfile();
}

/* Swipe handler: one card at a time, avoid fast double-swipe */
function attachSwipeHandlers(card, deck, container) {
  const btnNo = card.querySelector('.btn.no');
  const btnYes = card.querySelector('.btn.yes');

  // click taps
  btnNo?.addEventListener('click', ()=> handleSwipe('left', deck, container));
  btnYes?.addEventListener('click', ()=> handleSwipe('right', deck, container));

  // touch drag for swipe
  let startX = 0, currentX = 0, dragging=false;
  const threshold = 80;
  card.addEventListener('touchstart', (e)=> {
    if (state.isSwiping) return;
    startX = e.touches[0].clientX; dragging=true;
    card.style.transition='none';
  }, {passive:true});
  card.addEventListener('touchmove', (e)=> {
    if (!dragging) return;
    currentX = e.touches[0].clientX - startX;
    card.style.transform = `translateX(${currentX}px) rotate(${currentX/25}deg)`;
  }, {passive:true});
  card.addEventListener('touchend', (e)=> {
    if (!dragging) return;
    dragging=false;
    card.style.transition='';
    if (Math.abs(currentX) > threshold) {
      handleSwipe(currentX > 0 ? 'right' : 'left', deck, container);
    } else {
      card.style.transform='translateX(0) rotate(0)';
    }
  });
}

function handleSwipe(direction, deck, container) {
  if (state.isSwiping) return;
  state.isSwiping = true;
  state.swipeCount++;
  // animate out
  const card = container.querySelector('.card');
  if (!card) { state.isSwiping=false; return; }
  card.classList.add(direction === 'right' ? 'swipe-out-right' : 'swipe-out-left');
  // after animation remove and render next
  setTimeout(()=> {
    deck.shift();
    renderDeck(container, deck);
    state.isSwiping=false;
    // reward video logic: after 10 swipes then every 5
    if (state.swipeCount >= 10 && (state.swipeCount === 10 || (state.swipeCount - 10) % 5 === 0)) {
      showRewardVideo('Guarda il video per sbloccare altri swipe', ()=> {
        // on reward granted, optionally add 5 mocked cards (here we just log)
        console.log('Reward granted for swipes');
      });
    }
  }, 460);
}

/* initial mock render */
mockCards();
renderDeck(loveDeck, state.deckLove);
renderDeck(playDeck, state.deckPlay);

/* -------------------------
   Reward video mock
   - this simulates showing a reward video. Real implementation uses AdMob
   ------------------------- */
function showRewardVideo(message, onComplete) {
  // Simple modal prompt: user "watches" video (ok) or cancels
  const watching = confirm(message + "\n\nSimulazione reward video: premi OK per simulare la visualizzazione.");
  if (watching) {
    // simulate delay
    setTimeout(()=> {
      alert('Grazie! Reward completato.');
      onComplete?.();
    }, 700);
  }
}

/* -------------------------
   Chat / first message reward
   ------------------------- */
$('#btnOpenChat')?.addEventListener('click', ()=> {
  // first message requires showing reward video (mock)
  showRewardVideo('Guarda il video per poter inviare il primo messaggio', ()=> {
    alert('Puoi scrivere il primo messaggio (simulato).');
  });
});

/* -------------------------
   Plus toggles (mock)
   ------------------------- */
$('#tabPlus')?.addEventListener('click', ()=> {
  const wants = confirm('Attiva Plutoo Plus (simulazione). Premi OK per attivare mock Plus.');
  if (wants) {
    state.plus = true;
    localStorage.setItem('plutoo_plus','true');
    alert('Plutoo Plus attivato (mock).');
  } else {
    state.plus = false;
    localStorage.removeItem('plutoo_plus');
  }
});

/* -------------------------
   Ensure topbar items visible, add small keyboard-accessible behavior
   ------------------------- */
$$('.tab').forEach(t => {
  t.addEventListener('keydown', (e)=> {
    if (e.key === 'Enter' || e.key === ' ') t.click();
  });
});

/* -------------------------
   App init: ensure home visible
   ------------------------- */
showHome();

/* Expose small helper to console for testing */
window._plutoo = {
  state,
  showHome, showApp, activateTab, openCaniliNearby, openMapsQuery
};
