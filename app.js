/* =========================================================
   Plutoo – app.js (Android/WebView friendly – COMPAT)
   ---------------------------------------------------------
   - NIENTE optional chaining (?.) né nullish (??)
   - Stessa logica di prima, massima compatibilità
   ========================================================= */

/* ===================== DATI DEMO ===================== */
var dogs = [
  { id:1, name:'Luna',  age:1, breed:'Jack Russell',      sex:'F', size:'Piccola', coat:'Corto', energy:'Alta',  pedigree:'No', area:'Roma – Monteverde', desc:'Curiosa e giocherellona, ama la pallina.', image:'dog1.jpg', online:true,  verified:true,  intents:['play','mate'], coords:{lat:41.898, lon:12.498} },
  { id:2, name:'Rocky', age:3, breed:'Labrador',          sex:'M', size:'Media',   coat:'Corto', energy:'Media', pedigree:'No', area:'Roma – Eur',        desc:'Affettuoso e fedele, perfetto per passeggiate.', image:'dog2.jpg', online:true,  verified:false, intents:['walk'], coords:{lat:41.901, lon:12.476} },
  { id:3, name:'Bella', age:2, breed:'Shiba Inu',         sex:'F', size:'Piccola', coat:'Medio', energy:'Media', pedigree:'Sì', area:'Roma – Prati',      desc:'Elegante e curiosa, cerca partner per accoppiamento.', image:'dog3.jpg', online:true,  verified:true,  intents:['mate'], coords:{lat:41.914, lon:12.495} },
  { id:4, name:'Max',   age:4, breed:'Golden Retriever',  sex:'M', size:'Grande',  coat:'Lungo', energy:'Alta',  pedigree:'No', area:'Roma – Tuscolana',  desc:'Socievole, adora l’acqua e giocare in gruppo.', image:'dog4.jpg', online:true,  verified:false, intents:['play','walk'], coords:{lat:41.887, lon:12.512} },
  { id:5, name:'Daisy', age:2, breed:'Beagle',            sex:'F', size:'Piccola', coat:'Corto', energy:'Alta',  pedigree:'No', area:'Roma – Garbatella', desc:'Instancabile esploratrice, ama correre.', image:'dog1.jpg', online:true,  verified:false, intents:['play'], coords:{lat:41.905, lon:12.450} },
  { id:6, name:'Nero',  age:5, breed:'Meticcio',          sex:'M', size:'Media',   coat:'Medio', energy:'Media', pedigree:'No', area:'Roma – Nomentana',  desc:'Tranquillo e dolce, passeggiate in città.', image:'dog2.jpg', online:true,  verified:false, intents:['walk','mate'], coords:{lat:41.930, lon:12.500} },
];

/* ===================== STATO ===================== */
var currentView='near', userPos=null;
var matches = readLS('pl_matches', []);
var swipeLoveIdx=0, swipeSocIdx=0;
var filters = { breed:'', ageBand:'', sex:'', size:'', coat:'', energy:'', pedigree:'', distance:'' };

/* === like giornalieri: 10 gratis + pacchetti da 5 via video === */
var DAILY_FREE_LIKES = 10;
var VIDEO_PACK_SIZE  = 5;
var likeState = initLikeState();

/* ===================== UTILS ===================== */
function $(s){ return document.querySelector(s); }
function $$(s){ return document.querySelectorAll(s); }
function el(t,a,h){ var n=document.createElement(t); a=a||{}; for(var k in a){ if(k in n){ n[k]=a[k]; } else { n.setAttribute(k, a[k]); } } if(h){ n.innerHTML=h; } return n; }
function km(a,b){
  if(!a||!b) return null;
  var R=6371; var dLat=(b.lat-a.lat)*Math.PI/180; var dLon=(b.lon-a.lon)*Math.PI/180;
  var la1=a.lat*Math.PI/180, la2=b.lat*Math.PI/180;
  var x=Math.sin(dLat/2)*Math.sin(dLat/2) + Math.sin(dLon/2)*Math.sin(dLon/2)*Math.cos(la1)*Math.cos(la2);
  return +(R*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x))).toFixed(1);
}
function randKm(){ return +(Math.random()*7+0.5).toFixed(1); }
function band(a){ return a<=1?'0–1':a<=4?'2–4':a<=7?'5–7':'8+'; }
function todayKey(){ return new Date().toISOString().slice(0,10); }
function readLS(k, fb){ try{var v=localStorage.getItem(k); return v?JSON.parse(v):fb;}catch(_){return fb} }
function writeLS(k,v){ localStorage.setItem(k, JSON.stringify(v)); }
function openDialogSafe(dlg){
  if(!dlg) return;
  if(typeof dlg.showModal==='function'){ try{ dlg.showModal(); return; }catch(_){ } }
  dlg.setAttribute('open',''); dlg.classList.add('fallback'); document.body.style.overflow='hidden';
}
function closeDialogSafe(dlg){
  if(!dlg) return;
  if(typeof dlg.close==='function'){ try{ dlg.close(); }catch(_){ } }
  dlg.classList.remove('fallback'); dlg.removeAttribute('open'); document.body.style.overflow='';
}
function verifiedName(d){ return d.name+', '+d.age+' • '+d.breed+(isVerified(d)?' <span class="paw">🐾</span>':''); }

