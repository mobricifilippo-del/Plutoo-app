/* =========================================================
   Plutoo – app.js (v9 Android/WebView friendly)
   - Swipe col dito in “Scorri”
   - Pagina profilo full-screen (no <dialog> piccolo)
   - Resto invariato: filtri, chips, match/chat, adv placeholder
   ========================================================= */

/* AdMob IDs per futuro porting Android (Capacitor/Cordova)
   App ID:         ca-app-pub-5458345293928736~5749790476
   Banner Unit ID: ca-app-pub-5458345293928736/8955087050
   Interstitial:   INSERISCI_INTERSTITIAL_UNIT_ID
*/

const dogs = [
  { id:1, name:'Luna',  age:1, breed:'Jack Russell',      sex:'F', size:'Piccola', coat:'Corto', energy:'Alta',  pedigree:'No', area:'Roma – Monteverde', desc:'Curiosa e molto giocherellona.', image:'dog1.jpg', online:true,  verified:true,  coords:{lat:41.898, lon:12.498} },
  { id:2, name:'Rocky', age:3, breed:'Labrador',          sex:'M', size:'Media',   coat:'Corto', energy:'Media', pedigree:'No', area:'Roma – Eur',        desc:'Affettuoso e fedele.',            image:'dog2.jpg', online:true,  verified:false, coords:{lat:41.901, lon:12.476} },
  { id:3, name:'Bella', age:2, breed:'Shiba Inu',         sex:'F', size:'Piccola', coat:'Medio', energy:'Media', pedigree:'Sì', area:'Roma – Prati',      desc:'Elegante, intelligente e curiosa.', image:'dog3.jpg', online:true,  verified:true,  coords:{lat:41.914, lon:12.495} },
  { id:4, name:'Max',   age:4, breed:'Golden Retriever',  sex:'M', size:'Grande',  coat:'Lungo', energy:'Alta',  pedigree:'No', area:'Roma – Tuscolana',  desc:'Socievole, ama l’acqua.',         image:'dog4.jpg', online:true,  verified:false, coords:{lat:41.887, lon:12.512} },
  { id:5, name:'Daisy', age:2, breed:'Beagle',            sex:'F', size:'Piccola', coat:'Corto', energy:'Alta',  pedigree:'No', area:'Roma – Garbatella', desc:'Instancabile esploratrice.',      image:'dog1.jpg', online:true,  verified:false, coords:{lat:41.905, lon:12.450} },
  { id:6, name:'Nero',  age:5, breed:'Meticcio',          sex:'M', size:'Media',   coat:'Medio', energy:'Media', pedigree:'No', area:'Roma – Nomentana',  desc:'Tranquillo e dolcissimo.',        image:'dog2.jpg', online:true,  verified:false, coords:{lat:41.930, lon:12.500} },
];

let currentView='near', userPos=null, likeCount=+(localStorage.getItem('pl_like_count')||'0');
let matches = JSON.parse(localStorage.getItem('pl_matches')||'[]');
let swipeIndex=0;
let filters = { breed:'', ageBand:'', sex:'', size:'', coat:'', energy:'', pedigree:'', distance:'' };

const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
const el=(t,a={},h='')=>{const n=document.createElement(t);Object.entries(a).forEach(([k,v])=>{k in n?n[k]=v:n.setAttribute(k,v)});if(h)n.innerHTML=h;return n};
const km=(a,b)=>{ if(!a||!b) return null; const R=6371,dLa=(b.lat-a.lat)*Math.PI/180,dLo=(b.lon-a.lon)*Math.PI/180,la1=a.lat*Math.PI/180,la2=b.lat*Math.PI/180,x=Math.sin(dLa/2)**2*Math.cos(la1)*Math.cos(la2)+Math.sin(dLo/2)**2; return +(R*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x))).toFixed(1); };
const randKm=()=>+(Math.random()*7+0.5).toFixed(1);
const band=a=>a<=1?'0–1':a<=4?'2–4':a<=7?'5–7':'8+';
const verifiedName=d=>`${d.name}, ${d.age} • ${d.breed}${d.verified?' <span class="paw">🐾</span>':''}`;

