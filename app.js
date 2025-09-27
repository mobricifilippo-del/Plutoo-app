/* =========================================================
   Plutoo – app.js (Android/WebView friendly)
   - Swipe col dito in “Scorri”
   - Pagina profilo full-screen: galleria foto + post/stato
   - Verifica documenti (proprietario + cane) → badge attivo solo se entrambi caricati
   - Filtri, chips, match/chat, adv placeholder
   - Persistenza locale in localStorage
   ---------------------------------------------------------
   AdMob IDs per futuro porting (Capacitor/Cordova)
   App ID:         ca-app-pub-5458345293928736~5749790476
   Banner Unit ID: ca-app-pub-5458345293928736/8955087050
   Interstitial:   INSERISCI_INTERSTITIAL_UNIT_ID
   ========================================================= */

/* ===================== DATI DEMO ===================== */
const dogs = [
  { id:1, name:'Luna',  age:1, breed:'Jack Russell',      sex:'F', size:'Piccola', coat:'Corto', energy:'Alta',  pedigree:'No', area:'Roma – Monteverde', desc:'Curiosa e molto giocherellona.', image:'dog1.jpg', online:true,  verified:true,  coords:{lat:41.898, lon:12.498} },
  { id:2, name:'Rocky', age:3, breed:'Labrador',          sex:'M', size:'Media',   coat:'Corto', energy:'Media', pedigree:'No', area:'Roma – Eur',        desc:'Affettuoso e fedele.',            image:'dog2.jpg', online:true,  verified:false, coords:{lat:41.901, lon:12.476} },
  { id:3, name:'Bella', age:2, breed:'Shiba Inu',         sex:'F', size:'Piccola', coat:'Medio', energy:'Media', pedigree:'Sì', area:'Roma – Prati',      desc:'Elegante, intelligente e curiosa.', image:'dog3.jpg', online:true,  verified:true,  coords:{lat:41.914, lon:12.495} },
  { id:4, name:'Max',   age:4, breed:'Golden Retriever',  sex:'M', size:'Grande',  coat:'Lungo', energy:'Alta',  pedigree:'No', area:'Roma – Tuscolana',  desc:'Socievole, ama l’acqua.',         image:'dog4.jpg', online:true,  verified:false, coords:{lat:41.887, lon:12.512} },
  { id:5, name:'Daisy', age:2, breed:'Beagle',            sex:'F', size:'Piccola', coat:'Corto', energy:'Alta',  pedigree:'No', area:'Roma – Garbatella', desc:'Instancabile esploratrice.',      image:'dog1.jpg', online:true,  verified:false, coords:{lat:41.905, lon:12.450} },
  { id:6, name:'Nero',  age:5, breed:'Meticcio',          sex:'M', size:'Media',   coat:'Medio', energy:'Media', pedigree:'No', area:'Roma – Nomentana',  desc:'Tranquillo e dolcissimo.',        image:'dog2.jpg', online:true,  verified:false, coords:{lat:41.930, lon:12.500} },
];

/* ===================== STATO ===================== */
let currentView='near', userPos=null, likeCount=+(localStorage.getItem('pl_like_count')||'0');
let matches = JSON.parse(localStorage.getItem('pl_matches')||'[]');
let swipeIndex=0;
let filters = { breed:'', ageBand:'', sex:'', size:'', coat:'', energy:'', pedigree:'', distance:'' };

/* ===================== UTILS BASE ===================== */
const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
const el=(t,a={},h='')=>{const n=document.createElement(t);Object.entries(a).forEach(([k,v])=>{k in n?n[k]=v:n.setAttribute(k,v)});if(h)n.innerHTML=h;return n};
function km(a,b){
  if(!a||!b) return null;
  const R=6371;
  const dLat=(b.lat-a.lat)*Math.PI/180;
  const dLon=(b.lon-a.lon)*Math.PI/180;
  const la1=a.lat*Math.PI/180, la2=b.lat*Math.PI/180;
  const x=Math.sin(dLat/2)**2 + Math.sin(dLon/2)**2*Math.cos(la1)*Math.cos(la2);
  return +(R*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x))).toFixed(1);
}
const randKm=()=>+(Math.random()*7+0.5).toFixed(1);
const band=a=>a<=1?'0–1':a<=4?'2–4':a<=7?'5–7':'8+';

