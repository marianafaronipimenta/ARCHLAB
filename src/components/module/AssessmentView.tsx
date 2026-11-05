import { useMemo, useState } from 'react';
import type { ChoiceQuestion, ModuleContent } from '../../content/types';
import type { CourseModule } from '../../data/modules';
import { homeHref, moduleHref } from '../../router';
import { PASS_SCORE } from '../../state/progress';
import { BoltIcon, CheckIcon } from '../art/Icons';
import { ChoiceQuestionView } from '../exercise/ChoiceQuestionView';
import { shuffled } from '../exercise/shuffle';
import { Panel } from '../ui/Panel';
import { ProgressBar } from '../ui/ProgressBar';

interface Props {
  content: ModuleContent;
  mode: 'quiz' | 'challenge';
  /** Miglior punteggio già ottenuto, se esiste. */
  best?: number;
  /** Modulo successivo, per il collegamento dopo il superamento del Quiz. */
  nextModule?: CourseModule;
  /** Chiamata alla fine con il punteggio e l’esito di ogni domanda. */
  onFinish: (score: number, results: { id: string; correct: boolean }[]) => void;
}

interface Answer {
  id: string;
  optionId: string;
  correct: boolean;
}

const COPY = {
  quiz: {
    title: 'Quiz',
    xp: 100,
    start: 'Inizia il quiz',
    next: 'Domanda successiva',
    last: 'Vedi il risultato',
    rule: 'Superarlo completa il modulo e sblocca il successivo',
  },
  challenge: {
    title: 'Challenge',
    xp: 150,
    start: 'Inizia la Challenge',
    next: 'Domanda successiva',
    last: 'Consegna la Challenge',
    rule: 'Facoltativa: non blocca l’avanzamento',
  },
} as const;

