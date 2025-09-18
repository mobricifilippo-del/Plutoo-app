document.addEventListener('DOMContentLoaded', () => {
  /* ===== Dataset demo (con campi per profilo e filtri) ===== */
  const dogs = [
    {
      id:1, name:'Luna', sex:'F', ageYears:1, breed:'Jack Russell',
      coatLength:'corto', energy:'alta',
      temperament:['Giocherellone','Socievole'],
      goodWith:{ kids:true, dogs:true, cats:false },
      distanceKm:2.2, image:'./dog1.jpg', images:['./dog1.jpg'], online:true,
      location:'Quartiere Centro', bio:'Ama rincorrere la palla, dolcissima con tutti.'
    },
    {
      id:2, name:'Rocky', sex:'M', ageYears:3, breed:'Labrador',
      coatLength:'medio', energy:'media',
      temperament:['Docile','Socievole'],
      goodWith:{ kids:true, dogs:true, cats:true },
      distanceKm:1.6, image:'./dog2.jpg', images:['./dog2.jpg'], online:true,
      location:'Parco Nord', bio:'Nuotatore provetto, super goloso.'
    },
    {
      id:3, name:'Bella', sex:'F', ageYears:2, breed:'Shiba Inu',
      coatLength:'medio', energy:'media',
      temperament:['Indipendente','Protettivo'],
      goodWith:{ kids:false, dogs:true, cats:false },
      distanceKm:3.2, image:'./dog3.jpg', images:['./dog3.jpg'], online:false,
      location:'Zona Est', bio:'Curiosa, ama esplorare e annusare ovunque.'
    },
    {
      id:4, name:'Max', sex:'M', ageYears:4, breed:'Golden Retriever',
      coatLength:'lungo', energy:'alta',
      temperament:['Giocherellone','Tranquillo'],
      goodWith:{ kids:true, dogs:true, cats:true },
      distanceKm:5.9, image:'./dog4.jpg', images:['./dog4.jpg'], online:true,
      location:'Lungofiume', bio:'Cuore d’oro, perfetto per passeggiate al tramonto.'
    }
  ];

  /* ===== Stato ===== */
  let matches = new Set();
  let currentView = 'near';       // near | browse | match
  let browseIndex = 0;
  let filters = { breed:'all', age:'all', coat:'all', onlineOnly:false, distance:50 };

  /* ===== Helpers ===== */
  const $  = s => document.querySelector(s);
  const $$ = s => document.querySelectorAll(s);

  const cardsWrap = $('#cards');
  const enterEl = $('#enterBtn');

  /* ===== Inizializza opzioni Razza ===== */
  const breedSelect = $('#breedFilter');
  const breeds = [...new Set(dogs.map(d => d.breed))].sort();
  breeds.forEach(b => {
    const o = document.createElement('option');
    o.value = b; o.textContent = b;
    breedSelect.appendChild(o);
  });

  /* ===== Filtri: apertura/chiusura sheet ===== */
  const sheet = $('#filterSheet');
  const openFiltersBtn = $('#openFilters');
  const sheetClose = $('#sheetClose');
  const filtersForm = $('#filtersForm');
  const ageSelect = $('#ageFilter');
  const coatSelect = $('#coatFilter');
  const onlineOnly = $('#onlineOnly');
  const distRange = $('#distanceFilter');
  const distVal = $('#distanceVal');
  const resetBtn = $('#resetFilters');
  const filtersCount = $('#filtersCount');

  function updateFiltersCountBadge() {
    const active =
      (filters.breed !== 'all') +
      (filters.age   !== 'all') +
      (filters.coat  !== 'all') +
      (filters.onlineOnly ? 1 : 0) +
      (filters.distance !== 50 ? 1 : 0);
    if (active > 0) {
      filtersCount.textContent = active;
      filtersCount.hidden = false;
    } else {
      filtersCount.hidden = true;
    }
  }

  function openSheet(){ sheet.hidden = false; }
  function closeSheet(){ sheet.hidden = true; }

  if (openFiltersBtn) openFiltersBtn.addEventListener('click', openSheet);
  if (sheetClose) sheetClose.addEventListener('click', closeSheet);

  if (distRange && distVal) {
    distRange.addEventListener('input', () => { distVal.textContent = distRange.value; });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      filters = { breed:'all', age:'all', coat:'all', onlineOnly:false, distance:50 };
      breedSelect.value = 'all';
      ageSelect.value   = 'all';
      coatSelect.value  = 'all';
      onlineOnly.checked = false;
      distRange.value = 50; distVal.textContent = '50';
      updateFiltersCountBadge();
    });
  }

  if (filtersForm) {
    filtersForm.addEventListener('submit', (e) => {
      e.preventDefault();
      filters.breed = breedSelect.value;
      filters.age   = ageSelect.value;
      filters.coat  = coatSelect.value;
      filters.onlineOnly = onlineOnly.checked;
      filters.distance   = Number(distRange.value);
      browseIndex = 0;
      updateFiltersCountBadge();
      closeSheet();
      render();
    });
  }

  /* ===== Applicazione filtri ===== */
  function byAgeRange(ageKey, y){
    if (ageKey === 'puppy')  return y <= 1;
    if (ageKey === 'young')  return y > 1 && y <= 3;
    if (ageKey === 'adult')  return y > 3 && y <= 7;
    if (ageKey === 'senior') return y > 7;
    return true;
  }

  function applyFilters(list){
    let out = [...list];
    if (filters.breed !== 'all') out = out.filter(d => d.breed === filters.breed);
    if (filters.age   !== 'all') out = out.filter(d => byAgeRange(filters.age, d.ageYears));
    if (filters.coat  !== 'all') out = out.filter(d => d.coatLength === filters.coat);
    if (filters.onlineOnly)      out = out.filter(d => d.online);
    out = out.filter(d => d.distanceKm <= filters.distance);
    return out;
  }

  /* ===== Render ===== */
  function render(){
    if (!cardsWrap) return;
    cardsWrap.innerHTML = '';
    cardsWrap.classList.remove('single','grid');

    let list = applyFilters(dogs);

    if (currentView === 'near') {
      list = list.filter(d => d.online).sort((a,b) => a.distanceKm - b.distanceKm);
      paintGrid(list);
    } else if (currentView === 'browse') {
      if (list.length === 0) return showEmpty();
      if (browseIndex >= list.length) browseIndex = 0;
      paintSingle(list[browseIndex]);
    } else if (currentView === 'match') {
      list = list.filter(d => matches.has(d.id));
      list.length ? paintGrid(list) : showEmpty('Ancora nessun match. Metti qualche ❤');
    }
  }

  function showEmpty(msg='Nessun risultato con questi filtri.'){
    cardsWrap.innerHTML = `<p style="color:#6b7280;padding:12px">${msg}</p>`;
  }

  function paintGrid(list){
    cardsWrap.classList.add('grid');
    list.forEach(d => cardsWrap.appendChild(cardEl(d)));
  }

  function paintSingle(d){
    cardsWrap.classList.add('single');
    cardsWrap.appendChild(cardEl(d));
  }

  function pillOnline(online){ return online ? '<span class="dot" title="Online"></span>' : ''; }

  function cardEl(d){
    const el = document.createElement('article');
    el.className = 'card';
    el.innerHTML = `
      <div class="pic" data-id="${d.id}" role="button" tabindex="0" aria-label="Apri profilo di ${d.name}">
        <img src="${d.image}" alt="Foto di ${d.name}">
        <span class="badge-dist">${d.distanceKm.toFixed(1)} km</span>
        ${pillOnline(d.online)}
      </div>
      <div class="body">
        <div class="name">${d.name}, ${d.ageYears}</div>
        <div class="breed">${d.breed}</div>
        <div class="actions">
          <button class="btn-round btn-no"  data-act="no"  data-id="${d.id}" aria-label="Scarta">😢</button>
          <button class="btn-round btn-yes" data-act="yes" data-id="${d.id}" aria-label="Mi piace">❤</button>
        </div>
      </div>
    `;
    return el;
  }

  /* ===== PROFILO (sheet) ===== */
  const profileSheet   = $('#profileSheet');
  const profileClose   = $('#profileClose');
  const profileContent = $('#profileContent');
  const profileYes     = $('#profileYes');
  const profileNo      = $('#profileNo');
  let profileDogId = null;

  function openProfile(dog){
    profileDogId = dog.id;
    profileContent.innerHTML = `
      <div class="gallery">
        <img src="${(dog.images && dog.images[0]) || dog.image}" alt="Foto di ${dog.name}">
      </div>
      <div class="grid-info">
        <span class="badge">${dog.breed}</span>
        <span class="badge">${dog.ageYears} anni</span>
        <span class="badge">Pelo: ${dog.coatLength}</span>
        <span class="badge">${dog.online ? 'Online' : 'Offline'}</span>
      </div>
      <div class="kv"><b>Carattere</b> ${dog.temperament.join(', ')}</div>
      <div class="kv"><b>Energia</b> ${dog.energy}</div>
      <div class="kv"><b>Convivenza</b> ${[
        dog.goodWith.kids ? 'Bambini ✔' : 'Bambini ✖',
        dog.goodWith.dogs ? 'Altri cani ✔' : 'Altri cani ✖',
        dog.goodWith.cats ? 'Gatti ✔' : 'Gatti ✖'
      ].join(' • ')}</div>
      <div class="kv"><b>Posizione</b> ${dog.location} — ${dog.distanceKm.toFixed(1)} km</div>
      <div class="kv"><b>Descrizione</b> ${dog.bio}</div>
    `;
    profileSheet.hidden = false;
  }
  function closeProfile(){ profileDogId = null; profileSheet.hidden = true; }

  if (profileClose) profileClose.addEventListener('click', closeProfile);

  // Apri profilo cliccando la foto
  cardsWrap.addEventListener('click', (e) => {
    const pic = e.target.closest('.pic');
    if (!pic) return;
    const id = Number(pic.dataset.id);
    const dog = dogs.find(d => d.id === id);
    if (dog) openProfile(dog);
  });

  // Azioni dal profilo
  if (profileYes) profileYes.addEventListener('click', () => {
    if (profileDogId != null) matches.add(profileDogId);
    closeProfile();
    render();
  });
  if (profileNo) profileNo.addEventListener('click', () => {
    if (profileDogId != null) {
      // manda in fondo in browse
      const idx = dogs.findIndex(d => d.id === profileDogId);
      if (idx >= 0) dogs.push(...dogs.splice(idx,1));
    }
    closeProfile();
    if (currentView === 'browse') browseIndex++;
    render();
  });

  /* ===== Eventi generali ===== */
  // Entra → garantisci #list
  if (enterEl) enterEl.addEventListener('click', () => {
    if (location.hash !== '#list') location.hash = '#list';
  });

  // Tabs
  $$('.tab').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentView = btn.dataset.view || 'near';
      render();
    });
  });

  // Like / Dislike nelle card
  cardsWrap.addEventListener('click', (e) => {
    const t = e.target.closest('button[data-id]');
    if (!t) return;
    const id = Number(t.dataset.id);
    if (t.dataset.act === 'yes') {
      matches.add(id);
      t.animate([{transform:'scale(1)'},{transform:'scale(1.08)'},{transform:'scale(1)'}],{duration:160});
      if (currentView === 'browse') browseIndex++;
    } else {
      const idx = dogs.findIndex(d => d.id === id);
      if (idx >= 0) dogs.push(...dogs.splice(idx,1));
      if (currentView === 'browse') browseIndex++;
    }
    render();
  });

  // Geoloc (demo)
  $('#locOn').addEventListener('click', () => alert('Posizione attivata (demo). Ti mostreremo gli amici vicini.'));
  $('#locLater').addEventListener('click', () => alert('Ok, più tardi.'));

  // Sheet filtri: chiusura con ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (!sheet.hidden) closeSheet();
      if (!profileSheet.hidden) closeProfile();
    }
  });

  /* ===== Start ===== */
  render();
});