/* ===================== STORAGE VERIFICA/PROFILO ===================== */
function _veriMap(){ try{return JSON.parse(localStorage.getItem('pl_verify')||'{}')}catch(_){return {}} }
function _saveVeri(map){ localStorage.setItem('pl_verify', JSON.stringify(map)); }
function getProfileStore(id){ const m=_veriMap(); if(!m[id]) m[id]={ owner:false, dog:false, gallery:[], posts:[] }; return m[id]; }
function setProfileStore(id, data){ const m=_veriMap(); m[id]=data; _saveVeri(m); }
function isVerified(d){ const st=getProfileStore(d.id); return d.verified || (st.owner && st.dog); }
const verifiedName=d=>`${d.name}, ${d.age} • ${d.breed}${isVerified(d)?' <span class="paw">🐾</span>':''}`;

/* ===================== DIALOG SAFE ===================== */
function openDialogSafe(dlg){ if(!dlg) return; if(typeof dlg.showModal==='function'){try{dlg.showModal();return;}catch(_){}} dlg.setAttribute('open',''); dlg.classList.add('fallback'); document.body.style.overflow='hidden'; }
function closeDialogSafe(dlg){ if(!dlg) return; if(typeof dlg.close==='function'){try{dlg.close();}catch(_){}} dlg.classList.remove('fallback'); dlg.removeAttribute('open'); document.body.style.overflow=''; }
window._openDlg=id=>openDialogSafe(document.getElementById(id));
window._closeDlg=id=>closeDialogSafe(document.getElementById(id));

/* ===================== NAV/APP ===================== */
function show(sel){ $$('.screen').forEach(s=>s.classList.remove('active')); (typeof sel==='string'?$(sel):sel)?.classList.add('active'); }
function switchTab(tab){
  currentView=tab;
  $$('.tab').forEach(b=>b.classList.toggle('active', b.dataset.tab===tab));
  $$('.tabpane').forEach(p=>p.classList.remove('active'));
  $('#'+tab)?.classList.add('active');
  if(tab==='near') renderNear();
  if(tab==='swipe') renderSwipe();
  if(tab==='matches') renderMatches();
  if(tab==='play') renderPlay();
}
function goHome(){ show('#app'); $('#geoBar')?.classList.remove('hidden'); renderNear(); renderSwipe(); renderMatches(); renderPlay(); }
window.goHome=goHome;

/* ===================== GEO ===================== */
$('#enableGeo')?.addEventListener('click', ()=>{ navigator.geolocation.getCurrentPosition(
  pos=>{userPos={lat:pos.coords.latitude,lon:pos.coords.longitude};$('#geoBar')?.classList.add('hidden');renderNear();renderSwipe();renderPlay();},
  _=>{$('#geoBar')?.classList.add('hidden');},{enableHighAccuracy:true,timeout:8000});});
$('#dismissGeo')?.addEventListener('click', ()=> $('#geoBar')?.classList.add('hidden'));

/* ===================== FILTRI ===================== */
$('#filterToggle')?.addEventListener('click', ()=>{ const p=$('#filterPanel'); if(p) p.hidden=!p.hidden; });
$('#filterForm')?.addEventListener('submit', e=>{
  e.preventDefault(); const f=e.currentTarget;
  filters.breed=f.breed.value||''; filters.ageBand=f.ageBand.value||''; filters.sex=f.sex.value||'';
  filters.size=f.size.value||''; filters.coat=f.coat.value||''; filters.energy=f.energy.value||'';
  filters.pedigree=f.pedigree.value||''; filters.distance=f.distance.value||'';
  $('#filterPanel').hidden=true; renderActiveChips();
  if(currentView==='near') renderNear(); else if(currentView==='swipe') renderSwipe(); else if(currentView==='play') renderPlay(); else renderMatches();
});
$('#filtersReset')?.addEventListener('click', ()=>{ $('#filterForm')?.reset(); filters={breed:'',ageBand:'',sex:'',size:'',coat:'',energy:'',pedigree:'',distance:''}; renderActiveChips(); if(currentView==='near') renderNear(); else if(currentView==='swipe') renderSwipe(); else if(currentView==='play') renderPlay(); else renderMatches(); });

