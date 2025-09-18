document.addEventListener('DOMContentLoaded', () => {
  /* ====== Dataset ====== */
  const dogs = [
    { id:1, name:'Luna',  age:1, breed:'Jack Russell',      distance:2.2, image:'./dog1.jpg', online:true  },
    { id:2, name:'Rocky', age:3, breed:'Labrador',          distance:1.6, image:'./dog2.jpg', online:true  },
    { id:3, name:'Bella', age:2, breed:'Shiba Inu',         distance:3.2, image:'./dog3.jpg', online:false },
    { id:4, name:'Max',   age:4, breed:'Golden Retriever',  distance:5.9, image:'./dog4.jpg', online:true  },
  ];

  let matches = new Set();
  let currentView = 'near'; // 'near' | 'browse' | 'match'

  /* ====== Helpers ====== */
  const $  = sel => document.querySelector(sel);
  const $$ = sel => document.querySelectorAll(sel);

  const cardsWrap = $('#cards');

  /* ====== Render ====== */
  function render() {
    if (!cardsWrap) return;
    cardsWrap.innerHTML = '';

    let list = [...dogs];

    if (currentView === 'near') {
      list = list.filter(d => d.online).sort((a,b) => a.distance - b.distance);
    } else if (currentView === 'browse') {
      // tutti
    } else if (currentView === 'match') {
      list = list.filter(d => matches.has(d.id));
    }

    if (list.length === 0) {
      cardsWrap.innerHTML = `<p style="color:#6b7280;padding:10px 0">Ancora nessun match. Metti qualche ❤️!</p>`;
      return;
    }

    list.forEach(d => {
      const card = document.createElement('article');
      card.className = 'card';
      card.innerHTML = `
        <div class="pic">
          <img src="${d.image}" alt="Foto di ${d.name}">
          <span class="badge">${d.distance.toFixed(1)} km</span>
          ${d.online ? '<span class="dot"></span>' : ''}
        </div>
        <div class="body">
          <div class="name">${d.name}, ${d.age}</div>
          <div class="breed">${d.breed}</div>
          <div class="actions">
            <button class="btn-round btn-no" data-act="no" data-id="${d.id}">✖</button>
            <button class="btn-round btn-yes" data-act="yes" data-id="${d.id}">❤</button>
          </div>
        </div>
      `;
      cardsWrap.appendChild(card);
    });
  }

  /* ====== Eventi ====== */
  // “Entra” (link): opzionale — forziamo l’hash per sicurezza
  const enterEl = $('#enterBtn');
  if (enterEl) {
    enterEl.addEventListener('click', () => {
      if (location.hash !== '#list') location.hash = '#list';
    }, {passive:true});
  }

  // Tabs (richiedono data-view nell’HTML)
  $$('.tab').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentView = btn.dataset.view || 'near';
      render();
    });
  });

  // Like / Dislike
  if (cardsWrap) {
    cardsWrap.addEventListener('click', (e) => {
      const t = e.target.closest('button[data-id]');
      if (!t) return;
      const id = Number(t.dataset.id);

      if (t.dataset.act === 'yes') {
        matches.add(id);
        t.animate(
          [{ transform:'scale(1)' },{ transform:'scale(1.1)' },{ transform:'scale(1)' }],
          { duration: 160 }
        );
      } else {
        const idx = dogs.findIndex(d => d.id === id);
        if (idx >= 0) dogs.push(...dogs.splice(idx,1));
      }
      render();
    });
  }

  // Geoloc (demo)
  const locOn = $('#locOn');
  const locLater = $('#locLater');
  if (locOn)    locOn.addEventListener('click', () => alert('Posizione attivata (demo).'));
  if (locLater) locLater.addEventListener('click', () => alert('Ok, più tardi.'));

  /* ====== Avvio ====== */
  render();
});
