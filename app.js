/* --- DATI DEMO --- */
const dogs = [
  {name:"Luna",  age:1, breed:"Jack Russell",     dist:"2 km", img:"dog1.jpg", bio:"Vivace e curiosa, ama giocare tutto il giorno!"},
  {name:"Rocky", age:4, breed:"Meticcio",         dist:"5 km", img:"dog2.jpg", bio:"Simpatico e fedele, sempre pronto alle coccole."},
  {name:"Maya",  age:3, breed:"Shiba Inu",        dist:"1 km", img:"dog3.jpg", bio:"Orgogliosa e intelligente, passeggiate ogni giorno."},
  {name:"Sofia", age:5, breed:"Levriero Afgano",  dist:"3 km", img:"dog4.jpg", bio:"Elegante e dolce, tranquilla con tutti."}
];
let i = 0, swipesLeft = 10, isPremium = false;

/* --- HELPERS --- */
const $  = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const show = id => { $$('.screen').forEach(s=>s.classList.remove('active')); $(id).classList.add('active'); };

function renderCard(){
  const d = dogs[i % dogs.length];
  $('#cardImg').src = d.img;
  $('#cardTitle').textContent = `${d.name}, ${d.age} anni, ${d.breed}`;
  $('#cardMeta').textContent  = `${d.dist} da te`;
  $('#cardBio').textContent   = d.bio;
}
function updateCounter(){
  $('#counter').textContent = isPremium ? 'Swipe illimitati (Premium)' : `Swipe rimasti: ${swipesLeft}`;
}

/* --- OPEN SHEETS --- */
$('#btnLogin').onclick    = () => $('#sheetLogin').classList.add('show');
$('#btnRegister').onclick = () => $('#sheetRegister').classList.add('show');
$$('.close').forEach(b => b.onclick = () => $('#' + b.dataset.close).classList.remove('show'));

/* --- SUBMIT FORMS (entra subito nei match) --- */
$('#loginSubmit').onclick = () => { $('#sheetLogin').classList.remove('show'); enterApp(); };
$('#registerSubmit').onclick = () => { $('#sheetRegister').classList.remove('show'); enterApp(); };

function enterApp(){
  renderCard();
  updateCounter();
  show('#home');
}

/* --- SWIPE --- */
function like(){
  if(!isPremium){ swipesLeft--; if(swipesLeft<0){ swipesLeft=0; return; } updateCounter(); }
  i++; renderCard();
}
function nope(){
  if(!isPremium){ swipesLeft--; if(swipesLeft<0){ swipesLeft=0; return; } updateCounter(); }
  i++; renderCard();
}
$('#yesBtn').onclick = like;
$('#noBtn').onclick  = nope;

/* --- TOUCH SWIPE --- */
let startX=null;
$('#card').addEventListener('touchstart', e=>{ startX=e.changedTouches[0].clientX; });
$('#card').addEventListener('touchend', e=>{
  if(startX==null) return;
  const dx = e.changedTouches[0].clientX - startX;
  if(dx>60) like();
  if(dx<-60) nope();
  startX=null;
});

/* --- PROFILO + VIDEO FREE --- */
$('#openProfile').onclick = async ()=>{
  const d = dogs[i % dogs.length];
  if(!isPremium) await playAd();
  alert(`${d.name} • ${d.breed} • ${d.age} anni • ${d.dist}\n\n${d.bio}`); // MVP pulito
};
function playAd(){
  return new Promise(res=>{
    const ov = $('#overlay'); ov.classList.add('show');
    let c=3; $('#count').textContent=c;
    const t=setInterval(()=>{ c--; $('#count').textContent=c; if(c<=0){ clearInterval(t); ov.classList.remove('show'); res(); } },1000);
  });
}
