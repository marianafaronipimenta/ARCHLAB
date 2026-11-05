/*
 * Unità di controllo del processore a ciclo singolo della lezione 10
 * (sottoinsieme lw, sw, beq, add, sub, and, or).
 */

export type Instr = 'lw' | 'sw' | 'beq' | 'add' | 'sub' | 'and' | 'or';
export const INSTRS: Instr[] = ['lw', 'sw', 'beq', 'add', 'sub', 'and', 'or'];

export interface ControlSignals {
  RegWrite: 0 | 1;
  ALUOp: '00' | '01' | '10';
  ALUSrc: 0 | 1;
  Branch: 0 | 1;
  MemRead: 0 | 1;
  MemWrite: 0 | 1;
  MemtoReg: 0 | 1;
}

/** Tabella dell’unità di controllo (slide «riassunto dei segnali di controllo»). */
export function control(i: Instr): ControlSignals {
  switch (i) {
    case 'lw':
      return { RegWrite: 1, ALUOp: '00', ALUSrc: 1, Branch: 0, MemRead: 1, MemWrite: 0, MemtoReg: 1 };
    case 'sw':
      return { RegWrite: 0, ALUOp: '00', ALUSrc: 1, Branch: 0, MemRead: 0, MemWrite: 1, MemtoReg: 0 };
    case 'beq':
      return { RegWrite: 0, ALUOp: '01', ALUSrc: 0, Branch: 1, MemRead: 0, MemWrite: 0, MemtoReg: 0 };
    default:
      return { RegWrite: 1, ALUOp: '10', ALUSrc: 0, Branch: 0, MemRead: 0, MemWrite: 0, MemtoReg: 0 };
  }
}

/** Campi funct7 e funct3 delle istruzioni di tipo R del sottoinsieme. */
export const R_FIELDS: Record<'add' | 'sub' | 'and' | 'or', { funct7: string; funct3: string }> = {
  add: { funct7: '0000000', funct3: '000' },
  sub: { funct7: '0100000', funct3: '000' },
  and: { funct7: '0000000', funct3: '111' },
  or: { funct7: '0000000', funct3: '110' },
};

export const ALU_OPS: Record<string, string> = { '0010': 'Somma', '0110': 'Sottrazione', '0000': 'AND', '0001': 'OR' };

/** Controllore ALU: da ALUOp (+ funct7/funct3 per il tipo R) ai 4 bit di controllo della ALU. */
export function aluControl(aluOp: ControlSignals['ALUOp'], funct7 = '', funct3 = ''): string {
  if (aluOp === '00') return '0010';
  if (aluOp === '01') return '0110';
  if (funct3 === '000') return funct7 === '0100000' ? '0110' : '0010';
  if (funct3 === '111') return '0000';
  if (funct3 === '110') return '0001';
  throw new Error(`funct3 non supportato: ${funct3}`);
}

export const aluBitsOf = (i: Instr) => {
  const c = control(i);
  const f = i in R_FIELDS ? R_FIELDS[i as keyof typeof R_FIELDS] : { funct7: '', funct3: '' };
  return aluControl(c.ALUOp, f.funct7, f.funct3);
};

/** PCSrc = Branch AND Zero. */
export const pcSrc = (branch: 0 | 1, zero: 0 | 1): 0 | 1 => (branch && zero ? 1 : 0);

/** Unità del data path effettivamente usate dall’istruzione. */
export type Unit = 'pc' | 'imem' | 'adder4' | 'regread' | 'signext' | 'alu' | 'branchadder' | 'dmem' | 'regwrite';
export const UNIT_LABELS: Record<Unit, string> = {
  pc: 'Program Counter',
  imem: 'Memoria istruzioni',
  adder4: 'Sommatore PC + 4',
  regread: 'Register file (lettura)',
  signext: 'Estensione del segno',
  alu: 'ALU',
  branchadder: 'Sommatore indirizzo di salto',
  dmem: 'Memoria dati',
  regwrite: 'Register file (scrittura)',
};

export function unitsUsed(i: Instr): Unit[] {
  const base: Unit[] = ['pc', 'imem', 'adder4', 'regread'];
  if (i === 'lw') return [...base, 'signext', 'alu', 'dmem', 'regwrite'];
  if (i === 'sw') return [...base, 'signext', 'alu', 'dmem'];
  if (i === 'beq') return [...base, 'signext', 'alu', 'branchadder'];
  return [...base, 'alu', 'regwrite'];
}
