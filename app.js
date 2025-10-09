/* =========================================================================
   PLUTOO – app.js (versione completa)
   - Safety Kit anti-crash
   - Overlay errori JS
   - Overlay Reward (finto video) + gating monetizzazione
   - Tabs / Grid “Vicino a te”
   - Deck swipe (solo orizzontale) + contatore swipe + match
   - Profilo con selfie sbloccabile, galleria e documenti strutturati
   - Chat autogenerata; primo invio gated da reward
   - Autocomplete Razze (startsWith) con fallback
   - Tutto “defensivo”: se un nodo manca non esplode
   ======================================================================= */

/* ---------- SAFETY KIT ---------- */
(function(){
  if (typeof window.setText !== 'function') {
    window.setText = function(sel, text, root=document){
      try{ const el=root.querySelector(sel); if(el) el.textContent = (text ?? ''); }catch(e){}
    };
  }
  if (typeof window.setHTML !== 'function') {
    window.setHTML = function(sel, html, root=document){
      try{ const el=root.querySelector(sel); if(el) el.innerHTML = (html ?? ''); }catch(e){}
    };
  }
  if (typeof window.onReady !== 'function') {
    window.onReady = function(fn){
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn, {once:true});
      else fn();
    };
  }
  if (typeof window.storage === 'undefined') {
    try{
      localStorage.setItem('__t','1'); localStorage.removeItem('__t');
      window.storage = localStorage;
    }catch{ window.storage = {getItem:()=>null,setItem:()=>{},removeItem:()=>{}}; }
  }
})();

/* ---------- OVERLAY ERRORI JAVASCRIPT ---------- */
(function(){
  function showCrashOverlay(msg, file, line, col){
    try{
      if (document.getElementById('__plutoo_crash')) return;
      const box=document.createElement('div');
      box.id='__plutoo_crash';
      box.style.cssText='position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.88);color:#fff;display:flex;align-items:center;justify-content:center;padding:18px';
      box.innerHTML=`
        <div style="max-width:680px;font-family:system-ui,Arial,sans-serif">
          <div style="font-weight:800;font-size:18px;margin-bottom:8px">⚠️ Errore JavaScript</div>
          <div style="white-space:pre-wrap;font-size:14px;line-height:1.35;background:#1a1f43;padding:12px;border-radius:10px;border:1px solid rgba(255,255,255,.2)">
            ${String(msg||'Unknown error')}
            ${file?`\n@ ${file}${line?':'+line:''}${col?':'+col:''}`:''}
          </div>
          <div style="margin-top:10px;display:flex;gap:10px;flex-wrap:wrap">
            <button id="crashReload" style="background:#7d5dfc;color:#fff;padding:8px 12px;border-radius:10px">Ricarica</button>
            <button id="crashCopy" style="background:#22283d;color:#e9ecff;padding:8px 12px;border-radius:10px">Copia errore</button>
          </div>
        </div>`;
      document.body.appendChild(box);
      document.getElementById('crashReload').onclick=()=>location.reload();
      document.getElementById('crashCopy').onclick=async()=>{
        try{ await navigator.clipboard.writeText(box.innerText.trim()); alert('Errore copiato.'); }
        catch{ alert('Copia non disponibile.'); }
      };
    }catch{}
  }
  window.addEventListener('error', e=> showCrashOverlay(e.error?.message||e.message, e.filename, e.lineno, e.colno));
  window.addEventListener('unhandledrejection', e=>{
    const r=e.reason; const msg=(r&&(r.message||r.toString()))||'Unhandled rejection'; showCrashOverlay(msg);
  });
})();

/* ---------- UTILS ---------- */
const $  = (sel, root=document)=> root.querySelector(sel);
const $$ = (sel, root=document)=> [...root.querySelectorAll(sel)];
const sleep = (ms)=> new Promise(r=>setTimeout(r,ms));
const now = ()=> Date.now();
const H24 = 24*60*60*1000;

