/* =========================================================
   Plutoo – app.js (completo, parte 1/2)
   Android/WebView friendly
   =========================================================
   - Swipe col dito in “Scorri”
   - Pagina profilo full-screen: galleria foto + post/stato
   - Verifica documenti (proprietario + cane) → badge 🐾 attivo solo se entrambi caricati
   - Filtri, chips, match/chat, adv placeholder
   - Sponsor footer con frase aggiornata
   - Persistenza locale in localStorage
   ---------------------------------------------------------
   AdMob IDs (per futuro porting Capacitor/Cordova)
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

  // 👇 Nuovi profili demo
  { id:7, name:'Maya',  age:1, breed:'Barboncino',        sex:'F', size:'Piccola', coat:'Riccio', energy:'Alta', pedigree:'Sì', area:'Roma – Trastevere', desc:'Vivace, ama giocare con altri cani.', image:'dog3.jpg', online:true,  verified:false, coords:{lat:41.889, lon:12.471} },
  { id:8, name:'Thor',  age:6, breed:'Pastore Tedesco',   sex:'M', size:'Grande',  coat:'Medio',  energy:'Alta', pedigree:'Sì', area:'Roma – San Giovanni', desc:'Protettivo e molto fedele.', image:'dog4.jpg', online:false, verified:true, coords:{lat:41.892, lon:12.507} },
  { id:9, name:'Kira',  age:4, breed:'Bulldog Francese',  sex:'F', size:'Piccola', coat:'Corto',  energy:'Media', pedigree:'No', area:'Roma – Testaccio', desc:'Coccolona e simpatica.', image:'dog2.jpg', online:true, verified:false, coords:{lat:41.876, lon:12.482} },
];

/* ===================== STATO ===================== */
let currentView='near', userPos=null, likeCount=+(localStorage.getItem('pl_like_count')||'0');
let matches = JSON.parse(localStorage.getItem('pl_matches')||'[]');
let swipeIndex=0;
let filters = { breed:'', ageBand:'', sex:'', size:'', coat:'', energy:'', pedigree:'', distance:'' };

/* ===================== UTILS BASE ===================== */
const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
const el=(t,a={},h='')=>{const n=document.createElement(t);Object.entries(a).forEach(([k,v])=>{k in n?n[k]=v:n.setAttribute(k,v)});if(h)n.innerHTML=h;return n};
function km(a,b){ if(!a||!b) return null; const R=6371; const dLat=(b.lat-a.lat)*Math.PI/180; const dLon=(b.lon-a.lon)*Math.PI/180; const la1=a.lat*Math.PI/180, la2=b.lat*Math.PI/180; const x=Math.sin(dLat/2)**2+Math.sin(dLon/2)**2*Math.cos(la1)*Math.cos(la2); return +(R*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x))).toFixed(1); }
const randKm=()=>+(Math.random()*7+0.5).toFixed(1);
const band=a=>a<=1?'0–1':a<=4?'2–4':a<=7?'5–7':'8+';

/* ===================== STORAGE VERIFICA/PROFILO ===================== */
function _veriMap(){ try{return JSON.parse(localStorage.getItem('pl_verify')||'{}')}catch(_){return {}} }
function _saveVeri(map){ localStorage.setItem('pl_verify', JSON.stringify(map)); }
function getProfileStore(id){ const m=_veriMap(); if(!m[id]) m[id]={ owner:false, dog:false, gallery:[], posts:[] }; return m[id]; }
function setProfileStore(id, data){ const m=_veriMap(); m[id]=data; _saveVeri(m); }
function isVerified(d){ const st=getProfileStore(d.id); return d.verified || (st.owner && st.dog); }

/* badge con icona grafica (CSS .paw) */
const verifiedName=d=>`${d.name}, ${d.age} • ${d.breed}${isVerified(d)?' <span class="paw"></span>':''}`;

/* ===================== DIALOG SAFE ===================== */
function openDialogSafe(dlg){ if(!dlg) return; if(typeof dlg.showModal==='function'){try{dlg.showModal();return;}catch(_){}} dlg.setAttribute('open',''); dlg.classList.add('fallback'); document.body.style.overflow='hidden'; }
function closeDialogSafe(dlg){ if(!dlg) return; if(typeof dlg.close==='function'){try{dlg.close();}catch(_){}} dlg.classList.remove('fallback'); dlg.removeAttribute('open'); document.body.style.overflow=''; }
window._openDlg=id=>openDialogSafe(document.getElementById(id));
window._closeDlg=id=>closeDialogSafe(document.getElementById(id));

