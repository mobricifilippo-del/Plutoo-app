/* Plutoo – app.js (autocomplete razze + flussi definitivi) */

(() => {
  const $  = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => [...root.querySelectorAll(sel)];
  const sleep = (ms)=>new Promise(r=>setTimeout(r,ms));
  const now = ()=>Date.now();
  const H24 = 24*60*60*1000;

  // fallback completo (tutte le razze che mi avevi fornito)
  const FALLBACK_BREEDS = [ "Affenpinscher","Afghan Hound","Airedale Terrier","Akita","Alaskan Klee Kai","Alaskan Malamute","American Bulldog","American English Coonhound","American Eskimo Dog","American Foxhound","American Hairless Terrier","American Leopard Hound","American Staffordshire Terrier","American Water Spaniel","Anatolian Shepherd Dog","Appenzeller Sennenhund","Australian Cattle Dog","Australian Kelpie","Australian Shepherd","Australian Stumpy Tail Cattle Dog","Australian Terrier","Azawakh","Barbado da Terceira","Barbet","Basenji","Basset Fauve de Bretagne","Basset Hound","Bavarian Mountain Scent Hound","Beagle","Bearded Collie","Beauceron","Bedlington Terrier","Belgian Laekenois","Belgian Malinois","Belgian Sheepdog","Belgian Tervuren","Bergamasco Sheepdog","Berger Picard","Bernese Mountain Dog","Bichon Frise","Biewer Terrier","Black and Tan Coonhound","Black Russian Terrier","Bloodhound","Blue Picardy Spaniel","Bluetick Coonhound","Boerboel","Bohemian Shepherd","Bolognese","Border Collie","Border Terrier","Borzoi","Boston Terrier","Bouvier des Ardennes","Bouvier des Flandres","Boxer","Boykin Spaniel","Bracco Italiano","Braque du Bourbonnais","Braque Francais Pyrenean","Braque Saint-Germain","Brazilian Terrier","Briard","Brittany","Broholmer","Brussels Griffon","Bull Terrier","Bulldog","Bullmastiff","Cairn Terrier","Calupoh","Canaan Dog","Canadian Eskimo Dog","Cane Corso","Cardigan Welsh Corgi","Carolina Dog","Catahoula Leopard Dog","Caucasian Shepherd Dog","Cavalier King Charles Spaniel","Central Asian Shepherd Dog","Cesky Terrier","Chesapeake Bay Retriever","Chihuahua","Chinese Crested","Chinese Shar-Pei","Chinook","Chow Chow","Cirneco dell’Etna","Clumber Spaniel","Cocker Spaniel","Collie","Coton de Tulear","Croatian Sheepdog","Curly-Coated Retriever","Czechoslovakian Vlciak","Dachshund","Dalmatian","Dandie Dinmont Terrier","Danish-Swedish Farmdog","Deutscher Wachtelhund","Doberman Pinscher","Dogo Argentino","Dogue de Bordeaux","Drentsche Patrijshond","Drever","Dutch Shepherd","English Cocker Spaniel","English Foxhound","English Setter","English Springer Spaniel","English Toy Spaniel","Entlebucher Mountain Dog","Estrela Mountain Dog","Eurasier","Field Spaniel","Finnish Lapphund","Finnish Spitz","Flat-Coated Retriever","French Bulldog","French Spaniel","German Longhaired Pointer","German Pinscher","German Shepherd Dog","German Shorthaired Pointer","German Spitz","German Wirehaired Pointer","Giant Schnauzer","Glen of Imaal Terrier","Golden Retriever","Gordon Setter","Grand Basset Griffon Vendéen","Great Dane","Great Pyrenees","Greater Swiss Mountain Dog","Greyhound","Hamiltonstovare","Hanoverian Scenthound","Harrier","Havanese","Hokkaido","Hovawart","Ibizan Hound","Icelandic Sheepdog","Irish Red and White Setter","Irish Setter","Irish Terrier","Irish Water Spaniel","Irish Wolfhound","Italian Greyhound","Jagdterrier","Japanese Akitainu","Japanese Chin","Japanese Spitz","Japanese Terrier","Kai Ken","Karelian Bear Dog","Keeshond","Kerry Blue Terrier","Kishu Ken","Komondor","Korean Jindo Dog","Kromfohrlander","Kuvasz","Labrador Retriever","Lagotto Romagnolo","Lakeland Terrier","Lancashire Heeler","Lapponian Herder","Large Munsterlander","Leonberger","Lhasa Apso","Löwchen","Maltese","Manchester Terrier (Standard)","Manchester Terrier (Toy)","Mastiff","Miniature American Shepherd","Miniature Bull Terrier","Miniature Pinscher","Miniature Schnauzer","Mountain Cur","Mudi","Neapolitan Mastiff","Nederlandse Kooikerhondje","Newfoundland","Norfolk Terrier","Norrbottenspets","Norwegian Buhund","Norwegian Elkhound","Norwegian Lundehund","Norwich Terrier","Nova Scotia Duck Tolling Retriever","Old English Sheepdog","Otterhound","Papillon","Parson Russell Terrier","Pekingese","Pembroke Welsh Corgi","Peruvian Inca Orchid","Petit Basset Griffon Vendéen","Pharaoh Hound","Plott Hound","Pointer","Polish Lowland Sheepdog","Pomeranian","Pont-Audemer Spaniel","Poodle (Miniature)","Poodle (Standard)","Poodle (Toy)","Porcelaine","Portuguese Podengo","Portuguese Podengo Pequeno","Portuguese Pointer","Portuguese Sheepdog","Portuguese Water Dog","Presa Canario","Pudelpointer","Pug","Puli","Pumi","Pyrenean Mastiff","Pyrenean Shepherd","Rafeiro do Alentejo","Rat Terrier","Redbone Coonhound","Rhodesian Ridgeback","Romanian Carpathian Shepherd","Romanian Mioritic Shepherd Dog","Rottweiler","Russell Terrier","Russian Toy","Russian Tsvetnaya Bolonka","Saint Bernard","Saluki","Samoyed","Schapendoes","Schipperke","Scottish Deerhound","Scottish Terrier","Sealyham Terrier","Segugio Italiano","Shetland Sheepdog","Shiba Inu","Shih Tzu","Shikoku","Siberian Husky","Silky Terrier","Skye Terrier","Sloughi","Slovakian Wirehaired Pointer","Slovensky Cuvac","Slovensky Kopov","Small Munsterlander","Smooth Fox Terrier","Soft Coated Wheaten Terrier","Spanish Mastiff","Spanish Water Dog","Spinone Italiano","Stabyhoun","Staffordshire Bull Terrier","Standard Schnauzer","Sussex Spaniel","Swedish Lapphund","Swedish Vallhund","Taiwan Dog","Teddy Roosevelt Terrier","Thai Bangkaew","Thai Ridgeback","Tibetan Mastiff","Tibetan Spaniel","Tibetan Terrier","Tornjak","Tosa","Toy Fox Terrier","Transylvanian Hound","Treeing Tennessee Brindle","Treeing Walker Coonhound","Vizsla","Volpino Italiano","Weimaraner","Welsh Springer Spaniel","Welsh Terrier","West Highland White Terrier","Wetterhoun","Whippet","Wire Fox Terrier","Wirehaired Pointing Griffon","Wirehaired Vizsla","Working Kelpie","Xoloitzcuintli","Yakutian Laika","Yorkshire Terrier" ];

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
    breeds:[] // popolata da loadBreeds()
  };

  document.addEventListener('DOMContentLoaded', init);

  async function init(){
    wireBasicNav();
    wireSheetsAndDialogs();
    wireFilterPanel();             // crea anche la tendina custom
    await loadBreeds();            // riempie state.breeds
    prepareLocalProfiles();
    renderNearGrid();
    wireTabs();
    wireDecks();
    wireGeoBar();
    wirePhotoViewer();
    wireMatchOverlay();
    wireChat();
  }

  // NAV
  function wireBasicNav(){
    $('#openPrivacy')?.addEventListener('click', ()=> $('#privacyDlg')?.showModal());
    $('#openTerms')?.addEventListener('click', ()=> $('#termsDlg')?.showModal());
  }
  window.goHome=()=>{$('#landing')?.classList.remove('active');$('#app')?.classList.add('active');};

  // SHEETS / Reward dialog
  let pendingRewardHook=null;
  function wireSheetsAndDialogs(){
    $('#btnLoginTop')?.addEventListener('click',()=>$('#sheetLogin')?.classList.add('show'));
    $('#btnRegisterTop')?.addEventListener('click',()=>$('#sheetRegister')?.classList.add('show'));
    $('#btnLoginUnder')?.addEventListener('click',()=>$('#sheetLogin')?.classList.add('show'));
    $$('.close').forEach(b=>b.addEventListener('click',()=>$('#'+b.dataset.close)?.classList.remove('show')));

    $('#rewardPlay')?.addEventListener('click', async ()=>{
      const btn=$('#rewardPlay'); btn.disabled=true; btn.textContent='Video…';
      await sleep(3000); // simulazione video senza UI
      btn.disabled=false; btn.textContent='Guarda video';
      $('#adReward')?.close();
      if(pendingRewardHook){const f=pendingRewardHook; pendingRewardHook=null; f();}
    });
  }
  function openRewardDialog(message,after){
    const dlg=$('#adReward'); if(!dlg){ after?.(); return; }
    const h3=dlg.querySelector('h3'); if(h3) h3.textContent=message||'Guarda il video per continuare';
    pendingRewardHook=after||null; dlg.showModal();
  }

  // FILTRI + AUTOCOMPLETE
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
      closeSuggest();
      renderNearGrid();
    });

    // --- autocomplete custom per Razza ---
    const inp = $('#breedInput');
    if (inp){
      // disabilita datalist nativo per evitare doppie liste
      inp.setAttribute('autocomplete','off');
      inp.removeAttribute('list');

      // contenitore lista
      const box=document.createElement('div');
      box.className='suggest hidden';
      inp.parentElement.appendChild(box);

      // eventi
      inp.addEventListener('input', ()=>{
        const q=(inp.value||'').trim().toLowerCase();
        state.filters.breed=inp.value.trim();
        if(!q){ closeSuggest(); return; }
        const list=(state.breeds||[]).filter(b=>b.toLowerCase().startsWith(q))
          .sort((a,b)=>a.localeCompare(b,'it'));
        renderSuggest(box,list.slice(0,50), val=>{
          inp.value=val; state.filters.breed=val; closeSuggest();
        });
      });
      inp.addEventListener('focus', ()=>{
        const q=(inp.value||'').trim().toLowerCase();
        if(!q){ openAllPfx(box,''); } // se vuoto, non apriamo (comportamento richiesto: scrivi P → apri)
      });

      document.addEventListener('click', (e)=>{
        if(!box.contains(e.target) && e.target!==inp) closeSuggest();
      });
    }

    function renderSuggest(box,items,onPick){
      if(!items.length){ closeSuggest(); return; }
      box.innerHTML='';
      items.forEach(txt=>{
        const it=document.createElement('div');
        it.className='suggest-item';
        it.textContent=txt;
        it.addEventListener('click',()=>onPick(txt));
        box.appendChild(it);
      });
      box.classList.remove('hidden');
    }
    function closeSuggest(){
      const box=$('.suggest', $('#breedInput')?.parentElement || document);
      box?.classList.add('hidden');
    }
    function openAllPfx(box,_pfx){ /* lasciata per estensioni future */ }
  }

  // TABS
  function wireTabs(){
    $$('.tabs .tab').forEach(btn=>{
      btn.addEventListener('click',()=>{
        const tab=btn.getAttribute('data-tab'); if(!tab) return;
        state.tab=tab; $$('.tabs .tab').forEach(b=>b.classList.remove('active')); btn.classList.add('active');
        $$('.tabpane').forEach(p=>p.classList.remove('active')); $('#'+tab)?.classList.add('active');
        if(tab==='near') renderNearGrid();
        if(tab==='love') renderLove();
        if(tab==='social') renderSocial();
        if(tab==='matches') renderMatches();
      });
    });
  }

  // BREEDS (carica + fallback, salva in state.breeds)
  async function loadBreeds(){
    try{
      const r=await fetch('breeds.json',{cache:'no-store'});
      if(!r.ok) throw new Error('http '+r.status);
      const arr=await r.json();
      state.breeds=Array.isArray(arr)&&arr.length?arr:FALLBACK_BREEDS;
    }catch(_){
      state.breeds=FALLBACK_BREEDS;
    }
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
      distanceKm:((i+1)*1.1).toFixed(1),verified:i%3===0
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
    $('#counter').textContent=`${list.length} profili trovati`;
    grid.innerHTML='';
    list.forEach(p=>{
      const card=document.createElement('article');
      card.className='card';
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
    $('#emptyNear').classList.toggle('hidden',list.length>0);
  }

  // DECKS
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
  function bindSwipe(card,h){ if(!card) return; let s=0; card.addEventListener('touchstart',e=>{s=e.touches[0].clientX},{passive:true}); card.addEventListener('touchend',e=>{const d=e.changedTouches[0].clientX-s; if(Math.abs(d)>40) h(d);}); }
  function currentCard(kind){ const i=kind==='love'?state.deckIdxLove:state.deckIdxSoc; return state.profiles[i%state.profiles.length]; }
  function renderLove(){ renderCardInto(currentCard('love'),'love'); }
  function renderSocial(){ renderCardInto(currentCard('social'),'soc'); }
  function renderCardInto(p,pre){ $('#'+pre+'Img').src=p.img; $('#'+pre+'Title').textContent=p.name; $('#'+pre+'Meta').textContent=`${p.breed} · ${p.distanceKm} km`; $('#'+pre+'Bio').textContent=`${p.name} ha ${p.age} anni, ${p.sex==='M'?'maschio':'femmina'}, taglia ${p.size.toLowerCase()}, pelo ${p.coat.toLowerCase()}, energia ${p.energy.toLowerCase()}.`; }
  async function likeDeck(kind){ await likeFromSwipe(currentCard(kind)); if(kind==='love'){state.deckIdxLove++;renderLove();} else {state.deckIdxSoc++;renderSocial();} }
  function skipDeck(kind){ swipeOccurred(); if(kind==='love'){state.deckIdxLove++;renderLove();} else {state.deckIdxSoc++;renderSocial();} }

  // SWIPE / MILESTONE
  function swipeOccurred(){
    state.swipeCount++;
    if(state.swipeCount===10 || (state.swipeCount>10 && (state.swipeCount-10)%5===0)){
      openRewardDialog('Guarda il video per altri like', ()=>{ /* sblocco */ });
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
      await simulateAutoVideo(); // video automatico (3s)
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
      $('button',item).addEventListener('click',()=>openChat(p));
      host.appendChild(item);
    });
    $('#emptyMatch').style.display=list.length?'none':'block';
  }
  function wireMatchOverlay(){
    $('#closeMatch')?.addEventListener('click',()=>$('#matchOverlay')?.classList.add('hidden'));
    $('#acceptMatch')?.addEventListener('click',()=>$('#matchOverlay')?.classList.add('hidden'));
  }
  function showMatchToast(_p){ const ov=$('#matchOverlay'); if(ov){ ov.classList.remove('hidden'); return; } }

  // GEO
  function wireGeoBar(){
    const bar=$('#geoBar'); const enable=$('#enableGeo'); const dismiss=$('#dismissGeo');
    bar?.classList.remove('hidden');
    enable?.addEventListener('click',()=>{ if(!navigator.geolocation){bar.classList.add('hidden');return;} navigator.geolocation.getCurrentPosition(()=>bar.classList.add('hidden'),()=>bar.classList.add('hidden')); });
    dismiss?.addEventListener('click',()=>bar.classList.add('hidden'));
  }

  // PROFILO
  let unlockPending=null;
  function openProfilePage(p){ $('#ppTitle').textContent=p.name; renderProfile(p); $('#profilePage').classList.add('show'); }
  window.closeProfilePage=()=>$('#profilePage').classList.remove('show');
  function selfieKey(p){return`selfie-unlock-${p.id}`;}
  function isSelfieUnlocked(p){const ts=Number(localStorage.getItem(selfieKey(p))||0);return ts&&(now()-ts)<H24;}
  function setSelfieUnlocked(p){localStorage.setItem(selfieKey(p),String(now()));}
  function isMatched(p){return state.matchedIds.has(p.id);}

  function renderProfile(p){
    const body=$('#ppBody'); const unlocked=isSelfieUnlocked(p)||isMatched(p);
    body.innerHTML=`
      <img class="pp-cover" src="${p.img}" alt="${p.name}">
      <div class="pp-section"><h3>${p.name} ${p.verified?'<span class="badge"><i>✅</i> verificato</span>':''}</h3>
      <p class="muted">${p.breed} · ${p.age} anni · ${p.sex==='M'?'maschio':'femmina'} · taglia ${p.size.toLowerCase()}</p></div>
      <div class="pp-section selfie-wrap">
        <h4>🤳🏽 Selfie</h4>
        <img id="selfieImg" class="${unlocked?'':'selfie-blur'}" src="${p.selfie||'plutoo-icon-512.png'}" alt="Selfie">
        ${unlocked?'':'<button id="unlockBtn" class="unlock-pill">Guarda il video per vedere il selfie</button>'}
      </div>
      <div class="pp-section"><h4>Galleria</h4><div class="pp-gallery">
        <img class="pp-thumb" src="${p.img}" alt=""><img class="pp-thumb" src="${p.selfie||'plutoo-icon-512.png'}" alt="">
      </div></div>
      <div class="pp-actions"><button class="btn light" data-chat>Messaggio</button><button class="btn primary" data-invite>Invita al parco</button></div>`;
    $('.pp-cover',body)?.addEventListener('click',()=>openPhotoViewer(p,p.img));
    $$('.pp-thumb',body).forEach(t=>t.addEventListener('click',()=>openPhotoViewer(p,t.getAttribute('src'))));
    const selfieEl=$('#selfieImg');
    if(selfieEl){ selfieEl.addEventListener('click',()=>{
      if(isSelfieUnlocked(p)||isMatched(p)){ openPhotoViewer(p,selfieEl.getAttribute('src')); }
      else{ unlockPending=p; openRewardDialog('Guarda il video per vedere il selfie',()=>{ setSelfieUnlocked(unlockPending); renderProfile(unlockPending); unlockPending=null; }); }
    });}
    $('#unlockBtn')?.addEventListener('click',()=>{ unlockPending=p; openRewardDialog('Guarda il video per vedere il selfie',()=>{ setSelfieUnlocked(unlockPending); renderProfile(unlockPending); unlockPending=null; }); });
    $('[data-chat]',body)?.addEventListener('click',()=>openChat(p));
    $('[data-invite]',body)?.addEventListener('click',()=>alert('Invito inviato!'));
  }

  // VIEWER (pollice blu solo qui)
  function wirePhotoViewer(){
    $('#viewerBack')?.addEventListener('click',closePhotoViewer);
    $('#viewerLike')?.addEventListener('click',()=>{ if(state.viewerProfile) like(state.viewerProfile); });
  }
  function openPhotoViewer(p,src){ state.viewerProfile=p; const vp=$('#photoViewer'); const img=$('#viewerImg'); if(!vp||!img) return; img.src=src||p.img; $('#viewerTitle')?.textContent=p.name; vp.classList.add('show'); }
  function closePhotoViewer(){ $('#photoViewer')?.classList.remove('show'); state.viewerProfile=null; }

  // CHAT (video auto al primo messaggio)
  let currentChatProfile=null;
  function wireChat(){
    $('#sendBtn')?.addEventListener('click', async ()=>{
      const p=currentChatProfile; if(!p) return;
      const input=$('#chatInput'); const txt=(input.value||'').trim(); if(!txt) return;
      const first=!state.firstMessageSentTo.has(p.id);
      if(first){ await simulateAutoVideo(); state.firstMessageSentTo.add(p.id); }
      addBubble(txt,true); input.value='';
    });
  }
  function openChat(p){ currentChatProfile=p; $('#chatName').textContent=p.name; $('#chatAvatar').src=p.img; $('#thread').innerHTML=''; addBubble('Ciao! 🐾',false); $('#chat').classList.add('show'); }
  function addBubble(t,me){ const b=document.createElement('div'); b.className='bubble'+(me?' me':''); b.textContent=t; $('#thread').appendChild(b); $('#thread').scrollTop=1e6; }

  // VIDEO auto
  async function simulateAutoVideo(){ await sleep(3000); } // nessuna UI

})();