/* ---------- RAZZE (fallback completo) ---------- */
const FALLBACK_BREEDS = ["Affenpinscher","Afghan Hound","Airedale Terrier","Akita","Alaskan Klee Kai","Alaskan Malamute","American Bulldog","American English Coonhound","American Eskimo Dog","American Foxhound","American Hairless Terrier","American Leopard Hound","American Staffordshire Terrier","American Water Spaniel","Anatolian Shepherd Dog","Appenzeller Sennenhund","Australian Cattle Dog","Australian Kelpie","Australian Shepherd","Australian Stumpy Tail Cattle Dog","Australian Terrier","Azawakh","Barbado da Terceira","Barbet","Basenji","Basset Fauve de Bretagne","Basset Hound","Bavarian Mountain Scent Hound","Beagle","Bearded Collie","Beauceron","Bedlington Terrier","Belgian Laekenois","Belgian Malinois","Belgian Sheepdog","Belgian Tervuren","Bergamasco Sheepdog","Berger Picard","Bernese Mountain Dog","Bichon Frise","Biewer Terrier","Black and Tan Coonhound","Black Russian Terrier","Bloodhound","Blue Picardy Spaniel","Bluetick Coonhound","Boerboel","Bohemian Shepherd","Bolognese","Border Collie","Border Terrier","Borzoi","Boston Terrier","Bouvier des Ardennes","Bouvier des Flandres","Boxer","Boykin Spaniel","Bracco Italiano","Braque du Bourbonnais","Braque Francais Pyrenean","Braque Saint-Germain","Brazilian Terrier","Briard","Brittany","Broholmer","Brussels Griffon","Bull Terrier","Bulldog","Bullmastiff","Cairn Terrier","Calupoh","Canaan Dog","Canadian Eskimo Dog","Cane Corso","Cardigan Welsh Corgi","Carolina Dog","Catahoula Leopard Dog","Caucasian Shepherd Dog","Cavalier King Charles Spaniel","Central Asian Shepherd Dog","Cesky Terrier","Chesapeake Bay Retriever","Chihuahua","Chinese Crested","Chinese Shar-Pei","Chinook","Chow Chow","Cirneco dell’Etna","Clumber Spaniel","Cocker Spaniel","Collie","Coton de Tulear","Croatian Sheepdog","Curly-Coated Retriever","Czechoslovakian Vlciak","Dachshund","Dalmatian","Dandie Dinmont Terrier","Danish-Swedish Farmdog","Deutscher Wachtelhund","Doberman Pinscher","Dogo Argentino","Dogue de Bordeaux","Drentsche Patrijshond","Drever","Dutch Shepherd","English Cocker Spaniel","English Foxhound","English Setter","English Springer Spaniel","English Toy Spaniel","Entlebucher Mountain Dog","Estrela Mountain Dog","Eurasier","Field Spaniel","Finnish Lapphund","Finnish Spitz","Flat-Coated Retriever","French Bulldog","French Spaniel","German Longhaired Pointer","German Pinscher","German Shepherd Dog","German Shorthaired Pointer","German Spitz","German Wirehaired Pointer","Giant Schnauzer","Glen of Imaal Terrier","Golden Retriever","Gordon Setter","Grand Basset Griffon Vendéen","Great Dane","Great Pyrenees","Greater Swiss Mountain Dog","Greyhound","Hamiltonstovare","Hanoverian Scenthound","Harrier","Havanese","Hokkaido","Hovawart","Ibizan Hound","Icelandic Sheepdog","Irish Red and White Setter","Irish Setter","Irish Terrier","Irish Water Spaniel","Irish Wolfhound","Italian Greyhound","Jagdterrier","Japanese Akitainu","Japanese Chin","Japanese Spitz","Japanese Terrier","Kai Ken","Karelian Bear Dog","Keeshond","Kerry Blue Terrier","Kishu Ken","Komondor","Korean Jindo Dog","Kromfohrlander","Kuvasz","Labrador Retriever","Lagotto Romagnolo","Lakeland Terrier","Lancashire Heeler","Lapponian Herder","Large Munsterlander","Leonberger","Lhasa Apso","Löwchen","Maltese","Manchester Terrier (Standard)","Manchester Terrier (Toy)","Mastiff","Miniature American Shepherd","Miniature Bull Terrier","Miniature Pinscher","Miniature Schnauzer","Mountain Cur","Mudi","Neapolitan Mastiff","Nederlandse Kooikerhondje","Newfoundland","Norfolk Terrier","Norrbottenspets","Norwegian Buhund","Norwegian Elkhound","Norwegian Lundehund","Norwich Terrier","Nova Scotia Duck Tolling Retriever","Old English Sheepdog","Otterhound","Papillon","Parson Russell Terrier","Pekingese","Pembroke Welsh Corgi","Peruvian Inca Orchid","Petit Basset Griffon Vendéen","Pharaoh Hound","Plott Hound","Pointer","Polish Lowland Sheepdog","Pomeranian","Pont-Audemer Spaniel","Poodle (Miniature)","Poodle (Standard)","Poodle (Toy)","Porcelaine","Portuguese Podengo","Portuguese Podengo Pequeno","Portuguese Pointer","Portuguese Sheepdog","Portuguese Water Dog","Presa Canario","Pudelpointer","Pug","Puli","Pumi","Pyrenean Mastiff","Pyrenean Shepherd","Rafeiro do Alentejo","Rat Terrier","Redbone Coonhound","Rhodesian Ridgeback","Romanian Carpathian Shepherd","Romanian Mioritic Shepherd Dog","Rottweiler","Russell Terrier","Russian Toy","Russian Tsvetnaya Bolonka","Saint Bernard","Saluki","Samoyed","Schapendoes","Schipperke","Scottish Deerhound","Scottish Terrier","Sealyham Terrier","Segugio Italiano","Shetland Sheepdog","Shiba Inu","Shih Tzu","Shikoku","Siberian Husky","Silky Terrier","Skye Terrier","Sloughi","Slovakian Wirehaired Pointer","Slovensky Cuvac","Slovensky Kopov","Small Munsterlander","Smooth Fox Terrier","Soft Coated Wheaten Terrier","Spanish Mastiff","Spanish Water Dog","Spinone Italiano","Stabyhoun","Staffordshire Bull Terrier","Standard Schnauzer","Sussex Spaniel","Swedish Lapphund","Swedish Vallhund","Taiwan Dog","Teddy Roosevelt Terrier","Thai Bangkaew","Thai Ridgeback","Tibetan Mastiff","Tibetan Spaniel","Tibetan Terrier","Tornjak","Tosa","Toy Fox Terrier","Transylvanian Hound","Treeing Tennessee Brindle","Treeing Walker Coonhound","Vizsla","Volpino Italiano","Weimaraner","Welsh Springer Spaniel","Welsh Terrier","West Highland White Terrier","Wetterhoun","Whippet","Wire Fox Terrier","Wirehaired Pointing Griffon","Wirehaired Vizsla","Working Kelpie","Xoloitzcuintli","Yakutian Laika","Yorkshire Terrier"];

