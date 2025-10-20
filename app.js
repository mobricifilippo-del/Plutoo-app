/* =====================================================
   PLUTOO – VIOLET EDITION JS
   ===================================================== */

const state = {
  entered: false,
  plus: false,                // mock abbonamento
  view: 'nearby',
  friends: [],                // dataset mock
  swipes: 0,
  geo: null,
  selfieUnlocks: {},          // {friendId: timestamp}
};

// -------------------- HOME ↔ APP --------------------
initHome();

function initHome(){
  // Logo pulse più lungo
  const heroLogo = document.getElementById('heroLogo');
  const btnEnter = document.getElementById('btnEnter');

  btnEnter?.addEventListener('click', ()=>{
    heroLogo.classList.remove('violet-glow');
    // forza reflow per riavviare animazione
    void heroLogo.offsetWidth;
    heroLogo.classList.add('violet-glow');

    setTimeout(()=>{
      state.entered = true;
      localStorage.setItem('entered', '1');
      document.getElementById('homeScreen').classList.add('hidden');
      const app = document.getElementById('appScreen');
      app.classList.remove('hidden');
      setActiveView('nearby');
      ensureDataset();
    }, 1600); // più lungo
  });

  document.getElementById('btnAccedi')?.addEventListener('click', e=>{
    e.preventDefault(); alert('Login coming soon.');
  });

  // Sponsor cliccabile
  document.getElementById('sponsorLinkHome')?.addEventListener('click', ()=>{});
  // Canili in HOME: sempre libero
  document.getElementById('ethicsButtonHome')?.addEventListener('click', openSheltersMaps);

  // Lingue mock
  document.getElementById('langIT')?.addEventListener('click', ()=>toast('Lingua: Italiano'));
  document.getElementById('langEN')?.addEventListener('click', ()=>toast('Language: English'));
}

// -------------------- TOPBAR / VIEWS --------------------
const tabs = {
  nearby: document.getElementById('tabNearby'),
  love:   document.getElementById('tabLove'),
  play:   document.getElementById('tabPlay'),
};

tabs.nearby?.addEventListener('click', ()=>setActiveView('nearby'));
tabs.love  ?.addEventListener('click', ()=>setActiveView('love'));
tabs.play  ?.addEventListener('click', ()=>setActiveView('play'));

document.getElementById('btnBack')?.addEventListener('click', goBackSmart);
document.getElementById('btnBackProfile')?.addEventListener('click', ()=>{
  // Torna alla vista precedente, non alla home
  showPage('profilePage', false);
});

function setActiveView(view){
  state.view = view;
  for (const id of ['viewNearby','viewLove','viewPlay']){
    document.getElementById(id).classList.remove('active');
  }
  if (view==='nearby') document.getElementById('viewNearby').classList.add('active');
  if (view==='love')   document.getElementById('viewLove').classList.add('active');
  if (view==='play')   document.getElementById('viewPlay').classList.add('active');

  for (const key in tabs){ tabs[key].classList.remove('active'); }
  (view==='nearby'?tabs.nearby:view==='love'?tabs.love:tabs.play).classList.add('active');

  if (view==='nearby') renderNearby();
  if (view==='love')   renderDeck('loveDeck');
  if (view==='play')   renderDeck('playDeck');
}

// -------------------- LUOGHI PET (Maps) --------------------
document.getElementById('tabLuoghi')?.addEventListener('click', ()=>{
  const wrap = document.getElementById('luoghiTabWrap');
  const expanded = wrap.getAttribute('aria-expanded') === 'true';
  wrap.setAttribute('aria-expanded', expanded ? 'false':'true');
});
document.querySelectorAll('#luoghiMenu .menu-item').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const q = btn.dataset.cat;
    openMapsQuery(q + ' vicino a me');
    document.getElementById('luoghiTabWrap').setAttribute('aria-expanded','false');
  });
});

// Sponsor in app sempre cliccabile
document.getElementById('sponsorLinkApp')?.addEventListener('click', ()=>{});

// -------------------- RICERCA PERSONALIZZATA --------------------
const panelSearch = document.getElementById('panelSearch');
document.getElementById('btnSearch')?.addEventListener('click', ()=>{
  panelSearch.setAttribute('aria-hidden','false');
  document.getElementById('btnSearch').classList.add('active');
});
document.getElementById('btnCloseSearch')?.addEventListener('click', ()=>{
  panelSearch.setAttribute('aria-hidden','true');
  document.getElementById('btnSearch').classList.remove('active');
});
document.getElementById('btnApplyFilters')?.addEventListener('click', ()=>{
  applyFilters();
  panelSearch.setAttribute('aria-hidden','true');
  document.getElementById('btnSearch').classList.remove('active');
});
document.getElementById('btnResetFilters')?.addEventListener('click', ()=>{
  document.getElementById('breed').value='';
  document.getElementById('sex').value='';
  document.getElementById('badge').value='';
  document.getElementById('distance').value=20;
});

