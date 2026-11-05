import { describe, expect, it } from 'vitest';
import { runLc, symbolTable, type LcLine } from './lc';
import { LC_EXAMPLES } from './lcExamples';

const table = (lines: LcLine[], start = 0) => Object.fromEntries(symbolTable(runLc(lines, start)).map((s) => [s.name, s.value]));

describe('Location Counter (esempi della lezione 8)', () => {
  it('ogni esempio riproduce la symbol table delle slide', () => {
    for (const ex of LC_EXAMPLES) {
      expect(table(ex.source.flatMap((s) => s.ops), ex.start), ex.id).toEqual(ex.expected);
    }
  });
  it('.skip con una costante .equ e .align 2', () => {
    const t = table([
      { kind: 'equ', name: 'DIM', value: 4 },
      { kind: 'label', name: 'a' },
      { kind: 'data', dir: 'byte', count: 1 },
      { kind: 'align', n: 2 },
      { kind: 'label', name: 'b' },
      { kind: 'skip', bytes: 'DIM' },
      { kind: 'label', name: 'c' },
    ]);
    expect(t).toEqual({ a: 0, b: 4, c: 8 });
  });
});