/* === verifica doc / badge (persistenza) === */
function _veriMap(){ return readLS('pl_verify', {}) }
function _saveVeri(map){ writeLS('pl_verify', map); }
function getProfileStore(id){
  var m=_veriMap();
  if(!m[id]) m[id]={ owner:false, dog:false, gallery:[], selfies:[], posts:[] };
  return m[id];
}
function setProfileStore(id, data){ var m=_veriMap(); m[id]=data; _saveVeri(m); }
function isVerified(d){ var st=getProfileStore(d.id); return d.verified || (st.owner && st.dog); }

/* === selfie gating (24h) === */
function selfieGateMap(){ return readLS('pl_selfie_gate', {}) }
function setSelfieGate(dogId, ts){ var m=selfieGateMap(); m[dogId]=ts; writeLS('pl_selfie_gate', m); }
function selfieGateValid(dogId){ var m=selfieGateMap(); var ts=m[dogId]; if(!ts) return false; return (Date.now()-ts) < 24*60*60*1000; }

/* ===================== LIKE STATE ===================== */
function initLikeState(){
  var st = readLS('pl_like_state', null);
  var key = todayKey();
  if(!st || st.day!==key){
    var fresh = { day:key, free:DAILY_FREE_LIKES, bonus:0 };
    writeLS('pl_like_state', fresh);
    return fresh;
  }
  return st;
}
function saveLikeState(){ writeLS('pl_like_state', likeState); }
function likeSlotsLeft(){ return likeState.free + likeState.bonus; }
function consumeLike(){
  if(likeState.free>0) likeState.free--;
  else if(likeState.bonus>0) likeState.bonus--;
  saveLikeState();
  updateLikeCounterUI();
}
function grantBonusPack(){ likeState.bonus += VIDEO_PACK_SIZE; saveLikeState(); updateLikeCounterUI(); }

/* ===================== NAV/APP ===================== */
function show(sel){
  var all=$$('.screen'); for(var i=0;i<all.length;i++){ all[i].classList.remove('active'); }
  var node = (typeof sel==='string') ? $(sel) : sel;
  if(node) node.classList.add('active');
}
function switchTab(tab){
  currentView=tab;
  var tb=$$('.tab'); for(var i=0;i<tb.length;i++){ tb[i].classList.toggle('active', tb[i].getAttribute('data-tab')===tab); }
  var panes=$$('.tabpane'); for(var j=0;j<panes.length;j++){ panes[j].classList.remove('active'); }
  var pane=document.getElementById(tab); if(pane) pane.classList.add('active');
  if(tab==='near') renderNear();
  if(tab==='love') renderLove();
  if(tab==='social') renderSocial();
  if(tab==='matches') renderMatches();
}
function goHome(){
  show('#app');
  var gb=document.getElementById('geoBar'); if(gb) gb.classList.remove('hidden');
  renderAll();
}
window.goHome=goHome;
function renderAll(){ renderActiveChips(); renderNear(); renderLove(); renderSocial(); renderMatches(); updateLikeCounterUI(); }

/* ===================== GEO ===================== */
var btnGeo=document.getElementById('enableGeo');
if(btnGeo){
  btnGeo.addEventListener('click', function(){
    if(!navigator.geolocation){ var gb=document.getElementById('geoBar'); if(gb) gb.classList.add('hidden'); renderAll(); return; }
    navigator.geolocation.getCurrentPosition(
      function(pos){ userPos={lat:pos.coords.latitude,lon:pos.coords.longitude}; var gb=document.getElementById('geoBar'); if(gb) gb.classList.add('hidden'); renderAll(); },
      function(){ var gb=document.getElementById('geoBar'); if(gb) gb.classList.add('hidden'); renderAll(); },
      {enableHighAccuracy:true,timeout:8000}
    );
  });
}
var btnGeoNo=document.getElementById('dismissGeo');
if(btnGeoNo){ btnGeoNo.addEventListener('click', function(){ var gb=document.getElementById('geoBar'); if(gb) gb.classList.add('hidden'); }); }

