/*
 * Moduli del corso, nell'ordine delle lezioni della cartella «architettura 2».
 * Titoli, sommari e argomenti sono presi dagli «Obiettivi» delle slide di ciascuna lezione.
 * Gli ID sono stabili: verranno usati nei salvataggi dei progressi.
 */

export type ModuleId =
  | 'approccio-strutturale'
  | 'assembly-object-executable'
  | 'isa'
  | 'riscv-rv32i'
  | 'location-counter'
  | 'processore'
  | 'pipeline';

/** Le cinque aree di ogni modulo. «progress» è una vista, non un’attività. */
export type SectionId = 'learn' | 'practice' | 'quiz' | 'challenge';
export const SECTION_IDS: SectionId[] = ['learn', 'practice', 'quiz', 'challenge'];
export const SECTION_LABELS: Record<SectionId | 'progress', string> = {
  learn: 'Learn',
  practice: 'Practice',
  quiz: 'Quiz',
  challenge: 'Challenge',
  progress: 'Progress',
};

export type ModuleIcon = 'layers' | 'files' | 'isa' | 'riscv' | 'counter' | 'cpu' | 'pipeline';

export interface SourceDeck {
  /** Numero della lezione nella cartella del corso. */
  lesson: number;
  title: string;
}

export interface CourseModule {
  id: ModuleId;
  number: string;
  title: string;
  /** Frase breve per la card. */
  tagline: string;
  /** Argomenti principali, dagli obiettivi della lezione. */
  topics: string[];
  icon: ModuleIcon;
  sources: SourceDeck[];
  /** Sezioni già realizzate. Finché un modulo non è sviluppato, l’elenco è vuoto. */
  availableSections: SectionId[];
}

export const MODULES: CourseModule[] = [
  {
    id: 'approccio-strutturale',
    number: '01',
    title: 'Approccio strutturale',
    tagline: 'Macchine virtuali, semantic gap e livelli del calcolatore.',
    topics: ['Macchina virtuale e astrazione', 'Semantic gap', 'Traduzione vs interpretazione', 'Livelli L0–L5'],
    icon: 'layers',
    sources: [{ lesson: 1, title: 'Approccio strutturale dei moderni sistemi di elaborazione' }],
    availableSections: ['learn', 'practice', 'quiz', 'challenge'],
  },
  {
    id: 'assembly-object-executable',
    number: '02',
    title: 'Assembly, Object and Executable Files',
    tagline: 'Dal sorgente C al processo in memoria.',
    topics: ['Catena di traduzione', 'Compilatore, assemblatore, linker, loader', 'File .c, .s, .o ed eseguibili', 'Simboli esterni'],
    icon: 'files',
    sources: [{ lesson: 2, title: 'Assembly, object, and executable files' }],
    availableSections: ['learn', 'practice', 'quiz', 'challenge'],
  },
  {
    id: 'isa',
    number: '03',
    title: 'ISA',
    tagline: 'L’interfaccia tra hardware e software.',
    topics: ['Livelli di privilegio', 'Stack, accumulatore, load-store', 'Notazione polacca inversa', 'Endianness e allineamento', 'Dipendenze RAW, WAR, WAW'],
    icon: 'isa',
    sources: [{ lesson: 3, title: 'Instruction Set Architecture (ISA)' }],
    availableSections: ['learn', 'practice', 'quiz', 'challenge'],
  },
  {
    id: 'riscv-rv32i',
    number: '04',
    title: 'RISC-V (RV32I)',
    tagline: 'Registri, istruzioni e programmi in assembly RISC-V.',
    topics: ['Memory layout', 'Gruppi di istruzioni e pseudo-istruzioni', 'Sezioni .text e .data, direttive, ABI', 'Flusso d’esecuzione', 'Funzioni, procedure e stack', 'Estensione M (RV32IM)'],
    icon: 'riscv',
    sources: [
      { lesson: 4, title: 'RISC-V (RV32I)' },
      { lesson: 5, title: 'Primi passi in RISC-V' },
      { lesson: 6, title: 'Gestire il flusso d’esecuzione in RISC-V' },
      { lesson: 7, title: 'Funzioni e procedure in RISC-V' },
      { lesson: 9, title: 'RISC-V (RV32IM)' },
    ],
    availableSections: [],
  },
  {
    id: 'location-counter',
    number: '05',
    title: 'Location Counter',
    tagline: 'Come l’assembler sa «dove siamo» in memoria.',
    topics: ['Location Counter', 'Symbol table', 'Direttive .skip, .align, .ascii, .asciz', 'Espansione delle pseudo-istruzioni'],
    icon: 'counter',
    sources: [{ lesson: 8, title: 'Location Counter' }],
    availableSections: [],
  },
  {
    id: 'processore',
    number: '06',
    title: 'Il processore',
    tagline: 'Data path e unità di controllo di un RISC-V.',
    topics: ['Fetch, decodifica, esecuzione, memoria, write-back', 'Data path', 'Segnali di controllo', 'Istruzioni R, load/store, branch', 'Clock e latenze'],
    icon: 'cpu',
    sources: [{ lesson: 10, title: 'Il processore' }],
    availableSections: [],
  },
  {
    id: 'pipeline',
    number: '07',
    title: 'Pipeline',
    tagline: 'Sovrapporre le istruzioni e gestire gli hazard.',
    topics: ['Stadi IF, ID, EX, MEM, WB', 'Registri di pipeline', 'Hazard strutturali e sui dati', 'Hazard sul controllo e predizione', 'Diagrammi multi-ciclo'],
    icon: 'pipeline',
    sources: [
      { lesson: 11, title: 'La pipeline' },
      { lesson: 12, title: 'Pipeline: hazard sui dati' },
      { lesson: 13, title: 'Pipeline: hazard sul controllo' },
    ],
    availableSections: [],
  },
];

export const getModule = (id: ModuleId) => MODULES.find((m) => m.id === id);
