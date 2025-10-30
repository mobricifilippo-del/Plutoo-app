'use strict';

/**

Plutoo — app.js (baseline funzionante)

Compatibile Android/WebView. Non modifica la struttura dell'index.

Obiettivi minimi: "Entra" porta nell'app, tabs funzionano, pannelli/modali

si aprono/chiudono, griglia "Vicino a te" popolata con segnaposto. */


// ————— Utils ————— const $ = (sel, root = document) => root.querySelector(sel); const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel)); const show = (el) => { el?.classList.remove('hidden'); el?.setAttribute('aria-hidden', 'false'); }; const hide = (el) => { el?.classList.add('hidden'); el?.setAttribute('aria-hidden', 'true'); };

// Stato semplice const state = { currentTab: 'nearby', plus: localStorage.getItem('plutoo_plus') === 'yes', };

// ————— Inizializzazione ————— function init() { wireHome(); wireTabs(); wirePanels(); wirePlus(); wireMisc(); bootstrapNearby(); }

// ————— HOME ————— function wireHome() { const btnEnter = $('#btnEnter'); const home = $('#homeScreen'); const app = $('#appScreen');

btnEnter?.addEventListener('click', () => { // piccola animazione al logo (se presente una classe CSS) $('#heroLogo')?.classList.add('pulse'); // entra nell'app dopo un brevissimo delay per far vedere il tap setTimeout(() => { hide(home); show(app); // focus sulla prima tab $('#tabNearby')?.focus(); }, 150); }); }

// ————— TABS ————— function wireTabs() { const tabs = [ { btn: $('#tabNearby'), view: $('#viewNearby'), key: 'nearby' }, { btn: $('#tabLove'),   view: $('#viewLove'),   key: 'love'   }, { btn: $('#tabPlay'),   view: $('#viewPlay'),   key: 'play'   }, ];

function activate(key) { state.currentTab = key; tabs.forEach(({ btn, view, key: k }) => { if (!btn || !view) return; const active = (k === key); btn.classList.toggle('active', active); btn.setAttribute('aria-selected', String(active)); view.classList.toggle('active', active); view.setAttribute('aria-hidden', String(!active)); view.style.display = active ? '' : 'none'; }); }

tabs.forEach(({ btn, key }) => btn?.addEventListener('click', () => activate(key))); activate('nearby');

// Menu Luoghi PET const ddBtn = $('#tabLuoghi'); const ddMenu = $('#luoghiMenu'); ddBtn?.addEventListener('click', () => { const open = ddBtn.getAttribute('aria-expanded') === 'true'; ddBtn.setAttribute('aria-expanded', String(!open)); ddMenu?.classList.toggle('open', !open); }); $$('#luoghiMenu .menu-item').forEach(it => it.addEventListener('click', () => { // Apri Google Maps in base alla categoria const mapQuery = { vets: 'veterinari vicino a me', groomers: 'toelettatura per cani vicino a me', shops: 'negozi animali vicino a me', trainers: 'addestratori cani vicino a me', kennels: 'pensioni per cani vicino a me', parks: 'parco per cani vicino a me', }[it.dataset.cat] || 'cani vicino a me'; window.open(https://www.google.com/maps/search/${encodeURIComponent(mapQuery)},'_blank'); ddBtn?.setAttribute('aria-expanded','false'); ddMenu?.classList.remove('open'); })); }

// ————— PANNELLI / MODALI ————— function wirePanels() { const btnSearch = $('#btnSearchPanel'); const panel = $('#searchPanel'); const closeSearch = $('#closeSearch');

btnSearch?.addEventListener('click', () => show(panel)); closeSearch?.addEventListener('click', () => hide(panel));

// Aggiorna label distanza const dist = $('#distRange'); const distLabel = $('#distLabel'); dist?.addEventListener('input', () => { if (distLabel) distLabel.textContent = ${dist.value} km; });

// Chat pane const chatPane = $('#chatPane'); $('#closeChat')?.addEventListener('click', () => hide(chatPane));

// Profilo (chiudi) window.closeProfilePage = () => hide($('#profileSheet')); }

// ————— PLUS ————— function wirePlus() { const plusBtn = $('#btnPlus'); const modal = $('#plusModal'); const closePlus = $('#closePlus');

plusBtn?.addEventListener('click', () => show(modal)); closePlus?.addEventListener('click', () => hide(modal)); }

// ————— VARIE ————— function wireMisc() { // Bottone etico (Home) const ethicsHome = $('#ethicsButton'); ethicsHome?.addEventListener('click', () => { const q = navigator.language?.startsWith('en') ? 'animal shelters near me' : 'canili vicino a me'; window.open(https://www.google.com/maps/search/${encodeURIComponent(q)},'_blank'); });

// Sponsor (apre diretto) $('#sponsorLink')?.addEventListener('click', (e) => { // se in futuro servirà un reward, inserire qui }); $('#sponsorLinkApp')?.addEventListener('click', () => {});

// Tasto Indietro in topbar: torna alla Home $('#btnBack')?.addEventListener('click', () => { show($('#homeScreen')); hide($('#appScreen')); }); }

// ————— VICINO A TE ————— function bootstrapNearby() { const grid = $('#nearGrid'); if (!grid) return; const mock = [ { name: 'Luna', sex: 'F', breed: 'Border Collie', dist: '1.2 km', img: 'dog1.jpg' }, { name: 'Rocky', sex: 'M', breed: 'Labrador', dist: '2.0 km', img: 'dog2.jpg' }, { name: 'Maya', sex: 'F', breed: 'Beagle', dist: '3.1 km', img: 'dog3.jpg' }, { name: 'Zoe',  sex: 'F', breed: 'Shiba',   dist: '0.8 km', img: 'dog4.jpg' }, ]; grid.innerHTML = mock.map(cardHTML).join('');

// click card → profilo (pagina/sheet dedicata) $$('#nearGrid .dog-card').forEach(card => card.addEventListener('click', () => { const name = card.getAttribute('data-name') || 'Dog'; const img = card.getAttribute('data-img') || 'dog1.jpg'; openProfile({ name, img }); })); }

function cardHTML(d) { return <div class="dog-card" data-name="${escapeHtml(d.name)}" data-img="${escapeHtml(d.img)}"> <div class="ph"></div> <img src="${escapeHtml(d.img)}" alt="${escapeHtml(d.name)}" loading="lazy"/> <div class="info"> <div class="row"><strong>${escapeHtml(d.name)}</strong><span>· ${escapeHtml(d.sex)}</span></div> <div class="meta">${escapeHtml(d.breed)} · ${escapeHtml(d.dist)}</div> </div> </div>; }

function openProfile({ name, img }) { const sheet = $('#profileSheet'); const body = $('#ppBody'); if (!sheet || !body) return; body.innerHTML = <div class="profile"> <img class="avatar" src="${escapeHtml(img)}" alt="${escapeHtml(name)}"/> <h3>${escapeHtml(name)}</h3> <p class="meta">Razza sconosciuta · distanza n/d</p> <div class="actions"> <button id="openChat" class="btn primary">Chat</button> </div> </div>; $('#openChat')?.addEventListener('click', () => show($('#chatPane'))); show(sheet); }

// ————— Helper ————— function escapeHtml(str) { return String(str) .replaceAll('&','&') .replaceAll('<','<') .replaceAll('>','>') .replaceAll('"','"') .replaceAll("'",'''); }

// Avvio document.addEventListener('DOMContentLoaded', () => { try { init(); } catch (err) { console.error('Plutoo init error:', err); } });
