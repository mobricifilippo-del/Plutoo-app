/* =========================================================
   Plutoo – app.js (Android/WebView friendly, FINAL)
   ----------------------------------------------------------------
   - Tabs: Vicino | Amore (🥲/❤️) | Giocare/Camminare (🥲/🐕) | Match
   - Swipe fluido (touch/mouse) nelle card singole (Amore/Social)
   - Griglia “Vicino a te” tappabile → apre profilo
   - Profilo fullscreen con:
       • cover dog, info, badge
       • Galleria foto
       • Card “🤳🏾 Selfie con il tuo amico a quattro zampe”
         - blur se non c’è match e non sbloccato
         - tap → interstitial “video” → sblocco 24h per quel profilo
         - se match, visibile subito
       • Stato (post)
       • Verifica documenti (owner/dog) → interstitial simulata
   - Sponsor footer elegante centrato (in index.html + CSS)
   - NIENTE testi di limiti like. Annuncio usato solo per selfie/doc.
   - Immagini: usa dog1.jpg… con fallback; preloading per evitare nero.
   - Difensivo: se un nodo non esiste, skip senza crash.
   ========================================================= */

/* ===================== DATI DEMO ===================== */
const dogs = [
  { id:1, name:'Luna',  age:1, breed:'Jack Russell',      sex:'F', size:'Piccola', coat:'Corto', energy:'Alta',  pedigree:'No', area:'Roma – Monteverde', desc:'Curiosa e giocherellona, ama la pallina.', image:'dog1.jpg', online:true,  verified:true,  intents:['play','mate'], coords:{lat:41.898, lon:12.498} },
  { id:2, name:'Rocky', age:3, breed:'Labrador Retriever',sex:'M', size:'Media',   coat:'Corto', energy:'Media', pedigree:'No', area:'Roma – Eur',        desc:'Affettuoso e fedele, perfetto per passeggiate.', image:'dog2.jpg', online:true,  verified:false, intents:['walk'], coords:{lat:41.901, lon:12.476} },
  { id:3, name:'Bella', age:2, breed:'Shiba Inu',         sex:'F', size:'Piccola', coat:'Medio', energy:'Media', pedigree:'Sì', area:'Roma – Prati',      desc:'Elegante e curiosa, cerca partner per accoppiamento.', image:'dog3.jpg', online:true,  verified:true,  intents:['mate'], coords:{lat:41.914, lon:12.495} },
  { id:4, name:'Max',   age:4, breed:'Golden Retriever',  sex:'M', size:'Grande',  coat:'Lungo', energy:'Alta',  pedigree:'No', area:'Roma – Tuscolana',  desc:'Socievole, adora l’acqua e giocare in gruppo.', image:'dog4.jpg', online:true,  verified:false, intents:['play','walk'], coords:{lat:41.887, lon:12.512} },
  { id:5, name:'Daisy', age:2, breed:'Beagle',            sex:'F', size:'Piccola', coat:'Corto', energy:'Alta',  pedigree:'No', area:'Roma – Garbatella', desc:'Instancabile esploratrice, ama correre.', image:'dog1.jpg', online:true,  verified:false, intents:['play'], coords:{lat:41.905, lon:12.450} },
  { id:6, name:'Nero',  age:5, breed:'Meticcio',          sex:'M', size:'Media',   coat:'Medio', energy:'Media', pedigree:'No', area:'Roma – Nomentana',  desc:'Tranquillo e dolce, passeggiate in città.', image:'dog2.jpg', online:true,  verified:false, intents:['walk','mate'], coords:{lat:41.930, lon:12.500} },
];

/* ===================== STATO ===================== */
let currentView='near', userPos=null;
let matches = readLS('pl_matches', []);
let swipeLoveIdx=0, swipeSocIdx=0;
let filters = { breed:'', ageBand:'', sex:'', size:'', coat:'', energy:'', pedigree:'', distance:'' };

