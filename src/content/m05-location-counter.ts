import type { ModuleContent } from './types';

/*
 * MODULO 05 — Location Counter
 * Fonte: lezione 8 «Location Counter».
 * Gli esempi del simulatore passo passo sono in sim/lcExamples.ts e i test verificano
 * che riproducano le symbol table delle slide.
 * Il Quiz non ripete la Practice: stessi concetti chiesti al contrario o in casi nuovi.
 */

export const m05: ModuleContent = {
  moduleId: 'location-counter',

  /* ═════════════ LEARN ═════════════ */
  learn: [
    {
      id: 'ruolo-lc',
      title: 'Symbol table e Location Counter',
      slides: 'lezione 8, slide 3–5',
      blocks: [
        {
          type: 'p',
          text: 'La symbol table è la struttura dati con cui l’assembler (e anche compilatore e linker) tiene traccia dei simboli del programma. Un simbolo è tipicamente l’etichetta di una funzione, l’etichetta di un blocco di codice, il nome di una variabile globale o una costante definita con una direttiva.',
        },
        {
          type: 'p',
          text: 'Per riempire la symbol table l’assembler deve sapere dove finiranno istruzioni e dati in memoria. Per questo usa uno pseudo-simbolo, il Location Counter (LC): tiene sempre traccia dell’indirizzo del prossimo byte che sarà scritto nel programma, e si aggiorna automaticamente a ogni istruzione o dato letto.',
        },
        {
          type: 'list',
          items: [
            'una label in .text (loop:, end:) riceve l’indirizzo corrente dell’LC e punta esattamente all’istruzione che segue;',
            'una label in .data (value: .word 42) riceve l’indirizzo in cui verrà memorizzato il dato;',
            'una direttiva .set associa a un simbolo un valore numerico scelto dall’utente.',
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'L’idea in una frase',
          text: 'L’LC è il modo in cui l’assembler sa «dove siamo» in memoria. È un contatore automatico: avanza con ogni byte di codice o di dati, e ogni nuova label viene mappata sul suo valore corrente. Senza LC la symbol table resterebbe vuota o imprecisa.',
        },
      ],
      keyPoints: ['LC = indirizzo del prossimo byte da scrivere', 'Label → valore corrente dell’LC', 'Serve a riempire la symbol table'],
      checkId: 'p05-cos-e-lc',
    },
    {
      id: 'lc-codice-dati',
      title: 'Come avanza l’LC nel codice e nei dati',
      slides: 'lezione 8, slide 6–11',
      blocks: [
        {
          type: 'p',
          text: 'Nella sezione .text l’LC parte da un indirizzo iniziale definito dall’ambiente o dall’architettura (negli esercizi 0x00000000) e avanza di 4 byte per ogni istruzione, perché in RV32I ogni istruzione è lunga 32 bit.',
        },
        {
          type: 'p',
          text: 'Anche i dati vanno nella symbol table. Per le variabili globali l’LC parte da un valore iniziale diverso (negli esercizi 0x10000000) e avanza della dimensione del dato allocato: 1 byte per .byte, 2 per .half, 4 per .word, un byte per carattere per le stringhe.',
        },
        {
          type: 'code',
          caption: 'Avanzamento dell’LC',
          code: `.text                     .data
  addi …     +4             .byte 7        +1
  lw …       +4             .half 300      +2
  la …       +8 (2 istr.)   .word 1, 2     +8
  loop:      +0             .ascii "ciao"  +4
                            .asciz "ciao"  +5`,
        },
        {
          type: 'callout',
          tone: 'warn',
          title: '.equ non entra nella symbol table',
          text: '.equ definisce una costante usata per rendere il codice leggibile: non occupa memoria, non sposta l’LC e non viene inserita nella symbol table. Un simbolo definito con .set invece compare nella symbol table con il suo valore.',
        },
      ],
      keyPoints: ['.text: +4 per istruzione', '.data: + dimensione del dato', 'Le label non occupano byte', '.equ: niente LC, niente symbol table'],
      checkId: 'p05-match-avanzamento',
    },
    {
      id: 'direttive-lc',
      title: '.skip, .align, .ascii e .asciz',
      slides: 'lezione 8, slide 12–15, 24–26',
      blocks: [
        {
          type: 'p',
          text: '.skip n fa avanzare manualmente l’LC di n byte, lasciando lo spazio vuoto: serve a riservare memoria non inizializzata (un buffer, uno spazio tra variabili).',
        },
        {
          type: 'code',
          caption: 'Esempio delle slide',
          code: `.data
array: .byte 1, 2, 3     # array = 0x0, LC → 3
       .skip 5           # LC → 8
fine:  .byte 9           # fine = 0x8`,
        },
        {
          type: 'p',
          text: '.align N allinea l’LC al successivo indirizzo multiplo di una potenza di due, inserendo eventualmente byte di padding. Nell’assembler GNU per RISC-V .align N allinea a 2^N byte: .align 2 significa multiplo di 4. L’allineamento rende più efficienti gli accessi.',
        },
        {
          type: 'code',
          caption: 'Con e senza .align',
          code: `valore1: .byte 10        # 0x0
         .align 2        # LC: 1 → 4
valore2: .word 10        # 0x4   (senza .align sarebbe 0x1)`,
        },
        {
          type: 'p',
          text: '.ascii scrive i caratteri della stringa e basta; .asciz aggiunge il terminatore \\0. «ciao» occupa quindi 4 byte con .ascii e 5 con .asciz, e la label successiva si sposta di conseguenza.',
        },
        {
          type: 'callout',
          tone: 'warn',
          title: 'Simulatore e GNU as non sono uguali',
          text: 'Secondo le slide, il RISC-V Simulator usato a lezione sbaglia la symbol table delle variabili e non supporta .align (allinea sempre a 4 byte). Per verificare un esercizio si usano gli strumenti da terminale: riscv64-unknown-elf-as -mabi=ilp32 -march=rv32g -o main.o main.s e poi riscv64-unknown-elf-nm main.o.',
        },
      ],
      keyPoints: ['.skip n: +n byte non inizializzati', '.align N (GNU): multiplo di 2^N', '.asciz = .ascii + 1 byte', 'Verifica con as + nm'],
      checkId: 'p05-skip',
    },
    {
      id: 'sezioni',
      title: 'Un LC per ogni sezione',
      slides: 'lezione 8, slide 17',
      blocks: [
        {
          type: 'p',
          text: 'Il Location Counter è indipendente per ogni sezione. Quando l’assembler incontra una direttiva di cambio sezione (per esempio passa da .text a .data):',
        },
        {
          type: 'list',
          items: [
            'salva il valore corrente dell’LC della sezione attiva;',
            'ripristina l’LC della nuova sezione, o lo inizializza se è la prima volta.',
          ],
        },
        {
          type: 'p',
          text: 'Per questo nella symbol table di un file oggetto i valori delle label non sono indirizzi fisici assoluti: sono offset, cioè distanze in byte dall’inizio della sezione in cui sono dichiarate. Sarà il linker a unire le sezioni omologhe di tutti i file oggetto, calcolare gli indirizzi assoluti finali e rilocare i simboli.',
        },
        {
          type: 'code',
          caption: 'Output di nm per l’esempio con x, y, z, diversi, uguali',
          code: `00000024 t diversi
00000034 t uguali
00000000 d x
00000001 d y
00000002 d z          # t = .text, d = .data: offset nella sezione`,
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Negli esercizi',
          text: 'Il testo dell’esercizio dice da dove partono le sezioni (per esempio dati da 0x10000000, istruzioni da 0x00000000): basta sommare la partenza all’offset.',
        },
      ],
      keyPoints: ['Un LC per sezione, salvato e ripristinato', 'Nel file oggetto: offset dalla sezione', 'Il linker calcola gli indirizzi assoluti'],
      checkId: 'p05-sezioni',
    },
    {
      id: 'pseudo',
      title: 'Pseudo-istruzioni che occupano più di 4 byte',
      slides: 'lezione 8, slide 18–20, 30–36',
      blocks: [
        {
          type: 'p',
          text: 'Ogni istruzione reale occupa 4 byte, ma una pseudo-istruzione può espandersi in più istruzioni reali: in quel caso l’LC avanza di più di 4 byte. Le regole usate negli esercizi del corso:',
        },
        {
          type: 'list',
          items: [
            'la → sempre due istruzioni (lui + addi): bisogna costruire un indirizzo completo, dato che il valore di gp è 0x10000000; 8 byte;',
            'li → una sola istruzione (addi) se l’immediato è rappresentabile su 12 bit, altrimenti due (lui + addi);',
            'call → una sola istruzione quando l’offset del bersaglio è rappresentabile nel formato, come succede sempre negli esercizi;',
            'mv, nop, ret, j → una sola istruzione.',
          ],
        },
        {
          type: 'code',
          caption: 'Esempio delle slide (istruzioni da 0x0)',
          code: `_start:
    li   t1, 500       # addi            → 4 byte
    li   t1, 50000     # lui + addi      → 8 byte
    add  a0, t0, t1    #                 → 4
    la   t0, x         # lui + addi      → 8
    lw   t0, 0(t0)     #                 → 4
    add  a0, a0, t0    #                 → 4
    call func_ok       # un’istruzione   → 4
func_ok:               # 36 = 0x24`,
        },
        {
          type: 'callout',
          tone: 'warn',
          title: 'GCC e simulatore possono tradurre in modo diverso',
          text: 'Nell’esempio con _start, loop e func il simulatore dà loop = 12 e func = 24, GCC invece 16 e 28: GCC traduce call con auipc + jalr, una sequenza che costruisce l’indirizzo in modo valido in qualsiasi posizione della memoria. Il simulatore esegue il codice che riceve e usa un jal diretto, perché l’indirizzo finale è già noto.',
        },
      ],
      keyPoints: ['la = 2 istruzioni = 8 byte', 'li: 1 istruzione se l’immediato sta in 12 bit, altrimenti 2', 'call = 1 istruzione negli esercizi', 'GCC: call = auipc + jalr'],
      checkId: 'p05-la',
    },
    {
      id: 'passo-passo',
      title: 'Prova: la symbol table riga per riga',
      slides: 'lezione 8, esempi',
      blocks: [
        {
          type: 'p',
          text: 'All’esame può essere chiesto di ricavare la symbol table di un programma RISC-V. Il metodo è sempre lo stesso: parti dall’indirizzo iniziale della sezione, per ogni riga chiediti quanti byte occupa e, quando incontri una label, scrivi il valore corrente dell’LC.',
        },
        { type: 'diagram', diagram: 'location-counter' },
        {
          type: 'list',
          items: [
            'Label: non occupa byte, prende l’LC corrente.',
            '.byte/.half/.word: 1, 2, 4 byte per valore.',
            '.ascii: un byte per carattere; .asciz: uno in più.',
            '.skip n: n byte. .align N: fino al multiplo di 2^N.',
            '.equ, .globl: l’LC non cambia.',
            'Istruzioni: 4 byte ciascuna, contando l’espansione delle pseudo-istruzioni.',
          ],
        },
      ],
      keyPoints: ['Parti dall’indirizzo iniziale della sezione', 'Somma i byte riga per riga', 'Label = LC corrente'],
      checkId: 'p05-asciz-label',
    },
  ],

  /* ═════════════ PRACTICE ═════════════ */
  practice: [
    {
      kind: 'choice',
      id: 'p05-cos-e-lc',
      prompt: 'Che cos’è il Location Counter?',
      options: [
        { id: 'a', text: 'Uno pseudo-simbolo con cui l’assembler tiene traccia dell’indirizzo del prossimo byte da scrivere', feedback: 'Esatto.' },
        { id: 'b', text: 'Un altro nome del Program Counter', feedback: 'Il PC è un registro del processore usato durante l’esecuzione; l’LC esiste solo durante l’assemblaggio.' },
        { id: 'c', text: 'Il numero di righe del sorgente', feedback: 'L’LC conta byte, non righe.' },
        { id: 'd', text: 'Un registro che conta le istruzioni eseguite', feedback: 'L’LC non conta esecuzioni: lavora mentre l’assembler traduce.' },
      ],
      correct: 'a',
      explanation: 'L’LC permette all’assembler di sapere «dove siamo» e quindi di dare un valore alle label nella symbol table.',
      hint: 'Chi lo usa: il processore o l’assembler?',
      learnRef: 'ruolo-lc',
    },
    {
      kind: 'choice',
      id: 'p05-text-avanza',
      prompt: 'Di quanto avanza l’LC per un’istruzione reale nella sezione .text di RV32I?',
      options: [
        { id: 'a', text: '4 byte', feedback: 'Esatto: ogni istruzione è da 32 bit.' },
        { id: 'b', text: '1 byte', feedback: 'Un byte è la dimensione di .byte.' },
        { id: 'c', text: '32 byte', feedback: 'Sono 32 bit, cioè 4 byte.' },
        { id: 'd', text: 'Dipende dal numero di operandi', feedback: 'In RV32I tutte le istruzioni hanno la stessa lunghezza.' },
      ],
      correct: 'a',
      explanation: 'Le pseudo-istruzioni che si espandono in più istruzioni reali contano 4 byte per ciascuna.',
      hint: '32 bit.',
      learnRef: 'lc-codice-dati',
    },
    {
      kind: 'match',
      id: 'p05-match-avanzamento',
      prompt: 'Abbina ogni riga a quanto fa avanzare l’LC.',
      pairs: [
        { id: 'byte', left: '.byte 1, 2', right: '+2 byte', feedback: 'Un byte per valore.' },
        { id: 'word', left: '.word 7', right: '+4 byte', feedback: 'Una word.' },
        { id: 'asciz', left: '.asciz "ok"', right: '+3 byte', feedback: 'Due caratteri + \\0.' },
        { id: 'skip', left: '.skip 6', right: '+6 byte', feedback: 'Spazio riservato e non inizializzato.' },
        { id: 'equ', left: '.equ N, 10', right: '+0 byte', feedback: 'Una costante non occupa memoria.' },
      ],
      explanation: 'Le label e .equ non spostano l’LC; i dati lo spostano della loro dimensione.',
      hint: 'Ricorda il terminatore di .asciz.',
      learnRef: 'lc-codice-dati',
    },
    {
      kind: 'choice',
      id: 'p05-equ',
      prompt: 'Una costante definita con .equ DIM, 4 compare nella symbol table?',
      options: [
        { id: 'a', text: 'No: non occupa memoria e non viene inserita nella symbol table', feedback: 'Esatto, secondo le slide.' },
        { id: 'b', text: 'Sì, con valore 4', feedback: 'Questo vale per un simbolo definito con .set.' },
        { id: 'c', text: 'Sì, con l’indirizzo corrente dell’LC', feedback: 'Questo vale per le label.' },
        { id: 'd', text: 'Solo se è anche .globl', feedback: '.globl riguarda la visibilità verso il linker.' },
      ],
      correct: 'a',
      explanation: 'Nell’esempio delle slide la symbol table contiene VAL (definito con .set) ma non DIM (definito con .equ).',
      hint: 'Le slide distinguono .equ da .set.',
      learnRef: 'lc-codice-dati',
    },
    {
      kind: 'choice',
      id: 'p05-align',
      prompt: 'Nell’assembler GNU per RISC-V, a che cosa allinea .align 2?',
      options: [
        { id: 'a', text: 'A un indirizzo multiplo di 4', feedback: 'Esatto: 2² = 4.' },
        { id: 'b', text: 'A un indirizzo multiplo di 2', feedback: 'L’argomento è l’esponente, non il multiplo.' },
        { id: 'c', text: 'Avanza sempre di 2 byte', feedback: 'Avanza solo quanto serve per arrivare al multiplo; se l’LC è già allineato non cambia.' },
        { id: 'd', text: 'Alla fine della sezione', feedback: 'Allinea l’indirizzo corrente.' },
      ],
      correct: 'a',
      explanation: '.align N → multiplo di 2^N, con eventuali byte di padding.',
      hint: 'Potenza di due.',
      learnRef: 'direttive-lc',
    },
    {
      kind: 'choice',
      id: 'p05-skip',
      prompt: 'I dati partono da 0x0. Che valore ha la label fine?',
      code: `.data
array: .byte 1, 2, 3
       .skip 5
fine:  .byte 9`,
      options: [
        { id: 'a', text: '0x8', feedback: 'Esatto: 3 byte + 5 saltati.' },
        { id: 'b', text: '0x3', feedback: '.skip sposta l’LC anche se non scrive dati.' },
        { id: 'c', text: '0x5', feedback: 'Bisogna contare anche i 3 byte di array.' },
        { id: 'd', text: '0x9', feedback: '9 è il valore memorizzato, non l’indirizzo.' },
      ],
      correct: 'a',
      explanation: 'array = 0x0, LC = 3 dopo i tre byte, .skip 5 porta l’LC a 8.',
      hint: 'Somma i byte prima di fine.',
      learnRef: 'direttive-lc',
    },
    {
      kind: 'choice',
      id: 'p05-sezioni',
      prompt: 'Che cosa succede all’LC quando l’assembler passa da .text a .data?',
      options: [
        { id: 'a', text: 'Salva l’LC di .text e ripristina (o inizializza) quello di .data', feedback: 'Esatto: ogni sezione ha il suo LC.' },
        { id: 'b', text: 'L’LC continua dal valore raggiunto in .text', feedback: 'Codice e dati hanno contatori separati.' },
        { id: 'c', text: 'L’LC si azzera ogni volta, perdendo i valori precedenti', feedback: 'Il valore della sezione lasciata viene salvato.' },
        { id: 'd', text: 'Il cambio di sezione è vietato dopo la prima istruzione', feedback: 'Si può cambiare sezione quante volte si vuole.' },
      ],
      correct: 'a',
      explanation: 'Per questo i valori nella symbol table di un file oggetto sono offset dalla sezione.',
      hint: 'Indipendente per ogni sezione.',
      learnRef: 'sezioni',
    },
    {
      kind: 'choice',
      id: 'p05-la',
      prompt: 'Quanti byte fa avanzare l’LC la pseudo-istruzione la a0, x?',
      options: [
        { id: 'a', text: '8: si espande in lui + addi', feedback: 'Esatto.' },
        { id: 'b', text: '4: è una sola istruzione', feedback: 'la deve costruire un indirizzo completo.' },
        { id: 'c', text: '0: è una pseudo-istruzione', feedback: 'Le pseudo-istruzioni diventano istruzioni reali, che occupano spazio.' },
        { id: 'd', text: '12: tre istruzioni', feedback: 'Bastano due istruzioni.' },
      ],
      correct: 'a',
      explanation: 'Negli esercizi la vale sempre due istruzioni, perché gp vale 0x10000000.',
      hint: 'lui + …',
      learnRef: 'pseudo',
    },
    {
      kind: 'match',
      id: 'p05-match-pseudo',
      prompt: 'Abbina ogni riga al numero di byte che occupa negli esercizi del corso.',
      pairs: [
        { id: 'li-small', left: 'li t1, 500', right: '4 byte (addi)', feedback: '500 sta in 12 bit.' },
        { id: 'li-big', left: 'li t1, 50000', right: '8 byte (lui + addi)', feedback: '50000 non sta in 12 bit.' },
        { id: 'call', left: 'call func', right: '4 byte (un solo salto)', feedback: 'L’offset è rappresentabile.' },
        { id: 'label', left: 'loop:', right: '0 byte', feedback: 'Una label non occupa spazio.' },
      ],
      explanation: 'Conta le istruzioni reali in cui si espande ogni riga.',
      hint: 'Un immediato su 12 bit con segno va da −2048 a 2047.',
      learnRef: 'pseudo',
    },
    {
      kind: 'choice',
      id: 'p05-asciz-label',
      prompt: 'I dati partono da 0x8. Che valore ha text2?',
      code: `text1: .ascii "ciao"
text2: .asciz "ciao"
t:     .word 0`,
      options: [
        { id: 'a', text: '0xC', feedback: 'Esatto: 0x8 + 4 byte di .ascii.' },
        { id: 'b', text: '0xD', feedback: '.ascii non ha il terminatore: occupa 4 byte.' },
        { id: 'c', text: '0x9', feedback: 'Ogni carattere occupa un byte.' },
        { id: 'd', text: '0x10', feedback: 'Non c’è .align: nessun padding.' },
      ],
      correct: 'a',
      explanation: 'Poi text2 occupa 5 byte, quindi t vale 0x11: senza .align la word non è allineata.',
      hint: '.ascii: niente \\0.',
      learnRef: 'direttive-lc',
    },
    {
      kind: 'order',
      id: 'p05-verifica',
      prompt: 'Riordina i passi per verificare da terminale la symbol table che hai ricavato.',
      items: [
        { id: 's', text: 'Scrivere il programma in un file main.s' },
        { id: 'as', text: 'Assemblare: riscv64-unknown-elf-as -mabi=ilp32 -march=rv32g -o main.o main.s' },
        { id: 'nm', text: 'Leggere i simboli: riscv64-unknown-elf-nm main.o' },
        { id: 'cmp', text: 'Confrontare l’output con la tabella ricavata a mano' },
      ],
      explanation: 'nm stampa valore, tipo (t = text, d = data) e nome di ogni simbolo.',
      hint: 'nm lavora sul file oggetto.',
      learnRef: 'direttive-lc',
    },
    {
      kind: 'choice',
      id: 'p05-perche-nm',
      prompt: 'Perché la lezione consiglia gli strumenti da terminale invece del RISC-V Simulator per controllare la symbol table?',
      options: [
        { id: 'a', text: 'Perché il simulatore sbaglia la symbol table delle variabili e non supporta .align', feedback: 'Esatto.' },
        { id: 'b', text: 'Perché il simulatore non ha la sezione .text', feedback: 'Il simulatore esegue normalmente il codice.' },
        { id: 'c', text: 'Perché nm esegue il programma', feedback: 'nm non esegue nulla: legge i simboli dal file oggetto.' },
        { id: 'd', text: 'Perché il simulatore usa l’ISA x86', feedback: 'È un simulatore RISC-V.' },
      ],
      correct: 'a',
      explanation: 'Il simulatore allinea sempre a 4 byte, indipendentemente da .align.',
      hint: 'Le slide dicono che il simulatore «sbaglia».',
      learnRef: 'direttive-lc',
    },
  ],

  /* ═════════════ QUIZ ═════════════ */
  quiz: {
    intro: 'Dieci domande nuove rispetto alla Practice: parti dalla definizione o dalla symbol table e risali alla direttiva o al concetto. Il quiz è superato con almeno il 60%.',
    questions: [
      {
        kind: 'choice',
        id: 'q05-def-lc',
        prompt: '«Pseudo-simbolo che indica l’indirizzo del prossimo byte che sarà scritto nel programma e che avanza automaticamente con ogni istruzione o dato.» Di che cosa si parla?',
        options: [
          { id: 'a', text: 'Location Counter', feedback: 'Esatto.' },
          { id: 'b', text: 'Program Counter', feedback: 'Il PC indica l’istruzione da eseguire, a tempo di esecuzione.' },
          { id: 'c', text: 'Stack pointer', feedback: 'sp punta alla cima dello stack.' },
          { id: 'd', text: 'Symbol table', feedback: 'La symbol table è la tabella che l’LC aiuta a riempire.' },
        ],
        correct: 'a',
        explanation: 'L’LC esiste solo durante l’assemblaggio.',
        hint: 'Tiene traccia della «posizione».',
        learnRef: 'ruolo-lc',
      },
      {
        kind: 'choice',
        id: 'q05-def-skip',
        prompt: '«Fa avanzare manualmente l’LC di un numero di byte, lasciando lo spazio non inizializzato.» Quale direttiva è?',
        options: [
          { id: 'a', text: '.skip', feedback: 'Esatto.' },
          { id: 'b', text: '.align', feedback: '.align avanza solo fino a un multiplo di una potenza di due.' },
          { id: 'c', text: '.equ', feedback: '.equ non sposta l’LC.' },
          { id: 'd', text: '.word', feedback: '.word scrive un valore inizializzato.' },
        ],
        correct: 'a',
        explanation: 'Utile per riservare buffer o spazio tra variabili.',
        hint: 'Saltare.',
        learnRef: 'direttive-lc',
      },
      {
        kind: 'choice',
        id: 'q05-quale-direttiva',
        prompt: 'In questa symbol table b vale 0x4. Quale riga mancante spiega il valore?',
        code: `a:  .byte 7          # a = 0x0
    ???
b:  .word 1          # b = 0x4`,
        options: [
          { id: 'a', text: '.align 2', feedback: 'Esatto: l’LC passa da 1 al multiplo di 4.' },
          { id: 'b', text: '.align 4', feedback: 'In GNU as porterebbe a un multiplo di 16.' },
          { id: 'c', text: '.equ PAD, 3', feedback: '.equ non sposta l’LC.' },
          { id: 'd', text: '.skip 4', feedback: 'Porterebbe l’LC a 5.' },
        ],
        correct: 'a',
        explanation: 'Anche .skip 3 darebbe 0x4, ma tra le opzioni l’unica corretta è .align 2.',
        hint: '1 → 4.',
        learnRef: 'direttive-lc',
      },
      {
        kind: 'choice',
        id: 'q05-quale-istruzione',
        prompt: 'Tra la label start (0x0) e la label next (0x8) c’è una sola riga. Quale può essere?',
        options: [
          { id: 'a', text: 'la a0, msg', feedback: 'Esatto: lui + addi, 8 byte.' },
          { id: 'b', text: 'li a0, 5', feedback: '5 sta in 12 bit: 4 byte.' },
          { id: 'c', text: 'call func', feedback: 'Negli esercizi call occupa 4 byte.' },
          { id: 'd', text: 'nop', feedback: 'nop è una sola addi.' },
        ],
        correct: 'a',
        explanation: '8 byte = due istruzioni reali.',
        hint: 'Due istruzioni.',
        learnRef: 'pseudo',
      },
      {
        kind: 'choice',
        id: 'q05-offset',
        prompt: 'nm su un file oggetto stampa «00000008 d buf». Che cosa rappresenta 0x8?',
        options: [
          { id: 'a', text: 'La distanza in byte di buf dall’inizio della sua sezione dati', feedback: 'Esatto: è un offset, che il linker rilocherà.' },
          { id: 'b', text: 'L’indirizzo fisico definitivo di buf in RAM', feedback: 'Gli indirizzi assoluti li calcola il linker.' },
          { id: 'c', text: 'Il valore memorizzato in buf', feedback: 'nm mostra il valore del simbolo, cioè la sua posizione.' },
          { id: 'd', text: 'La dimensione di buf', feedback: 'Non è una dimensione.' },
        ],
        correct: 'a',
        explanation: 'd = sezione .data; il linker unisce le sezioni omologhe e calcola gli indirizzi finali.',
        hint: 'File oggetto, non eseguibile.',
        learnRef: 'sezioni',
      },
      {
        kind: 'choice',
        id: 'q05-val-dim',
        prompt: 'La symbol table contiene «00000008 VAL», ma non c’è traccia di DIM, usato nel programma per .skip DIM. Perché?',
        options: [
          { id: 'a', text: 'VAL è stato definito con .set, DIM con .equ', feedback: 'Esatto: le costanti .equ non entrano nella symbol table.' },
          { id: 'b', text: 'DIM non è stato usato', feedback: 'È usato in .skip DIM.' },
          { id: 'c', text: 'VAL è una label, DIM una variabile', feedback: 'Entrambi sono simboli definiti da direttive.' },
          { id: 'd', text: 'Il simulatore ha sbagliato', feedback: 'È il comportamento atteso di GNU as secondo le slide.' },
        ],
        correct: 'a',
        explanation: 'È l’esempio delle slide con .equ DIM, 4 e .set VAL, 8.',
        hint: 'Due direttive diverse.',
        learnRef: 'lc-codice-dati',
      },
      {
        kind: 'choice',
        id: 'q05-li-range',
        prompt: 'Quale di queste righe occupa 8 byte?',
        options: [
          { id: 'a', text: 'li t0, 4096', feedback: 'Esatto: 4096 non sta in 12 bit con segno, quindi lui + addi.' },
          { id: 'b', text: 'li t0, 2047', feedback: '2047 è il massimo positivo su 12 bit: una sola addi.' },
          { id: 'c', text: 'li t0, -2048', feedback: '−2048 è il minimo su 12 bit: una sola addi.' },
          { id: 'd', text: 'li t0, 0', feedback: 'Una sola addi.' },
        ],
        correct: 'a',
        explanation: 'Un immediato su 12 bit con segno va da −2048 a 2047.',
        hint: 'Limite dei 12 bit.',
        learnRef: 'pseudo',
      },
      {
        kind: 'choice',
        id: 'q05-gcc',
        prompt: 'Per lo stesso programma GCC dà loop = 16 e il simulatore loop = 12. Prima di loop ci sono li, call e nop. Da che cosa dipende la differenza?',
        options: [
          { id: 'a', text: 'GCC traduce call con due istruzioni (auipc + jalr), il simulatore con una', feedback: 'Esatto: 4 byte in più.' },
          { id: 'b', text: 'Il simulatore ignora nop', feedback: 'nop occupa 4 byte anche nel simulatore.' },
          { id: 'c', text: 'GCC usa istruzioni da 8 byte', feedback: 'Le istruzioni sono sempre da 32 bit.' },
          { id: 'd', text: 'GCC parte da 0x4', feedback: 'Entrambi partono da _start = 0.' },
        ],
        correct: 'a',
        explanation: 'auipc + jalr costruisce l’indirizzo in modo valido ovunque sia caricato il codice.',
        hint: 'Quale riga può cambiare dimensione?',
        learnRef: 'pseudo',
      },
      {
        kind: 'choice',
        id: 'q05-quale-stringa',
        prompt: 'msg vale 0x0 e la label successiva vale 0x6, senza direttive in mezzo. Quale definizione di msg è compatibile?',
        options: [
          { id: 'a', text: 'msg: .asciz "hello"', feedback: 'Esatto: 5 caratteri + \\0.' },
          { id: 'b', text: 'msg: .ascii "hello"', feedback: 'Sarebbero 5 byte.' },
          { id: 'c', text: 'msg: .asciz "hello!"', feedback: 'Sarebbero 7 byte.' },
          { id: 'd', text: 'msg: .word 6', feedback: 'Una word occupa 4 byte.' },
        ],
        correct: 'a',
        explanation: '.asciz occupa un byte in più di .ascii.',
        hint: 'Conta anche il terminatore.',
        learnRef: 'direttive-lc',
      },
      {
        kind: 'choice',
        id: 'q05-nm-tipi',
        prompt: 'Nell’output di nm, che cosa indicano le lettere t e d accanto ai simboli?',
        code: `00000024 t diversi
00000000 d x`,
        options: [
          { id: 'a', text: 'La sezione del simbolo: t = .text (codice), d = .data (dati)', feedback: 'Esatto.' },
          { id: 'b', text: 'Il tipo di dato: t = testo, d = decimale', feedback: 'Non indicano il tipo del valore.' },
          { id: 'c', text: 't = temporaneo, d = definitivo', feedback: 'Non c’entrano i registri temporanei.' },
          { id: 'd', text: 'L’ordine in cui sono stati definiti', feedback: 'È la sezione di appartenenza.' },
        ],
        correct: 'a',
        explanation: 'I valori sono offset all’interno della sezione indicata.',
        hint: 'diversi è una label del codice.',
        learnRef: 'sezioni',
      },
    ],
  },

  /* ═════════════ CHALLENGE ═════════════ */
  challenge: {
    intro: 'Sei programmi nuovi di cui ricavare la symbol table. Nessun suggerimento e una sola risposta per domanda: l’esito e le spiegazioni compaiono alla fine. È facoltativa.',
    questions: [
      {
        kind: 'choice',
        id: 'c05-dati',
        prompt: 'I dati partono da 0x0 (GNU as). Che valore ha e?',
        code: `a: .half 1
b: .byte 2
   .align 2
c: .word 3
d: .asciz "hi"
e: .byte 1`,
        options: [
          { id: 'a', text: '0xB', feedback: 'Esatto: a 0, b 2, align → 4, c 4, d 8 (3 byte), e 11.' },
          { id: 'b', text: '0xA', feedback: 'Hai dimenticato il terminatore di .asciz.' },
          { id: 'c', text: '0x7', feedback: 'Hai dimenticato il padding di .align 2.' },
          { id: 'd', text: '0xC', feedback: 'Dopo d non c’è un .align.' },
        ],
        correct: 'a',
        explanation: '.half 2 byte, .byte 1 → LC 3; .align 2 → 4; .word → 8; .asciz "hi" 3 byte → 11 = 0xB.',
        learnRef: 'passo-passo',
      },
      {
        kind: 'choice',
        id: 'c05-codice',
        prompt: 'Le istruzioni partono da 0x0. Che valore ha loop?',
        code: `start:
    li   t0, 1
    la   a0, msg
    li   t1, 3000
loop:
    addi t0, t0, 1`,
        options: [
          { id: 'a', text: '0x14', feedback: 'Esatto: 4 + 8 + 8 = 20.' },
          { id: 'b', text: '0xC', feedback: 'Hai contato ogni riga come una sola istruzione.' },
          { id: 'c', text: '0x10', feedback: '3000 non sta in 12 bit: li vale due istruzioni.' },
          { id: 'd', text: '0x18', feedback: 'li t0, 1 è una sola addi.' },
        ],
        correct: 'a',
        explanation: 'li 1 → 4 byte; la → 8; li 3000 → 8 (fuori dal range −2048…2047).',
        learnRef: 'pseudo',
      },
      {
        kind: 'choice',
        id: 'c05-align3',
        prompt: 'I dati partono da 0x10000000 (GNU as). Che valore ha z?',
        code: `v: .word 1, 2, 3
w: .skip 6
   .align 3
z: .byte 0`,
        options: [
          { id: 'a', text: '0x10000018', feedback: 'Esatto: 12 + 6 = 18, poi multiplo di 8 → 24.' },
          { id: 'b', text: '0x10000012', feedback: 'Hai dimenticato .align 3.' },
          { id: 'c', text: '0x10000014', feedback: '.align 3 vuol dire multiplo di 8, non di 4.' },
          { id: 'd', text: '0x10000020', feedback: '24 è già multiplo di 8: non serve arrivare a 32.' },
        ],
        correct: 'a',
        explanation: '24 = 0x18, sommato alla partenza della sezione.',
        learnRef: 'direttive-lc',
      },
      {
        kind: 'choice',
        id: 'c05-ritorno-sezione',
        prompt: 'Dati da 0x10000000, istruzioni da 0x0. Che valore ha y?',
        code: `.data
x: .word 0
.text
    addi t0, t0, 1
    addi t1, t1, 1
.data
y: .byte 5`,
        options: [
          { id: 'a', text: '0x10000004', feedback: 'Esatto: l’LC di .data riprende da dove era rimasto.' },
          { id: 'b', text: '0x10000000', feedback: 'L’LC di .data non si azzera: viene ripristinato.' },
          { id: 'c', text: '0x10000008', feedback: 'Le istruzioni non fanno avanzare l’LC dei dati.' },
          { id: 'd', text: '0x8', feedback: 'y è nella sezione dati.' },
        ],
        correct: 'a',
        explanation: 'L’LC è indipendente per sezione: salvato al cambio e ripristinato al ritorno.',
        learnRef: 'sezioni',
      },
      {
        kind: 'choice',
        id: 'c05-cosa-sposta',
        prompt: 'Quale di queste righe fa avanzare l’LC?',
        options: [
          { id: 'a', text: 'nop', feedback: 'Esatto: è un’istruzione reale (addi x0, x0, 0), 4 byte.' },
          { id: 'b', text: '.globl main', feedback: 'Cambia solo la visibilità del simbolo.' },
          { id: 'c', text: '.equ N, 8', feedback: 'Una costante non occupa memoria.' },
          { id: 'd', text: 'loop:', feedback: 'Una label prende l’LC, non lo sposta.' },
        ],
        correct: 'a',
        explanation: 'Anche se «non fa nulla», nop occupa spazio come ogni altra istruzione.',
        learnRef: 'passo-passo',
      },
      {
        kind: 'choice',
        id: 'c05-simulatore',
        prompt: 'Uno studente usa .align 3 e prova il programma nel RISC-V Simulator della lezione. Che cosa deve aspettarsi?',
        options: [
          { id: 'a', text: 'Che il simulatore allinei comunque a 4 byte, perché non supporta .align', feedback: 'Esatto: per questo la verifica si fa con as e nm.' },
          { id: 'b', text: 'Un allineamento a 8 byte, come in GNU as', feedback: 'Il simulatore non supporta la direttiva.' },
          { id: 'c', text: 'Un allineamento a 3 byte', feedback: 'Nessun assembler allinea a 3.' },
          { id: 'd', text: 'Un errore di esecuzione', feedback: 'Le slide dicono che allinea sempre a 4.' },
        ],
        correct: 'a',
        explanation: 'GNU as: .align 3 = 8 byte. Simulatore: sempre 4.',
        learnRef: 'direttive-lc',
      },
    ],
  },
};
