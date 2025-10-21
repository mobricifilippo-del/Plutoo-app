/* =====================================================
   PLUTOO — Interazioni base (no backend)
   ===================================================== */

// ---------- Helpers
const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

const state = {
  plus:false,
  activeView:'nearby',
  data: {
    nearby: [], // riempito sotto (mock)
    love:   [],
    play:   []
  }
};

// ---------- HOME
const home = {
  enterBtn: $('#btnEnter'),
  heroLogo: $('#heroLogo'),
  homeScreen: $('#homeScreen'),
  appScreen: $('#appScreen'),
  sponsorLinks: ['#sponsorLinkHome','#sponsorLinkApp'],

  init(){
    // Animazione logo su "Entra"
    this.enterBtn.addEventListener('click', ()=>{
      this.heroLogo.classList.remove('gold-glow');
      void this.heroLogo.offsetWidth; // restart animation
      this.heroLogo.classList.add('gold-glow');
      setTimeout(()=>this.showApp(), 900); // breve attesa, animazione continua
    });
    $('#btnEnterLink').addEventListener('click', (e)=>{ e.preventDefault(); this.showApp(); });

    // Sponsor cliccabile ovunque
    this.sponsorLinks.forEach(sel=>{
      const a = $(sel);
      if(a) a.addEventListener('click', ()=>{/* link già nell'anchor */});
    });

    // Canili SOLO in Home → Google Maps
    $('#ethicsButtonHome')?.addEventListener('click', ()=>{
      const url = 'https://www.google.com/maps/search/?api=1&query=canili+vicino+a+me';
      window.open(url,'_blank');
    });
  },

  showApp(){
    this.homeScreen.classList.add('hidden');
    this.appScreen.classList.remove('hidden');
    this.appScreen.setAttribute('aria-hidden','false');
    app.initOnce();
  }
};