/* ===================== UTILS ===================== */
const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
const el=(t,a={},h='')=>{const n=document.createElement(t);Object.entries(a).forEach(([k,v])=>{k in n?n[k]=v:n.setAttribute(k,v)});if(h)n.innerHTML=h;return n};
function km(a,b){ if(!a||!b) return null; const R=6371; const dLat=(b.lat-a.lat)*Math.PI/180; const dLon=(b.lon-a.lon)*Math.PI/180; const la1=a.lat*Math.PI/180, la2=b.lat*Math.PI/180; const x=Math.sin(dLat/2)**2 + Math.sin(dLon/2)**2*Math.cos(la1)*Math.cos(la2); return +(R*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x))).toFixed(1); }
const randKm=()=>+(Math.random()*7+0.5).toFixed(1);
const band=a=>a<=1?'0–1':a<=4?'2–4':a<=7?'5–7':'8+';
function readLS(k, fallback){ try{const v=localStorage.getItem(k); return v?JSON.parse(v):fallback}catch(_){return fallback} }
function writeLS(k, v){ localStorage.setItem(k, JSON.stringify(v)); }
function openDialogSafe(dlg){ if(!dlg) return; if(typeof dlg.showModal==='function'){try{dlg.showModal();return;}catch(_){}} dlg.setAttribute('open',''); dlg.classList.add('fallback'); document.body.style.overflow='hidden'; }
function closeDialogSafe(dlg){ if(!dlg) return; if(typeof dlg.close==='function'){try{dlg.close();}catch(_){}} dlg.classList.remove('fallback'); dlg.removeAttribute('open'); document.body.style.overflow=''; }
const verifiedName=d=>`${d.name}, ${d.age} • ${d.breed}${isVerified(d)?' <span class="paw">🐾</span>':''}`;

/* === verifica doc / badge (persistenza) === */
function _veriMap(){ return readLS('pl_verify', {}) }
function _saveVeri(map){ writeLS('pl_verify', map); }
function getProfileStore(id){
  const m=_veriMap();
  if(!m[id]) m[id]={ owner:false, dog:false, gallery:[], selfies:[], posts:[] };
  return m[id];
}
function setProfileStore(id, data){ const m=_veriMap(); m[id]=data; _saveVeri(m); }
function isVerified(d){ const st=getProfileStore(d.id); return d.verified || (st.owner && st.dog); }

/* === selfie gating 24h === */
function selfieGateMap(){ return readLS('pl_selfie_gate', {}) }
function setSelfieGate(dogId, ts){ const m=selfieGateMap(); m[dogId]=ts; writeLS('pl_selfie_gate', m); }
function selfieGateValid(dogId){ const m=selfieGateMap(); const ts=m[dogId]; if(!ts) return false; return (Date.now()-ts) < 24*60*60*1000; }

/* ===================== NAV/APP ===================== */
function show(sel){ $$('.screen').forEach(s=>s.classList.remove('active')); (typeof sel==='string'?$(sel):sel)?.classList.add('active'); }
function switchTab(tab){
  currentView=tab;
  $$('.tab').forEach(b=>b.classList.toggle('active', b.dataset.tab===tab));
  $$('.tabpane').forEach(p=>p.classList.remove('active'));
  $('#'+tab)?.classList.add('active');
  if(tab==='near') renderNear();
  if(tab==='love') renderLove();
  if(tab==='social') renderSocial();
  if(tab==='matches') renderMatches();
}
function goHome(){ show('#app'); $('#geoBar')?.classList.remove('hidden'); renderAll(); }
window.goHome=goHome;
function renderAll(){ renderActiveChips(); renderNear(); renderLove(); renderSocial(); renderMatches(); }

/* ===================== GEO ===================== */
$('#enableGeo')?.addEventListener('click', ()=>{ navigator.geolocation.getCurrentPosition(
  pos=>{userPos={lat:pos.coords.latitude,lon:pos.coords.longitude};$('#geoBar')?.classList.add('hidden');renderAll();},
  _=>{$('#geoBar')?.classList.add('hidden');renderAll();},{enableHighAccuracy:true,timeout:8000});});
