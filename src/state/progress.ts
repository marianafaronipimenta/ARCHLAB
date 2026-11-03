import { ACHIEVEMENTS, type AchievementId } from '../data/catalog';
import { MODULES, SECTION_IDS, type CourseModule, type ModuleId, type SectionId } from '../data/modules';

/*
 * Progressi dello studente, salvati solo nel browser (localStorage).
 * Nessun dato è inventato: all’inizio tutto è a zero e cresce solo quando le sezioni dei moduli
 * (ancora da sviluppare) registrano un completamento.
 */

export const STORAGE_KEY = 'archlab.progress.v1';
export const SCHEMA_VERSION = 1;

export interface SectionRecord {
  completedAt: number;
  /** Punteggio 0–1 per quiz e challenge. */
  bestScore?: number;
}

export interface StudentProgress {
  version: number;
  modules: Partial<Record<ModuleId, Partial<Record<SectionId, SectionRecord>>>>;
}

export const XP_PER_SECTION: Record<SectionId, number> = { learn: 50, practice: 75, quiz: 100, challenge: 150 };
export const XP_PER_LEVEL = 500;
/** Punteggio minimo perché una Challenge conti come superata. */
export const CHALLENGE_PASS = 0.6;

export const createInitialProgress = (): StudentProgress => ({ version: SCHEMA_VERSION, modules: {} });

const MODULE_IDS = new Set<string>(MODULES.map((m) => m.id));
const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

/** Ripulisce dati letti dallo storage: ciò che non è valido viene scartato senza errori. */
export function sanitizeProgress(raw: unknown): StudentProgress {
  const out = createInitialProgress();
  if (!isRecord(raw) || raw.version !== SCHEMA_VERSION || !isRecord(raw.modules)) return out;
  for (const [moduleId, sections] of Object.entries(raw.modules)) {
    if (!MODULE_IDS.has(moduleId) || !isRecord(sections)) continue;
    const clean: Partial<Record<SectionId, SectionRecord>> = {};
    for (const sid of SECTION_IDS) {
      const rec = sections[sid];
      if (!isRecord(rec) || typeof rec.completedAt !== 'number' || !Number.isFinite(rec.completedAt)) continue;
      const score = rec.bestScore;
      clean[sid] =
        typeof score === 'number' && score >= 0 && score <= 1 ? { completedAt: rec.completedAt, bestScore: score } : { completedAt: rec.completedAt };
    }
    if (Object.keys(clean).length) out.modules[moduleId as ModuleId] = clean;
  }
  return out;
}

export function loadProgress(storage: Pick<Storage, 'getItem'> | undefined = globalThis.localStorage): StudentProgress {
  try {
    const text = storage?.getItem(STORAGE_KEY);
    return text ? sanitizeProgress(JSON.parse(text)) : createInitialProgress();
  } catch {
    return createInitialProgress();
  }
}

export function saveProgress(progress: StudentProgress, storage: Pick<Storage, 'setItem'> | undefined = globalThis.localStorage) {
  try {
    storage?.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    /* storage non disponibile (es. navigazione privata): i progressi restano in memoria */
  }
}

/* ───────────── Selettori ───────────── */

const isDone = (p: StudentProgress, m: ModuleId, s: SectionId) => {
  const rec = p.modules[m]?.[s];
  if (!rec) return false;
  return s === 'challenge' ? (rec.bestScore ?? 0) >= CHALLENGE_PASS : true;
};

/** Frazione di sezioni completate in un modulo (0–1). */
export const moduleCompletion = (p: StudentProgress, m: ModuleId) =>
  SECTION_IDS.filter((s) => isDone(p, m, s)).length / SECTION_IDS.length;

/** Frazione di sezioni completate in tutto il corso (0–1). */
export const courseCompletion = (p: StudentProgress) =>
  MODULES.reduce((sum, m) => sum + moduleCompletion(p, m.id), 0) / MODULES.length;

export const modulesCompleted = (p: StudentProgress) => MODULES.filter((m) => moduleCompletion(p, m.id) === 1).length;

export function totalXp(p: StudentProgress) {
  let xp = 0;
  for (const m of MODULES) for (const s of SECTION_IDS) if (isDone(p, m.id, s)) xp += XP_PER_SECTION[s];
  return xp;
}

export function levelInfo(xp: number) {
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const into = xp % XP_PER_LEVEL;
  return { level, into, needed: XP_PER_LEVEL, fraction: into / XP_PER_LEVEL };
}

export function unlockedAchievements(p: StudentProgress): Set<AchievementId> {
  const out = new Set<AchievementId>();
  const recs = MODULES.map((m) => p.modules[m.id] ?? {});
  if (recs.some((r) => r.learn)) out.add('primo-passo');
  if (recs.some((r) => r.quiz?.bestScore === 1)) out.add('quiz-perfetto');
  if (MODULES.some((m) => isDone(p, m.id, 'challenge'))) out.add('prima-sfida');
  if (modulesCompleted(p) === MODULES.length) out.add('corso-completo');
  // Mantiene l’ordine del catalogo
  return new Set(ACHIEVEMENTS.map((a) => a.id).filter((id) => out.has(id)));
}

/** Prossimo passo consigliato: prima sezione non completata, seguendo l’ordine dei moduli. */
export function nextStep(p: StudentProgress): { module: CourseModule; section: SectionId } | null {
  for (const m of MODULES) {
    const s = SECTION_IDS.find((sid) => !isDone(p, m.id, sid));
    if (s) return { module: m, section: s };
  }
  return null;
}
