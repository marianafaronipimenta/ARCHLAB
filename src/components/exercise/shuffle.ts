/** Mescola una copia dell’array (Fisher-Yates). La correzione usa sempre gli ID, mai le posizioni. */
export function shuffled<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Mescola garantendo (se possibile) un ordine diverso da quello originale. */
export function shuffledNotIdentity<T>(items: readonly T[], random: () => number = Math.random): T[] {
  if (items.length < 2) return [...items];
  for (let k = 0; k < 10; k++) {
    const s = shuffled(items, random);
    if (s.some((x, i) => x !== items[i])) return s;
  }
  return [...items.slice(1), items[0]];
}
