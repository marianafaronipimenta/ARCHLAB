import { describe, expect, it } from 'vitest';
import { bytesOf, evalPostfix, postfixString, toPostfix } from './rpn';

describe('notazione polacca inversa', () => {
  it('converte gli esempi delle slide', () => {
    expect(postfixString(toPostfix('(5*4+3*2)-1'))).toBe('5 4 * 3 2 * + 1 -');
    expect(postfixString(toPostfix('(a2 + a3) * a4'))).toBe('a2 a3 + a4 *');
    expect(postfixString(toPostfix('a+(b*c-d)/e'))).toBe('a b c * d - e / +');
    expect(postfixString(toPostfix('(8+2*5)/(1+3*2-4)'))).toBe('8 2 5 * + 1 3 2 * + 4 - /');
    expect(postfixString(toPostfix('3+2-1'))).toBe('3 2 + 1 -'); // stessa priorità: da sinistra a destra
  });

  it('valuta sullo stack con l’operando destro in cima', () => {
    const r = evalPostfix(toPostfix('(5*4+3*2)-1'));
    expect(r.result).toBe(25);
    expect(r.steps.map((s) => s.stack.join(','))).toEqual(['5', '5,4', '20', '20,3', '20,3,2', '20,6', '26', '26,1', '25']);
    expect(evalPostfix(toPostfix('(8+2*5)/(1+3*2-4)')).result).toBe(6);
    expect(evalPostfix(toPostfix('10-4-3')).result).toBe(3);
  });

  it('segnala espressioni non valide', () => {
    expect(() => toPostfix('(1+2')).toThrow();
    expect(() => toPostfix('1+2)')).toThrow();
    expect(() => evalPostfix(toPostfix('1 +'))).toThrow();
  });
});

describe('endianness', () => {
  it('0x01234567: little-endian mette il byte meno significativo all’indirizzo più basso', () => {
    expect(bytesOf(0x01234567, 'little')).toEqual(['67', '45', '23', '01']);
    expect(bytesOf(0x01234567, 'big')).toEqual(['01', '23', '45', '67']);
  });
});
