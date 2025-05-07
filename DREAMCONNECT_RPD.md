# DreamConnect: Requisiti, Progettazione e Dettagli Tecnici (RPD)

## Panoramica
DreamConnect è una piattaforma social innovativa per la condivisione dei sogni che permette agli utenti di documentare, condividere e scoprire esperienze oniriche. L'applicazione utilizza analisi NLP per estrarre temi e generare tag, abbinando utenti con esperienze di sogni simili e facilitando discussioni attraverso commenti e chat in tempo reale.

## Requisiti funzionali

### Autenticazione
- ✓ Registrazione utente con username, email e password
- ✓ Login con credenziali
- ✓ Logout
- ✓ Protezione delle route autenticate

### Gestione profilo utente
- ✓ Visualizzazione profilo personale
- ✓ Modifica informazioni profilo
- ✓ Caricamento foto profilo
- ✓ Avatar procedurali in pixel art come fallback

### Condivisione sogni
- ✓ Creazione di nuovi post con titolo, descrizione dettagliata
- ✓ Impostazione di visibilità (pubblico/privato)
- ✓ Supporto per immagini associate ai sogni
- ✓ Generazione automatica di tag tramite analisi NLP
- ✓ Modifica e cancellazione dei propri sogni
- ✓ Supporto per contenuti multilingua

### Interazione con i sogni
- ✓ Visualizzazione sogni nella home feed
- ✓ Visualizzazione dettagliata singolo sogno
- ✓ Mettere "mi piace" ai sogni
- ✓ Commentare i sogni
- ✓ Traduzione automatica dei sogni in altre lingue
- ✓ Esplorazione con filtri per lingua e tag

### Sistema di matching
- ✓ Algoritmo di matching basato su:
  - 60% similarità dei tag
  - 40% similarità del contenuto
- ✓ Soglia di corrispondenza del 60%
- ✓ Visualizzazione dei match nella sezione "Matches"
- ✓ Iniziare conversazioni con utenti con sogni simili

### Chat in tempo reale
- ✓ Creazione di chat a partire dai match
- ✓ Messaggistica in tempo reale con WebSockets
- ✓ Visualizzazione delle chat attive
- ✓ Notifiche per nuovi messaggi
- ✓ Visualizzazione degli avatar/immagini profilo

### Notifiche
- ✓ Notifiche per like ricevuti
- ✓ Notifiche per commenti ricevuti
- ✓ Notifiche per nuovi messaggi
- ✓ Contatore notifiche non lette
- ✓ Visualizzazione delle immagini profilo nelle notifiche

### Multilinguismo
- ✓ Interfaccia utente multilingua
- ✓ Traduzione dei sogni
- ✓ Supporto per creazione contenuti in diverse lingue
- ✓ Riconoscimento automatico della lingua

## Architettura tecnica

### Frontend
- **Framework**: React 18 con TypeScript
- **Routing**: wouter
- **State Management**: React Query per dati server, React Context per stato globale
- **Styling**: Tailwind CSS con shadcn/ui
- **Design System**: Neobrutalism + Pixel Art
- **Form Handling**: react-hook-form con zod per validazione

### Backend
- **Runtime**: Node.js con Express
- **Autenticazione**: Passport.js con sessions
- **Database**: PostgreSQL 
- **ORM**: Drizzle ORM
- **Real-time**: WebSockets (ws)
- **Validazione**: Zod
- **NLP**: Analisi testuale con natural e compromise
- **Traduzioni**: Servizio di traduzione integrato

### Database
- **Users**: Dati utente, credenziali, immagini profilo
- **Dreams**: Post dei sogni, con titolo, contenuto e metadati
- **DreamTags**: Tag generati automaticamente 
- **DreamLikes**: Relazioni molti-a-molti per i like
- **DreamComments**: Commenti sui sogni
- **DreamMatches**: Collegamenti tra sogni simili
- **ChatMessages**: Messaggi di chat tra utenti

## Componenti principali

