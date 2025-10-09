/* =========================================================================
   PLUTOO – app.js (MVP-FIX)
   - Safety Kit + overlay errori
   - Swipe in stile Tinder (drag fluido, rotazione, soglie, inertia)
   - Match overlay centrato (fade + scale)
   - Chat con reward alla prima (poi invio libero)
   - Selfie blur → reward → sblocco persistente
   - Geolocalizzazione: barra “Attiva posizione” + richiesta permessi
   - Trigger ads mock: selfie / primo messaggio / milestones swipe / click veterinari
   - Plutoo Plus (mock) con localStorage e gating data-ads / data-plus-only
   - FALLBACK_BREEDS integrato
   ======================================================================= */


/* ========================================================================
   0) SAFETY KIT & UTIL
   ======================================================================== */
(function(){
  if (typeof window.$ !== 'function') {
    window.$  = (sel, root=document)=> root.querySelector(sel);
    window.$$ = (sel, root=document)=> Array.from(root.querySelectorAll(sel));
  }
  if (typeof window.onReady !== 'function') {
    window.onReady = function(fn){
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
      else fn();
    };
  }
  if (typeof window.sleep !== 'function') {
    window.sleep = (ms)=> new Promise(r=>setTimeout(r, ms));
  }
  // mini-bus eventi
  window.bus = {
    on(ev, fn){ (this._ = this._||{})[ev] = (this._[ev]||[]).concat(fn); },
    emit(ev, data){ (this._?.[ev]||[]).forEach(f=>{ try{ f(data) }catch(e){} }); }
  };
})();

/* Overlay errori (dev) – non blocca l'app */
(function(){
  const SHOW = true;
  if(!SHOW) return;
  window.addEventListener('error', e=>{
    try{
      let pane = $('#errorOverlay');
      if(!pane){
        pane = document.createElement('div');
        pane.id = 'errorOverlay';
        pane.style.cssText = [
          'position:fixed','left:8px','bottom:8px','z-index:99999',
          'max-width:min(520px,90vw)','background:#260b0b','color:#ffdede',
          'border:1px solid #ff8b8b','border-radius:10px','padding:10px',
          'font:12px/1.4 system-ui','white-space:pre-wrap'
        ].join(';');
        document.body.appendChild(pane);
      }
      const msg = (e.error?.stack || e.message || 'Errore').toString();
      pane.textContent = msg.slice(0, 2000);
    }catch(_){}
  });
})();

/* ========================================================================
   1) CSS INJECTION (se mancano classi base)
   ======================================================================== */
(function injectCSS(){
  const css = `
    .hidden{display:none!important}
    .no-scroll{overflow:hidden}
    .fade-in{animation:fadeIn .18s ease-out both}
    .scale-in{animation:scaleIn .18s ease-out both}
    @keyframes fadeIn{from{opacity:0}to{opacity:1}}
    @keyframes scaleIn{from{transform:scale(.92)}to{transform:scale(1)}}
    .swipe-card{touch-action:pan-y;will-change:transform;transition:transform .18s ease-out}
    .swipe-card.grabbing{transition:none;cursor:grabbing}
    #matchOverlay{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.4);z-index:9998}
    #matchBox{background:#121735;color:#e9ecff;border-radius:18px;padding:20px;max-width:90vw;box-shadow:0 20px 50px rgba(0,0,0,.35)}
    #geoBar{position:fixed;left:10px;right:10px;bottom:10px;background:#0b0b3a;color:#e9ecff;border-radius:12px;padding:10px;z-index:9997;display:flex;justify-content:space-between;align-items:center;gap:10px}
    #sponsorBar{position:sticky;bottom:0;display:flex;justify-content:center;align-items:center;height:48px;background:#0b0b3a;color:#e9ecff;opacity:.95;font:500 14px system-ui}
  `;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
})();

/* ========================================================================
   2) PLUTO0 PLUS (mock) & GATING ADS
   ======================================================================== */
