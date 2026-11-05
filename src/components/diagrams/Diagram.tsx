import type { DiagramId } from '../../content/types';
import { FetchDecodeDiagram } from './FetchDecodeDiagram';
import { InterpreterDiagram } from './InterpreterDiagram';
import { LevelsDiagram } from './LevelsDiagram';
import { ToolchainDiagram } from './ToolchainDiagram';
import { VirtualMachinesDiagram } from './VirtualMachinesDiagram';

const DIAGRAMS: Record<DiagramId, () => JSX.Element> = {
  livelli: LevelsDiagram,
  'interprete-traduttore': InterpreterDiagram,
  'macchine-virtuali': VirtualMachinesDiagram,
  'catena-traduzione': ToolchainDiagram,
  'ciclo-fde': FetchDecodeDiagram,
};

export function Diagram({ id }: { id: DiagramId }) {
  const D = DIAGRAMS[id];
  return <D />;
}