$('#dismissGeo')?.addEventListener('click', ()=> $('#geoBar')?.classList.add('hidden'));

/* ===================== FILTRI ===================== */
$('#filterToggle')?.addEventListener('click', ()=>{ const p=$('#filterPanel'); if(p) p.hidden=!p.hidden; });
$('#filterForm')?.addEventListener('submit', e=>{
  e.preventDefault(); const f=e.currentTarget;
  const bi=$('#breedInput'); filters.breed=bi?(bi.value||''):'';
  filters.ageBand=f.ageBand.value||''; filters.sex=f.sex.value||'';
  filters.size=f.size.value||''; filters.coat=f.coat.value||''; filters.energy=f.energy.value||'';
  filters.pedigree=f.pedigree.value||''; filters.distance=f.distance.value||'';
  $('#filterPanel').hidden=true; renderActiveChips(); renderAll();
});
$('#filtersReset')?.addEventListener('click', ()=>{
  $('#filterForm')?.reset(); const bi=$('#breedInput'); if(bi) bi.value='';
  filters={breed:'',ageBand:'',sex:'',size:'',coat:'',energy:'',pedigree:'',distance:''};
  renderActiveChips(); renderAll();
});

/* ===== popola datalist razze.json ===== */
fetch('razze.json',{cache:'no-store'}).then(r=>r.ok?r.json():[]).then(list=>{
  if(Array.isArray(list)){ const dl=$('#breedList'); if(dl){ dl.innerHTML=''; list.forEach(b=>{ const o=document.createElement('option'); o.value=String(b); dl.appendChild(o); }); } }
}).catch(()=>{ /* ok se manca */ });

function renderActiveChips(){
  const c=$('#activeChips'); if(!c) return; c.innerHTML='';
  const map={breed:'Razza',ageBand:'Età',sex:'Sesso',size:'Taglia',coat:'Pelo',energy:'Energia',pedigree:'Pedigree',distance:'Distanza'};
  Object.entries(filters).forEach(([k,v])=>{
    if(!v) return; const w=el('span',{className:'chip-wrap'});
    w.append(el('span',{className:'chip'},`${map[k]}: ${v}`));
    w.append(el('button',{className:'chip-x',onclick:()=>{filters[k]='';renderActiveChips(); renderAll(); }},'×'));
    c.append(w);
  });
}
function passesFilters(d,dist){
  if(filters.breed && !d.breed.toLowerCase().includes(filters.breed.toLowerCase())) return false;
  if(filters.ageBand && band(d.age)!==filters.ageBand) return false;
  if(filters.sex && d.sex!==filters.sex) return false;
  if(filters.size && d.size!==filters.size) return false;
  if(filters.coat && d.coat!==filters.coat) return false;
  if(filters.energy && d.energy!==filters.energy) return false;
  if(filters.pedigree && d.pedigree!==filters.pedigree) return false;
  if(filters.distance){ const m=parseFloat(filters.distance); if(!isNaN(m) && dist!=null && dist>m) return false; }
  return true;
}

