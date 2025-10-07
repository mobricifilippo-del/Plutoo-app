/* Plutoo – app.js (mobile-first)
   - Swipe deck: gesto touch + bottoni ❤️ / 🥲 (immutati)
   - Viewer foto: SOLO dentro il profilo; pollice blu centrato per Like
   - Match animation (bacio) + video al consenso
   - Selfie blur con sblocco tramite video (24h) o match
   - Ads (demo web): ogni 10 swipe poi cooldown 5; primo messaggio; post-accetto match
   - Email verification (soft): ora robusta (se il banner manca, non blocca nulla)
   - Fallback immagini ovunque
   - Fallback locale razze se breeds.json non carica
*/

(() => {
  // ------------------ Utils ------------------
  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  const now = () => Date.now();
  const H24 = 24 * 60 * 60 * 1000;

  // ------------------ Fallback razze ------------------
  const FALLBACK_BREEDS = [
"Affenpinscher","Afghan Hound","Airedale Terrier","Akita","Alaskan Klee Kai","Alaskan Malamute","American Bulldog","American English Coonhound","American Eskimo Dog","American Foxhound","American Hairless Terrier","American Leopard Hound","American Staffordshire Terrier","American Water Spaniel","Anatolian Shepherd Dog","Appenzeller Sennenhund","Australian Cattle Dog","Australian Kelpie","Australian Shepherd","Australian Stumpy Tail Cattle Dog","Australian Terrier","Azawakh","Barbado da Terceira","Barbet","Basenji","Basset Fauve de Bretagne","Basset Hound","Bavarian Mountain Scent Hound","Beagle","Bearded Collie","Beauceron","Bedlington Terrier","Belgian Laekenois","Belgian Malinois","Belgian Sheepdog","Belgian Tervuren","Bergamasco Sheepdog","Berger Picard","Bernese Mountain Dog","Bichon Frise","Biewer Terrier","Black and Tan Coonhound","Black Russian Terrier","Bloodhound","Blue Picardy Spaniel","Bluetick Coonhound","Boerboel","Bohemian Shepherd","Bolognese","Border Collie","Border Terrier","Borzoi","Boston Terrier","Bouvier des Ardennes","Bouvier des Flandres","Boxer","Boykin Spaniel","Bracco Italiano","Braque du Bourbonnais","Braque Francais Pyrenean","Braque Saint-Germain","Brazilian Terrier","Briard","Brittany","Broholmer","Brussels Griffon","Bull Terrier","Bulldog","Bullmastiff","Cairn Terrier","Calupoh","Canaan Dog","Canadian Eskimo Dog","Cane Corso","Cardigan Welsh Corgi","Carolina Dog","Catahoula Leopard Dog","Caucasian Shepherd Dog","Cavalier King Charles Spaniel","Central Asian Shepherd Dog","Cesky Terrier","Chesapeake Bay Retriever","Chihuahua","Chinese Crested","Chinese Shar-Pei","Chinook","Chow Chow","Cirneco dell’Etna","Clumber Spaniel","Cocker Spaniel","Collie","Coton de Tulear","Croatian Sheepdog","Curly-Coated Retriever","Czechoslovakian Vlciak","Dachshund","Dalmatian","Dandie Dinmont Terrier","Danish-Swedish Farmdog","Deutscher Wachtelhund","Doberman Pinscher","Dogo Argentino","Dogue de Bordeaux","Drentsche Patrijshond","Drever","Dutch Shepherd","English Cocker Spaniel","English Foxhound","English Setter","English Springer Spaniel","English Toy Spaniel","Entlebucher Mountain Dog","Estrela Mountain Dog","Eurasier","Field Spaniel","Finnish Lapphund","Finnish Spitz","Flat-Coated Retriever","French Bulldog","French Spaniel","German Longhaired Pointer","German Pinscher","German Shepherd Dog","German Shorthaired Pointer","German Spitz","German Wirehaired Pointer","Giant Schnauzer","Glen of Imaal Terrier","Golden Retriever","Gordon Setter","Grand Basset Griffon Vendéen","Great Dane","Great Pyrenees","Greater Swiss Mountain Dog","Greyhound","Hamiltonstovare","Hanoverian Scenthound","Harrier","Havanese","Hokkaido","Hovawart","Ibizan Hound","Icelandic Sheepdog","Irish Red and White Setter","Irish Setter","Irish Terrier","Irish Water Spaniel","Irish Wolfhound","Italian Greyhound","Jagdterrier","Japanese Akitainu","Japanese Chin","Japanese Spitz","Japanese Terrier","Kai Ken","Karelian Bear Dog","Keeshond","Kerry Blue Terrier","Kishu Ken","Komondor","Korean Jindo Dog","Kromfohrlander","Kuvasz","Labrador Retriever","Lagotto Romagnolo","Lakeland Terrier","Lancashire Heeler","Lapponian Herder","Large Munsterlander","Leonberger","Lhasa Apso","Löwchen","Maltese","Manchester Terrier (Standard)","Manchester Terrier (Toy)","Mastiff","Miniature American Shepherd","Miniature Bull Terrier","Miniature Pinscher","Miniature Schnauzer","Mountain Cur","Mudi","Neapolitan Mastiff","Nederlandse Kooikerhondje","Newfoundland","Norfolk Terrier","Norrbottenspets","Norwegian Buhund","Norwegian Elkhound","Norwegian Lundehund","Norwich Terrier","Nova Scotia Duck Tolling Retriever","Old English Sheepdog","Otterhound","Papillon","Parson Russell Terrier","Pekingese","Pembroke Welsh Corgi","Peruvian Inca Orchid","Petit Basset Griffon Vendéen","Pharaoh Hound","Plott Hound","Pointer","Polish Lowland Sheepdog","Pomeranian","Pont-Audemer Spaniel","Poodle (Miniature)","Poodle (Standard)","Poodle (Toy)","Porcelaine","Portuguese Podengo","Portuguese Podengo Pequeno","Portuguese Pointer","Portuguese Sheepdog","Portuguese Water Dog","Presa Canario","Pudelpointer","Pug","Puli","Pumi","Pyrenean Mastiff","Pyrenean Shepherd","Rafeiro do Alentejo","Rat Terrier","Redbone Coonhound","Rhodesian Ridgeback","Romanian Carpathian Shepherd","Romanian Mioritic Shepherd Dog","Rottweiler","Russell Terrier","Russian Toy","Russian Tsvetnaya Bolonka","Saint Bernard","Saluki","Samoyed","Schapendoes","Schipperke","Scottish Deerhound","Scottish Terrier","Sealyham Terrier","Segugio Italiano","Shetland Sheepdog","Shiba Inu","Shih Tzu","Shikoku","Siberian Husky","Silky Terrier","Skye Terrier","Sloughi","Slovakian Wirehaired Pointer","Slovensky Cuvac","Slovensky Kopov","Small Munsterlander","Smooth Fox Terrier","Soft Coated Wheaten Terrier","Spanish Mastiff","Spanish Water Dog","Spinone Italiano","Stabyhoun","Staffordshire Bull Terrier","Standard Schnauzer","Sussex Spaniel","Swedish Lapphund","Swedish Vallhund","Taiwan Dog","Teddy Roosevelt Terrier","Thai Bangkaew","Thai Ridgeback","Tibetan Mastiff","Tibetan Spaniel","Tibetan Terrier","Tornjak","Tosa","Toy Fox Terrier","Transylvanian Hound","Treeing Tennessee Brindle","Treeing Walker Coonhound","Vizsla","Volpino Italiano","Weimaraner","Welsh Springer Spaniel","Welsh Terrier","West Highland White Terrier","Wetterhoun","Whippet","Wire Fox Terrier","Wirehaired Pointing Griffon","Wirehaired Vizsla","Working Kelpie","Xoloitzcuintli","Yakutian Laika","Yorkshire Terrier"
];

  // ------------------ Flags / Storage ------------------
  const LS = {
    emailVerified: 'pl_email_verified',
    selfieUnlockPrefix: 'pl_selfie_unlock_', // + id
  };
  const isEmailVerified = () => localStorage.getItem(LS.emailVerified) === '1';
  const setEmailVerified = (v) => localStorage.setItem(LS.emailVerified, v ? '1' : '0');

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
    matchedIds: new Set(),
    // deck
    deckIdxLove: 0,
    deckIdxSoc : 0,
    // ads
    swipeCount: 0,
    lastAdSwipe: 0,
    firstMessageSentTo: new Set(),
    // viewer
    viewerProfile: null,
  };

  // ------------------ bootstrap ----------------
  document.addEventListener('DOMContentLoaded', init);

  async function init(){
    // default email verified flag (soft)
    if (localStorage.getItem(LS.emailVerified) == null) setEmailVerified(false);

    wireBasicNav();
    wireSheetsAndDialogs();
    wireFilterPanel();
    wireEmailBanner();            // ora safe: non blocca se banner assente

    await loadBreeds();           // popola datalist breedList (con fallback)
    prepareLocalProfiles();       // crea profili mock + preload
    renderNearGrid();             // prima vista
    wireTabs();                   // attiva tab switching
    wireDecks();                  // Amore/Giocare
    wireGeoBar();                 // geolocalizzazione mock

    wirePhotoViewer();            // viewer (aperto SOLO dal profilo)
    wireMatchOverlay();           // overlay match
    wireChat();                   // invio messaggi (video al primo)
  }

  // ========== NAV / HOME ==========
  function wireBasicNav(){
    const enter = $('#ctaEnter');
    if (enter) enter.addEventListener('click', e=>{
      e.preventDefault(); goHome();
    });

    $('#openPrivacy')?.addEventListener('click', ()=> $('#privacyDlg')?.showModal());
    $('#openTerms')?.addEventListener('click', ()=> $('#termsDlg')?.showModal());
  }
  window.goHome = function goHome(){
    $('#landing')?.classList.remove('active');
    $('#app')?.classList.add('active');
  };

  // ========== EMAIL BANNER (soft, safe) ==========
  function wireEmailBanner(){
    const banner = $('#emailBanner');
    const btn = $('#resendEmailBtn');
    if (!banner) return; // SE NON ESISTE NELL'HTML, NON BLOCCA L'APP
    const render = ()=> banner.classList.toggle('hidden', isEmailVerified());
    render();
    btn?.addEventListener('click', async ()=>{
      btn.disabled = true; btn.textContent = 'Invio…';
      await sleep(1200);
      alert('Email di verifica inviata! Apri il link per confermare.');
      await sleep(1200);
      setEmailVerified(true);
      render();
      btn.disabled = false; btn.textContent = 'Reinvia';
    });
  }

  // ========== SHEETS / DIALOGS ==========
  function wireSheetsAndDialogs(){
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

    // reward dialog (video demo)
    $('#rewardPlay')?.addEventListener('click', async ()=>{
      const btn = $('#rewardPlay');
      btn.disabled = true; btn.textContent = 'Video in riproduzione…';
      await sleep(3000);
      btn.disabled = false; btn.textContent = 'Guarda video';
      $('#adReward')?.close();
      // post-video hook (eseguito da chi l'ha richiesto)
      if (pendingRewardHook) { const f = pendingRewardHook; pendingRewardHook = null; f(); }
    });
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

    // aggiorna filtro razza mentre si digita
    const breedInp = $('#breedInput');
    breedInp?.addEventListener('input', (e)=>{
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

  // ========== BREEDS (con fallback) ==========
  async function loadBreeds(){
    const dl = $('#breedList');
    if (!dl) return;

    // funzione di render unica
    const renderOptions = (arr) => {
      dl.innerHTML = '';
      arr.forEach(b=>{
        const o=document.createElement('option'); o.value=b; dl.appendChild(o);
      });
    };

    try{
      const r = await fetch('breeds.json', {cache:'no-store'});
      if(!r.ok) throw new Error('HTTP '+r.status);
      const list = await r.json();
      if (Array.isArray(list) && list.length) {
        renderOptions(list);
        return;
      }
      // se il JSON non è un array, usa fallback
      renderOptions(FALLBACK_BREEDS);
    }catch(e){
      // file mancante, CORS o apertura via file:// → usa fallback locale
      renderOptions(FALLBACK_BREEDS);
    }
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
    state.profiles.forEach(p=>{ const im=new Image(); im.src=p.img; im.onerror = ()=>{ im.src='plutoo-icon-512.png'; }; });
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
        <img data-id="${p.id}" src="${p.img}" alt="${p.name}">
        <div class="card-info">
          <div class="title">
            <div class="name">${p.name} ${p.verified?'<span class="badge"><i>✅</i> verificato</span>':''}</div>
            <div class="dist">${p.distanceKm} km</div>
          </div>
          <div class="intent-pill">${p.breed}</div>
          <div class="actions">
            <button class="circle no">🥲</button>
            <!-- ❤️ resta nelle card -->
            <button class="circle like heart-btn">❤️</button>
          </div>
        </div>
      `;

      // Immagine → PROFILO (NON viewer)
      const imgEl = $('img', card);
      imgEl.onerror = ()=>{ imgEl.src='plutoo-icon-512.png'; };
      imgEl.addEventListener('click', (e)=> {
        e.stopPropagation();
        openProfilePage(p);
      });

      // like/skip
      $('.heart-btn',card)?.addEventListener('click', e=>{ e.stopPropagation(); like(p); });
      $('.no',card)?.addEventListener('click', e=>{ e.stopPropagation(); skip(p); });

      // click altrove nella card → profilo
      card.addEventListener('click', ()=> openProfilePage(p));

      grid.appendChild(card);
    });

    $('#emptyNear').classList.toggle('hidden', list.length>0);
  }

  // ========== DECKS (Amore / Social) ==========
  function wireDecks(){
    bindSwipe($('#loveCard'), (dir, el)=> dir>0? likeDeck('love', el) : skipDeck('love', el));
    bindSwipe($('#socCard'),  (dir, el)=> dir>0? likeDeck('social', el): skipDeck('social', el));

    $('#loveYes')?.addEventListener('click', ()=> likeDeck('love', $('#loveCard')));
    $('#loveNo') ?.addEventListener('click', ()=> skipDeck('love', $('#loveCard')));
    $('#socYes') ?.addEventListener('click', ()=> likeDeck('social', $('#socCard')));
    $('#socNo')  ?.addEventListener('click', ()=> skipDeck('social', $('#socCard')));

    // NEL DECK: il tap sull’immagine apre il PROFILO (NON viewer)
    $('#loveImg')?.addEventListener('click', ()=> {
      const p = currentCardProfile('love'); openProfilePage(p);
    });
    $('#socImg')?.addEventListener('click', ()=> {
      const p = currentCardProfile('social'); openProfilePage(p);
    });

    renderLove(); renderSocial();
  }
  function currentCardProfile(kind){
    const idx = kind==='love'? state.deckIdxLove : state.deckIdxSoc;
    return state.profiles[idx % state.profiles.length];
  }

  function bindSwipe(card, handler){
    if (!card) return;
    let startX=0, endX=0;
    card.addEventListener('touchstart', e=>{ startX=e.touches[0].clientX; }, {passive:true});
    card.addEventListener('touchend', e=>{
      endX=e.changedTouches[0].clientX;
      const delta=endX-startX;
      if (Math.abs(delta)>40) {
        // animazione visibile
        card.classList.add(delta>0 ? 'swipe-right' : 'swipe-left');
        setTimeout(()=> card.classList.remove('swipe-right','swipe-left'), 220);
        handler(delta, card);
      }
    });
  }

  function renderLove(){
    const p = currentCardProfile('love');
    setCardInto(p, 'love');
  }
  function renderSocial(){
    const p = currentCardProfile('social');
    setCardInto(p, 'soc');
  }

  function setCardInto(p, prefix){
    const img = $('#'+prefix+'Img'); img.src = p.img; img.onerror = ()=>{ img.src='plutoo-icon-512.png'; };
    $('#'+prefix+'Title').textContent = p.name;
    $('#'+prefix+'Meta').textContent = `${p.breed} · ${p.distanceKm} km`;
    $('#'+prefix+'Bio').textContent = `${p.name} ha ${p.age} anni, ${p.sex==='M'?'maschio':'femmina'}, taglia ${p.size.toLowerCase()}, pelo ${p.coat.toLowerCase()}, energia ${p.energy.toLowerCase()}.`;
  }

  function likeDeck(kind){
    const p = currentCardProfile(kind==='love'?'love':'social');
    like(p, {fromSwipe:true});
    if (kind==='love'){ state.deckIdxLove++; renderLove(); }
    else { state.deckIdxSoc++; renderSocial(); }
  }
  function skipDeck(kind){
    if (kind==='love'){ state.deckIdxLove++; renderLove(); }
    else { state.deckIdxSoc++; renderSocial(); }
    onSwipeOccurred();
  }

  // ========== VIEWER FOTO (solo dal profilo) ==========
  function wirePhotoViewer(){
    $('#viewerBack')?.addEventListener('click', closePhotoViewer);
    $('#viewerLike')?.addEventListener('click', ()=>{
      if (!state.viewerProfile) return;
      like(state.viewerProfile);
    });
  }
  function openPhotoViewer(p, srcOverride){
    state.viewerProfile = p;
    const vp = $('#photoViewer');
    if (!vp) return; // se la pagina viewer non esiste, ignora
    const img = $('#viewerImg');
    const src = srcOverride || p.img;
    img.src = src;
    img.onerror = ()=>{ img.src='plutoo-icon-512.png'; };
    $('#viewerTitle').textContent = p.name;
    vp.classList.add('show');
  }
  function closePhotoViewer(){
    $('#photoViewer')?.classList.remove('show');
    state.viewerProfile = null;
  }

  // ========== MATCH ==========
  function maybeTheyLikedToo(p){
    // simulazione: 35% che anche l'altro abbia messo like
    return Math.random() < 0.35;
  }

  function like(p, opts={}){
    state.likedIds.add(p.id);
    if (maybeTheyLikedToo(p)) {
      state.matchedIds.add(p.id);
      showMatchOverlay(p);
    }
    renderMatches();
    if (opts.fromSwipe) onSwipeOccurred();
  }
  function skip(_p){ /* futuro: segnala meno */ }

  function renderMatches(){
    const host = $('#matchList'); if (!host) return;
    const list = state.profiles.filter(p=> state.matchedIds.has(p.id));
    host.innerHTML='';
    list.forEach(p=>{
      const item=document.createElement('div');
      item.className='item';
      item.innerHTML=`
        <img src="${p.img}" alt="${p.name}" onerror="this.src='plutoo-icon-512.png'">
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

  // Overlay "bacio"
  function wireMatchOverlay(){
    $('#closeMatch')?.addEventListener('click', ()=> $('#matchOverlay')?.classList.add('hidden'));
    $('#acceptMatch')?.addEventListener('click', ()=>{
      $('#matchOverlay')?.classList.add('hidden');
      // dopo l'accetto match → video
      requestRewardVideo(()=> {
        // post-video: no-op
      });
    });
  }
  function showMatchOverlay(_p){
    $('#matchOverlay')?.classList.remove('hidden');
  }

  // ========== GEO ==========
  function wireGeoBar(){
    const bar = $('#geoBar');
    const enable = $('#enableGeo');
    const dismiss = $('#dismissGeo');
    // Mostra la bar al primo avvio
    bar?.classList.remove('hidden');
    enable?.addEventListener('click', ()=>{
      if (!navigator.geolocation) { bar.classList.add('hidden'); return; }
      navigator.geolocation.getCurrentPosition(()=>{
        bar.classList.add('hidden');
        // demo: potremmo riordinare per distanza; i dati mock hanno già distanceKm
      }, ()=>{ bar.classList.add('hidden'); });
    });
    dismiss?.addEventListener('click', ()=> bar.classList.add('hidden'));
  }

  // ========== PROFILO ==========
  let unlockPending = null; // profilo richiesto per sblocco selfie

  function openProfilePage(p){
    $('#ppTitle').textContent = p.name;
    renderProfile(p);
    $('#profilePage').classList.add('show');
  }
  window.closeProfilePage = ()=> $('#profilePage').classList.remove('show');

  function selfieKey(p){ return LS.selfieUnlockPrefix + p.id; }
  function isSelfieUnlocked(p){
    const ts = Number(localStorage.getItem(selfieKey(p))||0);
    return ts && (now()-ts)<H24;
  }
  function setSelfieUnlocked(p){ localStorage.setItem(selfieKey(p), String(now())); }

  function isMatched(p){ return state.matchedIds.has(p.id); }

  function renderProfile(p){
    const body=$('#ppBody'); if (!body) return;
    const unlocked = isSelfieUnlocked(p) || isMatched(p);

    body.innerHTML = `
      <img class="pp-cover" src="${p.img}" alt="${p.name}" onerror="this.src='plutoo-icon-512.png'">
      <div class="pp-section">
        <h3>${p.name} ${p.verified?'<span class="badge"><i>✅</i> verificato</span>':''}</h3>
        <p class="muted">${p.breed} · ${p.age} anni · ${p.sex==='M'?'maschio':'femmina'} · taglia ${p.size.toLowerCase()}</p>
      </div>

      <div class="pp-section selfie-wrap">
        <h4>🤳🏽 Selfie con il DOG</h4>
        <img id="selfieImg" class="${unlocked?'':'selfie-blur'}" 
             src="${p.selfie || 'plutoo-icon-512.png'}" alt="Selfie" onerror="this.src='plutoo-icon-512.png'">
        ${unlocked?'':'<button id="unlockBtn" class="unlock-pill">Guarda un video per sbloccare (24h)</button>'}
      </div>

      <div class="pp-section">
        <h4>Galleria</h4>
        <div class="pp-gallery">
          <img class="pp-thumb" src="${p.img}" alt="" onerror="this.src='plutoo-icon-512.png'">
          <img class="pp-thumb" src="${p.selfie || 'plutoo-icon-512.png'}" alt="" onerror="this.src='plutoo-icon-512.png'">
        </div>
      </div>

      <div class="pp-actions">
        <button class="btn light" data-chat>Messaggio</button>
        <button class="btn primary" data-invite>Invita al parco</button>
      </div>
    `;

    // Tap su foto di copertina: APRE VIEWER con pollice blu
    $('.pp-cover', body)?.addEventListener('click', ()=> openPhotoViewer(p, p.img));
    // Tap sulle miniature galleria → viewer (usa la src della thumb)
    $$('.pp-thumb', body).forEach(thumb => {
      thumb.addEventListener('click', ()=> openPhotoViewer(p, thumb.getAttribute('src')));
    });

    // Selfie: se sbloccato/match → viewer; altrimenti chiede video
    const selfieEl = $('#selfieImg');
    if (selfieEl) {
      selfieEl.addEventListener('click', ()=>{
        const unlockedNow = isSelfieUnlocked(p) || isMatched(p);
        if (unlockedNow) {
          openPhotoViewer(p, selfieEl.getAttribute('src'));
        } else {
          if (!isEmailVerified()) {
            alert('Verifica la tua email per sbloccare il selfie. Tocca “Reinvia” nel banner in alto.');
            return;
          }
          unlockPending = p;
          requestRewardVideo(()=> {
            setSelfieUnlocked(unlockPending);
            renderProfile(unlockPending);
            unlockPending = null;
          });
        }
      });
    }

    // Sblocco selfie da pulsante
    $('#unlockBtn')?.addEventListener('click', ()=>{
      if (!isEmailVerified()) {
        alert('Verifica la tua email per sbloccare il selfie. Tocca “Reinvia” nel banner in alto.');
        return;
      }
      unlockPending = p;
      requestRewardVideo(()=> {
        setSelfieUnlocked(unlockPending);
        renderProfile(unlockPending);
        unlockPending = null;
      });
    });

    // Chat / invite
    $('[data-chat]', body)?.addEventListener('click', ()=> openChat(p));
    $('[data-invite]', body)?.addEventListener('click', ()=> alert('Invito inviato!'));
  }

  // ========== CHAT ==========
  function wireChat(){
    $('#sendBtn')?.addEventListener('click', ()=>{
      const p = currentChatProfile;
      if (!p) return;
      if (!isEmailVerified()) {
        alert('Verifica la tua email per inviare messaggi. Tocca “Reinvia” nel banner.');
        return;
      }
      const input = $('#chatInput');
      const txt = (input.value||'').trim();
      if (!txt) return;

      const firstTime = !state.firstMessageSentTo.has(p.id);
      const send = ()=>{
        addBubble(txt, true);
        input.value = '';
        if (!state.firstMessageSentTo.has(p.id)) state.firstMessageSentTo.add(p.id);
      };

      if (firstTime) {
        requestRewardVideo(send);
      } else {
        send();
      }
    });
  }

  let currentChatProfile = null;
  function openChat(p){
    currentChatProfile = p;
    $('#chatName').textContent = p.name;
    const av = $('#chatAvatar'); av.src = p.img; av.onerror = ()=>{ av.src='plutoo-icon-512.png'; };
    $('#thread').innerHTML = '';
    addBubble('Ciao! 🐾', false);
    $('#chat').classList.add('show');
  }
  function addBubble(text, me){
    const b = document.createElement('div');
    b.className = 'bubble' + (me ? ' me' : '');
    b.textContent = text;
    $('#thread').appendChild(b);
    $('#thread').scrollTop = 1e6;
  }

  // ========== ADS (demo web) ==========
  let pendingRewardHook = null;
  function requestRewardVideo(after){
    pendingRewardHook = after;
    $('#adReward')?.showModal();
  }

  function onSwipeOccurred(){
    state.swipeCount++;
    // primo trigger al 10°, poi ogni +6 (cooldown 5 swipe ⇒ 10,16,22,…)
    if (state.swipeCount === 10 || (state.swipeCount - state.lastAdSwipe) >= 6 && state.lastAdSwipe >= 10){
      requestRewardVideo(()=>{ /* no-op */ });
      state.lastAdSwipe = state.swipeCount;
    }
  }

  // ========== HELPERS ==========
  function openProfileOnTap(p){ openProfilePage(p); }

})();
