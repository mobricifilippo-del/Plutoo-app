/* Plutoo v1.5 – Scorri con animazioni ripristinate (❤️/🥲), filtri tendina+chip, griglia 2 col, profilo, match
   - Solo JS: nessuna modifica a index.html / style.css
   - Compatibile Android (no optional chaining)
*/

/* ====== Dataset demo ====== */
var dogs = [
  { id:1, name:'Luna',  age:1, breed:'Jack Russell',      distance:2.2, image:'./dog1.jpg', online:true,  sex:'F', size:'Piccola', coat:'Corto',  energy:'Alta',  pedigree:'si', verified:true },
  { id:2, name:'Rocky', age:3, breed:'Labrador',          distance:1.6, image:'./dog2.jpg', online:true,  sex:'M', size:'Grande', coat:'Corto',  energy:'Media', pedigree:'no', verified:true },
  { id:3, name:'Bella', age:2, breed:'Shiba Inu',         distance:3.2, image:'./dog3.jpg', online:false, sex:'F', size:'Media',  coat:'Medio',  energy:'Alta',  pedigree:'si', verified:false },
  { id:4, name:'Max',   age:4, breed:'Golden Retriever',  distance:5.9, image:'./dog4.jpg', online:true,  sex:'M', size:'Grande', coat:'Lungo',  energy:'Bassa', pedigree:'no', verified:true },
  { id:5, name:'Milo',  age:1, breed:'Beagle',            distance:4.1, image:'./dog1.jpg', online:true,  sex:'M', size:'Piccola', coat:'Corto', energy:'Alta',  pedigree:'no', verified:false },
  { id:6, name:'Nala',  age:6, breed:'Barboncino',        distance:2.4, image:'./dog2.jpg', online:true,  sex:'F', size:'Piccola', coat:'Lungo', energy:'Media', pedigree:'si', verified:true },
  { id:7, name:'Kira',  age:5, breed:'Border Collie',     distance:3.2, image:'./dog3.jpg', online:true,  sex:'F', size:'Media',  coat:'Medio', energy:'Alta',  pedigree:'si', verified:false },
  { id:8, name:'Odin',  age:8, breed:'Pastore Tedesco',   distance:7.3, image:'./dog4.jpg', online:true,  sex:'M', size:'Grande', coat:'Medio', energy:'Media', pedigree:'no', verified:true },
  { id:9, name:'Zoe',   age:2, breed:'Meticcio',          distance:1.9, image:'./dog1.jpg', online:true,  sex:'F', size:'Media',  coat:'Corto', energy:'Bassa', pedigree:'no', verified:false },
  { id:10,name:'Argo',  age:4, breed:'Labrador',          distance:2.7, image:'./dog2.jpg', online:true,  sex:'M', size:'Grande', coat:'Corto', energy:'Alta',  pedigree:'si', verified:true }
];

/* ====== Stato app ====== */
var matches = new Set();
var currentView = 'near';          // near | browse | match
var deckIndex = 0;                 // indice corrente per "Scorri"

/* ====== Filtri (persistenti) ====== */
var defaultFilters = {
  breed:'', age:'', sex:'', size:'', coat:'', energy:'', pedigree:'', distance:''
};
var saved = null;
try { saved = JSON.parse(localStorage.getItem('pl_filters') || 'null'); } catch(e){ saved = null; }
var filters = saved && typeof saved==='object' ? merge(defaultFilters, saved) : clone(defaultFilters);

function clone(o){ return JSON.parse(JSON.stringify(o)); }
function merge(a,b){ var r=clone(a); for (var k in b) r[k]=b[k]; return r; }
function saveFilters(){ try { localStorage.setItem('pl_filters', JSON.stringify(filters)); } catch(e){} }

/* ====== Helpers DOM ====== */
function $(s){ return document.querySelector(s); }
function $$(s){ return document.querySelectorAll(s); }

