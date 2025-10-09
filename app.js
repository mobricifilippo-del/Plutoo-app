/* === SAFETY KIT (anti-crash) ===
   - setText(sel, text)  -> scrive il testo SOLO se l'elemento esiste
   - setHTML(sel, html)  -> scrive l'HTML SOLO se l'elemento esiste
   - onReady(fn)         -> esegue fn quando la pagina è pronta
   - storage             -> localStorage sicuro (fallback se non disponibile)
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
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn, { once:true });
      else fn();
    };
  }
  if (typeof window.storage === 'undefined') {
    try { localStorage.setItem('__t','1'); localStorage.removeItem('__t'); window.storage = localStorage; }
    catch { window.storage = { getItem:()=>null, setItem:()=>{}, removeItem:()=>{} }; }
  }
})();

/* --- OVERLAY ERRORI VISIBILE IN WEBVIEW --- */
(function setupCrashOverlay(){
  function showCrashOverlay(msg, file, line, col){
    try {
      if (document.getElementById('__plutoo_crash')) return;
      const box = document.createElement('div');
      box.id='__plutoo_crash';
      box.style.cssText='position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.88);color:#fff;display:flex;align-items:center;justify-content:center;padding:18px';
      box.innerHTML = `
        <div style="max-width:680px;font-family:system-ui,Arial,sans-serif">
          <div style="font-weight:800;font-size:18px;margin-bottom:8px">⚠️ Errore JavaScript</div>
          <div style="white-space:pre-wrap;font-size:14px;line-height:1.35;background:#1a1f43;padding:12px;border-radius:10px;border:1px solid rgba(255,255,255,.2)">
            ${String(msg||'Unknown error')}${file?`\n@ ${file}${line?':'+line:''}${col?':'+col:''}`:''}
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
    } catch {}
  }
  window.addEventListener('error', (e)=> showCrashOverlay(e.error?.message||e.message, e.filename, e.lineno, e.colno));
  window.addEventListener('unhandledrejection', (e)=> showCrashOverlay((e.reason && (e.reason.message||e.reason.toString())) || 'Unhandled rejection'));
})();

/* --- APP --- */
(() => {
  const $  = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => [...root.querySelectorAll(sel)];
  const sleep = (ms)=>new Promise(r=>setTimeout(r,ms));
  const now = ()=>Date.now();
  const H24 = 24*60*60*1000;

  /* Razze fallback (completa) */
  const FALLBACK_BREEDS = ["Affenpinscher","Afghan Hound","Airedale Terrier","Akita","Alaskan Klee Kai","Alaskan Malamute","American Bulldog","American English Coonhound","American Eskimo Dog","American Foxhound","American Hairless Terrier","American Leopard Hound","American Staffordshire Terrier","American Water Spaniel","Anatolian Shepherd Dog","Appenzeller Sennenhund","Australian Cattle Dog","Australian Kelpie","Australian Shepherd","Australian Stumpy Tail Cattle Dog","Australian Terrier","Azawakh","Barbado da Terceira","Barbet","Basenji","Basset Fauve de Bretagne","Basset Hound","Bavarian Mountain Scent Hound","Beagle","Bearded Collie","Beauceron","Bedlington Terrier","Belgian Laekenois","Belgian Malinois","Belgian Sheepdog","Belgian Tervuren","Bergamasco Sheepdog","Berger Picard","Bernese Mountain Dog","Bichon Frise","Biewer Terrier","Black and Tan Coonhound","Black Russian Terrier","Bloodhound","Blue Picardy Spaniel","Bluetick Coonhound","Boerboel","Bohemian Shepherd","Bolognese","Border Collie","Border Terrier","Borzoi","Boston Terrier","Bouvier des Ardennes","Bouvier des Flandres","Boxer","Boykin Spaniel","Bracco Italiano","Braque du Bourbonnais","Braque Francais Pyrenean","Braque Saint-Germain","Brazilian Terrier","Briard","Brittany","Broholmer","Brussels Griffon","Bull Terrier","Bulldog","Bullmastiff","Cairn Terrier","Calupoh","Canaan Dog","Canadian Eskimo Dog","Cane Corso","Cardigan Welsh Corgi","Carolina Dog","Catahoula Leopard Dog","Caucasian Shepherd Dog","Cavalier King Charles Spaniel","Central Asian Shepherd Dog","Cesky Terrier","Chesapeake Bay Retriever","Chihuahua","Chinese Crested","Chinese Shar-Pei","Chinook","Chow Chow","Cirneco dell’Etna","Clumber Spaniel","Cocker Spaniel","Collie","Coton de Tulear","Croatian Sheepdog","Curly-Coated Retriever","Czechoslovakian Vlciak","Dachshund","Dalmatian","Dandie Dinmont Terrier","Danish-Swedish Farmdog","Deutscher Wachtelhund","Doberman Pinscher","Dogo Argentino","Dogue de Bordeaux","Drentsche Patrijshond","Drever","Dutch Shepherd","English Cocker Spaniel","English Foxhound","English Setter","English Springer Spaniel","English Toy Spaniel","Entlebucher Mountain Dog","Estrela Mountain Dog","Eurasier","Field Spaniel","Finnish Lapphund","Finnish Spitz","Flat-Coated Retriever","French Bulldog","French Spaniel","German Longhaired Pointer","German Pinscher","German Shepherd Dog","German Shorthaired Pointer","German Spitz","German Wirehaired Pointer","Giant Schnauzer","Glen of Imaal Terrier","Golden Retriever","Gordon Setter","Grand Basset Griffon Vendéen","Great Dane","Great Pyrenees","Greater Swiss Mountain Dog","Greyhound","Hamiltonstovare","Hanoverian Scenthound","Harrier","Havanese","Hokkaido","Hovawart","Ibizan Hound","Icelandic Sheepdog","Irish Red and White Setter","Irish Setter","Irish Terrier","Irish Water Spaniel","Irish Wolfhound","Italian Greyhound","Jagdterrier","Japanese Akitainu","Japanese Chin","Japanese Spitz","Japanese Terrier","Kai Ken","Karelian Bear Dog","Keeshond","Kerry Blue Terrier","Kishu Ken","Komondor","Korean Jindo Dog","Kromfohrlander","Kuvasz","Labrador Retriever","Lagotto Romagnolo","Lakeland Terrier","Lancashire Heeler","Lapponian Herder","Large Munsterlander","Leonberger","Lhasa Apso","Löwchen","Maltese","Manchester Terrier (Standard)","Manchester Terrier (Toy)","Mastiff","Miniature American Shepherd","Miniature Bull Terrier","Miniature Pinscher","Miniature Schnauzer","Mountain Cur","Mudi","Neapolitan Mastiff","Nederlandse Kooikerhondje","Newfoundland","Norfolk Terrier","Norrbottenspets","Norwegian Buhund","Norwegian Elkhound","Norwegian Lundehund","Norwich Terrier","Nova Scotia Duck Tolling Retriever","Old English Sheepdog","Otterhound","Papillon","Parson Russell Terrier","Pekingese","Pembroke Welsh Corgi","Peruvian Inca Orchid","Petit Basset Griffon Vendéen","Pharaoh Hound","Plott Hound","Pointer","Polish Lowland Sheepdog","Pomeranian","Pont-Audemer Spaniel","Poodle (Miniature)","Poodle (Standard)","Poodle (Toy)","Porcelaine","Portuguese Podengo","Portuguese Podengo Pequeno","Portuguese Pointer","Portuguese Sheepdog","Portuguese Water Dog","Presa Canario","Pudelpointer","Pug","Puli","Pumi","Pyrenean Mastiff","Pyrenean Shepherd","Rafeiro do Alentejo","Rat Terrier","Redbone Coonhound","Rhodesian Ridgeback","Romanian Carpathian Shepherd","Romanian Mioritic Shepherd Dog","Rottweiler","Russell Terrier","Russian Toy","Russian Tsvetnaya Bolonka","Saint Bernard","Saluki","Samoyed","Schapendoes","Schipperke","Scottish Deerhound","Scottish Terrier","Sealyham Terrier","Segugio Italiano","Shetland Sheepdog","Shiba Inu","Shih Tzu","Shikoku","Siberian Husky","Silky Terrier","Skye Terrier","Sloughi","Slovakian Wirehaired Pointer","Slovensky Cuvac","Slovensky Kopov","Small Munsterlander","Smooth Fox Terrier","Soft Coated Wheaten Terrier","Spanish Mastiff","Spanish Water Dog","Spinone Italiano","Stabyhoun","Staffordshire Bull Terrier","Standard Schnauzer","Sussex Spaniel","Swedish Lapphund","Swedish Vallhund","Taiwan Dog","Teddy Roosevelt Terrier","Thai Bangkaew","Thai Ridgeback","Tibetan Mastiff","Tibetan Spaniel","Tibetan Terrier","Tornjak","Tosa","Toy Fox Terrier","Transylvanian Hound","Treeing Tennessee Brindle","Treeing Walker Coonhound","Vizsla","Volpino Italiano","Weimaraner","Welsh Springer Spaniel","Welsh Terrier","West Highland White Terrier","Wetterhoun","Whippet","Wire Fox Terrier","Wirehaired Pointing Griffon","Wirehaired Vizsla","Working Kelpie","Xoloitzcuintli","Yakutian Laika","Yorkshire Terrier"];

  /* Stato */
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

  /* Avvio protetto */
  document.addEventListener('DOMContentLoaded', () => { try { init(); } catch (err) { window.dispatchEvent(new ErrorEvent('error',{message:String(err)})); } });

  async function init(){
    wireBasicNav();
    wireSheetsAndDialogs();
    wireFilterPanel();
    await loadBreeds();
    prepareLocalProfiles();
    renderNearGrid();
    wireTabs();
    wireDecks();   // <-- contiene FIX swipe solo orizzontale
    wireGeoBar();
    setupPhotoViewer();
    wireMatchOverlay();
    wireChat();    // <-- contiene FIX invio messaggi
  }

  /* NAV */
  function wireBasicNav(){
    $('#openPrivacy')?.addEventListener('click', ()=> $('#privacyDlg')?.showModal?.());
    $('#openTerms')?.addEventListener('click', ()=> $('#termsDlg')?.showModal?.());
  }
  window.goHome=()=>{$('#landing')?.classList.remove('active');$('#app')?.classList.add('active');};

  /* Dialog ricompensa (compatibile WebView) */
  let pendingRewardHook=null;
  function makeFallbackReward(message, after){
    const id='__reward_fallback';
    if ($('#'+id)) return;
    const wrap=document.createElement('div');
    wrap.id=id;
    wrap.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.7);display:flex;align-items:center;justify-content:center;z-index:12000';
    wrap.innerHTML=`
      <div style="background:#121735;color:#fff;padding:16px;border-radius:14px;max-width:92vw">
        <h3 style="margin:0 0 8px 0">Guarda un breve video per continuare</h3>
        <p class="muted" style="opacity:.85;margin:0 0 10px 0">${message||'Attendi…'}</p>
        <div style="display:flex;gap:10px;justify-content:flex-end">
          <button id="rwCancel" class="btn light" style="padding:8px 12px;border-radius:10px;background:#2a3058;color:#fff;border:0">Annulla</button>
          <button id="rwPlay" class="btn primary" style="padding:8px 12px;border-radius:10px;background:#6f8bff;color:#0b0b3a;border:0">Guarda video</button>
        </div>
      </div>`;
    document.body.appendChild(wrap);
    $('#rwCancel',wrap).onclick=()=>wrap.remove();
    $('#rwPlay',wrap).onclick=async ()=>{
      $('#rwPlay',wrap).disabled=true; $('#rwPlay',wrap).textContent='Video…';
      await sleep(3000);
      wrap.remove();
      after && after();
    };
  }
  function openRewardDialog(message,after){
    const dlg=$('#adReward');
    pendingRewardHook=after||null;
    if (dlg && dlg.showModal) {
      const h3=dlg.querySelector('h3'); if(h3) h3.textContent=message||'Guarda il video per continuare';
      dlg.showModal();
    } else {
      makeFallbackReward(message, after);
    }
  }
  $('#rewardPlay')?.addEventListener('click', async ()=>{
    const btn=$('#rewardPlay'); if(!btn) return;
    btn.disabled=true; btn.textContent='Video…';
    await sleep(3000);
    btn.disabled=false; btn.textContent='Guarda video';
    $('#adReward')?.close?.();
    if(pendingRewardHook){ const f=pendingRewardHook; pendingRewardHook=null; f(); }
  });

  /* FILTRI + autocomplete */
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

  /* TABS */
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

  /* BREEDS */
  async function loadBreeds(){
    try{
      const r=await fetch('breeds.json',{cache:'no-store'});
      if(!r.ok) throw 0;
      const arr=await r.json();
      state.breeds=Array.isArray(arr)&&arr.length?arr:FALLBACK_BREEDS;
    }catch{ state.breeds=FALLBACK_BREEDS; }
  }

  /* PROFILES mock */
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

  /* VICINO */
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
      $('img',card)?.addEventListener('click',e=>{e.stopPropagation(); openProfilePage(p);});
      card.addEventListener('click',()=>openProfilePage(p));
      grid.appendChild(card);
    });
    $('#emptyNear')?.classList.toggle('hidden',list.length>0);
  }

  /* DECKS (con FIX swipe solo orizzontale) */
  function wireDecks(){
    // blocca lo scroll verticale durante il gesto
    $('#loveCard') && ($('#loveCard').style.touchAction='pan-x');
    $('#socCard')  && ($('#socCard').style.touchAction='pan-x');

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
    let startX=0, startY=0, locked=false;
    card.addEventListener('touchstart', e => {
      const t=e.touches[0]; startX=t.clientX; startY=t.clientY; locked=false;
    }, { passive:true });

    card.addEventListener('touchmove', e => {
      // blocco verticale se il movimento è principalmente orizzontale
      const t=e.touches[0];
      const dx=Math.abs(t.clientX-startX);
      const dy=Math.abs(t.clientY-startY);
      if (!locked && dx>10 && dx>dy) { locked=true; }
      if (locked) { e.preventDefault(); } // <-- impedisce salti su/giù
    }, { passive:false });

    card.addEventListener('touchend',   e => {
      const d = e.changedTouches[0].clientX - startX;
      if (Math.abs(d) > 40) h(d);
    });
  }

  function currentCard(kind){ const i=kind==='love'?state.deckIdxLove:state.deckIdxSoc; return state.profiles[i%state.profiles.length]; }
  function renderLove(){ renderCardInto(currentCard('love'),'love'); }
  function renderSocial(){ renderCardInto(currentCard('social'),'soc'); }
  function renderCardInto(p,pre){
    $('#'+pre+'Img') && ($('#'+pre+'Img').src=p.img);
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

  /* Milestones swipe -> reward (10 poi ogni +5) */
  function swipeOccurred(){
    state.swipeCount++;
    if(state.swipeCount===10 || (state.swipeCount>10 && (state.swipeCount-10)%5===0)){
      openRewardDialog('Guarda il video per altri like', ()=>{ /* sblocco demo */ });
    }
  }
  async function likeFromSwipe(p){ swipeOccurred(); await like(p); }

  /* MATCH */
  function maybeTheyLikedToo(){ return Math.random()<0.35; }
  async function like(p){
    const first=!state.likedIds.has(p.id);
    state.likedIds.add(p.id);
    if(first && maybeTheyLikedToo()){
      state.matchedIds.add(p.id);
      await simulateAutoVideo();
      showMatchToast(p);
      renderMatches();
    } else { renderMatches(); }
  }
  function renderMatches(){
    const host=$('#matchList'); if(!host) return;
    const list=state.profiles.filter(p=>state.matchedIds.has(p.id));
    host.innerHTML='';
    list.forEach(p=>{
      const item=document.createElement('div');
      item.className='item';
      item.innerHTML=`<img src="${p.img}" alt="${p.name}"><div><div><strong>${p.name}</strong> · ${p.breed}</div><div class="small muted">${p.distanceKm} km</div></div><button class="btn pill primary" style="margin-left:auto">Scrivi</button>`;
      $('button',item)?.addEventListener('click',()=>openChat(p));
      host.appendChild(item);
    });
    if ($('#emptyMatch')) $('#emptyMatch').style.display=list.length?'none':'block';
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

  /* GEO bar */
  function wireGeoBar(){
    const bar=$('#geoBar'); const enable=$('#enableGeo'); const dismiss=$('#dismissGeo');
    bar?.classList.remove('hidden');
    enable?.addEventListener('click',()=>{ if(!navigator.geolocation){bar.classList.add('hidden');return;} navigator.geolocation.getCurrentPosition(()=>bar.classList.add('hidden'),()=>bar.classList.add('hidden')); });
    dismiss?.addEventListener('click',()=>bar.classList.add('hidden'));
  }

  /* PROFILO + DOCUMENTI */
  function openProfilePage(p){
    const head=$('.pp-head');
    if(head){
      head.innerHTML = `
        <div class="row gap">
          <img src="plutoo-icon-192.png" alt="Plutoo" class="brand" style="width:28px;height:28px;border-radius:6px">
          <strong id="ppTitle">${p.name}</strong>
        </div>
        <button id="ppClose" class="btn light small">Chiudi</button>`;
      $('#ppClose')?.addEventListener('click', ()=>$('#profilePage')?.classList.remove('show'));
    }
    setText('#ppTitle', p.name);
    renderProfile(p);
    $('#profilePage')?.classList.add('show');
  }
  window.closeProfilePage=()=>$('#profilePage')?.classList.remove('show');

  function selfieKey(p){return`selfie-unlock-${p.id}`;}
  function isSelfieUnlocked(p){const ts=Number(storage.getItem(selfieKey(p))||0);return ts&&(now()-ts)<H24;}
  function setSelfieUnlocked(p){storage.setItem(selfieKey(p),String(now()));}
  function isMatched(p){return state.matchedIds.has(p.id);}

  const ownerKey = (p)=>`docs-owner-struct-${p.id}`;
  const dogKey   = (p)=>`docs-dog-struct-${p.id}`;
  function readJSON(key, fallback){ try{ return JSON.parse(storage.getItem(key) || JSON.stringify(fallback)); }catch{ return fallback; } }
  function writeJSON(key,obj){ storage.setItem(key, JSON.stringify(obj||{})); }
  function readVerified(id){ return storage.getItem(`verified-${id}`)==='1'; }
  function writeVerified(id,val){ storage.setItem(`verified-${id}`, val?'1':'0'); }
  async function fileToDataUrl(f){ return new Promise((res,rej)=>{ const r=new FileReader(); r.onload=()=>res(r.result); r.onerror=rej; r.readAsDataURL(f); }); }

  function renderProfile(p){
    const body=$('#ppBody'); if(!body) return;
    const unlocked=isSelfieUnlocked(p)||isMatched(p);

    const owner = readJSON(ownerKey(p), {type:'carta_identita', front:'', back:''});
    const dog   = readJSON(dogKey(p),   {microchip:'', vaccines:[], attachments:[]});

    const verified = (owner.front && owner.back && dog.microchip && dog.vaccines.length>0) || readVerified(p.id);
    if (verified){ p.verified=true; writeVerified(p.id,true); }

    body.innerHTML=`
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

              <label>Fronte <input id="ownerFront" type="file" accept="image/*"></label>
              <label>Retro  <input id="ownerBack"  type="file" accept="image/*"></label>
            </div>

            <div class="doc-previews" id="ownerPrev"></div>
          </div>

          <div class="doc-item">
            <h5>Documenti cane</h5>

            <div class="doc-form">
              <label class="full">Numero microchip <input id="dogChip" class="inp" placeholder="es. 3802600XXXXXXXX" maxlength="20"></label>

              <label>Vaccino
                <select id="vacName">
                  <option value="Antirabbica">Antirabbica</option>
                  <option value="Polivalente/Esavalente">Polivalente/Esavalente</option>
                  <option value="Leishmania">Leishmania</option>
                  <option value="Echinococco">Echinococco</option>
                  <option value="Altro">Altro</option>
                </select>
              </label>
              <label>Data <input id="vacDate" type="date"></label>
              <div class="full kv">
                <input id="vacOther" class="inp" placeholder="Se Altro, specifica il nome" />
                <button id="vacAdd" class="btn light small">Aggiungi vaccino</button>
              </div>
            </div>

            <div id="vacList" class="doc-previews"></div>

            <div class="doc-form">
              <label class="full">Allegati (libretto, certificati)
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
    if(selfieEl){ selfieEl.addEventListener('click',()=>{
      if(unlocked){ openPhotoViewer(p,selfieEl.getAttribute('src')); }
      else{ openRewardDialog('Guarda il video per vedere il selfie',()=>{ setSelfieUnlocked(p); renderProfile(p); }); }
    });}
    $('#unlockBtn')?.addEventListener('click',()=>{ openRewardDialog('Guarda il video per vedere il selfie',()=>{ setSelfieUnlocked(p); renderProfile(p); }); });

    $('#ownerType') && ($('#ownerType').value = owner.type || 'carta_identita');
    $('#ownerType')?.addEventListener('change', e=>{ owner.type = e.target.value; writeJSON(ownerKey(p), owner); });
    $('#ownerFront')?.addEventListener('change', async e=>{ const f=e.target.files?.[0]; if(!f) return; owner.front = await fileToDataUrl(f); writeJSON(ownerKey(p), owner); renderProfile(p); });
    $('#ownerBack') ?.addEventListener('change', async e=>{ const f=e.target.files?.[0]; if(!f) return; owner.back  = await fileToDataUrl(f); writeJSON(ownerKey(p), owner); renderProfile(p); });

    const ownerPrev=$('#ownerPrev'); ownerPrev && (ownerPrev.innerHTML='');
    if(owner.front){ const im=document.createElement('img'); im.className='doc-thumb'; im.src=owner.front; im.title='Fronte'; im.addEventListener('click',()=>openPhotoViewer(p,owner.front)); ownerPrev?.appendChild(im); }
    if(owner.back){  const im=document.createElement('img'); im.className='doc-thumb'; im.src=owner.back;  im.title='Retro';  im.addEventListener('click',()=>openPhotoViewer(p,owner.back));  ownerPrev?.appendChild(im); }

    const chipEl=$('#dogChip');
    if (chipEl){ chipEl.value = dog.microchip || ''; chipEl.addEventListener('input', e=>{ dog.microchip = e.target.value.trim(); writeJSON(dogKey(p), dog); checkAndVerify(p); }); }

    const vacName=$('#vacName'), vacDate=$('#vacDate'), vacOther=$('#vacOther'), vacAdd=$('#vacAdd'), vacList=$('#vacList');
    const repaintVaccines=()=>{
      if(!vacList) return;
      vacList.innerHTML='';
      (dog.vaccines||[]).forEach((v,idx)=>{
        const tag=document.createElement('span');
        tag.className='tag';
        tag.innerHTML=`${v.name} · ${v.date}<span class="x" title="Rimuovi">✕</span>`;
        tag.querySelector('.x')?.addEventListener('click', ()=>{
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
        const t=(vacOther?.value||'').trim(); if(!t) return; name = t;
      }
      const date=(vacDate?.value||'').trim();
      if(!name || !date) return;
      dog.vaccines.push({name, date});
      writeJSON(dogKey(p), dog);
      if (vacOther) vacOther.value=''; if (vacDate) vacDate.value='';
      repaintVaccines(); checkAndVerify(p);
    });

    $('#dogAttach')?.addEventListener('change', async e=>{
      const files=[...e.target.files];
      for(const f of files){ const url=await fileToDataUrl(f); dog.attachments.push(url); }
      writeJSON(dogKey(p), dog);
      renderProfile(p);
    });

    const dogPrev=$('#dogPrev'); dogPrev && (dogPrev.innerHTML='');
    (dog.attachments||[]).forEach((src)=>{
      const im=document.createElement('img');
      im.className='doc-thumb'; im.src=src; im.title='Allegato';
      im.addEventListener('click',()=>openPhotoViewer(p,src));
      dogPrev?.appendChild(im);
    });

    $('[data-chat]',body)?.addEventListener('click',()=>openChat(p));
    $('[data-invite]',body)?.addEventListener('click',()=>alert('Invito inviato!'));

    checkAndVerify(p);
  }

  function checkAndVerify(p){
    const owner = readJSON(ownerKey(p), {type:'carta_identita', front:'', back:''});
    const dog   = readJSON(dogKey(p),   {microchip:'', vaccines:[], attachments:[]});
    const ok = !!(owner.front && owner.back && dog.microchip && (dog.vaccines||[]).length>0);
    if(ok && !readVerified(p.id)){
      writeVerified(p.id,true);
      p.verified=true;
      renderProfile(p);
      renderNearGrid();
    }
  }

  /* VIEWER */
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
  function openPhotoViewer(p,src){ state.viewerProfile=p; const v=$('#photoViewer'); const im=$('#viewerImg'); if(im) im.src=src||p.img; if(v) v.style.display='flex'; }
  function closePhotoViewer(){ const v=$('#photoViewer'); if(v) v.style.display='none'; state.viewerProfile=null; }

  /* CHAT: FIX invio (bottone + Invio) e apertura sicura */
  let currentChatProfile=null;
  function wireChat(){
    const send = async ()=>{
      const p=currentChatProfile; if(!p) return;
      const input=$('#chatInput'); if(!input) return;
      const txt=(input.value||'').trim(); if(!txt) return;
      const first=!state.firstMessageSentTo.has(p.id);
      if(first){ await simulateAutoVideo(); state.firstMessageSentTo.add(p.id); }
      addBubble(txt,true); input.value='';
    };
    $('#sendBtn')?.addEventListener('click', send);
    $('#chatInput')?.addEventListener('keydown', (e)=>{ if(e.key==='Enter'){ e.preventDefault(); send(); }});
  }
  function openChat(p){
    currentChatProfile=p;
    setText('#chatName', p.name);
    const av=$('#chatAvatar'); if(av) av.src=p.img;
    const th=$('#thread'); if(th) th.innerHTML='';
    addBubble('Ciao! 🐾',false);
    $('#chat')?.classList.add('show');
  }
  function addBubble(t,me){
    const host=$('#thread'); if(!host) return;
    const b=document.createElement('div');
    b.className='bubble'+(me?' me':'');
    b.textContent=t;
    host.appendChild(b);
    host.scrollTop=1e6;
  }

  /* Video automatici (demo) */
  async function simulateAutoVideo(){ await sleep(3000); }

  /* Verified helpers */
  function readVerified(id){ return storage.getItem(`verified-${id}`)==='1'; }
})();
