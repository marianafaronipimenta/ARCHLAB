import type { ModuleId } from './modules';

/** Simulatori previsti. Nessuno è ancora disponibile come strumento autonomo: la home li mostra come «in sviluppo».
 *  Alcuni hanno già una versione base dentro una pagina Learn (`preview`). */
export type SimulatorStatus = 'planned' | 'available';

export interface Simulator {
  id: string;
  title: string;
  description: string;
  relatedModules: ModuleId[];
  status: SimulatorStatus;
  /** Versione base già usabile in una pagina Learn. */
  preview?: { moduleId: ModuleId; page: string; label: string };
}

export const SIMULATORS: Simulator[] = [
  {
    id: 'riscv-registri',
    title: 'Istruzioni RISC-V e registri',
    description: 'Scrivi istruzioni RV32I e osserva il contenuto dei 32 registri.',
    relatedModules: ['riscv-rv32i', 'location-counter'],
    status: 'planned',
  },
  {
    id: 'esecuzione',
    title: 'Esecuzione delle istruzioni',
    description: 'Segui fetch, decodifica ed esecuzione istruzione per istruzione.',
    relatedModules: ['riscv-rv32i', 'processore'],
    status: 'planned',
  },
  {
    id: 'componenti-processore',
    title: 'Componenti del processore',
    description: 'Data path e segnali di controllo per istruzioni R, load/store e beq.',
    relatedModules: ['processore'],
    status: 'planned',
    preview: { moduleId: 'processore', page: 'unita-controllo', label: 'Versione base: segnali dell’unità di controllo (modulo 06)' },
  },
  {
    id: 'pipeline-cicli',
    title: 'Pipeline per cicli',
    description: 'Diagramma multi-ciclo a 5 stadi con hazard, stalli e forwarding.',
    relatedModules: ['pipeline'],
    status: 'planned',
    preview: { moduleId: 'pipeline', page: 'diagrammi', label: 'Versione base: diagramma multi-ciclo (modulo 07)' },
  },
];

/** Conquiste: il criterio è valutato sui progressi reali (vedi state/progress.ts). */
export type AchievementId = 'primo-passo' | 'quiz-perfetto' | 'prima-sfida' | 'corso-completo';

export interface Achievement {
  id: AchievementId;
  title: string;
  description: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'primo-passo', title: 'Primo passo', description: 'Completa la sezione Learn di un modulo.' },
  { id: 'quiz-perfetto', title: 'Zero errori', description: 'Ottieni il 100% in un quiz.' },
  { id: 'prima-sfida', title: 'Sfida superata', description: 'Supera una Challenge facoltativa.' },
  { id: 'corso-completo', title: 'Architetto', description: 'Completa i sette moduli (Quiz superato in ognuno).' },
];