function renderActiveChips(){ const c=$('#activeChips'); if(!c) return; c.innerHTML=''; const map={breed:'Razza',ageBand:'Età',sex:'Sesso',size:'Taglia',coat:'Pelo',energy:'Energia',pedigree:'Pedigree',distance:'Distanza'}; Object.entries(filters).forEach(([k,v])=>{ if(!v) return; const w=el('span',{className:'chip-wrap'}); w.append(el('span',{className:'chip'},`${map[k]}: ${v}`)); w.append(el('button',{className:'chip-x',onclick:()=>{filters[k]='';renderActiveChips(); if(currentView==='near') renderNear(); else if(currentView==='swipe') renderSwipe(); else if(currentView==='play') renderPlay(); else renderMatches(); }},'×')); c.append(w); }); }
function passesFilters(d,dist){ if(filters.breed&&!d.breed.toLowerCase().includes(filters.breed.toLowerCase()))return false; if(filters.ageBand&&band(d.age)!==filters.ageBand)return false; if(filters.sex&&d.sex!==filters.sex)return false; if(filters.size&&d.size!==filters.size)return false; if(filters.coat&&d.coat!==filters.coat)return false; if(filters.energy&&d.energy!==filters.energy)return false; if(filters.pedigree&&d.pedigree!==filters.pedigree)return false; if(filters.distance){const m=parseFloat(filters.distance); if(!isNaN(m)&&dist!=null&&dist>m)return false;} return true;}

/* ===================== VICINO ===================== */
function renderNear(){
  const grid=$('#grid'); if(!grid) return; grid.innerHTML='';
  const ordered=dogs.slice().map(d=>({d,dist:userPos?km(userPos,d.coords):randKm()})).sort((a,b)=>(a.dist??99)-(b.dist??99));
  const rows=ordered.filter(r=>passesFilters(r.d,r.dist));
  rows.forEach(({d,dist})=>{
    const card=el('article',{className:'card'});
    card.innerHTML=`
      ${d.online?'<span class="online"></span>':''}
      <img src="${d.image}" alt="${d.name}" onerror="this.style.display='none'">
      <div class="card-info">
        <div class="title">
          <div class="name">${verifiedName(d)}</div>
          <div class="dist">${dist??'-'} km</div>
        </div>
        <div class="actions">
          <button class="circle no">🥲</button>
          <button class="circle like">❤️</button>
        </div>
      </div>`;
    card.querySelector('.no').onclick=e=>{e.stopPropagation();card.remove();};
    card.querySelector('.like').onclick=e=>{e.stopPropagation();addMatch(d);incLikesMaybeAd();};
    card.addEventListener('click',ev=>{ if(ev.target.closest('.circle')) return; openProfilePage(d,dist); });
    grid.append(card);
  });
  $('#counter').textContent=`Mostro ${rows.length} profili`;
  $('#emptyNear')?.classList.toggle('hidden', rows.length>0);
}

/* ===================== GIOCHIAMO (nuova tab) ===================== */
function renderPlay(){
  const grid=$('#playGrid'); if(!grid) return; grid.innerHTML='';
  const ordered=dogs.slice().map(d=>({d,dist:userPos?km(userPos,d.coords):randKm()})).sort((a,b)=>(a.dist??99)-(b.dist??99));
  const rows=ordered.filter(r=>passesFilters(r.d,r.dist));
  rows.forEach(({d,dist})=>{
    const card=el('article',{className:'card'});
    card.innerHTML=`
      ${d.online?'<span class="online"></span>':''}
      <img src="${d.image}" alt="${d.name}" onerror="this.style.display='none'">
      <div class="card-info">
        <div class="title">
          <div class="name">${verifiedName(d)}</div>
          <div class="dist">${dist??'-'} km</div>
        </div>
        <div class="actions">
          <button class="circle no">🥲</button>
          <button class="circle like" title="Invita a giocare">❤️</button>
        </div>
      </div>`;
    card.querySelector('.no').onclick=e=>{e.stopPropagation();card.remove();};
    card.querySelector('.like').onclick=e=>{e.stopPropagation();addMatch(d);incLikesMaybeAd();};
    card.addEventListener('click',ev=>{ if(ev.target.closest('.circle')) return; openProfilePage(d,dist); });
    grid.append(card);
  });
  $('#playCounter').textContent=`Disponibili per giocare: ${rows.length}`;
  $('#emptyPlay')?.classList.toggle('hidden', rows.length>0);
}