/* ===================== FILTRI ===================== */
var ft=document.getElementById('filterToggle');
if(ft){ ft.addEventListener('click', function(){ var p=document.getElementById('filterPanel'); if(p) p.hidden = !p.hidden; }); }

var ff=document.getElementById('filterForm');
if(ff){
  ff.addEventListener('submit', function(e){
    e.preventDefault();
    var f=e.currentTarget;
    filters.breed=f.breed.value||''; filters.ageBand=f.ageBand.value||''; filters.sex=f.sex.value||'';
    filters.size=f.size.value||''; filters.coat=f.coat.value||''; filters.energy=f.energy.value||'';
    filters.pedigree=f.pedigree.value||''; filters.distance=f.distance.value||'';
    var p=document.getElementById('filterPanel'); if(p) p.hidden=true; renderActiveChips(); renderAll();
  });
}
var fr=document.getElementById('filtersReset');
if(fr){
  fr.addEventListener('click', function(){
    var f=document.getElementById('filterForm'); if(f) f.reset();
    filters={breed:'',ageBand:'',sex:'',size:'',coat:'',energy:'',pedigree:'',distance:''};
    renderActiveChips(); renderAll();
  });
}

function renderActiveChips(){
  var c=document.getElementById('activeChips'); if(!c) return; c.innerHTML='';
  var map={breed:'Razza',ageBand:'Età',sex:'Sesso',size:'Taglia',coat:'Pelo',energy:'Energia',pedigree:'Pedigree',distance:'Distanza'};
  for(var k in filters){
    var v=filters[k]; if(!v) continue;
    var w=el('span',{className:'chip-wrap'});
    w.appendChild(el('span',{className:'chip'}, map[k]+': '+v));
    (function(key){
      var btn=el('button',{className:'chip-x'},'×');
      btn.onclick=function(){ filters[key]=''; renderActiveChips(); renderAll(); };
      w.appendChild(btn);
    })(k);
    c.appendChild(w);
  }
}
function passesFilters(d,dist){
  if(filters.breed && d.breed.toLowerCase().indexOf(filters.breed.toLowerCase())===-1) return false;
  if(filters.ageBand && band(d.age)!==filters.ageBand) return false;
  if(filters.sex && d.sex!==filters.sex) return false;
  if(filters.size && d.size!==filters.size) return false;
  if(filters.coat && d.coat!==filters.coat) return false;
  if(filters.energy && d.energy!==filters.energy) return false;
  if(filters.pedigree && d.pedigree!==filters.pedigree) return false;
  if(filters.distance){
    var m=parseFloat(filters.distance);
    if(!isNaN(m) && dist!=null && dist>m) return false;
  }
  return true;
}

/* ===================== VICINO (griglia) ===================== */
function renderNear(){
  var grid=document.getElementById('grid'); if(!grid) return; grid.innerHTML='';
  var ordered=dogs.slice().map(function(d){ return {d:d, dist: userPos?km(userPos,d.coords):randKm() }; })
                      .sort(function(a,b){ return (a.dist!=null?a.dist:99)-(b.dist!=null?b.dist:99); });
  var rows=[];
  for(var i=0;i<ordered.length;i++){ if(passesFilters(ordered[i].d, ordered[i].dist)) rows.push(ordered[i]); }
  for(var j=0;j<rows.length;j++){
    (function(pair){
      var d=pair.d, dist=pair.dist;
      var card=el('article',{className:'card'});
      card.innerHTML =
        (d.online?'<span class="online"></span>':'')+
        '<img src="'+d.image+'" alt="'+d.name+'" onerror="this.style.display=\'none\'">'+
        '<div class="card-info">'+
          '<div class="title">'+
            '<div class="name">'+verifiedName(d)+'</div>'+
            '<div class="dist">'+(dist!=null?dist:'-')+' km</div>'+
          '</div>'+
          '<div class="intent-pill">'+renderIntentText(d)+'</div>'+
          '<div class="actions">'+
            '<button class="circle no" title="No">🥲</button>'+
            '<button class="circle like" title="Mi piace">❤️</button>'+
            '<button class="circle dog" title="Social">🐕</button>'+
          '</div>'+
        '</div>';
      var btnNo   = card.querySelector('.no');
      var btnLike = card.querySelector('.like');
      var btnDog  = card.querySelector('.dog');
      if(btnNo) btnNo.onclick=function(e){ e.stopPropagation(); card.remove(); };
      if(btnLike) btnLike.onclick=function(e){ e.stopPropagation(); onLike(d); };
      if(btnDog) btnDog.onclick=function(e){ e.stopPropagation(); addMatch(d); showMatchAnim(d); };

      card.addEventListener('click', function(ev){
        if(ev.target && ev.target.closest && ev.target.closest('.circle')) return;
        openProfilePage(d,dist);
      });
      grid.appendChild(card);
    })(rows[j]);
  }
  var c=document.getElementById('counter'); if(c) c.textContent='Mostro '+rows.length+' profili';
  var en=document.getElementById('emptyNear'); if(en) en.classList.toggle('hidden', rows.length>0);
}
function renderIntentText(d){
  var set = d.intents||[];
  if(set.indexOf('mate')>-1) return '❤️ Amore';
  if(set.indexOf('play')>-1 && set.indexOf('walk')>-1) return '🐕 Giochiamo / Camminiamo';
  if(set.indexOf('play')>-1) return '🎾 Giochiamo';
  if(set.indexOf('walk')>-1) return '🐕 Camminiamo';
  return 'Disponibile';
}