/* ====== Età ====== */
function ageInRange(age, token){
  if(!token) return true;
  if(token==='0-1') return age<=1;
  if(token==='2-4') return age>=2 && age<=4;
  if(token==='5-7') return age>=5 && age<=7;
  if(token==='8+')  return age>=8;
  return true;
}

/* ====== Filtraggio ====== */
function applyFilters(list){
  return list.filter(function(d){
    if(filters.breed && d.breed !== filters.breed) return false;
    if(filters.sex && d.sex !== filters.sex) return false;
    if(filters.size && d.size !== filters.size) return false;
    if(filters.coat && d.coat !== filters.coat) return false;
    if(filters.energy && d.energy !== filters.energy) return false;
    if(filters.pedigree && d.pedigree !== filters.pedigree) return false;
    if(filters.distance && d.distance > Number(filters.distance)) return false;
    if(!ageInRange(d.age, filters.age)) return false;
    return true;
  });
}

/* ====== Liste per vista ====== */
function getListForCurrentView(){
  var list = dogs.slice();
  if (currentView === 'near'){
    list = list.filter(function(d){ return d.online; }).sort(function(a,b){ return a.distance - b.distance; });
  } else if (currentView === 'match'){
    list = list.filter(function(d){ return matches.has(d.id); });
  } else {
    // browse: lasciamo l’ordine originale
  }
  return applyFilters(list);
}

/* ====== Chips riepilogo ====== */
function updateChips(){
  var host = $('#activeChips');
  if (!host) return;
  host.innerHTML = '';
  var nice = { breed:'Razza', age:'Età', sex:'Sesso', size:'Taglia', coat:'Pelo', energy:'Energia', pedigree:'Pedigree', distance:'Distanza' };
  for (var k in filters){
    var v = filters[k];
    if(!v) continue;
    var c = document.createElement('span');
    c.className = 'chip-x';
    c.innerHTML = '<strong>'+nice[k]+':</strong> '+v+' <button aria-label="rimuovi" data-del="'+k+'">×</button>';
    host.appendChild(c);
  }
  host.onclick = function(e){
    var b = e.target && e.target.closest ? e.target.closest('button[data-del]') : null;
    if(!b) return;
    var key = b.getAttribute('data-del');
    filters[key] = '';
    syncFormFromState();
    saveFilters();
    // riparti dal primo in browse per coerenza
    if (currentView==='browse') deckIndex = 0;
    render();
  };
}

/* ====== Render ====== */
function render(){
  var wrap = $('#cards');
  var countLabel = $('#countLabel');
  if (!wrap || !countLabel) return;

  var list = getListForCurrentView();

  // imposta layout contenitore
  wrap.className = (currentView==='browse') ? 'deck' : (currentView==='match' ? 'grid' : 'grid');

  // conteggio
  countLabel.textContent = 'Mostro ' + list.length + ' cani';

  // vuoto
  if (!list.length){
    wrap.innerHTML = '<p style="color:#6b7280;padding:10px 14px">Nessun risultato con questi filtri.</p>';
    updateChips();
    return;
  }

  // SCORRI (uno alla volta)
  if (currentView === 'browse'){
    if (deckIndex >= list.length) deckIndex = 0;
    var d = list[deckIndex];
    wrap.innerHTML = buildCardHtml(d, true);
    updateChips();
    return;
  }

  // GRIGLIA (vicino / match)
  wrap.innerHTML = '';
  for (var i=0;i<list.length;i++){
    var d2 = list[i];
    var art = document.createElement('article');
    art.className = 'card';
    art.innerHTML = buildCardHtml(d2, false);
    wrap.appendChild(art);
  }
  updateChips();
}