/* ===================== SCORRI ===================== */
function filtered(){ return dogs.filter(d=>{ const dist=userPos?km(userPos,d.coords):randKm(); return passesFilters(d,dist); }); }
function renderSwipe(){
  const list=filtered(), img=$('#swipeImg'), title=$('#swipeTitle'), meta=$('#swipeMeta'), bio=$('#swipeBio');
  if(!list.length){ img.src=''; title.textContent=''; meta.textContent=''; bio.textContent='Nessun profilo per questi filtri.'; return; }
  const d=list[swipeIndex%list.length], dist=userPos?km(userPos,d.coords):randKm();
  img.src=d.image; img.alt=d.name; img.onerror=function(){this.style.display='none';};
  title.innerHTML=verifiedName(d); meta.textContent=`${dist} km da te`; bio.textContent=d.desc;

  const cardEl=document.querySelector('#swipe .deck .card')||document.querySelector('#swipe .card.big');
  if(cardEl){
    cardEl.style.transform=''; cardEl.style.opacity='';
    cardEl.classList.remove('pulse'); void cardEl.offsetWidth; cardEl.classList.add('pulse');
    cardEl.addEventListener('click',(ev)=>{ if(ev.target.closest('.circle')) return; openProfilePage(d,dist); },{once:true});
    attachSwipeGestures(cardEl, d);
  }

  $('#noBtn').onclick=()=>{ tinyBump('#noBtn'); if(cardEl){ cardEl.classList.add('swipe-left'); setTimeout(()=>swipe('no',d),220); } else swipe('no',d); };
  $('#yesBtn').onclick=()=>{ tinyBump('#yesBtn'); if(cardEl){ cardEl.classList.add('swipe-right'); setTimeout(()=>swipe('yes',d),220); } else swipe('yes',d); };
}
function tinyBump(sel){ const e=typeof sel==='string'?$(sel):sel; if(!e) return; e.classList.remove('button-bump'); void e.offsetWidth; e.classList.add('button-bump'); }
function swipe(type,d){ if(type==='yes'){ addMatch(d); incLikesMaybeAd(); } swipeIndex++; renderSwipe(); }

/* ---- Swipe gesture helpers ---- */
function attachSwipeGestures(cardEl, dogObj){
  if(!cardEl || cardEl._swipeBound) return;
  cardEl._swipeBound = true;
  let startX=0,startY=0,currentX=0,currentY=0,dragging=false,hasMoved=false;
  const onTouchStart = (e)=>{ const t=e.touches?e.touches[0]:e; startX=currentX=t.clientX; startY=currentY=t.clientY; dragging=true; hasMoved=false; cardEl.style.transition='none'; };
  const onTouchMove  = (e)=>{ if(!dragging) return; const t=e.touches?e.touches[0]:e; currentX=t.clientX; currentY=t.clientY; const dx=currentX-startX, dy=currentY-startY; if(Math.abs(dy)>Math.abs(dx)&&Math.abs(dy)>12) return; hasMoved=Math.abs(dx)>6; const rot=Math.max(-10,Math.min(10,dx/12)); cardEl.style.transform=`translateX(${dx}px) rotate(${rot}deg)`; cardEl.style.opacity=String(Math.max(.35,1-Math.abs(dx)/600)); };
  const onTouchEnd   = ()=>{ if(!dragging) return; dragging=false; const dx=currentX-startX; cardEl.style.transition='transform .18s ease-out, opacity .18s ease-out'; if(dx>80){ cardEl.style.transform='translateX(40%) rotate(6deg)'; cardEl.style.opacity='0'; setTimeout(()=>swipe('yes',dogObj),180);} else if(dx<-80){ cardEl.style.transform='translateX(-40%) rotate(-6deg)'; cardEl.style.opacity='0'; setTimeout(()=>swipe('no',dogObj),180);} else { cardEl.style.transform=''; cardEl.style.opacity=''; if(!hasMoved){ const dist=userPos?km(userPos,dogObj.coords):randKm(); openProfilePage(dogObj,dist);} } };
  cardEl.addEventListener('touchstart', onTouchStart,{passive:true});
  cardEl.addEventListener('touchmove',  onTouchMove, {passive:true});
  cardEl.addEventListener('touchend',   onTouchEnd,  {passive:true});
  cardEl.addEventListener('mousedown',(e)=>{ onTouchStart(e); const mm=(ev)=>onTouchMove(ev); const mu=()=>{ onTouchEnd(); document.removeEventListener('mousemove',mm); document.removeEventListener('mouseup',mu); }; document.addEventListener('mousemove',mm); document.addEventListener('mouseup',mu,{once:true}); });
}