/* ===================== VICINO (griglia) ===================== */
function renderNear(){
  const grid=$('#grid'); if(!grid) return; grid.innerHTML='';
  // preload images to avoid black flashes
  dogs.forEach(d=>{ const im=new Image(); im.src=d.image; });

  const ordered=dogs.slice().map(d=>({d,dist:userPos?km(userPos,d.coords):randKm()})).sort((a,b)=>(a.dist??99)-(b.dist??99));
  const rows=ordered.filter(r=>passesFilters(r.d,r.dist));
  rows.forEach(({d,dist})=>{
    const card=el('article',{className:'card'});
    card.innerHTML=`
      ${d.online?'<span class="online"></span>':''}
      <img src="${d.image}" alt="${d.name}" onerror="this.src='sponsor-logo.png'">
      <div class="card-info">
        <div class="title">
          <div class="name">${verifiedName(d)}</div>
          <div class="dist">${dist??'-'} km</div>
        </div>
        <div class="intent-pill">${renderIntentText(d)}</div>
        <div class="actions">
          <button class="circle no" title="No">🥲</button>
          <button class="circle like" title="Mi piace">❤️</button>
          <button class="circle dog" title="Social">🐕</button>
        </div>
      </div>`;
    // azioni
    card.querySelector('.no').onclick=e=>{e.stopPropagation();card.remove();};
    card.querySelector('.like').onclick=e=>{e.stopPropagation(); addMatch(d); showMatchAnim(d); };
    card.querySelector('.dog').onclick=e=>{e.stopPropagation(); addMatch(d); showMatchAnim(d); };
    // click card = profilo
    card.addEventListener('click',ev=>{ if(ev.target.closest('.circle')) return; const dd=userPos?km(userPos,d.coords):randKm(); openProfilePage(d,dd); });
    grid.append(card);
  });
  $('#counter').textContent=`Mostro ${rows.length} profili`;
  $('#emptyNear')?.classList.toggle('hidden', rows.length>0);
}
function renderIntentText(d){
  const set = d.intents||[];
  if(set.includes('mate')) return '❤️ Amore';
  if(set.includes('play') && set.includes('walk')) return '🐕 Giochiamo / Camminiamo';
  if(set.includes('play')) return '🎾 Giochiamo';
  if(set.includes('walk')) return '🐕 Camminiamo';
  return 'Disponibile';
}

/* ===================== AMORE (card singola) ===================== */
function loveList(){ return dogs.filter(d=> (d.intents||[]).includes('mate') && passesFilters(d, userPos?km(userPos,d.coords):randKm())); }
function renderLove(){
  const list=loveList(), img=$('#loveImg'), title=$('#loveTitle'), meta=$('#loveMeta'), bio=$('#loveBio');
  const cardEl=$('#love .card.big');
  if(!list.length){ if(img) img.src=''; if(title) title.textContent=''; if(meta) meta.textContent=''; if(bio) bio.textContent='Nessun profilo in Amore.'; return; }
  const d=list[swipeLoveIdx%list.length], dist=userPos?km(userPos,d.coords):randKm();
  if(img){ img.src=d.image; img.alt=d.name; img.onerror=()=>{ img.src='sponsor-logo.png'; }; }
  if(title) title.innerHTML=verifiedName(d);
  if(meta) meta.textContent=`${dist} km`;
  if(bio) bio.textContent=d.desc;

  if(cardEl){ cardEl.classList.remove('pulse'); void cardEl.offsetWidth; cardEl.classList.add('pulse'); attachSwipeGestures(cardEl, d, 'love'); }
  $('#loveNo')?.addEventListener('click',()=>swipeLove('no',d),{once:true});
  $('#loveYes')?.addEventListener('click',()=>swipeLove('yes',d),{once:true});
  cardEl?.addEventListener('click',(ev)=>{ if(ev.target.closest('.circle')) return; openProfilePage(d,dist); },{once:true});
}
function swipeLove(type,d){
  if(type==='yes'){ addMatch(d); showMatchAnim(d); }
  swipeLoveIdx++; renderLove();
}

