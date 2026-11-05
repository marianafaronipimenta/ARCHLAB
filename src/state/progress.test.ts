import { describe, expect, it } from 'vitest';
import { MODULES } from '../data/modules';
import {
  STORAGE_KEY,
  courseCompletion,
  createInitialProgress,
  isModuleCompleted,
  isModuleUnlocked,
  isSectionDone,
  levelInfo,
  loadProgress,
  moduleCompletion,
  modulesCompleted,
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
    let p = recordSection(createInitialProgress(), M, 'quiz', T, 0.5);
    expect(isSectionDone(p, M, 'quiz')).toBe(false);
    p = recordSection(p, M, 'quiz', T + 1, 1);
    p = recordSection(p, M, 'quiz', T + 2, 0.75);
    expect(p.modules[M]!.sections.quiz).toEqual({ completedAt: T + 1, bestScore: 1, attempts: 3 });
  });

  it('il Quiz superato completa il modulo e sblocca il successivo, anche senza Practice né Challenge', () => {
    const NEXT = 'assembly-object-executable' as const;
    let p = recordSection(createInitialProgress(), M, 'learn', T);
    expect(isModuleUnlocked(p, M)).toBe(true);
    expect(isModuleUnlocked(p, NEXT)).toBe(false);
    expect(moduleCompletion(p, M)).toBeCloseTo(1 / 3);
    expect(nextStep(p)).toMatchObject({ module: { id: M }, section: 'practice' });

    p = recordSection(p, M, 'quiz', T, 0.5); // sotto soglia: niente
    expect(isModuleCompleted(p, M)).toBe(false);
    expect(isModuleUnlocked(p, NEXT)).toBe(false);

    p = recordSection(p, M, 'quiz', T, 0.625); // 5/8
    expect(isModuleCompleted(p, M)).toBe(true);
    expect(moduleCompletion(p, M)).toBe(1);
    expect(isModuleUnlocked(p, NEXT)).toBe(true);
    expect(modulesCompleted(p)).toBe(1);
    expect(nextStep(p)).toMatchObject({ module: { id: NEXT }, section: 'learn' });
  });

  it('la Challenge è facoltativa: dà XP e la conquista ma non cambia l’avanzamento', () => {
    let p = recordSection(createInitialProgress(), M, 'challenge', T, 0.67);
    expect(isModuleCompleted(p, M)).toBe(false);
    expect(moduleCompletion(p, M)).toBe(0);
    expect(nextStep(p)).toMatchObject({ module: { id: M }, section: 'learn' });
    expect(totalXp(p)).toBe(150);
    expect([...unlockedAchievements(p)]).toEqual(['prima-sfida']);
    p = recordSection(p, M, 'quiz', T, 1);
    expect(totalXp(p)).toBe(250);
    expect([...unlockedAchievements(p)]).toEqual(['quiz-perfetto', 'prima-sfida']);
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
