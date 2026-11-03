# ARCHLAB — organizzazione del progetto

## Analisi di partenza

Nella cartella di lavoro non esisteva un progetto ARCHLAB: c’era solo NETRUNNER (React 18, Vite 5, TypeScript strict, Vitest 2, CSS globale, nessun backend, salvataggio in `localStorage`). ARCHLAB nasce come progetto separato con **lo stesso stack e le stesse dipendenze**, senza aggiungerne di nuove.

## Fonti dei contenuti

Cartella Google Drive «architettura 2» (corso Architettura degli Elaboratori, materiale del docente):

| Modulo | Lezioni |
| --- | --- |
| 01 Approccio strutturale | 1. Approccio strutturale |
| 02 Assembly, Object and Executable Files | 2. Assembly, object, and executable files |
| 03 ISA | 3. ISA |
| 04 RISC-V (RV32I) | 4. RISC-V (RV32I) · 5. Primi passi in RISC-V · 6. Gestire il flusso d’esecuzione · 9. RISC-V (RV32IM) |
| 05 Location Counter | 8. Location Counter |
| 06 Il processore | 10. Il processore |
| 07 Pipeline | 11. La pipeline · 12. Hazard sui dati · 13. Hazard sul controllo |

Nella cartella **manca la lezione 7**. C’è anche «Materiale utilizzabile all’esame.pdf», da usare più avanti per i riferimenti rapidi. Per la home sono stati usati solo titoli e obiettivi delle lezioni.

## Struttura

```
src/
  data/                 Dati del corso, separati dalla grafica
    modules.ts          7 moduli: ID stabili, titoli, argomenti, lezioni di origine, sezioni disponibili
    catalog.ts          Simulatori previsti e conquiste
  state/
    progress.ts         Modello dei progressi, salvataggio, selettori (XP, livello, conquiste, prossimo passo)
    progress.test.ts
    hooks.ts            useProgress, usePreferences (modalità studio)
  components/
    ui/                 Mattoni riutilizzabili: Panel, ProgressBar
    art/                Icone e illustrazioni SVG (scheda madre, arte dei moduli)
    layout/             Header, Sidebar, SettingsDialog
    home/               WelcomeHero, ModuleCard, StatusPanels, SimulatorCard
  screens/
    HomeScreen.tsx
  styles/               tokens.css (colori, font, modalità studio), base, layout, home
```

### Prossimi passi previsti

```
src/
  content/<modulo>/     Lezioni (Learn), esercizi (Practice), quiz, challenge di ogni modulo
  screens/ModuleScreen.tsx   Schede Learn · Practice · Quiz · Challenge · Progress
  components/exercise/  Domanda a scelta multipla, risposta numerica/esadecimale, codice assembly, feedback con spiegazione dell’errore
  sim/                  Logica pura e testata dei simulatori (registri RV32I, esecuzione, data path, pipeline per cicli)
```

Una sezione diventa disponibile aggiungendone l’ID ad `availableSections` del modulo: la card, il prossimo passo e i progressi si aggiornano da soli.

## Regole rispettate

- **Niente funzionalità finte**: progressi, XP, livello e conquiste partono da zero e si calcolano solo da completamenti reali; i pulsanti dei moduli e del prossimo passo sono disabilitati con la dicitura «In costruzione»; i simulatori sono marcati «In sviluppo». Funzionano davvero la navigazione tra le sezioni della home e le impostazioni (modalità studio, salvata nel browser).
- **Studio prolungato**: testo principale non ciano, contrasti alti, nessuna animazione invadente; la modalità studio e `prefers-reduced-motion` spengono bagliori e animazioni.
- **Accessibilità**: link «Vai al contenuto», focus visibile, barre di avanzamento con `role="progressbar"`, dialog nativo con Esc, illustrazioni decorative nascoste ai lettori di schermo.
- **Responsività**: verificata a 1920, 1280 e 375 px senza scorrimento orizzontale; sotto i 900 px la sidebar diventa una barra orizzontale.