/* ===================== PAGINA PROFILO FULLSCREEN ===================== */
function openProfilePage(d, distance){
  const page=document.getElementById('profilePage');
  const body=document.getElementById('ppBody');
  const title=document.getElementById('ppTitle');
  if(!page||!body) return;
  const store=getProfileStore(d.id);
  function render(){
    title.innerHTML=`${d.name} ${isVerified(d)?'<span class="paw">🐾</span>':''}`;
    const galleryHTML=(store.gallery||[]).map(src=>`<img class="pp-thumb" src="${src}" alt="">`).join('')||'<div class="muted small">Nessuna foto aggiunta.</div>';
    const postsHTML=(store.posts||[]).slice().reverse().map(p=>`<div class="pp-post"><div>${p.text}</div><div class="ts">${new Date(p.ts).toLocaleString()}</div></div>`).join('')||'<div class="muted small">Nessun post ancora.</div>';
    body.innerHTML=`
      <img class="pp-cover" src="${d.image}" alt="${d.name}" onerror="this.style.display='none'">
      <div class="pp-section">
        <h3>${d.name}, ${d.age} ${isVerified(d)?'<span class="paw">🐾</span>':''}</h3>
        <div class="meta">${d.breed} · ${d.sex==='F'?'Femmina':'Maschio'} · ${d.size} · ${d.coat}</div>
        <div class="meta"><b>Energia:</b> ${d.energy} · <b>Pedigree:</b> ${d.pedigree} · <b>Zona:</b> ${d.area} · <b>Distanza:</b> ${distance ?? '-'} km</div>
        <div class="badge-state ${isVerified(d)?'badge-ok':'badge-ko'}">${isVerified(d)?'Badge attivo ✅':'Badge non attivo'}</div>
        <div class="pp-actions"><button class="circle no" id="ppNo">🥲</button><button class="circle like" id="ppYes">❤️</button></div>
      </div>
      <div class="pp-section">
        <h4>Galleria foto</h4>
        <div class="pp-gallery" id="ppGallery">${galleryHTML}</div>
        <div class="pp-uploader"><label class="btn light small">Aggiungi foto<input id="ppAddPhotos" type="file" accept="image/*" multiple></label></div>
      </div>
      <div class="pp-section">
        <h4>Stato</h4>
        <div class="pp-post-new">
          <textarea id="ppStatus" class="pp-textarea" placeholder="Scrivi un aggiornamento…"></textarea>
          <div style="display:flex;gap:8px;justify-content:flex-end"><button id="ppPostBtn" class="btn primary">Pubblica</button></div>
        </div>
        <div class="pp-posts" id="ppPosts">${postsHTML}</div>
      </div>
      <div class="pp-section">
        <h4>Verifica documenti</h4>
        <div class="pp-verify-row">
          <label class="btn light small" style="text-align:center">Documento proprietario ${store.owner?'✔️':''}<input id="ppOwnerDoc" type="file" accept="image/*,application/pdf"></label>
          <label class="btn light small" style="text-align:center">Documento del cane ${store.dog?'✔️':''}<input id="ppDogDoc" type="file" accept="image/*,application/pdf"></label>
        </div>
        <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:10px"><button id="ppSendVerify" class="btn primary">Invia per verifica</button></div>
        <div class="muted small" style="margin-top:6px">Il badge si attiva solo quando entrambi i documenti risultano caricati.</div>
      </div>`;
    document.getElementById('ppNo').onclick=()=>closeProfilePage();
    document.getElementById('ppYes').onclick=()=>{addMatch(d);incLikesMaybeAd();closeProfilePage();};
    document.getElementById('ppAddPhotos').onchange=async (e)=>{ const files=Array.from(e.target.files||[]); for(const f of files){ const url=await fileToDataURL(f); store.gallery.push(url);} setProfileStore(d.id,store); render(); };
    document.getElementById('ppPostBtn').onclick=()=>{ const ta=document.getElementById('ppStatus'); const t=(ta.value||'').trim(); if(!t) return; store.posts.push({text:t,ts:Date.now()}); setProfileStore(d.id,store); ta.value=''; render(); };
    let tmpOwner=null,tmpDog=null;
    document.getElementById('ppOwnerDoc').onchange=e=>{tmpOwner=(e.target.files||[])[0]||null};
    document.getElementById('ppDogDoc').onchange=e=>{tmpDog=(e.target.files||[])[0]||null};
    document.getElementById('ppSendVerify').onclick=()=>{ if(tmpOwner) store.owner=true; if(tmpDog) store.dog=true; setProfileStore(d.id,store); render(); renderNear(); renderSwipe(); renderPlay(); };
  }
  render();
  page.classList.add('show');
}
function fileToDataURL(file){ return new Promise((res,rej)=>{ const r=new FileReader(); r.onload=()=>res(r.result); r.onerror=rej; r.readAsDataURL(file); }); }
function closeProfilePage(){ const page=document.getElementById('profilePage'); if(!page) return; page.classList.remove('show'); }
window.closeProfilePage=closeProfilePage;

