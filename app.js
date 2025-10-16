/* =========================================================
   Plutoo — Gold addons (non invasivi)
   Conserva la tua logica; aggiunge i18n, sponsor link,
   interstitial mock, gating like, servizi Maps, UX micro.
   ======================================================= */

(function(){
  /* ---------------- i18n ---------------- */
  const I18N = {
    it:{
      tab_love:"Amore 🥲💛",
      tab_play:"Giochiamo insieme 🥲🐕",
      tab_plus:"Plus ⭐",
      tab_search:"Ricerca 🔍",
      tab_places:"Luoghi PET 🐾",
      tab_nearby:"Vicino a te",
      login:"Login",
      signup:"Registrati",
      enter:"ENTRA",
      sponsor_badge:"Sponsor ufficiale",
      sponsor_title:"Fido",
      sponsor_sub:"Il gelato per i nostri amici a quattro zampe",
      sponsor_url:"https://www.fido.it/",
      ethic_cta:"Non abbandonare mai i tuoi amici 🐾 (canili vicino a me)",
      plus_1:"Rimuove tutti gli annunci",
      plus_2:"Filtri Gold e funzioni Premium",
      plus_3:"Supporto prioritario",
      plus_buy:"Attiva €39,90/anno",
      f_breed:"Razza", f_sex:"Sesso", f_verified:"Badge verificato Gold",
      any:"Qualsiasi", male:"Maschio", female:"Femmina",
      svc_vet:"Veterinari", svc_groom:"Toelettature", svc_shop:"Negozi",
      svc_parks:"Parchi", svc_train:"Addestratori", svc_shelter:"Canili",
      likes_title:"Like ricevuti",
      likes_free_left:"Like gratuiti rimasti: {n}",
      likes_unlock:"Guarda un video per sbloccare altri like",
    },
    en:{
      tab_love:"Love 🥲💛",
      tab_play:"Play together 🥲🐕",
      tab_plus:"Gold ⭐",
      tab_search:"Search 🔍",
      tab_places:"PET places 🐾",
      tab_nearby:"Nearby",
      login:"Login",
      signup:"Sign up",
      enter:"ENTER",
      sponsor_badge:"Official sponsor",
      sponsor_title:"Fido",
      sponsor_sub:"Ice cream for our four-legged friends",
      sponsor_url:"https://www.fido.it/",
      ethic_cta:"Never abandon your friends 🐾 (shelters near me)",
      plus_1:"Removes all ads",
      plus_2:"Gold filters & Premium features",
      plus_3:"Priority support",
      plus_buy:"Activate €39.90/year",
      f_breed:"Breed", f_sex:"Sex", f_verified:"Gold verified badge",
      any:"Any", male:"Male", female:"Female",
      svc_vet:"Veterinarians", svc_groom:"Groomers", svc_shop:"Pet shops",
      svc_parks:"Dog parks", svc_train:"Dog trainers", svc_shelter:"Animal shelters",
      likes_title:"Likes received",
      likes_free_left:"Free likes left: {n}",
      likes_unlock:"Watch a video to unlock more likes",
    }
  };

  const stored = localStorage.getItem("pl_lang");
  const browserIT = (navigator.language||"").toLowerCase().startsWith("it");
  const lang = stored || (browserIT ? "it" : "en");

  function t(key, vars={}){
    const str = (I18N[lang] && I18N[lang][key]) || key;
    return str.replace(/\{(\w+)\}/g, (_,k)=> vars[k] ?? "");
  }

  function applyI18n(){
    document.querySelectorAll("[data-i18n]").forEach(el=>{
      const key = el.getAttribute("data-i18n");
      if (I18N[lang] && I18N[lang][key]) el.textContent = I18N[lang][key];
    });
  }

  document.getElementById("lang-it")?.addEventListener("click", ()=>{ localStorage.setItem("pl_lang","it"); location.reload(); });
  document.getElementById("lang-en")?.addEventListener("click", ()=>{ localStorage.setItem("pl_lang","en"); location.reload(); });

  applyI18n();

  /* ----------- Router minimale (non invade il tuo) ----------- */
  function $(s, c=document){ return c.querySelector(s); }
  function $$(s, c=document){ return Array.from(c.querySelectorAll(s)); }

  window.show = function(view){
    const id = "view-" + view;
    $$(".view").forEach(v=>{
      if (v.id === id){ v.classList.add("view-active"); v.removeAttribute("hidden"); }
      else { v.classList.remove("view-active"); v.setAttribute("hidden",""); }
    });
    window.scrollTo({top:0, behavior:"smooth"});
    if (view === "nearby") ensureNearbyGrid();
  };

  document.addEventListener("click", (e)=>{
    const b = e.target.closest("[data-view]");
    if (b && b.dataset.view){ e.preventDefault(); show(b.dataset.view); }
  });

  $("#btnEnter")?.addEventListener("click", ()=> show("nearby"));

  /* ----------- Sponsor Fido link centralizzato ----------- */
  function openFido(){ window.open(I18N[lang].sponsor_url, "_blank", "noopener"); }
  $("#sponsorFido")?.addEventListener("click", openFido);
  $$(".sponsor-inline").forEach(s => s.addEventListener("click", openFido));

  /* ----------- CTA etica → Google Maps ----------- */
  function openShelters(){
    const q = lang==="it" ? "canili vicino a me" : "animal shelters near me";
    window.open("https://www.google.com/maps/search/"+encodeURIComponent(q), "_blank", "noopener");
  }
  $$(".ethic-cta").forEach(b => b.addEventListener("click", openShelters));

  /* ----------- Interstitial “Videomatch” (mock) ----------- */
  function showInterstitial(title="Videomatch"){
    const dlg = document.getElementById("rewardDialog");
    dlg.innerHTML = `
      <div style="padding:18px;max-width:340px">
        <h3 style="margin:0 0 8px">${title}</h3>
        <p style="opacity:.85;margin:0 0 14px">Video pubblicitario…</p>
        <button class="btn btn-gold" id="vmok">Chiudi</button>
      </div>`;
    dlg.showModal();
    dlg.querySelector("#vmok").addEventListener("click", ()=> dlg.close());
  }

  // Hook non invasivo: se il tuo codice chiama window.onMatch, qui iniettiamo l’interstitial
  const _onMatch = window.onMatch;
  window.onMatch = function(...args){
    try{ showInterstitial("Videomatch"); }catch(e){}
    if (typeof _onMatch === "function") _onMatch.apply(this, args);
  };

  /* ----------- Like ricevuti: 3 gratis, poi reward ----------- */
  const LIKES_KEY = "pl_free_likes_left";
  if (localStorage.getItem(LIKES_KEY) == null) localStorage.setItem(LIKES_KEY, "3");

  function showRewardVideo(){
    return new Promise(resolve=>{
      const dlg = document.getElementById("rewardDialog");
      dlg.innerHTML = `
        <div style="padding:18px;max-width:360px">
          <h3 style="margin:0 0 8px">Reward</h3>
          <p style="opacity:.85;margin:0 0 14px">${t("likes_unlock")}</p>
          <button class="btn btn-gold" id="rwok">Guarda</button>
        </div>`;
      dlg.showModal();
      dlg.querySelector("#rwok").addEventListener("click", ()=>{ dlg.close(); resolve(); });
    });
  }

  // Se hai un bottone o voce per “Like ricevuti”, aggancia questo id:
  // <button id="btnViewLikes">Like</button>
  $("#btnViewLikes")?.addEventListener("click", async ()=>{
    let left = parseInt(localStorage.getItem(LIKES_KEY)||"0",10);
    if (left > 0){
      left -= 1; localStorage.setItem(LIKES_KEY, String(left));
      alert( t("likes_title") + "\n" + t("likes_free_left",{n:left}) );
    } else {
      await showRewardVideo();
      localStorage.setItem(LIKES_KEY, "1");
      alert( t("likes_title") + "\n" + t("likes_free_left",{n:1}) );
    }
  });

  /* ----------- Luoghi PET: reward → Google Maps ----------- */
  const svcEN = { veterinari:"veterinarians", toelettature:"groomers", negozi:"pet shops", parchi:"dog parks", addestratori:"dog trainers", canili:"animal shelters" };
  $$(".dropdown-item").forEach(btn=>{
    btn.addEventListener("click", async ()=>{
      await showRewardVideo();
      const k = btn.dataset.service;
      const q = lang==="it" ? k : (svcEN[k] || k);
      window.open("https://www.google.com/maps/search/"+encodeURIComponent(q+" near me"), "_blank", "noopener");
    });
  });

  /* ----------- UX micro ----------- */
  const swipeArea = $("#swipeArea");
  if (swipeArea){
    let swiping = false;
    swipeArea.addEventListener("touchstart", ()=>{ swiping = true; }, {passive:true});
    swipeArea.addEventListener("touchend",   ()=>{ swiping = false; }, {passive:true});
    window.addEventListener("touchmove", (e)=>{ if (swiping) e.preventDefault(); }, {passive:false});
  }
  $("#btnLike")?.addEventListener("click", ()=> navigator.vibrate?.(20));
  $("#btnDislike")?.addEventListener("click", ()=> navigator.vibrate?.(10));

  /* ----------- Nearby grid demo (non altera il tuo fetch) ----------- */
  const demoDogs = [
    { id:1, name:"Luna",  breed:"Labrador",         age:3, img:"./dog1.jpg" },
    { id:2, name:"Rocky", breed:"Bulldog",          age:4, img:"./dog2.jpg" },
    { id:3, name:"Milo",  breed:"Golden Retriever", age:2, img:"./dog3.jpg" },
    { id:4, name:"Bella", breed:"Barboncino",       age:1, img:"./dog4.jpg" }
  ];
  function ensureNearbyGrid(){
    const grid = $("#nearbyGrid"); if (!grid || grid.children.length) return;
    demoDogs.forEach(d=>{
      const card = document.createElement("div");
      card.className = "card frame-gold";
      card.innerHTML =
        `<div class="card-photo"><img src="${d.img}" alt="${d.name}"></div>
         <div class="card-info small"><div><strong>${d.name}</strong>, ${d.age}</div><div>${d.breed}</div></div>`;
      grid.appendChild(card);
    });
  }

  /* ----------- “Vicino a te” nascosto finché non c’è login ----------- */
  const nearTab = $("#tab-nearby");
  function hideNearby(){ if (nearTab) nearTab.style.display = "none"; }
  function showNearby(){ if (nearTab) nearTab.style.display = ""; }
  hideNearby();

  $("#btnLogin")?.addEventListener("click", ()=>{
    // Qui parte la tua view di login; al completamento reale chiama showNearby()
    showNearby();
  });

  // Avvio: mostra Home già attiva
  // (Se hai un tuo router, questo non lo tocca.)
})();
