interface ProgressBarProps {
  /** Valore 0–1. */
  value: number;
  label: string;
  size?: 'sm' | 'md';
  /** Testo del valore mostrato accanto (es. «0%»); se assente non viene mostrato. */
  valueText?: string;
}

export function ProgressBar({ value, label, size = 'md', valueText }: ProgressBarProps) {
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100);
  return (
    <div className={`progress progress-${size}`}>
      <div
        className="progress-track"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-valuetext={valueText ?? `${pct}%`}
      >
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
      {valueText && <span className="progress-value">{valueText}</span>}
    </div>
  );
}
