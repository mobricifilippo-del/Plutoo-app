/* ========================================================= Plutoo — Gold Edition (app.js) Compatibile 1:1 con l'index che hai inviato.

Home -> App con ENTRA

Tabs: Vicino a te / Amore / Giochiamo insieme

Griglia 2×N con cornice oro e click -> Profilo (sheet)

Swipe (Amore / Giochiamo) con like/dislike

Ricerca personalizzata (autocomplete razze, filtri base + Gold lock)

Luoghi PET -> (mock reward) -> Google Maps

Chat sheet minimal (primo messaggio con gate mock)

i18n IT/EN

Plus (mock) che sblocca filtri Gold ========================================================= */ (function(){ 'use strict';


/* -------------------- Helpers brevi -------------------- */ const $  = (s, r=document) => r.querySelector(s); const $$ = (s, r=document) => Array.from(r.querySelectorAll(s)); const show = el => { if(!el) return; el.classList.remove('hidden'); el.removeAttribute('aria-hidden'); }; const hide = el => { if(!el) return; el.classList.add('hidden'); el.setAttribute('aria-hidden','true'); };

/* -------------------- Stato ---------------------------- */ const S = { lang: (navigator.language||'').toLowerCase().startsWith('it') ? 'it' : 'en', plus: localStorage.getItem('plutoo_plus') === 'yes', view: 'nearby', dogs: [], swipeIdxLove: 0, swipeIdxPlay: 1, likesFreeLeft: (localStorage.getItem('pl_likes_left')||'3')|0, firstChatSent: false, };

/* -------------------- I18N ----------------------------- */ const I18N = { it: { brand:'Plutoo', login:'Login', register:'Registrati', enter:'Entra', sponsorTitle:'Sponsor ufficiale', sponsorCopy:'Fido, il gelato per i nostri amici a quattro zampe', ethicsLine1:'Non abbandonare mai i tuoi amici', ethicsLine2:'(canili vicino a me)', terms:'Termini', privacy:'Privacy', nearby:'Vicino a te', love:'Amore', searchAdvanced:'Ricerca personalizzata', plusBtn:'PLUS', chat:'Chat', send:'Invia', profile:'Profilo', }, en: { brand:'Plutoo', login:'Login', register:'Sign up', enter:'Enter', sponsorTitle:'Official sponsor', sponsorCopy:'Fido, ice cream for our four‑legged friends', ethicsLine1:"Never abandon your friends", ethicsLine2:'(shelters near me)', terms:'Terms', privacy:'Privacy', nearby:'Nearby', love:'Love', searchAdvanced:'Advanced search', plusBtn:'PLUS', chat:'Chat', send:'Send', profile:'Profile', } }; function t(k){ return (I18N[S.lang] && I18N[S.lang][k]) || k; } function applyI18n(){ // Home $('#homeTitle') && ($('#homeTitle').textContent = t('brand')); $('#btnLogin')  && ($('#btnLogin').textContent  = t('login')); $('#btnRegister')&&($('#btnRegister').textContent= t('register')); $('#btnEnter')  && ($('#btnEnter').textContent  = t('enter')); $$('#homeScreen .sponsor-title').forEach(e=>e.textContent=t('sponsorTitle')); $$('#homeScreen .sponsor-copy').forEach(e=>e.textContent=t('sponsorCopy')); $('#ethicsButton .l1') && ($('#ethicsButton .l1').textContent = t('ethicsLine1')); $('#ethicsButton .l2') && ($('#ethicsButton .l2').textContent = t('ethicsLine2')); $$('#homeScreen .legal-links a[data-i18n="terms"]').forEach(a=>a.textContent=t('terms')); $$('#homeScreen .legal-links a[data-i18n="privacy"]').forEach(a=>a.textContent=t('privacy'));

// App topbar
$('#tabNearby') && ($('#tabNearby').textContent = t('nearby'));
$('#tabLove')   && ($('#tabLove').textContent   = t('love'));
$('#btnSearchPanel') && ($('#btnSearchPanel').textContent = t('searchAdvanced'));
$('#btnPlus') && ($('#btnPlus').querySelector('span:last-child').textContent = t('plusBtn'));

// Chat sheet
$('#chatHeader') && ($('#chatHeader').textContent = t('chat'));
$('#chatSend') && ($('#chatSend').textContent = t('send'));

// Profilo sheet
$('#ppTitle') && ($('#ppTitle').textContent = t('profile'));

}

/* -------------------- Dataset demo --------------------- */ const DOGS = [ {id:1,name:'Luna',  age:3, breed:'Labrador',           km:1, img:'dog1.jpg', bio:'Dolcissima e giocherellona', verified:true}, {id:2,name:'Rocky', age:4, breed:'Bulldog',            km:5, img:'dog2.jpg', bio:'Ama i sonnellini',          verified:false}, {id:3,name:'Milo',  age:2, breed:'Golden Retriever',   km:2, img:'dog3.jpg', bio:'Palle e corse al parco',    verified:true}, {id:4,name:'Bella', age:1, breed:'Barboncino',         km:7, img:'dog4.jpg', bio:'Mini ma con carattere',     verified:false}, {id:5,name:'Zoe',   age:5, breed:'Beagle',             km:3, img:'dog5.jpg', bio:'Nasino curioso',            verified:true}, {id:6,name:'Otto',  age:2, breed:'Border Collie',      km:9, img:'dog6.jpg', bio:'Testa e sprint!',           verified:true}, ]; S.dogs = DOGS.slice();

/* -------------------- Home -> App ---------------------- */ function enterApp(){ const home = $('#homeScreen'); const app  = $('#appScreen'); if (!home || !app) return; hide(home); show(app); selectTab('nearby'); renderNearby(S.dogs); }

$('#btnEnter')?.addEventListener('click', enterApp);

// bandierine lingua $('#langIT')?.addEventListener('click', ()=>{ S.lang='it'; applyI18n(); }); $('#langEN')?.addEventListener('click', ()=>{ S.lang='en'; applyI18n(); });

// Sponsor + Etico (Home) $('#sponsorLink')?.addEventListener('click', (e)=>{ // opz: reward mock qui se vorrai }); $('#ethicsButton')?.addEventListener('click', ()=>{ const q = S.lang==='it' ? 'canili vicino a me' : 'animal shelters near me'; window.open('https://www.google.com/maps/search/'+encodeURIComponent(q), '_blank', 'noopener'); });

/* -------------------- Tabs & Views --------------------- */ const VIEWS = { nearby:  {btn:'#tabNearby', view:'#viewNearby'}, love:    {btn:'#tabLove',   view:'#viewLove'}, play:    {btn:'#tabPlay',   view:'#viewPlay'}, };

function selectTab(name){ S.view = name; // evidenzia tab $$('.tabs .tab').forEach(b=>b.classList.remove('active')); $(VIEWS[name].btn)?.classList.add('active'); // mostra vista $$('.content .view').forEach(v=>v.classList.remove('active')); $(VIEWS[name].view)?.classList.add('active'); }

$('#tabNearby')?.addEventListener('click', ()=> selectTab('nearby')); $('#tabLove')  ?.addEventListener('click', ()=> selectTab('love')); $('#tabPlay')  ?.addEventListener('click', ()=> selectTab('play'));

// back ← $('#btnBack')?.addEventListener('click', ()=>{ // in app: torna sempre a Nearby selectTab('nearby'); });

/* -------------------- Nearby (grid 2×N) ---------------- */ function cardHTML(d){ const badge = d.verified ? ' · <span class="gold-badge">💎</span>' : ''; return  <article class="card frame-gold" data-id="${d.id}"> <img class="card-img" src="${d.img}" alt="${d.name}" /> <div class="card-info"> <h3 class="title">${d.name} · ${d.age}</h3> <p class="meta">${d.breed} · ${d.km} km${badge}</p> </div> </article>; } function renderNearby(list){ const grid = $('#nearGrid'); if (!grid) return; grid.innerHTML = list.map(cardHTML).join(''); // click -> profilo $$('#nearGrid .card').forEach(card=>{ card.addEventListener('click', ()=>{ const id = +(card.getAttribute('data-id')||0); openProfile(id); }); }); }

/* -------------------- Profilo (sheet) ------------------ */ window.closeProfilePage = function(){ const s = $('#profileSheet'); if(!s) return; s.classList.add('hidden'); }; function openProfile(id){ const d = S.dogs.find(x=>x.id===id); if(!d) return; const body = $('#ppBody'); if(!body) return; body.innerHTML =  <div class="profile"> <img src="${d.img}" alt="${d.name}" style="width:100%;border-radius:12px;aspect-ratio:1/1;object-fit:cover" /> <h3 style="margin:10px 0 4px">${d.name} · ${d.age}</h3> <div class="meta">${d.breed} · ${d.km} km ${d.verified? '· 💎':''}</div> <div class="actions" style="display:flex;gap:10px;margin-top:10px"> <button class="btn no"  type="button">🥲</button> <button class="btn yes" type="button">💛</button> <button id="openChatBtn" class="btn" type="button">Chat</button> </div> </div>; $('#profileSheet')?.classList.remove('hidden'); $('#openChatBtn')?.addEventListener('click', ()=> openChatWith(d)); }

/* -------------------- LOVE / PLAY (swipe) -------------- */ function setLoveCard(d){ if (!d) return; $('#loveImg')?.setAttribute('src', d.img); $('#loveTitleTxt') && ($('#loveTitleTxt').textContent = ${d.name} · ${d.age}); $('#loveMeta') && ($('#loveMeta').textContent = ${d.breed} · ${d.km} km${d.verified?' · 💎':''}); $('#loveBio') && ($('#loveBio').textContent = d.bio || ''); } function setPlayCard(d){ if (!d) return; $('#playImg')?.setAttribute('src', d.img); $('#playTitleTxt') && ($('#playTitleTxt').textContent = ${d.name} · ${d.age}); $('#playMeta') && ($('#playMeta').textContent = ${d.breed} · ${d.km} km${d.verified?' · 💎':''}); $('#playBio') && ($('#playBio').textContent = d.bio || ''); } function nextLove(){ S.swipeIdxLove = (S.swipeIdxLove+1) % S.dogs.length; setLoveCard(S.dogs[S.swipeIdxLove]); } function nextPlay(){ S.swipeIdxPlay = (S.swipeIdxPlay+1) % S.dogs.length; setPlayCard(S.dogs[S.swipeIdxPlay]); }

$('#loveYes')?.addEventListener('click', ()=>{ flashHeart('💛'); nextLove(); interstitial('Videomatch'); }); $('#loveNo') ?.addEventListener('click', ()=>{ flashHeart('🥲'); nextLove(); }); $('#playYes')?.addEventListener('click', ()=>{ flashHeart('🐕'); nextPlay(); }); $('#playNo') ?.addEventListener('click', ()=>{ flashHeart('🥲'); nextPlay(); });

function flashHeart(emoji){ const b = document.createElement('div'); b.style.cssText = 'position:fixed;inset:0;display:grid;place-items:center;pointer-events:none;z-index:9999'; b.innerHTML = <div style="font-size:96px;filter:drop-shadow(0 12px 50px rgba(255,215,74,.55))">${emoji}</div>; document.body.appendChild(b); setTimeout(()=> b.remove(), 520); } function interstitial(title){ const d = document.createElement('dialog'); d.innerHTML = <div style="padding:16px 18px;max-width:340px"><h3 style="margin:0 0 8px">${title||'Ad'}</h3><p style="opacity:.85;margin:0 0 12px">Pubblicità (mock)</p><button class="btn primary" id="x">Chiudi</button></div>; document.body.appendChild(d); d.showModal(); d.querySelector('#x').addEventListener('click', ()=>{ d.close(); d.remove(); }, {once:true}); }

/* -------------------- Ricerca personalizzata ----------- */ const BREEDS = ['Labrador','Golden Retriever','Barboncino','Bulldog','Beagle','Chihuahua','Pastore Tedesco','Jack Russell','Cocker Spaniel','Carlino','Maltese','Border Collie','Husky','Bassotto','Dalmata','Pitbull','Shiba Inu','Rottweiler','Terranova','Samoyed']; const breedsInput  = $('#breedInput'); const breedsList   = $('#breedsList'); const searchPanel  = $('#searchPanel'); const searchForm   = $('#searchForm');

$('#btnSearchPanel')?.addEventListener('click', ()=>{ searchPanel?.classList.remove('hidden'); }); $('#closeSearch')   ?.addEventListener('click', ()=>{ searchPanel?.classList.add('hidden');  });

// slider distanza $('#distRange')?.addEventListener('input', (e)=>{ $('#distLabel').textContent = ${e.target.value} km; });

// autocomplete razze (prefisso) breedsInput?.addEventListener('input', ()=>{ const q = (breedsInput.value||'').trim().toLowerCase(); if (!q){ breedsList.innerHTML=''; breedsList.classList.remove('show'); return; } const m = BREEDS.filter(b=> b.toLowerCase().startsWith(q)).slice(0,8); if (!m.length){ breedsList.innerHTML=''; breedsList.classList.remove('show'); return; } breedsList.innerHTML = m.map(b=><button type="button" class="sugg">${b}</button>).join(''); breedsList.classList.add('show'); }); breedsList?.addEventListener('click', (e)=>{ if (e.target.classList.contains('sugg')){ breedsInput.value = e.target.textContent; breedsList.classList.remove('show'); } });

// submit filtri (base + lock Gold) searchForm?.addEventListener('submit', (e)=>{ e.preventDefault(); const sex = $('#sexFilter')?.value || ''; const dist= +($('#distRange')?.value || '50'); const breed = (breedsInput?.value||'').trim().toLowerCase();

let list = DOGS.slice();
if (sex)  list = list.filter(d=> (sex==='M' ? true : true)); // demo non filtra sesso (dataset minimale)
if (breed) list = list.filter(d=> d.breed.toLowerCase().startsWith(breed));
list = list.filter(d=> d.km <= dist);

renderNearby(list);
searchPanel?.classList.add('hidden');
selectTab('nearby');

}); $('#resetFilters')?.addEventListener('click', ()=>{ setTimeout(()=>{ renderNearby(DOGS); }, 0); });

/* -------------------- Plus (mock) ---------------------- */ $('#btnPlus')?.addEventListener('click', ()=>{ $('#plusModal')?.classList.remove('hidden'); }); $('#closePlus')?.addEventListener('click', ()=>{ $('#plusModal')?.classList.add('hidden'); }); // Esempio attivazione (puoi agganciare a un pulsante dentro al modal) window.activatePlus = function(){ S.plus = true; localStorage.setItem('plutoo_plus','yes'); alert('Plutoo Plus attivato (mock)'); };

/* -------------------- Luoghi PET ----------------------- */ $('#tabLuoghi')?.addEventListener('click', ()=>{ const m = $('#luoghiMenu'); if (!m) return; const is = m.classList.toggle('show'); $('#tabLuoghi')?.setAttribute('aria-expanded', is?'true':'false'); }); $$('#luoghiMenu .menu-item').forEach(btn=>{ btn.addEventListener('click', ()=>{ const mapQ = btn.textContent.trim(); window.open('https://www.google.com/maps/search/'+encodeURIComponent(mapQ), '_blank', 'noopener'); $('#luoghiMenu')?.classList.remove('show'); }); });

/* -------------------- Chat sheet ----------------------- */ function openChatWith(d){ $('#chatPane')?.classList.remove('hidden'); const list = $('#chatList'); if (list) list.innerHTML = ''; } $('#closeChat')?.addEventListener('click', ()=> $('#chatPane')?.classList.add('hidden')); $('#chatComposer')?.addEventListener('submit', (e)=>{ e.preventDefault(); const input = $('#chatInput'); if (!input) return; const txt = (input.value||'').trim(); if (!txt) return; // primo messaggio -> reward mock if (!S.firstChatSent){ S.firstChatSent = true; interstitial('Video per inviare il primo messaggio'); } appendMsg(txt, true); input.value=''; setTimeout(()=> appendMsg('🐾 Bau!', false), 600); }); function appendMsg(text, me){ const el = document.createElement('div'); el.style.cssText = margin:8px 0; padding:8px 10px; border-radius:10px; max-width:80%; ${me?'margin-left:auto;background:rgba(255,215,74,.14)':'background:rgba(255,255,255,.08)'} ; el.textContent = text; $('#chatList')?.appendChild(el); const cl = $('#chatList'); if (cl) cl.scrollTop = cl.scrollHeight; }

/* -------------------- Avvio ---------------------------- */ document.addEventListener('DOMContentLoaded', ()=>{ applyI18n(); // Stato iniziale: Home visibile, App nascosta (già da index). // Pre-carica dati UI per card Love/Play setLoveCard(S.dogs[S.swipeIdxLove]); setPlayCard(S.dogs[S.swipeIdxPlay]); }); })();
