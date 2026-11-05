import { useState } from 'react';

const PHASES = [
  {
    name: 'Fetch',
    text: 'La CPU legge dalla memoria l’istruzione indicata dal Program Counter (PC) e la copia nel registro delle istruzioni (IR). Il PC viene aggiornato per puntare alla prossima istruzione.',
  },
  {
    name: 'Decode',
    text: 'L’istruzione nell’IR viene interpretata: la CPU determina quale operazione eseguire e quali registri o dati coinvolgere.',
  },
  {
    name: 'Execute',
    text: 'La CPU esegue l’istruzione, eventualmente leggendo o scrivendo dati in memoria o nei registri. Poi il ciclo ricomincia con un nuovo fetch.',
  },
];

/** Ciclo fetch-decode-execute, una fase alla volta. */
export function FetchDecodeDiagram() {
  const [i, setI] = useState(0);
  return (
    <div className="fde">
      <ol className="fde-ring" aria-label="Fasi del ciclo">
        {PHASES.map((p, k) => (
          <li key={p.name}>
            <button type="button" className={k === i ? 'fde-phase is-current' : 'fde-phase'} aria-pressed={k === i} onClick={() => setI(k)}>
              {k + 1}. {p.name}
            </button>
          </li>
        ))}
      </ol>
      <p className="fde-text" aria-live="polite">
        {PHASES[i].text}
      </p>
      <button type="button" className="btn btn-small" onClick={() => setI((i + 1) % PHASES.length)}>
        Fase successiva →
      </button>
    </div>
  );
}
