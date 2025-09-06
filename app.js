/* --------- DATI DEMO --------- */
const dogs = [
  {name:"Luna",  age:1, breed:"Jack Russell",     dist:"2 km", img:"dog1.jpg", bio:"Vivace e curiosa, ama giocare tutto il giorno!", premium:true},
  {name:"Rocky", age:4, breed:"Meticcio",         dist:"5 km", img:"dog2.jpg", bio:"Simpatico e fedele, sempre pronto alle coccole.", premium:false},
  {name:"Maya",  age:3, breed:"Shiba Inu",        dist:"1 km", img:"dog3.jpg", bio:"Orgogliosa e intelligente, passeggiate ogni giorno.", premium:true},
  {name:"Sofia", age:5, breed:"Levriero Afgano",  dist:"3 km", img:"dog4.jpg", bio:"Elegante e dolce, tranquilla con tutti.", premium:false}
];

/* --------- STATO --------- */
let i = 0;
let isPremium = false;
let swipesLeft = 10;

/* --------- UTILS --------- */
const $  = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const showScreen = id => { $$('.screen').forEach(s=>s.classList.remove('active')); $(id).classList.add('active'); };

/* Splash velocissima (0.35s) -> Login */
setTimeout(()=>showScreen('#login'), 350);

/* Login -> Home */
$('#enterBtn').addEventListener('click', () => {
  renderCard();
  updateCounter();
  showScreen('#home');
});

/* Render card */
function renderCard() {
  const d = dogs[i % dogs.length];
  $('#cardImg').src = d.img;
  $('#cardTitle').textContent = `${d.name}, ${d.age} anni, ${d.breed}`;
  $('#cardMeta').textContent  = `${d.dist} da te`;
  $('#cardBio').textContent   = d.bio;
}

/* Swipe */
function like(){
  if(!checkLimit()) return;
  const d = dogs[i % dogs.length];
  i++; renderCard();
  openChat(d); // match immediato per demo
}
function nope(){
  if(!checkLimit()) return;
  i++; renderCard();
}
$('#yesBtn').addEventListener('click', like);
$('#noBtn').addEventListener('click',  nope);

/* Swipe touch */
let startX=null;
$('#card').addEventListener('touchstart', e=>{ startX=e.changedTouches[0].clientX; });
$('#card').addEventListener('touchend', e=>{
  if(startX==null) return;
  const dx = e.changedTouches[0].clientX - startX;
  if(dx>60) like();
  if(dx<-60) nope();
  startX=null;
});

/* Profilo (sheet) */
$('#openProfile').addEventListener('click', async ()=>{
  const d = dogs[i % dogs.length];
  if(!isPremium) await playAd();
  $('#pImg').src = d.img;
  $('#pName').textContent = d.name;
  $('#pMeta').textContent = `${d.breed} • ${d.age} anni • ${d.dist}`;
  $('#pBio').textContent  = d.bio;
  $('#sheet').classList.add('show');
});
$('#closeSheet').addEventListener('click', ()=>$('#sheet').classList.remove('show'));
$('#pYes').addEventListener('click', ()=>{ $('#sheet').classList.remove('show'); like(); });
$('#pNo').addEventListener('click',  ()=>{ $('#sheet').classList.remove('show'); nope(); });

/* Chat */
function openChat(d){
  $('#chatAvatar').src = d.img;
  $('#chatWith').textContent = `Chat con ${d.name}`;
  showScreen('#chat');
  if(!isPremium) playAd();
}
$('#backHome').addEventListener('click', ()=>showScreen('#home'));
$('#sendBtn').addEventListener('click', ()=>{
  const input = $('#chatInput');
  const txt = (input.value||'').trim();
  if(!txt) return;
  const b = document.createElement('div');
  b.className='bubble me';
  b.textContent = txt;
  $('#thread').appendChild(b);
  input.value='';
  $('#thread').scrollTop = $('#thread').scrollHeight;
});

/* Video (Free) */
function playAd(){
  return new Promise(resolve=>{
    const ov = $('#overlay');
    ov.classList.add('show');
    let c=3; $('#count').textContent=c;
    const t=setInterval(()=>{
      c--; $('#count').textContent=c;
      if(c<=0){ clearInterval(t); ov.classList.remove('show'); resolve(); }
    },1000);
  });
}

/* Free/Premium */
function checkLimit(){
  if(isPremium) return true;
  if(swipesLeft<=0){ openPremium(); return false; }
  swipesLeft--; updateCounter(); return true;
}
function updateCounter(){
  $('#counter').textContent = isPremium ? 'Swipe illimitati (Premium)' : `Swipe rimasti: ${swipesLeft}`;
}
function openPremium(){ $('#premium').classList.add('show'); }
$('#openPremium').addEventListener('click', openPremium);
$('#closePremium').addEventListener('click', ()=>$('#premium').classList.remove('show'));
$('#activatePremium').addEventListener('click', ()=>{
  isPremium = true;
  $('#planBadge').textContent = 'Premium';
  $('#premium').classList.remove('show');
  updateCounter();
});
