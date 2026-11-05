import { useEffect } from 'react';
import { getModuleContent } from '../content/index';
import { MODULES, SECTION_IDS, SECTION_LABELS, getModule, type ModuleId } from '../data/modules';
import { homeHref, moduleHref, type ModuleTab } from '../router';
import { isModuleCompleted, isModuleUnlocked, isOptionalSection, isSectionDone } from '../state/progress';
import { useProgressStore } from '../state/store';
import { CheckIcon, LockIcon } from '../components/art/Icons';
import { ModuleArt } from '../components/art/ModuleArt';
import { AssessmentView } from '../components/module/AssessmentView';
import { LearnView } from '../components/module/LearnView';
import { PracticeView } from '../components/module/PracticeView';
import { ProgressView } from '../components/module/ProgressView';
import { Panel } from '../components/ui/Panel';

interface Props {
  moduleId: ModuleId;
  tab: ModuleTab;
  page?: string;
}

const TABS: ModuleTab[] = [...SECTION_IDS, 'progress'];

export function ModuleScreen({ moduleId, tab, page }: Props) {
  const mod = getModule(moduleId)!;
  const content = getModuleContent(moduleId);
  const { progress, completeSection, recordResults, rememberLearnPage } = useProgressStore();
  const rec = progress.modules[moduleId];

  // Un link diretto a una pagina Learn diventa la pagina corrente.
  useEffect(() => {
    if (page && content?.learn.some((p) => p.id === page)) rememberLearnPage(moduleId, page);
  }, [page, moduleId, content, rememberLearnPage]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [moduleId, tab]);

  const index = MODULES.findIndex((m) => m.id === moduleId);
  const prevModule = MODULES[index - 1];
  const nextModule = MODULES[index + 1];
  const unlocked = isModuleUnlocked(progress, moduleId);

  const available = (t: ModuleTab) => t === 'progress' ? content !== undefined : mod.availableSections.includes(t);

  return (
    <div className="module-screen">
      <a className="back-link" href={homeHref('moduli')}>
        ← Tutti i moduli
      </a>

      <header className="module-hero">
        <div className="module-hero-art" aria-hidden="true">
          <ModuleArt icon={mod.icon} />
        </div>
        <div>
          <p className="eyebrow">
            Modulo {mod.number}
            {isModuleCompleted(progress, moduleId) && <span className="tag tag-ok">Completato</span>}
          </p>
          <h1 className="module-hero-title">{mod.title}</h1>
          <p className="module-hero-tagline">{mod.tagline}</p>
          <p className="module-source">
            Fonte: {mod.sources.map((s) => `lezione ${s.lesson} «${s.title}»`).join(' · ')}
          </p>
        </div>
      </header>

      <nav className="tabs" aria-label="Sezioni del modulo">
        {TABS.map((t) => {
          const ok = available(t);
          const done = t !== 'progress' && isSectionDone(progress, moduleId, t);
          return ok ? (
            <a key={t} href={moduleHref(moduleId, t)} className={t === tab ? 'tab is-current' : 'tab'} aria-current={t === tab ? 'page' : undefined}>
              {SECTION_LABELS[t]}
              {t !== 'progress' && isOptionalSection(t) && <span className="tab-opt">facoltativa</span>}
              {done && <CheckIcon size={15} aria-label="completata" />}
            </a>
          ) : (
            <span key={t} className="tab is-disabled" aria-disabled="true">
              {SECTION_LABELS[t]} <LockIcon size={13} />
            </span>
          );
        })}
      </nav>

      <section className="module-body" aria-label={SECTION_LABELS[tab]}>
        {!unlocked && prevModule ? (
          <Panel className="result-card">
            <h2 className="result-title">
              <LockIcon size={20} /> Modulo bloccato
            </h2>
            <p>
              Si sblocca superando con almeno il 60% il Quiz del modulo {prevModule.number} «{prevModule.title}». La Challenge non è
              necessaria.
            </p>
            <div className="row-actions">
              <a className="btn btn-primary" href={moduleHref(prevModule.id, 'quiz')}>
                Vai al Quiz del modulo {prevModule.number}
              </a>
            </div>
          </Panel>
        ) : !content || !available(tab) ? (
          <Panel className="result-card">
            <h2 className="result-title">In costruzione</h2>
            <p>I contenuti di questa sezione non sono ancora disponibili.</p>
          </Panel>
        ) : tab === 'learn' ? (
          <LearnView
            content={content}
            pageId={page ?? rec?.learnPage}
            done={isSectionDone(progress, moduleId, 'learn')}
            onPage={(id) => {
              rememberLearnPage(moduleId, id);
              if (page) window.location.hash = moduleHref(moduleId, 'learn');
            }}
            onComplete={() => completeSection(moduleId, 'learn')}
          />
        ) : tab === 'practice' ? (
          <PracticeView
            content={content}
            done={isSectionDone(progress, moduleId, 'practice')}
            onResult={(id, correct) => recordResults(moduleId, [{ id, correct }])}
            onComplete={() => completeSection(moduleId, 'practice')}
          />
        ) : tab === 'quiz' || tab === 'challenge' ? (
          <AssessmentView
            key={tab}
            content={content}
            mode={tab}
            best={rec?.sections[tab]?.bestScore}
            nextModule={nextModule}
            onFinish={(score, results) => {
              completeSection(moduleId, tab, score);
              recordResults(moduleId, results);
            }}
          />
        ) : (
          <ProgressView moduleId={moduleId} content={content} progress={progress} />
        )}
      </section>
    </div>
  );
}
