document.addEventListener("DOMContentLoaded", () => {
  const home = document.getElementById("home");
  const app = document.getElementById("app");
  const enterBtn = document.getElementById("enter-btn");
  const tabs = document.querySelectorAll(".tab");
  const contents = document.querySelectorAll(".tab-content");

  const nearbyDogsContainer = document.getElementById("nearby-dogs");
  const swipeContainer = document.getElementById("swipe-container");
  const matchDogsContainer = document.getElementById("match-dogs");

  // Dati fittizi
  const dogs = [
    { name: "Luna", age: 1, breed: "Jack Russell", distance: "2.2 km", img: "dog1.jpg" },
    { name: "Sofia", age: 5, breed: "Levriero Afgano", distance: "1.6 km", img: "dog2.jpg" },
    { name: "Rocky", age: 4, breed: "Meticcio", distance: "5.9 km", img: "dog3.jpg" },
    { name: "Maya", age: 3, breed: "Shiba Inu", distance: "3.2 km", img: "dog4.jpg" }
  ];

  let matches = [];

  // Mostra pagina app
  enterBtn.addEventListener("click", () => {
    home.classList.remove("active");
    app.classList.add("active");
    renderNearby();
    renderSwipe();
    renderMatches();
  });

  // Cambio tab
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      contents.forEach(c => c.classList.remove("active"));
      tab.classList.add("active");
      document.getElementById(tab.dataset.target).classList.add("active");
    });
  });

  // Render Vicino a te
  function renderNearby() {
    nearbyDogsContainer.innerHTML = "";
    dogs.forEach(dog => {
      const card = document.createElement("div");
      card.classList.add("dog-card");
      card.innerHTML = `
        <img src="${dog.img}" alt="${dog.name}">
        <div class="dog-info">
          <h3>${dog.name}, ${dog.age}</h3>
          <p>${dog.breed}</p>
          <p><strong>${dog.distance}</strong></p>
        </div>
        <div class="dog-actions">
          <button class="no">✖</button>
          <button class="yes">❤</button>
        </div>
      `;
      card.querySelector(".yes").addEventListener("click", () => addMatch(dog));
      nearbyDogsContainer.appendChild(card);
    });
  }

  // Render Swipe
  function renderSwipe() {
    swipeContainer.innerHTML = "";
    dogs.slice().reverse().forEach(dog => {
      const card = document.createElement("div");
      card.classList.add("swipe-card");
      card.innerHTML = `
        <img src="${dog.img}" alt="${dog.name}">
        <div class="dog-info">
          <h3>${dog.name}, ${dog.age}</h3>
          <p>${dog.breed} - <strong>${dog.distance}</strong></p>
        </div>
      `;
      card.addEventListener("click", () => addMatch(dog));
      swipeContainer.appendChild(card);
    });
  }

  // Render Matches
  function renderMatches() {
    matchDogsContainer.innerHTML = "";
    if (matches.length === 0) {
      matchDogsContainer.innerHTML = "<p>Nessun match ancora ❤️</p>";
      return;
    }
    matches.forEach(dog => {
      const card = document.createElement("div");
      card.classList.add("dog-card");
      card.innerHTML = `
        <img src="${dog.img}" alt="${dog.name}">
        <div class="dog-info">
          <h3>${dog.name}, ${dog.age}</h3>
          <p>${dog.breed}</p>
          <p><strong>${dog.distance}</strong></p>
        </div>
      `;
      matchDogsContainer.appendChild(card);
    });
  }

  // Aggiungi Match
  function addMatch(dog) {
    if (!matches.includes(dog)) {
      matches.push(dog);
      renderMatches();
    }
  }
});
