document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;

  // NAVIGAZIONE TRA PAGINE (vera, non "apri sotto")
  const go = (page) => {
    body.classList.remove("page-home","page-lists","page-swipe","page-match");
    body.classList.add(page);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  // CTA "Entra" -> liste
  const btnEnter = document.getElementById("btnEnter");
  if (btnEnter) btnEnter.addEventListener("click", () => go("page-lists"));

  // Tabs nella pagina liste
  const tabNear  = document.getElementById("tabNear");
  const tabSwipe = document.getElementById("tabSwipe");
  const tabMatch = document.getElementById("tabMatch");

  const setActiveTab = (el) => {
    [tabNear, tabSwipe, tabMatch].forEach(t => t.classList.remove("active"));
    el.classList.add("active");
  };

  if (tabNear)  tabNear.addEventListener("click",  () => { setActiveTab(tabNear);  go("page-lists"); });
  if (tabSwipe) tabSwipe.addEventListener("click", () => { setActiveTab(tabSwipe); go("page-swipe"); });
  if (tabMatch) tabMatch.addEventListener("click", () => { setActiveTab(tabMatch); go("page-match"); });

  // Geolocalizzazione (demo)
  const btnGeo = document.getElementById("btnGeo");
  if (btnGeo && "geolocation" in navigator) {
    btnGeo.addEventListener("click", () => {
      btnGeo.disabled = true;
      navigator.geolocation.getCurrentPosition(
        () => { btnGeo.textContent = "Ok!"; btnGeo.classList.remove("primary"); },
        () => { btnGeo.textContent = "Riprova"; btnGeo.disabled = false; }
      );
    });
  }

  // Dati demo per swipe
  const DOGS = [
    { img:"dog1.jpg", title:"Sofia, 5", sub:"Levriero Afgano • 1.6 km" },
    { img:"dog2.jpg", title:"Rocky, 4", sub:"Meticcio • 5.9 km" },
    { img:"dog3.jpg", title:"Luna, 1",  sub:"Jack Russell • 2.2 km" },
    { img:"dog4.jpg", title:"Maya, 3",  sub:"Shiba Inu • 3.2 km" }
  ];
  let i = 0;

  const swipeImg   = document.getElementById("swipeImg");
  const swipeTitle = document.getElementById("swipeTitle");
  const swipeSub   = document.getElementById("swipeSub");

  function show(ix){
    const d = DOGS[ix % DOGS.length];
    swipeImg.src = d.img; swipeImg.alt = d.title;
    swipeTitle.textContent = d.title;
    swipeSub.textContent   = d.sub;
  }
  if (swipeImg) show(i);

  const btnNo  = document.getElementById("btnNo");
  const btnYes = document.getElementById("btnYes");

  if (btnNo)  btnNo.addEventListener("click",  () => { i=(i+1)%DOGS.length; show(i); });
  if (btnYes) btnYes.addEventListener("click", () => {
    // Aggiungeresti ai match qui
    i=(i+1)%DOGS.length; show(i);
  });
});
