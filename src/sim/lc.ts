/*
 * Location Counter: calcola come avanza l’LC riga per riga e quali simboli finiscono nella symbol table.
 * Copre le direttive viste nella lezione 8 (GNU as): .byte .half .word .ascii .asciz .skip .align .equ .set
 * e le istruzioni, con il numero di istruzioni reali in cui si espande ogni pseudo-istruzione.
 */

export type LcLine =
  | { kind: 'label'; name: string }
  | { kind: 'data'; dir: 'byte' | 'half' | 'word'; count: number }
  | { kind: 'string'; dir: 'ascii' | 'asciz'; text: string }
  | { kind: 'skip'; bytes: number | string }
  | { kind: 'align'; n: number }
  | { kind: 'equ' | 'set'; name: string; value: number }
  | { kind: 'instr'; words: number }
  /** Cambio di sezione: ogni sezione ha il suo LC, che riparte da dove era rimasto (o da start). */
  | { kind: 'section'; name: string; start: number };

export interface LcStep {
  /** LC prima e dopo la riga. */
  before: number;
  after: number;
  /** Simbolo aggiunto alla symbol table da questa riga, se c’è. */
  symbol?: { name: string; value: number };
}

const SIZE = { byte: 1, half: 2, word: 4 } as const;

/** Esegue le righe a partire da start. Le costanti .equ non entrano nella symbol table, i simboli .set sì. */
export function runLc(lines: LcLine[], start = 0): LcStep[] {
  const consts = new Map<string, number>();
  const saved = new Map<string, number>();
  let section = '';
  let lc = start;
  return lines.map((l) => {
    const before = lc;
    let symbol: LcStep['symbol'];
    switch (l.kind) {
      case 'label':
        symbol = { name: l.name, value: lc };
        break;
      case 'data':
        lc += SIZE[l.dir] * l.count;
        break;
      case 'string':
        lc += l.text.length + (l.dir === 'asciz' ? 1 : 0);
        break;
      case 'skip': {
        const n = typeof l.bytes === 'number' ? l.bytes : consts.get(l.bytes);
        if (n === undefined) throw new Error(`simbolo non definito: ${l.bytes}`);
        lc += n;
        break;
      }
      case 'align': {
        const a = 2 ** l.n; // GNU as su RISC-V: .align N → 2^N byte
        lc = Math.ceil(lc / a) * a;
        break;
      }
      case 'equ':
        consts.set(l.name, l.value);
        break;
      case 'set':
        consts.set(l.name, l.value);
        symbol = { name: l.name, value: l.value };
        break;
      case 'instr':
        lc += 4 * l.words;
        break;
      case 'section':
        saved.set(section, lc);
        section = l.name;
        lc = saved.get(l.name) ?? l.start;
        break;
    }
    return { before: l.kind === 'section' ? lc : before, after: lc, symbol };
  });
}

/** Symbol table finale, in ordine di definizione. */
export const symbolTable = (steps: LcStep[]) => steps.flatMap((s) => (s.symbol ? [s.symbol] : []));

export const hex = (n: number, digits = 8) => '0x' + n.toString(16).toUpperCase().padStart(digits, '0');
