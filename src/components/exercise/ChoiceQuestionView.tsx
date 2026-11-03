import { useId, useMemo, useState } from 'react';
import type { ChoiceQuestion } from '../../content/types';
import { CheckIcon } from '../art/Icons';
import { shuffled } from './shuffle';

export type AnswerMode = 'practice' | 'quiz' | 'challenge';

interface Props {
  question: ChoiceQuestion;
  /**
   * practice: feedback immediato e possibilità di riprovare;
   * quiz: feedback immediato, una sola risposta;
   * challenge: nessun suggerimento né feedback (esito alla fine).
   */
  mode: AnswerMode;
  /** Chiamata alla prima risposta inviata. */
  onFirstAnswer?: (correct: boolean, optionId: string) => void;
  /** Chiamata quando la domanda è risolta (practice) o risposta (quiz, challenge). */
  onDone?: () => void;
  doneLabel?: string;
  /** Collegamento alla pagina Learn da ripassare. */
  learnLink?: { href: string; label: string };
}

type Status = 'open' | 'wrong' | 'right' | 'locked';

export function ChoiceQuestionView({ question, mode, onFirstAnswer, onDone, doneLabel = 'Continua', learnLink }: Props) {
  const options = useMemo(() => shuffled(question.options), [question]);
  const [selected, setSelected] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>('open');
  const [tried, setTried] = useState<string[]>([]);
  const [hint, setHint] = useState(false);
  const name = useId();

  const chosen = question.options.find((o) => o.id === selected);
  const correct = selected === question.correct;
  const finished = status === 'right' || status === 'locked' || (mode === 'quiz' && status === 'wrong');

  const submit = () => {
    if (!selected) return;
    if (tried.length === 0) onFirstAnswer?.(correct, selected);
    setTried((t) => [...t, selected]);
    if (mode === 'challenge') setStatus('locked');
    else setStatus(correct ? 'right' : 'wrong');
  };

  const retry = () => {
    setSelected(null);
    setStatus('open');
  };

  return (
    <form
      className="question"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <fieldset className="question-fieldset" disabled={status !== 'open'}>
        <legend className="question-prompt">{question.prompt}</legend>
        {question.code && <pre className="code-block">{question.code}</pre>}
        <div className="options">
          {options.map((o) => {
            const isSel = selected === o.id;
            const showState = status === 'right' || status === 'wrong';
            const cls = [
              'option',
              isSel ? 'is-selected' : '',
              showState && isSel && status === 'right' ? 'is-correct' : '',
              showState && isSel && status === 'wrong' ? 'is-wrong' : '',
              mode === 'quiz' && status === 'wrong' && o.id === question.correct ? 'is-correct' : '',
              mode === 'practice' && status === 'open' && tried.includes(o.id) ? 'is-tried' : '',
            ]
              .filter(Boolean)
              .join(' ');
            return (
              <label key={o.id} className={cls}>
                <input type="radio" name={name} value={o.id} checked={isSel} onChange={() => setSelected(o.id)} />
                <span>{o.text}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {status === 'open' && (
        <div className="question-actions">
          <button type="submit" className="btn btn-primary" disabled={!selected}>
            Conferma risposta
          </button>
          {mode !== 'challenge' && question.hint && (
            <button type="button" className="btn btn-ghost" onClick={() => setHint(true)} disabled={hint}>
              {hint ? 'Suggerimento mostrato' : 'Suggerimento'}
            </button>
          )}
        </div>
      )}
      {hint && status === 'open' && (
        <p className="hint-box" role="note">
          <strong>Suggerimento:</strong> {question.hint}
        </p>
      )}

      <div aria-live="polite">
        {status === 'locked' && (
          <div className="feedback feedback-neutral">
            <p>Risposta registrata. L’esito arriverà alla fine della Challenge.</p>
          </div>
        )}
        {(status === 'right' || status === 'wrong') && chosen && (
          <div className={status === 'right' ? 'feedback feedback-good' : 'feedback feedback-bad'}>
            <p className="feedback-title">
              {status === 'right' ? (
                <>
                  <CheckIcon size={18} /> Corretto
                </>
              ) : (
                'Non è corretto'
              )}
            </p>
            <p>{chosen.feedback}</p>
            {(status === 'right' || mode === 'quiz') && <p className="feedback-explain">{question.explanation}</p>}
            {status === 'wrong' && learnLink && (
              <p>
                <a href={learnLink.href}>{learnLink.label}</a>
              </p>
            )}
          </div>
        )}
      </div>

      {(status === 'wrong' && mode === 'practice') && (
        <div className="question-actions">
          <button type="button" className="btn btn-primary" onClick={retry}>
            Riprova
          </button>
        </div>
      )}
      {finished && onDone && (
        <div className="question-actions">
          <button type="button" className="btn btn-primary" onClick={onDone}>
            {doneLabel}
          </button>
        </div>
      )}
    </form>
  );
}
