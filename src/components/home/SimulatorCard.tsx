import { getModule } from '../../data/modules';
import type { Simulator } from '../../data/catalog';
import { SimulatorIcon } from '../art/Icons';
import { Panel } from '../ui/Panel';

export function SimulatorCard({ simulator }: { simulator: Simulator }) {
  const modules = simulator.relatedModules.map((id) => getModule(id)?.number).filter(Boolean).join(' · ');
  return (
    <Panel as="article" className="sim-card" tone="muted" aria-labelledby={`sim-${simulator.id}`}>
      <span className="sim-icon" aria-hidden="true">
        <SimulatorIcon size={22} />
      </span>
      <div>
        <h3 id={`sim-${simulator.id}`} className="sim-title">
          {simulator.title}
        </h3>
        <p className="sim-desc">{simulator.description}</p>
        <p className="sim-meta">
          <span className="tag">{simulator.status === 'available' ? 'Disponibile' : 'In sviluppo'}</span>
          <span>Moduli {modules}</span>
        </p>
      </div>
    </Panel>
  );
}
