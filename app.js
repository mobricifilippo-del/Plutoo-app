/* --- INIZIO app.js (incollare in /app.js) --- */
;(() => {
  const $ = (sel,scope=document) => scope.querySelector(sel);
  const $$ = (sel,scope=document) => Array.from(scope.querySelectorAll(sel));

  // Views
  const elHome = $('#homeScreen');
  const elApp  = $('#appScreen');

  // Buttons Home
  const btnEnter = $('#btnEnter');
  const ethicsHome = $('#ethicsButton');

  // Topbar & tabs
  const btnBack = $('#btnBack');
  const tabs = {
    nearby: $('#tabNearby'),
    love:   $('#tabLove'),
    play:   $('#tabPlay'),
  };
  const views = {
    nearby: $('#viewNearby'),
    love:   $('#viewLove'),
    play:   $('#viewPlay'),
  };

  // Luoghi PET dropdown
  const dropBtn = $('#tabLuoghi');
  const drop    = dropBtn?.parentElement; // .dropdown
  const dropMenu= $('#luoghiMenu');

  // Ricerca personalizzata
  const btnSearch = $('#btnSearchPanel');
  const panel = $('#searchPanel');
  const btnCloseSearch = $('#closeSearch');
  const distRange = $('#distRange');
  const distLabel = $('#distLabel');

  // Plus modal
  const btnPlus = $('#btnPlus');
  const plusModal = $('#plusModal');
  const closePlus = $('#closePlus');

  // Sheets
  const profileSheet = $('#profileSheet');
  const chatPane = $('#chatPane');
  const closeChat = $('#closeChat');

  // Sponsor footer app
  const sponsorLinkApp = $('#sponsorLinkApp');
  const ethicsApp = $('#ethicsButtonApp');

  // Helpers
  const show = (el) => el?.classList.remove('hidden');
  const hide = (el) => el?.classList.add('hidden');
  const selectTab = (key) => {
    Object.entries(tabs).forEach(([k,btn]) => btn.classList.toggle('active', k===key));
    Object.entries(views).forEach(([k,view]) => view.classList.toggle('active', k===key));
  };

  // Enter app
  btnEnter?.addEventListener('click', () => {
    hide(elHome); show(elApp); selectTab('nearby');
  });

  // Back to Home
  btnBack?.addEventListener('click', () => { show(elHome); hide(elApp); });

  // Tabs
  tabs.nearby?.addEventListener('click', () => selectTab('nearby'));
  tabs.love?.addEventListener('click',   () => selectTab('love'));
  tabs.play?.addEventListener('click',   () => selectTab('play'));

  // Dropdown Luoghi PET
  dropBtn?.addEventListener('click', () => drop?.classList.toggle('open'));
  document.addEventListener('click', (e)=>{
    if(!drop?.contains(e.target)) drop?.classList.remove('open');
  });
  $$('.menu-item', dropMenu).forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const cat = btn.dataset.cat;
      const q = {
        vets:'veterinario vicino a me', groomers:'toelettatura per cani', shops:'negozi animali',
        trainers:'addestratore cani', kennels:'pensione cani', parks:'parco cani'
      }[cat] || 'negozi animali';
      const url = `https://www.google.com/maps/search/${encodeURIComponent(q)}`;
      window.open(url,'_blank');
      drop?.classList.remove('open');
    });
  });

  // Ricerca personalizzata panel
  btnSearch?.addEventListener('click', ()=> panel.classList.add('show'));
  btnCloseSearch?.addEventListener('click', ()=> panel.classList.remove('show'));
  distRange?.addEventListener('input', ()=> distLabel.textContent = `${distRange.value} km`);
  $('#resetFilters')?.addEventListener('click', ()=>{
    $('#sexFilter').value=''; distRange.value=5; distLabel.textContent='5 km';
    $('#breedInput').value=''; $('#breedsList').innerHTML='';
  });

  // Plus modal
  btnPlus?.addEventListener('click', ()=> plusModal.classList.add('show'));
  closePlus?.addEventListener('click', ()=> plusModal.classList.remove('show'));
  plusModal?.querySelector('.modal-backdrop')?.addEventListener('click', ()=> plusModal.classList.remove('show'));

  // Etico
  const openShelters = ()=> window.open('https://www.google.com/maps/search/'+encodeURIComponent('canili vicino a me'),'_blank');
  ethicsHome?.addEventListener('click', openShelters);
  ethicsApp?.addEventListener('click', openShelters);

  // Sponsor
  sponsorLinkApp?.addEventListener('click', (e)=>{ /* hook per rewarded in futuro */ });

  // Profilo & Chat (demo)
  window.closeProfilePage = () => hide(profileSheet);
  const openProfile = (dog)=>{
    const body = $('#ppBody');
    body.innerHTML = `
      <div class="card">
        <img class="card-img" src="${dog.img}" alt="${dog.name}"/>
        <div class="card-info">
          <h3>${dog.name} · ${dog.age}</h3>
          <p class="meta">${dog.breed} · ${dog.km} km</p>
          <p class="bio">${dog.bio}</p>
          <div class="card-actions">
            <button class="btn" id="openChat">Chat</button>
            <button class="btn ghost" onclick="closeProfilePage()">Chiudi</button>
          </div>
        </div>
      </div>`;
    show(profileSheet);
    $('#openChat')?.addEventListener('click', ()=>{ show(chatPane); });
  };
  closeChat?.addEventListener('click', ()=> hide(chatPane));

  // Popola Vicino a te
  const nearGrid = $('#nearGrid');
  const demo = [
    {name:'Rocky',age:'3a',breed:'Beagle',km:2,img:'dog1.jpg',bio:'Curioso e giocherellone'},
    {name:'Luna', age:'2a',breed:'Border Collie',km:5,img:'dog2.jpg',bio:'Ama correre al parco'},
    {name:'Zoe',  age:'4a',breed:'Labrador',km:1,img:'dog3.jpg',bio:'Dolce e ubbidiente'},
    {name:'Thor', age:'5a',breed:'Husky',km:7,img:'dog4.jpg',bio:'Adora la neve'}
  ];
  if(nearGrid){
    nearGrid.innerHTML = demo.map((d,i)=>`
      <article class="card" data-i="${i}">
        <img class="card-img" src="${d.img}" alt="${d.name}">
        <div class="card-info">
          <strong>${d.name} · ${d.age}</strong>
          <div class="meta">${d.breed} · ${d.km} km</div>
        </div>
      </article>`).join('');
    $$('.card', nearGrid).forEach(card=>{
      card.addEventListener('click', ()=>{
        const i = +card.dataset.i; openProfile(demo[i]);
      });
    });
  }

  // Swipe (placeholder semplice)
  const attachSimpleSwipe = (card, yesBtn, noBtn) => {
    let startX=0, dx=0;
    const reset=()=>{card.style.transform='';card.style.opacity='';};
    const commit=(liked)=>{reset(); /* hook match/reward */ };
    card.addEventListener('touchstart',e=>{startX=e.touches[0].clientX});
    card.addEventListener('touchmove',e=>{dx=e.touches[0].clientX-startX;card.style.transform=`translateX(${dx}px) rotate(${dx/25}deg)`;card.style.opacity=String(1-Math.min(Math.abs(dx)/180,0.6))});
    card.addEventListener('touchend',()=>{if(Math.abs(dx)>120){commit(dx>0)} reset();});
    yesBtn?.addEventListener('click',()=>commit(true));
    noBtn?.addEventListener('click',()=>commit(false));
  };
  attachSimpleSwipe($('#loveCard'), $('#loveYes'), $('#loveNo'));
  attachSimpleSwipe($('#playCard'), $('#playYes'), $('#playNo'));

})();
/* --- FINE app.js --- */