/* ===================== MATCH & CHAT ===================== */
function addMatch(d){ if(!matches.find(m=>m.id===d.id)){ matches.push({id:d.id,name:d.name,img:d.image}); localStorage.setItem('pl_matches',JSON.stringify(matches)); } renderMatches(); }
function renderMatches(){ const box=$('#matchList'); if(!box) return; box.innerHTML=''; matches.forEach(m=>{ const row=el('div',{className:'item'}); row.innerHTML=`<img src="${m.img}" alt="${m.name}"><div><div><strong>${m.name}</strong></div><div class="muted small">Match</div></div><button class="btn primary pill go">Chat</button>`; row.querySelector('.go').onclick=()=>openChat(m); box.append(row); }); $('#emptyMatch').style.display=matches.length?'none':'block'; }
function openChat(m){ $('#chatAvatar').src=m.img; $('#chatName').textContent=m.name; $('#thread').innerHTML='<div class="bubble">Ciao! 🐾 Siamo un match!</div>'; $('#chat').classList.add('show'); }
$('#sendBtn')?.addEventListener('click',()=>{ const t=($('#chatInput').value||'').trim(); if(!t) return; const b=el('div',{className:'bubble me'},t); $('#thread').append(b); $('#chatInput').value=''; $('#thread').scrollTop=$('#thread').scrollHeight; });
$$('.close').forEach(b=>b.addEventListener('click',()=>$('#'+b.dataset.close)?.classList.remove('show')));

/* ===================== ADV PLACEHOLDER ===================== */
function showInterstitial(){ openDialogSafe($('#interstitial')); }
function incLikesMaybeAd(){ likeCount++; localStorage.setItem('pl_like_count', String(likeCount)); if(likeCount%10===0) showInterstitial(); }

