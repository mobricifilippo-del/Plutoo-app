/* Plutoo – app.js FULL
   - Vista: Vicino a te (griglia 2 colonne)
   - Vista: Scorri (una card, like/dislike animati)
   - Vista: Match (lista dei like)
   - Dettaglio cane a PAGINA INTERA (non overlay)
   - Nessuna modifica richiesta ad HTML/CSS
*/

(function () {
  // ---------- DATASET DEMO ----------
  const DOGS = [
    {
      id: "1",
      name: "Rocky",
      age: 3,
      breed: "Labrador",
      sex: "M",
      size: "Grande",
      coat: "Corto",
      energy: "Media",
      pedigree: "No",
      distanceKm: 1.6,
      zone: "Roma Trastevere",
      about: "Dolcissimo e bravo con i bambini.",
      photo: "./dog2.jpg", // (mantengo i tuoi file)
      verified: true,
    },
    {
      id: "2",
      name: "Luna",
      age: 1,
      breed: "Jack Russell",
      sex: "F",
      size: "Piccola",
      coat: "Pelo Corto",
      energy: "Alta",
      pedigree: "No",
      distanceKm: 2.2,
      zone: "Roma Monteverde",
      about: "Curiosa e molto giocherellona.",
      photo: "./dog1.jpg",
      verified: true,
    },
    {
      id: "3",
      name: "Milo",
      age: 1,
      breed: "Labrador",
      sex: "M",
      size: "Grande",
      coat: "Corto",
      energy: "Alta",
      pedigree: "No",
      distanceKm: 4.1,
      zone: "Roma Ostiense",
      about: "Ama l’acqua e correre al parco.",
      photo: "./dog1.jpg",
      verified: false,
    },
    {
      id: "4",
      name: "Max",
      age: 4,
      breed: "Golden Retriever",
      sex: "M",
      size: "Grande",
      coat: "Medio",
      energy: "Media",
      pedigree: "Sì",
      distanceKm: 5.9,
      zone: "Roma Appia",
      about: "Calmo e affettuoso con tutti.",
      photo: "./dog4.jpg",
      verified: false,
    },
  ];

  // ---------- RIFERIMENTI DOM ----------
  const home = document.getElementById("home");
  const list = document.getElementById("list");
  const cards = document.getElementById("cards");
  const countLabel = document.getElementById("countLabel");
  const tabs = document.querySelectorAll(".tab");

  // creeremo #detail quando serve (pagina intera)
  let detail = null;

  // stato
  const state = {
    view: "near", // near | browse | match
    dogs: DOGS.slice(),
    likeIds: new Set(),
    browseIndex: 0, // per Scorri
  };

  // ---------- UTILI ----------
  const paw = "🐾";
  const km = (n) => `${n.toFixed(1)} km`;
  const sexTxt = (s) => (s === "M" ? "Maschio" : "Femmina");

  function setCount(n) {
    if (countLabel) countLabel.textContent = `Mostro ${n} cani`;
  }

  // ---------- RENDER ----------
  function renderNear() {
    cards.className = "grid";
    setCount(state.dogs.length);
    cards.innerHTML = state.dogs
      .map((d) => cardHTML(d))
      .join("");
    attachCardEvents();
  }

  function renderBrowse() {
    // una sola card alla volta
    cards.className = "deck";
    setCount( state.dogs.length ? 1 : 0 );
    const d = state.dogs[state.browseIndex] || null;
    cards.innerHTML = d ? bigCardHTML(d) : `<p style="padding:16px">Nessun cane disponibile.</p>`;
    attachBrowseEvents();
  }

  function renderMatch() {
    cards.className = "grid";
    const liked = state.dogs.filter(d => state.likeIds.has(d.id));
    setCount(liked.length);
    cards.innerHTML = liked.length
      ? liked.map((d) => cardHTML(d)).join("")
      : `<p style="padding:16px">Nessun risultato qui.</p>`;
    attachCardEvents();
  }

  function render() {
    if (state.view === "near") renderNear();
    if (state.view === "browse") renderBrowse();
    if (state.view === "match") renderMatch();
  }

  // ---------- CARD TEMPLATES ----------
  function cardHTML(d) {
    return `
      <article class="card" data-id="${d.id}">
        <div class="pic">
          <img src="${d.photo}" alt="${d.name}" />
          <span class="badge">${km(d.distanceKm)}</span>
          <span class="dot"></span>
        </div>
        <div class="body">
          <div class="name">${d.name}, ${d.age} ${d.verified ? `<span title="Profilo verificato">${paw}</span>` : ""}</div>
          <div class="breed">${d.breed}</div>
          <div class="actions">
            <button class="btn-round btn-no" data-act="no"><span class="emoji">🙂‍↔️</span></button>
            <button class="btn-round btn-yes" data-act="yes"><span class="emoji">❤️</span></button>
          </div>
        </div>
      </article>`;
  }

  function bigCardHTML(d) {
    return `
      <article class="card card-big" data-id="${d.id}">
        <div class="pic">
          <img src="${d.photo}" alt="${d.name}" />
          <span class="badge">${km(d.distanceKm)}</span>
          <span class="dot"></span>
        </div>
        <div class="body">
          <div class="name">${d.name}, ${d.age} ${d.verified ? `<span title="Profilo verificato">${paw}</span>` : ""}</div>
          <div class="breed">${d.breed}</div>
          <div class="swipe-actions">
            <button class="btn-round btn-no" data-act="no"><span class="emoji">🙂‍↔️</span></button>
            <button class="btn-round btn-yes" data-act="yes"><span class="emoji">❤️</span></button>
          </div>
        </div>
      </article>`;
  }

  // ---------- DETTAGLIO A PAGINA INTERA ----------
  function ensureDetail() {
    if (detail) return;
    detail = document.createElement("section");
    detail.id = "detail";
    detail.className = "detail";
    detail.style.display = "none"; // controllata da JS
    document.body.appendChild(detail);
  }

  function showDetail(dogId) {
    const d = state.dogs.find(x => x.id === dogId);
    if (!d) return;

    ensureDetail();

    // riempiamo pagina intera
    detail.innerHTML = `
      <div class="dogsheet">
        <img class="dphoto" src="${d.photo}" alt="${d.name}">
        <div class="dinfo">
          <h2 class="name">${d.name}, ${d.age} ${d.verified ? `<span title="Profilo verificato">${paw}</span>` : ""}</h2>
          <div class="dmeta">
            ${d.breed} · ${sexTxt(d.sex)} · ${d.size} · ${d.coat} · ${km(d.distanceKm)}
          </div>
          <div class="drow"><strong>Energia:</strong> ${d.energy}</div>
          <div class="drow"><strong>Pedigree:</strong> ${d.pedigree}</div>
          <div class="drow"><strong>Zona:</strong> ${d.zone}</div>
          <p class="drow">${d.about}</p>
          <div class="profile-actions">
            <button class="chip" id="backToList">Indietro</button>
            <button class="chip chip-primary" id="likeFromDetail">❤️ Mi piace</button>
          </div>
        </div>
      </div>
    `;

    // mostra detail, nascondi home/list
    if (home) home.style.display = "none";
    if (list) list.style.display = "none";
    detail.style.display = "block";

    document.getElementById("backToList")?.addEventListener("click", hideDetail);
    document.getElementById("likeFromDetail")?.addEventListener("click", () => {
      state.likeIds.add(d.id);
      // piccolo feedback
      const btn = document.getElementById("likeFromDetail");
      btn.style.transform = "scale(1.08)";
      btn.style.transition = "transform 160ms ease";
      setTimeout(() => (btn.style.transform = "scale(1)"), 160);
    });
  }

  function hideDetail() {
    if (detail) detail.style.display = "none";
    if (list) list.style.display = "block";
    if (home) home.style.display = ""; // resta nascosta se siamo già nella lista
  }

  // ---------- EVENTI LISTA (griglia) ----------
  function attachCardEvents() {
    // click immagine → pagina intera dettaglio
    cards.querySelectorAll(".card .pic").forEach(pic => {
      pic.addEventListener("click", (e) => {
        const id = pic.closest(".card")?.getAttribute("data-id");
        if (id) showDetail(id);
      });
    });

    // like/dislike (nessuna animazione forte in griglia: solo feedback)
    cards.querySelectorAll(".card .btn-round").forEach(btn => {
      btn.addEventListener("click", () => {
        btn.style.transform = "scale(0.96)";
        btn.style.transition = "transform 120ms ease";
        setTimeout(() => (btn.style.transform = "scale(1)"), 120);
        const id = btn.closest(".card")?.getAttribute("data-id");
        if (btn.dataset.act === "yes" && id) state.likeIds.add(id);
      });
    });
  }

  // ---------- EVENTI SCORRI (deck) ----------
  function attachBrowseEvents() {
    const card = cards.querySelector(".card-big");
    if (!card) return;

    // click immagine → pagina intera
    card.querySelector(".pic")?.addEventListener("click", () => {
      const id = card.getAttribute("data-id");
      if (id) showDetail(id);
    });

    // pulsanti animati
    card.querySelectorAll(".btn-round").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = card.getAttribute("data-id");
        if (btn.dataset.act === "yes" && id) state.likeIds.add(id);

        // animazione swipe
        const dir = btn.dataset.act === "yes" ? 1 : -1;
        card.style.transition = "transform 260ms ease, opacity 260ms ease";
        card.style.transform = `translateX(${dir * 80}px) rotate(${dir * 4}deg)`;
        card.style.opacity = "0.2";

        setTimeout(() => {
          // passa al prossimo
          state.browseIndex = (state.browseIndex + 1) % state.dogs.length;
          renderBrowse();
        }, 260);
      });
    });
  }

  // ---------- TAB SWITCH ----------
  tabs.forEach((t) => {
    t.addEventListener("click", () => {
      tabs.forEach(x => x.classList.remove("active"));
      t.classList.add("active");
      const v = t.getAttribute("data-view");
      state.view = v;

      if (v === "browse") state.browseIndex = 0;

      render();
      // assicura che siamo nella pagina lista
      if (home) home.style.display = "none";
      if (list) list.style.display = "block";
      if (detail) detail.style.display = "none";
    });
  });

  // ---------- AVVIO ----------
  // Vista iniziale: Near
  renderNear();

  // se si entra con #list dall’home, non blocchiamo
  window.addEventListener("hashchange", () => {
    if (location.hash === "#list") {
      if (home) home.style.display = "none";
      if (list) list.style.display = "block";
      if (detail) detail.style.display = "none";
    }
  });
})();
/* ===== PATCH: toggle pannello "Ricerca personalizzata" (tendina) ===== */
(function(){
  var btn   = document.getElementById('filterToggle');
  var panel = document.getElementById('filterPanel');
  var form  = document.getElementById('filterForm');
  var reset = document.getElementById('filtersReset');
  if (!btn || !panel) return;

  // stile inline per l'animazione (senza toccare il CSS)
  panel.style.overflow = 'hidden';
  panel.style.transition = 'max-height 220ms ease';
  // stato iniziale: chiuso
  panel.hidden = true;
  panel.style.maxHeight = '0px';

  function openPanel(){
    panel.hidden = false;
    // calcola l'altezza reale e la anima
    requestAnimationFrame(function(){
      panel.style.maxHeight = panel.scrollHeight + 'px';
    });
  }
  function closePanel(){
    panel.style.maxHeight = '0px';
    // nasconde a fine animazione
    setTimeout(function(){ panel.hidden = true; }, 220);
  }

  var isOpen = false;
  btn.addEventListener('click', function(){
    if (isOpen) closePanel(); else openPanel();
    isOpen = !isOpen;
  });

  // Chiudi quando applichi o resetti i filtri
  if (form) form.addEventListener('submit', function(e){
    // il tuo handler principale farà già e.preventDefault(); qui solo chiudiamo
    closePanel(); isOpen = false;
  });
  if (reset) reset.addEventListener('click', function(){
    closePanel(); isOpen = false;
  });
})();
