import { describe, expect, it } from 'vitest';
import { aluBitsOf, aluControl, control, pcSrc } from './control';

describe('unità di controllo (lezione 10)', () => {
  it('riproduce la tabella dei segnali', () => {
    const row = (i: Parameters<typeof control>[0]) => Object.values(control(i)).join(' ');
    expect(row('lw')).toBe('1 00 1 0 1 0 1');
    expect(row('sw')).toBe('0 00 1 0 0 1 0');
    expect(row('beq')).toBe('0 01 0 1 0 0 0');
    for (const r of ['add', 'sub', 'and', 'or'] as const) expect(row(r)).toBe('1 10 0 0 0 0 0');
  });
  it('controllore ALU', () => {
    expect(['lw', 'sw', 'beq', 'add', 'sub', 'and', 'or'].map((i) => aluBitsOf(i as never))).toEqual(['0010', '0010', '0110', '0010', '0110', '0000', '0001']);
    expect(aluControl('10', '0100000', '000')).toBe('0110');
  });
  it('PCSrc = Branch AND Zero', () => {
    expect([pcSrc(0, 0), pcSrc(0, 1), pcSrc(1, 0), pcSrc(1, 1)]).toEqual([0, 0, 0, 1]);
  });
});
