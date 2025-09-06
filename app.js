// ---- IMMAGINI INCORPORATE (data URL SVG) ----
// Genero immagini segnaposto per i cani, così non devi caricare nulla.
function dogSVG(name, breed, colorA = "#1e1e1e", colorB = "#6f49b5") {
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${colorA}"/>
        <stop offset="100%" stop-color="${colorB}"/>
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
    <!-- cerchio viola -->
    <circle cx="400" cy="360" r="220" fill="#6f49b5"/>
    <!-- faccia cane gialla -->
    <circle cx="400" cy="360" r="150" fill="#ffcc33"/>
    <!-- orecchie -->
    <polygon points="250,360 310,230 350,360" fill="#5a3626"/>
    <polygon points="550,360 490,230 450,360" fill="#5a3626"/>
    <!-- occhi -->
    <circle cx="360" cy="340" r="18" fill="#222"/>
    <circle cx="440" cy="340" r="18" fill="#222"/>
    <!-- muso -->
    <ellipse cx="400" cy="410" rx="70" ry="48" fill="#f6e7d2"/>
    <ellipse cx="400" cy="410" rx="14" ry="12" fill="#222"/>
    <!-- sorriso -->
    <path d="M360 430 Q400 455 440 430" stroke="#222" stroke-width="5" fill="none"/>
    <!-- banda nera con testo -->
    <rect x="0" y="860" width="800" height="140" fill="#000" opacity="0.7"/>
    <text x="400" y="920" font-family="Arial" font-size="40" fill="#fff" text-anchor="middle">${name} • ${breed}</text>
  </svg>`;
  return "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svg)));
}

// ---- DATI DEMO ----
const dogs = [
  {name:"Luna", age:3, breed:"Labrador", dist:"2 km", img:dogSVG("Luna", "Labrador", "#1e1e1e", "#6f49b5"), bio:"Dolce e giocherellona. Amo correre al parco!", premium:true},
  {name:"Rocky", age:2, breed:"Bulldog", dist:"5 km", img:dogSVG("Rocky", "Bulldog", "#2a1616", "#6f49b5"), bio:"Tranquillo ma affettuoso. Adoro i bambini.", premium:false},
  {name:"Maya", age:4, breed:"Border Collie", dist:"1 km", img:dogSVG("Maya", "Border Collie", "#15202a", "#6f49b5"), bio:"Energica e sveglia. Palla? Sempre pronta!", premium:true},
];

let idx = 0;
let isPremium = false;
let freeSwipes = 10;

const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

function show(id){
  $$('.screen').forEach(x=>x.classList.remove('active'));
  $(id.startsWith('#')?id:'#'+id).classList.add('active');
}

// Splash -> Login
setTimeout(()=>show('login-screen'), 1200);

// Login -> Home
$('#goHome').addEventListener('click', ()=>{
  loadCard();
  updateCounters();
  show('home-screen');
});

// Carica la card corrente
function loadCard(){
  const d = dogs[idx % dogs.length];
  $('#cardImg').src = d.img;
  $('#cardTitle').textContent = `${d.name}, ${d.age} – ${d.breed}`;
  $('#cardMeta').textContent = `${d.dist} • Vaccini ✅`;
  $('#crown').classList.toggle('hidden', !d.premium);
}

// Azioni like/pass
function like(){
  if(!checkLimit()) return;
  const d = dogs[idx % dogs.length];
  idx++;
  loadCard();
  openChat(d); // per demo: match immediato
}
function pass(){
  if(!checkLimit()) return;
  idx++;
  loadCard();
}

$('#btnYes').addEventListener('click', like);
$('#btnNo').addEventListener('click', pass);

// Apri profilo (video se Free)
$('#openProfile').addEventListener('click', async ()=>{
  const d = dogs[idx % dogs.length];
  if(!isPremium) await playAd();
  openProfile(d);
});

function openProfile(d){
  $('#pImg').src = d.img;
  $('#pName').textContent = d.name;
  $('#pPremium').classList.toggle('hidden', !d.premium);
  $('#pMeta').textContent = `${d.breed} • ${d.age} anni • ${d.dist}`;
  $('#pBio').textContent = `“${d.bio}”`;
  $('#profileSheet').classList.add('active');
}
$('#closeProfile').addEventListener('click', ()=>$('#profileSheet').classList.remove('active'));
$('#pYes').addEventListener('click', ()=>{ $('#profileSheet').classList.remove('active'); like(); });
$('#pNo').addEventListener('click', ()=>{ $('#profileSheet').classList.remove('active'); pass(); });

// Chat
function openChat(d){
  $('#chatAvatar').src = d.img;
  $('#chatWith').textContent = `Chat con ${d.name}`;
  show('chat-screen');
  if(!isPremium) playAd(); // video all'apertura chat per Free
}
$('#backHome').addEventListener('click', ()=>show('home-screen'));
$('#sendBtn').addEventListener('click', ()=>{
  const input = $('#chatInput');
  const v = (input.value||'').trim();
  if(!v) return;
  const b = document.createElement('div');
  b.className = 'msg me';
  b.textContent = v;
  $('#thread').appendChild(b);
  input.value = '';
  $('#thread').scrollTop = $('#thread').scrollHeight;
});

// Video overlay finto
function playAd(){
  return new Promise(resolve=>{
    const ov = $('#overlay'); ov.classList.add('active');
    let c=3; $('#count').textContent = c;
    const t = setInterval(()=>{
      c--; $('#count').textContent = c;
      if(c<=0){ clearInterval(t); ov.classList.remove('active'); resolve(); }
    }, 1000);
  });
}

// Limiti Free
function checkLimit(){
  if(isPremium) return true;
  if(freeSwipes<=0){ openUpsell(); return false; }
  freeSwipes--; updateCounters(); return true;
}
function updateCounters(){
  $('#swipeLeft').textContent = isPremium ? 'Swipe illimitati (Premium)' : `Swipe rimasti: ${freeSwipes}`;
}

// Upsell / Premium
function openUpsell(){ $('#upsell').classList.add('active'); }
$('#goPremium').addEventListener('click', openUpsell);
$('#closeUpsell').addEventListener('click', ()=>$('#upsell').classList.remove('active'));
$('#activatePremium').addEventListener('click', ()=>{
  isPremium = true;
  $('#planBadge').textContent = 'Premium';
  $('#upsell').classList.remove('active');
  updateCounters();
});

// Touch swipe (mobile)
const card = $('#card'); let startX=null;
card.addEventListener('touchstart', e=>{ startX = e.changedTouches[0].clientX; });
card.addEventListener('touchend', e=>{
  if(startX===null) return;
  const dx = e.changedTouches[0].clientX - startX;
  if(dx > 60) like();
  if(dx < -60) pass();
  startX = null;
});
