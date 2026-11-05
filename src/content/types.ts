import type { ModuleId } from '../data/modules';

/*
 * Schema dei contenuti didattici di un modulo. I testi sono dati: i componenti li mostrano soltanto.
 * Gli ID (pagine, esercizi, domande, opzioni) sono stabili perché finiscono nei salvataggi.
 */

/* ───────────── Learn ───────────── */

export type DiagramId = 'livelli' | 'interprete-traduttore' | 'macchine-virtuali' | 'catena-traduzione' | 'ciclo-fde' | 'rpn' | 'endianness' | 'memory-layout' | 'location-counter';

export type LearnBlock =
  | { type: 'p'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'code'; code: string; caption?: string }
  | { type: 'callout'; tone: 'info' | 'warn'; title: string; text: string }
  | { type: 'diagram'; diagram: DiagramId };

export interface LearnPage {
  id: string;
  title: string;
  blocks: LearnBlock[];
  /** Punti da ricordare, mostrati in fondo alla pagina. */
  keyPoints?: string[];
  /** Domanda di verifica facoltativa (una ChoiceQuestion della pratica o del quiz). */
  checkId?: string;
  /** Riferimento alle slide della lezione (posizione nella presentazione). */
  slides: string;
}

/* ───────────── Domande ed esercizi ───────────── */

export interface ChoiceOption {
  id: string;
  text: string;
  /** Spiega perché questa opzione è giusta o sbagliata. */
  feedback: string;
}

export interface ChoiceQuestion {
  kind: 'choice';
  id: string;
  prompt: string;
  /** Codice o dati da mostrare sotto la domanda. */
  code?: string;
  options: ChoiceOption[];
  correct: string;
  /** Spiegazione generale mostrata dopo la risposta. */
  explanation: string;
  /** Suggerimento (non mostrato nella Challenge). */
  hint?: string;
  /** Pagina Learn da ripassare se si sbaglia. */
  learnRef: string;
}

/** Riordinare elementi (es. i livelli dal più basso al più alto). */
export interface OrderExercise {
  kind: 'order';
  id: string;
  prompt: string;
  /** Elementi nell’ordine corretto. */
  items: { id: string; text: string }[];
  explanation: string;
  hint?: string;
  learnRef: string;
}

/** Abbinare ogni elemento a sinistra con una descrizione a destra. */
export interface MatchExercise {
  kind: 'match';
  id: string;
  prompt: string;
  pairs: { id: string; left: string; right: string; feedback: string }[];
  explanation: string;
  hint?: string;
  learnRef: string;
}

export type Exercise = ChoiceQuestion | OrderExercise | MatchExercise;

export interface ModuleContent {
  moduleId: ModuleId;
  learn: LearnPage[];
  practice: Exercise[];
  quiz: { intro: string; questions: ChoiceQuestion[] };
  challenge: { intro: string; questions: ChoiceQuestion[] };
}
