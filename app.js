/* Plutoo – app.js (build coerente) */

/* ========== DATASET (stesse foto ovunque) ========== */
const dogs = [
  {
    id: 1,
    name: "Rocky",
    age: 3,
    breed: "Labrador",
    distance: 1.6,
    sex: "M",
    size: "Grande",
    coat: "Corto",
    energy: "Alta",
    pedigree: true,
    online: true,
    verified: true,
    photos: ["./dog1.jpg"], // prima foto = cover, usata ovunque
    about: "Socievole, ama l’acqua e correre al parco.",
    zone: "Roma EUR"
  },
  {
    id: 2,
    name: "Luna",
    age: 1,
    breed: "Jack Russell",
    distance: 2.2,
    sex: "F",
    size: "Piccola",
    coat: "Corto",
    energy: "Alta",
    pedigree: false,
    online: true,
    verified: true,
    photos: ["./dog2.jpg"],
    about: "Curiosa e molto giocherellona.",
    zone: "Roma Monteverde"
  },
  {
    id: 3,
    name: "Milo",
    age: 1,
    breed: "Labrador",
    distance: 4.1,
    sex: "M",
    size: "Grande",
    coat: "Corto",
    energy: "Media",
    pedigree: false,
    online: true,
    verified: false,
    photos: ["./dog3.jpg"],
    about: "Cucciolo educato, ama gli altri cani.",
    zone: "Roma Appio"
  },
  {
    id: 4,
    name: "Max",
    age: 4,
    breed: "Golden Retriever",
    distance: 5.9,
    sex: "M",
    size: "Grande",
    coat: "Lungo",
    energy: "Media",
    pedigree: true,
    online: true,
    verified: false,
    photos: ["./dog4.jpg"],
    about: "Dolcissimo, perfetto per famiglie.",
    zone: "Roma Nomentana"
  }
];

/* ========== STATO ========== */
let view = "near"; // near | browse | match
let idxBrowse = 0; // indice per “Scorri”
const matches = new Set();
const filters = {
  breed: "",
  age: "",
  sex: "",
  size: "",
  coat: "",
  energy: "",
  pedigree: "",
  distance: ""
};

/* ========== HELPERS ========== */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const km = v => `${v.toFixed(1)} km`;
const pawBadge = verified => verified ? `<span title="Profilo verificato" style="color:#2563eb;margin-left:6px">🐾</span>` : "";

/* ========== FILTRI ========== */
function applyFilters(list) {
  return list.filter(d => {
    if (filters.breed && d.breed !== filters.breed) return false;

    if (filters.age) {
      const a = d.age;
      if (filters.age === "0-1" && !(a >= 0 && a <= 1)) return false;
      if (filters.age === "2-4" && !(a >= 2 && a <= 4)) return false;
      if (filters.age === "5-7" && !(a >= 5 && a <= 7)) return false;
      if (filters.age === "8+"  && !(a >= 8)) return false;
    }

    if (filters.sex && d.sex !== filters.sex) return false;
    if (filters.size && d.size !== filters.size) return false;
    if (filters.coat && d.coat !== filters.coat) return false;
    if (filters.energy && d.energy !== filters.energy) return false;
    if (filters.pedigree) {
      const need = filters.pedigree === "si";
      if (d.pedigree !== need) return false;
    }
    if (filters.distance) {
      const max = Number(filters.distance);
      if (!Number.isNaN(max) && d.distance > max) return false;
    }
    return true;
  });
}

function chipsFromFilters() {
  const map = {
    breed: v => `Razza: ${v}`,
    age: v => `Età: ${v}`,
    sex: v => (v === "M" ? "Maschio" : "Femmina"),
    size: v => `Taglia: ${v}`,
    coat: v => `Pelo: ${v}`,
    energy: v => `Energia: ${v}`,
    pedigree: v => (v === "si" ? "Pedigree: sì" : "Pedigree: no"),
    distance: v => `≤ ${v} km`
  };
  const chips = Object.entries(filters)
    .filter(([, v]) => v !== "" && v != null)
    .map(([k, v]) => `<button class="chip" data-chip="${k}">${map[k](v)} ✕</button>`);
  return chips.join("");
}