/* ===================== AMORE (card singola) ===================== */
function loveList(){ return dogs.filter(function(d){ return (d.intents||[]).indexOf('mate')>-1 && passesFilters(d, userPos?km(userPos,d.coords):randKm()); }); }
function renderLove(){
  var list=loveList(), img=document.getElementById('loveImg'), title=document.getElementById('loveTitle'), meta=document.getElementById('loveMeta'), bio=document.getElementById('loveBio');
  var cardEl=document.querySelector('#love .card.big');
  if(!list.length){
    if(img) img.src='';
    if(title) title.textContent='';
    if(meta) meta.textContent='';
    if(bio) bio.textContent='Nessun profilo in Amore.';
    return;
  }
  var d=list[swipeLoveIdx%list.length], dist=userPos?km(userPos,d.coords):randKm();
  if(img){ img.src=d.image; img.alt=d.name; }
  if(title) title.innerHTML=verifiedName(d);
  if(meta) meta.textContent=dist+' km';
  if(bio) bio.textContent=d.desc;

  if(cardEl){ cardEl.classList.remove('pulse'); void cardEl.offsetWidth; cardEl.classList.add('pulse'); attachSwipeGestures(cardEl, d, 'love'); }

  var noBtn=document.getElementById('loveNo');
  var yesBtn=document.getElementById('loveYes');
  if(noBtn){ noBtn.onclick=function(){ swipeLove('no',d); }; }
  if(yesBtn){ yesBtn.onclick=function(){ swipeLove('yes',d); }; }

  if(cardEl){
    var handler=function(ev){ if(ev.target && ev.target.closest && ev.target.closest('.circle')) return; openProfilePage(d,dist); cardEl.removeEventListener('click',handler); };
    cardEl.addEventListener('click', handler);
  }
}
function swipeLove(type,d){ if(type==='yes'){ onLike(d); } swipeLoveIdx++; renderLove(); }

/* ===================== SOCIAL (card singola) ===================== */
function socialList(){ return dogs.filter(function(d){ var it=d.intents||[]; return (it.indexOf('play')>-1 || it.indexOf('walk')>-1) && passesFilters(d, userPos?km(userPos,d.coords):randKm()); }); }
function renderSocial(){
  var list=socialList(), img=document.getElementById('socImg'), title=document.getElementById('socTitle'), meta=document.getElementById('socMeta'), bio=document.getElementById('socBio');
  var cardEl=document.querySelector('#social .card.big');
  if(!list.length){
    if(img) img.src='';
    if(title) title.textContent='';
    if(meta) meta.textContent='';
    if(bio) bio.textContent='Nessun profilo in Giocare/Camminare.';
    return;
  }
  var d=list[swipeSocIdx%list.length], dist=userPos?km(userPos,d.coords):randKm();
  if(img){ img.src=d.image; img.alt=d.name; }
  if(title) title.innerHTML=verifiedName(d);
  if(meta) meta.textContent=dist+' km';
  if(bio) bio.textContent=d.desc;

  if(cardEl){ cardEl.classList.remove('pulse'); void cardEl.offsetWidth; cardEl.classList.add('pulse'); attachSwipeGestures(cardEl, d, 'social'); }

  var noBtn=document.getElementById('socNo');
  var yesBtn=document.getElementById('socYes');
  if(noBtn){ noBtn.onclick=function(){ swipeSoc('no',d); }; }
  if(yesBtn){ yesBtn.onclick=function(){ swipeSoc('yes',d); }; }

  if(cardEl){
    var handler=function(ev){ if(ev.target && ev.target.closest && ev.target.closest('.circle')) return; openProfilePage(d,dist); cardEl.removeEventListener('click',handler); };
    cardEl.addEventListener('click', handler);
  }
}
function swipeSoc(type,d){ if(type==='yes'){ addMatch(d); showMatchAnim(d); } swipeSocIdx++; renderSocial(); }

