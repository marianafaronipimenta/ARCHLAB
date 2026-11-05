import type { PInstr } from './pipeline';

/* Sequenze delle lezioni 11 e 12. */
const alu = (text: string, rd: number, rs1: number, rs2: number): PInstr => ({ text, op: 'alu', rd, rs1, rs2 });

export const PIPELINE_EXAMPLES: { id: string; title: string; prog: PInstr[] }[] = [
  { id: 'add-sub', title: 'add → sub', prog: [alu('add x5, x1, x2', 5, 1, 2), alu('sub x6, x5, x3', 6, 5, 3)] },
  {
    id: 'sub-x2',
    title: 'sub x2 e 4 dipendenti',
    prog: [
      alu('sub x2, x1, x3', 2, 1, 3),
      alu('and x12, x2, x5', 12, 2, 5),
      alu('or x13, x6, x2', 13, 6, 2),
      alu('add x14, x2, x2', 14, 2, 2),
      { text: 'sw x15, 100(x2)', op: 'sw', rs1: 2, rs2: 15 },
    ],
  },
  {
    id: 'load-use',
    title: 'load-use',
    prog: [{ text: 'lw x2, 20(x1)', op: 'lw', rd: 2, rs1: 1 }, alu('and x4, x2, x5', 4, 2, 5), alu('or x8, x2, x6', 8, 2, 6)],
  },
  { id: 'lw-sw-valore', title: 'lw → sw (valore)', prog: [{ text: 'lw x2, 20(x1)', op: 'lw', rd: 2, rs1: 1 }, { text: 'sw x2, 0(x3)', op: 'sw', rs1: 3, rs2: 2 }] },
  { id: 'lw-sw-indirizzo', title: 'lw → sw (indirizzo)', prog: [{ text: 'lw x2, 20(x1)', op: 'lw', rd: 2, rs1: 1 }, { text: 'sw x3, 0(x2)', op: 'sw', rs1: 2, rs2: 3 }] },
];