/* ---------- STATO ---------- */
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
  breeds:[],
  plus: (storage.getItem('plutoo_plus')==='1') // abbonamento: no ads
};

/* ---------- BOOT ---------- */
onReady(()=>{ try{ init(); }catch(err){ const ev=new ErrorEvent('error',{message:err?.message||String(err)}); window.dispatchEvent(ev);} });

async function init(){
  ensureRewardUI();
  ensureChatUI();
  wireTabs();
  wireFilterPanel();
  await loadBreeds();
  prepareLocalProfiles();
  renderNearGrid();
  wireDecks();
  wireGeoBar();
}

/* ---------- REWARD / MONETIZZAZIONE ---------- */
function ensureRewardUI(){
  if ($('#adReward')) return;
  const dlg=document.createElement('dialog');
  dlg.id='adReward';
  dlg.style.cssText='max-width:520px;border:none;border-radius:16px;background:#121735;color:#e9ecff;padding:18px';
  dlg.innerHTML=`
    <h3 style="margin:0 0 8px 0;font:600 18px system-ui">Guarda il video per continuare</h3>
    <p class="small" style="opacity:.85;margin:0 0 12px 0">Questo supporta Plutoo ❤</p>
    <div style="display:flex;gap:8px;justify-content:flex-end">
      <button id="rewardCancel" class="btn light">Annulla</button>
      <button id="rewardPlay" class="btn primary">Guarda video</button>
    </div>`;
  document.body.appendChild(dlg);
  $('#rewardCancel',dlg).onclick=()=>dlg.close('cancel');
  $('#rewardPlay',dlg).onclick=async()=>{
    const b=$('#rewardPlay',dlg); b.disabled=true; b.textContent='Video…';
    await sleep(3000); // simulazione
    b.disabled=false; b.textContent='Guarda video';
    dlg.close('ok');
  };
}