/* ---- Swipe gesture helpers ---- */
function attachSwipeGestures(cardEl, dogObj, mode){
  if(!cardEl || cardEl._swipeBound) return; cardEl._swipeBound = true;
  var startX=0,startY=0,currentX=0,currentY=0,dragging=false,hasMoved=false;
  function onTouchStart(e){ var t=e.touches?e.touches[0]:e; startX=currentX=t.clientX; startY=currentY=t.clientY; dragging=true; hasMoved=false; cardEl.style.transition='none'; }
  function onTouchMove(e){
    if(!dragging) return; var t=e.touches?e.touches[0]:e; currentX=t.clientX; currentY=t.clientY;
    var dx=currentX-startX, dy=currentY-startY; if(Math.abs(dy)>Math.abs(dx)&&Math.abs(dy)>12) return;
    hasMoved=Math.abs(dx)>6; var rot=Math.max(-10,Math.min(10,dx/12));
    cardEl.style.transform='translateX('+dx+'px) rotate('+rot+'deg)'; cardEl.style.opacity=String(Math.max(.35,1-Math.abs(dx)/600));
  }
  function onTouchEnd(){
    if(!dragging) return; dragging=false; var dx=currentX-startX;
    cardEl.style.transition='transform .18s ease-out, opacity .18s ease-out';
    if(dx>80){ cardEl.style.transform='translateX(40%) rotate(6deg)'; cardEl.style.opacity='0'; setTimeout(function(){ (mode==='love'?swipeLove('yes',dogObj):swipeSoc('yes',dogObj)); },180); }
    else if(dx<-80){ cardEl.style.transform='translateX(-40%) rotate(-6deg)'; cardEl.style.opacity='0'; setTimeout(function(){ (mode==='love'?swipeLove('no',dogObj):swipeSoc('no',dogObj)); },180); }
    else { cardEl.style.transform=''; cardEl.style.opacity=''; var dist=userPos?km(userPos,dogObj.coords):randKm(); openProfilePage(dogObj,dist); }
  }
  cardEl.addEventListener('touchstart', onTouchStart,{passive:true});
  cardEl.addEventListener('touchmove',  onTouchMove, {passive:true});
  cardEl.addEventListener('touchend',   onTouchEnd,  {passive:true});
  cardEl.addEventListener('mousedown', function(e){
    onTouchStart(e);
    function mm(ev){ onTouchMove(ev); }
    function mu(){ onTouchEnd(); document.removeEventListener('mousemove',mm); document.removeEventListener('mouseup',mu); }
    document.addEventListener('mousemove',mm);
    document.addEventListener('mouseup',mu,{once:true});
  });
}

/* ===================== MATCH & CHAT ===================== */
function addMatch(d){ if(!matches.find(function(m){return m.id===d.id;})){ matches.push({id:d.id, name:d.name, img:d.image}); writeLS('pl_matches', matches); } renderMatches(); }
function renderMatches(){
  var box=document.getElementById('matchList'); if(!box) return; box.innerHTML='';
  for(var i=0;i<matches.length;i++){
    (function(m){
      var row=el('div',{className:'item'});
      row.innerHTML =
        '<img src="'+m.img+'" alt="'+m.name+'">'+
        '<div><div><strong>'+m.name+'</strong></div><div class="muted small">Match</div></div>'+
        '<button class="btn primary pill go">Chat</button>';
      var go=row.querySelector('.go'); if(go) go.onclick=function(){ openChat(m); };
      box.appendChild(row);
    })(matches[i]);
  }
  var em=document.getElementById('emptyMatch'); if(em) em.style.display = matches.length ? 'none' : 'block';
}
function openChat(m){
  var av=document.getElementById('chatAvatar'); if(av) av.src=m.img;
  var nm=document.getElementById('chatName'); if(nm) nm.textContent=m.name;
  var th=document.getElementById('thread'); if(th) th.innerHTML='<div class="bubble">Ciao! 🐾 Siamo un match!</div>';
  var ch=document.getElementById('chat'); if(ch) ch.classList.add('show');
}
var sendBtn=document.getElementById('sendBtn');
if(sendBtn){
  sendBtn.addEventListener('click', function(){
    var inp=document.getElementById('chatInput'); var t=(inp&&inp.value?inp.value:'').trim(); if(!t) return;
    var b=el('div',{className:'bubble me'},t);
    var th=document.getElementById('thread'); if(th){ th.appendChild(b); }
    if(inp) inp.value='';
    if(th) th.scrollTop=th.scrollHeight;
  });
}
var closes=$$('.close');
for(var ci=0;ci<closes.length;ci++){
  (function(btn){
    btn.addEventListener('click', function(){ var id=btn.getAttribute('data-close'); var node=document.getElementById(id); if(node) node.classList.remove('show'); });
  })(closes[ci]);
}