export function AssessmentView({ content, mode, best, nextModule, onFinish }: Props) {
  const set = mode === 'quiz' ? content.quiz : content.challenge;
  const copy = COPY[mode];
  const [phase, setPhase] = useState<'intro' | 'run' | 'result'>('intro');
  const [run, setRun] = useState(0);
  const questions = useMemo(() => shuffled(set.questions), [set, run]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);

  const start = () => {
    setRun((r) => r + 1);
    setIndex(0);
    setAnswers([]);
    setPhase('run');
  };

  const finish = (all: Answer[]) => {
    const score = all.filter((a) => a.correct).length / questions.length;
    onFinish(score, all.map((a) => ({ id: a.id, correct: a.correct })));
    setPhase('result');
  };

  if (phase === 'intro') {
    return (
      <Panel className="result-card">
        <h2 className="result-title">{copy.title}</h2>
        <p>{set.intro}</p>
        <ul className="facts">
          <li>{set.questions.length} domande</li>
          <li>Soglia: {Math.round(PASS_SCORE * 100)}%</li>
          <li className="fact-rule">{copy.rule}</li>
          <li>
            <BoltIcon size={15} /> +{copy.xp} XP al primo superamento
          </li>
          {best !== undefined && <li>Miglior risultato: {Math.round(best * 100)}%</li>}
        </ul>
        <div className="row-actions">
          <button type="button" className="btn btn-primary" onClick={start}>
            {copy.start}
          </button>
        </div>
      </Panel>
    );
  }

  if (phase === 'run') {
    const q = questions[index];
    const last = index + 1 === questions.length;
    const page = content.learn.find((p) => p.id === q.learnRef);
    return (
      <div className="runner">
        <div className="runner-head">
          <p className="runner-count">
            {copy.title} · domanda {index + 1} di {questions.length}
          </p>
          <ProgressBar size="sm" value={index / questions.length} label={`Avanzamento: ${copy.title}`} />
        </div>
        <Panel className="runner-card">
          <ChoiceQuestionView
            key={`${run}-${q.id}`}
            question={q}
            mode={mode}
            learnLink={mode === 'quiz' && page ? { href: moduleHref(content.moduleId, 'learn', page.id), label: `Ripassa: ${page.title}` } : undefined}
            onFirstAnswer={(correct, optionId) => setAnswers((a) => [...a, { id: q.id, optionId, correct }])}
            onDone={() => (last ? finish(answers) : setIndex(index + 1))}
            doneLabel={last ? copy.last : copy.next}
          />
        </Panel>
      </div>
    );
  }

  const right = answers.filter((a) => a.correct).length;
  const score = right / questions.length;
  const passed = score >= PASS_SCORE;
  return (
    <div className="runner">
      <Panel className="result-card" tone={passed ? 'accent' : 'default'}>
        <h2 className="result-title">
          {passed ? (
            <>
              <CheckIcon size={22} /> {copy.title} superat{mode === 'quiz' ? 'o' : 'a'}
            </>
          ) : (
            `${copy.title} non superat${mode === 'quiz' ? 'o' : 'a'}`
          )}
        </h2>
        <ProgressBar value={score} label="Punteggio" valueText={`${right}/${questions.length} · ${Math.round(score * 100)}%`} />
        <p>
          {mode === 'quiz' && passed && (
            <>
              <strong>Modulo completato.</strong>{' '}
              {nextModule ? `Il modulo ${nextModule.number} «${nextModule.title}» è sbloccato. ` : 'Hai completato l’ultimo modulo. '}
              La Challenge resta disponibile come prova facoltativa.{' '}
            </>
          )}
          {mode === 'challenge' && passed && 'Ottimo: Challenge superata, +150 XP al primo superamento. '}
          {!passed && mode === 'quiz' && `Serve almeno il ${Math.round(PASS_SCORE * 100)}% per completare il modulo. Rileggi le spiegazioni qui sotto, ripassa le pagine indicate e riprova. `}
          {!passed && mode === 'challenge' && 'La Challenge è facoltativa: non blocca l’avanzamento. Puoi riprovarla quando vuoi. '}
          {passed && 'Le domande sbagliate restano nella scheda Progress finché non le risolvi.'}
        </p>
        <div className="row-actions">
          {mode === 'quiz' && passed && nextModule && (
            <a className="btn btn-primary" href={nextModule.availableSections.length ? moduleHref(nextModule.id) : homeHref('moduli')}>
              {nextModule.availableSections.length ? `Vai al modulo ${nextModule.number}` : 'Torna ai moduli'}
            </a>
          )}
          <button type="button" className={mode === 'quiz' && passed && nextModule ? 'btn' : 'btn btn-primary'} onClick={start}>
            Riprova
          </button>
          <a className="btn" href={moduleHref(content.moduleId, 'progress')}>
            Vai a Progress
          </a>
        </div>
      </Panel>

      <h3 className="debrief-title">Resoconto domanda per domanda</h3>
      <ol className="debrief">
        {questions.map((q) => {
          const a = answers.find((x) => x.id === q.id);
          return <DebriefItem key={q.id} q={q} answer={a} content={content} />;
        })}
      </ol>
    </div>
  );
}

function DebriefItem({ q, answer, content }: { q: ChoiceQuestion; answer?: Answer; content: ModuleContent }) {
  const chosen = q.options.find((o) => o.id === answer?.optionId);
  const right = q.options.find((o) => o.id === q.correct)!;
  const page = content.learn.find((p) => p.id === q.learnRef);
  const ok = answer?.correct ?? false;
  return (
    <li className={ok ? 'debrief-item is-ok' : 'debrief-item is-ko'}>
      <p className="debrief-verdict">{ok ? '✓ Esatta' : '✗ Sbagliata'}</p>
      <p className="debrief-prompt">{q.prompt}</p>
      {!ok && chosen && (
        <p>
          <strong>La tua risposta:</strong> {chosen.text} — <span className="muted">{chosen.feedback}</span>
        </p>
      )}
      <p>
        <strong>Risposta corretta:</strong> {right.text}
      </p>
      <p className="muted">{q.explanation}</p>
      {!ok && page && (
        <p>
          <a href={moduleHref(content.moduleId, 'learn', page.id)}>Ripassa: {page.title}</a>
        </p>
      )}
    </li>
  );
}
