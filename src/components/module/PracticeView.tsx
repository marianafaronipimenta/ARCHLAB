import { useRef, useState } from 'react';
import type { ModuleContent } from '../../content/types';
import { moduleHref } from '../../router';
import { CheckIcon } from '../art/Icons';
import { ExerciseView } from '../exercise/ExerciseView';
import { Panel } from '../ui/Panel';
import { ProgressBar } from '../ui/ProgressBar';

interface Props {
  content: ModuleContent;
  done: boolean;
  onResult: (id: string, correct: boolean) => void;
  onComplete: () => void;
}

const KIND_LABEL = { choice: 'Scelta multipla', order: 'Ordinamento', match: 'Abbinamento' } as const;

/**
 * Esercizi uno alla volta, con tentativi illimitati: si avanza solo dopo aver trovato la risposta.
 * Il primo tentativo di ogni esercizio aggiorna gli errori da ripassare.
 */
export function PracticeView({ content, done, onResult, onComplete }: Props) {
  const items = content.practice;
  const [index, setIndex] = useState(0);
  const [firstTry, setFirstTry] = useState<Record<string, boolean>>({});
  const [finished, setFinished] = useState(false);
  const completed = useRef(false);

  const finish = () => {
    setFinished(true);
    if (!completed.current) {
      completed.current = true;
      onComplete();
    }
  };

  if (finished) {
    const right = Object.values(firstTry).filter(Boolean).length;
    return (
      <Panel className="result-card">
        <h2 className="result-title">
          <CheckIcon size={22} /> Practice completata
        </h2>
        <p>
          Esatti al primo tentativo: <strong>{right}</strong> su {items.length}.{' '}
          {right < items.length ? 'Gli esercizi sbagliati al primo colpo sono nella scheda Progress, da ripassare.' : 'Ottimo lavoro!'}
        </p>
        <div className="row-actions">
          <a className="btn btn-primary" href={moduleHref(content.moduleId, 'quiz')}>
            Vai al Quiz
          </a>
          <button
            type="button"
            className="btn"
            onClick={() => {
              setIndex(0);
              setFirstTry({});
              setFinished(false);
            }}
          >
            Rifai gli esercizi
          </button>
        </div>
      </Panel>
    );
  }

  const ex = items[index];
  const learnPage = content.learn.find((p) => p.id === ex.learnRef);
  return (
    <div className="runner">
      <div className="runner-head">
        <p className="runner-count">
          Esercizio {index + 1} di {items.length} · <span className="runner-kind">{KIND_LABEL[ex.kind]}</span>
          {done && <span className="tag tag-ok">Già completata</span>}
        </p>
        <ProgressBar size="sm" value={index / items.length} label="Avanzamento della Practice" />
      </div>
      <Panel className="runner-card">
        <ExerciseView
          key={ex.id}
          exercise={ex}
          learnLink={learnPage ? { href: moduleHref(content.moduleId, 'learn', learnPage.id), label: `Ripassa: ${learnPage.title}` } : undefined}
          onFirstAnswer={(correct) => {
            setFirstTry((f) => ({ ...f, [ex.id]: correct }));
            onResult(ex.id, correct);
          }}
          onDone={() => (index + 1 < items.length ? setIndex(index + 1) : finish())}
          doneLabel={index + 1 < items.length ? 'Esercizio successivo' : 'Concludi la Practice'}
        />
      </Panel>
    </div>
  );
}