/* ===================== LIKE + ADV LOGICA ===================== */
function onLike(d){
  if(likeSlotsLeft()<=0){ askVideoForLikes(); return; }
  addMatch(d); showMatchAnim(d); consumeLike();
}
function updateLikeCounterUI(){
  var elc = document.getElementById('counter');
  if(elc){ elc.textContent = 'Like disponibili oggi: '+likeSlotsLeft()+' (gratis '+likeState.free+' + bonus '+likeState.bonus+')'; }
}
function askVideoForLikes(){
  var dlg = buildInterstitial(function(){ grantBonusPack(); }, 'Guarda un breve video per ottenere +5 like');
  openDialogSafe(dlg);
}

/* ===================== PROFILO FULLSCREEN ===================== */
function openProfilePage(d, distance){
  var page = document.getElementById('profilePage');
  var body = document.getElementById('ppBody');
  var title = document.getElementById('ppTitle');
  if(!page || !body) return;

  var store = getProfileStore(d.id);
  function render(){
    if(title) title.innerHTML = d.name+(isVerified(d)?' <span class="paw">🐾</span>':'');
    var galleryHTML = (store.gallery||[]).map(function(src){ return '<img class="pp-thumb" src="'+src+'" alt="">'; }).join('');
    if(!galleryHTML) galleryHTML='<div class="muted small">Nessuna foto aggiunta.</div>';
    var selfieHTML  = (store.selfies||[]).map(function(src){ return '<img class="pp-thumb" src="'+src+'" alt="">'; }).join('');
    var postsArr=(store.posts||[]).slice().reverse();
    var postsHTML = postsArr.map(function(p){
      return '<div class="pp-post"><div>'+p.text+'</div><div class="ts">'+new Date(p.ts).toLocaleString()+'</div></div>';
    }).join('');
    if(!postsHTML) postsHTML='<div class="muted small">Nessun post ancora.</div>';

    var intentText = renderIntentText(d);
    var haveMatch = !!matches.find(function(m){ return m.id===d.id; });
    var canSeeSelfie = haveMatch || selfieGateValid(d.id);

    body.innerHTML =
      '<img class="pp-cover" src="'+d.image+'" alt="'+d.name+'" onerror="this.style.display=\'none\'">'+
      '<div class="pp-section">'+
        '<h3>'+d.name+', '+d.age+(isVerified(d)?' <span class="paw">🐾</span>':'')+'</h3>'+
        '<div class="meta">'+d.breed+' · '+(d.sex==='F'?'Femmina':'Maschio')+' · '+d.size+' · '+d.coat+'</div>'+
        '<div class="meta"><b>Energia:</b> '+d.energy+' · <b>Pedigree:</b> '+d.pedigree+' · <b>Zona:</b> '+d.area+' · <b>Distanza:</b> '+(distance!=null?distance:'-')+' km</div>'+
        '<div class="badge-state '+(isVerified(d)?'badge-ok':'badge-ko')+'">'+ (isVerified(d)?'Badge attivo ✅':'Badge non attivo') +'</div>'+
        '<div class="intent-pill" style="margin-top:10px">'+intentText+'</div>'+
        '<div class="pp-actions">'+
          '<button class="circle no" id="ppNo" title="No">🥲</button>'+
          '<button class="circle like" id="ppYes" title="Mi piace">❤️</button>'+
        '</div>'+
      '</div>'+
      '<div class="pp-section">'+
        '<h4>Galleria foto</h4>'+
        '<div class="pp-gallery" id="ppGallery">'+galleryHTML+'</div>'+
        '<label class="btn light small">Aggiungi foto<input id="ppAddPhotos" type="file" accept="image/*" multiple></label>'+
      '</div>'+
      '<div class="pp-section">'+
        '<h4>Selfie con il tuo amico a quattro zampe</h4>'+
        ((store.selfies||[]).length
          ? (canSeeSelfie
              ? '<div class="pp-gallery">'+selfieHTML+'</div>'+(haveMatch?'':'<div class="muted small">Accesso selfie sbloccato per 24 ore.</div>')
              : '<div class="muted small">Selfie nascosti. Guarda un breve video per sbloccarli per 24 ore.</div><button id="unlockSelfie" class="btn primary small">Sblocca con video</button>')
          : '<div class="muted small">Nessun selfie caricato.</div>')+
        '<div style="margin-top:8px"><label class="btn light small">Carica selfie<input id="ppAddSelfie" type="file" accept="image/*" multiple></label></div>'+
      '</div>'+
      '<div class="pp-section">'+
        '<h4>Stato</h4>'+
        '<div class="pp-post-new">'+
          '<textarea id="ppStatus" class="pp-textarea" placeholder="Scrivi un aggiornamento…"></textarea>'+
          '<div style="display:flex;gap:8px;justify-content:flex-end"><button id="ppPostBtn" class="btn primary">Pubblica</button></div>'+
        '</div>'+
        '<div class="pp-posts" id="ppPosts">'+postsHTML+'</div>'+
      '</div>'+
      '<div class="pp-section">'+
        '<h4>Verifica documenti</h4>'+
        '<div class="pp-verify-row">'+
          '<label class="btn light small" style="text-align:center">Documento proprietario '+(store.owner?'✔️':'')+'<input id="ppOwnerDoc" type="file" accept="image/*,application/pdf"></label>'+
          '<label class="btn light small" style="text-align:center">Documento del tuo amico '+(store.dog?'✔️':'')+'<input id="ppDogDoc" type="file" accept="image/*,application/pdf"></label>'+
        '</div>'+
        '<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:10px"><button id="ppSendVerify" class="btn primary">Invia per verifica</button></div>'+
        '<div class="muted small" style="margin-top:6px">Il badge si attiva solo quando entrambi i documenti risultano caricati.</div>'+
      '</div>';

    var noB=document.getElementById('ppNo');
    if(noB){ noB.onclick=function(){ closeProfilePage(); }; }
    var yesB=document.getElementById('ppYes');
    if(yesB){ yesB.onclick=function(){ onLike(d); closeProfilePage(); }; }

    var addPhotos=document.getElementById('ppAddPhotos');
    if(addPhotos){ addPhotos.onchange=function(e){
      var files = Array.prototype.slice.call(e.target.files||[]);
      var i=0;
      function next(){
        if(i>=files.length){ setProfileStore(d.id, store); render(); return; }
        fileToDataURL(files[i++]).then(function(url){ store.gallery.push(url); next(); });
      }
      next();
    };}

    var addSelf=document.getElementById('ppAddSelfie');
    if(addSelf){ addSelf.onchange=function(e){
      var files = Array.prototype.slice.call(e.target.files||[]);
      var i=0;
      function next(){
        if(i>=files.length){ setProfileStore(d.id, store); render(); return; }
        fileToDataURL(files[i++]).then(function(url){ store.selfies.push(url); next(); });
      }
      next();
    };}

    var postBtn=document.getElementById('ppPostBtn');
    if(postBtn){ postBtn.onclick=function(){
      var ta=document.getElementById('ppStatus'); var t=(ta&&ta.value?ta.value:'').trim(); if(!t) return;
      store.posts.push({text:t, ts:Date.now()}); setProfileStore(d.id, store); if(ta) ta.value=''; render();
    };}

    var tmpOwner=null, tmpDog=null;
    var own=document.getElementById('ppOwnerDoc');
    if(own){ own.onchange=function(e){ tmpOwner=(e.target.files||[])[0]||null; }; }
    var dog=document.getElementById('ppDogDoc');
    if(dog){ dog.onchange=function(e){ tmpDog=(e.target.files||[])[0]||null; }; }
    var send=document.getElementById('ppSendVerify');
    if(send){ send.onclick=function(){
      var onDone=function(){ if(tmpOwner) store.owner=true; if(tmpDog) store.dog=true; setProfileStore(d.id, store); render(); renderAll(); };
      var dlg = buildInterstitial(onDone, 'Grazie! La verifica partirà subito dopo il video.');
      openDialogSafe(dlg);
    };}

    var unlock=document.getElementById('unlockSelfie');
    if(unlock){ unlock.onclick=function(){
      var onDone=function(){ setSelfieGate(d.id, Date.now()); render(); };
      var dlg = buildInterstitial(onDone, 'Sblocca i selfie per 24 ore');
      openDialogSafe(dlg);
    }; }
  }

  render();
  page.classList.add('show');
}
function fileToDataURL(file){
  return new Promise(function(res,rej){
    var r=new FileReader(); r.onload=function(){ res(r.result); }; r.onerror=rej; r.readAsDataURL(file);
  });
}
function closeProfilePage(){ var p=document.getElementById('profilePage'); if(p) p.classList.remove('show'); }
window.closeProfilePage = closeProfilePage;

