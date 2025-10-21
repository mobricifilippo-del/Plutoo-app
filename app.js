/* ========= Utils ========= */
const $ = (sel,ctx=document)=>ctx.querySelector(sel);
const $$ = (sel,ctx=document)=>Array.from(ctx.querySelectorAll(sel));
const show = el => {el.classList.remove('hidden'); el.classList.add('active')};
const hide = el => {el.classList.add('hidden'); el.classList.remove('active')};
const toast = (msg,ms=1600)=>{
  $('#toastMsg').textContent = msg;
  $('#toast').classList.add('show');
  setTimeout(()=>$('#toast').classList.remove('show'), ms);
};

/* ========= Dati di esempio (immagini affidabili) ========= */
const DOGS = [
  {id:1,name:'Luna',  sex:'Femmina',breed:'Labrador',dist:'1.2km',
   img:'https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=900&auto=format&fit=crop', bio:'Amante dei parchi', badge:true},
  {id:2,name:'Rocky', sex:'Maschio',breed:'Beagle',  dist:'2.5km',
   img:'https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=900&auto=format&fit=crop', bio:'Corre come il vento'},
  {id:3,name:'Maya',  sex:'Femmina',breed:'Husky',   dist:'3.1km',
   img:'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=900&auto=format&fit=crop', bio:'Dolcissima'},
  {id:4,name:'Otto',  sex:'Maschio',breed:'Maltese', dist:'0.9km',
   img:'https://images.unsplash.com/photo-1517849845537-4d257902454a?q=80&w=900&auto=format&fit=crop', bio:'Coccolone', badge:true},
];

/* ========= HOME ========= */
$('#btnEnter').addEventListener('click', ()=>{
  $('#heroLogo').classList.add('gold-glow');
  setTimeout(()=>{ $('#homeScreen').classList.add('hidden'); $('#appScreen').classList.remove('hidden'); setActiveTab('nearby'); }, 850);
});
$('#btnEnterLink').addEventListener('click', e=>{ e.preventDefault(); $('#btnEnter').click(); });

$('#sponsorLinkHome').addEventListener('click', ()=>{ /* solo link */ });
$('#ethicsButtonHome').addEventListener('click', ()=>{
  const q = encodeURIComponent('canili vicino a me');
  window.open(`https://www.google.com/maps/search/${q}`, '_blank');
});

/* ========= TOPBAR ========= */
$('#btnBack').addEventListener('click', ()=>{
  $('#appScreen').classList.add('hidden');
  $('#homeScreen').classList.remove('hidden');
  window.scrollTo({top:0,behavior:'instant'});
});

/* dropdown Luoghi PET */
const tabLuoghi = $('#tabLuoghi');
tabLuoghi.addEventListener('click', (e)=>{
  const expanded = tabLuoghi.getAttribute('aria-expanded') === 'true';
  tabLuoghi.setAttribute('aria-expanded', String(!expanded));
});
$$('.menu-item', tabLuoghi).forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const q = encodeURIComponent(`${btn.dataset.map} vicino a me`);
    window.open(`https://www.google.com/maps/search/${q}`, '_blank');
  });
});

/* ========= Navigazione viste ========= */
function setActiveTab(id){
  $$('.view').forEach(v=>v.classList.remove('active'));
  $$('.tab').forEach(t=>t.classList.remove('active'));
  switch(id){
    case 'nearby': $('#viewNearby').classList.add('active'); break;
    case 'love':   $('#viewLove').classList.add('active');   break;
    case 'play':   $('#viewPlay').classList.add('active');   break;
    case 'search': $('#viewSearch').classList.add('active'); break;
  }
  const btn = $(`.tab[data-tab="${id}"]`);
  if(btn) btn.classList.add('active');
  window.scrollTo({top:0,behavior:'instant'});
}
$$('.tab[data-tab]').forEach(b=>b.addEventListener('click', ()=>setActiveTab(b.dataset.tab)));

