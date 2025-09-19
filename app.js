/* Plutoo v2-stable2 — JS compatibile Android (no optional chaining), lista 2 colonne, Scorri, Match, profilo, filtri razza/età, 🐾 blu */

/* ====== DATASET DEMO ====== */
var dogs = [
  { id:1,  name:'Luna',  age:1, breed:'Jack Russell',     distance:2.2, image:'./dog2.jpg', online:true,
    verified:true, lastSeen:'2025-09-19T10:12:00Z',
    photos:['./dog2.jpg','./dog1.jpg','./dog3.jpg'],
    character:'Giocherellona', energy:'Alta', living:'Ok altri cani', area:'Ostia',
    posts:[{text:'Passeggiata al parco!',ts:'2025-09-18 10:21'}] },
  { id:2,  name:'Rocky', age:3, breed:'Labrador',         distance:1.6, image:'./dog1.jpg', online:true,
    verified:true, lastSeen:'2025-09-19T09:40:00Z',
    photos:['./dog1.jpg','./dog4.jpg'],
    character:'Dolce', energy:'Media', living:'Ok bambini', area:'Garbatella',
    posts:[{text:'Nuovo amico al laghetto 💦',ts:'2025-09-15 12:40'}] },
  { id:3,  name:'Bella', age:2, breed:'Shiba Inu',        distance:3.2, image:'./dog3.jpg', online:true,
    verified:false, lastSeen:'2025-09-18T20:00:00Z',
    photos:['./dog3.jpg','./dog1.jpg','./dog4.jpg'],
    character:'Curiosa', energy:'Media', living:'Meglio da sola', area:'EUR', posts:[] },
  { id:4,  name:'Max',   age:4, breed:'Golden Retriever', distance:5.9, image:'./dog4.jpg', online:true,
    verified:true, lastSeen:'2025-09-19T07:10:00Z',
    photos:['./dog4.jpg','./dog2.jpg'],
    character:'Tranquillo', energy:'Bassa', living:'Giardino', area:'Prati',
    posts:[{text:'Pennichella al sole ☀️',ts:'2025-09-16 15:12'}] },
  { id:5,  name:'Milo',  age:1, breed:'Labrador',         distance:4.1, image:'./dog1.jpg', online:true,
    verified:false, lastSeen:'2025-09-18T11:30:00Z',
    photos:['./dog1.jpg','./dog2.jpg','./dog3.jpg','./dog4.jpg'],
    character:'Vivace', energy:'Alta', living:'Ok tutti', area:'Trastevere', posts:[] },
  { id:6,  name:'Kira',  age:2, breed:'Jack Russell',     distance:2.9, image:'./dog2.jpg', online:false,
    verified:true, lastSeen:'2025-09-17T18:20:00Z',
    photos:['./dog2.jpg','./dog3.jpg'],
    character:'Attenta', energy:'Alta', living:'Casa e parco', area:'Centocelle', posts:[] },
  { id:7,  name:'Thor',  age:5, breed:'Golden Retriever', distance:7.0, image:'./dog4.jpg', online:true,
    verified:false, lastSeen:'2025-09-19T08:00:00Z',
    photos:['./dog4.jpg','./dog1.jpg'],
    character:'Affettuoso', energy:'Media', living:'Famiglia', area:'Tiburtina', posts:[] },
  { id:8,  name:'Nala',  age:3, breed:'Shiba Inu',        distance:3.7, image:'./dog3.jpg', online:true,
    verified:true, lastSeen:'2025-09-19T10:00:00Z',
    photos:['./dog3.jpg','./dog2.jpg'],
    character:'Indipendente', energy:'Media', living:'Meglio da sola', area:'San Paolo', posts:[] },
  { id:9,  name:'Zoe',   age:2, breed:'Labrador',         distance:2.4, image:'./dog1.jpg', online:true,
    verified:false, lastSeen:'2025-09-19T06:35:00Z',
    photos:['./dog1.jpg','./dog3.jpg'],
    character:'Socievole', energy:'Alta', living:'Ok con cani', area:'Portuense', posts:[] },
  { id:10, name:'Otto',  age:4, breed:'Jack Russell',     distance:6.3, image:'./dog2.jpg', online:false,
    verified:false, lastSeen:'2025-09-16T21:03:00Z',
    photos:['./dog2.jpg','./dog1.jpg'],
    character:'Cacciatore', energy:'Alta', living:'Passeggiate lunghe', area:'Anagnina', posts:[] },
  { id:11, name:'Paco',  age:3, breed:'Shiba Inu',        distance:5.1, image:'./dog3.jpg', online:true,
    verified:true, lastSeen:'2025-09-19T09:12:00Z',
    photos:['./dog3.jpg','./dog4.jpg'],
    character:'Furbo', energy:'Media', living:'Routine fissa', area:'Monti', posts:[] },
  { id:12, name:'Maya',  age:2, breed:'Golden Retriever', distance:4.8, image:'./dog4.jpg', online:true,
    verified:false, lastSeen:'2025-09-19T09:55:00Z',
    photos:['./dog4.jpg','./dog2.jpg'],
    character:'Solare', energy:'Alta', living:'Famiglia', area:'Parioli', posts:[] }
];