/* Dialog fallback helpers (per gli altri modali) */
function openDialogSafe(dlg){ if(!dlg) return; if(typeof dlg.showModal==='function'){try{dlg.showModal();return;}catch(_){}} dlg.setAttribute('open',''); dlg.classList.add('fallback'); document.body.style.overflow='hidden'; }
function closeDialogSafe(dlg){ if(!dlg) return; if(typeof dlg.close==='function'){try{dlg.close();}catch(_){}} dlg.classList.remove('fallback'); dlg.removeAttribute('open'); document.body.style.overflow=''; }
window._openDlg=id=>openDialogSafe(document.getElementById(id));
window._closeDlg=id=>closeDialogSafe(document.getElementById(id));

/* Navigazione */
function show(sel){ $$('.screen').forEach(s=>s.classList.remove('active')); (typeof sel==='string'?$(sel):sel)?.classList.add('active'); }
function switchTab(tab){ currentView=tab; $$('.tab').forEach(b=>b.classList.toggle('active', b.dataset.tab===tab)); $$('.tabpane').forEach(p=>p.classList.remove('active')); $('#'+tab)?.classList.add('active'); if(tab==='near') renderNear(); if(tab==='swipe') renderSwipe(); if(tab==='matches') renderMatches(); }
function goHome(){ show('#app'); $('#geoBar')?.classList.remove('hidden'); renderNear(); renderSwipe(); renderMatches(); }
window.goHome=goHome;

/* Geo */
$('#enableGeo')?.addEventListener('click', ()=>{ navigator.geolocation.getCurrentPosition(
  pos=>{userPos={lat:pos.coords.latitude,lon:pos.coords.longitude};$('#geoBar')?.classList.add('hidden');renderNear();renderSwipe();},
  _=>{$('#geoBar')?.classList.add('hidden');},{enableHighAccuracy:true,timeout:8000});});
$('#dismissGeo')?.addEventListener('click', ()=> $('#geoBar')?.classList.add('hidden'));

/* Filtri */
$('#filterToggle')?.addEventListener('click', ()=>{ const p=$('#filterPanel'); if(p) p.hidden=!p.hidden; });
$('#filterForm')?.addEventListener('submit', e=>{
  e.preventDefault(); const f=e.currentTarget;
  filters.breed=f.breed.value||''; filters.ageBand=f.ageBand.value||''; filters.sex=f.sex.value||'';
  filters.size=f.size.value||''; filters.coat=f.coat.value||''; filters.energy=f.energy.value||'';
  filters.pedigree=f.pedigree.value||''; filters.distance=f.distance.value||'';
  $('#filterPanel').hidden=true; renderActiveChips(); currentView==='near'?renderNear():renderSwipe();
});
$('#filtersReset')?.addEventListener('click', ()=>{ $('#filterForm')?.reset(); filters={breed:'',ageBand:'',sex:'',size:'',coat:'',energy:'',pedigree:'',distance:''}; renderActiveChips(); currentView==='near'?renderNear():renderSwipe(); });

function renderActiveChips(){ const c=$('#activeChips'); if(!c) return; c.innerHTML=''; const map={breed:'Razza',ageBand:'Età',sex:'Sesso',size:'Taglia',coat:'Pelo',energy:'Energia',pedigree:'Pedigree',distance:'Distanza'}; Object.entries(filters).forEach(([k,v])=>{ if(!v) return; const w=el('span',{className:'chip-wrap'}); w.append(el('span',{className:'chip'},`${map[k]}: ${v}`)); w.append(el('button',{className:'chip-x',onclick:()=>{filters[k]='';renderActiveChips();currentView==='near'?renderNear():renderSwipe();}},'×')); c.append(w); }); }
function passesFilters(d,dist){ if(filters.breed&&!d.breed.toLowerCase().includes(filters.breed.toLowerCase()))return false; if(filters.ageBand&&band(d.age)!==filters.ageBand)return false; if(filters.sex&&d.sex!==filters.sex)return false; if(filters.size&&d.size!==filters.size)return false; if(filters.coat&&d.coat!==filters.coat)return false; if(filters.energy&&d.energy!==filters.energy)return false; if(filters.pedigree&&d.pedigree!==filters.pedigree)return false; if(filters.distance){const m=parseFloat(filters.distance); if(!isNaN(m)&&dist!=null&&dist>m)return false;} return true;}

/* VICINO */
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

