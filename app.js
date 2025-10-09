/* === SAFETY KIT (anti-crash) ===
   - setText(sel, text)  -> scrive il testo SOLO se l'elemento esiste (se non esiste, non si blocca la pagina)
   - setHTML(sel, html)  -> scrive l'HTML SOLO se l'elemento esiste (se non esiste, non si blocca la pagina)
   - onReady(fn)         -> esegue fn quando la pagina è pronta
   - storage             -> versione sicura di localStorage (se non disponibile, non si blocca)
*/
(function(){
  if (typeof window.setText !== 'function') {
    window.setText = function setText(sel, text, root = document) {
      try { const el = root.querySelector(sel); if (!el) return; el.textContent = (text ?? ''); } catch {}
    };
  }
  if (typeof window.setHTML !== 'function') {
    window.setHTML = function setHTML(sel, html, root = document) {
      try { const el = root.querySelector(sel); if (!el) return; el.innerHTML = (html ?? ''); } catch {}
    };
  }
  if (typeof window.onReady !== 'function') {
    window.onReady = function onReady(fn) {
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn, { once: true });
      else fn();
    };
  }
  if (typeof window.storage === 'undefined') {
    try {
      window.localStorage.setItem('__t', '1'); window.localStorage.removeItem('__t');
      window.storage = window.localStorage;
    } catch { window.storage = { getItem: () => null, setItem: () => {}, removeItem: () => {} }; }
  }
})();

/* --- GUARD RAILS: overlay errori --- */
(function setupCrashOverlay(){
  function showCrashOverlay(msg, file, line, col){
    try {
      const id = '__plutoo_crash';
      if (document.getElementById(id)) return;
      const box = document.createElement('div');
      box.id = id;
      box.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.88);color:#fff;display:flex;align-items:center;justify-content:center;padding:18px';
      box.innerHTML = `
        <div style="max-width:680px;font-family:system-ui,Arial,sans-serif">
          <div style="font-weight:800;font-size:18px;margin-bottom:8px">⚠️ Errore JavaScript</div>
          <div style="white-space:pre-wrap;font-size:14px;line-height:1.35;background:#1a1f43;padding:12px;border-radius:10px;border:1px solid rgba(255,255,255,.2)">
            ${String(msg || 'Unknown error')}
            ${file ? `\n@ ${file}${line?':'+line:''}${col?':'+col:''}` : ''}
          </div>
          <div style="margin-top:10px;display:flex;gap:10px;flex-wrap:wrap">
            <button id="crashReload" style="background:#7d5dfc;color:#fff;padding:8px 12px;border-radius:10px">Ricarica</button>
            <button id="crashCopy" style="background:#22283d;color:#e9ecff;padding:8px 12px;border-radius:10px">Copia errore</button>
          </div>
        </div>`;
      document.body.appendChild(box);
      document.getElementById('crashReload').onclick = ()=> location.reload();
      document.getElementById('crashCopy').onclick = async ()=>{
        try { await navigator.clipboard.writeText(box.innerText.trim()); alert('Errore copiato.'); }
        catch { alert('Copia non disponibile.'); }
      };
    } catch(_) {}
  }
  window.addEventListener('error', (e)=>{
    showCrashOverlay(e.error?.message || e.message, e.filename, e.lineno, e.colno);
  });
  window.addEventListener('unhandledrejection', (e)=>{
    const r = e.reason; const msg = (r && (r.message || r.toString())) || 'Unhandled rejection';
    showCrashOverlay(msg);
  });
})();

/* --- MODULO MONETIZZAZIONE: gate unico per pubblicità + nudge Plus --- */
const AdGate = (() => {
  const now = () => Date.now();
  const k = {
    last: 'ad:last-ts',
    dailyCount: 'ad:day-count',
    dailyStamp: 'ad:day-stamp',
    perKey: (key)=>`ad:key:${key}`,
  };
  const cfg = {
    minGapMs: 45_000,           // intervallo minimo tra due ads
    dailyCap: 12,               // massimo ads/giorno
    keyCooldownMs: {            // cooldown per tipo evento
      swipeMilestone: 0,
      selfie: 120_000,
      firstMessage: 60_000,
      match: 30_000,
      placeClick: 120_000,
    },
  };

  function readNum(key, def=0){ const v = Number(storage.getItem(key)); return Number.isFinite(v)?v:def; }
  function todayStamp(){
    const d = new Date(); d.setHours(0,0,0,0); return d.getTime();
  }
  function ensureDay(){
    const stamp = readNum(k.dailyStamp, 0);
    const today = todayStamp();
    if (stamp !== today){ storage.setItem(k.dailyStamp, String(today)); storage.setItem(k.dailyCount, '0'); }
  }

  function canShow(key){
    ensureDay();
    const t = now();
    const last = readNum(k.last, 0);
    if (t - last < cfg.minGapMs) return false;

    const count = readNum(k.dailyCount, 0);
    if (count >= cfg.dailyCap) return false;

    const keyTs = readNum(k.perKey(key), 0);
    const cool = cfg.keyCooldownMs[key] ?? 0;
    if (cool && (t - keyTs < cool)) return false;

    return true;
  }
  function markShown(key){
    const t = now();
    storage.setItem(k.last, String(t));
    storage.setItem(k.perKey(key), String(t));
    ensureDay();
    storage.setItem(k.dailyCount, String(readNum(k.dailyCount,0)+1));
  }

  // piccolo nudge per Plus dopo ogni ad
  function showPlusNudge(){
    try{
      const id='__plu_plus_nudge';
      let box=document.getElementById(id);
      if(!box){
        box=document.createElement('div');
        box.id=id;
        box.style.cssText='position:fixed;left:12px;right:12px;bottom:12px;z-index:9999;background:#101542;color:#fff;border:1px solid rgba(255,255,255,.15);border-radius:14px;padding:10px 12px;display:flex;gap:10px;align-items:center;box-shadow:0 6px 18px rgba(0,0,0,.35);font-family:system-ui,Arial,sans-serif';
        box.innerHTML = `
          <div style="font-weight:700;">Plutoo Plus</div>
          <div style="font-size:13px;opacity:.9;flex:1">Niente pubblicità, match e messaggi senza limiti.</div>
          <button id="__plu_plus_btn" style="background:#7d5dfc;color:#fff;border:none;padding:8px 10px;border-radius:10px;font-weight:700">Scopri</button>
        `;
        document.body.appendChild(box);
        document.getElementById('__plu_plus_btn')?.addEventListener('click', ()=>{
          alert('Abbonamento Plus: pagina in arrivo.');
          box.remove();
        });
      }
      setTimeout(()=>{ try{ box.remove(); }catch{} }, 5000);
    }catch{}
  }

  // wrapper unico per aprire il “reward” demo
  function trigger(key, message, after){
    if (!canShow(key)) { after?.(); return; }
    openRewardDialog(message, ()=>{
      markShown(key);
      try{ showPlusNudge(); }catch{}
      after?.();
    });
  }

  return { trigger };
})();