### Componenti UI
- **PixelAvatar**: Avatar generato proceduralmente o immagine profilo caricata
- **DreamCard**: Card per visualizzazione preview sogni
- **DreamCommentList**: Lista commenti sotto i sogni
- **CreateDreamForm**: Form per creazione/modifica sogni
- **CreateCommentForm**: Form per inserimento commenti
- **NotificationPanel**: Pannello notifiche con supporto per avatar
- **MatchNotification**: Componente per visualizzare nuovi match
- **LanguageSelector**: Selettore lingua dell'interfaccia

### Pages
- **AuthPage**: Registrazione e login
- **HomePage**: Feed principale con sogni recenti
- **ExplorePage**: Esplorazione sogni con filtri
- **DreamDetailPage**: Visualizzazione dettagliata sogno
- **MyDreamsPage**: Gestione sogni personali
- **MatchesPage**: Visualizzazione e gestione match
- **ChatPage**: Interfaccia chat in tempo reale
- **SettingsPage**: Impostazioni profilo e preferenze

### Backend Services
- **Authentication**: Gestione login/registrazione
- **Storage**: Accesso e manipolazione dati 
- **NLP**: Analisi testo, generazione tag, analisi similarità
- **WebSockets**: Gestione connessioni real-time
- **Translation**: Servizio di traduzione

## Algoritmi chiave

### Generazione tag
1. Estrazione parole chiave dal contenuto del sogno
2. Filtraggio per rilevanza e frequenza
3. Categorizzazione in temi comuni (paesaggi, astronomia, emozioni)
4. Assegnazione di tag generici se insufficienti tag specifici
5. Normalizzazione e limitazione a tag esclusivamente single-word

### Algoritmo di matching
1. Calcolo similarità tag (60% del punteggio):
   - Intersezione tra i tag di due sogni
   - Ponderazione in base alla frequenza e rilevanza
2. Calcolo similarità contenuto (40% del punteggio):
   - Analisi vettoriale dei contenuti testuali
   - Confronto semantico tramite algoritmi NLP
3. Calcolo punteggio finale di similarità (0-100)
4. Applicazione soglia minima del 60% per considerare un match

## Aspetti di sicurezza
- ✓ Autenticazione sicura con sessioni
- ✓ Hashing delle password con salt
- ✓ Controlli di autorizzazione per tutte le operazioni sensibili
- ✓ Validazione input lato client e server
- ✓ Protezione delle route private
- ✓ Prevenzione di attacchi XSS e CSRF
- ✓ Cifratura dei messaggi chat con AES-256

## Roadmap futura
- [ ] Implementazione API reale per notifiche (attualmente simulate)
- [ ] Sistema di statistiche sui sogni
- [ ] Dashboard amministrativa per moderazione contenuti
- [ ] Supporto per altri media (audio, video)
- [ ] Integrazione con servizi esterni per analisi dei sogni
- [ ] Versione mobile nativa
- [ ] Modalità offline con sincronizzazione

## Decisioni di design
- **Estetica**: Neobrutalism + Pixel Art per un'esperienza distintiva
- **Colori**: Palette primaria (#F5F6F7, #FF4F4F, #FFD93D, #4F8CFF)
- **Font**: "Press Start 2P" per elementi distintivi, Inter per leggibilità
- **Componenti**: Design modulare e riutilizzabile
- **Flusso UX**: Percorso guidato verso il matching e le interazioni sociali

## Deployment e DevOps
- **Hosting**: Supporto per qualsiasi piattaforma Node.js
- **Database**: Neon per PostgreSQL serverless
- **Asset storage**: File system locale con opzione per CDN
- **Monitoraggio**: Logging integrato
- **CI/CD**: Configurabile con qualsiasi provider

## Accessibilità e Compliance
- ✓ WCAG 2.1 AA compliant
- ✓ Design responsivo per dispositivi mobile e desktop
- ✓ Supporto per screen reader
- ✓ Contrasto colori adeguato
- ✓ Internazionalizzazione completa

Questo documento rappresenta lo stato attuale e la roadmap dell'applicazione DreamConnect, fornendo una guida completa per lo sviluppo, la manutenzione e l'evoluzione futura.