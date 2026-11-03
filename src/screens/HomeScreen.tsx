import { SIMULATORS } from '../data/catalog';
import { MODULES } from '../data/modules';
import {
  courseCompletion,
  levelInfo,
  moduleCompletion,
  modulesCompleted,
  nextStep,
  totalXp,
  unlockedAchievements,
  type StudentProgress,
} from '../state/progress';
import { ModuleCard } from '../components/home/ModuleCard';
import { SimulatorCard } from '../components/home/SimulatorCard';
import { Achievements, NextChallenge, ProgressSummary } from '../components/home/StatusPanels';
import { WelcomeHero } from '../components/home/WelcomeHero';

export function HomeScreen({ progress }: { progress: StudentProgress }) {
  const xp = totalXp(progress);
  const step = nextStep(progress);
  const unlocked = unlockedAchievements(progress);

  return (
    <>
      <div id="home" className="anchor" tabIndex={-1}>
        <WelcomeHero />
      </div>

      <section id="moduli" className="section anchor" tabIndex={-1} aria-labelledby="modules-title">
        <div className="section-head">
          <h2 id="modules-title" className="section-title">
            Moduli
          </h2>
          <p className="section-note">Sette moduli, nell’ordine delle lezioni. Ognuno avrà Learn, Practice, Quiz, Challenge e Progress.</p>
        </div>
        <div className="module-grid">
          {MODULES.map((m) => (
            <ModuleCard key={m.id} module={m} completion={moduleCompletion(progress, m.id)} recommended={step?.module.id === m.id} />
          ))}
        </div>
      </section>

      <section id="progressi" className="status-row anchor" tabIndex={-1} aria-label="Progressi">
        <ProgressSummary
          completion={courseCompletion(progress)}
          modulesDone={modulesCompleted(progress)}
          modulesTotal={MODULES.length}
          xp={xp}
          level={levelInfo(xp).level}
        />
        <Achievements unlocked={unlocked} />
        <NextChallenge step={step} />
      </section>

      <section id="simulatori" className="section anchor" tabIndex={-1} aria-labelledby="sims-title">
        <div className="section-head">
          <h2 id="sims-title" className="section-title">
            Simulatori
          </h2>
          <p className="section-note">Laboratori interattivi previsti per i moduli RISC-V, processore e pipeline.</p>
        </div>
        <div className="sim-grid">
          {SIMULATORS.map((s) => (
            <SimulatorCard key={s.id} simulator={s} />
          ))}
        </div>
      </section>
    </>
  );
}