/* --- APP --- */
(() => {
  const $  = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => [...root.querySelectorAll(sel)];
  const sleep = (ms)=>new Promise(r=>setTimeout(r,ms));
  const now = ()=>Date.now();
  const H24 = 24*60*60*1000;

  // ---- Razze fallback (lista completa) ----
  const FALLBACK_BREEDS = ["Affenpinscher","Afghan Hound","Airedale Terrier","Akita","Alaskan Klee Kai","Alaskan Malamute","American Bulldog","American English Coonhound","American Eskimo Dog","American Foxhound","American Hairless Terrier","American Leopard Hound","American Staffordshire Terrier","American Water Spaniel","Anatolian Shepherd Dog","Appenzeller Sennenhund","Australian Cattle Dog","Australian Kelpie","Australian Shepherd","Australian Stumpy Tail Cattle Dog","Australian Terrier","Azawakh","Barbado da Terceira","Barbet","Basenji","Basset Fauve de Bretagne","Basset Hound","Bavarian Mountain Scent Hound","Beagle","Bearded Collie","Beauceron","Bedlington Terrier","Belgian Laekenois","Belgian Malinois","Belgian Sheepdog","Belgian Tervuren","Bergamasco Sheepdog","Berger Picard","Bernese Mountain Dog","Bichon Frise","Biewer Terrier","Black and Tan Coonhound","Black Russian Terrier","Bloodhound","Blue Picardy Spaniel","Bluetick Coonhound","Boerboel","Bohemian Shepherd","Bolognese","Border Collie","Border Terrier","Borzoi","Boston Terrier","Bouvier des Ardennes","Bouvier des Flandres","Boxer","Boykin Spaniel","Bracco Italiano","Braque du Bourbonnais","Braque Francais Pyrenean","Braque Saint-Germain","Brazilian Terrier","Briard","Brittany","Broholmer","Brussels Griffon","Bull Terrier","Bulldog","Bullmastiff","Cairn Terrier","Calupoh","Canaan Dog","Canadian Eskimo Dog","Cane Corso","Cardigan Welsh Corgi","Carolina Dog","Catahoula Leopard Dog","Caucasian Shepherd Dog","Cavalier King Charles Spaniel","Central Asian Shepherd Dog","Cesky Terrier","Chesapeake Bay Retriever","Chihuahua","Chinese Crested","Chinese Shar-Pei","Chinook","Chow Chow","Cirneco dell’Etna","Clumber Spaniel","Cocker Spaniel","Collie","Coton de Tulear","Croatian Sheepdog","Curly-Coated Retriever","Czechoslovakian Vlciak","Dachshund","Dalmatian","Dandie Dinmont Terrier","Danish-Swedish Farmdog","Deutscher Wachtelhund","Doberman Pinscher","Dogo Argentino","Dogue de Bordeaux","Drentsche Patrijshond","Drever","Dutch Shepherd","English Cocker Spaniel","English Foxhound","English Setter","English Springer Spaniel","English Toy Spaniel","Entlebucher Mountain Dog","Estrela Mountain Dog","Eurasier","Field Spaniel","Finnish Lapphund","Finnish Spitz","Flat-Coated Retriever","French Bulldog","French Spaniel","German Longhaired Pointer","German Pinscher","German Shepherd Dog","German Shorthaired Pointer","German Spitz","German Wirehaired Pointer","Giant Schnauzer","Glen of Imaal Terrier","Golden Retriever","Gordon Setter","Grand Basset Griffon Vendéen","Great Dane","Great Pyrenees","Greater Swiss Mountain Dog","Greyhound","Hamiltonstovare","Hanoverian Scenthound","Harrier","Havanese","Hokkaido","Hovawart","Ibizan Hound","Icelandic Sheepdog","Irish Red and White Setter","Irish Setter","Irish Terrier","Irish Water Spaniel","Irish Wolfhound","Italian Greyhound","Jagdterrier","Japanese Akitainu","Japanese Chin","Japanese Spitz","Japanese Terrier","Kai Ken","Karelian Bear Dog","Keeshond","Kerry Blue Terrier","Kishu Ken","Komondor","Korean Jindo Dog","Kromfohrlander","Kuvasz","Labrador Retriever","Lagotto Romagnolo","Lakeland Terrier","Lancashire Heeler","Lapponian Herder","Large Munsterlander","Leonberger","Lhasa Apso","Löwchen","Maltese","Manchester Terrier (Standard)","Manchester Terrier (Toy)","Mastiff","Miniature American Shepherd","Miniature Bull Terrier","Miniature Pinscher","Miniature Schnauzer","Mountain Cur","Mudi","Neapolitan Mastiff","Nederlandse Kooikerhondje","Newfoundland","Norfolk Terrier","Norrbottenspets","Norwegian Buhund","Norwegian Elkhound","Norwegian Lundehund","Norwich Terrier","Nova Scotia Duck Tolling Retriever","Old English Sheepdog","Otterhound","Papillon","Parson Russell Terrier","Pekingese","Pembroke Welsh Corgi","Peruvian Inca Orchid","Petit Basset Griffon Vendéen","Pharaoh Hound","Plott Hound","Pointer","Polish Lowland Sheepdog","Pomeranian","Pont-Audemer Spaniel","Poodle (Miniature)","Poodle (Standard)","Poodle (Toy)","Porcelaine","Portuguese Podengo","Portuguese Podengo Pequeno","Portuguese Pointer","Portuguese Sheepdog","Portuguese Water Dog","Presa Canario","Pudelpointer","Pug","Puli","Pumi","Pyrenean Mastiff","Pyrenean Shepherd","Rafeiro do Alentejo","Rat Terrier","Redbone Coonhound","Rhodesian Ridgeback","Romanian Carpathian Shepherd","Romanian Mioritic Shepherd Dog","Rottweiler","Russell Terrier","Russian Toy","Russian Tsvetnaya Bolonka","Saint Bernard","Saluki","Samoyed","Schapendoes","Schipperke","Scottish Deerhound","Scottish Terrier","Sealyham Terrier","Segugio Italiano","Shetland Sheepdog","Shiba Inu","Shih Tzu","Shikoku","Siberian Husky","Silky Terrier","Skye Terrier","Sloughi","Slovakian Wirehaired Pointer","Slovensky Cuvac","Slovensky Kopov","Small Munsterlander","Smooth Fox Terrier","Soft Coated Wheaten Terrier","Spanish Mastiff","Spanish Water Dog","Spinone Italiano","Stabyhoun","Staffordshire Bull Terrier","Standard Schnauzer","Sussex Spaniel","Swedish Lapphund","Swedish Vallhund","Taiwan Dog","Teddy Roosevelt Terrier","Thai Bangkaew","Thai Ridgeback","Tibetan Mastiff","Tibetan Spaniel","Tibetan Terrier","Tornjak","Tosa","Toy Fox Terrier","Transylvanian Hound","Treeing Tennessee Brindle","Treeing Walker Coonhound","Vizsla","Volpino Italiano","Weimaraner","Welsh Springer Spaniel","Welsh Terrier","West Highland White Terrier","Wetterhoun","Whippet","Wire Fox Terrier","Wirehaired Pointing Griffon","Wirehaired Vizsla","Working Kelpie","Xoloitzcuintli","Yakutian Laika","Yorkshire Terrier"];

  // ---- Stato ----
  const state = {
    tab:'near',
    filters:{breed:'',ageBand:'',sex:'',size:'',coat:'',energy:'',pedigree:'',distance:''},
    profiles:[],
    likedIds:new Set(),
    matchedIds:new Set(),
    deckIdxLove:0, deckIdxSoc:0,
    swipeCount:0,
    viewerProfile:null,
    firstMessageSentTo:new Set(),
    breeds:[]
  };

  // Avvio protetto
  document.addEventListener('DOMContentLoaded', () => {
    try { init(); }
    catch (err) {
      const ev = new ErrorEvent('error', { message: err?.message || String(err) });
      window.dispatchEvent(ev);
    }
  });

  async function init(){
    wireBasicNav();
    wireSheetsAndDialogs();
    wireFilterPanel();
    await loadBreeds();
    prepareLocalProfiles();
    renderNearGrid();
    wireTabs();
    wireDecks();
    wireGeoBar();
    setupPhotoViewer();
    wireMatchOverlay();
    wireChat();
  }

  // NAV
  function wireBasicNav(){
    $('#openPrivacy')?.addEventListener('click', ()=> $('#privacyDlg')?.showModal());
    $('#openTerms')?.addEventListener('click', ()=> $('#termsDlg')?.showModal());
  }
  window.goHome=()=>{$('#landing')?.classList.remove('active');$('#app')?.classList.add('active');};

  // SHEETS / Reward
  let pendingRewardHook=null;
  function wireSheetsAndDialogs(){
    $('#btnLoginTop')?.addEventListener('click',()=>$('#sheetLogin')?.classList.add('show'));
    $('#btnRegisterTop')?.addEventListener('click',()=>$('#sheetRegister')?.classList.add('show'));
    $('#btnLoginUnder')?.addEventListener('click',()=>$('#sheetLogin')?.classList.add('show'));
    $$('.close').forEach(b=>b.addEventListener('click',()=>$('#'+b.dataset.close)?.classList.remove('show')));

    $('#rewardPlay')?.addEventListener('click', async ()=>{
      const btn=$('#rewardPlay'); btn.disabled=true; btn.textContent='Video…';
      await sleep(3000); btn.disabled=false; btn.textContent='Guarda video';
      $('#adReward')?.close();
      if(pendingRewardHook){ const f=pendingRewardHook; pendingRewardHook=null; f(); }
    });
  }
  function openRewardDialog(message,after){
    const dlg=$('#adReward'); if(!dlg){ after?.(); return; }
    const h3=dlg.querySelector('h3'); if(h3) h3.textContent=message||'Guarda il video per continuare';
    pendingRewardHook=after||null; dlg.showModal();
  }

  // FILTRI + autocomplete
  function wireFilterPanel(){
    const toggle=$('#filterToggle'); const panel=$('#filterPanel');
    toggle?.addEventListener('click',()=>{
      const hidden=panel.hasAttribute('hidden');
      if(hidden){panel.removeAttribute('hidden');toggle.textContent='Ricerca personalizzata ▲';}
      else{panel.setAttribute('hidden','');toggle.textContent='Ricerca personalizzata ▾';}
    });

    $('#filterForm')?.addEventListener('submit',e=>{
      e.preventDefault();
      const data=new FormData(e.currentTarget);
      for(const [k,v] of data.entries()) state.filters[k]=v;
      renderNearGrid();
    });
    $('#filtersReset')?.addEventListener('click',()=>{
      Object.keys(state.filters).forEach(k=>state.filters[k]='');
      $('#filterForm')?.reset();
      window.__closeSuggest?.();
      renderNearGrid();
    });

    // Autocomplete custom “Razza”
    const inp=$('#breedInput');
    if(inp){
      inp.setAttribute('autocomplete','off'); inp.removeAttribute('list');
      const box=document.createElement('div'); box.className='suggest hidden'; inp.parentElement.appendChild(box);

      inp.addEventListener('input', ()=>{
        const q=(inp.value||'').trim().toLowerCase(); state.filters.breed=inp.value.trim();
        if(!q){ closeSuggest(); return; }
        const list=(state.breeds||[]).filter(b=>b.toLowerCase().startsWith(q)).sort((a,b)=>a.localeCompare(b,'it'));
        renderSuggest(box,list.slice(0,60), val=>{ inp.value=val; state.filters.breed=val; closeSuggest(); });
      });
      document.addEventListener('click',(e)=>{ if(!box.contains(e.target) && e.target!==inp) closeSuggest(); });

      function renderSuggest(box,items,onPick){
        if(!items.length){ closeSuggest(); return; }
        box.innerHTML='';
        items.forEach(t=>{
          const d=document.createElement('div');
          d.className='suggest-item';
          d.textContent=t;
          d.addEventListener('click',()=>onPick(t));
          box.appendChild(d);
        });
        box.classList.remove('hidden');
      }
      function closeSuggest(){ box.classList.add('hidden'); }
      window.__closeSuggest = closeSuggest;
    }
  }

  // TABS
  function wireTabs(){
    $$('.tabs .tab').forEach(btn=>{
      btn.addEventListener('click',()=>{
        const tab=btn.getAttribute('data-tab'); if(!tab) return;
        state.tab=tab;
        $$('.tabs .tab').forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
        $$('.tabpane').forEach(p=>p.classList.remove('active'));
        $('#'+tab)?.classList.add('active');
        if(tab==='near') renderNearGrid();
        if(tab==='love') renderLove();
        if(tab==='social') renderSocial();
        if(tab==='matches') renderMatches();
      });
    });
  }

  // BREEDS
  async function loadBreeds(){
    try{
      const r=await fetch('breeds.json',{cache:'no-store'});
      if(!r.ok) throw 0;
      const arr=await r.json();
      state.breeds=Array.isArray(arr)&&arr.length?arr:FALLBACK_BREEDS;
    }catch{ state.breeds=FALLBACK_BREEDS; }
  }

  // PROFILES (mock)
  function prepareLocalProfiles(){
    const imgs=['dog1.jpg','dog2.jpg','dog3.jpg','dog4.jpg'];
    const names=['Luna','Fido','Bruno','Maya','Kira','Rocky','Zoe','Leo'];
    state.profiles=Array.from({length:12}).map((_,i)=>({
      id:i+1,name:names[i%names.length],age:1+(i%7),sex:i%2?'F':'M',
      size:['Piccola','Media','Grande'][i%3],
      coat:['Corto','Medio','Lungo'][i%3],
      energy:['Bassa','Media','Alta'][i%3],
      breed:['Barboncino','Bulldog Francese','Shiba Inu','Pastore Tedesco'][i%4],
      img:imgs[i%imgs.length],selfie:imgs[(i+1)%imgs.length],
      distanceKm:((i+1)*1.1).toFixed(1),verified:readVerified(i+1)
    }));
  }

  // VICINO
  function renderNearGrid(){
    const grid=$('#grid'); if(!grid) return;
    const f=state.filters;
    const fits=p=>{
      if(f.breed && !p.breed.toLowerCase().startsWith(f.breed.toLowerCase())) return false;
      if(f.sex && p.sex!==f.sex) return false;
      if(f.size && p.size!==f.size) return false;
      if(f.coat && p.coat!==f.coat) return false;
      if(f.energy && p.energy!==f.energy) return false;
      if(f.distance && Number(p.distanceKm)>Number(f.distance)) return false;
      return true;
    };
    const list=state.profiles.filter(fits);
    setText('#counter', `${list.length} profili trovati`);
    grid.innerHTML='';
    list.forEach(p=>{
      const card=document.createElement('article'); card.className='card';
      card.innerHTML=`
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
        </div>`;
      $('.like',card)?.addEventListener('click',e=>{e.stopPropagation(); likeFromSwipe(p);});
      $('.no',card)?.addEventListener('click',e=>{e.stopPropagation(); swipeOccurred();});
      $('img',card).addEventListener('click',e=>{e.stopPropagation(); openProfilePage(p);});
      card.addEventListener('click',()=>openProfilePage(p));
      grid.appendChild(card);
    });
    $('#emptyNear')?.classList.toggle('hidden',list.length>0);
  }

  // DECKS + animazione (conteggia gli swipe/like) + BLOCCO VERTICALE
  function wireDecks(){
    bindSwipe($('#loveCard'), d=> d>0?likeDeck('love'):skipDeck('love'));
    bindSwipe($('#socCard'),  d=> d>0?likeDeck('social'):skipDeck('social'));
    $('#loveYes')?.addEventListener('click',()=>likeDeck('love'));
    $('#loveNo') ?.addEventListener('click',()=>skipDeck('love'));
    $('#socYes') ?.addEventListener('click',()=>likeDeck('social'));
    $('#socNo')  ?.addEventListener('click',()=>skipDeck('social'));
    $('#loveImg')?.addEventListener('click',()=>openProfilePage(currentCard('love')));
    $('#socImg') ?.addEventListener('click',()=>openProfilePage(currentCard('social')));
    renderLove(); renderSocial();
  }
  function bindSwipe(card,h){
    if(!card) return;
    let sx=0, sy=0, locked=false;
    const onStart = (e)=>{ sx = e.touches[0].clientX; sy = e.touches[0].clientY; locked=false; };
    const onMove  = (e)=>{
      const dx = e.touches[0].clientX - sx;
      const dy = e.touches[0].clientY - sy;
      // Se il gesto è principalmente orizzontale, blocco lo scroll verticale
      if (!locked && Math.abs(dx) > 20 && Math.abs(dx) > Math.abs(dy)){
        locked=true;
      }
      if (locked){ try{ e.preventDefault(); }catch{} }
    };
    const onEnd   = (e)=>{
      const d = e.changedTouches[0].clientX - sx;
      if (Math.abs(d) > 40) h(d);
      locked=false;
    };
    card.addEventListener('touchstart', onStart, { passive:true  });
    card.addEventListener('touchmove',  onMove,  { passive:false });
    card.addEventListener('touchend',   onEnd,   { passive:true  });
  }
  function currentCard(kind){ const i=kind==='love'?state.deckIdxLove:state.deckIdxSoc; return state.profiles[i%state.profiles.length]; }
  function renderLove(){ renderCardInto(currentCard('love'),'love'); }
  function renderSocial(){ renderCardInto(currentCard('social'),'soc'); }
  function renderCardInto(p,pre){
    const im = $('#'+pre+'Img'); if(im) im.src=p.img;
    setText('#'+pre+'Title', p.name);
    setText('#'+pre+'Meta', `${p.breed} · ${p.distanceKm} km`);
    setText('#'+pre+'Bio', `${p.name} ha ${p.age} anni, ${p.sex==='M'?'maschio':'femmina'}, taglia ${p.size.toLowerCase()}, pelo ${p.coat.toLowerCase()}, energia ${p.energy.toLowerCase()}.`);
  }

  async function likeDeck(kind){
    swipeOccurred();
    await animateAndAdvance(kind, +1, async()=>{ await like(currentCard(kind)); });
  }
  async function skipDeck(kind){
    swipeOccurred();
    await animateAndAdvance(kind, -1);
  }
  async function animateAndAdvance(kind, dir, after){
    const card = kind==='love' ? $('#loveCard') : $('#socCard');
    if(!card){ if(after) await after(); advance(kind); return; }
    const cls = dir>0 ? 'swipe-right' : 'swipe-left';
    card.classList.add(cls);
    await sleep(230);
    card.classList.remove(cls);
    advance(kind);
    if(kind==='love') renderLove(); else renderSocial();
    if(after) await after();
  }
  function advance(kind){ if(kind==='love') state.deckIdxLove++; else state.deckIdxSoc++; }

  // SWIPE milestones (10, poi ogni +5) -> passa da AdGate
  function swipeOccurred(){
    state.swipeCount++;
    if(state.swipeCount===10 || (state.swipeCount>10 && (state.swipeCount-10)%5===0)){
      AdGate.trigger('swipeMilestone','Guarda il video per altri like', ()=>{ /* sblocco placeholder */ });
    }
  }
  async function likeFromSwipe(p){ swipeOccurred(); await like(p); }

  // MATCH
  function maybeTheyLikedToo(){ return Math.random()<0.35; }
  async function like(p){
    const first=!state.likedIds.has(p.id);
    state.likedIds.add(p.id);
    if(first && maybeTheyLikedToo()){
      state.matchedIds.add(p.id);
      // al match mostro ad (gate)
      AdGate.trigger('match','Guarda il video per aprire la chat del match', async ()=>{
        await simulateAutoVideo();
        showMatchToast(p);
        renderMatches();
      });
    } else {
      renderMatches();
    }
  }
  function renderMatches(){
    const host=$('#matchList'); if(!host) return;
    const list=state.profiles.filter(p=>state.matchedIds.has(p.id));
    host.innerHTML='';
    list.forEach(p=>{
      const item=document.createElement('div');
      item.className='item';
      item.innerHTML=`<img src="${p.img}" alt="${p.name}"><div><div><strong>${p.name}</strong> · ${p.breed}</div><div class="small muted">${p.distanceKm} km</div></div><button class="btn pill primary" style="margin-left:auto">Scrivi</button>`;
      $('button',item).addEventListener('click',()=>openChat(p));
      host.appendChild(item);
    });
    if($('#emptyMatch')) $('#emptyMatch').style.display=list.length?'none':'block';
  }
  function wireMatchOverlay(){
    $('#closeMatch')?.addEventListener('click',()=>$('#matchOverlay')?.classList.add('hidden'));
    $('#acceptMatch')?.addEventListener('click',()=>$('#matchOverlay')?.classList.add('hidden'));
  }
  function showMatchToast(_p){
    const ov=$('#matchOverlay');
    if(ov){ ov.classList.remove('hidden'); return; }
    const overlay=document.createElement('div');
    overlay.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;z-index:1200;color:#fff;';
    overlay.innerHTML=`<div style="background:#121735;padding:16px 18px;border-radius:16px;text-align:center;"><div style="font-size:52px">💋</div><div style="font-weight:800;margin-top:8px">È un match!</div></div>`;
    document.body.appendChild(overlay);
    setTimeout(()=> overlay.remove(), 1600);
  }

  // GEO
  function wireGeoBar(){
    const bar=$('#geoBar'); const enable=$('#enableGeo'); const dismiss=$('#dismissGeo');
    bar?.classList.remove('hidden');
    enable?.addEventListener('click',()=>{ if(!navigator.geolocation){bar.classList.add('hidden');return;} navigator.geolocation.getCurrentPosition(()=>bar.classList.add('hidden'),()=>bar.classList.add('hidden')); });
    dismiss?.addEventListener('click',()=>bar.classList.add('hidden'));
  }

  // ====== PROFILO + DOCUMENTI STRUTTURATI ======
  function openProfilePage(p){
    const head=$('.pp-head');
    if(head){
      head.innerHTML = `
        <div class="row gap">
          <img src="plutoo-icon-192.png" alt="Plutoo" class="brand" style="width:28px;height:28px;border-radius:6px">
          <strong id="ppTitle">${p.name}</strong>
        </div>
        <button id="ppClose" class="btn light small">Chiudi</button>
      `;
      $('#ppClose').addEventListener('click', ()=>$('#profilePage').classList.remove('show'));
    }
    setText('#ppTitle', p.name);
    renderProfile(p);
    $('#profilePage')?.classList.add('show');
  }
  window.closeProfilePage=()=>$('#profilePage')?.classList.remove('show');

  function selfieKey(p){return`selfie-unlock-${p.id}`;}
  function isSelfieUnlocked(p){const ts=Number(localStorage.getItem(selfieKey(p))||0);return ts&&(now()-ts)<H24;}
  function setSelfieUnlocked(p){localStorage.setItem(selfieKey(p),String(now()));}
  function isMatched(p){return state.matchedIds.has(p.id);}

  // Storage structured docs
  const ownerKey = (p)=>`docs-owner-struct-${p.id}`; // {type, front, back}
  const dogKey   = (p)=>`docs-dog-struct-${p.id}`;   // {microchip, vaccines:[], attachments:[]}
  function readJSON(key, fallback){ try{ return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }catch{ return fallback; } }
  function writeJSON(key,obj){ localStorage.setItem(key, JSON.stringify(obj||{})); }
  function readVerified(id){ return localStorage.getItem(`verified-${id}`)==='1'; }
  function writeVerified(id,val){ localStorage.setItem(`verified-${id}`, val?'1':'0'); }
  async function fileToDataUrl(f){ return new Promise((res,rej)=>{ const r=new FileReader(); r.onload=()=>res(r.result); r.onerror=rej; r.readAsDataURL(f); }); }

  function renderProfile(p){
    const body=$('#ppBody'); const unlocked=isSelfieUnlocked(p)||isMatched(p);

    const owner = readJSON(ownerKey(p), {type:'carta_identita', front:'', back:''});
    const dog   = readJSON(dogKey(p),   {microchip:'', vaccines:[], attachments:[]});

    const verified = (owner.front && owner.back && dog.microchip && dog.vaccines.length>0) || readVerified(p.id);
    if (verified){ p.verified=true; writeVerified(p.id,true); }

    if(body) body.innerHTML=`
      <img class="pp-cover" src="${p.img}" alt="${p.name}">
      <div class="pp-section">
        <h3>${p.name} ${p.verified?'<span class="badge"><i>✅</i> verificato</span>':''}</h3>
        <p class="muted">${p.breed} · ${p.age} anni · ${p.sex==='M'?'maschio':'femmina'} · taglia ${p.size.toLowerCase()} · pelo ${p.coat.toLowerCase()} · energia ${p.energy.toLowerCase()}</p>
      </div>

      <div class="pp-section selfie-wrap">
        <h4>🤳🏽 Selfie</h4>
        <img id="selfieImg" class="${unlocked?'':'selfie-blur'}" src="${p.selfie||'plutoo-icon-512.png'}" alt="Selfie">
        ${unlocked?'':'<button id="unlockBtn" class="unlock-pill">Guarda il video per vedere il selfie</button>'}
      </div>

      <div class="pp-section">
        <h4>📷 Galleria</h4>
        <div class="pp-gallery">
          <img class="pp-thumb" src="${p.img}" alt="">
          <img class="pp-thumb" src="${p.selfie||'plutoo-icon-512.png'}" alt="">
        </div>
      </div>

      <div class="pp-section">
        <h4>📄 Documenti per il badge</h4>
        <p class="small muted">Requisiti: <strong>fronte+retro</strong> documento proprietario, <strong>microchip</strong>, almeno <strong>1 vaccino</strong> con data.</p>

        <div class="pp-docs">

          <div class="doc-item">
            <h5>Documento proprietario</h5>
            <div class="doc-form">
              <label class="full">
                Tipo documento
                <select id="ownerType">
                  <option value="carta_identita">Carta d'identità</option>
                  <option value="patente">Patente</option>
                  <option value="passaporto">Passaporto</option>
                </select>
              </label>

              <label>
                Fronte
                <input id="ownerFront" type="file" accept="image/*">
              </label>
              <label>
                Retro
                <input id="ownerBack" type="file" accept="image/*">
              </label>
            </div>

            <div class="doc-previews" id="ownerPrev"></div>
          </div>

          <div class="doc-item">
            <h5>Documenti cane</h5>

            <div class="doc-form">
              <label class="full">
                Numero microchip
                <input id="dogChip" class="inp" placeholder="es. 3802600XXXXXXXX" maxlength="20">
              </label>

              <label>
                Vaccino
                <select id="vacName">
                  <option value="Antirabbica">Antirabbica</option>
                  <option value="Polivalente/Esavalente">Polivalente/Esavalente</option>
                  <option value="Leishmania">Leishmania</option>
                  <option value="Echinococco">Echinococco</option>
                  <option value="Altro">Altro</option>
                </select>
              </label>
              <label>
                Data
                <input id="vacDate" type="date">
              </label>
              <div class="full kv">
                <input id="vacOther" class="inp" placeholder="Se Altro, specifica il nome" />
                <button id="vacAdd" class="btn light small">Aggiungi vaccino</button>
              </div>
            </div>

            <div id="vacList" class="doc-previews"></div>

            <div class="doc-form">
              <label class="full">
                Allegati (libretto, certificati)
                <input id="dogAttach" type="file" accept="image/*" multiple>
              </label>
            </div>
            <div class="doc-previews" id="dogPrev"></div>
          </div>

        </div>
      </div>

      <div class="pp-actions">
        <button class="btn light" data-chat>Messaggio</button>
        <button class="btn primary" data-invite>Invita al parco</button>
      </div>
    `;

    $('.pp-cover',body)?.addEventListener('click',()=>openPhotoViewer(p,p.img));
    $$('.pp-thumb',body).forEach(t=>t.addEventListener('click',()=>openPhotoViewer(p,t.getAttribute('src'))));

    const selfieEl=$('#selfieImg');
    if(selfieEl){
      selfieEl.addEventListener('click',()=>{
        if(unlocked){ openPhotoViewer(p,selfieEl.getAttribute('src')); }
        else{
          // QUI: pubblicità per sbloccare il selfie (con gate)
          AdGate.trigger('selfie','Guarda il video per vedere il selfie', ()=>{
            setSelfieUnlocked(p); renderProfile(p);
          });
        }
      });
    }
    $('#unlockBtn')?.addEventListener('click',()=>{
      AdGate.trigger('selfie','Guarda il video per vedere il selfie', ()=>{
        setSelfieUnlocked(p); renderProfile(p);
      });
    });

    $('#ownerType')?.addEventListener('change', e=>{
      owner.type = e.target.value; writeJSON(ownerKey(p), owner);
    });
    const ownerFront = $('#ownerFront'); const ownerBack = $('#ownerBack');
    if(ownerFront) ownerFront.addEventListener('change', async e=>{
      const f=e.target.files?.[0]; if(!f) return;
      owner.front = await fileToDataUrl(f); writeJSON(ownerKey(p), owner); renderProfile(p);
    });
    if(ownerBack) ownerBack.addEventListener('change', async e=>{
      const f=e.target.files?.[0]; if(!f) return;
      owner.back = await fileToDataUrl(f); writeJSON(ownerKey(p), owner); renderProfile(p);
    });

    const ownerPrev=$('#ownerPrev');
    if(ownerPrev){
      ownerPrev.innerHTML='';
      if(owner.front){ const im=document.createElement('img'); im.className='doc-thumb'; im.src=owner.front; im.title='Fronte'; im.addEventListener('click',()=>openPhotoViewer(p,owner.front)); ownerPrev.appendChild(im); }
      if(owner.back){ const im=document.createElement('img'); im.className='doc-thumb'; im.src=owner.back; im.title='Retro';  im.addEventListener('click',()=>openPhotoViewer(p,owner.back)); ownerPrev.appendChild(im); }
    }

    const chipEl=$('#dogChip');
    if(chipEl){
      chipEl.value = dog.microchip || '';
      chipEl.addEventListener('input', e=>{
        dog.microchip = e.target.value.trim();
        writeJSON(dogKey(p), dog);
        checkAndVerify(p);
      });
    }

    const vacName=$('#vacName'), vacDate=$('#vacDate'), vacOther=$('#vacOther'), vacAdd=$('#vacAdd'), vacList=$('#vacList');
    const repaintVaccines=()=>{
      if(!vacList) return;
      vacList.innerHTML='';
      dog.vaccines.forEach((v,idx)=>{
        const tag=document.createElement('span');
        tag.className='tag';
        tag.innerHTML=`${v.name} · ${v.date}<span class="x" title="Rimuovi">✕</span>`;
        tag.querySelector('.x').addEventListener('click', ()=>{
          dog.vaccines.splice(idx,1);
          writeJSON(dogKey(p), dog);
          repaintVaccines(); checkAndVerify(p);
        });
        vacList.appendChild(tag);
      });
    };
    repaintVaccines();

    vacAdd?.addEventListener('click', e=>{
      e.preventDefault();
      let name = vacName?.value;
      if(name==='Altro'){
        const t=(vacOther?.value||'').trim();
        if(!t) return; name = t;
      }
      const date=(vacDate?.value||'').trim();
      if(!name || !date) return;
      dog.vaccines.push({name, date});
      writeJSON(dogKey(p), dog);
      if(vacOther) vacOther.value=''; if(vacDate) vacDate.value='';
      repaintVaccines(); checkAndVerify(p);
    });

    $('#dogAttach')?.addEventListener('change', async e=>{
      const files=[...e.target.files];
      for(const f of files){
        const url=await fileToDataUrl(f);
        dog.attachments.push(url);
      }
      writeJSON(dogKey(p), dog);
      renderProfile(p);
    });

    const dogPrev=$('#dogPrev');
    if(dogPrev){
      dogPrev.innerHTML='';
      dog.attachments.forEach((src)=>{
        const im=document.createElement('img');
        im.className='doc-thumb'; im.src=src; im.title='Allegato';
        im.addEventListener('click',()=>openPhotoViewer(p,src));
        dogPrev.appendChild(im);
      });
    }

    $('[data-chat]',body)?.addEventListener('click',()=>openChat(p));
    $('[data-invite]',body)?.addEventListener('click',()=>alert('Invito inviato!'));

    checkAndVerify(p);
  }

  function checkAndVerify(p){
    const owner = readJSON(ownerKey(p), {type:'carta_identita', front:'', back:''});
    const dog   = readJSON(dogKey(p),   {microchip:'', vaccines:[], attachments:[]});
    const ok = !!(owner.front && owner.back && dog.microchip && dog.vaccines.length>0);
    if(ok && !readVerified(p.id)){
      writeVerified(p.id,true);
      p.verified=true;
      renderProfile(p);
      renderNearGrid();
    }
  }

  // VIEWER (creato runtime)
  function setupPhotoViewer(){
    if($('#photoViewer')) return;
    const viewer=document.createElement('div');
    viewer.id='photoViewer';
    viewer.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.85);display:none;align-items:center;justify-content:center;z-index:1400;';
    viewer.className='photo-viewer';
    viewer.innerHTML=`
      <div class="pv-box" style="max-width:92vw;max-height:86vh;position:relative;">
        <img id="viewerImg" src="" alt="" style="max-width:100%;max-height:100%;display:block;border-radius:12px">
        <button id="viewerLike" class="circle big" style="position:absolute;left:50%;bottom:-52px;transform:translateX(-50%);width:64px;height:64px;border-radius:50%;background:#1977f3;color:#fff;font-size:28px;display:flex;align-items:center;justify-content:center;">👍</button>
        <button id="viewerBack" style="position:absolute;top:-52px;left:0;background:#0000;border:none;color:#e9ecff;font-size:28px">×</button>
      </div>`;
    viewer.addEventListener('click',e=>{ if(e.target===viewer) closePhotoViewer(); });
    document.body.appendChild(viewer);
    $('#viewerBack')?.addEventListener('click', closePhotoViewer);
    $('#viewerLike')?.addEventListener('click', ()=>{ if(state.viewerProfile) like(state.viewerProfile); });
  }
  function openPhotoViewer(p,src){ state.viewerProfile=p; const vImg=$('#viewerImg'); if(vImg) vImg.src=src||p.img; const v=$('#photoViewer'); if(v) v.style.display='flex'; }
  function closePhotoViewer(){ const v=$('#photoViewer'); if(v) v.style.display='none'; state.viewerProfile=null; }

  // CHAT (video al primo messaggio, con gate, e fix invio)
  let currentChatProfile=null;
  function wireChat(){
    $('#sendBtn')?.addEventListener('click', async ()=>{
      const p=currentChatProfile; if(!p) return;
      const input=$('#chatInput'); const txt=(input?.value||'').trim(); if(!txt) return;
      const first=!state.firstMessageSentTo.has(p.id);
      if(first){
        // pubblicità PRIMA del primo invio in questa chat (gate)
        AdGate.trigger('firstMessage','Guarda il video per inviare il primo messaggio', ()=>{
          state.firstMessageSentTo.add(p.id);
          addBubble(txt,true); if(input) input.value='';
        });
      } else {
        addBubble(txt,true); if(input) input.value='';
      }
    });
  }
  function openChat(p){
    currentChatProfile=p;
    setText('#chatName', p.name);
    const av=$('#chatAvatar'); if(av) av.src=p.img;
    const thread=$('#thread'); if(thread) thread.innerHTML='';
    addBubble('Ciao! 🐾',false);
    $('#chat')?.classList.add('show');
  }
  function addBubble(t,me){
    const b=document.createElement('div');
    b.className='bubble'+(me?' me':''); b.textContent=t;
    const thr=$('#thread'); if(!thr) return;
    thr.appendChild(b); thr.scrollTop=1e6;
  }

  // Video automatici (demo finto)
  async function simulateAutoVideo(){ await sleep(3000); }
})();