/* ===================== SOCIAL (card singola) ===================== */
function socialList(){ return dogs.filter(d=> ((d.intents||[]).includes('play') || (d.intents||[]).includes('walk')) && passesFilters(d, userPos?km(userPos,d.coords):randKm())); }
function renderSocial(){
  const list=socialList(), img=$('#socImg'), title=$('#socTitle'), meta=$('#socMeta'), bio=$('#socBio');
  const cardEl=$('#social .card.big');
  if(!list.length){ if(img) img.src=''; if(title) title.textContent=''; if(meta) meta.textContent=''; if(bio) bio.textContent='Nessun profilo in Giocare/Camminare.'; return; }
  const d=list[swipeSocIdx%list.length], dist=userPos?km(userPos,d.coords):randKm();
  if(img){ img.src=d.image; img.alt=d.name; img.onerror=()=>{ img.src='sponsor-logo.png'; }; }
  if(title) title.innerHTML=verifiedName(d);
  if(meta) meta.textContent=`${dist} km`;
  if(bio) bio.textContent=d.desc;

  if(cardEl){ cardEl.classList.remove('pulse'); void cardEl.offsetWidth; cardEl.classList.add('pulse'); attachSwipeGestures(cardEl, d, 'social'); }
  $('#socNo')?.addEventListener('click',()=>swipeSoc('no',d),{once:true});
  $('#socYes')?.addEventListener('click',()=>swipeSoc('yes',d),{once:true});
  cardEl?.addEventListener('click',(ev)=>{ if(ev.target.closest('.circle')) return; openProfilePage(d,dist); },{once:true});
}
function swipeSoc(type,d){
  if(type==='yes'){ addMatch(d); showMatchAnim(d); }
  swipeSocIdx++; renderSocial();
}

/* ---- Swipe gesture helpers ---- */
function attachSwipeGestures(cardEl, dogObj, mode){
  if(!cardEl || cardEl._swipeBound) return; cardEl._swipeBound = true;
  let startX=0,startY=0,currentX=0,currentY=0,dragging=false,hasMoved=false;
  const onTouchStart = (e)=>{ const t=e.touches?e.touches[0]:e; startX=currentX=t.clientX; startY=currentY=t.clientY; dragging=true; hasMoved=false; cardEl.style.transition='none'; };
  const onTouchMove  = (e)=>{ if(!dragging) return; const t=e.touches?e.touches[0]:e; currentX=t.clientX; currentY=t.clientY; const dx=currentX-startX, dy=currentY-startY; if(Math.abs(dy)>Math.abs(dx)&&Math.abs(dy)>12) return; hasMoved=Math.abs(dx)>6; const rot=Math.max(-10,Math.min(10,dx/12)); cardEl.style.transform=`translateX(${dx}px) rotate(${rot}deg)`; cardEl.style.opacity=String(Math.max(.35,1-Math.abs(dx)/600)); };
  const onTouchEnd   = ()=>{ if(!dragging) return; dragging=false; const dx=currentX-startX; cardEl.style.transition='transform .18s ease-out, opacity .18s ease-out';
    if(dx>80){ cardEl.style.transform='translateX(40%) rotate(6deg)'; cardEl.style.opacity='0'; setTimeout(()=> (mode==='love'?swipeLove('yes',dogObj):swipeSoc('yes',dogObj)),180);}
    else if(dx<-80){ cardEl.style.transform='translateX(-40%) rotate(-6deg)'; cardEl.style.opacity='0'; setTimeout(()=> (mode==='love'?swipeLove('no',dogObj):swipeSoc('no',dogObj)),180);}
    else { cardEl.style.transform=''; cardEl.style.opacity=''; if(!hasMoved){ const dist=userPos?km(userPos,dogObj.coords):randKm(); openProfilePage(dogObj,dist);} }
  };
  cardEl.addEventListener('touchstart', onTouchStart,{passive:true});
  cardEl.addEventListener('touchmove',  onTouchMove, {passive:true});
  cardEl.addEventListener('touchend',   onTouchEnd,  {passive:true});
  // mouse support
  cardEl.addEventListener('mousedown',(e)=>{ onTouchStart(e); const mm=(ev)=>onTouchMove(ev); const mu=()=>{ onTouchEnd(); document.removeEventListener('mousemove',mm); document.removeEventListener('mouseup',mu); }; document.addEventListener('mousemove',mm); document.addEventListener('mouseup',mu,{once:true}); });
}

