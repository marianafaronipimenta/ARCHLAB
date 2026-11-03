import { ACHIEVEMENTS, type AchievementId } from '../data/catalog';
import { MODULES, SECTION_IDS, type CourseModule, type ModuleId, type SectionId } from '../data/modules';

/*
 * Progressi dello studente, salvati solo nel browser (localStorage).
 * Nessun dato è inventato: all’inizio tutto è a zero e cresce solo con attività reali.
 */

export const STORAGE_KEY = 'archlab.progress.v1';
export const SCHEMA_VERSION = 1;

export interface SectionRecord {
  completedAt: number;
  /** Miglior punteggio 0–1 per quiz e challenge. */
  bestScore?: number;
  attempts?: number;
}

export interface ModuleRecord {
  sections: Partial<Record<SectionId, SectionRecord>>;
  /** ID delle domande sbagliate e non ancora recuperate. */
  mistakes: string[];
  /** Ultima pagina Learn aperta, per riprendere da lì. */
  learnPage?: string;
}

export interface StudentProgress {
  version: number;
  modules: Partial<Record<ModuleId, ModuleRecord>>;
}

export const XP_PER_SECTION: Record<SectionId, number> = { learn: 50, practice: 75, quiz: 100, challenge: 150 };
export const XP_PER_LEVEL = 500;
/** Punteggio minimo perché quiz e challenge contino come superati. */
export const PASS_SCORE = 0.6;

export const createInitialProgress = (): StudentProgress => ({ version: SCHEMA_VERSION, modules: {} });
const emptyModule = (): ModuleRecord => ({ sections: {}, mistakes: [] });

const MODULE_IDS = new Set<string>(MODULES.map((m) => m.id));
const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

