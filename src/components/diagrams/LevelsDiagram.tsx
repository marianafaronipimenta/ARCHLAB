import { useState } from 'react';

/* Testi dalle slide 12–21 della lezione 1. */
const LEVELS = [
  {
    n: 5,
    name: 'Livello applicativo',
    course: 'Programmazione 1 e 2',
    text: 'Macchina virtuale usata per sviluppare applicazioni: C, C++, Java, Python… Costrutti astratti e indipendenti dall’hardware; di solito tradotti da un compilatore, a volte eseguiti da un interprete (Java, Python).',
  },
  {
    n: 4,
    name: 'Linguaggio assemblativo',
    course: 'Architettura degli elaboratori 2',
    text: 'Rappresentazione simbolica dei livelli L2+L3: ogni istruzione simbolica corrisponde in genere a un’istruzione binaria dell’ISA, tradotta dall’assemblatore. Usato per driver, parti del sistema operativo, librerie, codice real-time.',
  },
  {
    n: 3,
    name: 'Sistema operativo',
    course: 'Sistemi operativi (secondo anno)',
    text: 'Livello «ibrido» che estende l’ISA: molte istruzioni sono quelle di L2, eseguite direttamente; in più offre system call (processi, memoria, file, dispositivi) eseguite da un interprete, il sistema operativo.',
  },
  {
    n: 2,
    name: 'ISA (linguaggio macchina)',
    course: 'Architettura degli elaboratori 2',
    text: 'Insieme delle istruzioni base comprese ed eseguite dalla microarchitettura: operazioni aritmetiche, logiche, di controllo e di gestione della memoria. È il «linguaggio macchina» del calcolatore.',
  },
  {
    n: 1,
    name: 'Microarchitettura',
    course: 'Architettura degli elaboratori 2',
    text: 'Data path (registri d’uso generale, ALU, connessioni) e control path (PC, IR, control unit cablata o microprogrammata). Sequenzializza le microistruzioni che eseguono le istruzioni dell’ISA.',
  },
  {
    n: 0,
    name: 'Logica digitale',
    course: 'Architettura degli elaboratori 1',
    text: 'Circuiti elettronici che realizzano operazioni elementari su valori binari: porte logiche, circuiti combinatori e sequenziali, registri e memorie elementari.',
  },
];

export function LevelsDiagram() {
  const [sel, setSel] = useState(2);
  const level = LEVELS.find((l) => l.n === sel)!;
  return (
    <div className="levels">
      <div className="levels-stack" role="group" aria-label="Livelli convenzionali, dal più alto al più basso">
        {LEVELS.map((l) => (
          <button
            key={l.n}
            type="button"
            className={l.n === sel ? 'level is-current' : 'level'}
            aria-pressed={l.n === sel}
            onClick={() => setSel(l.n)}
            style={{ marginInline: `${(5 - l.n) * 2}%` }}
          >
            <span className="level-n">L{l.n}</span>
            <span className="level-name">{l.name}</span>
          </button>
        ))}
        <p className="level-physical">Sotto L0: livello fisico (−1)</p>
      </div>
      <div className="levels-detail" aria-live="polite">
        <p className="levels-detail-n">Livello {level.n}</p>
        <h4 className="levels-detail-name">{level.name}</h4>
        <p>{level.text}</p>
        <p className="levels-detail-course">Dove si studia: {level.course}</p>
      </div>
    </div>
  );
}