/* ========= Render VICINO A TE ========= */
function cardHTML(d){
  return `
    <article class="card" role="button" aria-label="Apri profilo di ${d.name}" data-id="${d.id}">
      <img class="card-img" src="${d.img}" alt="${d.name}">
      <div class="card-info">
        <h3>${d.name}</h3>
        <p class="meta">${d.breed} · ${d.sex} · ${d.dist}</p>
        <div class="card-actions">
          <button class="btn no" title="Saluta">😊</button>
          <button class="btn yes" title="Mi piace">💜</button>
        </div>
      </div>
    </article>`;
}
function renderNearby(){
  $('#nearbyGrid').innerHTML = DOGS.map(cardHTML).join('');
  // click card → profilo
  $$('#nearbyGrid .card').forEach(c=>{
    c.addEventListener('click', e=>{
      if(e.target.closest('.btn')) return; // evita click sui bottoni
      const id = Number(c.dataset.id);
      openProfile(id);
    });
  });
}
renderNearby();

/* ========= LOVE / PLAY – mock singola card ========= */
function renderDeck(whereId){
  const root = $(whereId);
  root.innerHTML = `
    <article class="card" style="max-width:420px;width:100%;">
      <img class="card-img" src="${DOGS[0].img}" alt="${DOGS[0].name}">
      <div class="card-info">
        <h3>${DOGS[0].name}</h3>
        <p class="meta">${DOGS[0].breed} · ${DOGS[0].sex} · ${DOGS[0].dist}</p>
        <div class="card-actions">
          <button class="btn no">😊</button>
          <button class="btn yes">💜</button>
        </div>
      </div>
    </article>`;
}
renderDeck('#loveDeck');
renderDeck('#playDeck');

/* ========= Ricerca – suggerimenti razze ========= */
const BREEDS = ['Alano','Barboncino','Beagle','Border Collie','Bulldog','Chihuahua','Golden Retriever','Husky','Labrador','Maltese','Pastore Tedesco','Shiba Inu','Yorkshire'];
$('#breedInput').addEventListener('input', e=>{
  const v = e.target.value.trim().toLowerCase();
  const box = $('#breedSug');
  if(!v){ box.innerHTML=''; box.classList.remove('show'); return; }
  const list = BREEDS.filter(b=>b.toLowerCase().startsWith(v)).sort();
  box.innerHTML = list.map(b=>`<div class="item">${b}</div>`).join('');
  box.classList.toggle('show', list.length>0);
  $$('#breedSug .item').forEach(i=>i.addEventListener('click',()=>{ $('#breedInput').value=i.textContent; box.classList.remove('show'); }));
});

/* ========= Profilo cane ========= */
function openProfile(id){
  const d = DOGS.find(x=>x.id===id); if(!d) return;

  $('#profilePhoto').src = d.img;
  $('#profileName').textContent = d.name;
  $('#profileMeta').textContent = `${d.breed} · ${d.sex} · ${d.dist}`;
  $('#profileBio').textContent  = d.bio || '—';
  $('#profileBadges').innerHTML = d.badge ? `<span class="badge">✔︎ Verificato</span>` : '';
  $('#profileGallery').innerHTML = `
     <img src="${d.img}" alt="">
     <img src="https://images.unsplash.com/photo-1534361960057-19889db9621e?q=80&w=600&auto=format&fit=crop" alt="">
     <img src="https://images.unsplash.com/photo-1561037404-61cd46aa615b?q=80&w=600&auto=format&fit=crop" alt="">
  `;

  // mostra pagina profilo (non schermo nero)
  $('#appScreen').classList.add('hidden');
  $('#profilePage').classList.remove('hidden');
  window.scrollTo({top:0,behavior:'instant'});
}
$('#btnBackProfile').addEventListener('click', ()=>{
  $('#profilePage').classList.add('hidden');
  $('#appScreen').classList.remove('hidden');
  setActiveTab('nearby');
});

/* ========= Sponsor (sempre cliccabile) ========= */
$('#sponsorLinkApp').addEventListener('click', ()=>{ /* solo link */ });

/* ========= Plus (placeholder) ========= */
$('#tabPlus').addEventListener('click', ()=> toast('Plus arriva dopo i test!'));
