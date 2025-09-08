// Cane demo
const dogs = [
  { name: "Luna", age: 1, breed: "Jack Russell", distance: "2.2 km", img: "dog1.jpg" },
  { name: "Sofia", age: 5, breed: "Levriero Afgano", distance: "1.6 km", img: "dog2.jpg" },
  { name: "Rocky", age: 4, breed: "Meticcio", distance: "5.9 km", img: "dog3.jpg" },
  { name: "Maya", age: 3, breed: "Shiba Inu", distance: "3.2 km", img: "dog4.jpg" }
];

let matches = [];

// elementi
const homePage = document.getElementById("home");
const appPage = document.getElementById("app");
const enterBtn = document.getElementById("enterBtn");

const nearbyBtn = document.getElementById("nearbyBtn");
const swipeBtn = document.getElementById("swipeBtn");
const matchBtn = document.getElementById("matchBtn");

const nearby = document.getElementById("nearby");
const swipe = document.getElementById("swipe");
const matchesSection = document.getElementById("matches");

const dogsContainer = document.getElementById("dogsContainer");
const swipeContainer = document.getElementById("swipeContainer");
const matchesContainer = document.getElementById("matchesContainer");

// entra nell'app
enterBtn.addEventListener("click", () => {
  homePage.classList.add("hidden");
  appPage.classList.remove("hidden");
  renderDogs();
  renderSwipe();
});

// tabs
function switchTab(tab) {
  [nearbyBtn, swipeBtn, matchBtn].forEach(b => b.classList.remove("active"));
  [nearby, swipe, matchesSection].forEach(s => s.classList.add("hidden"));

  if (tab === "nearby") {
    nearbyBtn.classList.add("active");
    nearby.classList.remove("hidden");
  } else if (tab === "swipe") {
    swipeBtn.classList.add("active");
    swipe.classList.remove("hidden");
  } else {
    matchBtn.classList.add("active");
    matchesSection.classList.remove("hidden");
    renderMatches();
  }
}

nearbyBtn.addEventListener("click", () => switchTab("nearby"));
swipeBtn.addEventListener("click", () => switchTab("swipe"));
matchBtn.addEventListener("click", () => switchTab("matches"));

// render
function renderDogs() {
  dogsContainer.innerHTML = "";
  dogs.forEach(dog => {
    const card = document.createElement("div");
    card.classList.add("dog-card");
    card.innerHTML = `
      <img src="${dog.img}" alt="${dog.name}">
      <div class="dog-info"><b>${dog.name}, ${dog.age}</b><br>${dog.breed}<br><span style="color:#6b3cff">${dog.distance}</span></div>
      <div class="dog-actions">
        <button class="dislike">✖</button>
        <button class="like">❤</button>
      </div>
    `;
    card.querySelector(".like").addEventListener("click", () => addMatch(dog));
    dogsContainer.appendChild(card);
  });
}

function renderSwipe() {
  swipeContainer.innerHTML = "";
  dogs.forEach(dog => {
    const card = document.createElement("div");
    card.classList.add("dog-card");
    card.innerHTML = `
      <img src="${dog.img}" alt="${dog.name}">
      <div class="dog-info"><b>${dog.name}, ${dog.age}</b><br>${dog.breed}<br><span style="color:#6b3cff">${dog.distance}</span></div>
      <div class="dog-actions">
        <button class="dislike">✖</button>
        <button class="like">❤</button>
      </div>
    `;
    card.querySelector(".like").addEventListener("click", () => addMatch(dog));
    swipeContainer.appendChild(card);
  });
}

function addMatch(dog) {
  if (!matches.includes(dog)) {
    matches.push(dog);
  }
}

function renderMatches() {
  matchesContainer.innerHTML = "";
  if (matches.length === 0) {
    matchesContainer.innerHTML = "<p>Ancora nessun match ❤️</p>";
  } else {
    matches.forEach(dog => {
      const card = document.createElement("div");
      card.classList.add("dog-card");
      card.innerHTML = `
        <img src="${dog.img}" alt="${dog.name}">
        <div class="dog-info"><b>${dog.name}, ${dog.age}</b><br>${dog.breed}</div>
      `;
      matchesContainer.appendChild(card);
    });
  }
}
