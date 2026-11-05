import { ACHIEVEMENTS, type AchievementId } from '../../data/catalog';
import { SECTION_LABELS, type CourseModule, type SectionId } from '../../data/modules';
import { ArrowRightIcon, BoltIcon, CheckIcon, LockIcon, TargetIcon, TrophyIcon } from '../art/Icons';
import { moduleHref } from '../../router';
import { Panel } from '../ui/Panel';
import { ProgressBar } from '../ui/ProgressBar';

/* ───────────── Progresso del corso ───────────── */

interface ProgressSummaryProps {
  completion: number;
  modulesDone: number;
  modulesTotal: number;
  xp: number;
  level: number;
}

export function ProgressSummary({ completion, modulesDone, modulesTotal, xp, level }: ProgressSummaryProps) {
  const pct = Math.round(completion * 100);
  return (
    <Panel as="section" className="status-card" aria-labelledby="progress-title">
      <h2 id="progress-title" className="card-label">
        Il tuo progresso
      </h2>
      <ProgressBar value={completion} label="Completamento del corso" valueText={`${pct}%`} />
      <dl className="stats">
        <div>
          <dt>Moduli completati</dt>
          <dd>
            {modulesDone}/{modulesTotal}
          </dd>
        </div>
        <div>
          <dt>XP totali</dt>
          <dd>
            <BoltIcon size={16} /> {xp}
          </dd>
        </div>
        <div>
          <dt>Livello</dt>
          <dd>{level}</dd>
        </div>
      </dl>
      {xp === 0 && <p className="hint-text">Il progresso cresce con Learn, Practice e Quiz: superare il Quiz (60%) completa il modulo. La Challenge facoltativa dà XP extra.</p>}
    </Panel>
  );
}

/* ───────────── Conquiste ───────────── */

export function Achievements({ unlocked }: { unlocked: Set<AchievementId> }) {
  return (
    <Panel as="section" className="status-card" aria-labelledby="achievements-title">
      <h2 id="achievements-title" className="card-label">
        <TrophyIcon size={18} /> Conquiste
        <span className="card-count">
          {unlocked.size}/{ACHIEVEMENTS.length}
        </span>
      </h2>
      <ul className="achievements">
        {ACHIEVEMENTS.map((a) => {
          const got = unlocked.has(a.id);
          return (
            <li key={a.id} className={got ? 'achievement is-unlocked' : 'achievement'}>
              <span className="achievement-icon" aria-hidden="true">
                {got ? <CheckIcon size={16} /> : <LockIcon size={15} />}
              </span>
              <span>
                <strong>{a.title}</strong>
                <span className="achievement-desc">{a.description}</span>
              </span>
              <span className="sr-only">{got ? 'sbloccata' : 'da sbloccare'}</span>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}

/* ───────────── Prossimo passo ───────────── */

export function NextChallenge({ step }: { step: { module: CourseModule; section: SectionId } | null }) {
  if (!step) {
    return (
      <Panel as="section" className="status-card next-card" aria-labelledby="next-title">
        <h2 id="next-title" className="card-label">
          Prossimo passo
        </h2>
        <p>Hai completato tutte le sezioni del corso.</p>
      </Panel>
    );
  }
  const ready = step.module.availableSections.includes(step.section);
  return (
    <Panel as="section" className="status-card next-card" tone="accent" aria-labelledby="next-title">
      <h2 id="next-title" className="card-label">
        Prossimo passo
      </h2>
      <div className="next-body">
        <TargetIcon size={34} />
        <p className="next-text">
          <span className="next-module">
            {step.module.number} · {step.module.title}
          </span>
          <span className="next-section">{SECTION_LABELS[step.section]}</span>
        </p>
        {ready ? (
          <a className="btn btn-icon btn-primary" href={moduleHref(step.module.id, step.section)} aria-label={`Vai a ${SECTION_LABELS[step.section]} del modulo ${step.module.number}`}>
            <ArrowRightIcon size={20} />
          </a>
        ) : (
          <button type="button" className="btn btn-icon" disabled aria-label={`${SECTION_LABELS[step.section]} non ancora disponibile`}>
            <ArrowRightIcon size={20} />
          </button>
        )}
      </div>
      {!ready && <p className="hint-text">Disponibile quando il modulo sarà sviluppato.</p>}
    </Panel>
  );
}