/* ====== RAZZE ====== */
var BREEDS = [
  'Labrador','Golden Retriever','Jack Russell','Shiba Inu',
  'Pastore Tedesco','Bulldog Francese','Beagle','Barboncino (Poodle)',
  'Chihuahua','Cocker Spaniel','Border Collie','Carlino (Pug)','Dobermann',
  'Rottweiler','Husky Siberiano','Maltese','Bassotto','Yorkshire Terrier'
];

/* ====== STATO ====== */
var matches = new Set();
var currentView = 'near';   // near | browse | match
var deckIndex = 0;
var photoIndexByDog = new Map();

/* ====== HELPERS ====== */
function $(s){ return document.querySelector(s); }
function $$(s){ return document.querySelectorAll(s); }

var cardsEl  = $('#cards');
var deckEl   = $('#deck');
var detailEl = $('#detail');
var sheetEl  = $('#dogsheet');

/* ====== FILTRI (razza + età) ====== */
function initBreedOptions(){
  var sel = document.getElementById('breedFilter');
  if (!sel) return;
  var html = '<option value="">Razza (tutte)</option>';
  for (var i=0;i<BREEDS.length;i++){ html += '<option>'+BREEDS[i]+'</option>'; }
  sel.innerHTML = html;
}
function getFilters(){
  var breedSel = document.getElementById('breedFilter');
  var ageSel   = document.getElementById('ageFilter');
  return {
    breed: breedSel ? breedSel.value : '',
    age:   ageSel ? ageSel.value : ''
  };
}
function applyFilters(list){
  var f = getFilters();
  var out = list.slice();
  if (f.breed) out = out.filter(function(d){ return d.breed === f.breed; });
  if (f.age === '0-1') out = out.filter(function(d){ return d.age <= 1; });
  if (f.age === '2-3') out = out.filter(function(d){ return d.age >= 2 && d.age <= 3; });
  if (f.age === '4+')  out = out.filter(function(d){ return d.age >= 4; });
  return out;
}
function updateResultsInfo(count){
  var el = document.getElementById('resultsInfo'); if (!el) return;
  el.textContent = 'Mostro ' + count + ' cane' + (count===1?'':'i');
}

/* ====== RENDER ====== */
function render(){
  var isDeck = (currentView === 'browse');
  if (cardsEl) cardsEl.hidden = isDeck;
  if (deckEl)  deckEl.hidden  = !isDeck;

  var list = applyFilters(dogs);

  if (currentView === 'near'){
    list = list.filter(function(d){ return d.online; }).sort(function(a,b){ return a.distance-b.distance; });
    renderGrid(list);
  } else if (currentView === 'match'){
    list = list.filter(function(d){ return matches.has(d.id); });
    renderGrid(list);
  } else {
    if (!list.length){ if (deckEl) deckEl.innerHTML=''; updateResultsInfo(0); return; }
    if (deckIndex >= list.length) deckIndex = 0;
    updateResultsInfo(list.length);
    renderDeck(list[deckIndex]);
  }
}

