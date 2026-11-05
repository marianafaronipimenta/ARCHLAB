import { useId, useMemo, useState } from 'react';
import { evalPostfix, postfixString, toPostfix } from '../../sim/rpn';

const EXAMPLES = ['(5*4+3*2)-1', '(8+2*5)/(1+3*2-4)', '(a2 + a3) * a4'];

/** Da notazione infissa a postfissa (shunting yard) e valutazione passo per passo sullo stack. */
export function RpnDiagram() {
  const id = useId();
  const [expr, setExpr] = useState(EXAMPLES[0]);
  const [step, setStep] = useState(0);
  const parsed = useMemo(() => {
    try {
      const tokens = toPostfix(expr);
      let evalResult: ReturnType<typeof evalPostfix> | null = null;
      try {
        evalResult = evalPostfix(tokens);
      } catch {
        evalResult = null;
      }
      return { postfix: postfixString(tokens), evalResult, error: null as string | null };
    } catch (e) {
      return { postfix: '', evalResult: null, error: (e as Error).message };
    }
  }, [expr]);
  const steps = parsed.evalResult?.steps ?? [];
  const shown = steps[Math.min(step, steps.length - 1)];

  return (
    <div className="rpn">
      <div className="rpn-input">
        <label htmlFor={id}>Espressione infissa</label>
        <input
          id={id}
          value={expr}
          spellCheck={false}
          onChange={(e) => {
            setExpr(e.target.value);
            setStep(0);
          }}
        />
        <div className="rpn-examples">
          {EXAMPLES.map((x) => (
            <button
              key={x}
              type="button"
              className="btn btn-small btn-ghost"
              onClick={() => {
                setExpr(x);
                setStep(0);
              }}
            >
              {x}
            </button>
          ))}
        </div>
      </div>
      <p aria-live="polite">
        {parsed.error ? (
          <span className="rpn-error">{parsed.error}</span>
        ) : (
          <>
            Postfissa: <code className="rpn-postfix">{parsed.postfix}</code>
          </>
        )}
      </p>
      {parsed.evalResult ? (
        <div className="rpn-eval">
          <div className="rpn-stack" aria-label="Contenuto dello stack, dalla cima">
            {[...shown.stack].reverse().map((v, i) => (
              <span key={i} className={i === 0 ? 'rpn-cell is-top' : 'rpn-cell'}>
                {v}
              </span>
            ))}
          </div>
          <p aria-live="polite">
            Passo {step + 1} di {steps.length}: <strong>{shown.token}</strong> → {shown.action}
            {step === steps.length - 1 && <> · risultato <strong>{parsed.evalResult.result}</strong></>}
          </p>
          <div className="row-actions">
            <button type="button" className="btn btn-small" disabled={step === 0} onClick={() => setStep(step - 1)}>
              ← Indietro
            </button>
            <button type="button" className="btn btn-small btn-primary" disabled={step >= steps.length - 1} onClick={() => setStep(step + 1)}>
              Passo successivo →
            </button>
          </div>
        </div>
      ) : (
        !parsed.error && <p className="muted">Con le variabili si vede solo la conversione; usa numeri per valutare sullo stack.</p>
      )}
    </div>
  );
}