(function(){
  const KEY = 'plutoo.plus.active';
  function isPlus(){ try{ return localStorage.getItem(KEY)==='1'; }catch(e){ return false; } }
  function setPlus(v){ try{ localStorage.setItem(KEY, v?'1':'0'); refresh(); }catch(e){} }
  function refresh(){
    $$('[data-plus-only]').forEach(n=> n.classList.toggle('hidden', !isPlus()));
    $$('[data-ads]').forEach(n=> n.classList.toggle('hidden', isPlus()));
  }
  window.PlutooPlus = { isPlus, setPlus, refresh };

  // Dialog mock per attivare/disattivare Plus
  window.openPlusDialog = function(){
    const dlg=document.createElement('dialog');
    dlg.innerHTML = `
      <h3>Plutoo Plus</h3>
      <p>Rimuovi pubblicità e limiti. (Mock)</p>
      <label style="display:flex;gap:8px;align-items:center"><input id="ppToggle" type="checkbox"> Attiva</label>
      <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:10px">
        <button id="ppClose" class="btn">Chiudi</button>
      </div>`;
    document.body.appendChild(dlg);
    $('#ppToggle', dlg).checked = isPlus();
    $('#ppToggle', dlg).addEventListener('change', e=> setPlus(e.target.checked));
    $('#ppClose', dlg).onclick = ()=> dlg.close();
    dlg.addEventListener('close', ()=> dlg.remove());
    dlg.showModal();
  };

  // Sponsor bar (scompare con Plus)
  onReady(()=>{
    if(!document.getElementById('sponsorBar')){
      const bar=document.createElement('div');
      bar.id='sponsorBar'; bar.setAttribute('data-ads','');
      bar.textContent='👑 Sponsor ufficiale · La Cuccia Felice';
      document.body.appendChild(bar);
    }
    refresh();
  });
})();

/* ========================================================================
   3) openRewardDialog (globale, shim se manca) + closeProfilePage (globale)
   ======================================================================== */
if (typeof window.openRewardDialog !== 'function') {
  window.openRewardDialog = function(message, after){
    try{
      if (PlutooPlus.isPlus()) { after?.(); return; }
      const ok = confirm((message||'Guarda il video per continuare')+'\n\n[Modalità demo]');
      if (ok) setTimeout(()=> after?.(), 350);
    }catch(_){ after?.(); }
  };
}

// Apertura/chiusura pagina profilo (per index.html onclick)
function openProfilePage(){
  const el = document.getElementById('profilePage');
  if(!el) return;
  el.classList.remove('hidden');
  document.body.classList.add('no-scroll');
}
function closeProfilePage(){
  try{
    const sheet = document.getElementById('profilePage');
    if (sheet) {
      sheet.classList.add('hidden');
      document.body.classList.remove('no-scroll');
    }
  }catch(e){}
}
window.closeProfilePage = closeProfilePage;

/* ========================================================================
   4) MATCH OVERLAY (centrato con fade+scale)
   ======================================================================== */
(function(){
  function ensureMatchOverlay(){
    let ov = $('#matchOverlay');
    if(!ov){
      ov = document.createElement('div');
      ov.id = 'matchOverlay';
      ov.className = 'hidden';
      ov.innerHTML = `
        <div id="matchBox" class="fade-in scale-in">
          <h2 style="margin:0 0 6px 0">È un Match! 🐾</h2>
          <p style="opacity:.85;margin:0 0 12px 0">Vi siete piaciuti a vicenda.</p>
          <div style="display:flex;justify-content:flex-end;gap:8px">
            <button id="matchClose" class="btn">Ok</button>
          </div>
        </div>`;
      document.body.appendChild(ov);
      ov.addEventListener('click', (e)=>{ if(e.target.id==='matchOverlay' || e.target.id==='matchClose') hide(); });
    }
    function show(){ ov.classList.remove('hidden'); $('#matchBox')?.classList.add('fade-in','scale-in'); }
    function hide(){ ov.classList.add('hidden'); }
    return { show, hide, el: ov };
  }
  window.MatchOverlay = ensureMatchOverlay();
})();

/* ========================================================================
   5) REWARDS (milestones + gate generico)
   ======================================================================== */
