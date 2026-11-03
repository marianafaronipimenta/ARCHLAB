import { SECTION_IDS, SECTION_LABELS, type CourseModule } from '../../data/modules';
import { ModuleArt } from '../art/ModuleArt';
import { LockIcon } from '../art/Icons';
import { Panel } from '../ui/Panel';
import { ProgressBar } from '../ui/ProgressBar';

interface ModuleCardProps {
  module: CourseModule;
  /** Completamento del modulo, 0–1. */
  completion: number;
  /** Modulo consigliato come prossimo passo. */
  recommended: boolean;
}

export function ModuleCard({ module, completion, recommended }: ModuleCardProps) {
  const titleId = `mod-${module.id}`;
  const ready = module.availableSections.length > 0;
  const lessons = module.sources.map((s) => s.lesson).join(', ');
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
          </li>
        ))}
      </ul>

      <ProgressBar size="sm" value={completion} label={`Completamento del modulo ${module.number}`} valueText={`${Math.round(completion * 100)}%`} />

      <p className="module-source">
        {module.sources.length > 1 ? 'Lezioni' : 'Lezione'} {lessons}
      </p>

      <button type="button" className="btn btn-module" disabled={!ready} aria-describedby={ready ? undefined : `${titleId}-status`}>
        {ready ? 'Apri modulo' : (
          <>
            <LockIcon size={15} /> In costruzione
          </>
        )}
      </button>
      {!ready && (
        <span id={`${titleId}-status`} className="sr-only">
          Le sezioni di questo modulo non sono ancora disponibili.
        </span>
      )}
    </Panel>
  );
}
