/* Plutoo – app.js (mobile-first, stabile)
   - Immagini locali: dog1.jpg … dog4.jpg
   - Swipe deck: gesto touch + bottoni ❤️ / 🥲
   - Profilo tappabile ovunque
   - Match animation “bacio”
   - Selfie sfocato con sblocco tramite video (placeholder) valido 24h
   - Sponsor footer centrato
*/

(() => {
  // ------------------ Utils ------------------
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  const now = () => Date.now();
  const H24 = 24 * 60 * 60 * 1000;

  // ------------------ Stato ------------------
  const state = {
    tab: 'near',
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
    profiles: [],
    likedIds: new Set(),
    // deck
    deckIdxLove: 0,
    deckIdxSoc : 0
  };

  // ------------------ bootstrap ----------------
  document.addEventListener('DOMContentLoaded', init);

  async function init(){
    wireBasicNav();
    wireSheetsAndDialogs();
    wireFilterPanel();
    await loadBreeds();                  // popola datalist breedList
    prepareLocalProfiles();              // crea profili mock
    renderNearGrid();                    // prima vista
    wireTabs();                          // attiva tab switching
    wireDecks();                         // Amore/Giocare
  }

  // ========== NAV / HOME ==========
  function wireBasicNav(){
    // tasto ENTRA (home -> app)
    const enter = $('#ctaEnter');
    if (enter) enter.addEventListener('click', e=>{
      e.preventDefault(); goHome();
    });

    // privacy/termini (modali)
    $('#openPrivacy')?.addEventListener('click', ()=> $('#privacyDlg')?.showModal());
    $('#openTerms')?.addEventListener('click', ()=> $('#termsDlg')?.showModal());
  }

  // chiamata anche da index inline per fallback hash
  window.goHome = function goHome(){
    $('#landing')?.classList.remove('active');
    $('#app')?.classList.add('active');
  };

  function wireSheetsAndDialogs(){
    // login/register sheets
    const openLogin = ()=>$('#sheetLogin')?.classList.add('show');
    const openReg   = ()=>$('#sheetRegister')?.classList.add('show');
    $('#btnLoginTop')?.addEventListener('click', openLogin);
    $('#btnRegisterTop')?.addEventListener('click', openReg);
    $('#btnLoginUnder')?.addEventListener('click', openLogin);
    $$('.close').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const id = btn.getAttribute('data-close');
        if (id) $('#'+id)?.classList.remove('show');
      });
    });

    // reward dialog
    const rewardBtn = $('#rewardPlay');
    if (rewardBtn){
      rewardBtn.addEventListener('click', async ()=>{
        // finto video 3s
        rewardBtn.disabled = true;
        rewardBtn.textContent = 'Video in riproduzione…';
        await sleep(3000);
        rewardBtn.disabled = false;
        rewardBtn.textContent = 'Guarda video';
        $('#adReward')?.close();
        // il profilo che ha richiesto lo sblocco viene settato in unlockPending
        if (unlockPending) {
          setSelfieUnlocked(unlockPending, true);
          renderProfile(unlockPending);
          unlockPending = null;
        }
      });
    }
  }

  // ========== FILTRI ==========
  function wireFilterPanel(){
    const toggle = $('#filterToggle');
    const panel = $('#filterPanel');
    toggle?.addEventListener('click', ()=>{
      if (!panel) return;
      const hidden = panel.hasAttribute('hidden');
      if (hidden) { panel.removeAttribute('hidden'); toggle.textContent='Ricerca personalizzata ▲'; }
      else { panel.setAttribute('hidden',''); toggle.textContent='Ricerca personalizzata ▾'; }
    });

    $('#filterForm')?.addEventListener('submit', (e)=>{
      e.preventDefault();
      const form = e.currentTarget;
      const data = new FormData(form);
      for (const [k,v] of data.entries()) state.filters[k]=v;
      renderNearGrid();
    });

    $('#filtersReset')?.addEventListener('click', ()=>{
      Object.keys(state.filters).forEach(k=> state.filters[k]='');
      $('#filterForm')?.reset();
      renderNearGrid();
    });

    $('#breedInput')?.addEventListener('input', (e)=>{
      state.filters.breed = e.target.value.trim();
    });
  }

  // ========== TABS ==========
  function wireTabs(){
    $$('.tabs .tab').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const tab = btn.getAttribute('data-tab');
        if (!tab) return;
        state.tab = tab;
        $$('.tabs .tab').forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');

        $$('.tabpane').forEach(p=>p.classList.remove('active'));
        $('#'+tab)?.classList.add('active');

        if (tab==='near') renderNearGrid();
        if (tab==='love') renderLove();
        if (tab==='social') renderSocial();
        if (tab==='matches') renderMatches();
      });
    });
  }

  // ========== BREEDS ==========
  async function loadBreeds(){
    try{
      const r = await fetch('breeds.json', {cache:'no-store'});
      if(!r.ok) throw new Error('HTTP '+r.status);
      const list = await r.json();
      const dl = $('#breedList'); if (!dl) return;
      dl.innerHTML='';
      list.forEach(b=>{
        const o=document.createElement('option'); o.value=b; dl.appendChild(o);
      });
    }catch(e){ /* non bloccare l’app */ }
  }

  // ========== PROFILES (mock) ==========
  function prepareLocalProfiles(){
    const imgs = ['dog1.jpg','dog2.jpg','dog3.jpg','dog4.jpg'];
    const names = ['Luna','Fido','Bruno','Maya','Kira','Rocky','Zoe','Leo'];
    state.profiles = Array.from({length:12}).map((_,i)=>({
      id: i+1,
      name: names[i%names.length],
      age: 1+(i%7),
      sex: i%2? 'F':'M',
      size: ['Piccola','Media','Grande'][i%3],
      coat: ['Corto','Medio','Lungo'][i%3],
      energy: ['Bassa','Media','Alta'][i%3],
      breed: ['Barboncino','Bulldog Francese','Shiba Inu','Pastore Tedesco'][i%4],
      img: imgs[i%imgs.length],
      distanceKm: ((i+1)*1.1).toFixed(1),
      verified: i%3===0,
      selfie: imgs[(i+1)%imgs.length] // demo: usa un’altra immagine come selfie
    }));
    // Precarico immagini
    state.profiles.forEach(p=>{ const im=new Image(); im.src=p.img; });
  }

  // ========== VICINO ==========
  function renderNearGrid(){
    const grid = $('#grid'); if (!grid) return;
    const f = state.filters;

    const fits = p => {
      if (f.breed && !p.breed.toLowerCase().includes(f.breed.toLowerCase())) return false;
      if (f.sex && p.sex!==f.sex) return false;
      if (f.size && p.size!==f.size) return false;
      if (f.coat && p.coat!==f.coat) return false;
      if (f.energy && p.energy!==f.energy) return false;
      if (f.distance && Number(p.distanceKm) > Number(f.distance)) return false;
      return true;
    };

    const list = state.profiles.filter(fits);
    $('#counter').textContent = `${list.length} profili trovati`;

    grid.innerHTML = '';
    list.forEach(p=>{
      const card = document.createElement('article');
      card.className = 'card';
      card.innerHTML = `
        <span class="online"></span>
        <img src="${p.img}" alt="${p.name}">
        <div class="card-info">
          <div class="title">
            <div class="name">${p.name} ${p.verified?'<span class="badge"><i>✅</i> verificato</span>':''}</div>
            <div class="dist">${p.distanceKm} km</div>
          </div>
          <div class="intent-pill">${p.breed}</div>
          <div class="actions">
            <button class="circle no">🥲</button>
            <button class="circle like">❤️</button>
          </div>
        </div>
      `;
      // like/skip
      $('.like',card)?.addEventListener('click', e=>{ e.stopPropagation(); like(p); });
      $('.no',card)?.addEventListener('click', e=>{ e.stopPropagation(); skip(p); });

      // profilo clic
      card.addEventListener('click', ()=> openProfilePage(p));

      grid.appendChild(card);
    });

    $('#emptyNear').classList.toggle('hidden', list.length>0);
  }

  // ========== DECKS (Amore / Social) ==========
  function wireDecks(){
    // swipe gesture su immagini
    bindSwipe($('#loveCard'), (dir)=> dir>0? likeDeck('love') : skipDeck('love'));
    bindSwipe($('#socCard'),  (dir)=> dir>0? likeDeck('social'): skipDeck('social'));

    $('#loveYes')?.addEventListener('click', ()=> likeDeck('love'));
    $('#loveNo') ?.addEventListener('click', ()=> skipDeck('love'));
    $('#socYes') ?.addEventListener('click', ()=> likeDeck('social'));
    $('#socNo')  ?.addEventListener('click', ()=> skipDeck('social'));

    // apri profilo cliccando l’immagine
    $('#loveImg')?.addEventListener('click', ()=> {
      const p = state.profiles[state.deckIdxLove % state.profiles.length];
      openProfilePage(p);
    });
    $('#socImg')?.addEventListener('click', ()=> {
      const p = state.profiles[state.deckIdxSoc % state.profiles.length];
      openProfilePage(p);
    });

    renderLove(); renderSocial();
  }

  function bindSwipe(card, handler){
    if (!card) return;
    let startX=0, endX=0;
    card.addEventListener('touchstart', e=>{ startX=e.touches[0].clientX; }, {passive:true});
    card.addEventListener('touchend', e=>{
      endX=e.changedTouches[0].clientX;
      const delta=endX-startX;
      if (Math.abs(delta)>40) handler(delta);
    });
  }

  function renderLove(){
    const idx = state.deckIdxLove % state.profiles.length;
    renderCardInto(state.profiles[idx], 'love');
  }
  function renderSocial(){
    const idx = state.deckIdxSoc % state.profiles.length;
    renderCardInto(state.profiles[idx], 'soc');
  }

  function renderCardInto(p, prefix){
    $('#'+prefix+'Img').src = p.img;
    $('#'+prefix+'Title').textContent = p.name;
    $('#'+prefix+'Meta').textContent = `${p.breed} · ${p.distanceKm} km`;
    $('#'+prefix+'Bio').textContent = `${p.name} ha ${p.age} anni, ${p.sex==='M'?'maschio':'femmina'}, taglia ${p.size.toLowerCase()}, pelo ${p.coat.toLowerCase()}, energia ${p.energy.toLowerCase()}.`;
  }

  function likeDeck(kind){
    const idx = kind==='love' ? state.deckIdxLove : state.deckIdxSoc;
    const p = state.profiles[idx % state.profiles.length];
    like(p);
    if (kind==='love'){ state.deckIdxLove++; renderLove(); }
    else { state.deckIdxSoc++; renderSocial(); }
  }
  function skipDeck(kind){
    if (kind==='love'){ state.deckIdxLove++; renderLove(); }
    else { state.deckIdxSoc++; renderSocial(); }
  }

  // ========== MATCH ==========
  async function like(p){
    state.likedIds.add(p.id);
    showMatchAnimation(p);
    renderMatches();
  }
  function skip(_p){ /* futuro: segnala meno */ }

  function renderMatches(){
    const host = $('#matchList'); if (!host) return;
    const list = state.profiles.filter(p=> state.likedIds.has(p.id));
    host.innerHTML='';
    list.forEach(p=>{
      const item=document.createElement('div');
      item.className='item';
      item.innerHTML=`
        <img src="${p.img}" alt="${p.name}">
        <div>
          <div><strong>${p.name}</strong> · ${p.breed}</div>
          <div class="small muted">${p.distanceKm} km</div>
        </div>
        <button class="btn pill primary" style="margin-left:auto">Scrivi</button>
      `;
      $('button',item).addEventListener('click', ()=> openChat(p));
      host.appendChild(item);
    });
    $('#emptyMatch').style.display = list.length? 'none':'block';
  }

  function showMatchAnimation(p){
    // overlay con due cani che si avvicinano (semplice)
    const overlay=document.createElement('div');
    overlay.className='match-toast';
    overlay.innerHTML=`
      <div class="match-bubble">
        <img class="match-logo" src="${p.img}" alt="">
        <strong>È un match!</strong>
        <span class="small muted">vi siete piaciuti ❤️</span>
      </div>`;
    document.body.appendChild(overlay);
    setTimeout(()=> overlay.remove(), 1600);
  }

  function openChat(p){
    $('#chatName').textContent = p.name;
    $('#chatAvatar').src = p.img;
    $('#chat').classList.add('show');
  }

  // ========== PROFILO ==========
  let unlockPending = null; // profilo richiesto per sblocco selfie

  function openProfilePage(p){
    $('#ppTitle').textContent = p.name;
    renderProfile(p);
    $('#profilePage').classList.add('show');
  }
  window.closeProfilePage = ()=> $('#profilePage').classList.remove('show');

  function selfieKey(p){ return `selfie-unlock-${p.id}`; }
  function isSelfieUnlocked(p){
    const ts = Number(localStorage.getItem(selfieKey(p))||0);
    return ts && (now()-ts)<H24;
  }
  function setSelfieUnlocked(p, on){
    if (on) localStorage.setItem(selfieKey(p), String(now()));
    else localStorage.removeItem(selfieKey(p));
  }

  function renderProfile(p){
    const body=$('#ppBody'); if (!body) return;
    const unlocked = isSelfieUnlocked(p);
    body.innerHTML = `
      <img class="pp-cover" src="${p.img}" alt="${p.name}">
      <div class="pp-section">
        <h3>${p.name} ${p.verified?'<span class="badge"><i>✅</i> verificato</span>':''}</h3>
        <p class="muted">${p.breed} · ${p.age} anni · ${p.sex==='M'?'maschio':'femmina'} · taglia ${p.size.toLowerCase()}</p>
      </div>

      <div class="pp-section selfie-wrap">
        <h4>🤳🏾 Selfie</h4>
        <img id="selfieImg" class="${unlocked?'':'selfie-blur'}" 
             src="${p.selfie || 'plutoo-icon-512.png'}" alt="Selfie">
        ${unlocked?'':'<button id="unlockBtn" class="unlock-pill">Guarda il video per sbloccare (24h)</button>'}
      </div>

      <div class="pp-section">
        <h4>Galleria</h4>
        <div class="pp-gallery">
          <img class="pp-thumb" src="${p.img}" alt="">
          <img class="pp-thumb" src="${p.selfie || 'plutoo-icon-512.png'}" alt="">
        </div>
      </div>

      <div class="pp-actions">
        <button class="btn light">Messaggio</button>
        <button class="btn primary">Invita al parco</button>
      </div>
    `;

    $('#unlockBtn')?.addEventListener('click', ()=>{
      unlockPending = p;
      $('#adReward')?.showModal();
    });
  }

  // ========== Helpers ==========
  function openProfileOnTap(p){ openProfilePage(p); }

})();