/* SCORRI */
function filtered(){ return dogs.filter(d=>{ const dist=userPos?km(userPos,d.coords):randKm(); return passesFilters(d,dist); }); }
function renderSwipe(){
  const list=filtered(), img=$('#swipeImg'), title=$('#swipeTitle'), meta=$('#swipeMeta'), bio=$('#swipeBio');
  if(!list.length){ img.src=''; title.textContent=''; meta.textContent=''; bio.textContent='Nessun profilo per questi filtri.'; return; }
  const d=list[swipeIndex%list.length], dist=userPos?km(userPos,d.coords):randKm();
  img.src=d.image; img.alt=d.name; img.onerror=function(){this.style.display='none';};
  title.innerHTML=verifiedName(d); meta.textContent=`${dist} km da te`; bio.textContent=d.desc;

  const cardEl=document.querySelector('#swipe .deck .card')||document.querySelector('#swipe .card.big');
  if(cardEl){
    // anim di ingresso
    cardEl.classList.remove('pulse'); void cardEl.offsetWidth; cardEl.classList.add('pulse');

    // tap apre profilo (se non tocchi i bottoni)
    cardEl.addEventListener('click',(ev)=>{ if(ev.target.closest('.circle')) return; openProfilePage(d,dist); },{once:true});

    // gesture swipe col dito
    attachSwipeGestures(cardEl, d);
  }

  // bottoni con micro-anim + swipe breve
  $('#noBtn').onclick=()=>{ tinyBump('#noBtn'); if(cardEl){ cardEl.classList.add('swipe-left'); setTimeout(()=>swipe('no',d),220); } else swipe('no',d); };
  $('#yesBtn').onclick=()=>{ tinyBump('#yesBtn'); if(cardEl){ cardEl.classList.add('swipe-right'); setTimeout(()=>swipe('yes',d),220); } else swipe('yes',d); };
}
function tinyBump(sel){ const e=typeof sel==='string'?$(sel):sel; if(!e) return; e.classList.remove('button-bump'); void e.offsetWidth; e.classList.add('button-bump'); }
function swipe(type,d){ if(type==='yes'){ addMatch(d); incLikesMaybeAd(); } swipeIndex++; renderSwipe(); }

/* Swipe gesture helpers */
function attachSwipeGestures(cardEl, dogObj){
  if(!cardEl) return;
  let startX=0, startY=0, currentX=0, currentY=0, dragging=false, hasMoved=false;

  const onTouchStart = (e)=>{
    const t = e.touches ? e.touches[0] : e;
    startX = currentX = t.clientX;
    startY = currentY = t.clientY;
    dragging = true;
    hasMoved = false;
    cardEl.style.transition = 'none';
  };
  const onTouchMove = (e)=>{
    if(!dragging) return;
    const t = e.touches ? e.touches[0] : e;
    currentX = t.clientX; currentY = t.clientY;
    const dx = currentX - startX, dy = currentY - startY;

    if(Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 12) return;

    hasMoved = Math.abs(dx) > 6;
    const rot = Math.max(-10, Math.min(10, dx/12));
    cardEl.style.transform = `translateX(${dx}px) rotate(${rot}deg)`;
    cardEl.style.opacity = String(Math.max(0.35, 1 - Math.abs(dx)/600));
  };
  const onTouchEnd = ()=>{
    if(!dragging) return; dragging = false;
    const dx = currentX - startX; const threshold = 80;
    cardEl.style.transition = 'transform .18s ease-out, opacity .18s ease-out';

    if(dx > threshold){
      cardEl.style.transform = 'translateX(40%) rotate(6deg)'; cardEl.style.opacity = '0';
      setTimeout(()=> swipe('yes', dogObj), 180);
    } else if(dx < -threshold){
      cardEl.style.transform = 'translateX(-40%) rotate(-6deg)'; cardEl.style.opacity = '0';
      setTimeout(()=> swipe('no', dogObj), 180);
    } else {
      cardEl.style.transform = ''; cardEl.style.opacity = '';
      if(!hasMoved){
        const dist = userPos ? km(userPos, dogObj.coords) : randKm();
        openProfilePage(dogObj, dist);
      }
    }
  };

  cardEl.addEventListener('touchstart', onTouchStart, {passive:true});
  cardEl.addEventListener('touchmove',  onTouchMove,  {passive:true});
  cardEl.addEventListener('touchend',   onTouchEnd,   {passive:true});
  // supporto mouse (dev/test)
  cardEl.addEventListener('mousedown',  (e)=>{ onTouchStart(e); const mm=(ev)=>onTouchMove(ev), mu=()=>{ onTouchEnd(); document.removeEventListener('mousemove',mm); document.removeEventListener('mouseup',mu); }; document.addEventListener('mousemove',mm); document.addEventListener('mouseup',mu,{once:true}); });
}

