import type { DiagramId } from '../../content/types';
import { InterpreterDiagram } from './InterpreterDiagram';
import { LevelsDiagram } from './LevelsDiagram';
import { VirtualMachinesDiagram } from './VirtualMachinesDiagram';

const DIAGRAMS: Record<DiagramId, () => JSX.Element> = {
  livelli: LevelsDiagram,
  'interprete-traduttore': InterpreterDiagram,
  'macchine-virtuali': VirtualMachinesDiagram,
};

export function Diagram({ id }: { id: DiagramId }) {
  const D = DIAGRAMS[id];
  return <D />;
}
