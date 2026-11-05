import { useMemo, useState } from 'react';
import { hex, runLc } from '../../sim/lc';
import { LC_EXAMPLES } from '../../sim/lcExamples';

/** Esegue un programma riga per riga mostrando l’LC e la symbol table che si riempie. */
export function LocationCounterDiagram() {
  const [exId, setExId] = useState(LC_EXAMPLES[0].id);
  const [row, setRow] = useState(-1);
  const ex = LC_EXAMPLES.find((e) => e.id === exId)!;

  // Per ogni riga del sorgente: LC prima, LC dopo e simboli definiti.
  const rows = useMemo(() => {
    const ops = ex.source.flatMap((r, i) => r.ops.map((op) => ({ op, i })));
    const steps = runLc(ops.map((o) => o.op), ex.start);
    let lc = ex.start;
    return ex.source.map((_r, i) => {
      const mine = steps.filter((_, k) => ops[k].i === i);
      const before = mine.length ? mine[0].before : lc;
      const after = mine.length ? mine[mine.length - 1].after : lc;
      lc = after;
      return { before, after, symbols: mine.flatMap((s) => (s.symbol ? [s.symbol] : [])) };
    });
  }, [ex]);

  const lc = row < 0 ? ex.start : rows[row].after;
  const table = rows.slice(0, row + 1).flatMap((r) => r.symbols);
  const cur = row >= 0 ? ex.source[row] : undefined;
  const done = row === ex.source.length - 1;

  const pick = (id: string) => {
    setExId(id);
    setRow(-1);
  };

  return (
    <div className="lcsim">
      <div className="lcsim-examples" role="group" aria-label="Programma d’esempio">
        {LC_EXAMPLES.map((e) => (
          <button key={e.id} type="button" className={e.id === exId ? 'btn btn-small is-current' : 'btn btn-small'} aria-pressed={e.id === exId} onClick={() => pick(e.id)}>
            {e.title}
          </button>
        ))}
      </div>
      <div className="lcsim-grid">
        <ol className="lcsim-source" aria-label="Sorgente">
          {ex.source.map((r, i) => (
            <li key={i} className={i === row ? 'is-current' : i < row ? 'is-done' : ''}>
              <span className="lcsim-addr">{i <= row && rows[i].after !== rows[i].before ? hex(rows[i].before) : ''}</span>
              <code>{r.text}</code>
            </li>
          ))}
        </ol>
        <div className="lcsim-side">
          <p className="lcsim-lc">
            <span>LC</span>
            <strong aria-live="polite">{hex(lc)}</strong>
          </p>
          {cur && (
            <p className="lcsim-note">
              {rows[row].after !== rows[row].before ? `+${rows[row].after - rows[row].before} byte. ` : 'L’LC non avanza. '}
              {cur.note}
            </p>
          )}
          <table className="lcsim-table">
            <caption>Symbol table</caption>
            <thead>
              <tr>
                <th scope="col">Simbolo</th>
                <th scope="col">Valore</th>
              </tr>
            </thead>
            <tbody>
              {table.length === 0 ? (
                <tr>
                  <td colSpan={2} className="muted">
                    vuota
                  </td>
                </tr>
              ) : (
                table.map((s) => (
                  <tr key={s.name}>
                    <td>{s.name}</td>
                    <td>{hex(s.value)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="lcsim-controls">
        <button type="button" className="btn btn-small" disabled={row < 0} onClick={() => setRow(-1)}>
          Ricomincia
        </button>
        <button type="button" className="btn btn-small" disabled={row < 0} onClick={() => setRow(row - 1)}>
          ← Indietro
        </button>
        <button type="button" className="btn btn-small btn-primary" disabled={done} onClick={() => setRow(row + 1)}>
          Riga successiva →
        </button>
      </div>
    </div>
  );
}