// Autocomplete razze (dataset minimo mock)
const breeds = ['Akita','Beagle','Border Collie','Bulldog','Dobermann','Husky','Labrador','Maltese','Pinscher','Poodle','Shiba Inu','Terrier','Volpino'];
const breedInput = document.getElementById('breed');
const suggestions = document.getElementById('suggestions');
breedInput?.addEventListener('input', ()=>{
  const q = breedInput.value.trim().toLowerCase();
  if (!q){ suggestions.classList.remove('show'); suggestions.innerHTML=''; return; }
  const items = breeds.filter(b=>b.toLowerCase().startsWith(q)).slice(0,10);
  suggestions.innerHTML = items.map(b=>`<div class="item" role="option">${b}</div>`).join('');
  suggestions.classList.add('show');
});
suggestions?.addEventListener('click', (e)=>{
  const item = e.target.closest('.item');
  if (!item) return;
  breedInput.value = item.textContent;
  suggestions.classList.remove('show');
});

// -------------------- DATASET / RENDER --------------------
function ensureDataset(){
  if (state.friends.length) return;
  state.friends = [
    {id:1, name:'Luna', sex:'female', breed:'Labrador', km:1.2, img:'dogs/dog1.jpg', bio:'Amante dei parchi', badge:true, age:2},
    {id:2, name:'Rocky', sex:'male',   breed:'Beagle',   km:2.5, img:'dogs/dog2.jpg', bio:'Corre come il vento', badge:false, age:3},
    {id:3, name:'Maya',  sex:'female', breed:'Husky',    km:3.1, img:'dogs/dog3.jpg', bio:'Dolcissima', badge:true, age:1},
    {id:4, name:'Otto',  sex:'male',   breed:'Maltese',  km:0.9, img:'dogs/dog4.jpg', bio:'Coccolone', badge:false, age:4},
  ];
  renderNearby();
}

function renderNearby(list = state.friends){
  const grid = document.getElementById('nearbyGrid');
  grid.innerHTML = list.map(f=>cardHTML(f)).join('');
  grid.querySelectorAll('.card').forEach(card=>{
    card.addEventListener('click', ()=>{
      const id = Number(card.dataset.id);
      openProfile(state.friends.find(x=>x.id===id));
    });
  });
}

function cardHTML(f){
  // SOLO: nome, sesso, razza, distanza
  const sex = f.sex==='male'?'Maschio':'Femmina';
  return `
  <article class="card" data-id="${f.id}" tabindex="0">
    <img class="card-img" src="${f.img}" alt="${f.name}" />
    <div class="card-info">
      <h3>${f.name}</h3>
      <p class="meta">${f.breed} · ${sex} · ${f.km}km</p>
    </div>
    <div class="card-actions">
      <button class="btn no" aria-label="giochiamo">🥲</button>
      <button class="btn yes" aria-label="mi piace">💜</button>
    </div>
  </article>`;
}

// -------------------- DECK (Amore/Giochiamo) --------------------
function renderDeck(id){
  const deck = document.getElementById(id);
  deck.innerHTML = '';
  // Ultima card mostrata deve stare CENTRATA; impilo in z-index
  const stack = [...state.friends].reverse();
  stack.forEach((f,i)=>{
    const div = document.createElement('div');
    div.innerHTML = cardHTML(f);
    const card = div.firstElementChild;
    card.style.zIndex = String(100 - i);
    deck.appendChild(card);
  });
  attachSwipe(deck);
  deck.querySelectorAll('.card').forEach(card=>{
    card.addEventListener('click', (e)=>{
      // se clicchi pulsante non aprire profilo
      if (e.target.closest('.btn')) return;
      const idFriend = Number(card.dataset.id);
      openProfile(state.friends.find(x=>x.id===idFriend));
    });
  });
}

function attachSwipe(deck){
  let startX = 0; let dragging=false; let target=null;
  deck.addEventListener('touchstart', (e)=>{
    target = deck.querySelector('.card:last-of-type'); // card in cima
    startX = e.touches[0].clientX; dragging=true;
  }, {passive:true});
  deck.addEventListener('touchmove', (e)=>{
    if(!dragging || !target) return;
    const dx = e.touches[0].clientX - startX;
    target.style.transform = `translateX(${dx}px) rotate(${dx/18}deg)`;
  }, {passive:true});
  deck.addEventListener('touchend', (e)=>{
    if(!dragging || !target) return;
    const dx = e.changedTouches[0].clientX - startX;
    const threshold = 80;
    if (dx > threshold){ swipeOut(target, 'right'); }
    else if (dx < -threshold){ swipeOut(target, 'left'); }
    else { target.style.transform='translateX(0) rotate(0)'; }
    dragging=false; target=null;
  });
}
function swipeOut(card, dir){
  card.classList.add(dir==='right'?'swipe-out-right':'swipe-out-left');
  setTimeout(()=>{ card.remove(); afterSwipe(); }, 420);
}
function afterSwipe(){
  state.swipes++;
  if (!state.plus){
    if (state.swipes===10 || (state.swipes>10 && state.swipes%5===0)){
      reward('Video pubblicitario','Guarda un video per continuare a scorrere altri profili.');
    }
  }
}

