import { describe, expect, it } from 'vitest';
import { MODULES } from '../data/modules';
import {
  STORAGE_KEY,
  courseCompletion,
  createInitialProgress,
  isSectionDone,
  levelInfo,
  loadProgress,
  moduleCompletion,
  nextStep,
  recordAnswers,
  recordSection,
  sanitizeProgress,
  setLearnPage,
  totalXp,
  unlockedAchievements,
} from './progress';

const T = 1_700_000_000_000;
const M = 'approccio-strutturale' as const;

describe('moduli', () => {
  it('sono sette, con numerazione 01–07 e ID unici', () => {
    expect(MODULES.map((m) => m.number)).toEqual(['01', '02', '03', '04', '05', '06', '07']);
    expect(new Set(MODULES.map((m) => m.id)).size).toBe(7);
  });
});

describe('progressi', () => {
  it('partono da zero: nessun XP, nessuna conquista, prossimo passo = Learn del modulo 01', () => {
    const p = createInitialProgress();
    expect(totalXp(p)).toBe(0);
    expect(courseCompletion(p)).toBe(0);
    expect(unlockedAchievements(p).size).toBe(0);
    expect(nextStep(p)).toMatchObject({ module: { id: M }, section: 'learn' });
  });

  it('quiz e challenge contano solo dal 60%; si conserva il miglior punteggio', () => {
    let p = createInitialProgress();
    p = recordSection(p, M, 'learn', T);
    p = recordSection(p, M, 'practice', T);
    p = recordSection(p, M, 'quiz', T, 0.5);
    expect(isSectionDone(p, M, 'quiz')).toBe(false);
    p = recordSection(p, M, 'quiz', T + 1, 1);
    p = recordSection(p, M, 'quiz', T + 2, 0.75);
    expect(p.modules[M]!.sections.quiz).toEqual({ completedAt: T + 1, bestScore: 1, attempts: 3 });
    p = recordSection(p, M, 'challenge', T, 0.5);
    expect(moduleCompletion(p, M)).toBe(0.75);
    expect(totalXp(p)).toBe(225);
    expect([...unlockedAchievements(p)]).toEqual(['primo-passo', 'quiz-perfetto']);
    expect(nextStep(p)).toMatchObject({ module: { id: M }, section: 'challenge' });
    p = recordSection(p, M, 'challenge', T, 0.67);
    expect(moduleCompletion(p, M)).toBe(1);
    expect(nextStep(p)).toMatchObject({ module: { id: 'assembly-object-executable' }, section: 'learn' });
  });

  it('gli errori entrano quando sbagliati ed escono quando corretti', () => {
    let p = recordAnswers(createInitialProgress(), M, [
      { id: 'q1', correct: false },
      { id: 'q2', correct: true },
      { id: 'q3', correct: false },
    ]);
    expect(p.modules[M]!.mistakes).toEqual(['q1', 'q3']);
    p = recordAnswers(p, M, [{ id: 'q1', correct: true }]);
    expect(p.modules[M]!.mistakes).toEqual(['q3']);
  });

  it('le azioni non modificano lo stato precedente', () => {
    const a = createInitialProgress();
    const b = setLearnPage(recordSection(a, M, 'learn', T), M, 'livelli');
    expect(a.modules).toEqual({});
    expect(b.modules[M]!.learnPage).toBe('livelli');
  });

  it('livelli ogni 500 XP', () => {
    expect(levelInfo(0)).toMatchObject({ level: 1, into: 0 });
    expect(levelInfo(725)).toMatchObject({ level: 2, into: 225 });
  });

  it('scarta dati non validi e conserva quelli validi', () => {
    const p = sanitizeProgress({
      version: 1,
      modules: {
        inventato: { sections: { learn: { completedAt: T } } },
        isa: { sections: { learn: { completedAt: 'ieri' }, quiz: { completedAt: T, bestScore: 7 } }, mistakes: ['a', 'a', 3] },
      },
    });
    expect(p.modules).toEqual({ isa: { sections: { quiz: { completedAt: T } }, mistakes: ['a'] } });
    expect(sanitizeProgress({ version: 2, modules: {} })).toEqual(createInitialProgress());
  });

  it('salvataggio corrotto → progressi vuoti', () => {
    expect(loadProgress({ getItem: (k) => (k === STORAGE_KEY ? '{rotto' : null) })).toEqual(createInitialProgress());
  });
});
