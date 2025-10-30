/* =====================================================
   Plutoo — app.js (Violet+Gold)
   Allineato a index.html e style.css forniti
   - Home → Entra → App con animazione heartbeat-violet
   - Tabs: Vicino a te / Amore / Giochiamo insieme
   - Ricerca personalizzata (panel) con filtri base + blocco Gold
   - Luoghi PET (dropdown) → Google Maps
   - Profilo (sheet) + Chat (sheet)
   - Sponsor, canili vicino a me, banner placeholder
   - Nessun framework, solo JS vanilla
   ===================================================== */
(function(){
  "use strict";

  /* ---------------- Helpers ---------------- */
  const qs  = (s, r=document) => r.querySelector(s);
  const qsa = (s, r=document) => Array.from(r.querySelectorAll(s));
  const show = el => { if(!el) return; el.classList.remove("hidden"); el.removeAttribute("aria-hidden"); };
  const hide = el => { if(!el) return; el.classList.add("hidden"); el.setAttribute("aria-hidden","true"); };

  /* ---------------- Stato ---------------- */
  const App = {
    state: {
      plus: false,
      lang: "it",
      currentView: "nearby",
      dogs: [],
      loveIndex: 0,
      playIndex: 0,
      filters: { sex:"", dist:5, breed:"", onlyVerified:false },
    }
  };
  window.Plutoo = App; // debug

  /* ---------------- Dataset demo ---------------- */
  const DEMO_DOGS = [
    { id:1, name:"Luna",  breed:"Labrador",         age:3,  sex:"F", km:1,  img:"dog1.jpg", bio:"Dolcissima e giocherellona.", verified:true },
    { id:2, name:"Rocky", breed:"Bulldog",          age:4,  sex:"M", km:2,  img:"dog2.jpg", bio:"Ama i sonnellini e gli snack.", verified:false },
    { id:3, name:"Milo",  breed:"Golden Retriever", age:2,  sex:"M", km:4,  img:"dog3.jpg", bio:"Corre come il vento.", verified:true },
    { id:4, name:"Bella", breed:"Barboncino",       age:1,  sex:"F", km:3,  img:"dog4.jpg", bio:"Intelligente e curiosa.", verified:false },
    { id:5, name:"Zoe",   breed:"Beagle",           age:5,  sex:"F", km:7,  img:"dog5.jpg", bio:"Naso infallibile.", verified:true },
    { id:6, name:"Thor",  breed:"Husky",            age:3,  sex:"M", km:6,  img:"dog6.jpg", bio:"Ama la neve e parlare.", verified:false },
  ];
  const BREEDS = [
    "Labrador","Golden Retriever","Barboncino","Bulldog","Beagle","Chihuahua",
    "Pastore Tedesco","Jack Russell","Cocker Spaniel","Carlino","Maltese",
    "Border Collie","Husky","Bassotto","Dalmata","Pitbull","Shiba Inu",
    "Rottweiler","Terranova","Samoyed"
  ].sort();

  /* ---------------- Boot ---------------- */
  document.addEventListener("DOMContentLoaded", () => {
    App.state.dogs = DEMO_DOGS.slice();

    bindHome();
    bindTabs();
    bindSearchPanel();
    bindPlusModal();
    bindLuoghiPet();
    bindSponsorAndEthics();
    bindChatGlobal();

    renderNearby(App.state.dogs);
    renderLoveCard();
    renderPlayCard();

    // Splash opzionale se presente
    const splash = qs('.splash');
    if (splash){ setTimeout(()=> splash.classList.add('hide'), 450); }
  });

  /* =============== HOME =============== */
  function bindHome(){
    const home   = qs('#homeScreen');
    const app    = qs('#appScreen');
    const logo   = qs('#heroLogo');
    const enter  = qs('#btnEnter');

    if (enter){
      enter.addEventListener('click', ()=>{
        if (logo){
          logo.classList.remove('heartbeat-violet');
          // forza reflow per riavviare animazione
          void logo.offsetWidth;
          logo.classList.add('heartbeat-violet');
        }
        // entra dopo l'animazione (1.5s) con fallback
        setTimeout(()=>{ showApp(); }, 800);
      });
    }

    function showApp(){
      hide(home); show(app);
      // setup default view
      showView('nearby');
      // reset eventuali pannelli/modali
      hide(qs('#searchPanel'));
      hide(qs('#plusModal'));
    }

    // Back dall'app alla Home
    const btnBack = qs('#btnBack');
    if (btnBack){ btnBack.addEventListener('click', ()=>{ show(home); hide(app); }); }
  }

  /* =============== TABS / VIEWS =============== */
  function bindTabs(){
    const map = [
      {btn:'#tabNearby', view:'nearby'},
      {btn:'#tabLove',   view:'love'},
      {btn:'#tabPlay',   view:'play'},
    ];
    map.forEach(({btn,view})=>{
      const b = qs(btn);
      if (!b) return;
      b.addEventListener('click', ()=>{
        showView(view);
      });
    });
  }

  function showView(name){
    App.state.currentView = name;
    // attiva tab
    qsa('.tabs .tab').forEach(t=> t.classList.remove('active'));
    if (name==='nearby') qs('#tabNearby')?.classList.add('active');
    if (name==='love')   qs('#tabLove')?.classList.add('active');
    if (name==='play')   qs('#tabPlay')?.classList.add('active');

    // attiva view
    qsa('.view').forEach(v=> v.classList.remove('active'));
    const id = name==='nearby' ? '#viewNearby' : (name==='love' ? '#viewLove' : '#viewPlay');
    qs(id)?.classList.add('active');
  }

  /* =============== NEARBY GRID =============== */
  function renderNearby(list){
    const grid = qs('#nearGrid');
    if (!grid) return;
    grid.innerHTML = '';
    list.forEach(d => {
      const card = document.createElement('article');
      card.className = 'card';
      card.innerHTML = `
        <img class="card-img" src="${d.img}" alt="${escapeHtml(d.name)}"/>
        <div class="card-info">
          <h3>${escapeHtml(d.name)}</h3>
          <p class="meta">${escapeHtml(d.breed)} · ${d.km} km ${d.verified? '· ✅' : ''}</p>
          <p class="bio">${escapeHtml(d.bio)}</p>
        </div>
      `;
      card.addEventListener('click', ()=> openProfile(d));
      grid.appendChild(card);
    });
  }

  /* =============== LOVE / PLAY (swipe singola card) =============== */
  function currentDogLove(){
    return App.state.dogs[ App.state.loveIndex % App.state.dogs.length ];
  }
  function currentDogPlay(){
    return App.state.dogs[ App.state.playIndex % App.state.dogs.length ];
  }

  function renderLoveCard(){
    const d = currentDogLove(); if (!d) return;
    qs('#loveImg').src = d.img;
    qs('#loveTitleTxt').textContent = `${d.name} · ${d.age}`;
    qs('#loveMeta').textContent = `${d.breed} · ${d.km} km`;
    qs('#loveBio').textContent = d.bio || '';
  }
  function renderPlayCard(){
    const d = currentDogPlay(); if (!d) return;
    qs('#playImg').src = d.img;
    qs('#playTitleTxt').textContent = `${d.name} · ${d.age}`;
    qs('#playMeta').textContent = `${d.breed} · ${d.km} km`;
    qs('#playBio').textContent = d.bio || '';
  }

  // azioni Love
  qs('#loveYes')?.addEventListener('click', ()=>{ swipeOut('#viewLove .card', 'right', ()=>{ App.state.loveIndex++; renderLoveCard(); }); });
  qs('#loveNo') ?.addEventListener('click', ()=>{ swipeOut('#viewLove .card', 'left',  ()=>{ App.state.loveIndex++; renderLoveCard(); }); });
  // azioni Play
  qs('#playYes')?.addEventListener('click', ()=>{ swipeOut('#viewPlay .card', 'right', ()=>{ App.state.playIndex++; renderPlayCard(); }); });
  qs('#playNo') ?.addEventListener('click', ()=>{ swipeOut('#viewPlay .card', 'left',  ()=>{ App.state.playIndex++; renderPlayCard(); }); });

  function swipeOut(sel, dir, done){
    const el = qs(sel); if (!el) return done?.();
    el.classList.remove('swipe-out-left','swipe-out-right');
    // forza reflow
    void el.offsetWidth;
    el.classList.add(dir==='right' ? 'swipe-out-right' : 'swipe-out-left');
    setTimeout(()=>{
      el.classList.remove('swipe-out-left','swipe-out-right');
      done?.();
    }, 560);
  }

  /* =============== PROFILO (SHEET) =============== */
  function openProfile(dog){
    const sheet = qs('#profileSheet');
    const body  = qs('#ppBody');
    if (!sheet || !body) return;

    body.innerHTML = `
      <div class="pp-hero"><img src="${dog.img}" alt="${escapeHtml(dog.name)}"/></div>
      <div class="pp-head">
        <h3 class="pp-name">${escapeHtml(dog.name)}</h3>
        <div class="pp-badges">${dog.verified? '<span class="badge">Verificato ✅</span>' : ''}</div>
      </div>
      <div class="pp-meta">${escapeHtml(dog.breed)} · ${dog.age} anni · ${dog.km} km</div>
      <div class="pp-bio">${escapeHtml(dog.bio||'')}</div>
      <div class="pp-actions">
        <button class="btn outline" id="ppChat">Apri chat</button>
        <button class="btn outline" id="ppGallery">Galleria</button>
      </div>
      <h4 class="section-title">Galleria</h4>
      <div class="gallery">
        <div class="ph">Foto</div>
        <div class="ph">Foto</div>
        <div class="ph">Foto</div>
        <div class="ph">Foto</div>
      </div>
    `;

    // bind azioni
    body.querySelector('#ppChat')?.addEventListener('click', ()=> openChat(dog));
    body.querySelector('#ppGallery')?.addEventListener('click', ()=> openLightbox(dog.img));

    sheet.classList.add('show');
    sheet.classList.remove('hidden');
    sheet.setAttribute('aria-hidden','false');
  }
  window.closeProfilePage = function(){
    const sheet = qs('#profileSheet');
    if (!sheet) return;
    sheet.classList.remove('show');
    setTimeout(()=> sheet.classList.add('hidden'), 280);
    sheet.setAttribute('aria-hidden','true');
  };

  function openLightbox(src){
    const wrap = document.createElement('div');
    wrap.className = 'lightbox';
    wrap.innerHTML = `
      <button class="close" aria-label="Chiudi">✕</button>
      <img src="${src}" alt="Foto"/>
    `;
    document.body.appendChild(wrap);
    wrap.querySelector('.close').addEventListener('click', ()=> wrap.remove());
    wrap.addEventListener('click', (e)=>{ if (e.target===wrap) wrap.remove(); });
  }

  /* =============== CHAT (SHEET) =============== */
  function bindChatGlobal(){
    qs('#closeChat')?.addEventListener('click', closeChat);
    qs('#chatComposer')?.addEventListener('submit', (e)=>{
      e.preventDefault();
      const input = qs('#chatInput');
      const txt = (input.value||'').trim();
      if (!txt) return;
      appendMsg(txt, true);
      input.value='';
      setTimeout(()=> appendMsg('🐾 Bau!', false), 700);
    });
  }
  function openChat(dog){
    const pane = qs('#chatPane');
    if (!pane) return;
    show(pane);
    appendMsg(`Hai aperto la chat con ${dog.name}.`, false);
  }
  function appendMsg(text, me){
    const list = qs('#chatList');
    if (!list) return;
    const div = document.createElement('div');
    div.className = 'msg' + (me? ' me':'');
    div.textContent = text;
    list.appendChild(div);
    list.scrollTop = list.scrollHeight;
  }
  function closeChat(){ hide(qs('#chatPane')); }

  /* =============== RICERCA PERSONALIZZATA =============== */
  function bindSearchPanel(){
    const openBtn  = qs('#btnSearchPanel');
    const panel    = qs('#searchPanel');
    const closeBtn = qs('#closeSearch');
    const form     = qs('#searchForm');

    openBtn?.addEventListener('click', ()=>{ show(panel); });
    closeBtn?.addEventListener('click', ()=>{ hide(panel); });

    // range distanza → etichetta
    const range = qs('#distRange');
    const distLabel = qs('#distLabel');
    if (range && distLabel){
      const upd = ()=> distLabel.textContent = `${range.value} km`;
      range.addEventListener('input', upd); upd();
    }

    // suggerimenti razze
    const breedInput = qs('#breedInput');
    const breedsList = qs('#breedsList');
    breedInput?.addEventListener('input', ()=>{
      const q = (breedInput.value||'').trim().toLowerCase();
      if (!q){ breedsList.style.display='none'; breedsList.innerHTML=''; return; }
      const matches = BREEDS.filter(b=> b.toLowerCase().startsWith(q)).slice(0,8);
      breedsList.innerHTML = matches.map(b=> `<div class="item" role="option">${b}</div>`).join('');
      breedsList.style.display = matches.length ? 'block' : 'none';
    });
    breedsList?.addEventListener('click', (e)=>{
      const it = e.target.closest('.item'); if (!it) return;
      breedInput.value = it.textContent; breedsList.style.display='none';
    });

    // submit filtri
    form?.addEventListener('submit', (e)=>{
      e.preventDefault();
      const sex   = qs('#sexFilter')?.value || '';
      const dist  = parseInt(qs('#distRange')?.value||'5',10);
      const breed = (qs('#breedInput')?.value||'').trim().toLowerCase();
      const onlyV = !!qs('#onlyVerified')?.checked && App.state.plus; // bloccato senza Plus

      App.state.filters = { sex, dist, breed, onlyVerified:onlyV };
      const filtered = filterDogs();
      renderNearby(filtered);
      hide(panel);
      showView('nearby');
    });

    // reset filtri
    qs('#resetFilters')?.addEventListener('click', ()=>{
      App.state.filters = { sex:"", dist:5, breed:"", onlyVerified:false };
      renderNearby(App.state.dogs);
    });

    // disabilita campi Gold se non Plus
    toggleGoldFields();
  }
  function toggleGoldFields(){
    const goldFields = qsa('.f-gold input, .f-gold select');
    goldFields.forEach(el=> el.disabled = !App.state.plus);
  }
  function filterDogs(){
    const {sex, dist, breed, onlyVerified} = App.state.filters;
    return App.state.dogs.filter(d => {
      if (sex && d.sex !== sex) return false;
      if (typeof d.km === 'number' && d.km > dist) return false;
      if (breed && !d.breed.toLowerCase().startsWith(breed)) return false;
      if (onlyVerified && !d.verified) return false;
      return true;
    });
  }

  /* =============== PLUS (MODAL) =============== */
  function bindPlusModal(){
    const btnPlus  = qs('#btnPlus');
    const modal    = qs('#plusModal');
    const closeBtn = qs('#closePlus');
    btnPlus?.addEventListener('click', ()=> show(modal));
    closeBtn?.addEventListener('click', ()=> hide(modal));
  }

  /* =============== LUOGHI PET → MAPS =============== */
  function bindLuoghiPet(){
    const tab   = qs('#tabLuoghi');
    const menu  = qs('#luoghiMenu');
    tab?.addEventListener('click', ()=>{
      const exp = tab.getAttribute('aria-expanded') === 'true';
      tab.setAttribute('aria-expanded', exp? 'false':'true');
      menu.parentElement.classList.toggle('open', !exp);
    });
    qsa('#luoghiMenu .menu-item').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const cat = btn.dataset.cat || '';
        const map = { vets:'veterinari', groomers:'toelettature', shops:'negozi per animali', trainers:'addestratori', kennels:'pensioni per cani', parks:'parchi per cani' };
        const q = map[cat] || 'servizi per animali';
        window.open('https://www.google.com/maps/search/'+ encodeURIComponent(q+' vicino a me'), '_blank', 'noopener');
      });
    });
  }

  /* =============== Sponsor & Etica =============== */
  function bindSponsorAndEthics(){
    qs('#sponsorLink')?.addEventListener('click', (e)=>{ /* link già <a>, nessun override */ });
    qs('#sponsorLinkApp')?.addEventListener('click', (e)=>{ /* link già <a> */ });

    const ethicsHome = qs('#ethicsButton');
    ethicsHome?.addEventListener('click', ()=>{
      window.open('https://www.google.com/maps/search/'+encodeURIComponent('canili vicino a me'), '_blank', 'noopener');
    });
  }

  /* =============== Utils =============== */
  function escapeHtml(s){
    return String(s).replace(/[&<>"']/g, m=> ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[m]));
  }

})();


Ho creato l’app.js completo, già allineato al tuo index.html e al tuo style.css, dentro il canvas qui a fianco.
È un file unico e pronto da incollare: gestisce ENTRA → App, le tab, la griglia “Vicino a te”, profilo, chat, Ricerca personalizzata, Luoghi PET, sponsor e pulsante etico.

Se ti va bene, dimmi “VAI con app.js” e ti guido a:

1. dove incollarlo (percorso e ordine preciso),


2. il test immediato (tap su ENTRA → “Vicino a te”),


3. poi passiamo a swipe e resto, un passo alla volta.


