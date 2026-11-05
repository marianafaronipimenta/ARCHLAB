import type { LcLine } from './lc';

/* Programmi d’esempio della lezione 8, con la symbol table attesa (verificata dai test). */

export interface LcSourceRow {
  text: string;
  ops: LcLine[];
  /** Nota mostrata quando la riga è quella corrente. */
  note?: string;
}

export interface LcExample {
  id: string;
  title: string;
  start: number;
  source: LcSourceRow[];
  expected: Record<string, number>;
}

const lbl = (name: string): LcLine => ({ kind: 'label', name });
const ins = (words = 1): LcLine => ({ kind: 'instr', words });
const row = (text: string, ops: LcLine[], note?: string): LcSourceRow => ({ text, ops, note });

export const LC_EXAMPLES: LcExample[] = [
  {
    id: 'dati',
    title: 'Dati: .align, .ascii/.asciz, .skip, .equ, .set',
    start: 0,
    source: [
      row('.data', [], 'I dati partono da 0x00000000.'),
      row('.equ DIM, 4', [{ kind: 'equ', name: 'DIM', value: 4 }], '.equ definisce una costante: non occupa memoria e non entra nella symbol table.'),
      row('.set VAL, 8', [{ kind: 'set', name: 'VAL', value: 8 }], '.set definisce un simbolo ridefinibile: compare nella symbol table con il suo valore (8), non con un indirizzo.'),
      row('x: .byte 10', [lbl('x'), { kind: 'data', dir: 'byte', count: 1 }], 'La label prende il valore corrente dell’LC; .byte lo fa avanzare di 1.'),
      row('y: .byte 11', [lbl('y'), { kind: 'data', dir: 'byte', count: 1 }]),
      row('.align 2', [{ kind: 'align', n: 2 }], 'In GNU as .align N allinea a 2^N byte: l’LC passa da 2 al multiplo di 4 successivo.'),
      row('z: .word 0', [lbl('z'), { kind: 'data', dir: 'word', count: 1 }]),
      row('text1: .ascii "ciao"', [lbl('text1'), { kind: 'string', dir: 'ascii', text: 'ciao' }], '.ascii: 4 byte, nessun terminatore.'),
      row('text2: .asciz "ciao"', [lbl('text2'), { kind: 'string', dir: 'asciz', text: 'ciao' }], '.asciz: 4 caratteri + \\0 = 5 byte.'),
      row('t: .word 0', [lbl('t'), { kind: 'data', dir: 'word', count: 1 }], 'Nessun .align prima: t resta all’indirizzo 0x11, non allineato.'),
      row('array: .skip DIM', [lbl('array'), { kind: 'skip', bytes: 'DIM' }], '.skip fa avanzare l’LC di DIM = 4 byte senza inizializzarli.'),
      row('buffer: .skip VAL', [lbl('buffer'), { kind: 'skip', bytes: 'VAL' }], '.skip VAL: avanza di 8 byte.'),
      row('q: .word 0', [lbl('q'), { kind: 'data', dir: 'word', count: 1 }]),
    ],
    expected: { VAL: 8, x: 0, y: 1, z: 4, text1: 8, text2: 12, t: 17, array: 21, buffer: 25, q: 33 },
  },
  {
    id: 'misto',
    title: 'Dati e codice: la si espande in due istruzioni',
    start: 0,
    source: [
      row('.data', [{ kind: 'section', name: '.data', start: 0x10000000 }], 'Ogni sezione ha il suo LC. Qui i dati partono da 0x10000000.'),
      row('x: .byte 10', [lbl('x'), { kind: 'data', dir: 'byte', count: 1 }]),
      row('y: .byte 11', [lbl('y'), { kind: 'data', dir: 'byte', count: 1 }]),
      row('z: .word', [lbl('z'), { kind: 'data', dir: 'word', count: 0 }], 'z prende l’indirizzo corrente (0x10000002).'),
      row('.text', [{ kind: 'section', name: '.text', start: 0 }], 'Cambio di sezione: l’LC del codice parte da 0x00000000.'),
      row('la a0, x', [ins(2)], 'la è una pseudo-istruzione: diventa lui + addi, quindi 8 byte.'),
      row('lw a0, 0(a0)', [ins()]),
      row('la a1, y', [ins(2)]),
      row('lw a1, 0(a1)', [ins()]),
      row('la a2, z', [ins(2)]),
      row('beq a0, a1, uguali', [ins()], 'Il salto usa uguali, che sarà definita più avanti.'),
      row('diversi:', [lbl('diversi')], '9 istruzioni reali × 4 byte = 36 = 0x24.'),
      row('addi a0, x0, 1', [ins()]),
      row('sw a0, 0(a2)', [ins()]),
      row('li a7, 10', [ins()], 'li con un immediato che sta in 12 bit: una sola addi.'),
      row('ecall', [ins()]),
      row('uguali:', [lbl('uguali')]),
      row('sw x0, 0(a2)', [ins()]),
      row('li a7, 10', [ins()]),
      row('ecall', [ins()]),
    ],
    expected: { x: 0x10000000, y: 0x10000001, z: 0x10000002, diversi: 0x24, uguali: 0x34 },
  },
  {
    id: 'codice',
    title: 'Codice: call, nop, ret',
    start: 0,
    source: [
      row('.text', [], 'Le istruzioni partono da 0x00000000.'),
      row('.globl _start', [], '.globl non sposta l’LC.'),
      row('_start:', [lbl('_start')]),
      row('li x5, 10', [ins()], '10 sta in 12 bit: addi x5, x0, 10.'),
      row('call func', [ins()], 'Negli esercizi l’offset è sempre rappresentabile: call diventa un solo jal (con il simulatore).'),
      row('nop', [ins()], 'nop = addi x0, x0, 0.'),
      row('loop:', [lbl('loop')]),
      row('addi x5, x5, -1', [ins()]),
      row('bne x5, x0, loop', [ins()]),
      row('ret', [ins()], 'ret = jalr x0, 0(ra).'),
      row('func:', [lbl('func')]),
      row('mv x6, x5', [ins()]),
      row('ret', [ins()]),
    ],
    expected: { _start: 0, loop: 12, func: 24 },
  },
];
