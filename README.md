# 🐾 Plutoo

**Plutoo** è l’app pensata per connettere i proprietari di cani:  
puoi scoprire altri DOG vicino a te, mettere “mi piace” (💛), fare match, aprire i profili, chattare e condividere le **Stories** come su Instagram.

---

## 🚀 Come provarla
1. Scarica o clona il progetto  
2. Apri il file `index.html` in un browser (consigliato **Chrome** o **Brave**)  

Non serve installare nulla: è una **web app PWA** pienamente funzionante.

---

## 📁 Struttura del progetto
- `index.html` → home e struttura principale  
- `style.css` → grafica, tema viola/oro e layout responsive  
- `app.js` → logica dell’app: profili, swipe, match, chat, stories, Plus, filtri e reward  

---

## ✨ Funzionalità principali
✅ Tema scuro elegante (viola profondo + accenti oro)  
✅ Home con logo grande, bandierine 🇮🇹🇬🇧, login/registrazione  
✅ Sezione **Vicino a te**: griglia 2xN con card dei DOG  
✅ Sezione **Amore** (swipe) e **Amicizia** (nuova sezione)  
✅ Sezione **Luoghi PET** con veterinari, toelettature, parchi, negozi, addestratori e pensioni  
✅ Sezione **Ricerca personalizzata** con filtri base e filtri Gold (Plus)  
✅ Sezione **Stories** (foto 15s, video fino a 90s, musica, filtri, pubbliche o private)  
✅ Sistema **Plus**: rimuove pubblicità, sblocca filtri Gold e storie illimitate  
✅ **Badge verifica** con documenti proprietario e vaccini DOG  
✅ **Selfie blur**: si sblocca con reward o sempre visibile per utenti Plus  
✅ **Reward video** per selfie, stories, servizi, messaggi, swipe  
✅ **Banner sponsor** “Fido – il gelato per i tuoi amici a quattro zampe” in fondo pagina  
✅ Messaggi solo dopo match o con reward (chat centrata nel profilo DOG)  
✅ Animazioni fluide (viola + oro), layout fisso e stabile senza scroll involontari  
✅ Tutto compatibile con Android WebView  

---

## 💎 Plutoo Plus
- Nessuna pubblicità  
- Nessun video reward  
- Filtri Gold attivi  
- Storie illimitate  
- Swipe e messaggi liberi  
- Accesso diretto ai luoghi PET  

---

## 🧩 Tecnico
- **PWA completa** con `manifest.json` e `service worker`  
- Deploy su **Vercel** → [plutoo-official.vercel.app](https://plutoo-official.vercel.app)  
- Build Android con **GitHub Actions** (JDK 17)  
- Ads e Billing pronti per integrazione reale  

---

## 🐕 Versione stabile
**Release:** v1.0.0 (base completa e funzionante)  
Tutte le modifiche future verranno aggiunte in nuove release (v1.1, v2, …).  
Puoi sempre tornare a questa versione stabile se serve.

---

## ❤️ Nota
Questa è la versione definitiva testata su Android e web.  
Tutti i file (`index.html`, `style.css`, `app.js`) sono completi e sincronizzati.  
L’app è pronta per la distribuzione e pubblicazione ufficiale.
