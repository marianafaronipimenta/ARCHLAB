import { describe, expect, it } from 'vitest';
import { MODULES } from '../data/modules';
import {
  STORAGE_KEY,
  courseCompletion,
  createInitialProgress,
  levelInfo,
  loadProgress,
  moduleCompletion,
  nextStep,
  sanitizeProgress,
  totalXp,
  unlockedAchievements,
  type StudentProgress,
} from './progress';

const T = 1_700_000_000_000;

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
    expect(nextStep(p)).toMatchObject({ module: { id: 'approccio-strutturale' }, section: 'learn' });
  });

  it('calcola completamento, XP e conquiste dai record', () => {
    const p: StudentProgress = {
      version: 1,
      modules: {
        'approccio-strutturale': {
          learn: { completedAt: T },
          practice: { completedAt: T },
          quiz: { completedAt: T, bestScore: 1 },
          challenge: { completedAt: T, bestScore: 0.5 },
        },
      },
    };
    expect(moduleCompletion(p, 'approccio-strutturale')).toBe(0.75); // challenge sotto la soglia
    expect(totalXp(p)).toBe(225);
    expect([...unlockedAchievements(p)]).toEqual(['primo-passo', 'quiz-perfetto']);
    expect(nextStep(p)).toMatchObject({ module: { id: 'approccio-strutturale' }, section: 'challenge' });
  });

  it('livelli ogni 500 XP', () => {
    expect(levelInfo(0)).toMatchObject({ level: 1, into: 0 });
    expect(levelInfo(725)).toMatchObject({ level: 2, into: 225 });
  });

  it('scarta dati non validi', () => {
    const p = sanitizeProgress({
      version: 1,
      modules: { inventato: { learn: { completedAt: T } }, isa: { learn: { completedAt: 'ieri' }, quiz: { completedAt: T, bestScore: 7 } } },
    });
    expect(p.modules).toEqual({ isa: { quiz: { completedAt: T } } });
    expect(sanitizeProgress({ version: 2, modules: {} })).toEqual(createInitialProgress());
  });

  it('salvataggio corrotto → progressi vuoti', () => {
    expect(loadProgress({ getItem: (k) => (k === STORAGE_KEY ? '{rotto' : null) })).toEqual(createInitialProgress());
  });
});
