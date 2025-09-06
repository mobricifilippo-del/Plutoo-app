// Lista dei cani (profili demo)
const dogs = [
  {
    name: "Luna",
    age: 1,
    breed: "Jack Russell",
    dist: "2 km",
    img: "dog1.jpg",
    bio: "Vivace e curiosa, ama giocare tutto il giorno!",
    premium: true
  },
  {
    name: "Rocky",
    age: 4,
    breed: "Meticcio",
    dist: "5 km",
    img: "dog2.jpg",
    bio: "Un cane simpatico e fedele, sempre pronto a farsi coccolare.",
    premium: false
  },
  {
    name: "Maya",
    age: 3,
    breed: "Shiba Inu",
    dist: "1 km",
    img: "dog3.jpg",
    bio: "Orgogliosa e intelligente, ama passeggiare al parco.",
    premium: true
  },
  {
    name: "Sofia",
    age: 5,
    breed: "Levriero Afgano",
    dist: "3 km",
    img: "dog4.jpg",
    bio: "Elegante e dolce, perfetta per famiglie tranquille.",
    premium: false
  }
];

let currentIndex = 0;
let swipesLeft = 10;
let isPremium = false;

// Navigazione tra schermate
function goToScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");

  if (id === "home-screen") renderCard();
}

// Mostra profilo cane nella card
function renderCard() {
  if (currentIndex >= dogs.length) {
    document.getElementById("card").innerHTML = "<p>Nessun altro cane nei dintorni 🐾</p>";
    return;
  }

  const d = dogs[currentIndex];
  document.getElementById("card").innerHTML = `
    <img src="${d.img}" alt="${d.name}">
    <h3>${d.name}, ${d.age} anni, ${d.breed}</h3>
    <p>${d.dist} da te</p>
    <p>${d.bio}</p>
  `;
}

// Swipe
function swipe(choice) {
  if (!isPremium) {
    swipesLeft--;
    if (swipesLeft <= 0) {
      showPremiumPopup();
      return;
    }
  }

  if (choice === "yes") {
    goToScreen("chat-screen");
    document.getElementById("messages").innerHTML =
      `<p><strong>${dogs[currentIndex].name}:</strong> Bau! 🐾</p>`;
  } else {
    currentIndex++;
    renderCard();
  }
}

// Chat
function sendMessage() {
  const input = document.getElementById("chatInput");
  if (input.value.trim() === "") return;
  document.getElementById("messages").innerHTML += `<p><strong>Tu:</strong> ${input.value}</p>`;
  input.value = "";
}

// Premium popup
function showPremiumPopup() {
  alert("Hai finito gli swipe gratuiti! Passa a Premium 👑");
}