/* ===================== NAV/APP ===================== */
function show(sel){ $$('.screen').forEach(s=>s.classList.remove('active')); (typeof sel==='string'?$(sel):sel)?.classList.add('active'); }
function switchTab(tab){ currentView=tab; $$('.tab').forEach(b=>b.classList.toggle('active', b.dataset.tab===tab)); $$('.tabpane').forEach(p=>p.classList.remove('active')); $('#'+tab)?.classList.add('active'); if(tab==='near') renderNear(); if(tab==='swipe') renderSwipe(); if(tab==='matches') renderMatches(); }
function goHome(){ show('#app'); $('#geoBar')?.classList.remove('hidden'); renderNear(); renderSwipe(); renderMatches(); ensureSponsorFooter(); }
window.goHome=goHome;

/* ===================== GEO ===================== */
$('#enableGeo')?.addEventListener('click', ()=>{ navigator.geolocation.getCurrentPosition(
  pos=>{userPos={lat:pos.coords.latitude,lon:pos.coords.longitude};$('#geoBar')?.classList.add('hidden');renderNear();renderSwipe();},
  _=>{$('#geoBar')?.classList.add('hidden');},{enableHighAccuracy:true,timeout:8000});});
$('#dismissGeo')?.addEventListener('click', ()=> $('#geoBar')?.classList.add('hidden'));

/* ===================== FILTRI ===================== */
function toggleSearch(){ const p=$('#filterPanel'); if(p) p.hidden=!p.hidden; }
window.toggleSearch=toggleSearch;

function clearFilters(){ filters={ breed:'',ageBand:'',sex:'',size:'',coat:'',energy:'',pedigree:'',distance:'' }; $('#filterForm')?.reset(); renderActiveChips(); if(currentView==='near')renderNear(); else if(currentView==='swipe')renderSwipe(); else renderMatches(); }
window.clearFilters=clearFilters;

function apply(e){ if(e) e.preventDefault(); const f=$('#filterForm'); if(!f)return; filters.breed=f.breed.value||''; filters.ageBand=f.ageBand.value||''; filters.sex=f.sex.value||''; filters.size=f.size.value||''; filters.coat=f.coat.value||''; filters.energy=f.energy.value||''; filters.pedigree=f.pedigree.value||''; filters.distance=f.distance.value||''; $('#filterPanel').hidden=true; renderActiveChips(); if(currentView==='near')renderNear(); else if(currentView==='swipe')renderSwipe(); else renderMatches(); }
window.apply=apply;

function renderActiveChips(){ const c=$('#activeChips'); if(!c)return; c.innerHTML=''; const map={breed:'Razza',ageBand:'Età',sex:'Sesso',size:'Taglia',coat:'Pelo',energy:'Energia',pedigree:'Pedigree',distance:'Distanza'}; Object.entries(filters).forEach(([k,v])=>{if(v){const chip=el('span',{className:'chip'},`${map[k]}: ${v}`); const x=el('button',{className:'chip-x',onclick:()=>{filters[k]='';renderActiveChips();if(currentView==='near')renderNear();else if(currentView==='swipe')renderSwipe();else renderMatches();}},'×'); const wrap=el('span',{className:'chip-wrap'}); wrap.append(chip,x); c.appendChild(wrap);}}); }

/* ===================== RENDER VICINO ===================== */
function passesFilters(d,dist){ if(filters.breed && !d.breed.toLowerCase().includes(filters.breed.toLowerCase())) return false; if(filters.ageBand && band(d.age)!==filters.ageBand) return false; if(filters.sex && d.sex!==filters.sex) return false; if(filters.size && d.size!==filters.size) return false; if(filters.coat && d.coat!==filters.coat) return false; if(filters.energy && d.energy!==filters.energy) return false; if(filters.pedigree && d.pedigree!==filters.pedigree) return false; if(filters.distance){const maxd=parseFloat(filters.distance); if(!isNaN(maxd)&&dist!=null&&dist>maxd)return false;} return true; }