/* PAGINA PROFILO FULLSCREEN */
function openProfilePage(d, distance){
  const page=document.getElementById('profilePage'), body=document.getElementById('ppBody'), title=document.getElementById('ppTitle');
  if(!page||!body) return;
  title.innerHTML=`${d.name} ${d.verified?'<span class="paw">🐾</span>':''}`;
  body.innerHTML=`
    <img class="pp-cover" src="${d.image}" alt="${d.name}" onerror="this.style.display='none'">
    <div class="pp-section">
      <h3>${d.name}, ${d.age}</h3>
      <div class="meta">${d.breed} · ${d.sex==='F'?'Femmina':'Maschio'} · ${d.size} · ${d.coat}</div>
      <div class="meta"><b>Energia:</b> ${d.energy} · <b>Pedigree:</b> ${d.pedigree} · <b>Zona:</b> ${d.area} · <b>Distanza:</b> ${distance??'-'} km</div>
      <p class="desc">${d.desc}</p>
      ${!d.verified?`<button class="btn light" onclick="_openDlg('verifyModal')">Carica documenti per badge</button>`:''}
      <div class="pp-actions">
        <button class="circle no" id="ppNo">🥲</button>
        <button class="circle like" id="ppYes">❤️</button>
      </div>
    </div>`;
  $('#ppNo').onclick=()=>closeProfilePage();
  $('#ppYes').onclick=()=>{ addMatch(d); incLikesMaybeAd(); closeProfilePage(); };
  page.classList.add('show');
}
function closeProfilePage(){ const page=document.getElementById('profilePage'); if(!page) return; page.classList.remove('show'); }
window.closeProfilePage=closeProfilePage;

/* MATCH & CHAT */
function addMatch(d){ if(!matches.find(m=>m.id===d.id)){ matches.push({id:d.id,name:d.name,img:d.image}); localStorage.setItem('pl_matches',JSON.stringify(matches)); } renderMatches(); }
function renderMatches(){ const box=$('#matchList'); if(!box) return; box.innerHTML=''; matches.forEach(m=>{ const row=el('div',{className:'item'}); row.innerHTML=`<img src="${m.img}" alt="${m.name}"><div><div><strong>${m.name}</strong></div><div class="muted small">Match</div></div><button class="btn primary pill go">Chat</button>`; row.querySelector('.go').onclick=()=>openChat(m); box.append(row); }); $('#emptyMatch').style.display=matches.length?'none':'block'; }
function openChat(m){ $('#chatAvatar').src=m.img; $('#chatName').textContent=m.name; $('#thread').innerHTML='<div class="bubble">Ciao! 🐾 Siamo un match!</div>'; $('#chat').classList.add('show'); }
$('#sendBtn')?.addEventListener('click',()=>{ const t=($('#chatInput').value||'').trim(); if(!t) return; const b=el('div',{className:'bubble me'},t); $('#thread').append(b); $('#chatInput').value=''; $('#thread').scrollTop=$('#thread').scrollHeight; });
$$('.close').forEach(b=>b.addEventListener('click',()=>$('#'+b.dataset.close)?.classList.remove('show')));

/* Adv placeholder */
function showInterstitial(){ openDialogSafe($('#interstitial')); }
function incLikesMaybeAd(){ likeCount++; localStorage.setItem('pl_like_count', String(likeCount)); if(likeCount%10===0) showInterstitial(); }

/* Avvio */
document.addEventListener('DOMContentLoaded', ()=>{
  $('#ctaEnter')?.addEventListener('click', e=>{ e.preventDefault(); goHome(); });
  $$('.tab').forEach(t=>t.addEventListener('click',()=>switchTab(t.dataset.tab)));
  $('#loginSubmit')?.addEventListener('click',()=>$('#sheetLogin')?.classList.remove('show'));
  $('#registerSubmit')?.addEventListener('click',()=>$('#sheetRegister')?.classList.remove('show'));
  $('#openPrivacy')?.addEventListener('click',()=>openDialogSafe($('#privacyDlg')));
  $('#openTerms')?.addEventListener('click',()=>openDialogSafe($('#termsDlg')));
  renderActiveChips();
});