/* ===================== MATCH & CHAT ===================== */
function addMatch(d){ if(!matches.find(m=>m.id===d.id)){ matches.push({id:d.id, name:d.name, img:d.image}); writeLS('pl_matches', matches); } renderMatches(); }
function renderMatches(){
  const box=$('#matchList'); if(!box) return; box.innerHTML='';
  matches.forEach(m=>{
    const row=el('div',{className:'item'});
    row.innerHTML = `
      <img src="${m.img}" alt="${m.name}" onerror="this.src='sponsor-logo.png'">
      <div>
        <div><strong>${m.name}</strong></div>
        <div class="muted small">Match</div>
      </div>
      <button class="btn primary pill go">Chat</button>
    `;
    row.querySelector('.go').onclick = ()=> openChat(m);
    box.append(row);
  });
  $('#emptyMatch').style.display = matches.length ? 'none' : 'block';
}
function openChat(m){
  $('#chatAvatar').src=m.img; $('#chatName').textContent=m.name;
  $('#thread').innerHTML='<div class="bubble">Ciao! 🐾 Siamo un match!</div>';
  $('#chat').classList.add('show');
}
$('#sendBtn')?.addEventListener('click',()=>{
  const t=($('#chatInput').value||'').trim(); if(!t) return;
  const b=el('div',{className:'bubble me'},t);
  $('#thread').append(b); $('#chatInput').value=''; $('#thread').scrollTop=$('#thread').scrollHeight;
});
$$('.close').forEach(b=>b.addEventListener('click',()=>$('#'+b.dataset.close)?.classList.remove('show')));

