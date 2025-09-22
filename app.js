const App = (() => {

  // ------- DATI DEMO (6 profili) -------
  const dogs = [
    { id:1, name:'Luna',  age:1, breed:'Jack Russell',     distance:2.2,
      sex:'F', size:'Piccola', coat:'Corto', energy:'Alta', pedigree:'No', area:'Roma – Monteverde',
      desc:'Curiosa e molto giocherellona.', image:'dog1.jpg', online:true, verified:true },
    { id:2, name:'Rocky', age:3, breed:'Labrador',         distance:1.6,
      sex:'M', size:'Media',  coat:'Corto', energy:'Media', pedigree:'No', area:'Roma – Eur',
      desc:'Affettuoso e molto fedele.', image:'dog2.jpg', online:true, verified:false },
    { id:3, name:'Bella', age:2, breed:'Shiba Inu',        distance:3.2,
      sex:'F', size:'Piccola', coat:'Medio', energy:'Media', pedigree:'Sì', area:'Roma – Prati',
      desc:'Elegante, intelligente e affettuosa.', image:'dog3.jpg', online:true, verified:true },
    { id:4, name:'Max',   age:4, breed:'Golden Retriever', distance:5.9,
      sex:'M', size:'Grande', coat:'Lungo', energy:'Alta', pedigree:'No', area:'Roma – Tuscolana',
      desc:'Socievole con tutti, ama correre.', image:'dog4.jpg', online:true, verified:false },
    { id:5, name:'Daisy', age:2, breed:'Beagle',           distance:2.7,
      sex:'F', size:'Piccola', coat:'Corto', energy:'Alta', pedigree:'No', area:'Roma – Garbatella',
      desc:'Adora esplorare e annusare tutto.', image:'dog1.jpg', online:true, verified:false },
    { id:6, name:'Nero',  age:5, breed:'Meticcio',         distance:4.1,
      sex:'M', size:'Media',  coat:'Medio', energy:'Media', pedigree:'No', area:'Roma – Nomentana',
      desc:'Tranquillo e molto dolce.', image:'dog2.jpg', online:true, verified:false },
  ];

  // ------- STATO -------
  let currentView = 'near';
  let filters = { breed:'', area:'', pedigree:'' };
  let deckIndex = 0;

  // ------- UTILS -------
  const $ = (sel)=>document.querySelector(sel);
  const setCount = n => $("#counter").textContent = `Mostro ${n} profili`;

  const badge = d => d.verified ? `<span title="verificato" style="margin-left:6px; font-size:18px">🐾</span>` : '';

  // ------- RENDER VICINO A TE -------
  function renderNear(list){
    const root = $("#near");
    root.innerHTML = '';
    list.forEach(d=>{
      const el = document.createElement('article');
      el.className = 'card card-enter';
      el.innerHTML = `
        <img class="card-img" src="${d.image}" alt="${d.name}" />
        <div class="card-body">
          <div class="pill" style="position:absolute;margin-top:-54px;margin-left:12px;background:#111827cc">${d.distance.toFixed(1)} km</div>
          <h3 style="margin:6px 0 2px;font-size:22px;font-weight:800">${d.name}, ${d.age} ${badge(d)}</h3>
          <div class="muted">${d.breed}</div>
          <div class="row">
            <button class="btn-round btn-no" onclick="App.no(${d.id})"><span class="icon-no">😢</span></button>
            <button class="btn-round btn-yes" onclick="App.yes(${d.id})"><span class="icon-yes">❤️</span></button>
          </div>
        </div>`;
      el.addEventListener('click', (e)=>{
        // evita che i bottoni like/nochiudano la card
        if (e.target.closest('.btn-round')) return;
        openModal(d);
      });
      root.appendChild(el);
    });
    setCount(list.length);
  }

  // ------- RENDER SCORRI -------
  function renderDeck(list){
    const root = $("#deckCard");
    if (!list.length){ root.innerHTML = `<div class="card-big"><div class="card-body">Nessun profilo</div></div>`; return; }
    const d = list[deckIndex % list.length];
    root.innerHTML = `
      <article class="card card-big card-enter">
        <img class="card-img" src="${d.image}" alt="${d.name}" />
        <div class="card-body">
          <h3 style="margin:6px 0 2px;font-size:22px;font-weight:800">${d.name}, ${d.age} ${badge(d)}</h3>
          <div class="muted">${d.breed}</div>
          <div class="row">
            <button class="btn-round btn-no" onclick="App.swipe('no')"><span class="icon-no">😢</span></button>
            <button class="btn-round btn-yes" onclick="App.swipe('yes')"><span class="icon-yes">❤️</span></button>
          </div>
        </div>
      </article>
    `;
    root.querySelector('.card').addEventListener('click', (e)=>{
      if (e.target.closest('.btn-round')) return;
      openModal(d);
    });
    setTimeout(()=> root.querySelector('.card').classList.add('pulse'), 120);
  }

  // ------- MODAL -------
  function openModal(d){
    const dlg = $("#dogModal");
    $("#modalBody").innerHTML = `
      <img class="cover" src="${d.image}" alt="${d.name}" />
      <div class="pad">
        <h2 style="font-size:28px;margin:0 0 6px">${d.name}, ${d.age} ${badge(d)}</h2>
        <div class="meta">${d.breed} · ${d.sex==='F'?'Femmina':'Maschio'} · ${d.size} · ${d.coat} · ${d.distance.toFixed(1)} km</div>
        <div class="meta"><b>Energia:</b> ${d.energy} · <b>Pedigree:</b> ${d.pedigree}<br/><b>Zona:</b> ${d.area}</div>
        <p>${d.desc}</p>
        <div class="row">
          <button class="btn-round btn-no" onclick="App.no(${d.id})"><span class="icon-no">😢</span></button>
          <button class="btn-round btn-yes" onclick="App.yes(${d.id})"><span class="icon-yes">❤️</span></button>
        </div>
      </div>`;
    dlg.showModal();
  }
  function closeModal(){ $("#dogModal").close(); }

  // ------- FILTRI -------
  function filtered(){
    let out = dogs.slice();
    // per “Vicino a te” NON filtriamo online: li ordiniamo solo per distanza
    if (currentView==='near') out = out.sort((a,b)=>a.distance-b.distance);
    if (filters.breed) out = out.filter(d=> d.breed.toLowerCase().includes(filters.breed.toLowerCase()));
    if (filters.area) out = out.filter(d=> d.area.toLowerCase().includes(filters.area.toLowerCase()));
    if (filters.pedigree) out = out.filter(d=> d.pedigree===filters.pedigree);
    return out;
  }

  // ------- API UI -------
  function show(view){
    currentView = view;
    document.querySelectorAll('.tab').forEach(b=>b.classList.toggle('active', b.dataset.tab===view));
    ['near','browse','match'].forEach(id=> $(`#${id}`).hidden = (id!==view));
    deckIndex = 0;
    const list = filtered();
    if (view==='near') renderNear(list);
    if (view==='browse') renderDeck(list);
    if (view==='match'){ setCount(0); }
  }

  function swipe(type){
    deckIndex++;
    renderDeck(filtered());
  }
  function yes(id){ pulseBtn('.btn-yes'); }
  function no(id){ pulseBtn('.btn-no'); }
  function pulseBtn(sel){
    const el = document.querySelector(sel);
    if(!el) return;
    el.classList.remove('pulse'); void el.offsetWidth; el.classList.add('pulse');
  }

  function toggleSearch(){ const p = $("#searchPanel"); p.hidden = !p.hidden; }
  function clearFilters(){
    $("#fBreed").value = $("#fArea").value = ''; $("#fPed").value = '';
  }
  function apply(){
    filters = {
      breed: $("#fBreed").value.trim(),
      area: $("#fArea").value.trim(),
      pedigree: $("#fPed").value
    };
    show(currentView);
    toggleSearch();
  }

  function enter(){
    $("#home").hidden = true;
    $("#app").hidden = false;
    show('near');
  }

  // ------- EXPOSE -------
  return { enter, show, swipe, yes, no, toggleSearch, clearFilters, apply, closeModal };
})();

// avvio: se apri direttamente /index.html mostra home, poi Entra → app
