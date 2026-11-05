import { describe, expect, it } from 'vitest';
import { errors, simulateLoop } from './predictor';

describe('predizione dei salti (lezione 13)', () => {
  it('1 bit, N = 3, stato iniziale 0: errori alla 1ª e alla 3ª iterazione', () => {
    const s = simulateLoop('1bit', 3, 1, 0);
    expect(s.map((x) => x.predicted !== x.taken)).toEqual([true, false, true]);
    expect(s.map((x) => x.after)).toEqual([1, 1, 0]);
  });
  it('2 bit, N = 3, stato iniziale 00: tre errori (va peggio)', () => {
    const s = simulateLoop('2bit', 3, 1, 0);
    expect(s.map((x) => x.after)).toEqual([1, 2, 1]);
    expect(errors(s)).toBe(3);
  });
  it('ciclo rieseguito: 1 bit sbaglia 2 volte per esecuzione, 2 bit una sola', () => {
    expect(errors(simulateLoop('1bit', 100, 3, 1), 2)).toBe(2);
    expect(errors(simulateLoop('2bit', 100, 3, 3), 2)).toBe(1);
  });
});
