import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { ModuleId, SectionId } from '../data/modules';
import { STORAGE_KEY, loadProgress, recordAnswers, recordSection, saveProgress, setLearnPage, type StudentProgress } from './progress';

interface ProgressApi {
  progress: StudentProgress;
  completeSection: (m: ModuleId, s: SectionId, score?: number) => void;
  recordResults: (m: ModuleId, results: { id: string; correct: boolean }[]) => void;
  rememberLearnPage: (m: ModuleId, pageId: string) => void;
}

const Ctx = createContext<ProgressApi | null>(null);

/** Stato dei progressi condiviso dall’app, salvato a ogni modifica. */
export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<StudentProgress>(() => loadProgress());

  // Riallinea se i progressi cambiano in un’altra scheda.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setProgress(loadProgress());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const update = useCallback((f: (p: StudentProgress) => StudentProgress) => {
    setProgress((prev) => {
      const next = f(prev);
      if (next !== prev) saveProgress(next);
      return next;
    });
  }, []);

  const api = useMemo<ProgressApi>(
    () => ({
      progress,
      completeSection: (m, s, score) => update((p) => recordSection(p, m, s, Date.now(), score)),
      recordResults: (m, results) => update((p) => recordAnswers(p, m, results)),
      rememberLearnPage: (m, pageId) => update((p) => setLearnPage(p, m, pageId)),
    }),
    [progress, update],
  );

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useProgressStore(): ProgressApi {
  const api = useContext(Ctx);
  if (!api) throw new Error('useProgressStore va usato dentro ProgressProvider');
  return api;
}