/** Ripulisce dati letti dallo storage: ciò che non è valido viene scartato senza errori. */
export function sanitizeProgress(raw: unknown): StudentProgress {
  const out = createInitialProgress();
  if (!isRecord(raw) || raw.version !== SCHEMA_VERSION || !isRecord(raw.modules)) return out;
  for (const [moduleId, rec] of Object.entries(raw.modules)) {
    if (!MODULE_IDS.has(moduleId) || !isRecord(rec)) continue;
    const clean = emptyModule();
    const sections = isRecord(rec.sections) ? rec.sections : {};
    for (const sid of SECTION_IDS) {
      const s = sections[sid];
      if (!isRecord(s) || typeof s.completedAt !== 'number' || !Number.isFinite(s.completedAt)) continue;
      const r: SectionRecord = { completedAt: s.completedAt };
      if (typeof s.bestScore === 'number' && s.bestScore >= 0 && s.bestScore <= 1) r.bestScore = s.bestScore;
      if (typeof s.attempts === 'number' && Number.isInteger(s.attempts) && s.attempts > 0) r.attempts = s.attempts;
      clean.sections[sid] = r;
    }
    if (Array.isArray(rec.mistakes)) clean.mistakes = [...new Set(rec.mistakes.filter((x): x is string => typeof x === 'string'))];
    if (typeof rec.learnPage === 'string') clean.learnPage = rec.learnPage;
    out.modules[moduleId as ModuleId] = clean;
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

/* ───────────── Azioni (pure: restituiscono un nuovo stato) ───────────── */

const withModule = (p: StudentProgress, m: ModuleId, f: (r: ModuleRecord) => ModuleRecord): StudentProgress => {
  const cur = p.modules[m] ?? emptyModule();
  return { ...p, modules: { ...p.modules, [m]: f({ ...cur, sections: { ...cur.sections }, mistakes: [...cur.mistakes] }) } };
};

/**
 * Registra un’attività di una sezione. Per quiz e challenge il punteggio aggiorna il migliore
 * e la data indica il primo superamento della soglia.
 */
export function recordSection(p: StudentProgress, m: ModuleId, section: SectionId, now: number, score?: number): StudentProgress {
  return withModule(p, m, (r) => {
    const prev = r.sections[section];
    const best = Math.max(prev?.bestScore ?? -1, score ?? -1);
    const scored = section === 'quiz' || section === 'challenge';
    const passes = (sc: number) => !scored || sc >= PASS_SCORE;
    // La data registra il primo superamento (o il primo tentativo finché non si supera).
    const keepDate = prev && (passes(prev.bestScore ?? -1) || !passes(best));
    const next: SectionRecord = { completedAt: keepDate ? prev.completedAt : now, attempts: (prev?.attempts ?? 0) + 1 };
    if (best >= 0) next.bestScore = best;
    r.sections[section] = next;
    return r;
  });
}

/** Aggiorna gli errori da ripassare: le risposte sbagliate entrano, quelle corrette escono. */
export function recordAnswers(p: StudentProgress, m: ModuleId, results: { id: string; correct: boolean }[]): StudentProgress {
  return withModule(p, m, (r) => {
    const set = new Set(r.mistakes);
    for (const { id, correct } of results) {
      if (correct) set.delete(id);
      else set.add(id);
    }
    r.mistakes = [...set];
    return r;
  });
}

export const setLearnPage = (p: StudentProgress, m: ModuleId, pageId: string): StudentProgress =>
  p.modules[m]?.learnPage === pageId ? p : withModule(p, m, (r) => ({ ...r, learnPage: pageId }));

/* ───────────── Selettori ───────────── */

export function isSectionDone(p: StudentProgress, m: ModuleId, s: SectionId) {
  const rec = p.modules[m]?.sections[s];
  if (!rec) return false;
  return s === 'quiz' || s === 'challenge' ? (rec.bestScore ?? 0) >= PASS_SCORE : true;
}

/** Frazione di sezioni completate in un modulo (0–1). */
export const moduleCompletion = (p: StudentProgress, m: ModuleId) =>
  SECTION_IDS.filter((s) => isSectionDone(p, m, s)).length / SECTION_IDS.length;

/** Frazione di sezioni completate in tutto il corso (0–1). */
export const courseCompletion = (p: StudentProgress) =>
  MODULES.reduce((sum, m) => sum + moduleCompletion(p, m.id), 0) / MODULES.length;

export const modulesCompleted = (p: StudentProgress) => MODULES.filter((m) => moduleCompletion(p, m.id) === 1).length;

export function totalXp(p: StudentProgress) {
  let xp = 0;
  for (const m of MODULES) for (const s of SECTION_IDS) if (isSectionDone(p, m.id, s)) xp += XP_PER_SECTION[s];
  return xp;
}

export function levelInfo(xp: number) {
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const into = xp % XP_PER_LEVEL;
  return { level, into, needed: XP_PER_LEVEL, fraction: into / XP_PER_LEVEL };
}

export function unlockedAchievements(p: StudentProgress): Set<AchievementId> {
  const out = new Set<AchievementId>();
  const recs = MODULES.map((m) => p.modules[m.id]?.sections ?? {});
  if (recs.some((r) => r.learn)) out.add('primo-passo');
  if (recs.some((r) => r.quiz?.bestScore === 1)) out.add('quiz-perfetto');
  if (MODULES.some((m) => isSectionDone(p, m.id, 'challenge'))) out.add('prima-sfida');
  if (modulesCompleted(p) === MODULES.length) out.add('corso-completo');
  return new Set(ACHIEVEMENTS.map((a) => a.id).filter((id) => out.has(id)));
}

/** Prossimo passo consigliato: prima sezione non completata, seguendo l’ordine dei moduli. */
export function nextStep(p: StudentProgress): { module: CourseModule; section: SectionId } | null {
  for (const m of MODULES) {
    const s = SECTION_IDS.find((sid) => !isSectionDone(p, m.id, sid));
    if (s) return { module: m, section: s };
  }
  return null;
}