function renderGrid(list){
  updateResultsInfo(list.length);
  if (!cardsEl) return;
  if (!list.length){
    cardsEl.innerHTML = '<p style="padding:12px 16px;color:#6b7280">Nessun risultato qui.</p>';
    return;
  }
  cardsEl.innerHTML = '';
  list.forEach(function(d){
    var el = document.createElement('article');
    el.className = 'card';
    el.innerHTML =
      '<div class="pic">' +
        '<img src="'+d.image+'" alt="Foto di '+d.name+'" data-open="'+d.id+'">' +
        '<span class="badge">'+d.distance.toFixed(1)+' km</span>' +
        (d.online ? '<span class="dot"></span>' : '') +
      '</div>' +
      '<div class="body">' +
        '<div class="name">'+d.name+', '+d.age+(d.verified?'<span class="badge-verify">🐾</span>':'')+'</div>' +
        '<div class="breed">'+d.breed+'</div>' +
        '<div class="actions">' +
          '<button class="btn-round btn-no" data-act="no"  data-id="'+d.id+'"><span class="emoji">🥲</span></button>' +
          '<button class="btn-round btn-yes" data-act="yes" data-id="'+d.id+'"><span class="emoji">❤️</span></button>' +
        '</div>' +
      '</div>';
    cardsEl.appendChild(el);
  });
}

function renderDeck(d){
  if (!deckEl) return;
  deckEl.innerHTML =
    '<article class="card card-big" id="deckCard">' +
      '<div class="pic">' +
        '<img src="'+d.image+'" alt="Foto di '+d.name+'" data-open="'+d.id+'">' +
        '<span class="badge">'+d.distance.toFixed(1)+' km</span>' +
        (d.online ? '<span class="dot"></span>' : '') +
      '</div>' +
      '<div class="body">' +
        '<div class="name">'+d.name+', '+d.age+(d.verified?'<span class="badge-verify">🐾</span>':'')+'</div>' +
        '<div class="breed">'+d.breed+'</div>' +
        '<div class="swipe-actions">' +
          '<button class="btn-round btn-no" data-act="no"  data-id="'+d.id+'"><span class="emoji">🥲</span></button>' +
          '<button class="btn-round btn-yes" data-act="yes" data-id="'+d.id+'"><span class="emoji">❤️</span></button>' +
        '</div>' +
      '</div>' +
    '</article>';
}

