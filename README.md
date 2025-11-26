# 🐶 **Plutoo**  
Il primo social network pensato per i **DOGS**: trova nuovi amici, condividi momenti, scopri i DOG vicino a te e trova partner per l’**accoppiamento responsabile**.

---

## 🇮🇹 FUNZIONALITÀ PRINCIPALI

### 🔥 Vicino a Te  
La bacheca automatica dei DOG nella tua zona:  
- Griglia 2×N veloce e scorrevole  
- Apertura profilo dedicato con un tap  
- Cornici animate violette  
- Storie stile Instagram  
- Like alle Stories  
- Sistema Follow / Seguiti (salvato in locale)

---

### 💜 Accoppiamento (Swipe)  
Sistema swipe stile dating app:  
- Swipe sinistra = 🥲  
- Swipe destra = 💛  
- Animazioni, tilt, glow viola  
- Match overlay con grande cuore ❤️‍🔥 pulsante  
- Bio, razza, età, distanza  
- Reward video da 5 secondi per utenti non-Plus  
- Focus su accoppiamento responsabile

---

### 💬 Messaggistica  
- Tab: Ricevuti / Inviati / Match / Richieste / Spam  
- Empty state chiari (“Nessun messaggio…”)  
- Chat con composer fisso in fondo  
- Reward video (5s) solo sul **primo messaggio** dopo il match (per non-Plus)  
- Nessuna pubblicità per gli utenti Plus

---

### 📸 Storie dei DOG  
- Upload foto/video (mock locale)  
- Viewer a schermo intero stile Instagram  
- Navigazione avanti/indietro  
- Like ❤️ alla story  
- Filtri & Musica (interfaccia pronta, logica mock)  
- Pulsante **← Indietro** per chiudere il viewer

---

### 📱 SELFIE CON IL TUO AMICO A 4 ZAMPE  
Funzione integrata per scattare selfie con il proprio DOG.  
Sblocco tramite reward video (per non-Plus).

**__SELFIE CON IL TUO AMICO A 4 ZAMPE__**

---

### 📄 Profilo DOG — Pagina Dedicata  
- Foto profilo fullscreen  
- Galleria immagini (max 5 foto, salvate in `localStorage`)  
- Sezione Documenti (mock, pronta per futuro backend)  
- Badge verificato previsto per futura verifica documenti  
- Sistema Follow / Seguiti per ogni DOG  
- Like sulla foto profilo  
- Sezione **Social del proprietario** personalizzabile:
  - Facebook  
  - Instagram  
  - TikTok  
- Pulsante **“Modifica social”** visibile solo sul proprio DOG, con salvataggio in `localStorage`

---

### 📍 LuoghiPET  
Sezione dedicata alle attività utili per DOG:  
- 🏥 Veterinari  
- ✂️ Toelettature  
- 🛒 Negozi  
- 🎓 Addestratori  
- 🏠 Pensioni  
- 🌳 Parchi  

Ogni voce apre **Google Maps** con la categoria corrispondente.  
Per utenti non-Plus è previsto un reward video da 5s prima dell’apertura (mock).

---

### 💎 Plutoo Plus (Mock)  
Stato salvato in `localStorage` (`plutoo_plus = "yes"`).  
Funzioni previste per Plus:

- Nessuna pubblicità  
- Nessun video reward  
- Swipe illimitati  
- Messaggi illimitati  
- Tutti i filtri Gold sbloccati  
- Stories avanzate (durata maggiore, meno limiti)  
- Supporto prioritario

---

### 🟣 Ricerca Personalizzata

**Filtri base (gratuiti):**  
- Distanza (slider km)  
- Razza con autocomplete intelligente  
- Sesso (Maschio / Femmina / Tutti)

**Filtri Gold (riservati a Plus):**  
- Solo DOG con badge verificato ✅  
- Età minima / massima  
- Peso minimo  
- Altezza minima  
- Presenza Pedigree (Sì / No / Indifferente)  
- Disponibile per accoppiamento (Sì / No / Indifferente)  
- Taglia (Piccola / Media / Grande)

---

### 📢 Monetizzazione (Mock di test)

**Reward video da 5 secondi (test):**  
- Primo messaggio dopo il match  
- Apertura LuoghiPET  
- Sblocco selfie  
- Milestone swipe (10 e poi ogni +5 swipe)

**Banner fisso (mock):**  
- Banner test AdMob visibile in tutte le sezioni interne dell’app  
- Non visibile nella Home

**Sponsor ufficiale:**  
- Mostrato **solo in Home**  
- Nessun reward video al click  
- Testo: *“Fido, il gelato per i nostri amici a quattro zampe”*

---

### 🔐 Privacy & Sicurezza

- Attualmente nessun backend: tutti i dati sono mock e/o salvati in locale (`localStorage`)  
- Nessuna trasmissione verso server esterni nella versione di test  
- Presenti link a **Termini**, **Privacy** e **Contatti**  
- ⚠️ **Nota importante**: prima del rilascio pubblico su store dovrà essere fatto un controllo finale di:
  - Termini di Servizio
  - Informativa Privacy
  - Coerenza con funzionalità reali (accoppiamento, follow, social, stories, ads, abbonamenti)

---

### 💡 Stack Tecnico

- WebApp single-page (HTML + CSS + JavaScript vanilla)  
- PWA con `manifest.json`  
- Ottimizzata per **Android WebView**  
- Tema grafico: nero/viola con accenti oro  
- Animazioni CSS per swipe, match (cuore ❤️‍🔥) e hover  
- Uso moderato di `localStorage` per stato utente (Plus, gallery, social, follow, likes)

---

### 🚀 Roadmap (Post-test)