function openRewardDialog(message, after){
  if (state.plus) { after?.(); return; } // PLUS: niente pubblicità
  ensureRewardUI();
  const dlg=$('#adReward');
  const h3=dlg.querySelector('h3'); if(h3) h3.textContent=message||'Guarda il video per continuare';
  dlg.addEventListener('close', function handler(){
    dlg.removeEventListener('close', handler);
    if (dlg.returnValue==='ok') after?.();
  });
  dlg.showModal();
}
// la rendo globale per evitare “is not defined”
window.openRewardDialog = openRewardDialog;

/* ---------- FILTRI + AUTOCOMPLETE RAZZE ---------- */
function wireFilterPanel(){
  const toggle=$('#filterToggle'); const panel=$('#filterPanel');
  toggle?.addEventListener('click',()=>{
    const hidden=panel?.hasAttribute('hidden');
    if(!panel) return;
    if(hidden){ panel.removeAttribute('hidden'); toggle.textContent='Ricerca personalizzata ▲'; }
    else{ panel.setAttribute('hidden',''); toggle.textContent='Ricerca personalizzata ▾'; }
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
    const box=document.createElement('div'); box.className='suggest hidden'; (inp.parentElement||document.body).appendChild(box);

    inp.addEventListener('input', ()=>{
      const q=(inp.value||'').trim().toLowerCase(); state.filters.breed=inp.value.trim();
      if(!q){ closeSuggest(); return; }
      const list=(state.breeds||[]).filter(b=>b.toLowerCase().startsWith(q)).sort((a,b)=>a.localeCompare(b,'it'));
      renderSuggest(box, list.slice(0,60), val=>{ inp.value=val; state.filters.breed=val; closeSuggest(); });
    });
    document.addEventListener('click',(e)=>{ if(!box.contains(e.target) && e.target!==inp) closeSuggest(); });

    function renderSuggest(box, items, onPick){
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

async function loadBreeds(){
  try{
    const r=await fetch('breeds.json',{cache:'no-store'});
    if(!r.ok) throw 0;
    const arr=await r.json();
    state.breeds=Array.isArray(arr)&&arr.length?arr:FALLBACK_BREEDS;
  }catch{ state.breeds=FALLBACK_BREEDS; }
}

/* ---------- PROFILES (mock locali) ---------- */
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
    distanceKm:((i+1)*1.1).toFixed(1),
    verified: readVerified(i+1)
  }));
}

/* ---------- TABS ---------- */
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

/* ---------- GRID “VICINO A TE” ---------- */
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
  $('#emptyNear')?.classList.toggle('hidden', list.length>0);
}

/* ---------- DECK SWIPE (solo orizzontale) ---------- */
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
function bindSwipe(card, handler){
  if(!card) return;
  let startX=0, dx=0;
  const reset=()=>{ card.style.transition='transform .18s ease'; card.style.transform='translateX(0) rotate(0deg)'; setTimeout(()=>card.style.transition='',180); };
  card.addEventListener('touchstart', e=>{
    startX=e.touches[0].clientX; dx=0; card.style.transition='none';
  },{passive:true});
  card.addEventListener('touchmove', e=>{
    dx=e.touches[0].clientX-startX;
    card.style.transform=`translateX(${dx}px) rotate(${dx/20}deg)`; // solo X
  },{passive:true});
  card.addEventListener('touchend', ()=>{
    const threshold=60;
    if(Math.abs(dx)>threshold){
      const dir=dx>0?1:-1;
      card.style.transition='transform .18s ease';
      card.style.transform=`translateX(${dir*220}px) rotate(${dir*12}deg)`;
      setTimeout(()=>{ reset(); handler(dir*100); },180);
    }else reset();
  });
}
function currentCard(kind){ const i=kind==='love'?state.deckIdxLove:state.deckIdxSoc; return state.profiles[i%state.profiles.length]; }
function renderLove(){ const p=currentCard('love'); setCard('love',p); }
function renderSocial(){ const p=currentCard('social'); setCard('soc',p); }
function setCard(prefix,p){
  const img=$(`#${prefix}Img`), t=$(`#${prefix}Title`), m=$(`#${prefix}Meta`), b=$(`#${prefix}Bio`);
  if(img) img.src=p.img;
  setText(`#${prefix}Title`, p.name);
  setText(`#${prefix}Meta`, `${p.breed} · ${p.distanceKm} km`);
  setText(`#${prefix}Bio`, `${p.name} ha ${p.age} anni, ${p.sex==='M'?'maschio':'femmina'}, taglia ${p.size.toLowerCase()}, pelo ${p.coat.toLowerCase()}, energia ${p.energy.toLowerCase()}.`);
}
async function likeDeck(kind){ swipeOccurred(); await like(currentCard(kind)); advance(kind); if(kind==='love') renderLove(); else renderSocial(); }
async function skipDeck(kind){ swipeOccurred(); advance(kind); if(kind==='love') renderLove(); else renderSocial(); }
function advance(kind){ if(kind==='love') state.deckIdxLove++; else state.deckIdxSoc++; }

