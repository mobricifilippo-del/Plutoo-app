document.addEventListener("DOMContentLoaded", () => {
  const home = document.getElementById("home");
  const app = document.getElementById("app");
  const enterBtn = document.getElementById("enterBtn");

  const nearbyBtn = document.getElementById("nearbyBtn");
  const swipeBtn = document.getElementById("swipeBtn");
  const matchBtn = document.getElementById("matchBtn");
  const contentArea = document.getElementById("contentArea");

  // Dati cani finti
  const dogs = [
    { name: "Luna", age: 1, breed: "Jack Russell", distance: "2.2 km", img: "dog1.jpg" },
    { name: "Sofia", age: 5, breed: "Levrier Afghano", distance: "1.6 km", img: "dog2.jpg" },
    { name: "Rocky", age: 4, breed: "Meticcio", distance: "5.9 km", img: "dog3.jpg" },
    { name: "Maya", age: 3, breed: "Shiba Inu", distance: "3.2 km", img: "dog4.jpg" }
  ];

  let matches = [];

  // Funzione per mostrare cani vicini
  function renderNearby() {
    contentArea.innerHTML = `
      <div class="dog-grid">
        ${dogs.map(dog => `
          <div class="dog-card">
            <img src="${dog.img}" alt="${dog.name}">
            <div class="info">
              <h3>${dog.name}, ${dog.age}</h3>
              <p>${dog.breed}</p>
              <p><b>${dog.distance}</b></p>
            </div>
            <div class="actions">
              <button class="no">✖</button>
              <button class="yes">❤</button>
            </div>
          </div>
        `).join("")}
      </div>
    `;

    document.querySelectorAll(".yes").forEach((btn, i) => {
      btn.addEventListener("click", () => {
        matches.push(dogs[i]);
        alert(`${dogs[i].name} aggiunto ai match!`);
      });
    });
  }

  // Funzione per mostrare match
  function renderMatch() {
    if (matches.length === 0) {
      contentArea.innerHTML = `<p>Ancora nessun match ❤️</p>`;
    } else {
      contentArea.innerHTML = `
        <div class="dog-grid">
          ${matches.map(dog => `
            <div class="dog-card">
              <img src="${dog.img}" alt="${dog.name}">
              <div class="info">
                <h3>${dog.name}, ${dog.age}</h3>
                <p>${dog.breed}</p>
                <p><b>${dog.distance}</b></p>
              </div>
            </div>
          `).join("")}
        </div>
      `;
    }
  }

  // Eventi
  enterBtn.addEventListener("click", () => {
    home.classList.add("hidden");
    app.classList.remove("hidden");
    renderNearby();
  });

  nearbyBtn.addEventListener("click", () => {
    renderNearby();
    nearbyBtn.classList.add("active");
    swipeBtn.classList.remove("active");
    matchBtn.classList.remove("active");
  });

  swipeBtn.addEventListener("click", () => {
    renderNearby(); // per ora simile ai vicini
    swipeBtn.classList.add("active");
    nearbyBtn.classList.remove("active");
    matchBtn.classList.remove("active");
  });

  matchBtn.addEventListener("click", () => {
    renderMatch();
    matchBtn.classList.add("active");
    swipeBtn.classList.remove("active");
    nearbyBtn.classList.remove("active");
  });
});