/* ====== PROFILO (overlay) ====== */
var savedScrollY = 0;
function showDetailOverlay(){
  savedScrollY = window.scrollY || 0;
  document.body.style.position = 'fixed';
  document.body.style.top = '-' + savedScrollY + 'px';
  document.body.style.left = '0';
  document.body.style.right = '0';
  document.body.style.width = '100%';
  if (detailEl) detailEl.hidden = false;
  if (detailEl) Object.assign(detailEl.style,{position:'fixed',inset:'0',background:'#fff',zIndex:'9999',overflowY:'auto'});
}
function hideDetailOverlay(){
  if (detailEl){ detailEl.hidden = true; detailEl.removeAttribute('style'); }
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.left = '';
  document.body.style.right = '';
  document.body.style.width = '';
  window.scrollTo(0, savedScrollY || 0);
}
function timeSince(iso){
  if (!iso) return '';
  var then = new Date(iso).getTime();
  var diff = Math.max(0, Date.now() - then);
  var m = Math.floor(diff/60000), h = Math.floor(m/60), d = Math.floor(h/24);
  if (d>0) return d+'g fa';
  if (h>0) return h+'h fa';
  if (m>0) return m+'m fa';
  return 'ora';
}
function renderDetail(d){
  if (!sheetEl) return;
  var photos = (d.photos && d.photos.length) ? d.photos : [d.image];
  var idx = photoIndexByDog.has(d.id) ? photoIndexByDog.get(d.id) : 0;
  var total = photos.length;
  var current = ((idx % total) + total) % total;

  var thumbHtml = '';
  for (var i=0;i<photos.length;i++){
    thumbHtml += '<img src="'+photos[i]+'" data-thumb="'+i+'" alt="thumb '+(i+1)+'" ' +
      'style="width:64px;height:64px;object-fit:cover;border-radius:10px;opacity:'+(i===current?1:.6)+';outline:'+(i===current?'3px solid #e9d5ff':'none')+'">';
  }

  var onlineRow = d.online
    ? '<div class="drow"><strong>Stato:</strong> <span style="color:#10b981">🟢 Online ora</span></div>'
    : '<div class="drow"><strong>Stato:</strong> <span style="color:#6b7280">Ultimo accesso: '+timeSince(d.lastSeen)+'</span></div>';

  sheetEl.innerHTML =
    '<div style="position:relative">' +
      '<img id="bigPhoto" class="dphoto" src="'+photos[current]+'" alt="Foto di '+d.name+'" data-id="'+d.id+'" data-idx="'+current+'">' +
      '<div style="position:absolute;right:10px;bottom:10px;background:#00000080;color:#fff;padding:6px 10px;border-radius:12px;font-weight:700">'+(current+1)+'/'+total+'</div>' +
    '</div>' +
    '<div style="display:flex;gap:10px;overflow:auto;padding:10px 12px 6px">'+thumbHtml+'</div>' +
    '<div class="dinfo">' +
      '<h2 style="margin:0 0 6px;display:flex;align-items:center;gap:6px"><span>'+d.name+', '+d.age+'</span>'+(d.verified?'<span class="badge-verify">🐾</span>':'')+'</h2>' +
      '<div class="dmeta">'+d.breed+' • '+d.distance.toFixed(1)+' km</div>' +
      onlineRow +
      '<div class="drow"><strong>Carattere:</strong> '+d.character+'</div>' +
      '<div class="drow"><strong>Energia:</strong> '+d.energy+'</div>' +
      '<div class="drow"><strong>Convivenza:</strong> '+d.living+'</div>' +
      '<div class="drow"><strong>Zona:</strong> '+d.area+'</div>' +
      '<div class="profile-actions">' +
        '<button class="btn-round btn-no" data-act="no"  data-id="'+d.id+'"><span class="emoji">🥲</span></button>' +
        '<button class="btn-round btn-yes" data-act="yes" data-id="'+d.id+'"><span class="emoji">❤️</span></button>' +
      '</div>' +
      '<h3 style="margin:16px 0 8px">Aggiornamenti</h3>' +
      ((d.posts && d.posts.length)
        ? d.posts.map(function(po){
            return '<div style="background:#fff;border-radius:14px;padding:12px;box-shadow:0 8px 20px rgba(0,0,0,.06);margin:10px 0">' +
                     '<div style="font-weight:700;margin-bottom:6px">'+d.name+'</div>' +
                     '<div style="color:#6b7280;font-size:.9rem;margin-bottom:8px">'+po.ts+'</div>' +
                     '<div>'+po.text+'</div>' +
                   '</div>';
          }).join('')
        : '<div style="color:#9ca3af">Nessun aggiornamento ancora.</div>'
      ) +
    '</div>';

  // swipe foto
  var big = document.getElementById('bigPhoto');
  var touchX = null;
  if (big){
    big.addEventListener('touchstart', function(e){ touchX = e.changedTouches[0].clientX; }, {passive:true});
    big.addEventListener('touchend', function(e){
      if (touchX == null) return;
      var dx = e.changedTouches[0].clientX - touchX; touchX = null;
      if (Math.abs(dx) < 30) return;
      var dir = dx < 0 ? 1 : -1;
      var next = ((current + dir) % total + total) % total;
      photoIndexByDog.set(d.id, next);
      renderDetail(d);
    }, {passive:true});
  }
}

function openDetail(id){
  var d = dogs.find(function(x){ return x.id===id; });
  if (!d) return;
  if (!photoIndexByDog.has(d.id)) photoIndexByDog.set(d.id, 0);
  renderDetail(d);
  showDetailOverlay();
}

