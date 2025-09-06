function goToScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(screenId).classList.add('active');
}

function swipe(action) {
  if (action === 'yes') {
    alert("Hai messo ❤️ a questo cane!");
  } else {
    alert("Hai passato ❌ questo cane.");
  }
}

function sendMessage() {
  const input = document.getElementById("chatInput");
  const msg = input.value.trim();
  if (msg) {
    const messages = document.getElementById("messages");
    const newMsg = document.createElement("p");
    newMsg.innerHTML = "<strong>Tu:</strong> " + msg;
    messages.appendChild(newMsg);
    input.value = "";
  }
}
