/* =========================================================
   PLUTOO – GOLD EDITION (JS completo)
   ========================================================= */
(() => {
  "use strict";

  // ---------- Helpers ----------
  const qs  = (s,el=document)=>el.querySelector(s);
  const qa  = (s,el=document)=>Array.from(el.querySelectorAll(s));
  const on  = (el,ev,fn,opt)=>el && el.addEventListener(ev,fn,opt);

  // ---------- Elements ----------
  const homeScreen=qs("#homeScreen");
  const appScreen =qs("#appScreen");
  const btnEnter  =qs("#btnEnter");
  const heroLogo  =qs("#heroLogo");

  const sponsorLink = qs("#sponsorLink");
  const ethicsHome  = qs("#ethicsButton");
  const ethicsApp   = qs("#ethicsButtonApp");

  const btnBack   = qs("#btnBack");
  const tabNearby = qs("#tabNearby");
  const tabLove   = qs("#tabLove");
  const tabPlay   = qs("#tabPlay");
  const tabLuoghi = qs("#tabLuoghi");
  const luoghiMenu= qs("#luoghiMenu");
  const btnSearch = qs("#btnSearch");
  const tabPlus   = qs("#tabPlus");

  const viewNearby= qs("#viewNearby");
  const viewLove  = qs("#viewLove");
  const viewPlay  = qs("#viewPlay");
  const nearGrid  = qs("#nearbyGrid");
  const loveDeck  = qs("#loveDeck");
  const playDeck  = qs("#playDeck");

  const panelSearch=qs("#panelSearch");
  const btnCloseSearch=qs("#btnCloseSearch");

  const profilePage=qs("#profilePage");
  const btnBackProfile=qs("#btnBackProfile");
  const profilePhoto=qs("#profilePhoto");
  const profileName =qs("#profileName");
  const profileMeta =qs("#profileMeta");
  const profileBadges=qs("#profileBadges");
  const profileBio  =qs("#profileBio");
  const profileGallery=qs("#profileGallery");
  const btnSeeSelfie =qs("#btnSeeSelfie");
  const btnUploadSelfie=qs("#btnUploadSelfie");
  const btnUploadDogDocs=qs("#btnUploadDogDocs");
  const btnUploadOwnerDocs=qs("#btnUploadOwnerDocs");
  const btnOpenChat = qs("#btnOpenChat");

  // ---------- Stato ----------
  const state = {
    lang:(localStorage.getItem("lang")||((navigator.language||"").startsWith("it")?"it":"en")),
    plus: localStorage.getItem("plutoo_plus")==="1",
    entered: localStorage.getItem("entered")==="1",
    swipeCount: +localStorage.getItem("swipes")||0,
    matches: +localStorage.getItem("matches")||0,
    firstMsgRewardDone: JSON.parse(localStorage.getItem("firstMsgRewardDone")||"{}"),
    selfieUntilByDog:   JSON.parse(localStorage.getItem("selfieUntilByDog")||"{}"),
    history: []  // stack viste (per back)
  };

  // ---------- Test data ----------
  const DOGS = [
    {id:"1", name:"Luna",  breed:"Labrador", sex:"Femmina", age:"2", dist:"1.2km", verified:true,  img:"dog1.jpg", bio:"Amante dei parchi"},
    {id:"2", name:"Rocky", breed:"Beagle",   sex:"Maschio", age:"3", dist:"2.5km", verified:false, img:"dog2.jpg", bio:"Corre come il vento"},
    {id:"3", name:"Maya",  breed:"Husky",    sex:"Femmina", age:"1", dist:"3.1km", verified:true,  img:"dog3.jpg", bio:"Dolcissima"},
    {id:"4", name:"Otto",  breed:"Maltese",  sex:"Maschio", age:"4", dist:"0.9km", verified:false, img:"dog4.jpg", bio:"Coccolone"},
  ];
  const BREEDS = ["Akita","Alano","Barboncino","Beagle","Bichon Frisé","Border Collie","Boxer","Bulldog","Cavalier King","Chihuahua","Cocker Spaniel","Dalmata","Dobermann","Husky","Jack Russell","Labrador","Maltese","Pastore Tedesco","Pinscher","Pug","Rottweiler","Samoyed","Setter","Shiba Inu","Spitz","Terranova","Volpino"];

  // ---------- Utility UI ----------
  function toast(msg,ms=1300){
    const w=document.createElement("div"); w.className="toast"; w.innerHTML=`<div class="toast-box">${msg}</div>`;
    document.body.appendChild(w); setTimeout(()=>w.classList.add("show"),20);
    setTimeout(()=>{ w.classList.remove("show"); setTimeout(()=>w.remove(),250); },ms);
  }
  function reward(label="Video reward"){ if(state.plus) return Promise.resolve(true);
    return new Promise(res=>{
      const box=document.createElement("div");
      box.className="reward-box";
      box.innerHTML=`<div class="reward-inner"><div class="rw-title">Reward</div><div class="rw-msg">${label}</div><button class="btn primary" id="rwOk">Guarda</button></div>`;
      document.body.appendChild(box);
      qs("#rwOk",box)?.addEventListener("click",()=>{ setTimeout(()=>{box.remove(); toast("Grazie 🙏",900); res(true);},800); });
    });
  }
  function interstitialMatch(){
    const box=document.createElement("div");
    box.className="reward-box";
    box.innerHTML=`<div class="reward-inner"><div class="rw-title">Videomatch</div><div class="rw-msg">Annuncio dopo il match 💛</div><button class="btn primary" id="rwOk2">Chiudi</button></div>`;
    document.body.appendChild(box);
    qs("#rwOk2",box)?.addEventListener("click",()=>box.remove());
  }
  function openMaps(q){ window.open(`https://www.google.com/maps?q=${encodeURIComponent(q)}`,"_blank","noopener"); }

  // ---------- Home ----------
  initHome();
  function initHome(){
    // Home SEMPRE all’avvio; Entra → anima LOGO (no cuore) e apre app
    on(btnEnter,"click",()=>{
      heroLogo.classList.add("gold-glow");
      setTimeout(()=>{
        heroLogo.classList.remove("gold-glow");
        state.entered=true; localStorage.setItem("entered","1");
        pushView("home","nearby");  // per back corretto
        homeScreen.classList.add("hidden");
        appScreen.classList.remove("hidden");
        setActiveView("nearby");
      },1200);
    });

    on(sponsorLink,"click",(e)=>{ e.preventDefault(); reward("Video prima di aprire lo sponsor").then(()=>window.open("https://example.com/fido-gelato","_blank","noopener")); });
    const caniliQ = (state.lang==="it")? "canili vicino a me" : "animal shelters near me";
    on(ethicsHome,"click", async ()=>{ await reward("Video prima di aprire Google Maps (canili)"); openMaps(caniliQ); });
    on(ethicsApp, "click", async ()=>{ await reward("Video prima di aprire Google Maps (canili)"); openMaps(caniliQ); });
  }

  // ---------- Navbar / Back ----------
  on(btnBack,"click",()=>goBack());
  function pushView(from,to){ state.history.push({from,to}); }
  function goBack(){
    if (profilePage && !profilePage.classList.contains("hidden")){
      // dalla pagina profilo → torna alla view precedente
      showProfile(false);
      setActiveView(state.lastView||"nearby");
      return;
    }
    const last = state.history.pop();
    if (!last){ // se stack vuoto → torna a Home (solo allora)
      appScreen.classList.add("hidden");
      homeScreen.classList.remove("hidden");
      return;
    }
    if (last.to==="nearby"||last.to==="love"||last.to==="play"){
      setActiveView(last.to);
    }
  }

  on(tabNearby,"click",()=>{ pushView(state.lastView||"nearby","nearby"); setActiveView("nearby"); });
  on(tabLove,  "click",()=>{ pushView(state.lastView||"nearby","love");   setActiveView("love");   });
  on(tabPlay,  "click",()=>{ pushView(state.lastView||"nearby","play");   setActiveView("play");   });

  // Luoghi PET (dropdown + reward → Maps)
  on(tabLuoghi,"click",(e)=>{
    e.stopPropagation();
    const exp = tabLuoghi.getAttribute("aria-expanded")==="true";
    tabLuoghi.setAttribute("aria-expanded", exp?"false":"true");
  });
  on(document,"click",(e)=>{
    if (!qs("#luoghiTabWrap")?.contains(e.target)) tabLuoghi?.setAttribute("aria-expanded","false");
  });
  qa(".menu-item",luoghiMenu).forEach(btn=>{
    on(btn,"click", async ()=>{
      const m={vets:"veterinari vicino a me",shops:"negozi per animali vicino a me",groomers:"toelettature vicino a me",parks:"parchi per cani vicino a me",trainers:"addestratori cani vicino a me"};
      const q=(state.lang==="it")? m[btn.dataset.cat] : {vets:"veterinarians near me",shops:"pet shops near me",groomers:"dog groomers near me",parks:"dog parks near me",trainers:"dog trainers near me"}[btn.dataset.cat];
      await reward("Video prima di aprire Google Maps"); openMaps(q);
    });
  });

  // Ricerca overlay
  on(btnSearch,"click",()=>{ panelSearch.setAttribute("aria-hidden","false"); btnSearch.setAttribute("aria-expanded","true"); document.body.classList.add("noscroll"); });
  on(btnCloseSearch,"click",()=>{ panelSearch.setAttribute("aria-hidden","true"); btnSearch.setAttribute("aria-expanded","false"); document.body.classList.remove("noscroll"); });

  // ---------- Views ----------
  function setActiveView(v){
    state.lastView=v;
    qa(".view").forEach(x=>x.classList.remove("active"));
    qa(".tab").forEach(x=>x.classList.remove("active"));
    if (v==="nearby"){ viewNearby.classList.add("active"); tabNearby.classList.add("active"); renderNearby(); }
    if (v==="love"){   viewLove.classList.add("active");   tabLove.classList.add("active");   buildDeck(loveDeck,"love"); }
    if (v==="play"){   viewPlay.classList.add("active");   tabPlay.classList.add("active");   buildDeck(playDeck,"play"); }
  }

  // ---------- Vicino a te (amici) ----------
  function renderNearby(){
    if (!nearGrid) return;
    nearGrid.innerHTML = DOGS.map(d=>`
      <article class="card dog-card" data-id="${d.id}">
        <img class="card-img" src="${d.img}" alt="${d.name}" />
        <div class="card-info">
          <h3>${d.name}</h3>
          <p class="meta">${d.breed} · ${d.sex} · ${d.age} anni · ${d.dist} ${d.verified?' · <span title="Verificato">★ Gold</span>':''}</p>
          <p class="bio">${d.bio||""}</p>
        </div>
        <div class="card-actions">
          <button class="btn no"   data-act="no">🙂</button>
          <button class="btn yes"  data-act="yes">💛</button>
        </div>
      </article>
    `).join("");
    // click foto → profilo
    qa(".dog-card .card-img",nearGrid).forEach(img=>{
      const id = img.closest(".dog-card").dataset.id;
      const d  = DOGS.find(x=>x.id===id);
      on(img,"click",()=>openProfilePage(d));
    });
  }

  // ---------- Profilo (pagina dedicata) ----------
  function showProfile(show){
    if (show){ profilePage.classList.remove("hidden"); profilePage.setAttribute("aria-hidden","false"); }
    else     { profilePage.classList.add("hidden");    profilePage.setAttribute("aria-hidden","true"); }
  }
  function openProfilePage(d){
    if (!d) return;
    profilePhoto.src=d.img; profilePhoto.alt=d.name;
    profileName.textContent=d.name;
    profileMeta.textContent=`${d.breed} · ${d.sex} · ${d.age} anni`;
    profileBio.textContent=d.bio||"";
    profileBadges.innerHTML = `
      ${d.verified?'<span class="badge">✅ Verificato</span>':''}
      <span class="badge">✨ Gold</span>
    `;
    profileGallery.innerHTML = `<img src="${d.img}" alt="${d.name}" /><img src="${d.img}" alt="${d.name}" /><img src="${d.img}" alt="${d.name}" />`;

    // Selfie 24h
    on(btnSeeSelfie,"click",async ()=>{
      if (Date.now() < (state.selfieUntilByDog[d.id]||0)){ toast("Selfie già sbloccato ✅"); return; }
      await reward("Video per sbloccare il selfie (24h)");
      state.selfieUntilByDog[d.id]=Date.now()+24*60*60*1000;
      localStorage.setItem("selfieUntilByDog",JSON.stringify(state.selfieUntilByDog));
      toast("Selfie sbloccato per 24h ✅");
    },{once:true});

    // Upload mock
    on(btnUploadSelfie,"click",()=>toast("Selettore foto (selfie col tuo amico) 📷"));
    on(btnUploadDogDocs,"click",()=>toast("Carica documenti dog 🐶"));
    on(btnUploadOwnerDocs,"click",()=>toast("Carica documenti personali (proprietario) 👤"));

    // Messaggi: primo gratis → reward se non match
    on(btnOpenChat,"click",()=>openChat(d));

    // mostra pagina
    qa(".view").forEach(v=>v.classList.remove("active"));
    showProfile(true);
  }

  function openChat(d){
    const wrap=document.createElement("div");
    wrap.className="chat-pane";
    wrap.innerHTML=`
      <div class="chat-head">
        <div style="display:flex;align-items:center;gap:.6rem">
          <img src="${d.img}" alt="${d.name}" style="width:36px;height:36px;border-radius:10px" />
          <strong>${d.name}</strong>
        </div>
        <button class="btn tiny ghost" id="chatClose">✕</button>
      </div>
      <div class="chat-body">
        <div class="msg theirs">Ciao! 🐾</div>
      </div>
      <div class="chat-input">
        <input id="chatField" type="text" placeholder="Scrivi un messaggio..." />
        <button id="chatSend" class="btn primary">Invia</button>
      </div>
    `;
    document.body.appendChild(wrap);
    const close=qs("#chatClose",wrap), send=qs("#chatSend",wrap), field=qs("#chatField",wrap), body=qs(".chat-body",wrap);
    on(close,"click",()=>wrap.remove());
    let firstSent=false;
    on(send,"click",async ()=>{
      const v=(field.value||"").trim(); if(!v) return;
      const b=document.createElement("div"); b.className="msg mine"; b.textContent=v; body.appendChild(b); field.value=""; body.scrollTop=body.scrollHeight;
      if(!firstSent){ firstSent=true;
        const matched = (state.matches>0); // mock
        if(!state.plus && !matched && !state.firstMsgRewardDone[d.id]){
          await reward("Video dopo il primo messaggio");
          state.firstMsgRewardDone[d.id]=true;
          localStorage.setItem("firstMsgRewardDone",JSON.stringify(state.firstMsgRewardDone));
        }
      }
    });
  }

  // ---------- Decks (Amore / Giochiamo) ----------
  function buildDeck(container,type){
    container.innerHTML=""; const data=DOGS.slice(0);
    data.forEach((d,i)=>{
      const card=document.createElement("article");
      card.className="card"; card.style.top=(10+i*2)+"px"; // leggermente sfalsate
      card.innerHTML=`
        <img class="card-img" src="${d.img}" alt="${d.name}" />
        <div class="card-info">
          <h3>${d.name}</h3>
          <p class="meta">${d.breed} · ${d.sex} · ${d.age} anni ${d.verified?' · <span title="Verificato">★ Gold</span>':''}</p>
        </div>
        <div class="card-actions">
          <button class="btn no"  data-act="no">🙂</button>
          <button class="btn yes" data-act="yes">💛</button>
        </div>
      `;
      container.appendChild(card);

      // click immagine nel deck → profilo
      on(qs(".card-img",card),"click",()=>openProfilePage(d));

      enableSwipe(card,d,type);
    });
  }

  function enableSwipe(card,d,type){
    let startX=0,dx=0,drag=false;
    const threshold=120;

    function start(x){ drag=true; startX=x; card.style.transition="none"; }
    function move(x){
      if(!drag) return;
      dx=x-startX;
      const rot=Math.max(-10,Math.min(10,dx/16));
      card.style.transform=`translateX(${dx}px) rotate(${rot}deg)`;
    }
    async function end(){
      if(!drag) return; drag=false; card.style.transition="";
      if(dx>threshold){ await onSwipe(card,d,"right",type); }
      else if(dx<-threshold){ await onSwipe(card,d,"left",type); }
      else { card.style.transform=""; }
      dx=0;
    }

    card.addEventListener("touchstart",e=>start(e.touches[0].clientX),{passive:true});
    card.addEventListener("touchmove", e=>move(e.touches[0].clientX), {passive:true});
    card.addEventListener("touchend", end);

    card.addEventListener("mousedown",e=>start(e.clientX));
    window.addEventListener("mousemove",e=>move(e.clientX));
    window.addEventListener("mouseup", end);
  }

  async function onSwipe(card,d,dir,type){
    // Previeni doppio swipe simultaneo: disabilita pointer events fino a fine animazione
    card.style.pointerEvents="none";
    card.classList.add(dir==="right"?"swipe-out-right":"swipe-out-left");

    // Gating swipe: 10 → +5 → poi ogni 5
    if(!state.plus){
      state.swipeCount++; localStorage.setItem("swipes",String(state.swipeCount));
      if(state.swipeCount===10 || (state.swipeCount>10 && (state.swipeCount-10)%5===0)){
        await reward("Video per continuare a fare swipe");
      }
    }
    // Match (mock) quando like
    if(dir==="right" && Math.random()<0.5){
      state.matches++; localStorage.setItem("matches",String(state.matches));
      interstitialMatch(); toast("It’s a match! 💛");
    }
    setTimeout(()=>{ card.remove(); }, 480);
  }

  // ---------- Ricerca overlay ----------
  const breedInput=qs("#breed"), suggestions=qs("#suggestions");
  const sexSelect=qs("#sex"), heightSelect=qs("#height"), distanceInput=qs("#distance");
  const btnApply=qs("#btnApplyFilters"), btnReset=qs("#btnResetFilters");

  if(breedInput && suggestions){
    on(breedInput,"input",()=>{
      const q=(breedInput.value||"").trim().toLowerCase();
      if(!q){ suggestions.classList.remove("show"); suggestions.innerHTML=""; return; }
      const items=BREEDS.filter(b=>b.toLowerCase().startsWith(q)).sort();
      if(!items.length){ suggestions.classList.remove("show"); suggestions.innerHTML=""; return; }
      suggestions.innerHTML=items.map(b=>`<div class="item" data-v="${b}">${b}</div>`).join("");
      suggestions.classList.add("show");
      qa(".item",suggestions).forEach(it=>on(it,"click",()=>{ breedInput.value=it.dataset.v; suggestions.classList.remove("show"); suggestions.innerHTML=""; }));
    });
    on(document,"click",(e)=>{ if(!qs(".f",panelSearch)?.contains(e.target)){ suggestions.classList.remove("show"); } });
  }
  on(btnApply,"click",()=>{ toast("Filtri applicati ✅"); panelSearch.setAttribute("aria-hidden","true"); btnSearch.setAttribute("aria-expanded","false"); document.body.classList.remove("noscroll"); });
  on(btnReset,"click",()=>{ breedInput.value=""; sexSelect.value=""; heightSelect.value=""; distanceInput.value="20"; suggestions.classList.remove("show"); suggestions.innerHTML=""; });

  // ---------- Preload ----------
  (function preload(){ ["dog1.jpg","dog2.jpg","dog3.jpg","dog4.jpg","plutoo-icon-512.png","sponsor-logo.png"].forEach(s=>{ const i=new Image(); i.src=s; }); })();

})();
