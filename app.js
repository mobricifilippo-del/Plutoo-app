/* =========================================================
   PLUTOO – app.js (Gold Edition, COMPLETO/ESTESO)
   ========================================================= */
(function(){
  // ---------- helpers ----------
  const $  = (id, r=document)=> r.getElementById(id);
  const qs = (s, r=document)=> r.querySelector(s);
  const qa = (s, r=document)=> Array.from(r.querySelectorAll(s));
  const wait = (ms)=> new Promise(res=>setTimeout(res,ms));

  // ---------- DOM ----------
  const homeScreen=$("homeScreen"), appScreen=$("appScreen");
  const btnEnter=$("btnEnter"), btnLogin=$("btnLogin"), btnRegister=$("btnRegister"), langToggle=$("langToggle");
  const sponsorLink=$("sponsorLink"), sponsorLinkApp=$("sponsorLinkApp");
  const ethicsButton=$("ethicsButton"), ethicsButtonApp=$("ethicsButtonApp");

  const btnBack=$("btnBack");
  const tabNearby=$("tabNearby"), tabLove=$("tabLove"), tabSocial=$("tabSocial");
  const tabLuoghi=$("tabLuoghi"), luoghiMenu=$("luoghiMenu");
  const btnSearchPanel=$("btnSearchPanel");
  const viewNearby=$("viewNearby"), viewLove=$("viewLove"), viewSocial=$("viewSocial");
  const nearGrid=$("nearGrid");

  const loveCard=$("loveCard"), loveImg=$("loveImg"), loveTitleTxt=$("loveTitleTxt"), loveMeta=$("loveMeta"), loveBio=$("loveBio"), loveYes=$("loveYes"), loveNo=$("loveNo");
  const socialCard=$("socialCard"), socialImg=$("socialImg"), socialTitleTxt=$("socialTitleTxt"), socialMeta=$("socialMeta"), socialBio=$("socialBio"), socialYes=$("socialYes"), socialNo=$("socialNo");

  const profileSheet=$("profileSheet"), ppBody=$("ppBody");
  const chatPane=$("chatPane"), closeChatBtn=$("closeChat"), chatList=$("chatList"), chatComposer=$("chatComposer"), chatInput=$("chatInput");
  const searchPanel=$("searchPanel"), closeSearch=$("closeSearch");
  const breedInput=$("breedInput"), breedsList=$("breedsList"), distRange=$("distRange"), distLabel=$("distLabel"), onlyVerified=$("onlyVerified"), sexFilter=$("sexFilter");
  const weightInput=$("weightInput"), heightInput=$("heightInput"), pedigreeInput=$("pedigreeInput"), microchipInput=$("microchipInput"), vacciniInput=$("vacciniInput"), matingInput=$("matingInput"), titleInput=$("titleInput");
  const applyFilters=$("applyFilters"), resetFilters=$("resetFilters");
  const adBanner=$("adBanner");

  const selfiePage=$("selfiePage"), selfieBack=$("selfieBack"), selfieFullImg=$("selfieFullImg"), selfieCaption=$("selfieCaption"), selfieLike=$("selfieLike"), selfieLikeCount=$("selfieLikeCount");

  // ---------- stato ----------
  const state={
    lang:(localStorage.getItem("lang")||autodetect()),
    entered: localStorage.getItem("entered")==="1",
    plus: localStorage.getItem("plutoo_plus")==="1",
    swipeCount: parseInt(localStorage.getItem("swipes")||"0"),
    matches: parseInt(localStorage.getItem("matches")||"0"),
    curLove: parseInt(localStorage.getItem("curLove")||"0"),
    curSocial: parseInt(localStorage.getItem("curSocial")||"0"),
    filters:{
      breed: localStorage.getItem("f_breed")||"",
      distKm: parseInt(localStorage.getItem("f_distKm")||"5"),
      verified: localStorage.getItem("f_verified")==="1",
      sex: localStorage.getItem("f_sex")||"",
      weight: localStorage.getItem("f_weight")||"",
      height: localStorage.getItem("f_height")||"",
      pedigree: localStorage.getItem("f_pedigree")||"",
      microchip: localStorage.getItem("f_microchip")||"",
      vaccini: localStorage.getItem("f_vaccini")||"",
      mating: localStorage.getItem("f_mating")||"",
      title: localStorage.getItem("f_title")||""
    },
    firstMsgRewardByDog: JSON.parse(localStorage.getItem("firstMsgRewardByDog")||"{}"),
    selfieUntilByDog: JSON.parse(localStorage.getItem("selfieUntilByDog")||"{}"),
    likesBySelfie: JSON.parse(localStorage.getItem("likesBySelfie")||"{}"),
    breeds:[],
    geo:null,
    currentView:"nearby",
    currentDogForSelfie:null
  };

  // ---------- i18n minimo ----------
  const I18N={
    it:{
      sponsorUrl:"https://fido-gelato.it",
      mapsShelters:"canili vicino a me",
      watchVideo:"Guarda un breve video per continuare",
      videoPlaying:"Video in riproduzione…",
      noProfiles:"Nessun profilo corrisponde ai filtri.",
      plusTitle:"✨ Plutoo Plus",
      plusCopy:"Rimuovi annunci e sblocca i filtri Gold (mock).",
      activateNow:"Attiva ora",
      close:"Chiudi",
    },
    en:{
      sponsorUrl:"https://fido-gelato.it",
      mapsShelters:"animal shelters near me",
      watchVideo:"Watch a short video to continue",
      videoPlaying:"Playing video…",
      noProfiles:"No profiles match your filters.",
      plusTitle:"✨ Plutoo Plus",
      plusCopy:"Remove ads and unlock Gold filters (mock).",
      activateNow:"Activate now",
      close:"Close",
    }
  };
  const t=(k)=> (I18N[state.lang]&&I18N[state.lang][k])||k;
  function autodetect(){ return (navigator.language||"it").toLowerCase().startsWith("en")?"en":"it"; }

  // ---------- datasets mock ----------
  const DOGS=[
    {id:"d1", name:"Luna",  age:2, breed:"Golden Retriever", km:1.2, sex:"F", verified:true,  mode:"love",   img:"dog1.jpg", gallery:["dog1.jpg","dog1b.jpg","dog1c.jpg","dog1d.jpg"], mating:"yes", pedigree:"ENCI", microchip:"yes", vaccini:"yes", title:"cucciolo"},
    {id:"d2", name:"Rex",   age:4, breed:"Pastore Tedesco",  km:3.4, sex:"M", verified:true,  mode:"social", img:"dog2.jpg", gallery:["dog2.jpg","dog2b.jpg","dog2c.jpg","dog2d.jpg"], mating:"no",  pedigree:"FCI",  microchip:"yes", vaccini:"yes", title:"adulto"},
    {id:"d3", name:"Maya",  age:3, breed:"Bulldog Francese", km:2.1, sex:"F", verified:false, mode:"love",   img:"dog3.jpg", gallery:["dog3.jpg","dog3b.jpg","dog3c.jpg","dog3d.jpg"], mating:"yes", pedigree:"",     microchip:"no",  vaccini:"no",  title:"adulto"},
    {id:"d4", name:"Rocky", age:5, breed:"Beagle",           km:4.0, sex:"M", verified:true,  mode:"social", img:"dog4.jpg", gallery:["dog4.jpg","dog4b.jpg","dog4c.jpg","dog4d.jpg"], mating:"yes", pedigree:"ENCI", microchip:"yes", vaccini:"yes", title:"campione"},
    {id:"d5", name:"Chicco",age:1, breed:"Barboncino",       km:0.8, sex:"M", verified:true,  mode:"love",   img:"dog1.jpg", gallery:["dog1.jpg","dog1b.jpg","dog1c.jpg","dog1d.jpg"], mating:"no",  pedigree:"",     microchip:"yes", vaccini:"yes", title:"cucciolo"},
    {id:"d6", name:"Kira",  age:6, breed:"Labrador",         km:5.1, sex:"F", verified:true,  mode:"social", img:"dog2.jpg", gallery:["dog2.jpg","dog2b.jpg","dog2c.jpg","dog2d.jpg"], mating:"yes", pedigree:"FCI",  microchip:"yes", vaccini:"yes", title:"adulto"},
  ];

  fetch("breeds.json").then(r=>r.json()).then(arr=>{ if(Array.isArray(arr)) state.breeds=arr; })
  .catch(()=>{ state.breeds=["Pastore Tedesco","Labrador","Golden Retriever","Jack Russell","Bulldog Francese","Barboncino","Border Collie","Chihuahua","Carlino","Beagle","Maltese","Shih Tzu","Husky","Bassotto","Cocker Spaniel"]; });

  if("geolocation" in navigator){
    navigator.geolocation.getCurrentPosition(
      p=>{ state.geo={lat:p.coords.latitude, lon:p.coords.longitude}; },
      ()=>{}, {enableHighAccuracy:true, timeout:5000, maximumAge:60000}
    );
  }

  // ---------- Home flow ----------
  if(state.entered){ homeScreen.classList.add("hidden"); appScreen.classList.remove("hidden"); setActive("nearby"); }
  btnEnter?.addEventListener("click", async()=>{
    // animazione leggera sul logo
    const hero=$("heroLogo"); hero && hero.classList.add("gold-pulse");
    await wait(800);
    state.entered=true; localStorage.setItem("entered","1");
    homeScreen.classList.add("hidden");
    appScreen.classList.remove("hidden");
    setActive("nearby");
  });
  btnLogin?.addEventListener("click", ()=>alert("Login (mock)"));
  btnRegister?.addEventListener("click", ()=>alert("Registrazione (mock)"));
  langToggle?.addEventListener("click", ()=>{ state.lang=state.lang==="it"?"en":"it"; localStorage.setItem("lang",state.lang); alert("Lingua: "+state.lang.toUpperCase()); });

  // ---------- Sponsor robusto (pre-open + reward) ----------
  [sponsorLink,sponsorLinkApp].forEach(a=>{
    a?.addEventListener("click",(e)=>{
      e.preventDefault();
      const url = t("sponsorUrl");
      let pre = window.open("", "_blank"); // non bloccato
      openRewardDialog("Video rapido prima di aprire lo sponsor", ()=>{ try{ pre&&(pre.location=url); }catch{ window.location.href=url; }});
    });
  });

  // ---------- Etico: canili ----------
  [ethicsButton, ethicsButtonApp].forEach(btn=>{
    btn?.addEventListener("click", ()=>{
      const url = mapsUrlFor("shelters");
      let pre = window.open("", "_blank");
      openRewardDialog("Video rapido prima di aprire i canili vicino a te", ()=>{ try{ pre&&(pre.location=url); }catch{ window.location.href=url; }});
    });
  });

  // ---------- Tabs ----------
  tabNearby?.addEventListener("click", ()=>setActive("nearby"));
  tabLove?.addEventListener("click",   ()=>setActive("love"));
  tabSocial?.addEventListener("click", ()=>setActive("social"));

  // Luoghi PET dropdown + click
  tabLuoghi?.addEventListener("click",(e)=>{
    e.stopPropagation();
    const dd=tabLuoghi.closest(".dropdown");
    const open = dd.classList.toggle("open");
    tabLuoghi.setAttribute("aria-expanded", open?"true":"false");
  });
  document.addEventListener("click", ()=>{
    tabLuoghi?.closest(".dropdown")?.classList.remove("open");
    tabLuoghi?.setAttribute("aria-expanded","false");
  });
  luoghiMenu?.querySelectorAll(".menu-item").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const url = mapsUrlFor(btn.dataset.cat);
      let pre = window.open("", "_blank");
      openRewardDialog("Video rapido prima di aprire Maps", ()=>{ try{ pre&&(pre.location=url); }catch{ window.location.href=url; }});
      tabLuoghi?.closest(".dropdown")?.classList.remove("open");
      tabLuoghi?.setAttribute("aria-expanded","false");
    });
  });

  // ---------- Back ----------
  btnBack?.addEventListener("click", ()=>{
    if(state.currentView!=="nearby"){ setActive("nearby"); return; }
    if(confirm("Tornare alla Home?")){
      state.entered=false; localStorage.removeItem("entered");
      appScreen.classList.add("hidden");
      homeScreen.classList.remove("hidden");
    }
  });

  // ---------- Views ----------
  function setActive(view){
    state.currentView=view;
    [viewNearby,viewLove,viewSocial].forEach(v=>v.classList.add("hidden"));
    [tabNearby,tabLove,tabSocial].forEach(t=>t.classList.remove("active"));

    if(view==="nearby"){ viewNearby.classList.remove("hidden"); tabNearby.classList.add("active"); renderNearby(); btnSearchPanel.disabled=false; }
    if(view==="love"){   viewLove.classList.remove("hidden");   tabLove.classList.add("active");   renderSwipe("love"); btnSearchPanel.disabled=true; }
    if(view==="social"){ viewSocial.classList.remove("hidden"); tabSocial.classList.add("active"); renderSwipe("social"); btnSearchPanel.disabled=true; }

    window.scrollTo({top:0, behavior:"smooth"});
  }

  // ---------- Nearby ----------
  function renderNearby(){
    const list = applyFilters();
    if(!list.length){ nearGrid.innerHTML = `<p class="soft" style="padding:12px">${t("noProfiles")}</p>`; return; }
    nearGrid.innerHTML = list.map(d=>`
      <article class="dog-card" data-id="${d.id}">
        <img src="${d.img}" alt="${d.name}">
        <div class="dog-name">${d.name} ${d.verified?"✅":""}</div>
      </article>`).join("");
    qa(".dog-card",nearGrid).forEach(c=>{
      const id=c.getAttribute("data-id");
      const dog=DOGS.find(x=>x.id===id);
      qs("img",c)?.addEventListener("click", ()=>openProfile(dog));
    });
  }
  function applyFilters(){
    const f=state.filters;
    let arr = DOGS
      .filter(d=>d.km<= (f.distKm||999))
      .filter(d=>!f.verified || d.verified)
      .filter(d=>!f.sex || d.sex===f.sex)
      .filter(d=>!f.breed || d.breed.toLowerCase().startsWith(f.breed.toLowerCase()));

    if(state.plus){
      if(f.mating)   arr=arr.filter(d=>d.mating===f.mating);
      if(f.pedigree) arr=arr.filter(d=>d.pedigree===f.pedigree);
      if(f.microchip)arr=arr.filter(d=>d.microchip===f.microchip);
      if(f.vaccini)  arr=arr.filter(d=>d.vaccini===f.vaccini);
      if(f.title)    arr=arr.filter(d=>d.title===f.title);
      // weight/height mock: skip (server side in real app)
    }
    return arr;
  }

  // ---------- Swipe ----------
  function renderSwipe(mode){
    const deck = DOGS.filter(d=>d.mode===mode);
    if(!deck.length){ (mode==="love"?viewLove:viewSocial).innerHTML="<p class='soft' style='padding:12px'>Nessun profilo.</p>"; return; }

    const idx = (mode==="love") ? state.curLove % deck.length : state.curSocial % deck.length;
    const d = deck[idx];

    const img   = (mode==="love")? loveImg : socialImg;
    const title = (mode==="love")? loveTitleTxt : socialTitleTxt;
    const meta  = (mode==="love")? loveMeta : socialMeta;
    const bio   = (mode==="love")? loveBio : socialBio;
    const card  = (mode==="love")? loveCard : socialCard;
    const yes   = (mode==="love")? loveYes : socialYes;
    const no    = (mode==="love")? loveNo  : socialNo;

    img.src=d.img; title.textContent=`${d.name} ${d.verified?"✅":""}`;
    meta.textContent=`${d.breed} · ${d.age} ${state.lang==="it"?"anni":"yrs"} · ${d.km.toFixed(1)} km`;
    bio.textContent=d.bio||"";
    img.onclick=()=>openProfile(d);

    attachSwipe(card, async(dir)=>{
      incrementSwipe(); if(dir==="right"){ maybeMatch(); }
      if(mode==="love"){ state.curLove++; localStorage.setItem("curLove",String(state.curLove)); }
      else { state.curSocial++; localStorage.setItem("curSocial",String(state.curSocial)); }
      await wait(10);
      renderSwipe(mode);
    });

    yes.onclick = ()=>simulateSwipe(card,"right");
    no.onclick  = ()=>simulateSwipe(card,"left");
  }

  // Evita che scorra tutta la pagina durante lo swipe
  let touchLock=false;
  function lockScroll(e){ if(touchLock) e.preventDefault(); }
  document.addEventListener('touchmove', lockScroll, {passive:false});

  function attachSwipe(card, cb){
    if(card._sw) return;
    card._sw=true;
    let sx=0, dx=0, dragging=false;

    const start=(x)=>{ sx=x; dragging=true; touchLock=true; card.style.transition="none"; };
    const move =(x)=>{ if(!dragging) return; dx=x-sx; const rot=dx/18; card.style.transform=`translate3d(${dx}px,0,0) rotate(${rot}deg)`; };
    const end =()=>{ if(!dragging) return; dragging=false; touchLock=false; card.style.transition="";
      const th=90;
      if(dx>th){ card.classList.add("swipe-out-right"); setTimeout(()=>{ resetCard(card); cb("right"); }, 550); }
      else if(dx<-th){ card.classList.add("swipe-out-left"); setTimeout(()=>{ resetCard(card); cb("left"); }, 550); }
      else { resetCard(card); }
      dx=0;
    };

    card.addEventListener("touchstart", e=>start(e.touches[0].clientX), {passive:true});
    card.addEventListener("touchmove",  e=>move(e.touches[0].clientX),  {passive:true});
    card.addEventListener("touchend", end);
    card.addEventListener("mousedown", e=>start(e.clientX));
    window.addEventListener("mousemove", e=>move(e.clientX));
    window.addEventListener("mouseup", end);
  }
  function resetCard(card){ card.classList.remove("swipe-out-right","swipe-out-left"); card.style.transform=""; }
  function simulateSwipe(card, dir){
    card.classList.add(dir==="right"?"swipe-out-right":"swipe-out-left");
    setTimeout(()=>{ resetCard(card); }, 560);
  }

  function incrementSwipe(){
    state.swipeCount++; localStorage.setItem("swipes", String(state.swipeCount));
    if(!state.plus){
      if(state.swipeCount===10 || (state.swipeCount>10 && (state.swipeCount-10)%5===0)){
        openRewardDialog("Video per continuare a fare swipe");
      }
    }
  }

  function maybeMatch(){
    if(Math.random()<0.55){
      state.matches++; localStorage.setItem("matches",String(state.matches));
      if(!state.plus && state.matches>=4){ openRewardDialog("Video per sbloccare il nuovo match"); }
      showMatchBurst();
    }
  }
  function showMatchBurst(){
    const n=document.createElement("div"); n.className="match-burst"; n.textContent="💛";
    document.body.appendChild(n); setTimeout(()=>n.remove(), 1200);
  }

  // ---------- Ricerca ----------
  btnSearchPanel?.addEventListener("click", ()=>searchPanel.classList.remove("hidden"));
  closeSearch?.addEventListener("click", ()=>searchPanel.classList.add("hidden"));

  distRange?.addEventListener("input", ()=> distLabel.textContent=`${distRange.value} km`);

  breedInput?.addEventListener("input", ()=>{
    const v=(breedInput.value||"").toLowerCase().trim();
    breedsList.innerHTML=""; breedsList.style.display="none";
    if(!v) return;
    const matches = (state.breeds||[]).filter(b=>b.toLowerCase().startsWith(v)).sort().slice(0,24);
    if(!matches.length) return;
    breedsList.innerHTML = matches.map(b=>`<div class="item">${b}</div>`).join("");
    breedsList.style.display="block";
    qa(".item",breedsList).forEach(it=>it.addEventListener("click",()=>{
      breedInput.value=it.textContent; breedsList.style.display="none";
    }));
  });
  document.addEventListener("click",(e)=>{ if(e.target!==breedInput && !breedsList.contains(e.target)) breedsList.style.display="none"; });

  onlyVerified?.addEventListener("change", ()=> state.filters.verified=!!onlyVerified.checked);
  sexFilter?.addEventListener("change", ()=> state.filters.sex=sexFilter.value||"");

  applyFilters?.addEventListener("click",(e)=>{
    e.preventDefault();
    const f=state.filters;
    f.breed=(breedInput.value||"").trim();
    f.distKm=parseInt(distRange.value||"5");
    f.verified=!!onlyVerified.checked;
    f.sex=sexFilter.value||"";
    if(state.plus){
      f.weight=(weightInput.value||"").trim();
      f.height=(heightInput.value||"").trim();
      f.pedigree=(pedigreeInput.value||"").trim();
      f.microchip=(microchipInput.value||"").trim();
      f.vaccini=(vacciniInput.value||"").trim();
      f.mating=(matingInput.value||"").trim();
      f.title=(titleInput.value||"").trim();
    }
    persistFilters(); renderNearby(); searchPanel.classList.add("hidden");
  });
  resetFilters?.addEventListener("click", ()=>{
    const f=state.filters;
    f.breed=""; f.distKm=5; f.verified=false; f.sex="";
    f.weight=""; f.height=""; f.pedigree=""; f.microchip=""; f.vaccini=""; f.mating=""; f.title="";
    breedInput.value=""; distRange.value=5; distLabel.textContent="5 km"; onlyVerified.checked=false; sexFilter.value="";
    if(state.plus){
      weightInput.value=""; heightInput.value=""; pedigreeInput.value=""; microchipInput.value=""; vacciniInput.value=""; matingInput.value=""; titleInput.value="";
    }
    persistFilters(); renderNearby();
  });
  function persistFilters(){
    const f=state.filters;
    localStorage.setItem("f_breed",f.breed);
    localStorage.setItem("f_distKm",String(f.distKm));
    localStorage.setItem("f_verified",f.verified?"1":"0");
    localStorage.setItem("f_sex",f.sex);
    localStorage.setItem("f_weight",f.weight);
    localStorage.setItem("f_height",f.height);
    localStorage.setItem("f_pedigree",f.pedigree);
    localStorage.setItem("f_microchip",f.microchip);
    localStorage.setItem("f_vaccini",f.vaccini);
    localStorage.setItem("f_mating",f.mating);
    localStorage.setItem("f_title",f.title);
  }

  // ---------- Profilo ----------
  window.openProfile=(dog)=>{
    profileSheet.classList.remove("hidden");
    setTimeout(()=>profileSheet.classList.add("show"),10);

    const selfieUnlocked=isSelfieUnlocked(dog.id);

    ppBody.innerHTML=`
      <div class="pp-hero"><img src="${dog.img}" alt="${dog.name}" style="width:100%;height:230px;object-fit:cover;border:3px solid #CDA434;border-radius:14px"></div>
      <div class="pp-head" style="display:flex;align-items:center;gap:.6rem;flex-wrap:wrap;margin:.3rem 0 .6rem 0">
        <h2 class="pp-name gold-text" style="margin:0">${dog.name} ${dog.verified?"✅":""}</h2>
        <div class="pp-badges" style="display:flex;gap:.4rem;align-items:center;flex-wrap:wrap">
          <span class="badge">Razza: ${dog.breed}</span>
          <span class="badge">Età: ${dog.age} ${state.lang==="it"?"anni":"yrs"}</span>
          <span class="badge">Distanza: ${dog.km.toFixed(1)} km</span>
          <span class="badge">Sesso: ${dog.sex==="M"?"Maschio":"Femmina"}</span>
        </div>
      </div>
      <div class="pp-meta soft">Profilo verificabile con documenti di cane e proprietario.</div>

      <h3 class="section-title">Galleria</h3>
      <div class="gallery">
        ${dog.gallery.map(src=>`<div class="ph"><img src="${src}" alt="${dog.name}"></div>`).join("")}
      </div>

      <h3 class="section-title">Selfie</h3>
      <div class="selfie ${selfieUnlocked?'unlocked':''}">
        <img class="img" src="${dog.gallery[0]}" alt="Selfie di ${dog.name}">
        <div class="over">
          <button id="unlockSelfie" class="btn small ${selfieUnlocked?'ghost':''}">${selfieUnlocked?'Sbloccato 24h':'Sblocca selfie'}</button>
          <button id="openSelfieFull" class="btn small" ${selfieUnlocked?"":"disabled"}>Apri</button>
        </div>
      </div>

      <div class="separator"></div>

      <h3 class="section-title">Impostazioni profilo</h3>
      <div class="pp-actions">
        <button id="btnDocsOwner" class="btn ghost small">Documenti proprietario (mock)</button>
        <button id="btnDocsDog"   class="btn ghost small">Documenti cane (mock)</button>
        <label class="badge">Disponibile per accoppiamento:
          <select id="ppMating" class="btn small" style="background:#2a1c3b;color:#fff;border:1px solid rgba(205,164,52,.35)">
            <option value="yes" ${dog.mating==="yes"?"selected":""}>Sì</option>
            <option value="no"  ${dog.mating==="no" ?"selected":""}>No</option>
          </select>
        </label>
        <button id="btnOpenChat" class="btn small">Apri chat</button>
      </div>
    `;

    $("btnDocsOwner").onclick = ()=>{ alert("Upload documenti proprietario (mock)"); dog.verified=true; renderNearby(); };
    $("btnDocsDog").onclick   = ()=>{ alert("Upload documenti cane (mock)"); dog.verified=true; renderNearby(); };
    $("ppMating").onchange    = (e)=>{ dog.mating=e.target.value; };

    $("btnOpenChat").onclick  = ()=>{ closeProfilePage(); setTimeout(()=>openChat(dog),180); };

    $("unlockSelfie").onclick= async()=>{
      if(!isSelfieUnlocked(dog.id)){
        await openRewardDialog("Video per sbloccare il selfie per 24h");
        state.selfieUntilByDog[dog.id]=Date.now()+24*60*60*1000;
        localStorage.setItem("selfieUntilByDog", JSON.stringify(state.selfieUntilByDog));
        openProfile(dog); // rerender
      }
    };
    $("openSelfieFull").onclick= ()=>{ if(isSelfieUnlocked(dog.id)) openSelfiePage(dog); };
  };
  window.closeProfilePage=()=>{ profileSheet.classList.remove("show"); setTimeout(()=>profileSheet.classList.add("hidden"),250); };

  function isSelfieUnlocked(id){ return Date.now() < (state.selfieUntilByDog[id]||0); }

  // ---------- Selfie fullscreen ----------
  function openSelfiePage(dog){
    state.currentDogForSelfie=dog;
    selfieFullImg.src=dog.gallery[0];
    selfieCaption.textContent=`Selfie di ${dog.name}`;
    const key=selfieKey(dog.id);
    selfieLikeCount.textContent=String(state.likesBySelfie[key]||0);
    selfiePage.classList.remove("hidden");
  }
  function closeSelfie(){ selfiePage.classList.add("hidden"); state.currentDogForSelfie=null; }
  selfieBack?.addEventListener("click", closeSelfie);
  selfieLike?.addEventListener("click", ()=>{
    const dog=state.currentDogForSelfie; if(!dog) return;
    const key=selfieKey(dog.id);
    const cur=state.likesBySelfie[key]||0;
    state.likesBySelfie[key]=cur+1;
    localStorage.setItem("likesBySelfie", JSON.stringify(state.likesBySelfie));
    selfieLikeCount.textContent=String(state.likesBySelfie[key]);
  });
  const selfieKey=(id)=>`selfieLike_${id}`;

  // ---------- Chat ----------
  function openChat(dog){
    chatPane.classList.remove("hidden"); setTimeout(()=>chatPane.classList.add("show"),10);
    chatPane.dataset.dogId=dog.id;
    chatList.innerHTML = `<div class="msg">Ciao ${dog.name}! 🐾</div>`;
    chatInput.value="";
  }
  function closeChat(){ chatPane.classList.remove("show"); setTimeout(()=>chatPane.classList.add("hidden"),250); }
  closeChatBtn?.addEventListener("click", closeChat);
  chatComposer?.addEventListener("submit", async(e)=>{
    e.preventDefault();
    const text=(chatInput.value||"").trim(); if(!text) return;
    const dogId = chatPane.dataset.dogId || "unknown";
    if(!state.plus && !state.firstMsgRewardByDog[dogId]){
      await openRewardDialog("Video per inviare il primo messaggio");
      state.firstMsgRewardByDog[dogId]=true;
      localStorage.setItem("firstMsgRewardByDog", JSON.stringify(state.firstMsgRewardByDog));
    }
    const bubble=document.createElement("div");
    bubble.className="msg me"; bubble.textContent=text;
    chatList.appendChild(bubble);
    chatInput.value="";
    chatList.scrollTop=chatList.scrollHeight;
  });

  // ---------- Plus ----------
  $("btnPlus")?.addEventListener("click", openPlusDialog);
  function openPlusDialog(){
    const panel=document.createElement("div");
    panel.className="panel";
    panel.innerHTML=`
      <div class="panel-inner" style="text-align:center">
        <h3 style="color:#CDA434">${t("plusTitle")}</h3>
        <p class="soft">${t("plusCopy")}</p>
        <button id="plOn" class="btn primary">${t("activateNow")}</button>
        <button id="plClose" class="btn ghost small" style="margin-top:.6rem">${t("close")}</button>
      </div>`;
    document.body.appendChild(panel);
    $("plOn").onclick=()=>{ state.plus=true; localStorage.setItem("plutoo_plus","1"); enableGoldInputs(); panel.remove(); alert("Plutoo Plus attivato!"); };
    $("plClose").onclick=()=> panel.remove();
  }
  function enableGoldInputs(){
    [weightInput,heightInput,pedigreeInput,microchipInput,vacciniInput,matingInput,titleInput].forEach(el=>{
      el?.removeAttribute("disabled");
      el?.closest(".f-lock") && (el.closest(".f-lock").style.opacity="1");
    });
  }

  // ---------- Reward dialog (mock) ----------
  function openRewardDialog(msg, onDone){
    if(state.plus){ onDone && onDone(); return; }
    const panel=document.createElement("div");
    panel.className="panel";
    panel.innerHTML=`
      <div class="panel-inner center" style="text-align:center">
        <h3 style="color:#CDA434">🎬 ${msg||t("watchVideo")}</h3>
        <p class="soft">Demo: non vengono caricati annunci reali.</p>
        <button id="rwStart" class="btn primary">Guarda ora</button>
      </div>`;
    document.body.appendChild(panel);
    $("rwStart").onclick=async()=>{
      qs(".panel-inner",panel).innerHTML=`<h3 style="color:#CDA434">${t("videoPlaying")}</h3>`;
      await wait(2200);
      panel.remove(); onDone && onDone();
    };
  }

  // ---------- Maps helper ----------
  function mapsUrlFor(cat){
    const q={
      vets:"veterinari per animali vicino a me",
      groomers:"toelettature per cani vicino a me",
      shops:"negozi animali vicino a me",
      parks:"parchi per cani vicino a me",
      trainers:"addestratori per cani vicino a me",
      shelters:t("mapsShelters")
    }[cat] || "servizi animali vicino a me";
    if(state.geo) return `geo:${state.geo.lat},${state.geo.lon}?q=${encodeURIComponent(q)}`;
    return `https://www.google.com/maps/search/${encodeURIComponent(q)}`;
  }

  // ---------- Init ----------
  function initUI(){
    breedInput.value=state.filters.breed;
    distRange.value=state.filters.distKm; distLabel.textContent=`${distRange.value} km`;
    onlyVerified.checked=!!state.filters.verified;
    sexFilter.value=state.filters.sex;

    if(state.plus){
      enableGoldInputs();
      weightInput.value=state.filters.weight;
      heightInput.value=state.filters.height;
      pedigreeInput.value=state.filters.pedigree;
      microchipInput.value=state.filters.microchip;
      vacciniInput.value=state.filters.vaccini;
      matingInput.value=state.filters.mating;
      titleInput.value=state.filters.title;
    }
    if(!state.plus){ adBanner && (adBanner.style.display="block"); } else { adBanner && (adBanner.style.display="none"); }
  }
  initUI();
  if(state.entered) setActive("nearby");

  // Service worker already registered in index
})();
