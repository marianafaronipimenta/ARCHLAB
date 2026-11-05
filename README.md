# ARCHLAB — Computer Architecture II

Piattaforma interattiva di studio per Architettura degli Elaboratori II: sette moduli (dall’approccio strutturale alla pipeline RISC-V), con Learn, Practice, Quiz, Challenge e Progress, gamificazione e simulatori.

**Stato attuale:** schermata iniziale e **sette moduli completi** (Learn, Practice, Quiz, Challenge, Progress), con diagrammi interattivi: memory layout, Location Counter passo passo, unità di controllo, pipeline multi-ciclo e predizione dei salti. I simulatori autonomi sono ancora in sviluppo e l’interfaccia lo indica.

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