/* ========== RENDER ========== */
function render() {
  const cards = $("#cards");
  const countLabel = $("#countLabel");
  const chipsWrap = $("#activeChips");

  let list = dogs.slice();

  // vista
  if (view === "near") {
    list = list.filter(d => d.online).sort((a, b) => a.distance - b.distance);
    cards.classList.remove("deck");
    cards.classList.add("grid");
  }
  if (view === "browse") {
    cards.classList.remove("grid");
    cards.classList.add("deck");
  }
  if (view === "match") {
    list = list.filter(d => matches.has(d.id));
    cards.classList.remove("deck");
    cards.classList.add("grid");
  }

  // filtri
  list = applyFilters(list);

  // label conteggio
  countLabel.textContent = `Mostro ${list.length} cani`;

  // chips attive
  chipsWrap.innerHTML = chipsFromFilters();

  // rendering
  cards.innerHTML = "";

  if (view === "browse") {
    // singola scheda (tipo Tinder)
    if (list.length === 0) {
      cards.innerHTML = `<p class="count" style="opacity:.7">Nessun risultato qui.</p>`;
      return;
    }
    // teniamo idxBrowse dentro range
    if (idxBrowse >= list.length) idxBrowse = 0;
    const d = list[idxBrowse];

    const el = document.createElement("article");
    el.className = "card card-big";
    el.innerHTML = `
      <div class="pic">
        <img src="${d.photos[0]}" alt="Foto di ${d.name}">
        <span class="badge">${km(d.distance)}</span>
        ${d.online ? '<span class="dot"></span>' : ""}
      </div>
      <div class="body">
        <div class="name">${d.name}, ${d.age} ${pawBadge(d.verified)}</div>
        <div class="breed">${d.breed}</div>
        <div class="swipe-actions">
          <button class="btn-round btn-no" data-act="no" data-id="${d.id}" aria-label="No">
            <span class="emoji">🥲</span>
          </button>
          <button class="btn-round btn-yes" data-act="yes" data-id="${d.id}" aria-label="Mi piace">
            <span class="emoji">❤️</span>
          </button>
        </div>
      </div>
    `;
    // click su immagine -> profilo
    el.querySelector("img").addEventListener("click", () => openProfile(d.id));
    cards.appendChild(el);
    return;
  }

  // griglia (near/match)
  list.forEach(d => {
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <div class="pic">
        <img src="${d.photos[0]}" alt="Foto di ${d.name}">
        <span class="badge">${km(d.distance)}</span>
        ${d.online ? '<span class="dot"></span>' : ""}
      </div>
      <div class="body">
        <div class="name">${d.name}, ${d.age} ${pawBadge(d.verified)}</div>
        <div class="breed">${d.breed}</div>
        <div class="actions">
          <button class="btn-round btn-no" data-act="no" data-id="${d.id}" aria-label="No">
            <span class="emoji">🥲</span>
          </button>
          <button class="btn-round btn-yes" data-act="yes" data-id="${d.id}" aria-label="Mi piace">
            <span class="emoji">❤️</span>
          </button>
        </div>
      </div>
    `;
    card.querySelector("img").addEventListener("click", () => openProfile(d.id));
    cards.appendChild(card);
  });
}

/* ========== PROFILO (modale, nessun HTML da aggiungere) ========== */
function openProfile(id) {
  const d = dogs.find(x => x.id === id);
  if (!d) return;

  // rimuovi eventuale modale aperta
  closeProfile();

  const overlay = document.createElement("div");
  overlay.id = "dog-modal";
  overlay.style.cssText = `
    position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.35);
    display:flex;align-items:flex-start;justify-content:center;overflow:auto;padding:20px 12px;
  `;

  const sheet = document.createElement("div");
  sheet.style.cssText = `
    width:min(900px,100%);background:#fff;border-radius:20px;overflow:hidden;
    box-shadow:0 20px 50px rgba(0,0,0,.25);
  `;
  sheet.innerHTML = `
    <div style="position:relative">
      <img src="${d.photos[0]}" class="dphoto" alt="Foto di ${d.name}" style="width:100%;height:260px;object-fit:cover;display:block">
      <button id="dm-close" aria-label="Chiudi" style="position:absolute;top:10px;right:10px;background:#111827;opacity:.85;color:#fff;border:0;border-radius:12px;padding:8px 10px">✕</button>
    </div>
    <div class="dinfo" style="padding:16px">
      <h2 style="margin:0 0 6px 0;font-size:22px;font-weight:800">
        ${d.name}, ${d.age} ${pawBadge(d.verified)}
      </h2>
      <div class="dmeta" style="color:#6b7280;margin-bottom:8px">
        ${d.breed} · ${d.sex === "M" ? "Maschio" : "Femmina"} · ${d.size} · Pelo ${d.coat} · ${km(d.distance)}
      </div>
      <div class="drow"><strong>Energia:</strong> ${d.energy || "—"}</div>
      <div class="drow"><strong>Pedigree:</strong> ${d.pedigree ? "Sì" : "No"}</div>
      <div class="drow"><strong>Zona:</strong> ${d.zone || "—"}</div>
      <p style="margin:10px 0 0">${d.about || ""}</p>

      <div class="profile-actions" style="display:flex;gap:14px;margin-top:14px">
        <button class="btn-round btn-no" data-act="no" data-id="${d.id}" aria-label="No"><span class="emoji">🥲</span></button>
        <button class="btn-round btn-yes" data-act="yes" data-id="${d.id}" aria-label="Mi piace"><span class="emoji">❤</span></button>
      </div>
    </div>
  `;

  overlay.appendChild(sheet);
  document.body.appendChild(overlay);

  $("#dm-close", sheet).addEventListener("click", closeProfile);
  overlay.addEventListener("click", e => { if (e.target === overlay) closeProfile(); });

  // azioni like/no anche nel profilo
  sheet.addEventListener("click", e => {
    const btn = e.target.closest("button[data-act]");
    if (!btn) return;
    handleAction(btn.dataset.act, Number(btn.dataset.id), { from: "detail" });
  });
}

function closeProfile() {
  const el = $("#dog-modal");
  if (el) el.remove();
}

/* ========== AZIONI (like/skip) ========== */
function handleAction(act, id, ctx = {}) {
  const i = dogs.findIndex(d => d.id === id);
  if (i < 0) return;

  if (act === "yes") {
    matches.add(id);
    // animazione pulsante
    const btn = document.querySelector(`button[data-id="${id}"][data-act="yes"]`);
    if (btn) btn.animate(
      [{ transform: "scale(1)" }, { transform: "scale(1.12)" }, { transform: "scale(1)" }],
      { duration: 180 }
    );
  } else if (act === "no") {
    // simula “skippa”: manda il cane in fondo
    dogs.push(...dogs.splice(i, 1));
  }

  // se arriva dal profilo, chiudi
  if (ctx.from === "detail") closeProfile();

  if (view === "browse") {
    // vai al prossimo nel deck
    idxBrowse = (idxBrowse + 1) % applyFilters(dogs).length || 0;
  }

  render();
}

/* ========== EVENTI UI ========== */

// tabs
$$(".tab").forEach(t => {
  t.addEventListener("click", () => {
    $$(".tab").forEach(x => x.classList.remove("active"));
    t.classList.add("active");
    view = t.dataset.view;
    if (view !== "browse") idxBrowse = 0;
    render();
  });
});

// like / no nelle liste
$("#cards").addEventListener("click", e => {
  const btn = e.target.closest("button[data-act]");
  if (!btn) return;
  handleAction(btn.dataset.act, Number(btn.dataset.id));
});

// toggle pannello filtri
$("#filterToggle")?.addEventListener("click", () => {
  const p = $("#filterPanel");
  if (!p) return;
  p.hidden = !p.hidden;
});

// submit filtri
$("#filterForm")?.addEventListener("submit", e => {
  e.preventDefault();
  const fd = new FormData(e.currentTarget);
  Object.keys(filters).forEach(k => (filters[k] = (fd.get(k) || "").toString().trim()));
  idxBrowse = 0;
  $("#filterPanel").hidden = true;
  render();
});

// reset filtri
$("#filtersReset")?.addEventListener("click", () => {
  Object.keys(filters).forEach(k => (filters[k] = ""));
  $("#filterForm").reset();
  idxBrowse = 0;
  render();
});

// rimozione chip singolo
$("#activeChips").addEventListener("click", e => {
  const chip = e.target.closest("button[data-chip]");
  if (!chip) return;
  const key = chip.dataset.chip;
  filters[key] = "";
  // resettare anche campo nel form se presente
  const el = $(`[name="${key}"]`, $("#filterForm"));
  if (el) {
    if (el.tagName === "SELECT") el.value = "";
    else el.value = "";
  }
  render();
});

// geolocalizzazione (demo)
$("#locOn")?.addEventListener("click", () => alert("Posizione attivata (demo)."));
$("#locLater")?.addEventListener("click", () => alert("Ok, più tardi."));

/* ========== AVVIO ========== */
render();
