import { useCallback, useEffect, useState } from 'react';

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
