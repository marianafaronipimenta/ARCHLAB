import { useEffect, useRef } from 'react';
import type { Preferences } from '../../state/hooks';

interface SettingsDialogProps {
  open: boolean;
  prefs: Preferences;
  onChange: (patch: Partial<Preferences>) => void;
  onClose: () => void;
}

/** Impostazioni reali e salvate nel browser. Usa <dialog> nativo per focus ed Esc. */
export function SettingsDialog({ open, prefs, onChange, onClose }: SettingsDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog ref={ref} className="dialog" aria-labelledby="settings-title" onClose={onClose}>
      <h2 id="settings-title" className="dialog-title">
        Impostazioni
      </h2>
      <label className="toggle">
        <input type="checkbox" checked={prefs.calmMode} onChange={(e) => onChange({ calmMode: e.target.checked })} />
        <span>
          <strong>Modalità studio</strong>
          <span className="toggle-desc">Riduce bagliori e animazioni per sessioni lunghe.</span>
        </span>
      </label>
      <p className="hint-text">I progressi e le preferenze restano solo in questo browser.</p>
      <div className="dialog-actions">
        <button type="button" className="btn" onClick={onClose}>
          Chiudi
        </button>
      </div>
    </dialog>
  );
}