/* ===================== AVVIO ===================== */
document.addEventListener('DOMContentLoaded', ()=>{
  $('#ctaEnter')?.addEventListener('click', e=>{ e.preventDefault(); goHome(); });
  $$('.tab').forEach(t=>t.addEventListener('click',()=>switchTab(t.dataset.tab)));
  $('#loginSubmit')?.addEventListener('click',()=>$('#sheetLogin')?.classList.remove('show'));
  $('#registerSubmit')?.addEventListener('click',()=>$('#sheetRegister')?.classList.remove('show'));
  $('#openPrivacy')?.addEventListener('click',()=>openDialogSafe($('#privacyDlg')));
  $('#openTerms')?.addEventListener('click',()=>openDialogSafe($('#termsDlg')));
  renderActiveChips();
});
/* ===================== PATCH: INTENTI & AZIONI (ADD-ONLY) ===================== */
/* 1) Assegna un intento “di default” ai cani demo (se manca) */
(function ensureDogIntents(){
  if(!window.dogs || !Array.isArray(dogs)) return;
  dogs.forEach(d=>{
    if(!d.intent){
      // distribuzione semplice e visibile (puoi personalizzare quando vuoi)
      d.intent = (d.id % 3 === 0) ? '❤️ Accoppiamoci' : (d.id % 2 ? '🐕 Camminiamo' : '🎾 Giochiamo');
    }
  });
})();

/* 2) Helpers per etichetta/pill/icone – non toccano nulla del resto */
function _intentKey(text){
  if(!text) return '';
  if(text.includes('Accop')) return 'mate';
  if(text.includes('Cammin')) return 'walk';
  if(text.includes('Gioca')) return 'play';
  return '';
}
function _intentClassFromText(text){
  const k=_intentKey(text);
  return k==='mate'?'intent-mate':k==='walk'?'intent-walk':k==='play'?'intent-play':'';
}
function _intentIconFromKey(k){
  return k==='mate'?'❤️':k==='walk'?'🐕':k==='play'?'🎾':'';
}
function _intentLabelFromKey(k){
  return k==='mate'?'Accoppiamoci':k==='walk'?'Camminiamo':k==='play'?'Giochiamo':'';
}
function _makeBlip(host, icon){
  try{
    const h=(typeof host==='string')?document.querySelector(host):host;
    if(!h) return;
    const b=document.createElement('div');
    b.className='blip'; b.textContent=icon;
    // posizionamento “furbo”: se c’è .actions usiamo quello
    const box=h.closest('.actions')||h;
    box.appendChild(b);
    setTimeout(()=>b.remove(), 450);
  }catch(_){}
}

/* 3) Potenzia le CARD in “Vicino” senza toccare il render originale */
function enhanceNearCards(){
  const grid=document.getElementById('grid'); if(!grid) return;
  grid.querySelectorAll('.card').forEach(card=>{
    const img=card.querySelector('img[alt]'); if(!img) return;
    const dog=dogs.find(d=>d.name===img.alt); if(!dog) return;

    // Pill “Disponibile per …” (se non presente)
    if(!card.querySelector('.intent-pill')){
      const pill=document.createElement('span');
      pill.className='intent-pill '+_intentClassFromText(dog.intent);
      pill.textContent='Disponibile per: '+dog.intent;
      const info=card.querySelector('.card-info');
      const title=card.querySelector('.card-info .title');
      if(info){
        if(title && title.nextSibling) info.insertBefore(pill, title.nextSibling);
        else info.prepend(pill);
      }
    }

    // Bottoni extra 🐕 🎾 (se mancanti) accanto a 🥲 e ❤️
    const actions=card.querySelector('.actions'); if(!actions) return;
    const hasWalk=actions.querySelector('.walk'); const hasPlay=actions.querySelector('.play');
    if(!hasWalk){
      const w=document.createElement('button'); w.className='circle walk'; w.textContent='🐕';
      w.onclick=(e)=>{ e.stopPropagation(); _makeBlip(actions,'🐕'); /* qui puoi agganciare la tua logica */ };
      actions.appendChild(w);
    }
    if(!hasPlay){
      const p=document.createElement('button'); p.className='circle play'; p.textContent='🎾';
      p.onclick=(e)=>{ e.stopPropagation(); _makeBlip(actions,'🎾'); /* qui puoi agganciare la tua logica */ };
      actions.appendChild(p);
    }
  });
}