/* ===================== PROFILO FULLSCREEN ===================== */
function openProfilePage(d, distance){
  const page = document.getElementById('profilePage');
  const body = document.getElementById('ppBody');
  const title = document.getElementById('ppTitle');
  if(!page || !body) return;

  const store = getProfileStore(d.id);
  function render(){
    title.innerHTML = `${d.name} ${isVerified(d)?'<span class="paw">🐾</span>':''}`;

    const galleryHTML = (store.gallery||[]).map(src => `<img class="pp-thumb" src="${src}" alt="">`).join('') || '<div class="muted small">Nessuna foto aggiunta.</div>';
    const haveMatch = !!matches.find(m=>m.id===d.id);
    const canSeeSelfie = haveMatch || selfieGateValid(d.id);
    const hasSelfies = (store.selfies||[]).length>0;

    // Selfie block
    let selfieBlock = '';
    if(hasSelfies){
      if(canSeeSelfie){
        const gallery = store.selfies.map(s=>`<img class="pp-thumb" src="${s}" alt="">`).join('');
        selfieBlock = `
          <div class="pp-section">
            <h4>🤳🏾 Selfie con il tuo amico a quattro zampe</h4>
            <div class="pp-gallery">${gallery}</div>
            ${!haveMatch ? '<div class="muted small">Accesso ai selfie sbloccato per 24 ore.</div>' : ''}
          </div>`;
      }else{
        // preview blur su prima foto
        const first = store.selfies[0];
        selfieBlock = `
          <div class="pp-section">
            <h4>🤳🏾 Selfie con il tuo amico a quattro zampe</h4>
            <div class="selfie-wrap" style="max-width:100%">
              <img class="pp-thumb blurred" src="${first}" alt="">
              <div class="lock-overlay">
                <button id="unlockSelfie" class="lock-pill">Guarda il video per vedere il selfie</button>
              </div>
            </div>
            <div class="muted small" style="margin-top:6px">Niente match? Puoi sbloccarlo per 24 ore.</div>
          </div>`;
      }
    }else{
      selfieBlock = `
        <div class="pp-section">
          <h4>🤳🏾 Selfie con il tuo amico a quattro zampe</h4>
          <div class="pp-gallery">
            <img class="pp-thumb" src="plutoo-icon-512.png" alt="logo" />
          </div>
          <label class="btn light small" style="margin-top:8px">
            Carica selfie
            <input id="ppAddSelfie" type="file" accept="image/*" multiple>
          </label>
        </div>`;
    }

    const postsHTML = (store.posts||[]).slice().reverse().map(p=>`
      <div class="pp-post">
        <div>${p.text}</div>
        <div class="ts">${new Date(p.ts).toLocaleString()}</div>
      </div>
    `).join('') || '<div class="muted small">Nessun post ancora.</div>';

    const intentText = renderIntentText(d);

    body.innerHTML = `
      <img class="pp-cover" src="${d.image}" alt="${d.name}" onerror="this.style.display='none'">

      <div class="pp-section">
        <h3>${d.name}, ${d.age} ${isVerified(d)?'<span class="paw">🐾</span>':''}</h3>
        <div class="meta">${d.breed} · ${d.sex==='F'?'Femmina':'Maschio'} · ${d.size} · ${d.coat}</div>
        <div class="meta"><b>Energia:</b> ${d.energy} · <b>Pedigree:</b> ${d.pedigree} · <b>Zona:</b> ${d.area} · <b>Distanza:</b> ${distance ?? '-'} km</div>
        <div class="badge-state ${isVerified(d)?'badge-ok':'badge-ko'}">
          ${isVerified(d) ? 'Badge attivo ✅' : 'Badge non attivo'}
        </div>
        <div class="intent-pill" style="margin-top:10px">${intentText}</div>
        <div class="pp-actions">
          <button class="circle no" id="ppNo" title="No">🥲</button>
          <button class="circle like" id="ppYes" title="Mi piace">❤️</button>
        </div>
      </div>

      <div class="pp-section">
        <h4>Galleria foto</h4>
        <div class="pp-gallery" id="ppGallery">${galleryHTML}</div>
        <label class="btn light small">
          Aggiungi foto
          <input id="ppAddPhotos" type="file" accept="image/*" multiple>
        </label>
      </div>

      ${selfieBlock}

      <div class="pp-section">
        <h4>Stato</h4>
        <div class="pp-post-new">
          <textarea id="ppStatus" class="pp-textarea" placeholder="Scrivi un aggiornamento…"></textarea>
          <div style="display:flex;gap:8px;justify-content:flex-end">
            <button id="ppPostBtn" class="btn primary">Pubblica</button>
          </div>
        </div>
        <div class="pp-posts" id="ppPosts">${postsHTML}</div>
      </div>

      <div class="pp-section">
        <h4>Verifica documenti</h4>
        <div class="pp-verify-row">
          <label class="btn light small" style="text-align:center">Documento proprietario ${store.owner?'✔️':''}
            <input id="ppOwnerDoc" type="file" accept="image/*,application/pdf">
          </label>
          <label class="btn light small" style="text-align:center">Documento del tuo amico ${store.dog?'✔️':''}
            <input id="ppDogDoc" type="file" accept="image/*,application/pdf">
          </label>
        </div>
        <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:10px">
          <button id="ppSendVerify" class="btn primary">Invia per verifica</button>
        </div>
        <div class="muted small" style="margin-top:6px">Il badge si attiva solo quando entrambi i documenti risultano caricati.</div>
      </div>
    `;

    // azioni base
    $('#ppNo')?.addEventListener('click',()=>closeProfilePage(),{once:true});
    $('#ppYes')?.addEventListener('click',()=>{ addMatch(d); showMatchAnim(d); closeProfilePage(); },{once:true});

    // upload foto
    $('#ppAddPhotos')?.addEventListener('change', async (e)=>{
      const files = Array.from(e.target.files||[]);
      for(const f of files){ const url=await fileToDataURL(f); store.gallery.push(url); }
      setProfileStore(d.id, store); render();
    });

    // upload selfie
    $('#ppAddSelfie')?.addEventListener('change', async (e)=>{
      const files = Array.from(e.target.files||[]);
      for(const f of files){ const url=await fileToDataURL(f); store.selfies.push(url); }
      setProfileStore(d.id, store); render();
    });

    // post stato
    $('#ppPostBtn')?.addEventListener('click', ()=>{
      const ta=$('#ppStatus'); const t=(ta.value||'').trim(); if(!t) return;
      store.posts.push({text:t, ts:Date.now()}); setProfileStore(d.id, store); ta.value=''; render();
    });

    // documenti → video interstitial poi set flag
    let tmpOwner=null, tmpDog=null;
    $('#ppOwnerDoc')?.addEventListener('change', e=>{ tmpOwner=(e.target.files||[])[0]||null; });
    $('#ppDogDoc')?.addEventListener('change',   e=>{ tmpDog=(e.target.files||[])[0]||null; });
    $('#ppSendVerify')?.addEventListener('click', ()=>{
      if(!tmpOwner && !tmpDog){ return; }
      playInterstitial('Grazie! Verifichiamo i documenti…', ()=> {
        if(tmpOwner) store.owner=true;
        if(tmpDog)   store.dog=true;
        setProfileStore(d.id, store); render(); renderAll();
      });
    });

    // sblocco selfie con video (se non match)
    $('#unlockSelfie')?.addEventListener('click', ()=>{
      playInterstitial('Sblocca i selfie per 24 ore', ()=>{
        setSelfieGate(d.id, Date.now()); render();
      });
    });
  }

  render();
  page.classList.add('show');
}
function fileToDataURL(file){ return new Promise((res,rej)=>{ const r=new FileReader(); r.onload=()=>res(r.result); r.onerror=rej; r.readAsDataURL(file); }); }
function closeProfilePage(){ $('#profilePage')?.classList.remove('show'); }
window.closeProfilePage = closeProfilePage;

