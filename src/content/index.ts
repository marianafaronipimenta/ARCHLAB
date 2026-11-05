import type { ModuleId } from '../data/modules';
import { m01 } from './m01-approccio-strutturale';
import { m02 } from './m02-assembly-object-executable';
import { m03 } from './m03-isa';
import { m04 } from './m04-riscv-rv32i';
import { m05 } from './m05-location-counter';
import type { ChoiceQuestion, Exercise, ModuleContent } from './types';

/** Contenuti dei moduli già sviluppati. */
const CONTENT: Partial<Record<ModuleId, ModuleContent>> = {
  'approccio-strutturale': m01,
  'assembly-object-executable': m02,
  isa: m03,
  'riscv-rv32i': m04,
  'location-counter': m05,
};

export const getModuleContent = (id: ModuleId): ModuleContent | undefined => CONTENT[id];
export const allContent = (): ModuleContent[] => Object.values(CONTENT).filter((c): c is ModuleContent => c !== undefined);

/** Tutte le domande ed esercizi di un modulo, per ID. */
export function findItem(content: ModuleContent, id: string): Exercise | ChoiceQuestion | undefined {
  return [...content.practice, ...content.quiz.questions, ...content.challenge.questions].find((q) => q.id === id);
}

/** Controlla la coerenza dei contenuti: usato dai test. */
export function validateContent(c: ModuleContent): string[] {
  const errors: string[] = [];
  const pages = new Set(c.learn.map((p) => p.id));
  if (pages.size !== c.learn.length) errors.push(`${c.moduleId}: pagine Learn duplicate`);
  const items = [...c.practice, ...c.quiz.questions, ...c.challenge.questions];
  const ids = new Set<string>();
  for (const q of items) {
    if (ids.has(q.id)) errors.push(`${q.id}: ID duplicato`);
    ids.add(q.id);
    if (!pages.has(q.learnRef)) errors.push(`${q.id}: learnRef inesistente ${q.learnRef}`);
    if (!q.explanation.trim()) errors.push(`${q.id}: spiegazione mancante`);
    if (q.kind === 'choice') {
      if (q.options.length < 3) errors.push(`${q.id}: servono almeno 3 opzioni`);
      if (q.options.filter((o) => o.id === q.correct).length !== 1) errors.push(`${q.id}: risposta corretta non valida`);
      if (q.options.some((o) => !o.feedback.trim())) errors.push(`${q.id}: feedback mancante`);
    }
    if (q.kind === 'order' && q.items.length < 3) errors.push(`${q.id}: servono almeno 3 elementi`);
    if (q.kind === 'match') {
      if (q.pairs.length < 3) errors.push(`${q.id}: servono almeno 3 coppie`);
      if (new Set(q.pairs.map((p) => p.right)).size !== q.pairs.length) errors.push(`${q.id}: descrizioni duplicate`);
    }
  }
  for (const p of c.learn) if (p.checkId && !ids.has(p.checkId)) errors.push(`${p.id}: checkId inesistente ${p.checkId}`);
  for (const q of c.challenge.questions) if (q.hint) errors.push(`${q.id}: la Challenge non prevede suggerimenti`);
  const practiced = new Set([...c.practice, ...c.quiz.questions].map((q) => q.id));
  for (const q of c.challenge.questions) if (practiced.has(q.id)) errors.push(`${q.id}: domanda della Challenge riusata`);
  // Il Quiz non ripete le domande della Practice (lo stesso concetto va chiesto al contrario o in un caso nuovo).
  const norm = (t: string) => t.toLowerCase().replace(/\s+/g, ' ').trim();
  const practicePrompts = new Set(c.practice.map((q) => norm(q.prompt)));
  for (const q of c.quiz.questions) if (practicePrompts.has(norm(q.prompt))) errors.push(`${q.id}: domanda uguale a una della Practice`);
  if (c.quiz.questions.length < 5) errors.push(`${c.moduleId}: quiz troppo breve`);
  if (c.challenge.questions.length < 5) errors.push(`${c.moduleId}: challenge troppo breve`);
  return errors;
}