/* 4) Potenzia la card grande in “Scorri” (aggiunge 🐕/🎾 e pill) */
function enhanceSwipeCard(){
  const deck=document.querySelector('#swipe .deck'); if(!deck) return;
  const card=deck.querySelector('.card'); if(!card) return;
  const title=card.querySelector('#swipeTitle'); if(!title) return;

  // trova cane corrente dal titolo (prima della virgola)
  const name=(title.textContent||'').split(',')[0].trim();
  const dog=dogs.find(d=>d.name===name); if(!dog) return;

  // pill sotto la bio
  const info=card.querySelector('.card-info'); const bio=card.querySelector('.bio');
  if(info && bio && !info.querySelector('.intent-pill')){
    const pill=document.createElement('span');
    pill.className='intent-pill '+_intentClassFromText(dog.intent);
    pill.textContent=dog.intent;
    bio.insertAdjacentElement('afterend', pill);
  }

  // bottoni extra 🐕/🎾 in azioni (se mancanti)
  const actions=card.querySelector('.actions'); if(actions){
    if(!actions.querySelector('.walk')){
      const w=document.createElement('button'); w.className='circle walk'; w.textContent='🐕';
      w.id='walkBtnPatch';
      w.onclick=()=>{ _makeBlip(actions,'🐕'); /* logica custom se serve */ };
      actions.insertBefore(w, actions.lastElementChild); // prima del like se vuoi
    }
    if(!actions.querySelector('.play')){
      const p=document.createElement('button'); p.className='circle play'; p.textContent='🎾';
      p.id='playBtnPatch';
      p.onclick=()=>{ _makeBlip(actions,'🎾'); /* logica custom se serve */ };
      actions.appendChild(p);
    }
  }
}

/* 5) Mostra l’intento dentro al PROFILO a pagina aperta (osserva modifiche) */
(function observeProfilePage(){
  const page=document.getElementById('profilePage'); if(!page) return;
  const body=document.getElementById('ppBody'); if(!body) return;

  const obs=new MutationObserver(()=> {
    // quando cambia il profilo, inseriamo la sezione (una volta sola)
    if(body.dataset._intentInjected==='1') return;
    const title=document.getElementById('ppTitle'); if(!title) return;
    const raw=(title.textContent||'').replace('🐾','').trim();
    const name=raw.split(' ')[0]; // prima parola è il nome (coerente con tua base)
    const dog=dogs.find(d=>raw.startsWith(d.name)); if(!dog) return;

    // crea blocco “Disponibile per”
    const sec=document.createElement('div');
    sec.className='pp-availability';
    const k=_intentKey(dog.intent);
    sec.innerHTML = `
      <span class="label">Disponibile per:</span>
      <span class="intent-pill ${_intentClassFromText(dog.intent)}">${_intentIconFromKey(k)} ${_intentLabelFromKey(k)}</span>
    `;
    body.insertBefore(sec, body.firstChild.nextSibling); // subito sotto la cover
    body.dataset._intentInjected='1';
  });
  obs.observe(body, {childList:true, subtree:true});
})();

/* 6) Richiama i potenziamenti dopo i render esistenti (senza toccarli) */
(function hookRenders(){
  // subito all’avvio, e poi ogni volta che navighi tra tab
  try{
    enhanceNearCards();
    enhanceSwipeCard();
  }catch(_){}

  // hook semplice: quando clicchi tab ricalcoliamo
  document.addEventListener('click', (e)=>{
    const t=e.target.closest('.tab'); if(!t) return;
    setTimeout(()=>{ enhanceNearCards(); enhanceSwipeCard(); }, 10);
  });

  // anche dopo  renderSwipe/renderNear se vengono richiamati
  // (best-effort: timer corto che si “aggancia” ai cambi)
  let _last=0;
  setInterval(()=>{ const now=Date.now(); if(now-_last>250){ enhanceNearCards(); enhanceSwipeCard(); _last=now; }}, 400);
})();