/* ---------- SWIPE COUNTER + AD GATE ---------- */
function swipeOccurred(){
  state.swipeCount++;
  if(state.swipeCount===10 || (state.swipeCount>10 && (state.swipeCount-10)%5===0)){
    openRewardDialog('Guarda il video per altri like', ()=>{ /* sblocco */ });
  }
}

/* ---------- MATCH & LIKE ---------- */
function maybeTheyLikedToo(){ return Math.random()<0.35; }
async function like(p){
  const first=!state.likedIds.has(p.id);
  state.likedIds.add(p.id);
  if(first && maybeTheyLikedToo()){
    state.matchedIds.add(p.id);
    showMatchOverlay();
    renderMatches();
  }else{
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
function showMatchOverlay(){
  let ov=$('#matchOverlay');
  if(!ov){
    ov=document.createElement('div');
    ov.id='matchOverlay';
    ov.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;z-index:1200;color:#fff;';
    ov.innerHTML=`<div style="background:#121735;padding:16px 18px;border-radius:16px;text-align:center;"><div style="font-size:52px">💋</div><div style="font-weight:800;margin-top:8px">È un match!</div></div>`;
    document.body.appendChild(ov);
  }else ov.style.display='flex';
  setTimeout(()=>{ if(ov) ov.style.display='none'; }, 1600);
}

/* ---------- GEO BAR (facoltativa) ---------- */
function wireGeoBar(){
  const bar=$('#geoBar'); const enable=$('#enableGeo'); const dismiss=$('#dismissGeo');
  bar?.classList.remove('hidden');
  enable?.addEventListener('click',()=>{
    if(!navigator.geolocation){ bar?.classList.add('hidden'); return; }
    navigator.geolocation.getCurrentPosition(()=>bar?.classList.add('hidden'),()=>bar?.classList.add('hidden'));
  });
  dismiss?.addEventListener('click',()=>bar?.classList.add('hidden'));
}

/* ---------- PROFILO + DOCUMENTI + SELFIE GATE ---------- */
function selfieKey(p){return`selfie-unlock-${p.id}`;}
function isSelfieUnlocked(p){const ts=Number(storage.getItem(selfieKey(p))||0);return ts&&(now()-ts)<H24;}
function setSelfieUnlocked(p){storage.setItem(selfieKey(p),String(now()));}
function isMatched(p){return state.matchedIds.has(p.id);}
const ownerKey = (p)=>`docs-owner-struct-${p.id}`; // {type, front, back}
const dogKey   = (p)=>`docs-dog-struct-${p.id}`;   // {microchip, vaccines:[], attachments:[]}
function readJSON(key, fallback){ try{ return JSON.parse(storage.getItem(key) || JSON.stringify(fallback)); }catch{ return fallback; } }
function writeJSON(key,obj){ storage.setItem(key, JSON.stringify(obj||{})); }
function readVerified(id){ return storage.getItem(`verified-${id}`)==='1'; }
function writeVerified(id,val){ storage.setItem(`verified-${id}`, val?'1':'0'); }
async function fileToDataUrl(f){ return new Promise((res,rej)=>{ const r=new FileReader(); r.onload=()=>res(r.result); r.onerror=rej; r.readAsDataURL(f); }); }

function openProfilePage(p){
  ensureProfileUI();
  setText('#ppTitle', p.name);
  renderProfile(p);
  $('#profilePage')?.classList.add('show');
}
function ensureProfileUI(){
  if($('#profilePage')) return;
  const wrap=document.createElement('div');
  wrap.id='profilePage';
  wrap.className='sheet show';
  wrap.style.cssText='position:fixed;inset:0;background:#0b0b3aee;backdrop-filter:blur(3px);display:none;z-index:1100';
  wrap.innerHTML=`
    <div class="pp" style="position:absolute;inset:0;overflow:auto;background:#0b0b3a;color:#e9ecff">
      <div class="pp-head" style="display:flex;align-items:center;justify-content:space-between;padding:12px 14px;border-bottom:1px solid rgba(255,255,255,.08)">
        <div class="row gap">
          <img src="plutoo-icon-192.png" alt="Plutoo" style="width:28px;height:28px;border-radius:6px">
          <strong id="ppTitle">Profilo</strong>
        </div>
        <button id="ppClose" class="btn light small">Chiudi</button>
      </div>
      <div id="ppBody" style="padding:12px 14px"></div>
    </div>`;
  document.body.appendChild(wrap);
  $('#ppClose',wrap).onclick=()=>$('#profilePage')?.classList.remove('show');
}

function renderProfile(p){
  const body=$('#ppBody'); if(!body) return;
  const unlocked=isSelfieUnlocked(p)||isMatched(p);
  const owner = readJSON(ownerKey(p), {type:'carta_identita', front:'', back:''});
  const dog   = readJSON(dogKey(p),   {microchip:'', vaccines:[], attachments:[]});
  const verified = (owner.front && owner.back && dog.microchip && dog.vaccines.length>0) || readVerified(p.id);
  if(verified){ p.verified=true; writeVerified(p.id,true); }

  setHTML('#ppBody', `
    <img class="pp-cover" src="${p.img}" alt="${p.name}" style="width:100%;aspect-ratio:16/10;object-fit:cover">
    <div class="pp-section">
      <h3 style="margin:8px 0 4px 0">${p.name} ${p.verified?'<span class="badge"><i>✅</i> verificato</span>':''}</h3>
      <p class="muted" style="margin:0 0 12px 0;opacity:.85">${p.breed} · ${p.age} anni · ${p.sex==='M'?'maschio':'femmina'} · taglia ${p.size.toLowerCase()} · pelo ${p.coat.toLowerCase()} · energia ${p.energy.toLowerCase()}</p>
    </div>

    <div class="pp-section selfie-wrap" style="margin-bottom:12px">
      <h4>🤳🏽 Selfie</h4>
      <div style="position:relative;display:inline-block">
        <img id="selfieImg" class="${unlocked?'':'selfie-blur'}" src="${p.selfie||'plutoo-icon-512.png'}" alt="Selfie" style="width:100%;max-width:420px;border-radius:12px;filter:${unlocked?'none':'blur(12px)'}">
        ${unlocked?'':`<button id="unlockBtn" class="unlock-pill" style="position:absolute;left:50%;bottom:12px;transform:translateX(-50%);padding:10px 14px;border-radius:999px;background:#7d5dfc;color:#fff;border:none">Guarda il video per vedere il selfie</button>`}
      </div>
    </div>

    <div class="pp-section">
      <h4>📷 Galleria</h4>
      <div class="pp-gallery" style="display:flex;gap:8px;flex-wrap:wrap">
        <img class="pp-thumb" src="${p.img}" style="width:110px;height:110px;object-fit:cover;border-radius:10px">
        <img class="pp-thumb" src="${p.selfie||'plutoo-icon-512.png'}" style="width:110px;height:110px;object-fit:cover;border-radius:10px">
      </div>
    </div>

    <div class="pp-section">
      <h4>📄 Documenti per il badge</h4>
      <p class="small muted" style="opacity:.85">Requisiti: <strong>fronte+retro</strong> documento proprietario, <strong>microchip</strong>, almeno <strong>1 vaccino</strong> con data.</p>

      <div class="pp-docs">
        <div class="doc-item" style="margin-bottom:10px">
          <h5>Documento proprietario</h5>
          <div class="doc-form" style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
            <label class="full" style="grid-column:1/-1">Tipo documento
              <select id="ownerType">
                <option value="carta_identita">Carta d'identità</option>
                <option value="patente">Patente</option>
                <option value="passaporto">Passaporto</option>
              </select>
            </label>
            <label>Fronte <input id="ownerFront" type="file" accept="image/*"></label>
            <label>Retro <input id="ownerBack" type="file" accept="image/*"></label>
          </div>
          <div class="doc-previews" id="ownerPrev" style="display:flex;gap:6px;margin-top:6px"></div>
        </div>

        <div class="doc-item">
          <h5>Documenti cane</h5>
          <div class="doc-form" style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
            <label class="full" style="grid-column:1/-1">Numero microchip
              <input id="dogChip" class="inp" placeholder="es. 3802600XXXXXXXX" maxlength="20">
            </label>
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
            <div class="full" style="grid-column:1/-1;display:flex;gap:8px">
              <input id="vacOther" class="inp" placeholder="Se Altro, specifica il nome" style="flex:1"/>
              <button id="vacAdd" class="btn light small">Aggiungi vaccino</button>
            </div>
          </div>
          <div id="vacList" class="doc-previews" style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px"></div>
          <div class="doc-form" style="margin-top:8px">
            <label class="full">Allegati (libretto, certificati)
              <input id="dogAttach" type="file" accept="image/*" multiple>
            </label>
          </div>
          <div class="doc-previews" id="dogPrev" style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px"></div>
        </div>
      </div>
    </div>

    <div class="pp-actions" style="display:flex;gap:8px;margin:14px 0 40px 0">
      <button class="btn light" data-chat>Messaggio</button>
      <button class="btn primary" data-invite>Invita al parco</button>
    </div>
  `);

  // listeners
  $('.pp-thumb',body)?.addEventListener('click',()=>{});
  const selfieEl=$('#selfieImg');
  if(selfieEl){
    selfieEl.addEventListener('click',()=>{
      if(unlocked){ /* potrebbe aprire viewer */ }
      else{
        openRewardDialog('Guarda il video per vedere il selfie', ()=>{ setSelfieUnlocked(p); renderProfile(p); });
      }
    });
  }
  $('#unlockBtn')?.addEventListener('click',()=> openRewardDialog('Guarda il video per vedere il selfie', ()=>{ setSelfieUnlocked(p); renderProfile(p);} ));

  // owner
  $('#ownerType').value = owner.type || 'carta_identita';
  $('#ownerType').addEventListener('change', e=>{ owner.type=e.target.value; writeJSON(ownerKey(p), owner); });
  $('#ownerFront').addEventListener('change', async e=>{ const f=e.target.files?.[0]; if(!f) return; owner.front=await fileToDataUrl(f); writeJSON(ownerKey(p),owner); renderProfile(p); });
  $('#ownerBack').addEventListener('change', async e=>{ const f=e.target.files?.[0]; if(!f) return; owner.back=await fileToDataUrl(f); writeJSON(ownerKey(p),owner); renderProfile(p); });
  const ownerPrev=$('#ownerPrev'); ownerPrev.innerHTML='';
  if(owner.front){ const im=document.createElement('img'); im.src=owner.front; im.style.cssText='width:96px;height:96px;object-fit:cover;border-radius:10px'; ownerPrev.appendChild(im); }
  if(owner.back){ const im=document.createElement('img'); im.src=owner.back;  im.style.cssText='width:96px;height:96px;object-fit:cover;border-radius:10px'; ownerPrev.appendChild(im); }

  // dog
  const chipEl=$('#dogChip'); chipEl.value=dog.microchip||''; chipEl.addEventListener('input', e=>{ dog.microchip=e.target.value.trim(); writeJSON(dogKey(p),dog); checkAndVerify(p); });
  const vacName=$('#vacName'), vacDate=$('#vacDate'), vacOther=$('#vacOther'), vacAdd=$('#vacAdd'), vacList=$('#vacList');
  const repaintVaccines=()=>{
    vacList.innerHTML='';
    dog.vaccines.forEach((v,idx)=>{
      const tag=document.createElement('span');
      tag.className='tag';
      tag.style.cssText='background:#1a1f43;padding:6px 8px;border-radius:999px';
      tag.innerHTML=`${v.name} · ${v.date} <span class="x" style="margin-left:6px;cursor:pointer">✕</span>`;
      tag.querySelector('.x').addEventListener('click',()=>{ dog.vaccines.splice(idx,1); writeJSON(dogKey(p),dog); repaintVaccines(); checkAndVerify(p); });
      vacList.appendChild(tag);
    });
  }; repaintVaccines();
  vacAdd.addEventListener('click', e=>{
    e.preventDefault();
    let name=vacName.value; if(name==='Altro'){ const t=(vacOther.value||'').trim(); if(!t) return; name=t; }
    const date=(vacDate.value||'').trim(); if(!name||!date) return;
    dog.vaccines.push({name,date}); writeJSON(dogKey(p),dog);
    vacOther.value=''; vacDate.value=''; repaintVaccines(); checkAndVerify(p);
  });
  $('#dogAttach').addEventListener('change', async e=>{
    const files=[...e.target.files];
    for(const f of files){ dog.attachments.push(await fileToDataUrl(f)); }
    writeJSON(dogKey(p),dog); renderProfile(p);
  });
  const dogPrev=$('#dogPrev'); dogPrev.innerHTML='';
  dog.attachments.forEach(src=>{ const im=document.createElement('img'); im.src=src; im.style.cssText='width:96px;height:96px;object-fit:cover;border-radius:10px'; dogPrev.appendChild(im); });

  $('[data-chat]',body)?.addEventListener('click',()=>openChat(p));
  $('[data-invite]',body)?.addEventListener('click',()=>alert('Invito inviato!'));

  checkAndVerify(p);
}
function checkAndVerify(p){
  const owner = readJSON(ownerKey(p), {type:'carta_identita', front:'', back:''});
  const dog   = readJSON(dogKey(p),   {microchip:'', vaccines:[], attachments:[]});
  const ok = !!(owner.front && owner.back && dog.microchip && dog.vaccines.length>0);
  if(ok && !readVerified(p.id)){ writeVerified(p.id,true); p.verified=true; renderNearGrid(); }
}

/* ---------- CHAT (gated al primo invio) ---------- */
let currentChatProfile=null;
function ensureChatUI(){
  if($('#chat')) return;
  const chat=document.createElement('div');
  chat.id='chat';
  chat.style.cssText='position:fixed;inset:0;background:#0b0b3aee;display:none;z-index:1200;color:#e9ecff';
  chat.innerHTML=`
    <div style="display:flex;align-items:center;gap:10px;padding:10px;border-bottom:1px solid rgba(255,255,255,.08)">
      <img id="chatAvatar" src="" style="width:30px;height:30px;border-radius:50%">
      <strong id="chatName">Chat</strong>
      <button id="chatClose" class="btn light small" style="margin-left:auto">Chiudi</button>
    </div>
    <div id="thread" style="height:calc(100% - 110px);overflow:auto;padding:12px 14px"></div>
    <div style="display:flex;gap:8px;padding:10px;border-top:1px solid rgba(255,255,255,.08)">
      <input id="chatInput" class="inp" placeholder="Scrivi un messaggio…" style="flex:1">
      <button id="sendBtn" class="btn primary">Invia</button>
    </div>`;
  document.body.appendChild(chat);
  $('#chatClose').onclick=()=>$('#chat').style.display='none';
  $('#sendBtn').onclick = async ()=>{
    const p=currentChatProfile; if(!p) return;
    const input=$('#chatInput'); const txt=(input.value||'').trim(); if(!txt) return;
    const first=!state.firstMessageSentTo.has(p.id);
    const doSend=()=>{ addBubble(txt,true); input.value=''; if(first){ state.firstMessageSentTo.add(p.id); } };
    if(first) openRewardDialog('Guarda il video per inviare il messaggio', doSend);
    else doSend();
  };
}
function openChat(p){
  currentChatProfile=p;
  setText('#chatName', p.name);
  const av=$('#chatAvatar'); if(av) av.src=p.img;
  const t=$('#thread'); if(t) t.innerHTML='';
  addBubble('Ciao! 🐾',false);
  $('#chat').style.display='block';
}
function addBubble(t,me){
  const b=document.createElement('div');
  b.className='bubble'+(me?' me':'');
  b.style.cssText='max-width:70%;margin:8px 0;padding:10px 12px;border-radius:14px;'+(me?'background:#7d5dfc;margin-left:auto':'background:#1a1f43');
  b.textContent=t;
  const thr=$('#thread'); if(!thr) return;
  thr.appendChild(b); thr.scrollTop=1e6;
}

/* ---------- FINE ---------- */