/* ===================== MATCH ANIMATION ===================== */
function showMatchAnim(d){
  var wrap = el('div',{style:'position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.55);z-index:2000;animation:fadeIn .2s ease'});
  wrap.innerHTML =
    '<div style="text-align:center">'+
      '<div style="font-size:64px;line-height:1;animation:pop .35s ease">❤️</div>'+
      '<div style="margin-top:8px;display:flex;gap:10px;align-items:center;justify-content:center">'+
        '<img src="'+d.image+'" alt="" style="width:64px;height:64px;border-radius:50%;object-fit:cover;animation:bump .35s ease">'+
        '<div style="font-size:28px;animation:kiss .8s ease infinite">💋</div>'+
        '<div class="paw" style="width:32px;height:32px;background-size:contain"></div>'+
      '</div>'+
      '<div style="margin-top:10px">È un match con <strong>'+d.name+'</strong>!</div>'+
    '</div>'+
    '<style>@keyframes pop{0%{transform:scale(.6);opacity:.2}100%{transform:scale(1);opacity:1}}@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes bump{0%{transform:scale(.9)}100%{transform:scale(1)}}@keyframes kiss{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}</style>';
  document.body.appendChild(wrap);
  setTimeout(function(){ wrap.remove(); }, 1200);
}

/* ===================== INTERSTITIAL (placeholder web) ===================== */
function buildInterstitial(onDone, message){
  var dlg = document.getElementById('interstitial');
  if(!dlg){
    dlg = el('dialog',{id:'interstitial',className:'modal inter'});
    dlg.innerHTML = '<div class="inter-body"><h3>Annuncio video (placeholder)</h3><p class="muted">'+(message||'Contenuto sponsorizzato')+'</p><button id="__startVideo" class="btn primary">Guarda</button></div>';
    document.body.appendChild(dlg);
  }else{
    var body = dlg.querySelector('.inter-body');
    if(body){ body.innerHTML = '<h3>Annuncio video (placeholder)</h3><p class="muted">'+(message||'Contenuto sponsorizzato')+'</p><button id="__startVideo" class="btn primary">Guarda</button>'; }
  }
  dlg.addEventListener('close', function(){}, {once:true});
  var btn = dlg.querySelector('#__startVideo');
  if(btn){ btn.onclick=function(){
    var body = dlg.querySelector('.inter-body');
    if(body){ body.innerHTML = '<h3>Riproduzione…</h3><p class="muted">Attendi la fine dell’annuncio</p>'; }
    setTimeout(function(){ closeDialogSafe(dlg); if(typeof onDone==='function') onDone(); }, 5000);
  }; }
  return dlg;
}
function showInterstitial(){ var dlg=buildInterstitial(function(){}, 'Annuncio'); openDialogSafe(dlg); }