/* ====== Card HTML ====== */
function buildCardHtml(d, big){
  var verify = d.verified ? '<span class="badge-verify" title="Profilo verificato"><span class="paw">🐾</span></span>' : '';
  var img = ''
    + '<div class="pic">'
    +   '<img src="'+d.image+'" alt="Foto di '+d.name+'">'
    +   '<span class="badge">'+d.distance.toFixed(1)+' km</span>'
    +   (d.online ? '<span class="dot-online"></span>' : '')
    + '</div>';
  var body = ''
    + '<div class="body">'
    +   '<div class="name">'+d.name+', '+d.age+verify+'</div>'
    +   '<div class="breed">'+d.breed+'</div>'
    +   '<div class="actions">'
    +     '<button class="btn-round btn-no" data-act="no"  data-id="'+d.id+'" title="Scarta"><span class="emoji">🥲</span></button>'
    +     '<button class="btn-round btn-yes" data-act="yes" data-id="'+d.id+'" title="Mi piace"><span class="emoji">❤️</span></button>'
    +   '</div>'
    + '</div>';

  if (big) return '<article class="card card-big" data-card="'+d.id+'">'+img+body+'</article>';
  return img + body;
}

/* ====== Animazioni ====== */
function animateGridAction(button, yes){
  var card = button ? button.closest('.card') : null; if (!card) return;
  if (yes){
    card.animate(
      [{transform:'scale(1)',opacity:1},{transform:'scale(1.04)',opacity:1},{transform:'scale(.96)',opacity:.92},
       {transform:'scale(.98)',opacity:.88},{transform:'scale(1)',opacity:0}],
      {duration:260,easing:'ease-in-out'}
    ).onfinish = function(){ render(); };
  } else {
    card.animate(
      [{transform:'translateX(0)'},{transform:'translateX(-6px)'},{transform:'translateX(6px)'},
       {transform:'translateX(-4px)'},{transform:'translateX(0)'}],
      {duration:200,easing:'ease-in-out'}
    );
  }
}

function animateDeckAction(yes){
  var wrap = $('#cards');
  if (!wrap) return;
  var card = wrap.querySelector('.card-big') || wrap.querySelector('.card');
  if (!card) return;

  var dir = yes ? 1 : -1;
  var anim = card.animate(
    [
      { transform:'translateX(0) rotate(0deg)', opacity:1 },
      { transform:'translateX('+(dir*20)+'px) rotate('+(dir*2)+'deg)', opacity:1 },
      { transform:'translateX('+(dir*160)+'px) rotate('+(dir*10)+'deg)', opacity:0 }
    ],
    { duration:260, easing:'ease-in-out' }
  );

  anim.onfinish = function(){
    var list = getListForCurrentView();
    if (list.length > 0){
      deckIndex = (deckIndex + 1) % list.length;
    } else {
      deckIndex = 0;
    }
    render();
  };
}

/* ====== Eventi globali ====== */
// Entra (hash swap già gestito da :target)
var enter = $('#enterLink');
if (enter){ enter.addEventListener('click', function(){}); }

// Tabs
$$('.tab').forEach(function(btn){
  btn.addEventListener('click', function(){
    $$('.tab').forEach(function(b){ b.classList.remove('active'); });
    btn.classList.add('active');
    currentView = btn.getAttribute('data-view');
    if (currentView === 'browse') deckIndex = 0;
    render();
  });
});

// Like / Dislike + open profilo
$('#cards').addEventListener('click', function(e){
  var likeBtn = e.target.closest ? e.target.closest('button[data-id]') : null;

  // Click sui bottoni
  if (likeBtn){
    var id = Number(likeBtn.getAttribute('data-id'));
    var isYes = likeBtn.getAttribute('data-act') === 'yes';

    if (isYes) { matches.add(id); }

    if (currentView === 'browse'){
      // animazione slide e avanzamento
      animateDeckAction(isYes);
    } else {
      // griglia: animazione e eventuale skip → sposta in fondo
      if (!isYes){
        var idx = dogs.findIndex(function(d){ return d.id===id; });
        if (idx>=0) dogs.push.apply(dogs, dogs.splice(idx,1));
      }
      animateGridAction(likeBtn, isYes);
    }
    return;
  }

  // Click su card/immagine → apri profilo
  var art = e.target.closest ? e.target.closest('.card, .card-big') : null;
  if (!art) return;

  // recupera il cane dalla card (dal nome)
  var nameEl = art.querySelector('.name');
  var nameText = nameEl ? nameEl.textContent : '';
  var name = nameText ? nameText.split(',')[0].trim() : '';
  var dog = dogs.find(function(d){ return d.name===name; });
  if (!dog) return;

  openDogProfile(dog);
});