const Rewards = (function(){
  let swipeCount = 0;
  let nextMilestone = 10; // prima a 10, poi +5

  function incSwipe(){
    swipeCount++;
    if (PlutooPlus.isPlus()) return;
    if (swipeCount >= nextMilestone){
      const n = nextMilestone;
      nextMilestone += 5;
      openRewardDialog(`Hai raggiunto ${n} swipe. Guarda il video per continuare.`, ()=>{});
    }
  }

  function gate(action, after){
    if (PlutooPlus.isPlus()) { after?.(); return; }
    let msg = 'Guarda il video per continuare';
    if (action==='selfie')  msg = 'Guarda il video per vedere il selfie';
    if (action==='message') msg = 'Guarda il video per inviare il messaggio';
    if (action==='vet')     msg = 'Sponsor: apri l’attività';
    openRewardDialog(msg, after);
  }

  return { incSwipe, gate };
})();

/* ========================================================================
   6) GEOLOCALIZZAZIONE (barra + permessi)
   ======================================================================== */
const Geo = (function(){
  let coords = null;
  function request(){
    try{
      if(!('geolocation' in navigator)) return;
      const bar = ensureBar();
      navigator.geolocation.getCurrentPosition(pos=>{
        coords = { lat: pos.coords.latitude, lon: pos.coords.longitude, acc: pos.coords.accuracy };
        bar?.remove();
        bus.emit('geo', coords);
      }, err=>{
        bar?.querySelector('span').textContent = 'Impossibile ottenere la posizione';
        setTimeout(()=> bar?.remove(), 2500);
      });
    }catch(_){}
  }
  function ensureBar(){
    let bar = $('#geoBar');
    if(!bar){
      bar = document.createElement('div');
      bar.id = 'geoBar';
      bar.innerHTML = `
        <span>Attiva la posizione per risultati vicini</span>
        <div style="display:flex;gap:8px">
          <button id="geoLater" class="btn light small">Dopo</button>
          <button id="geoEnable" class="btn primary small">Attiva</button>
        </div>`;
      document.body.appendChild(bar);
      $('#geoLater', bar).onclick = ()=> bar.remove();
      $('#geoEnable', bar).onclick = ()=> request();
    }
    return bar;
  }
  onReady(()=>{ ensureBar(); });
  return { request, get:()=>coords };
})();

/* ========================================================================
   7) FALLBACK_BREEDS (lista ampia)
   ======================================================================== */
const FALLBACK_BREEDS = [
  "Labrador Retriever","Golden Retriever","German Shepherd","French Bulldog","Bulldog","Poodle","Beagle","Rottweiler",
  "Yorkshire Terrier","Dachshund","Boxer","Siberian Husky","Shih Tzu","Dobermann","Great Dane","Chihuahua",
  "Border Collie","Australian Shepherd","Cavalier King Charles Spaniel","Maltese","Pug","Jack Russell Terrier",
  "Cocker Spaniel","Bernese Mountain Dog","Bichon Frisé","Akita","Alaskan Malamute","Weimaraner","Whippet","Greyhound",
  "Staffordshire Bull Terrier","Bull Terrier","Basenji","Basset Hound","Havanese","Samoyed","Newfoundland","Saint Bernard",
  "Airedale Terrier","Belgian Malinois","Miniature Schnauzer","Giant Schnauzer","Italian Greyhound","Papillon",
  "Portuguese Water Dog","Shiba Inu","Lhasa Apso","Keeshond","English Setter","Irish Setter","Collie","Sheltie",
  "Pointer","Vizsla","Brittany","Fox Terrier","Cane Corso","Lagotto Romagnolo","Spinone Italiano","Bracco Italiano",
  "Pastore Maremmano","Volpino Italiano","Pastore Bergamasco","Cirneco dell’Etna","Pastore Abruzzese","Segugio Italiano",
  "Barboncino Toy","Barboncino Nano","Barboncino Medio","Pit Bull Terrier","American Bully","Catahoula Leopard Dog",
  "Pumi","Puli","Komondor","Kuvasz","Tosa Inu","Thai Ridgeback","Rhodesian Ridgeback","Pharaoh Hound","Saluki","Borzoi",
  "Irish Wolfhound","Scottish Deerhound","Norwegian Elkhound","Finnish Spitz","Karelian Bear Dog","Japanese Spitz",
  "American Eskimo Dog","Great Pyrenees","Anatolian Shepherd","Tibetan Mastiff","Shar Pei","Chow Chow",
  "Chinese Crested","Xoloitzcuintli","Bedlington Terrier","Norfolk Terrier","Norwich Terrier","Cairn Terrier",
  "West Highland White Terrier","Skye Terrier","Dandie Dinmont Terrier","Sealyham Terrier","Wheaten Terrier",
  "Soft Coated Wheaten Terrier","Kerry Blue Terrier","Irish Terrier","Welsh Terrier","Lakeland Terrier",
  "Border Terrier","Affenpinscher","Brussels Griffon","Pekingese","Japanese Chin","Tibetan Spaniel","Tibetan Terrier"
];

