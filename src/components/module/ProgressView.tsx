import { findItem } from '../../content/index';
import type { ModuleContent } from '../../content/types';
import { SECTION_IDS, SECTION_LABELS, type ModuleId } from '../../data/modules';
import { moduleHref } from '../../router';
import { PASS_SCORE, XP_PER_SECTION, isModuleCompleted, isOptionalSection, isSectionDone, moduleCompletion, type StudentProgress } from '../../state/progress';
import { BoltIcon, CheckIcon } from '../art/Icons';
import { Panel } from '../ui/Panel';
import { ProgressBar } from '../ui/ProgressBar';

interface Props {
  moduleId: ModuleId;
  content: ModuleContent;
  progress: StudentProgress;
}

const fmtDate = (ts: number) => new Date(ts).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' });

export function ProgressView({ moduleId, content, progress }: Props) {
  const rec = progress.modules[moduleId];
  const completion = moduleCompletion(progress, moduleId);
  const mistakes = (rec?.mistakes ?? []).map((id) => findItem(content, id)).filter((x) => x !== undefined);

  return (
    <div className="progress-view">
      <Panel className="result-card">
        <h2 className="result-title">Progresso del modulo</h2>
        <ProgressBar value={completion} label="Completamento del modulo" valueText={`${Math.round(completion * 100)}%`} />
        <p className="muted">
          {isModuleCompleted(progress, moduleId)
            ? 'Modulo completato: il Quiz è superato e il modulo successivo è sbloccato.'
            : `Il modulo si completa superando il Quiz con almeno il ${Math.round(PASS_SCORE * 100)}%. Learn e Practice sono consigliati; la Challenge è facoltativa.`}
        </p>
        <ul className="section-status">
          {SECTION_IDS.map((s) => {
            const r = rec?.sections[s];
            const done = isSectionDone(progress, moduleId, s);
            return (
              <li key={s} className={done ? 'is-done' : undefined}>
                <span className="section-status-icon" aria-hidden="true">
                  {done ? <CheckIcon size={16} /> : '·'}
                </span>
                <span className="section-status-name">
                  <a href={moduleHref(moduleId, s)}>{SECTION_LABELS[s]}</a>
                  {isOptionalSection(s) && <span className="tab-opt">facoltativa</span>}
                </span>
                <span className="section-status-detail">
                  {done ? `Completata il ${fmtDate(r!.completedAt)}` : r ? `Soglia del ${Math.round(PASS_SCORE * 100)}% non ancora raggiunta` : 'Da fare'}
                  {r?.bestScore !== undefined && ` · miglior risultato ${Math.round(r.bestScore * 100)}%`}
                  {r?.attempts && (s === 'quiz' || s === 'challenge') ? ` · ${r.attempts} tentativ${r.attempts === 1 ? 'o' : 'i'}` : ''}
                </span>
                <span className="section-status-xp">
                  <BoltIcon size={14} /> {done ? `+${XP_PER_SECTION[s]}` : XP_PER_SECTION[s]} XP
                </span>
              </li>
            );
          })}
        </ul>
      </Panel>

      <Panel className="result-card">
        <h2 className="result-title">Da ripassare</h2>
        {mistakes.length === 0 ? (
          <p className="muted">
            {rec ? 'Nessun errore in sospeso: ottimo!' : 'Qui compariranno gli esercizi e le domande sbagliati al primo tentativo, con la spiegazione.'}
          </p>
        ) : (
          <>
            <p className="muted">
              Domande sbagliate al primo tentativo e non ancora recuperate. Escono dall’elenco quando rispondi correttamente in Practice, Quiz o
              Challenge.
            </p>
            <ul className="mistakes">
              {mistakes.map((q) => {
                const page = content.learn.find((p) => p.id === q.learnRef);
                const prompt = q.prompt;
                const correctText = q.kind === 'choice' ? q.options.find((o) => o.id === q.correct)?.text : undefined;
                return (
                  <li key={q.id} className="mistake">
                    <p className="mistake-prompt">{prompt}</p>
                    {correctText && (
                      <p>
                        <strong>Risposta corretta:</strong> {correctText}
                      </p>
                    )}
                    <p className="muted">{q.explanation}</p>
                    {page && (
                      <a className="btn btn-small" href={moduleHref(moduleId, 'learn', page.id)}>
                        Ripassa: {page.title}
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </Panel>
    </div>
  );
}