// -------------------- PROFILO --------------------
function openProfile(f){
  if (!f) return;
  document.getElementById('profileName').textContent = f.name;
  document.getElementById('profilePhoto').src = f.img;
  document.getElementById('profileMeta').textContent = `${f.breed} · ${f.sex==='male'?'Maschio':'Femmina'} · ${f.age} anni`;
  document.getElementById('profileBio').textContent = f.bio || '';
  const badges = document.getElementById('profileBadges');
  badges.innerHTML = f.badge? `<span class="badge">✔︎ Verificato</span>` : '';
  // galleria mock
  const gal = document.getElementById('profileGallery');
  gal.innerHTML = [f.img,f.img,f.img].map(src=>`<img src="${src}" alt="${f.name}">`).join('');
  showPage('profilePage', true);
}

// Selfie 24h (mock sblocchi)
document.getElementById('btnSeeSelfie')?.addEventListener('click', ()=>{
  if (state.plus){ toast('Selfie visibile (Plus attivo)'); return; }
  const ok = confirm('Guarda un video per sbloccare il selfie per 24 ore?');
  if (ok){ reward('Selfie', 'Video prima di vedere il selfie'); }
});
document.getElementById('btnUploadSelfie')?.addEventListener('click', ()=>alert('Carica solo foto con il tuo amico (niente persone sole).'));
document.getElementById('btnOpenChat')?.addEventListener('click', ()=>{
  reward('Chat', 'Il primo messaggio è gratuito. Dopo l’invio parte il video.');
});

// Documenti per badge
document.getElementById('btnUploadDogDocs')?.addEventListener('click', ()=>alert('Carica documenti cane (vaccini, microchip, pedigree)…'));
document.getElementById('btnUploadOwnerDocs')?.addEventListener('click', ()=>alert('Carica documenti personali (proprietario)…'));

// -------------------- NAVIGAZIONE --------------------
function showPage(pageId, show){
  const page = document.getElementById(pageId);
  page.classList.toggle('hidden', !show);
  page.setAttribute('aria-hidden', show?'false':'true');
}
function goBackSmart(){
  // Se profilo aperto → chiudilo, altrimenti resta nell’app
  const profile = document.getElementById('profilePage');
  if (!profile.classList.contains('hidden')){ showPage('profilePage', false); return; }
  // Torna a Home solo se l’utente lo vuole
  document.getElementById('appScreen').classList.add('hidden');
  document.getElementById('homeScreen').classList.remove('hidden');
}

// -------------------- FILTRI --------------------
function applyFilters(){
  const breed = document.getElementById('breed').value.trim().toLowerCase();
  const sex   = document.getElementById('sex').value;
  const badge = document.getElementById('badge').value;

  let list = state.friends.filter(f=>{
    if (breed && f.breed.toLowerCase().indexOf(breed)!==0) return false;
    if (sex && f.sex!==sex) return false;
    if (badge==='yes' && !f.badge) return false;
    if (badge==='no'  &&  f.badge) return false;
    return true;
  });
  renderNearby(list);
}

// -------------------- GEO / MAPS --------------------
function openMapsQuery(q){
  // usa la lingua/geo del dispositivo
  const url = `https://www.google.com/maps/search/${encodeURIComponent(q)}`;
  window.open(url, '_blank', 'noopener');
}
function openSheltersMaps(){
  openMapsQuery('canili vicino a me');
}

// -------------------- TOAST / REWARD (mock) --------------------
function toast(msg){
  let box = document.querySelector('.toast');
  if (!box){
    box = document.createElement('div');
    box.className='toast';
    box.innerHTML = `<div class="toast-box" id="toastBox"></div>`;
    document.body.appendChild(box);
  }
  box.querySelector('#toastBox').textContent = msg;
  box.classList.add('show');
  setTimeout(()=>box.classList.remove('show'), 1600);
}
function reward(title, msg){
  const wrap = document.createElement('div');
  wrap.className='reward-box';
  wrap.innerHTML = `
   <div class="reward-inner">
     <div class="rw-title">${title}</div>
     <div class="rw-msg">${msg}</div>
     <button class="btn primary" id="rwOk">Guarda video</button>
   </div>`;
  document.body.appendChild(wrap);
  wrap.querySelector('#rwOk').addEventListener('click', ()=>{
    document.body.removeChild(wrap);
    toast('Video completato ✔︎');
  });
}
