import { useCallback, useEffect, useState } from 'react';
import { STORAGE_KEY, loadProgress, type StudentProgress } from './progress';

/** Progressi dello studente, riletti se cambiano in un’altra scheda del browser. */
export function useProgress(): StudentProgress {
  const [progress, setProgress] = useState<StudentProgress>(() => loadProgress());
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setProgress(loadProgress());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);
  return progress;
}

/* ───────────── Preferenze di visualizzazione ───────────── */

const PREFS_KEY = 'archlab.prefs.v1';

export interface Preferences {
  /** Riduce bagliori e animazioni per sessioni di studio lunghe. */
  calmMode: boolean;
}

function readPrefs(): Preferences {
  try {
    const raw = JSON.parse(localStorage.getItem(PREFS_KEY) ?? '{}');
    return { calmMode: raw?.calmMode === true };
  } catch {
    return { calmMode: false };
  }
}

export function usePreferences() {
  const [prefs, setPrefs] = useState<Preferences>(readPrefs);
  useEffect(() => {
    document.documentElement.dataset.calm = prefs.calmMode ? 'true' : 'false';
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    } catch {
      /* preferenze solo per questa sessione */
    }
  }, [prefs]);
  const update = useCallback((patch: Partial<Preferences>) => setPrefs((p) => ({ ...p, ...patch })), []);
  return [prefs, update] as const;
}
