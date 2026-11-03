import { useMemo, useState } from 'react';
import type { OrderExercise } from '../../content/types';
import { CheckIcon } from '../art/Icons';
import { shuffledNotIdentity } from './shuffle';

interface Props {
  exercise: OrderExercise;
  onFirstAnswer?: (correct: boolean) => void;
  onDone?: () => void;
  doneLabel?: string;
  learnLink?: { href: string; label: string };
}

/** Riordino accessibile: ogni elemento si sposta con i pulsanti «su» e «giù». */
export function OrderExerciseView({ exercise, onFirstAnswer, onDone, doneLabel = 'Continua', learnLink }: Props) {
  const initial = useMemo(() => shuffledNotIdentity(exercise.items), [exercise]);
  const [order, setOrder] = useState(initial);
  const [checked, setChecked] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [hint, setHint] = useState(false);
  const [announce, setAnnounce] = useState('');

  const correctAt = (i: number) => order[i].id === exercise.items[i].id;
  const allRight = order.every((_, i) => correctAt(i));
  const solved = checked && allRight;

  const move = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= order.length) return;
    const next = [...order];
    [next[i], next[j]] = [next[j], next[i]];
    setOrder(next);
    setChecked(false);
    setAnnounce(`${next[j].text} spostato in posizione ${j + 1}`);
  };

  const check = () => {
    if (attempts === 0) onFirstAnswer?.(allRight);
    setAttempts((a) => a + 1);
    setChecked(true);
  };

  const wrongCount = order.filter((_, i) => !correctAt(i)).length;

  return (
    <div className="question">
      <p className="question-prompt">{exercise.prompt}</p>
      <ol className="order-list">
        {order.map((item, i) => {
          const state = checked ? (correctAt(i) ? 'is-correct' : 'is-wrong') : '';
          return (
            <li key={item.id} className={`order-item ${state}`}>
              <span className="order-pos">{i + 1}</span>
              <span className="order-text">{item.text}</span>
              {checked && <span className="sr-only">{correctAt(i) ? 'posizione corretta' : 'posizione sbagliata'}</span>}
              {!solved && (
                <span className="order-actions">
                  <button type="button" className="btn btn-mini" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Sposta su: ${item.text}`}>
                    ↑
                  </button>
                  <button
                    type="button"
                    className="btn btn-mini"
                    onClick={() => move(i, 1)}
                    disabled={i === order.length - 1}
                    aria-label={`Sposta giù: ${item.text}`}
                  >
                    ↓
                  </button>
                </span>
              )}
            </li>
          );
        })}
      </ol>
      <p className="sr-only" aria-live="polite">
        {announce}
      </p>

      {!solved && (
        <div className="question-actions">
          <button type="button" className="btn btn-primary" onClick={check}>
            Verifica l’ordine
          </button>
          {exercise.hint && (
            <button type="button" className="btn btn-ghost" onClick={() => setHint(true)} disabled={hint}>
              {hint ? 'Suggerimento mostrato' : 'Suggerimento'}
            </button>
          )}
        </div>
      )}
      {hint && !solved && (
        <p className="hint-box" role="note">
          <strong>Suggerimento:</strong> {exercise.hint}
        </p>
      )}

      <div aria-live="polite">
        {checked && (
          <div className={allRight ? 'feedback feedback-good' : 'feedback feedback-bad'}>
            <p className="feedback-title">
              {allRight ? (
                <>
                  <CheckIcon size={18} /> Ordine corretto
                </>
              ) : (
                `${wrongCount} ${wrongCount === 1 ? 'elemento è' : 'elementi sono'} nella posizione sbagliata`
              )}
            </p>
            {allRight ? <p className="feedback-explain">{exercise.explanation}</p> : <p>Gli elementi in rosso non sono al loro posto: spostali e verifica di nuovo.</p>}
            {!allRight && learnLink && (
              <p>
                <a href={learnLink.href}>{learnLink.label}</a>
              </p>
            )}
          </div>
        )}
      </div>
      {solved && onDone && (
        <div className="question-actions">
          <button type="button" className="btn btn-primary" onClick={onDone}>
            {doneLabel}
          </button>
        </div>
      )}
    </div>
  );
}
