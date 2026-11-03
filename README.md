# ARCHLAB — Computer Architecture II

Piattaforma interattiva di studio per Architettura degli Elaboratori II: sette moduli (dall’approccio strutturale alla pipeline RISC-V), con Learn, Practice, Quiz, Challenge e Progress, gamificazione e simulatori.

**Stato attuale:** è pronta la **schermata iniziale**, per validare identità visiva, composizione e organizzazione. I moduli e i simulatori sono ancora da sviluppare e la home lo indica chiaramente.

Tutto funziona nel browser: nessun backend, progressi e preferenze in `localStorage`.

## Comandi

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # Vitest
npm run build      # typecheck + build in dist/
npm run preview
```

## Documentazione

- [`docs/ARCHITETTURA.md`](docs/ARCHITETTURA.md): analisi iniziale, fonti (cartella «architettura 2»), struttura dei componenti e prossimi passi.
