import { describe, expect, it } from 'vitest';
import { schedule, totalBubbles } from './pipeline';
import { PIPELINE_EXAMPLES } from './pipelineExamples';

const b = (id: string, fw: boolean) => schedule(PIPELINE_EXAMPLES.find((e) => e.id === id)!.prog, fw).map((r) => r.bubbles);

describe('pipeline (lezioni 11–12)', () => {
  it('add → sub: nessuna bolla con propagazione, 2 senza (scrittura prima della lettura)', () => {
    expect(b('add-sub', true)).toEqual([0, 0]);
    expect(b('add-sub', false)).toEqual([0, 2]);
  });
  it('load-use: una bolla anche con propagazione', () => {
    expect(b('load-use', true)).toEqual([0, 1, 0]);
  });
  it('lw → sw sul valore: nessuno stallo; sull’indirizzo: uno', () => {
    expect(b('lw-sw-valore', true)).toEqual([0, 0]);
    expect(b('lw-sw-indirizzo', true)).toEqual([0, 1]);
  });
  it('sub x2 seguita da 4 dipendenti: tutto risolto con propagazione', () => {
    expect(totalBubbles(schedule(PIPELINE_EXAMPLES.find((e) => e.id === 'sub-x2')!.prog, true))).toBe(0);
    expect(b('sub-x2', false)).toEqual([0, 2, 0, 0, 0]);
  });
  it('x0 non crea dipendenze', () => {
    expect(schedule([{ text: 'add x0,x1,x2', op: 'alu', rd: 0, rs1: 1, rs2: 2 }, { text: 'add x3,x0,x0', op: 'alu', rd: 3, rs1: 0, rs2: 0 }], false).map((r) => r.bubbles)).toEqual([0, 0]);
  });
});

describe('esempi della Challenge del modulo 07', () => {
  it('lw → add → sub: una bolla, 8 cicli', () => {
    const rows = schedule(
      [
        { text: 'lw x5, 0(x1)', op: 'lw', rd: 5, rs1: 1 },
        { text: 'add x6, x5, x2', op: 'alu', rd: 6, rs1: 5, rs2: 2 },
        { text: 'sub x7, x6, x3', op: 'alu', rd: 7, rs1: 6, rs2: 3 },
      ],
      true,
    );
    expect(rows.map((r) => r.bubbles)).toEqual([0, 1, 0]);
    expect(rows[2].start + 4).toBe(8);
  });
  it('sub, or, add: x2 da MEM/WB e x9 da EX/MEM', () => {
    const rows = schedule(
      [
        { text: 'sub x2, x1, x3', op: 'alu', rd: 2, rs1: 1, rs2: 3 },
        { text: 'or x9, x8, x7', op: 'alu', rd: 9, rs1: 8, rs2: 7 },
        { text: 'add x4, x2, x9', op: 'alu', rd: 4, rs1: 2, rs2: 9 },
      ],
      true,
    );
    expect(rows[2].notes.join(' ')).toMatch(/x2.*MEM\/WB → EX.*x9.*EX\/MEM → EX/);
  });
});
