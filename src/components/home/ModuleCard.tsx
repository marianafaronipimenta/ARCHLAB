import { MODULES, SECTION_IDS, SECTION_LABELS, type CourseModule } from '../../data/modules';
import { ModuleArt } from '../art/ModuleArt';
import { moduleHref } from '../../router';
import { ArrowRightIcon, CheckIcon, LockIcon } from '../art/Icons';
import { Panel } from '../ui/Panel';
import { ProgressBar } from '../ui/ProgressBar';

interface ModuleCardProps {
  module: CourseModule;
  /** Completamento del modulo, 0–1. */
  completion: number;
  /** Modulo consigliato come prossimo passo. */
  recommended: boolean;
  /** Sbloccato: il Quiz del modulo precedente è superato (o è il primo modulo). */
  unlocked: boolean;
  /** Completato: il Quiz di questo modulo è superato. */
  completed: boolean;
}

export function ModuleCard({ module, completion, recommended, unlocked, completed }: ModuleCardProps) {
  const titleId = `mod-${module.id}`;
  const ready = module.availableSections.length > 0;
  const lessons = module.sources.map((s) => s.lesson).join(', ');
  const prev = MODULES[MODULES.findIndex((m) => m.id === module.id) - 1];
  return (
    <Panel as="article" className="module-card" tone={recommended ? 'accent' : 'default'} aria-labelledby={titleId}>
      <div className="module-media">
        <ModuleArt icon={module.icon} />
      </div>
      <span className="module-number" aria-hidden="true">
        {module.number}
      </span>
      <h3 id={titleId} className="module-title">
        <span className="sr-only">Modulo {module.number}: </span>
        {module.title}
      </h3>
      <p className="module-tagline">{module.tagline}</p>

      <ul className="module-sections" aria-label="Sezioni del modulo">
        {[...SECTION_IDS, 'progress' as const].map((s) => (
          <li key={s} className={s !== 'progress' && module.availableSections.includes(s) ? 'is-ready' : undefined}>
            {SECTION_LABELS[s]}
            {s === 'challenge' && <span className="opt-mark"> · opz.</span>}
          </li>
        ))}
      </ul>

      <ProgressBar size="sm" value={completion} label={`Completamento del modulo ${module.number}`} valueText={`${Math.round(completion * 100)}%`} />

      <p className="module-source">
        {module.sources.length > 1 ? 'Lezioni' : 'Lezione'} {lessons}
      </p>

      {completed && (
        <p className="module-state module-state-done">
          <CheckIcon size={15} /> Completato
        </p>
      )}
      {ready && !unlocked && prev && (
        <p className="module-state" id={`${titleId}-status`}>
          Si sblocca superando il Quiz del modulo {prev.number} (60%).
        </p>
      )}

      {!ready ? (
        <button type="button" className="btn btn-module" disabled aria-describedby={`${titleId}-building`}>
          <LockIcon size={15} /> In costruzione
        </button>
      ) : !unlocked ? (
        <button type="button" className="btn btn-module" disabled aria-describedby={`${titleId}-status`}>
          <LockIcon size={15} /> Bloccato
        </button>
      ) : (
        <a className={completed ? 'btn btn-module' : 'btn btn-module btn-primary'} href={moduleHref(module.id)} aria-label={`Apri il modulo ${module.number}: ${module.title}`}>
          {completed ? 'Rivedi' : completion > 0 ? 'Continua' : 'Apri modulo'} <ArrowRightIcon size={16} />
        </a>
      )}
      {!ready && (
        <span id={`${titleId}-building`} className="sr-only">
          Le sezioni di questo modulo non sono ancora disponibili.
        </span>
      )}
    </Panel>
  );
}