function renderNear(){ const wrap=$('#grid'); if(!wrap)return; wrap.innerHTML=''; const list=dogs.slice().sort((a,b)=>{const da=userPos?km(userPos,a.coords):randKm(); const db=userPos?km(userPos,b.coords):randKm(); return (da??9)-(db??9)}); const filtered=[]; list.forEach(d=>{const dist=userPos?km(userPos,d.coords):randKm(); if(passesFilters(d,dist)) filtered.push({d,dist});}); filtered.forEach(({d,dist})=>{const card=el('article',{className:'card'}); card.innerHTML=`${d.online?'<span class="online"></span>':''}<img src="${d.image}" alt="${d.name}" onerror="this.style.display='none'"><div class="card-info"><div class="title"><div class="name">${verifiedName(d)}</div><div class="dist">${dist} km</div></div><div class="actions"><button class="circle no">🥲</button><button class="circle like">❤️</button></div></div>`; card.querySelector('.no').onclick=()=>card.remove(); card.querySelector('.like').onclick=()=>{addMatch(d);incLikesMaybeAd();}; card.addEventListener('click',ev=>{if(ev.target.closest('.circle'))return;openProfilePage(d,dist);}); wrap.appendChild(card);}); $('#emptyNear')?.classList.toggle('hidden',filtered.length>0); }

/* ===================== RENDER SWIPE ===================== */
function renderSwipe(){ const root=$('#swipe .deck'); if(!root)return; const list=dogs.filter(d=>{const dist=userPos?km(userPos,d.coords):randKm();return passesFilters(d,dist);}); if(!list.length){root.innerHTML=`<div class="empty">Nessun profilo.</div>`;return;} const d=list[swipeIndex%list.length]; const dist=userPos?km(userPos,d.coords):randKm(); root.innerHTML=`<article class="card big pulse"><img src="${d.image}" alt="${d.name}" onerror="this.style.display='none'"><div class="card-info"><div class="title"><div class="name">${verifiedName(d)}</div><div class="dist">${dist} km</div></div><p class="bio">${d.desc}</p><div class="actions"><button id="swNo" class="circle no">🥲</button><button id="swYes" class="circle like">❤️</button></div></div></article>`; $('#swNo').onclick=()=>{swipe('no');}; $('#swYes').onclick=()=>{swipe('yes',d);}; root.querySelector('.card').addEventListener('click',ev=>{if(ev.target.closest('.circle'))return;openProfilePage(d,dist);}); enableSwipeGesture(root,d); }

function swipe(type,d){ if(type==='yes'&&d){addMatch(d);incLikesMaybeAd();} swipeIndex++; renderSwipe(); }
function enableSwipeGesture(elm,d){ let startX=0; elm.addEventListener('touchstart',e=>{startX=e.touches[0].clientX;}); elm.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-startX; if(Math.abs(dx)>60){ if(dx>0) swipe('yes',d); else swipe('no'); }}); }

/* ===================== PAGINA PROFILO FULL ===================== */
function openProfilePage(d,dist){ const dlg=$('#dogModal'); const body=$('#modalBody'); if(!dlg||!body)return; const store=getProfileStore(d.id); const galleryHtml=store.gallery.map(src=>`<img class="thumb" src="${src}" alt="">`).join(''); const postsHtml=store.posts.map(p=>`<div class="post">${p}</div>`).join(''); body.innerHTML=`<div class="profile"><img class="cover" src="${d.image}" alt="${d.name}"><h2>${d.name}, ${d.age} ${isVerified(d)?'<span class="paw"></span>':''}</h2><div class="meta">${d.breed} • ${d.sex==='F'?'Femmina':'Maschio'} • ${d.size} • ${d.coat}</div><div class="meta"><b>Energia:</b> ${d.energy} • <b>Pedigree:</b> ${d.pedigree} • <b>Zona:</b> ${d.area}</div><div class="meta"><b>Distanza:</b> ${dist} km</div><p>${d.desc}</p><div class="gallery">${galleryHtml||'<em>Nessuna foto extra</em>'}</div><div class="uploader"><input type="file" id="upPhoto" multiple></div><div class="status"><input id="postText" class="inp" placeholder="Scrivi uno stato…"><button id="sendPost" class="btn primary xs">Pubblica</button></div><div class="posts">${postsHtml||''}</div><div class="verify">${isVerified(d)?'Profilo verificato 🐾':`<button id="verifyBtn" class="btn light">Carica documenti</button>`}</div><div class="actions"><button id="mdNo" class="circle no">🥲</button><button id="mdYes" class="circle like">❤️</button></div></div>`; openDialogSafe(dlg); $('#mdNo').onclick=()=>closeDialogSafe(dlg); $('#mdYes').onclick=()=>{addMatch(d);incLikesMaybeAd();closeDialogSafe(dlg);}; $('#upPhoto').onchange=e=>{const files=[...e.target.files].map(f=>URL.createObjectURL(f)); store.gallery.push(...files); setProfileStore(d.id,store); openProfilePage(d,dist);}; $('#sendPost').onclick=()=>{const t=$('#postText').value.trim(); if(t){store.posts.unshift(t); setProfileStore(d.id,store); openProfilePage(d,dist);}}; $('#verifyBtn')?.addEventListener('click',()=>{store.owner=true;store.dog=true;setProfileStore(d.id,store);openProfilePage(d,dist);}); }