// ---------- APP (navbar, viste, cards)
const app = {
  initialized:false,

  initOnce(){
    if (this.initialized) return;
    this.initialized = true;

    // Tabs
    $('#tabNearby').addEventListener('click', ()=>this.show('nearby'));
    $('#tabLove').addEventListener('click',   ()=>this.show('love'));
    $('#tabPlay').addEventListener('click',   ()=>this.show('play'));

    // Ricerca overlay
    $('#btnSearch').addEventListener('click', ()=>{
      $('#panelSearch').setAttribute('aria-hidden','false');
      $('#btnSearch').setAttribute('aria-expanded','true');
    });
    $('#btnCloseSearch').addEventListener('click', ()=>{
      $('#panelSearch').setAttribute('aria-hidden','true');
      $('#btnSearch').setAttribute('aria-expanded','false');
    });

    // Luoghi PET dropdown — apri/chiudi + chiusura clic esterno
const wrapLuoghi = document.querySelector('#luoghiTabWrap');
const btnLuoghi  = document.querySelector('#tabLuoghi');

btnLuoghi.addEventListener('click', (e)=>{
  e.stopPropagation();
  const isOpen = wrapLuoghi.getAttribute('aria-expanded') === 'true';
  wrapLuoghi.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
});

// chiudi se clic fuori
document.addEventListener('click', (e)=>{
  if (!wrapLuoghi.contains(e.target)) {
    wrapLuoghi.setAttribute('aria-expanded','false');
  }
});
      
      $$('#luoghiMenu .menu-item').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const cat = btn.dataset.cat;
        const qmap = {
          vets:'veterinari',
          shops:'negozi per animali',
          groomers:'toelettatura',
          parks:'parchi cani',
          trainers:'addestratori cani'
        }[cat] || 'animali';
        // (No ad video qui) → vai subito su Maps
        window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(qmap+' vicino a me')}`,'_blank');
      });
    });

    // Bottone back: torna alla vista precedente (non alla Home)
    $('#btnBack').addEventListener('click', ()=>{
      // semplice: torna a Nearby
      this.show('nearby');
      window.scrollTo({top:0,behavior:'instant'});
    });

    // Profilo: back
    $('#btnBackProfile').addEventListener('click', ()=>{
      this.hideProfile();
    });

    // Dati mock (immagini incluse)
    this.seed();
    this.renderNearby();
    this.prepareDeck('love','#loveDeck');
    this.prepareDeck('play','#playDeck');

    // Ricerca suggerimenti razze
    this.setupBreedSuggestions();
  },

  setActiveTab(id){
    $$('.tabs .tab').forEach(b=>b.classList.remove('active'));
    if(id==='nearby') $('#tabNearby').classList.add('active');
    if(id==='love')   $('#tabLove').classList.add('active');
    if(id==='play')   $('#tabPlay').classList.add('active');
  },

  show(view){
    state.activeView = view;
    $$('.view').forEach(v=>v.classList.remove('active'));
    if(view==='nearby') $('#viewNearby').classList.add('active');
    if(view==='love')   $('#viewLove').classList.add('active');
    if(view==='play')   $('#viewPlay').classList.add('active');
    this.setActiveTab(view);
    window.scrollTo({top:0,behavior:'instant'});
  },

  seed(){
    const dogs = [
      {id:1,name:'Luna',  sex:'Femmina',breed:'Labrador',dist:'1.2km',img:'dog1.jpg',bio:'Amante dei parchi'},
      {id:2,name:'Rocky', sex:'Maschio', breed:'Beagle',  dist:'2.5km',img:'dog2.jpg',bio:'Corre come il vento'},
      {id:3,name:'Maya',  sex:'Femmina',breed:'Husky',    dist:'3.1km',img:'dog3.jpg',bio:'Dolcissima'},
      {id:4,name:'Otto',  sex:'Maschio', breed:'Maltese', dist:'0.9km',img:'dog4.jpg',bio:'Coccolone'}
    ];
    state.data.nearby = dogs;
    state.data.love   = dogs.slice();
    state.data.play   = dogs.slice().reverse();
  },

  // ---- Nearby: griglia 2 colonne, card cliccabile → profilo
  renderNearby(){
    const grid = $('#nearbyGrid');
    grid.innerHTML = '';
    state.data.nearby.forEach(d=>{
      const card = document.createElement('article');
      card.className='card';
      card.innerHTML = `
        <img class="card-img" src="${d.img}" alt="${d.name}" loading="lazy">
        <div class="card-info">
          <h3>${d.name}</h3>
          <p class="meta">${d.breed} · ${d.sex} · ${d.dist}</p>
        </div>
        <div class="card-actions" aria-hidden="true">
          <button class="btn no"  aria-label="Salta">🙂</button>
          <button class="btn yes" aria-label="Mi piace">💜</button>
        </div>
      `;
      card.addEventListener('click', (e)=>{
        // se clic sulle azioni, non aprire profilo
        if (e.target.closest('.btn')) return;
        this.openProfile(d);
      });
      grid.appendChild(card);
    });
  },

  // ---- Deck (Amore/Giochiamo) centrato e pagina ferma
  prepareDeck(key, sel){
    const deck = $(sel);
    deck.innerHTML = '';
    const list = state.data[key].slice().reverse(); // top è ultimo
    list.forEach(d=>{
      const c = document.createElement('article');
      c.className='card';
      c.style.transform='translateY(-50%)';
      c.innerHTML = `
        <img class="card-img" src="${d.img}" alt="${d.name}">
        <div class="card-info">
          <h3>${d.name}</h3>
          <p class="meta">${d.breed} · ${d.sex} · ${d.dist}</p>
        </div>
        <div class="card-actions">
          <button class="btn no">🙂</button>
          <button class="btn yes">💜</button>
        </div>
      `;
      // swipe controllato SOLO sulla card (no scroll pagina)
      let startX=0, dragging=false;
      const onStart = (x)=>{ startX=x; dragging=true; document.body.classList.add('noscroll'); };
      const onMove  = (x)=>{ if(!dragging) return; const dx=x-startX; c.style.transform=`translate(${dx}px, -50%) rotate(${dx/18}deg)`; };
      const onEnd   = (x)=>{ if(!dragging) return; dragging=false; document.body.classList.remove('noscroll');
        const dx=x-startX;
        if (Math.abs(dx)>110){
          c.classList.add(dx>0?'swipe-out-right':'swipe-out-left');
          setTimeout(()=>c.remove(), 420);
        }else{
          c.style.transform='translateY(-50%)';
        }
      };
      c.addEventListener('touchstart',e=>onStart(e.touches[0].clientX),{passive:true});
      c.addEventListener('touchmove', e=>onMove(e.touches[0].clientX),{passive:true});
      c.addEventListener('touchend',  e=>onEnd(e.changedTouches[0].clientX));
      c.addEventListener('mousedown', e=>onStart(e.clientX));
      window.addEventListener('mousemove', e=>onMove(e.clientX));
      window.addEventListener('mouseup',  e=>onEnd(e.clientX));

      // click immagine → profilo
      c.querySelector('.card-img').addEventListener('click', ()=>this.openProfile(d));
      deck.appendChild(c);
    });
  },

  // ---- Profilo
  openProfile(d){
    $('#profilePhoto').src = d.img;
    $('#profileName').textContent = d.name;
    $('#profileMeta').textContent = `${d.breed} · ${d.sex} · 3 anni`;
    $('#profileBio').textContent  = d.bio || '—';
    const b = $('#profileBadges');
    b.innerHTML = `<span class="badge">✔︎ Verificato</span>`;

    // mostra pagina
    $('#profilePage').classList.remove('hidden');
    $('#profilePage').setAttribute('aria-hidden','false');
    // nascondi main views
    $('.content').classList.add('hidden');
    window.scrollTo({top:0,behavior:'instant'});
  },

  hideProfile(){
    $('#profilePage').classList.add('hidden');
    $('#profilePage').setAttribute('aria-hidden','true');
    $('.content').classList.remove('hidden');
  },

  // ---- Ricerca: suggerimenti per lettera iniziale
  setupBreedSuggestions(){
    const input = $('#breed');
    const box   = $('#suggestions');
    const breeds = ['Akita','Beagle','Bichon Frisé','Border Collie','Bulldog','Cane Corso','Dobermann','Golden Retriever','Husky','Jack Russell','Labrador','Maltese','Pastore Tedesco','Pinscher','Poodle','Rottweiler','Shiba Inu','Volpino'];

    const render = (items)=>{
      box.innerHTML = items.map(r=>`<div class="item" role="option">${r}</div>`).join('');
      box.classList.toggle('show', items.length>0);
      $$('.item',box).forEach(it=>it.addEventListener('click',()=>{input.value=it.textContent; box.classList.remove('show');}));
    };

    input.addEventListener('input', ()=>{
      const t = input.value.trim().toLowerCase();
      if(!t){ box.classList.remove('show'); box.innerHTML=''; return; }
      const first = t[0];
      const out = breeds.filter(b=>b.toLowerCase().startsWith(first));
      render(out);
    });
    document.addEventListener('click', (e)=>{ if(!box.contains(e.target) && e.target!==input) box.classList.remove('show'); });
  }
};

// ---------- Avvio
home.init();
