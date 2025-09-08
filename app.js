const dogs = [
  { name: "Luna", age: 1, breed: "Jack Russell", distance: "2.2 km", img: "dog1.jpg" },
  { name: "Sofia", age: 5, breed: "Levriero Afgano", distance: "1.6 km", img: "dog2.jpg" },
  { name: "Rocky", age: 4, breed: "Meticcio", distance: "5.9 km", img: "dog3.jpg" },
  { name: "Maya", age: 3, breed: "Shiba Inu", distance: "3.2 km", img: "dog4.jpg" }
];

let matches = [];

// Navigazione schermate
function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

// HOME -> NEARBY
document.getElementById("enterBtn").addEventListener("click", () => {
  showScreen("nearby");
  renderDogList();
});

// Tabs
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    showScreen(btn.dataset.tab);
    if (btn.dataset.tab === "nearby") renderDogList();
    if (btn.dataset.tab === "swipe") renderSwipe();
    if (btn.dataset.tab === "match") renderMatch();
  });
});

// Lista cani
function renderDogList() {
  const container = document.getElementById("dogList");
  container.innerHTML = "";
  dogs.forEach(dog => {
    const card = document.createElement("div");
    card.className = "dog-card";
    card.innerHTML = `
      <img src="${dog.img}" alt="${dog.name}">
      <div class="info">
        <h3>${dog.name}, ${dog.age}</h3>
        <p>${dog.breed}</p>
        <p class="distance">${dog.distance}</p>
      </div>
      <div class="actions">
        <button class="dislike">✖</button>
        <button class="like">❤</button>
      </div>
    `;
    card.querySelector(".like").addEventListener("click", () => {
      if (!matches.includes(dog)) {
        matches.push(dog);
      }
      alert(`Hai messo ❤ a ${dog.name}`);
    });
    container.appendChild(card);
  });
}

// Swipe singolo
function renderSwipe() {
  const container = document.getElementById("swipeContainer");
  container.innerHTML = "";
  dogs.forEach(dog => {
    const card = document.createElement("div");
    card.className = "swipe-card";
    card.innerHTML = `
      <img src="${dog.img}" alt="${dog.name}">
      <div class="info">
        <h3>${dog.name}, ${dog.age}</h3>
        <p>${dog.breed}</p>
        <p class="distance">${dog.distance}</p>
      </div>
      <div class="actions">
        <button class="dislike">✖</button>
        <button class="like">❤</button>
      </div>
    `;
    card.querySelector(".like").addEventListener("click", () => {
      if (!matches.includes(dog)) {
        matches.push(dog);
      }
      alert(`Hai messo ❤ a ${dog.name}`);
    });
    container.appendChild(card);
  });
}

// Match
function renderMatch() {
  const container = document.getElementById("matchList");
  container.innerHTML = "";
  if (matches.length === 0) {
    container.innerHTML = "<p>Nessun match ancora. Metti qualche ❤!</p>";
  } else {
    matches.forEach(dog => {
      const card = document.createElement("div");
      card.className = "dog-card";
      card.innerHTML = `
        <img src="${dog.img}" alt="${dog.name}">
        <div class="info">
          <h3>${dog.name}, ${dog.age}</h3>
          <p>${dog.breed}</p>
          <p class="distance">${dog.distance}</p>
        </div>
      `;
      container.appendChild(card);
    });
  }
}