/* ====== ANIMAZIONI ====== */
function animateGridAction(button, yes){
  var card = button ? button.closest('.card') : null; if (!card) return;
  if (yes){
    card.animate(
      [{transform:'scale(1)',opacity:1},{transform:'scale(1.04)',opacity:1},{transform:'scale(.96)',opacity:.9},
       {transform:'scale(.98)',opacity:.85},{transform:'scale(1)',opacity:0}],
      {duration:280,easing:'ease-in-out'}
    ).onfinish = function(){ render(); };
  } else {
    card.animate(
      [{transform:'translateX(0)'},{transform:'translateX(-6px)'},{transform:'translateX(6px)'},
       {transform:'translateX(-4px)'},{transform:'translateX(0)'}],
      {duration:220,easing:'ease-in-out'}
    );
  }
}
function animateDeckAction(yes){
  var card = document.getElementById('deckCard'); if (!card) return;
  var dir = yes ? 1 : -1;
  card.animate(
    [{transform:'translateX(0) rotate(0deg)',opacity:1},
     {transform:'translateX('+(dir*20)+'px) rotate('+(dir*2)+'deg)',opacity:1},
     {transform:'translateX('+(dir*120)+'px) rotate('+(dir*8)+'deg)',opacity:0}],
    {duration:260,easing:'ease-in-out'}
  ).onfinish = function(){
    var filtered = applyFilters(dogs);
    deckIndex = (deckIndex + 1) % (filtered.length || 1);
    render();
  };
}

/* ====== EVENTI ====== */
// Tabs
$$('.tab').forEach(function(btn){
  btn.addEventListener('click', function(){
    $$('.tab').forEach(function(x){ x.classList.remove('active'); });
    btn.classList.add('active');
    currentView = btn.getAttribute('data-view'); // near | browse | match
    if (currentView === 'browse') deckIndex = 0;
    render();
  });
});

// Filtri reattivi
['breedFilter','ageFilter'].forEach(function(id){
  var el = document.getElementById(id);
  if (el) el.addEventListener('change', function(){ deckIndex = 0; render(); });
});

// Geo (demo)
var locOn = document.getElementById('locOn');
if (locOn) locOn.addEventListener('click', function(){ alert('Posizione attivata (demo).'); });
var locLater = document.getElementById('locLater');
if (locLater) locLater.addEventListener('click', function(){ alert('Ok, più tardi.'); });

// Click globali
document.addEventListener('click', function(e){
  var open = e.target.closest ? e.target.closest('[data-open]') : null;
  if (open){ openDetail(Number(open.getAttribute('data-open'))); return; }

  var th = e.target.closest ? e.target.closest('[data-thumb]') : null;
  if (th){
    var big = document.getElementById('bigPhoto');
    var dogId = big && big.dataset ? Number(big.dataset.id) : NaN;
    var idx   = Number(th.getAttribute('data-thumb'));
    if (!isNaN(dogId) && !isNaN(idx)){
      photoIndexByDog.set(dogId, idx);
      var d = dogs.find(function(x){ return x.id===dogId; });
      if (d) renderDetail(d);
    }
    return;
  }

  var b = e.target.closest ? e.target.closest('button[data-id]') : null;
  if (!b) return;
  var id  = Number(b.getAttribute('data-id'));
  var yes = (b.getAttribute('data-act') === 'yes');

  if (yes) matches.add(id);
  else {
    var i = dogs.findIndex(function(d){ return d.id===id; });
    if (i>=0) dogs.push.apply(dogs, dogs.splice(i,1)); // skip → fondo
  }

  if (e.target.closest && e.target.closest('.profile-actions')){
    b.animate([{transform:'scale(1)'},{transform:'scale(1.12)'},{transform:'scale(1)'}],{duration:160});
    return;
  }

  if (currentView === 'browse') animateDeckAction(yes);
  else animateGridAction(b, yes);
});

// Chiudi profilo
var closeDetailBtn = document.getElementById('closeDetail');
if (closeDetailBtn){
  closeDetailBtn.addEventListener('click', function(e){
    e.preventDefault();
    hideDetailOverlay();
  });
}

/* ====== AVVIO ====== */
initBreedOptions();
render();
