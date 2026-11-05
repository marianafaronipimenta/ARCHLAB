import { useState } from 'react';

/* Memory layout di un programma RISC-V (lezione 4): dall’indirizzo alto al basso. */
const REGIONS = [
  { id: 'stack', name: 'Stack', note: 'cresce verso il basso ↓', text: 'Variabili locali, parametri oltre l’ottavo, indirizzi di ritorno salvati. È gestito con il registro sp (x2): allocare significa sottrarre a sp, liberare significa sommare. Ha dimensione limitata e un accesso molto veloce.' },
  { id: 'free', name: 'Spazio libero', note: '', text: 'La zona tra heap e stack: entrambi possono crescere verso di essa. Se si incontrano, la memoria è esaurita.' },
  { id: 'heap', name: 'Heap', note: 'cresce verso l’alto ↑ (program break)', text: 'Memoria dinamica, gestita dal memory allocator (malloc/free in C). Il limite superiore è il program break. Se un blocco non viene mai liberato si ha un memory leak.' },
  { id: 'static', name: 'Dati statici', note: '.data / .bss', text: 'Variabili globali e statiche, con dimensione nota prima dell’esecuzione. Nell’assembly corrispondono alle sezioni .data (inizializzate) e .bss (non inizializzate).' },
  { id: 'code', name: 'Codice', note: '.text', text: 'Le istruzioni del programma. Il Program Counter punta qui.' },
];

export function MemoryLayoutDiagram() {
  const [sel, setSel] = useState('stack');
  const cur = REGIONS.find((r) => r.id === sel)!;
  return (
    <div className="memmap">
      <div className="memmap-col">
        <span className="memmap-addr">indirizzi alti</span>
        <ol className="memmap-list" aria-label="Regioni della memoria">
          {REGIONS.map((r) => (
            <li key={r.id}>
              <button type="button" className={`memmap-region memmap-${r.id}${r.id === sel ? ' is-current' : ''}`} aria-pressed={r.id === sel} onClick={() => setSel(r.id)}>
                <strong>{r.name}</strong>
                {r.note && <span>{r.note}</span>}
              </button>
            </li>
          ))}
        </ol>
        <span className="memmap-addr">indirizzi bassi</span>
      </div>
      <p className="memmap-text" aria-live="polite">
        <strong>{cur.name}.</strong> {cur.text}
      </p>
    </div>
  );
}
