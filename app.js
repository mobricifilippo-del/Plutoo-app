document.addEventListener('DOMContentLoaded', () => {
  // Sezioni
  const home = document.getElementById('home');
  const app = document.getElementById('app');
  const enterBtn = document.getElementById('enterBtn');

  // Tab & area contenuti
  const nearbyTab = document.getElementById('nearbyTab');
  const swipeTab  = document.getElementById('swipeTab');
  const matchTab  = document.getElementById('matchTab');
  const content   = document.getElementById('contentArea');

  // Demo data
  const dogs = [
    { name:'Luna',  age:1, breed:'Jack Russell',     distance:'2.2 km', img:'dog3.jpg' },
    { name:'Sofia', age:5, breed:'Levrier Afghano',  distance:'1.6 km', img:'dog1.jpg' },
    { name:'Rocky', age:4, breed:'Meticcio',         distance:'5.9 km', img:'dog2.jpg' },
    { name:'Maya',  age:3, breed:'Shiba Inu',        distance:'3.2 km', img:'dog4.jpg' }
  ];

  let matches = [];
  let swipeIndex = 0;

  // --- NAVIGAZIONE ---
  enterBtn.addEventListener('click', () => {
    // nasconde la home e mostra la pagina app (non appendi sotto!)
    home.classList.add('hidden');
    app.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'instant' });

    setActiveTab('nearby');
    renderNearby();
  });

  nearbyTab.addEventListener('click', () => { setActiveTab('nearby'); renderNearby(); });
  swipeTab .addEventListener('click', () => { setActiveTab('swipe');  renderSwipe();  });
  matchTab .addEventListener('click', () => { setActiveTab('match');  renderMatch();  });

  function setActiveTab(which){
    nearbyTab.classList.toggle('active', which==='nearby');
    swipeTab .classList.toggle('active', which==='swipe');
    matchTab .classList.toggle('active', which==='match');
  }

  // --- VICINO A TE (griglia) ---
  function renderNearby(){
    content.innerHTML = `
      <div class="grid">
        ${dogs.map((d,i)=>`
          <article class="card">
            <img src="${d.img}" alt="${d.name}">
            <div class="meta">
              <h3>${d.name}, ${d.age}</h3>
              <div class="row">
                <p>${d.breed}</p>
                <span class="badge-online" title="online"></span>
              </div>
              <div class="row">
                <p><strong>${d.distance}</strong></p>
              </div>
            </div>
            <div class="actions">
              <button class="btn-round btn-no" data-i="${i}">✖</button>
              <button class="btn-round btn-yes" data-i="${i}">❤</button>
            </div>
          </article>
        `).join('')}
      </div>
    `;

    content.querySelectorAll('.btn-yes').forEach(btn=>{
      btn.addEventListener('click', e=>{
        const i = +e.currentTarget.dataset.i;
        addMatch(dogs[i]);
      });
    });
  }

  // --- SWIPE (una carta alla volta) ---
  function renderSwipe(){
    // riparti dall'inizio ogni volta che entri in "Scorri"
    if (swipeIndex >= dogs.length) swipeIndex = 0;

    const d = dogs[swipeIndex];
    if (!d){
      content.innerHTML = `<p style="text-align:center;padding:20px">Finito! Torna tra poco 😉</p>`;
      return;
    }

    content.innerHTML = `
      <div class="swipe-wrap">
        <article class="swipe-card">
          <img src="${d.img}" alt="${d.name}">
          <div class="meta">
            <h3>${d.name}, ${d.age}</h3>
            <p>${d.breed} • <strong>${d.distance}</strong></p>
          </div>
          <div class="swipe-actions">
            <button id="swipeNo"  class="btn-round btn-no">✖</button>
            <button id="swipeYes" class="btn-round btn-yes">❤</button>
          </div>
        </article>
      </div>
    `;

    document.getElementById('swipeNo').onclick  = ()=> nextSwipe(false);
    document.getElementById('swipeYes').onclick = ()=> nextSwipe(true);
  }

  function nextSwipe(liked){
    const d = dogs[swipeIndex];
    if (liked) addMatch(d, /*silent*/true);
    swipeIndex++;
    if (swipeIndex < dogs.length) {
      renderSwipe();
    } else {
      content.innerHTML = `<p style="text-align:center;padding:22px">Hai visto tutti i cani! Vai su <b>Match</b> 🐾</p>`;
    }
  }

  // --- MATCH ---
  function renderMatch(){
    if (matches.length === 0){
      content.innerHTML = `<p style="text-align:center;padding:22px">Ancora nessun match. Metti qualche ❤!</p>`;
      return;
    }
    content.innerHTML = `
      <div class="grid">
        ${matches.map(d=>`
          <article class="card">
            <img src="${d.img}" alt="${d.name}">
            <div class="meta">
              <h3>${d.name}, ${d.age}</h3>
              <div class="row">
                <p>${d.breed}</p>
                <p><strong>${d.distance}</strong></p>
              </div>
            </div>
          </article>
        `).join('')}
      </div>
    `;
  }

  function addMatch(d, silent=false){
    // evita duplicati
    if (!matches.find(m => m.name===d.name && m.img===d.img)){
      matches.push(d);
      if (!silent) toast(`${d.name} aggiunto ai Match ❤️`);
    }
  }

  // mini toast
  function toast(msg){
    const el = document.createElement('div');
    el.textContent = msg;
    el.style.position='fixed';
    el.style.left='50%'; el.style.bottom='18px'; el.style.transform='translateX(-50%)';
    el.style.background='rgba(0,0,0,.8)'; el.style.color='#fff';
    el.style.padding='10px 14px'; el.style.borderRadius='14px';
    el.style.zIndex='9999'; el.style.fontWeight='800';
    document.body.appendChild(el);
    setTimeout(()=>el.remove(),1400);
  }
});
