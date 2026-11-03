import { describe, expect, it } from 'vitest';
import { MODULES } from '../data/modules';
import { allContent, getModuleContent, validateContent } from './index';

describe('contenuti dei moduli', () => {
  it('sono coerenti (ID, riferimenti, opzioni, feedback)', () => {
    for (const c of allContent()) expect(validateContent(c)).toEqual([]);
  });

  it('un modulo dichiara disponibili solo le sezioni che hanno contenuti', () => {
    for (const m of MODULES) {
      const c = getModuleContent(m.id);
      if (m.availableSections.length) expect(c, m.id).toBeDefined();
      if (c) {
        if (m.availableSections.includes('learn')) expect(c.learn.length).toBeGreaterThan(0);
        if (m.availableSections.includes('practice')) expect(c.practice.length).toBeGreaterThan(0);
      }
    }
  });
});