/* ====== Profilo cane ====== */
function openDogProfile(d){
  var wrap = $('#cards');
  var countLabel = $('#countLabel');
  if (countLabel) countLabel.textContent = '';
  wrap.className = 'detail';
  wrap.innerHTML =
    '<article class="dogsheet">'
    + '  <img class="dphoto" src="'+d.image+'" alt="Foto di '+d.name+'">'
    + '  <div class="dinfo">'
    + '    <h2>'+d.name+', '+d.age+' '+(d.verified ? '<span class="badge-verify"><span class="paw">🐾</span></span>' : '')+'</h2>'
    + '    <div class="dmeta">'+d.breed+' · '+(d.sex==='M'?'Maschio':'Femmina')+' · Taglia '+d.size+'</div>'
    + '    <div class="drow"><strong>Pelo:</strong> '+d.coat+'</div>'
    + '    <div class="drow"><strong>Energia:</strong> '+d.energy+'</div>'
    + '    <div class="drow"><strong>Pedigree:</strong> '+(d.pedigree==='si'?'Sì':'No')+'</div>'
    + '    <div class="drow"><strong>Distanza:</strong> '+d.distance.toFixed(1)+' km</div>'
    + '    <div class="profile-actions">'
    + '      <button class="chip btn-no" data-act="no" data-id="'+d.id+'">🥲</button>'
    + '      <button class="chip chip-primary btn-yes" data-act="yes" data-id="'+d.id+'">❤️</button>'
    + '      <button class="chip" id="backToList">Torna alla lista</button>'
    + '    </div>'
    + '  </div>'
    + '</article>';

  var back = $('#backToList');
  if (back){ back.addEventListener('click', function(){ render(); }); }
}

/* ====== Geolocalizzazione (demo) ====== */
var locOn = $('#locOn'); if (locOn) locOn.addEventListener('click', function(){ alert('Posizione attivata (demo).'); });
var locLater = $('#locLater'); if (locLater) locLater.addEventListener('click', function(){ alert('Ok, più tardi.'); });

/* ====== Pannello filtri ====== */
var panel = $('#filterPanel');
var toggle = $('#filterToggle');
if (toggle){ toggle.addEventListener('click', function(){
  var hidden = panel.hasAttribute('hidden');
  if (hidden) panel.removeAttribute('hidden'); else panel.setAttribute('hidden','');
}); }

function syncFormFromState(){
  var form = $('#filterForm'); if (!form) return;
  for (var k in filters){
    var el = form.elements[k];
    if (!el) continue;
    el.value = filters[k] || '';
  }
  updateChips();
}

var formEl = $('#filterForm');
if (formEl){
  formEl.addEventListener('submit', function(e){
    e.preventDefault();
    var fd = new FormData(formEl);
    // reset
    filters = clone(defaultFilters);
    fd.forEach(function(v,k){ filters[k] = String(v||'').trim(); });
    saveFilters();
    // riparti dal primo in Scorri
    deckIndex = 0;
    panel.setAttribute('hidden','');
    render();
  });
}

var resetBtn = $('#filtersReset');
if (resetBtn){
  resetBtn.addEventListener('click', function(){
    filters = clone(defaultFilters);
    saveFilters();
    deckIndex = 0;
    syncFormFromState();
    render();
  });
}

/* ====== Avvio ====== */
syncFormFromState();
render();
