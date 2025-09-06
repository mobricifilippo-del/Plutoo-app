// ======= DATI DEMO (una sola foto per cane) =======
const DOGS = [
  { id: 1, name: "Luna",  age: 1, breed: "Jack Russell", img: "dog4.jpg", distKm: 2.2, online: true },
  { id: 2, name: "Sofia", age: 5, breed: "Levriero Afgano", img: "dog1.jpg", distKm: 1.6, online: true },
  { id: 3, name: "Rocky", age: 4, breed: "Meticcio", img: "dog3.jpg", distKm: 5.9, online: true },
  { id: 4, name: "Maya",  age: 3, breed: "Shiba Inu", img: "dog2.jpg", distKm: 3.2, online: true },
];

const state = {
  view: "nearby",      // nearby | swipe | matches
  dogs: [...DOGS],
  liked: new Set(),
  swipeIndex: 0,
};

// ======= ELEMENTI =======
const home      = document.getElementById("home");
const app       = document.getElementById("app");
const enterBtn  = document.getElementById("enterBtn");

const tabs      = document.querySelectorAll(".tab");
const nearbyView= document.getElementById("nearbyView");
const swipeView = document.getElementById("swipeView");
const matchesView = document.getElementById("matchesView");

const nearbyGrid= document.getElementById("nearbyGrid");
const matchList = document.getElementById("matchList");
const matchEmpty= document.getElementById("matchEmpty");

const swipeCard = document.getElementById("swipeCard");
const swipeImg  = document.getElementById("swipeImg");
const swipeName = document.getElementById("swipeName");
const swipeAge  = document.getElementById("swipeAge");
const swipeBreed= document.getElementById("swipeBreed");
const swipeDist = document.getElementById("swipeDist");
const swipeEmpty= document.getElementById("swipeEmpty");

const btnNo  = document.getElementById("btnNo");
const btnYes = document.getElementById("btnYes");

const geoBanner = document.getElementById("geoBanner");
document.getElementById("geoOn").onclick = () => { geoBanner.classList.add("hidden"); };
document.getElementById("geoLater").onclick = () => { geoBanner.classList.add("hidden"); };

// ======= NAVIGAZIONE =======
enterBtn.addEventListener("click", () => {
  home.classList.add("hidden");
  app.classList.remove("hidden");
  setView("nearby");
});

tabs.forEach(t => t.addEventListener("click", () => {
  setView(t.dataset.view);
}));

function setView(view){
  state.view = view;
  tabs.forEach(t => t.classList.toggle("active", t.dataset.view === view));
  nearbyView.classList.toggle("hidden", view !== "nearby");
  swipeView.classList.toggle("hidden", view !== "swipe");
  matchesView.classList.toggle("hidden", view !== "matches");

  if(view === "nearby") renderNearby();
  if(view === "swipe")  showCurrentSwipe();
  if(view === "matches") renderMatches();
}

// ======= VICINO A TE (griglia, 1 foto per cane) =======
function renderNearby(){
  nearbyGrid.innerHTML = "";
  state.dogs.forEach(d => {
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <img class="photo" src="${d.img}" alt="${d.name}" />
      <div class="body">
        <div class="title">${d.name}, ${d.age}</div>
        <div class="sub">${d.breed}</div>
        <div class="row">
          <div style="display:flex;align-items:center;gap:10px;">
            <span class="badge" title="online"></span>
            <span style="color:#6c45ff;font-weight:900">${d.distKm.toFixed(1)} km</span>
          </div>
          <div style="display:flex;gap:10px;">
            <button class="btn-circle danger" aria-label="No" onclick="dislike(${d.id})">✖</button>
            <button class="btn-circle success" aria-label="Like" onclick="like(${d.id})">❤</button>
          </div>
        </div>
      </div>
    `;
    nearbyGrid.appendChild(card);
  });
}

// ======= SWIPE (card singola) =======
function currentDog(){
  return state.dogs[state.swipeIndex] || null;
}

function showCurrentSwipe(){
  const d = currentDog();
  if(!d){
    swipeCard.classList.add("hidden");
    swipeEmpty.classList.remove("hidden");
    return;
  }
  swipeEmpty.classList.add("hidden");
  swipeCard.classList.remove("hidden");
  swipeImg.src = d.img;
  swipeName.textContent = d.name;
  swipeAge.textContent = `· ${d.age}`;
  swipeBreed.textContent = d.breed;
  swipeDist.textContent = `${d.distKm.toFixed(1)} km • online`;
}

btnNo.addEventListener("click", () => {
  // passa al prossimo senza like
  state.swipeIndex = Math.min(state.swipeIndex + 1, state.dogs.length);
  showCurrentSwipe();
});

btnYes.addEventListener("click", () => {
  const d = currentDog();
  if (d) state.liked.add(d.id);
  state.swipeIndex = Math.min(state.swipeIndex + 1, state.dogs.length);
  showCurrentSwipe();
});

// Per sicurezza espongo queste per i bottoni della griglia
window.like = (id) => { state.liked.add(id); };
window.dislike = (id) => { /* no-op demo */ };

// ======= MATCH =======
function renderMatches(){
  const likedDogs = state.dogs.filter(d => state.liked.has(d.id));
  matchList.innerHTML = "";
  matchEmpty.style.display = likedDogs.length ? "none" : "block";
  likedDogs.forEach(d => {
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <img class="photo" src="${d.img}" alt="${d.name}" />
      <div class="body">
        <div class="title">${d.name}, ${d.age}</div>
        <div class="sub">${d.breed}</div>
        <div class="row">
          <span style="color:#6c45ff;font-weight:900">${d.distKm.toFixed(1)} km</span>
          <span>❤ Match</span>
        </div>
      </div>
    `;
    matchList.appendChild(card);
  });
}

// ======= AVVIO =======
renderNearby();
