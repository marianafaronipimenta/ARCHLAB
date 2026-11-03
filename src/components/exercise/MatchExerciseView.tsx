import { useId, useMemo, useState } from 'react';
import type { MatchExercise } from '../../content/types';
import { CheckIcon } from '../art/Icons';
import { shuffled } from './shuffle';

interface Props {
  exercise: MatchExercise;
  onFirstAnswer?: (correct: boolean) => void;
  onDone?: () => void;
  doneLabel?: string;
  learnLink?: { href: string; label: string };
}

/** Abbinamento con menu a tendina nativi: accessibile da tastiera e su mobile. */
export function MatchExerciseView({ exercise, onFirstAnswer, onDone, doneLabel = 'Continua', learnLink }: Props) {
  const rights = useMemo(() => shuffled(exercise.pairs.map((p) => ({ id: p.id, text: p.right }))), [exercise]);
  const [choice, setChoice] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [hint, setHint] = useState(false);
  const base = useId();

  const complete = exercise.pairs.every((p) => choice[p.id]);
  const isRight = (id: string) => choice[id] === id;
  const allRight = exercise.pairs.every((p) => isRight(p.id));
  const solved = checked && allRight;

  const check = () => {
    if (attempts === 0) onFirstAnswer?.(allRight);
    setAttempts((a) => a + 1);
    setChecked(true);
  };

  return (
    <div className="question">
      <p className="question-prompt">{exercise.prompt}</p>
      <ul className="match-list">
        {exercise.pairs.map((p) => {
          const state = checked ? (isRight(p.id) ? 'is-correct' : 'is-wrong') : '';
          const selId = `${base}-${p.id}`;
          return (
            <li key={p.id} className={`match-item ${state}`}>
              <label htmlFor={selId} className="match-left">
                {p.left}
              </label>
              <select
                id={selId}
                className="match-select"
                value={choice[p.id] ?? ''}
                disabled={solved}
                onChange={(e) => {
                  setChoice({ ...choice, [p.id]: e.target.value });
                  setChecked(false);
                }}
              >
                <option value="" disabled>
                  Scegli…
                </option>
                {rights.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.text}
                  </option>
                ))}
              </select>
              {choice[p.id] && (
                <p className="match-chosen" aria-hidden="true">
                  {rights.find((r) => r.id === choice[p.id])?.text}
                </p>
              )}
              {checked && (
                <p className="match-feedback">
                  <span className="sr-only">{isRight(p.id) ? 'Corretto. ' : 'Non corretto. '}</span>
                  {isRight(p.id) ? p.feedback : 'Questa descrizione non corrisponde: rileggi le caratteristiche del livello o della tecnica.'}
                </p>
              )}
            </li>
          );
        })}
      </ul>

      {!solved && (
        <div className="question-actions">
          <button type="button" className="btn btn-primary" onClick={check} disabled={!complete}>
            Verifica gli abbinamenti
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
                  <CheckIcon size={18} /> Tutti gli abbinamenti sono corretti
                </>
              ) : (
                `${exercise.pairs.filter((p) => !isRight(p.id)).length} abbinamenti da correggere`
              )}
            </p>
            {allRight && <p className="feedback-explain">{exercise.explanation}</p>}
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
