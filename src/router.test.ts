import { describe, expect, it } from 'vitest';
import { moduleHref, parseHash } from './router';

describe('router', () => {
  it('riconosce home, ancore e sezioni dei moduli', () => {
    expect(parseHash('')).toEqual({ name: 'home', anchor: undefined });
    expect(parseHash('#/moduli')).toEqual({ name: 'home', anchor: 'moduli' });
    expect(parseHash('#/modulo/isa/quiz')).toEqual({ name: 'module', moduleId: 'isa', tab: 'quiz' });
    expect(parseHash('#/modulo/isa')).toEqual({ name: 'module', moduleId: 'isa', tab: 'learn' });
    expect(parseHash('#/modulo/isa/boh')).toEqual({ name: 'module', moduleId: 'isa', tab: 'learn' });
    expect(parseHash('#/modulo/isa/learn/livelli')).toEqual({ name: 'module', moduleId: 'isa', tab: 'learn', page: 'livelli' });
    expect(moduleHref('isa', 'learn', 'livelli')).toBe('#/modulo/isa/learn/livelli');
    expect(moduleHref('isa', 'quiz', 'livelli')).toBe('#/modulo/isa/quiz');
    expect(parseHash('#/modulo/inesistente/learn')).toEqual({ name: 'home', anchor: undefined });
  });
});
