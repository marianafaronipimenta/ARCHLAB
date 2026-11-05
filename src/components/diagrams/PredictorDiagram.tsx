import { useState } from 'react';
import { errors, simulateLoop, stateLabel, type PredKind } from '../../sim/predictor';

/** Predittore a 1 o 2 bit sul ciclo «bne x1, x0, loop», eseguito una o più volte. */
export function PredictorDiagram() {
  const [kind, setKind] = useState<PredKind>('1bit');
  const [n, setN] = useState(5);
  const [runs, setRuns] = useState(2);
  const [init, setInit] = useState(0);
  const steps = simulateLoop(kind, n, runs, init);
  const states = kind === '1bit' ? [0, 1] : [0, 1, 2, 3];

  const pickKind = (k: PredKind) => {
    setKind(k);
    setInit(0);
  };

  return (
    <div className="pred">
      <pre className="pred-code">{`    addi x1, x0, ${n}
loop:
    addi x1, x1, -1
    bne  x1, x0, loop    # preso ${n - 1} volte, poi non preso`}</pre>
      <div className="pred-controls">
        <div role="group" aria-label="Predittore">
          {(['1bit', '2bit'] as const).map((k) => (
            <button key={k} type="button" className={k === kind ? 'btn btn-small is-current' : 'btn btn-small'} aria-pressed={k === kind} onClick={() => pickKind(k)}>
              {k === '1bit' ? '1 bit' : '2 bit'}
            </button>
          ))}
        </div>
        <label>
          Iterazioni
          <select value={n} onChange={(e) => setN(Number(e.target.value))}>
            {[3, 5, 8].map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </label>
        <label>
          Esecuzioni del ciclo
          <select value={runs} onChange={(e) => setRuns(Number(e.target.value))}>
            {[1, 2, 3].map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </label>
        <label>
          Stato iniziale
          <select value={init} onChange={(e) => setInit(Number(e.target.value))}>
            {states.map((s) => (
              <option key={s} value={s}>
                {stateLabel(kind, s)}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="pipe-scroll" tabIndex={0} aria-label="Tabella delle predizioni, scorrevole">
        <table className="pred-table">
          <thead>
            <tr>
              <th scope="col">Esec.</th>
              <th scope="col">Iter.</th>
              <th scope="col">Stato prima</th>
              <th scope="col">Predizione</th>
              <th scope="col">Salto reale</th>
              <th scope="col">Esito</th>
              <th scope="col">Stato dopo</th>
            </tr>
          </thead>
          <tbody>
            {steps.map((s, i) => {
              const ok = s.predicted === s.taken;
              return (
                <tr key={i} className={s.iteration === 1 && s.run > 1 ? 'pred-newrun' : ''}>
                  <td>{s.run}</td>
                  <td>{s.iteration}</td>
                  <td>{stateLabel(kind, s.before)}</td>
                  <td>{s.predicted ? 'Preso' : 'Non preso'}</td>
                  <td>{s.taken ? 'Preso' : 'Non preso'}</td>
                  <td className={ok ? 'pred-ok' : 'pred-ko'}>{ok ? 'corretta' : 'errore'}</td>
                  <td>{stateLabel(kind, s.after)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="pipe-summary" aria-live="polite">
        Errori per esecuzione: {Array.from({ length: runs }, (_, r) => errors(steps, r + 1)).join(', ')}.
      </p>
    </div>
  );
}
