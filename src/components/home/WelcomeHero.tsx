import { LabIllustration } from '../art/LabIllustration';
import { TargetIcon } from '../art/Icons';

export function WelcomeHero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-copy">
        <p className="eyebrow">
          <span aria-hidden="true">// </span>Benvenuto in ARCHLAB<span aria-hidden="true"> //</span>
        </p>
        <h1 id="hero-title" className="hero-title">
          Computer
          <br />
          Architecture <span className="hero-accent">II</span>
        </h1>
        <p className="hero-motto">Esplora. Impara. Costruisci.</p>
        <div className="mission">
          <TargetIcon size={30} />
          <p>
            La tua missione: capire l’architettura che fa funzionare i calcolatori moderni, dai livelli di astrazione
            fino al processore RISC-V e alla sua pipeline.
          </p>
        </div>
      </div>
      <div className="hero-art">
        <LabIllustration />
      </div>
    </section>
  );
}