/* ===================== INTERSTITIAL (video placeholder) ===================== */
function playInterstitial(message, onDone){
  const dlg = $('#interstitial'); if(!dlg) return;
  const msg = $('#interMsg'); if(msg) msg.textContent = message || 'Contenuto sponsorizzato';
  const btn = $('#interStart');
  btn.onclick = ()=>{
    // finto video 5s
    const body = dlg.querySelector('.inter-body');
    if(body) body.innerHTML = `<h3>Riproduzione…</h3><p class="muted">Attendi la fine dell’annuncio</p>`;
    setTimeout(()=>{ try{ closeDialogSafe(dlg); }catch(_){ dlg.removeAttribute('open'); } onDone&&onDone(); }, 5000);
  };
  openDialogSafe(dlg);
}

/* ===================== MATCH ANIMATION (visibile ~1.6s) ===================== */
function showMatchAnim(d){
  const wrap = el('div',{className:'match-toast'});
  wrap.innerHTML = `
    <div class="match-bubble">
      <img class="match-logo" src="${d.image}" alt="" onerror="this.src='plutoo-icon-512.png'">
      <div>È un match con <strong>${d.name}</strong>!</div>
    </div>
  `;
  document.body.append(wrap);
  // cuoricini pop
  const heart = el('div',{className:'heart-pop'},'❤️');
  heart.style.left='50%'; heart.style.top='54%';
  wrap.append(heart);
  setTimeout(()=>{ wrap.remove(); }, 1600);
}

/* ===================== AVVIO ===================== */
document.addEventListener('DOMContentLoaded', ()=>{
  // CTA “Entra”
  const enter = document.getElementById('ctaEnter');
  if(enter) enter.addEventListener('click', (e)=>{ e.preventDefault(); e.stopPropagation(); goHome(); }, {passive:false});

  // tabs
  $$('.tab').forEach(t=>t.addEventListener('click',()=>switchTab(t.dataset.tab)));

  // login / register fittizi chiudono sheet
  $('#loginSubmit')?.addEventListener('click',()=>$('#sheetLogin')?.classList.remove('show'));
  $('#registerSubmit')?.addEventListener('click',()=>$('#sheetRegister')?.classList.remove('show'));

  // legal
  $('#openPrivacy')?.addEventListener('click',()=>openDialogSafe($('#privacyDlg')));
  $('#openTerms')?.addEventListener('click',()=>openDialogSafe($('#termsDlg')));

  // sponsor label coerente in home
  document.querySelectorAll('.sponsor-label')
    .forEach(el => el.textContent = 'Sponsor ufficiale — “Fido” il gelato per i tuoi amici a quattro zampe');

  // primo render
  renderAll();
});
