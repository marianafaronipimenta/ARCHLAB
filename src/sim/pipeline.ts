/*
 * Pipeline RISC-V a 5 stadi (lezioni 11–12): calcola in quale ciclo entra ogni istruzione
 * e quante bolle servono, con o senza propagazione (forwarding).
 * Convenzioni:
 *  - con propagazione: un risultato della ALU è disponibile per l’EX successivo; quello di una load
 *    solo dopo MEM (load-use: 1 bolla). Il valore di una sw (rs2) serve in MEM, quindi lw → sw sul
 *    valore non richiede stalli (propagazione MEM/WB → MEM); sull’indirizzo (rs1) sì.
 *  - senza propagazione: il registro si legge in ID, e WB scrive nella prima metà del ciclo e ID legge
 *    nella seconda (lezione 12), quindi ID può coincidere con il WB del produttore.
 */

export type POp = 'alu' | 'lw' | 'sw';
export interface PInstr {
  text: string;
  op: POp;
  rd?: number;
  rs1?: number;
  rs2?: number;
}
export const STAGES = ['IF', 'ID', 'EX', 'MEM', 'WB'] as const;

export interface PRow {
  instr: PInstr;
  /** Ciclo (da 1) in cui l’istruzione fa IF. */
  start: number;
  /** Bolle inserite prima di questa istruzione. */
  bubbles: number;
  /** Spiegazione delle dipendenze che hanno causato bolle o propagazioni. */
  notes: string[];
}

const writes = (i: PInstr) => i.op !== 'sw' && i.rd !== undefined && i.rd !== 0;

export function schedule(prog: PInstr[], forwarding: boolean): PRow[] {
  const rows: PRow[] = [];
  prog.forEach((ins, k) => {
    const min = k === 0 ? 1 : rows[k - 1].start + 1;
    const deps: { reg: number; role: 'rs1' | 'rs2'; prod: PRow; need: number }[] = [];
    for (const role of ['rs1', 'rs2'] as const) {
      const reg = ins[role];
      if (reg === undefined || reg === 0) continue;
      let p = -1;
      for (let j = k - 1; j >= 0; j--) if (writes(prog[j]) && prog[j].rd === reg) { p = j; break; }
      if (p < 0) continue;
      const prod = rows[p];
      const pEX = prod.start + 2;
      // need = ciclo minimo di IF del consumatore (il suo EX è IF + 2, ID è IF + 1)
      let need: number;
      if (!forwarding) need = pEX + 1; // ID consumatore ≥ WB produttore (pEX + 2)
      else if (prod.instr.op === 'lw' && !(ins.op === 'sw' && role === 'rs2')) need = pEX; // EX ≥ pEX + 2
      else need = pEX - 1; // EX ≥ pEX + 1 (anche lw → sw sul valore: MEM ≥ MEM + 1)
      deps.push({ reg, role, prod, need });
    }
    const start = Math.max(min, ...deps.map((d) => d.need));
    const notes = deps.map(({ reg, role, prod, need }) => {
      const label = `${role} = x${reg} viene da «${prod.instr.text}»`;
      const pEX = prod.start + 2;
      const id = start + 1;
      const ex = start + 2;
      const stall = need > min ? ' (con stallo)' : '';
      if (id >= pEX + 2) return `${label}: il valore è già nel register file in ID${stall}.`;
      if (prod.instr.op === 'lw' && ins.op === 'sw' && role === 'rs2') return `${label}: propagazione MEM/WB → MEM${stall}.`;
      return `${label}: propagazione ${ex === pEX + 1 ? 'EX/MEM' : 'MEM/WB'} → EX${stall}.`;
    });
    rows.push({ instr: ins, start, bubbles: start - min, notes });
  });
  return rows;
}

export const totalCycles = (rows: PRow[]) => (rows.length ? rows[rows.length - 1].start + 4 : 0);
export const totalBubbles = (rows: PRow[]) => rows.reduce((a, r) => a + r.bubbles, 0);