/* ========================================================================
   8) DEMO DATA (finché non c’è backend)
   ======================================================================== */
const Demo = (function(){
  const dogs = [
    { id:1, name:'Milo',  age:3, breed:'Labrador Retriever', dist:'1.2 km', bio:'Ama l’acqua e i bastoni.', selfie:'selfie1.jpg', photo:'dog1.jpg', verified:true },
    { id:2, name:'Luna',  age:2, breed:'Cane Corso',         dist:'0.8 km', bio:'Dolcissima ma protettiva.', selfie:'selfie2.jpg', photo:'dog2.jpg', verified:true },
    { id:3, name:'Rocky', age:4, breed:'Beagle',             dist:'2.5 km', bio:'Naso infallibile, goloso.', selfie:'selfie3.jpg', photo:'dog3.jpg', verified:false },
  ];
  function get(){ return dogs.slice(); }
  return { get };
})();

/* ========================================================================
   9) UI BINDER (render, swipe, chat, selfie, ads vet)
   ======================================================================== */
const UI = (function(){
  let idx = 0;
  let current = null;
  let firstMessageSent = false;

  function el(){
    return {
      card: $('#socCard'),
      img: $('#socImg'),
      title: $('#socTitle'),
      meta: $('#socMeta'),
      bio: $('#socBio'),
      btnNo: $('#socNo'),
      btnYes: $('#socYes'),
      selfieImg: $('#selfieImg'),
      blurBtn: $('#unlockBtn'),
      chatOpen: $('#openChat'),
      chatPane: $('#chatPane'),
      chatList: $('#chatList'),
      chatInput: $('#chatInput'),
      chatSend: $('#chatSend')
    };
  }

  function render(p){
    const E = el();
    if(!E.card) return;
    current = p;
    setText('#socTitle', `${p.name} · ${p.age}`);
    setText('#socMeta', `${p.breed} · ${p.dist}`);
    setText('#socBio', p.bio || '');
    if (E.img) E.img.src = p.photo || 'dog1.jpg';
    if (E.selfieImg){
      E.selfieImg.src = p.selfie || p.photo || 'dog1.jpg';
      E.selfieImg.style.filter = isSelfieUnlocked(p) ? 'none' : 'blur(14px)';
    }
  }

  function next(){
    const list = Demo.get();
    idx = (idx + 1) % list.length;
    render(list[idx]);
  }

  /* Chat */
  function openChat(){
    const E = el();
    E.chatPane?.classList.remove('hidden');
    E.chatInput?.focus();
  }
  function closeChat(){
    el().chatPane?.classList.add('hidden');
  }
  function sendMessage(){
    const E = el();
    const txt = (E.chatInput?.value || '').trim();
    if(!txt) return;
    const doSend = ()=>{
      const li = document.createElement('li');
      li.textContent = txt;
      E.chatList?.appendChild(li);
      if (E.chatInput) E.chatInput.value='';
      firstMessageSent = true;
    };
    if (!PlutooPlus.isPlus() && !firstMessageSent){
      Rewards.gate('message', doSend);
    } else {
      doSend();
    }
  }

  /* Selfie blur */
  function isSelfieUnlocked(p){
    try{ return localStorage.getItem('selfie:'+p.id)==='1'; }catch(_){ return false; }
  }
  function setSelfieUnlocked(p){
    try{ localStorage.setItem('selfie:'+p.id,'1'); }catch(_){}
  }
  function clickSelfie(){
    if(!current) return;
    if (isSelfieUnlocked(current)) return;
    Rewards.gate('selfie', ()=>{
      setSelfieUnlocked(current);
      if($('#selfieImg')) $('#selfieImg').style.filter='none';
    });
  }

  /* Swipe stile Tinder */
  function bindSwipe(){
    const card = $('#socCard');
    if(!card) return;
    card.classList.add('swipe-card');

    let sx=0, sy=0, dx=0, dy=0, dragging=false;

    const start = (e)=>{
      dragging = true; card.classList.add('grabbing');
      const p = pt(e); sx=p.x; sy=p.y; dx=0; dy=0;
    };
    const move = (e)=>{
      if(!dragging) return;
      const p = pt(e); dx = p.x - sx; dy = p.y - sy;
      const rot = Math.max(-12, Math.min(12, dx/12));
      card.style.transform = `translate(${dx}px, ${dy*0.25}px) rotate(${rot}deg)`;
    };
    const end = ()=>{
      if(!dragging) return;
      dragging=false; card.classList.remove('grabbing');
      const W = Math.min(window.innerWidth, 420);
      const threshold = Math.max(80, W*0.28);
      if(Math.abs(dx) > threshold){
        const dir = dx>0 ? 1 : -1;
        fling(dir);
      }else{
        card.style.transform = 'translate(0,0) rotate(0)';
      }
    };

    card.addEventListener('mousedown', start);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', end);

    card.addEventListener('touchstart', start, {passive:true});
    window.addEventListener('touchmove', move, {passive:true});
    window.addEventListener('touchend', end);

    // Bottoni fallback
    $('#socYes')?.addEventListener('click', ()=> fling(1));
    $('#socNo') ?.addEventListener('click', ()=> fling(-1));

    function fling(dir){
      // uscita fluida
      card.style.transition = 'transform .22s cubic-bezier(.22,.61,.36,1)';
      const off = (window.innerWidth||320)*1.2*dir;
      card.style.transform = `translate(${off}px,-24px) rotate(${dir*20}deg)`;
      setTimeout(()=>{
        // reset e next
        card.style.transition = 'transform .18s ease-out';
        card.style.transform = 'translate(0,0) rotate(0)';
        Rewards.incSwipe();
        // demo: 25% chance di match
        if (Math.random() < 0.25) MatchOverlay.show();
        next();
      }, 220);
    }

    function pt(e){ return { x:(e.touches?.[0]?.clientX ?? e.clientX), y:(e.touches?.[0]?.clientY ?? e.clientY) }; }
  }

  /* Wiring eventi */
  function wire(){
    $('#openChat') ?.addEventListener('click', openChat);
    $('#closeChat')?.addEventListener('click', closeChat);
    $('#chatSend') ?.addEventListener('click', sendMessage);
    $('#chatInput')?.addEventListener('keydown', (e)=>{ if(e.key==='Enter') sendMessage(); });

    $('#unlockBtn') ?.addEventListener('click', clickSelfie);
    $('#selfieImg') ?.addEventListener('click', clickSelfie);

    // Click veterinari/toelettature con data-vet → reward/interstitial mock
    $$('[data-vet]').forEach(n=>{
      n.addEventListener('click', (e)=>{
        if (PlutooPlus.isPlus()) return; // niente ads
        e.preventDefault();
        const href = n.getAttribute('href') || '#';
        Rewards.gate('vet', ()=> window.location.href = href);
      });
    });

    bindSwipe();
  }

  function boot(){
    const list = Demo.get();
    idx = 0;
    render(list[idx]);
    wire();
  }

  return { boot, render, next, openChat, sendMessage };
})();

/* ========================================================================
   10) AVVIO
   ======================================================================== */
onReady(()=>{ UI.boot(); });

/* ========================================================================
   11) Helper text/html (safe)
   ======================================================================== */
function setText(sel, text, root=document){
  try{ const el=root.querySelector(sel); if(el) el.textContent = (text ?? ''); }catch(e){}
}
function setHTML(sel, html, root=document){
  try{ const el=root.querySelector(sel); if(el) el.innerHTML = (html ?? ''); }catch(e){}
}
