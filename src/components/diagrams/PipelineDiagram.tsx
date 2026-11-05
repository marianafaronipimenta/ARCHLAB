import { Fragment, useState } from 'react';
import { schedule, STAGES, totalBubbles, totalCycles } from '../../sim/pipeline';
import { PIPELINE_EXAMPLES } from '../../sim/pipelineExamples';

/** Diagramma multi-ciclo: istruzioni dall’alto in basso, tempo da sinistra a destra. */
export function PipelineDiagram() {
  const [exId, setExId] = useState(PIPELINE_EXAMPLES[0].id);
  const [fw, setFw] = useState(true);
  const ex = PIPELINE_EXAMPLES.find((e) => e.id === exId)!;
  const rows = schedule(ex.prog, fw);
  const cycles = totalCycles(rows);
  const cols = Array.from({ length: cycles }, (_, i) => i + 1);

  return (
    <div className="pipe">
      <div className="pipe-controls">
        <div className="pipe-group" role="group" aria-label="Sequenza">
          {PIPELINE_EXAMPLES.map((e) => (
            <button key={e.id} type="button" className={e.id === exId ? 'btn btn-small is-current' : 'btn btn-small'} aria-pressed={e.id === exId} onClick={() => setExId(e.id)}>
              {e.title}
            </button>
          ))}
        </div>
        <label className="pipe-toggle">
          <input type="checkbox" checked={fw} onChange={(e) => setFw(e.target.checked)} /> Propagazione (forwarding)
        </label>
      </div>
      <div className="pipe-scroll" tabIndex={0} aria-label="Diagramma della pipeline, scorrevole">
        <table className="pipe-table">
          <thead>
            <tr>
              <th scope="col">Istruzione</th>
              {cols.map((c) => (
                <th key={c} scope="col">
                  CC{c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, k) => (
              <Fragment key={k}>
                {Array.from({ length: r.bubbles }, (_, b) => (
                  <tr key={`b${b}`} className="pipe-bubble">
                    <th scope="row">bolla</th>
                    {cols.map((c) => (
                      <td key={c} />
                    ))}
                  </tr>
                ))}
                <tr>
                  <th scope="row">
                    <code>{r.instr.text}</code>
                  </th>
                  {cols.map((c) => {
                    const s = c - r.start;
                    return (
                      <td key={c} className={s >= 0 && s < 5 ? `pipe-st pipe-${STAGES[s].toLowerCase()}` : ''}>
                        {s >= 0 && s < 5 ? STAGES[s] : ''}
                      </td>
                    );
                  })}
                </tr>
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
      <p className="pipe-summary" aria-live="polite">
        {totalBubbles(rows)} {totalBubbles(rows) === 1 ? 'bolla' : 'bolle'}, {cycles} cicli in totale (senza hazard sarebbero {ex.prog.length + 4}).
      </p>
      <ul className="pipe-notes">
        {rows.flatMap((r) => r.notes).map((n, i) => (
          <li key={i}>{n}</li>
        ))}
      </ul>
    </div>
  );
}
