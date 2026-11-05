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
| 04 RISC-V (RV32I) | 4. RISC-V (RV32I) · 5. Primi passi in RISC-V · 6. Gestire il flusso d’esecuzione · 7. Funzioni e procedure · 9. RISC-V (RV32IM) |
| 05 Location Counter | 8. Location Counter |
| 06 Il processore | 10. Il processore |
| 07 Pipeline | 11. La pipeline · 12. Hazard sui dati · 13. Hazard sul controllo |

C’è anche «Materiale utilizzabile all’esame.pdf», da usare più avanti per i riferimenti rapidi. I contenuti del modulo 01 seguono la lezione 1 (riferimenti «slide n» = posizione nella presentazione).

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

### Moduli (il modulo 01 fa da modello)

```
src/
  content/
    types.ts                  Schema: pagine Learn (blocchi, diagrammi, punti chiave, verifica), esercizi, quiz, challenge
    m01-approccio-strutturale.ts
    index.ts                  Registro dei contenuti + validateContent()
  router.ts                   Routing via hash: #/, #/<sezione>, #/modulo/<id>/<scheda>[/<pagina>]
  state/store.tsx             ProgressProvider: completeSection, recordResults, rememberLearnPage
  components/
    exercise/                 ChoiceQuestionView (practice/quiz/challenge), OrderExerciseView, MatchExerciseView
    diagrams/                 Diagrammi interattivi della sezione Learn
    module/                   LearnView, PracticeView, AssessmentView (quiz e challenge), ProgressView
  screens/ModuleScreen.tsx    Intestazione del modulo e schede Learn · Practice · Quiz · Challenge · Progress
```

| Sezione | Funzionamento | Completamento | XP |
| --- | --- | --- | --- |
| Learn | Pagine con testi, codice, riquadri, diagrammi interattivi, punti da ricordare e verifica rapida; riprende dall’ultima pagina aperta | «Completa Learn» sull’ultima pagina | 50 |
| Practice | Un esercizio alla volta (scelta multipla, ordinamento, abbinamento), tentativi illimitati, feedback per ogni opzione, link alla pagina da ripassare | Tutti gli esercizi risolti | 75 |
| Quiz | Una risposta per domanda, feedback e spiegazione immediati, resoconto finale | Almeno 60% (il 100% sblocca «Zero errori») · **completa il modulo e sblocca il successivo** | 100 |
| Challenge (facoltativa) | Domande nuove, nessun suggerimento, esito solo alla fine con resoconto | Almeno 60% · **non incide sull’avanzamento** | 150 |
| Progress | Stato delle sezioni, miglior punteggio, tentativi, errori da ripassare con spiegazione e link | — | — |

**Avanzamento**: un modulo è completato quando il suo Quiz raggiunge almeno il 60%; il modulo 01 è sempre aperto e ogni modulo successivo si sblocca completando il precedente. Learn e Practice sono il percorso consigliato e contano nella percentuale del modulo, ma non bloccano. La Challenge è facoltativa: dà XP e la conquista «Sfida superata», ma non serve per avanzare.

Gli errori al primo tentativo entrano in «Da ripassare» e ne escono quando la stessa domanda viene risolta correttamente.

**Aggiungere un modulo**: creare `src/content/mNN-….ts` con lo schema di `types.ts`, registrarlo in `content/index.ts` e aggiungere le sezioni pronte ad `availableSections` in `data/modules.ts`. `npm test` verifica ID, riferimenti, opzioni, feedback e che le domande della Challenge siano nuove.

### Prossimi passi

- Moduli 02–07 con lo stesso schema.
- `src/sim/`: logica pura e testata dei simulatori (registri RV32I, esecuzione, data path, pipeline per cicli).

## Regole rispettate

- **Niente funzionalità finte**: progressi, XP, livello e conquiste si calcolano solo da attività reali; i moduli non ancora sviluppati restano «In costruzione» e i simulatori «In sviluppo».
- **Studio prolungato**: testo principale non ciano, contrasti alti, nessuna animazione invadente; la modalità studio e `prefers-reduced-motion` spengono bagliori e animazioni.
- **Accessibilità**: link «Vai al contenuto», focus visibile, barre di avanzamento con `role="progressbar"`, dialog nativo con Esc, illustrazioni decorative nascoste ai lettori di schermo.
- **Responsività**: verificata a 1920, 1280 e 375 px senza scorrimento orizzontale; sotto i 900 px la sidebar diventa una barra orizzontale.
