/*
 * Predizione dinamica dei salti (lezione 13): predittore a 1 bit e a 2 bit (contatore a saturazione).
 * Il ciclo d’esempio è: addi x1, x0, N / loop: addi x1, x1, -1 / bne x1, x0, loop
 * → il bne è preso N − 1 volte e non preso all’ultima iterazione.
 */

export type PredKind = '1bit' | '2bit';

export interface PredStep {
  run: number;
  iteration: number;
  before: number;
  predicted: boolean;
  taken: boolean;
  after: number;
}

export const predicts = (kind: PredKind, state: number) => (kind === '1bit' ? state === 1 : state >= 2);

export function update(kind: PredKind, state: number, taken: boolean) {
  if (kind === '1bit') return taken ? 1 : 0;
  return taken ? Math.min(3, state + 1) : Math.max(0, state - 1);
}

export const stateLabel = (kind: PredKind, s: number) => (kind === '1bit' ? String(s) : s.toString(2).padStart(2, '0'));

/** Esegue il ciclo `runs` volte (per esempio perché sta in una routine), con lo stesso stato del predittore. */
export function simulateLoop(kind: PredKind, n: number, runs: number, initial: number): PredStep[] {
  const out: PredStep[] = [];
  let s = initial;
  for (let r = 1; r <= runs; r++) {
    for (let i = 1; i <= n; i++) {
      const taken = i < n;
      const predicted = predicts(kind, s);
      const after = update(kind, s, taken);
      out.push({ run: r, iteration: i, before: s, predicted, taken, after });
      s = after;
    }
  }
  return out;
}

export const errors = (steps: PredStep[], run?: number) => steps.filter((s) => (run === undefined || s.run === run) && s.predicted !== s.taken).length;