/* ===================== MATCH & CHAT ===================== */
function addMatch(d){ if(!matches.find(m=>m.id===d.id)){matches.push({id:d.id,name:d.name,img:d.image}); localStorage.setItem('pl_matches',JSON.stringify(matches));} renderMatches(); }
function renderMatches(){ const box=$('#matchList'); if(!box)return; box.innerHTML=''; matches.forEach(m=>{const row=el('div',{className:'item'}); row.innerHTML=`<img src="${m.img}" alt="${m.name}"><div><strong>${m.name}</strong><div class="muted small">Match</div></div><button class="btn primary pill go">Chat</button>`; row.querySelector('.go').onclick=()=>openChat(m); box.appendChild(row);}); $('#emptyMatch').style.display=matches.length?'none':'block'; }
function openChat(m){ $('#chatAvatar').src=m.img; $('#chatName').textContent=m.name; $('#thread').innerHTML='<div class="bubble">Ciao! 🐾 Siamo un match!</div>'; $('#chat').classList.add('show'); }
$('#sendBtn')?.addEventListener('click',()=>{const t=$('#chatInput').value.trim(); if(!t)return; $('#thread').innerHTML+=`<div class="bubble me">${t}</div>`; $('#chatInput').value=''; $('#thread').scrollTop=$('#thread').scrollHeight;});

/* ===================== ADV PLACEHOLDER ===================== */
function incLikesMaybeAd(){ likeCount++; localStorage.setItem('pl_like_count',String(likeCount)); if(likeCount%10===0) $('#interstitial')?.showModal(); }

/* ===================== SPONSOR FOOTER ===================== */
function ensureSponsorFooter(){ const f=$('.sponsor-foot'); if(f)return; const foot=el('div',{className:'sponsor-foot'}); foot.innerHTML=`<div class="sponsor-label">Sponsor ufficiale</div><div class="sponsor-line">Fido gelato per gli amici a quattro zampe<br><span class="muted">Sottotitoli e revisione a cura di QTSS</span></div><a href="https://www.gelatofido.it/" target="_blank"><img src="sponsor-logo.png" class="sponsor-img" alt="Fido"></a>`; $('#app').appendChild(foot); }

/* ===================== INIT ===================== */
document.addEventListener('DOMContentLoaded',()=>{ $('#ctaEnter')?.addEventListener('click',goHome); $$('.tab').forEach(t=>t.addEventListener('click',()=>switchTab(t.dataset.tab))); $('#filterForm')?.addEventListener('submit',apply); $('#filtersReset')?.addEventListener('click',clearFilters); $('#btnLoginTop')?.addEventListener('click',()=>$('#sheetLogin')?.classList.add('show')); $('#btnRegisterTop')?.addEventListener('click',()=>$('#sheetRegister')?.classList.add('show')); $$('.close').forEach(b=>b.addEventListener('click',()=>$('#'+b.dataset.close)?.classList.remove('show'))); $('#openPrivacy')?.addEventListener('click',()=>_openDlg('privacyDlg')); $('#openTerms')?.addEventListener('click',()=>_openDlg('termsDlg')); });