/* ===================== AVVIO ===================== */
document.addEventListener('DOMContentLoaded', function(){
  var enter = document.getElementById('ctaEnter');
  if(enter){ enter.addEventListener('click', function(e){ e.preventDefault(); e.stopPropagation(); goHome(); }); }

  var tabs=$$('.tab');
  for(var i=0;i<tabs.length;i++){ (function(t){ t.addEventListener('click', function(){ switchTab(t.getAttribute('data-tab')); }); })(tabs[i]); }

  var lg=document.getElementById('loginSubmit');
  if(lg){ lg.addEventListener('click', function(){ var s=document.getElementById('sheetLogin'); if(s) s.classList.remove('show'); }); }
  var rg=document.getElementById('registerSubmit');
  if(rg){ rg.addEventListener('click', function(){ var s=document.getElementById('sheetRegister'); if(s) s.classList.remove('show'); }); }

  var pr=document.getElementById('openPrivacy');
  if(pr){ pr.addEventListener('click', function(){ openDialogSafe(document.getElementById('privacyDlg')); }); }
  var tm=document.getElementById('openTerms');
  if(tm){ tm.addEventListener('click', function(){ openDialogSafe(document.getElementById('termsDlg')); }); }

  var labs=document.querySelectorAll('.sponsor-label');
  for(var k=0;k<labs.length;k++){ labs[k].textContent='Sponsor ufficiale — “Fido” il gelato per i tuoi amici a quattro zampe'; }

  renderAll();
});