- Integrazione backend **Firebase**:
  - Firebase Auth (login/registrazione sicura)
  - Firestore (profili reali, match, follow, messaggi)
  - Storage (foto DOG, stories, documenti)
- Integrazione **AdMob reale** (banner + rewarded)  
- Integrazione **Google Play Billing** per Plutoo Plus  
- Notifiche push (Firebase Cloud Messaging)  
- Miglioramenti UI/UX finali  
- QA completo su dispositivi reali Android e pubblicazione su Google Play

---

### 📬 Supporto

- Email: **plutoo.team@gmail.com**  
- Instagram: **@plutoo.app**

---

---

# 🇬🇧 Plutoo — Official README

A social network designed **for DOGS**, to help them meet new friends, share moments, discover nearby dogs and find partners for **responsible breeding**.

---

## 🌟 MAIN FEATURES

### 🔥 Nearby  
Automatic feed of dogs around you:  
- Fast 2×N grid  
- Tap to open full dog profile  
- Purple animated borders  
- Instagram-like Stories  
- Story likes ❤️  
- Local Follow / Following system (stored in `localStorage`)

---

### 💜 Breeding (Swipe)  
Dating-app style swipe experience:  
- Swipe left = 🥲  
- Swipe right = 💛  
- Smooth tilt & purple glow animations  
- Animated match overlay with a big pulsing ❤️‍🔥 heart  
- Detailed bio, breed, age, distance  
- 5-second reward video for non-Plus users  
- Focus on **responsible breeding**

---

### 💬 Messaging System  
- Tabs: Inbox / Sent / Matches / Requests / Spam  
- Clear empty states (“No messages…”)  
- Fixed composer at the bottom  
- Reward video (5s) only on the **first message** after a match (for non-Plus)  
- No ads for Plus users

---

### 📸 DOG Stories  
- Photo / video upload (local mock in current version)  
- Fullscreen Instagram-style viewer  
- Previous / next story navigation  
- ❤️ Like button for each story  
- Filters & Music (UI ready, logic mocked)  
- **← Back** button to close the story viewer

---

### 📱 SELFIE WITH YOUR FOUR-LEGGED FRIEND  
Integrated selfie feature together with your DOG.  
Unlocked via reward video (for non-Plus users).

**__SELFIE WITH YOUR FOUR-LEGGED FRIEND__**

---

### 📄 Dedicated DOG Profile Page  
- Fullscreen profile picture  
- Image gallery (up to 5 photos, stored in `localStorage`)  
- Documents section (mock, ready for future backend)  
- “Verified” badge planned for future document checks  
- Follow / Following per DOG  
- Likes on profile picture  
- **Owner Social Links** (fully editable):
  - Facebook  
  - Instagram  
  - TikTok  
- **“Edit social”** button visible only on the current user’s DOG, with data stored locally

---

### 📍 PET Places  
Utility section for pet-related services:  
- 🏥 Vets  
- ✂️ Groomers  
- 🛒 Shops  
- 🎓 Trainers  
- 🏠 Kennels / Shelters  
- 🌳 Parks  

Each category opens **Google Maps** with the correct query.  
For non-Plus users a 5-second reward video is shown before opening (mock).

---

### 💎 Plutoo Plus (Mock)

Stored in `localStorage` as `plutoo_plus = "yes"`.

Planned Plus benefits:

- No ads at all  
- No rewarded videos  
- Unlimited swipes  
- Unlimited messages  
- All Gold filters unlocked  
- Advanced Stories features  
- Priority support

---

### 🟣 Advanced Search

**Free filters:**  
- Distance slider  
- Breed textbox with smart autocomplete  
- Gender (Male / Female / All)

**Gold filters (Plus only):**  
- Verified only  
- Min / Max age  
- Min weight  
- Min height  
- Pedigree (Yes / No / Indifferent)  
- Breeding availability (Yes / No / Indifferent)  
- Size (Small / Medium / Large)

---

### 📢 Monetization (Test Mock)

**5-second reward videos:**  
- First chat message after a match  
- PET Places click  
- Selfie unlocking  
- Swipe milestones (10 and then every +5)

**Fixed banner (mock):**  
- Test AdMob banner visible inside the app views  
- Not visible on the Home screen

**Sponsor:**  
- Shown **only on Home**  
- No reward video on sponsor click  
- Copy: *“Fido, the ice cream for our four-legged friends”* (IT copy in app)

---

### 🔐 Privacy & Security

- No backend yet: all data are mocks and/or stored locally  
- No data sent to external servers in this test version  
- Terms, Privacy and Contacts pages are linked in the UI  
- ⚠️ **Important**: before public release, a full legal & privacy review must be done:
  - Terms of Service  
  - Privacy Policy  
  - Real alignment with final features (breeding, follow, social links, stories, ads, subscriptions)

---

### 💡 Tech Stack

- Single-page WebApp (HTML + CSS + vanilla JS)  
- PWA with `manifest.json`  
- Optimized for Android WebView  
- Dark purple & black theme with gold accents  
- CSS animations for swipe, match (big ❤️‍🔥 heart) and main interactions  
- Controlled usage of `localStorage` for non-critical state (Plus, gallery, social, follow, likes)

---

### 🚀 Roadmap (After Test Phase)

- Backend integration with **Firebase**:
  - Firebase Auth (secure login/registration)
  - Firestore (real profiles, matches, follows, messages)
  - Storage (DOG photos, stories, documents)
- Real **AdMob** integration (banner + rewarded)  
- **Google Play Billing** for Plutoo Plus  
- Push Notifications (Firebase Cloud Messaging)  
- Final UI/UX polishing  
- QA on real Android devices & Google Play release

---

### 📬 Support

- Email: **plutoo.team@gmail.com**  
- Instagram: **@plutoo.app**
