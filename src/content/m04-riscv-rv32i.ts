import type { ModuleContent } from './types';

/*
 * MODULO 04 — RISC-V (RV32I)
 * Fonti: lezione 4 «RISC-V (RV32I)», 5 «Primi passi in RISC-V», 6 «Gestire il flusso d’esecuzione»,
 * 7 «Funzioni e procedure», 9 «RISC-V (RV32IM)».
 * Nota: del PDF della lezione 4 è leggibile il testo fino alle istruzioni di store (SB/SH/SW).
 * Il Quiz non ripete la Practice: stessi concetti chiesti al contrario o in casi nuovi.
 */

export const m04: ModuleContent = {
  moduleId: 'riscv-rv32i',

  /* ═════════════ LEARN ═════════════ */
  learn: [
    {
      id: 'panoramica',
      title: 'RISC-V: varianti, base ed estensioni',
      slides: 'lezione 4',
      blocks: [
        {
          type: 'p',
          text: 'RISC-V è una ISA aperta e modulare. Esistono varianti a 32, 64 e 128 bit (RV32, RV64, RV128), che indicano la larghezza dei registri e degli indirizzi. Ogni implementazione parte da un insieme base di istruzioni intere e può aggiungere estensioni opzionali.',
        },
        {
          type: 'list',
          items: [
            'RV32I: base intera a 32 bit, quella del corso (40 istruzioni);',
            'RV32E: variante ridotta per sistemi embedded, con meno registri;',
            'RV64I e RV128I: basi a 64 e 128 bit;',
            'estensioni indicate da una lettera: M (moltiplicazione e divisione), A (operazioni atomiche), F e D (virgola mobile singola e doppia precisione), Q (quadrupla), C (istruzioni compresse a 16 bit), V (vettoriali), B, J, T, P, L, N, H; G è l’abbreviazione di «IMAFD».',
          ],
        },
        {
          type: 'p',
          text: 'Come visto nel modulo ISA, RISC-V prevede i livelli di privilegio User (U), Supervisor (S), Hypervisor (H) e Machine (M), e adotta il modello load-store: la ALU lavora solo sui registri e la memoria si raggiunge solo con istruzioni di load e store. Lo stack è gestito via software tramite il registro sp (x2).',
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Leggere il nome',
          text: 'RV32IM significa: registri e indirizzi a 32 bit, base intera I, più l’estensione M. È l’argomento dell’ultima pagina di questo modulo.',
        },
      ],
      keyPoints: ['RV32 / RV64 / RV128 = larghezza dei registri', 'I = base intera, lettere = estensioni', 'Modello load-store'],
      checkId: 'p04-nome-isa',
    },
    {
      id: 'memory-layout',
      title: 'Il memory layout di un programma',
      slides: 'lezione 4',
      blocks: [
        {
          type: 'p',
          text: 'La memoria di un programma è divisa in regioni. Dal basso verso l’alto troviamo il codice, i dati statici, lo heap, lo spazio libero e lo stack. Seleziona una regione per vedere a che cosa serve.',
        },
        { type: 'diagram', diagram: 'memory-layout' },
        {
          type: 'list',
          items: [
            'Stack: allocazione automatica, LIFO, molto veloce, dimensione limitata; contiene variabili locali e indirizzi di ritorno.',
            'Heap: allocazione dinamica richiesta dal programma (malloc/free), più lenta, dimensione limitata solo dalla memoria disponibile; il suo limite è il program break.',
            'Dati statici: variabili globali, che vivono per tutta la durata del programma. «Statico» si riferisce alla durata, non al fatto di essere costanti.',
          ],
        },
        {
          type: 'callout',
          tone: 'warn',
          title: 'Memory leak',
          text: 'Se un blocco allocato nello heap non viene mai liberato, resta occupato fino alla fine del programma: è un memory leak. Lo stack invece si libera da sé quando la routine termina.',
        },
      ],
      keyPoints: ['Stack in alto, cresce verso il basso', 'Heap sopra i dati statici, cresce verso l’alto', 'Statico = dura per tutto il programma'],
      checkId: 'p04-regioni',
    },
    {
      id: 'memoria-byte',
      title: 'Indirizzamento al byte, allineamento, endianness',
      slides: 'lezione 4',
      blocks: [
        {
          type: 'p',
          text: 'In RV32I la memoria è indirizzata al byte: ogni indirizzo identifica un byte e, con indirizzi da 32 bit, lo spazio indirizzabile è di 2³² byte = 4 GB. Si possono leggere e scrivere byte (8 bit), half-word (16 bit) e word (32 bit).',
        },
        {
          type: 'p',
          text: 'Un dato è allineato quando il suo indirizzo è multiplo della sua dimensione: una half-word a indirizzo pari, una word a indirizzo multiplo di 4. Gli accessi allineati sono quelli naturali per l’hardware.',
        },
        {
          type: 'p',
          text: 'RISC-V è little-endian: il byte meno significativo sta all’indirizzo più basso. La word 0x12345678 all’indirizzo A occupa A = 78, A+1 = 56, A+2 = 34, A+3 = 12.',
        },
        { type: 'diagram', diagram: 'endianness' },
        {
          type: 'callout',
          tone: 'info',
          title: 'Modello di memoria piatto',
          text: 'Lo spazio è unico e lineare. Anche le periferiche hanno indirizzi in questo spazio (I/O mappato in memoria): si leggono e scrivono con le stesse load e store. Per l’ordine degli accessi tra più thread RISC-V definisce il modello RVWMO, con l’istruzione FENCE e le operazioni atomiche (AMO) dell’estensione A.',
        },
      ],
      keyPoints: ['2³² byte = 4 GB', 'Word allineata = indirizzo multiplo di 4', 'Little-endian: LSB all’indirizzo più basso', 'I/O mappato in memoria'],
      checkId: 'p04-little',
    },
    {
      id: 'registri',
      title: 'I 32 registri e i loro nomi ABI',
      slides: 'lezioni 4, 5, 7',
      blocks: [
        {
          type: 'p',
          text: 'RV32I ha 32 registri interi da 32 bit, x0–x31, più il Program Counter (PC). Ogni registro ha anche un nome ABI, che ne indica l’uso convenzionale. x0 vale sempre 0: le scritture su x0 vengono ignorate.',
        },
        {
          type: 'code',
          caption: 'Registri, alias ABI e chi deve salvarli',
          code: `x0        zero      costante 0          —
x1        ra        return address      caller
x2        sp        stack pointer       callee
x3        gp        global pointer      — (non si tocca)
x4        tp        thread pointer      — (non si tocca)
x5–x7     t0–t2     temporanei          caller
x8        s0 / fp   saved / frame ptr   callee
x9        s1        saved               callee
x10–x11   a0–a1     argomenti / ritorno caller
x12–x17   a2–a7     argomenti           caller
x18–x27   s2–s11    saved               callee
x28–x31   t3–t6     temporanei          caller`,
        },
        {
          type: 'p',
          text: 'Le lettere aiutano a ricordare: A = argument, T = temporary, S = saved. I registri «caller-saved» possono essere modificati liberamente da una routine chiamata; i «callee-saved» devono ritrovarsi intatti al ritorno.',
        },
      ],
      keyPoints: ['x0 = zero, sempre 0', 'a0–a7 argomenti, a0 (e a1) valore di ritorno', 't = temporanei (caller), s = saved (callee)', 'gp e tp non si modificano'],
      checkId: 'p04-alias',
    },
    {
      id: 'gruppi-istruzioni',
      title: 'Le 40 istruzioni di RV32I e le pseudo-istruzioni',
      slides: 'lezione 4',
      blocks: [
        { type: 'p', text: 'Le 40 istruzioni della base intera si raggruppano per funzione:' },
        {
          type: 'list',
          items: [
            'trasferimento (8): LB, LH, LW, LBU, LHU, SB, SH, SW;',
            'aritmetiche (3): ADD, ADDI, SUB;',
            'logiche (6): AND, ANDI, OR, ORI, XOR, XORI;',
            'shift (6): SLL, SLLI, SRL, SRLI, SRA, SRAI;',
            'controllo del flusso (8): BEQ, BNE, BLT, BGE, BLTU, BGEU, JAL, JALR;',
            'confronto (4): SLT, SLTI, SLTU, SLTIU;',
            'indirizzamento (2): LUI, AUIPC;',
            'sistema (3): ECALL, EBREAK, FENCE.',
          ],
        },
        {
          type: 'p',
          text: 'Le pseudo-istruzioni non esistono in hardware: l’assembler le traduce in una o più istruzioni reali. Rendono il codice più leggibile.',
        },
        {
          type: 'code',
          caption: 'Alcune pseudo-istruzioni e la loro traduzione',
          code: `nop            → addi x0, x0, 0
mv   rd, rs    → addi rd, rs, 0
li   rd, imm   → addi (e lui se l’immediato è grande)
la   rd, sym   → auipc + addi
not  rd, rs    → xori rd, rs, -1
neg  rd, rs    → sub  rd, x0, rs
j    label     → jal  x0, label
jr   rs        → jalr x0, 0(rs)
ret            → jalr x0, 0(ra)
beqz rs, label → beq  rs, x0, label
bgt  a, b, L   → blt  b, a, L
ble  a, b, L   → bge  b, a, L`,
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Notazione delle slide',
          text: 'La semantica delle istruzioni è scritta in stile Verilog: R[rd] è il registro, M[ind] la memoria, (7:0) seleziona i bit da 7 a 0, {a, b} concatena, 24\'b… ripete un bit 24 volte, cond ? x : y è l’operatore ternario.',
        },
      ],
      keyPoints: ['40 istruzioni in 8 gruppi', 'Pseudo-istruzione = scorciatoia tradotta dall’assembler', 'ret = jalr x0, 0(ra)'],
      checkId: 'p04-pseudo',
    },
    {
      id: 'load-store',
      title: 'Load e store: byte, half-word, word',
      slides: 'lezione 4',
      blocks: [
        {
          type: 'p',
          text: 'L’indirizzo di load e store si calcola come registro base + immediato: lw rd, imm(rs1) legge la word all’indirizzo R[rs1] + imm. Le load di 8 e 16 bit devono riempire un registro da 32 bit, e qui nasce la differenza tra versione con segno e senza segno.',
        },
        {
          type: 'code',
          caption: 'Semantica (notazione delle slide)',
          code: `LB   R[rd] = {24'bM[R[rs1]+imm](7),  M[R[rs1]+imm](7:0)}   estensione del segno
LBU  R[rd] = {24'b0,                  M[R[rs1]+imm](7:0)}   estensione con zeri
LH   R[rd] = {16'bM[R[rs1]+imm](15), M[R[rs1]+imm](15:0)}
LHU  R[rd] = {16'b0,                  M[R[rs1]+imm](15:0)}
LW   R[rd] = M[R[rs1]+imm](31:0)
SB   M[R[rs1]+imm](7:0)  = R[rs2](7:0)
SH   M[R[rs1]+imm](15:0) = R[rs2](15:0)
SW   M[R[rs1]+imm](31:0) = R[rs2](31:0)`,
        },
        {
          type: 'p',
          text: 'Esempio: in memoria c’è il byte 0xF0. Con LB il registro diventa 0xFFFFFFF0 (−16), perché il bit 7 vale 1 e viene copiato nei 24 bit alti. Con LBU diventa 0x000000F0 (240).',
        },
        {
          type: 'callout',
          tone: 'warn',
          title: 'Perché non esiste LWU in RV32I',
          text: 'Una word riempie già tutto il registro da 32 bit: non c’è nulla da estendere, quindi la distinzione con/senza segno non ha senso. Le store, invece, non hanno mai la versione U: scrivono solo i bit bassi del registro.',
        },
      ],
      keyPoints: ['Indirizzo = R[rs1] + imm', 'LB/LH estendono il segno, LBU/LHU con zeri', 'Niente LWU in RV32I'],
      checkId: 'p04-lb-lbu',
    },
    {
      id: 'sorgente',
      title: 'Com’è fatto un sorgente assembly',
      slides: 'lezione 5',
      blocks: [
        {
          type: 'p',
          text: 'Il corso usa l’assemblatore GNU e, per provare il codice, un simulatore interattivo di RISC-V nel browser. Ogni riga di un sorgente segue la grammatica: LINE → [label] [istruzione] | [label] [direttiva], con un commento facoltativo introdotto da #.',
        },
        {
          type: 'list',
          items: [
            'label: un nome seguito da «:» che indica un indirizzo (di un’istruzione o di un dato);',
            'istruzione: un’operazione del processore, o una pseudo-istruzione;',
            'direttiva: un comando per l’assemblatore, inizia con un punto (.text, .word…); non diventa un’istruzione macchina.',
          ],
        },
        {
          type: 'p',
          text: 'Gli immediati si possono scrivere in esadecimale (0x1F), binario (0b1010), ottale (con uno 0 iniziale: 017), decimale (15) o come carattere tra apici (\'a\' = 97, il codice ASCII).',
        },
        {
          type: 'p',
          text: 'Un simbolo è un nome associato a un valore. Le label sono simboli il cui valore è un indirizzo; l’assemblatore li raccoglie nella tabella dei simboli. Con .set si definisce un simbolo con un valore scelto, ridefinibile durante l’assemblaggio. Le label numeriche (1:, 2:…) si possono ripetere: 1b indica la label «1» più vicina all’indietro, 1f quella più vicina in avanti.',
        },
        {
          type: 'code',
          caption: 'Esempio della lezione: tabella dei simboli',
          code: `.set moltiplicando, 3
.set moltiplicatore, 0
...
loop:   ...         # indirizzo 0x14
end:    ...         # indirizzo 0x24

simbolo          valore
moltiplicando    3
moltiplicatore   0
loop             0x14
end              0x24`,
        },
      ],
      keyPoints: ['Riga = [label] [istruzione | direttiva] [# commento]', '\'a\' = 97', 'Label = simbolo con valore indirizzo', '1b all’indietro, 1f in avanti'],
      checkId: 'p04-riga',
    },
    {
      id: 'direttive',
      title: 'Sezioni e direttive',
      slides: 'lezione 5',
      blocks: [
        {
          type: 'p',
          text: 'Le direttive organizzano il programma in sezioni e definiscono i dati. L’assembler mette ciò che segue .text nella sezione del codice e ciò che segue .data nei dati inizializzati.',
        },
        {
          type: 'code',
          caption: 'Le direttive del corso',
          code: `.text            sezione del codice
.data            sezione dei dati inizializzati
.bss             dati non inizializzati (a zero)
  x: .space 4    riserva 4 byte
.byte 7          1 byte
.half 300        2 byte
.word 10, 20     4 byte ciascuno
.ascii "ciao"    stringa SENZA terminatore
.asciz "ciao"    stringa con terminatore \\0 (5 byte)
.globl main      rende il simbolo visibile al linker
.equ MAX, 100    associa a un simbolo un valore costante
.set k, 3        simbolo ridefinibile durante l’assemblaggio`,
        },
        {
          type: 'callout',
          tone: 'info',
          title: '.ascii o .asciz?',
          text: 'Le funzioni che stampano una stringa leggono fino al byte 0. Con .ascii il terminatore manca e la stampa continuerebbe nei byte successivi: per le stringhe da stampare si usa .asciz.',
        },
      ],
      keyPoints: ['.text codice, .data dati', '.asciz aggiunge \\0', '.globl per il linker', '.equ costante, .set ridefinibile'],
      checkId: 'p04-asciz',
    },
    {
      id: 'ecall',
      title: 'Le chiamate di sistema: ecall',
      slides: 'lezione 5',
      blocks: [
        {
          type: 'p',
          text: 'Per l’input/output e per terminare il programma si chiede un servizio all’ambiente con ecall. Il numero del servizio va in a7, gli argomenti in a0 (e a1), l’eventuale risultato torna in a0.',
        },
        {
          type: 'code',
          caption: 'Servizi usati nel corso',
          code: `a7 = 1    stampa l’intero in a0
a7 = 4    stampa la stringa all’indirizzo in a0
a7 = 5    legge un intero → a0
a7 = 8    legge una stringa: a0 = buffer, a1 = lunghezza massima
a7 = 10   termina il programma (exit)
a7 = 11   stampa il carattere in a0
a7 = 12   legge un carattere → a0`,
        },
        {
          type: 'code',
          caption: 'Stampare un messaggio e uscire',
          code: `.data
msg: .asciz "Ciao!"
.text
    la a0, msg      # indirizzo della stringa
    li a7, 4        # servizio: print string
    ecall
    li a7, 10       # servizio: exit
    ecall`,
        },
      ],
      keyPoints: ['Codice del servizio in a7', 'Argomenti in a0/a1, risultato in a0', '10 = exit'],
      checkId: 'p04-ecall',
    },
    {
      id: 'condizioni',
      title: 'if-then, if-then-else, nested if, switch',
      slides: 'lezione 6',
      blocks: [
        {
          type: 'p',
          text: 'In assembly non esistono if, else, for o while: si ottengono con le label e i salti condizionati (beq, bne, blt, bge…) o incondizionati (j). Se un branch non salta, l’esecuzione prosegue con l’istruzione successiva: tutte le istruzioni dopo la beq vengono eseguite, a meno di un salto esplicito.',
        },
        {
          type: 'code',
          caption: 'L’errore delle slide: z vale 3 invece di 2',
          code: `# if (x == y) z = 1;   z = 2;   ← in C, z alla fine vale 2
    beq x10, x11, THEN
    li  x12, 2
                    # manca «j END»: si cade dentro THEN
THEN: li x12, 1
END:`,
        },
        {
          type: 'p',
          text: 'Per l’if-then-else la lezione chiede di scrivere subito dopo il branch il blocco ELSE (eseguito se la condizione è falsa) e poi il blocco THEN. Mettere THEN per primo somiglia di più al C, ma aggiunge un salto: «non voglio che lo facciate».',
        },
        {
          type: 'code',
          caption: 'if (x == y) z = 1; else z = 2;  z = z + z;',
          code: `    beq x10, x11, THEN   # condizione vera → THEN
ELSE:                    # etichetta facoltativa, solo per leggibilità
    li  x12, 2
    j   END
THEN:
    li  x12, 1
END:
    add x12, x12, x12`,
        },
        {
          type: 'p',
          text: 'Negli if annidati ogni if ha il suo branch e le sue label. Non esiste un branch «strettamente maggiore di zero»: per if (x > 0) si salta all’else con blez (x ≤ 0), cioè con la condizione negata. Lo switch diventa una catena di beq, una per case, con un salto finale al default; ogni case termina con j END, che fa la parte del break.',
        },
      ],
      keyPoints: ['Senza salto si prosegue in sequenza', 'if-then-else: ELSE subito dopo il branch, poi THEN', 'Condizione negata (blez per x > 0)', 'switch = catena di beq + default'],
      checkId: 'p04-z3',
    },
    {
      id: 'cicli',
      title: 'while, do-while, for',
      slides: 'lezione 6',
      blocks: [
        {
          type: 'p',
          text: 'Un ciclo è una label all’inizio e un salto che torna indietro. Nel while la condizione si controlla prima del corpo. La forma più diretta salta al corpo a ogni iterazione; conviene invertire la condizione, così si salta in avanti una sola volta, all’uscita.',
        },
        {
          type: 'code',
          caption: 'while (x < 5) x = x + 1;   con la condizione invertita',
          code: `    li  t0, 0
    li  t1, 5
LOOP:
    bge t0, t1, EXIT     # se x >= 5 esci
    addi t0, t0, 1
    j   LOOP
EXIT:`,
        },
        {
          type: 'p',
          text: 'Il do-while esegue il corpo almeno una volta e controlla la condizione alla fine: usa solo salti all’indietro. È la forma più efficiente in assembly e la lezione chiede di adottarla: i salti all’indietro e in avanti si comportano diversamente nella branch prediction.',
        },
        {
          type: 'code',
          caption: 'do { x = x + 1; } while (x < 5);',
          code: `    li  t0, 0
    li  t1, 5
LOOP:
    addi t0, t0, 1
    blt  t0, t1, LOOP    # solo un salto all’indietro`,
        },
        {
          type: 'p',
          text: 'Il for non fa nulla che il while non possa fare: inizializzazione, condizione, aggiornamento. Le istruzioni che non dipendono dal ciclo (per esempio l’inizializzazione li t0, 0, o caricare una costante) vanno fuori dal corpo, altrimenti vengono rieseguite a ogni iterazione.',
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Gli esercizi della lezione',
          text: 'Somma 1 + … + N con N = 10 (risultato 55); prodotto N × M con somme ripetute (3 × 5 = 15); massimo di un array, con l’offset calcolato come slli t4, t3, 2 (i × 4); fattoriale con due cicli annidati di somme (5! = 120).',
        },
      ],
      keyPoints: ['Condizione invertita → un solo salto in avanti', 'do-while: solo salti all’indietro, preferito', 'Fuori dal ciclo ciò che non cambia'],
      checkId: 'p04-dowhile',
    },
    {
      id: 'routine',
      title: 'Routine, funzioni, procedure e jal',
      slides: 'lezione 7',
      blocks: [
        {
          type: 'list',
          items: [
            'Routine: termine generico per un blocco di codice che esegue un compito.',
            'Funzione: routine che accetta parametri e restituisce un valore.',
            'Procedura: routine che accetta parametri e non restituisce un valore.',
            'Call site: la riga in cui la routine viene chiamata.',
            'Caller: la routine che chiama. Callee: la routine chiamata.',
          ],
        },
        {
          type: 'p',
          text: 'In assembly una routine è una label (il punto d’ingresso) più il codice che la implementa. Chiamarla significa saltare alla label; per tornare indietro serve l’indirizzo di ritorno. jal label salta e salva in ra l’indirizzo PC + 4, cioè l’istruzione successiva alla chiamata (tutte le istruzioni sono da 32 bit). Il ritorno è ret, cioè jalr x0, 0(ra).',
        },
        {
          type: 'p',
          text: 'Dove si mettono i parametri? Dove si trova il valore restituito? Come si preserva l’indirizzo di ritorno in una chiamata annidata? Le risposte le dà l’ABI (Application Binary Interface): l’insieme di convenzioni su passaggio dei parametri, valori di ritorno, uso dei registri, salvataggio in memoria e memory layout.',
        },
      ],
      keyPoints: ['Funzione restituisce un valore, procedura no', 'jal: ra = PC + 4', 'ret = jalr x0, 0(ra)', 'Le regole sono nell’ABI'],
      checkId: 'p04-jal',
    },
    {
      id: 'parametri',
      title: 'Parametri e valori di ritorno (ABI ilp32)',
      slides: 'lezione 7',
      blocks: [
        {
          type: 'p',
          text: 'I primi otto parametri vanno in ordine in a0, a1, …, a7. Se sono di più, il chiamante riserva spazio nello stack (4 byte per parametro in RV32I), vi deposita i parametri in eccesso in ordine inverso (l’ultimo per primo) e solo poi esegue jal. Dopo il ritorno è sempre il chiamante a ripulire lo stack.',
        },
        {
          type: 'code',
          caption: 'Chiamare sum10 con 10 parametri',
          code: `    li   a0, 10          # 1° … a7 = 8° parametro
    ...
    li   a7, 80
    addi sp, sp, -8      # spazio per 9° e 10°
    li   t1, 100
    sw   t1, 4(sp)       # 10° parametro
    li   t1, 90
    sw   t1, 0(sp)       # 9° parametro
    jal  sum10
    addi sp, sp, 8       # il chiamante libera lo stack`,
        },
        {
          type: 'p',
          text: 'Il valore di ritorno va in a0. Se è lungo 64 bit, a0 contiene i 32 bit meno significativi e a1 i 32 più significativi.',
        },
        {
          type: 'p',
          text: 'Passaggio per valore: il registro contiene il dato (inc: addi a0, a0, 1; il chiamante legge il risultato in a0). Passaggio per riferimento: il registro contiene l’indirizzo della variabile; la routine legge, modifica e riscrive in memoria (lw a1, (a0) / addi a1, a1, 1 / sw a1, (a0)) e il chiamante non deve recuperare nulla da a0.',
        },
      ],
      keyPoints: ['a0–a7 per i primi 8 parametri', 'Oltre l’8°: stack, ordine inverso, pulisce il chiamante', 'Ritorno in a0 (64 bit: a1 = parte alta)', 'Per riferimento = si passa l’indirizzo'],
      checkId: 'p04-nono',
    },
    {
      id: 'stack-salvataggi',
      title: 'Variabili locali, stack e registri da salvare',
      slides: 'lezione 7',
      blocks: [
        {
          type: 'p',
          text: 'Le variabili globali stanno nei dati statici (.data) e sono visibili da tutte le routine. Le locali, idealmente, stanno nei registri, molto più veloci. Finiscono nello stack quando i registri non bastano, quando sono array o struct, o quando serve il loro indirizzo (passaggio per riferimento).',
        },
        {
          type: 'code',
          caption: 'int arr[4] locale: 16 byte nello stack',
          code: `foo:
    addi sp, sp, -16     # allocazione all’ingresso
    li   t0, 1
    sw   t0, 0(sp)       # arr[0]
    ...
    lw   t1, 8(sp)       # arr[2]
    addi sp, sp, 16      # deallocazione prima del ritorno
    ret`,
        },
        {
          type: 'p',
          text: 'L’ABI stabilisce chi salva cosa. Caller-saved: ra, t0–t6, a0–a7: se il chiamante ne ha bisogno dopo la chiamata, li salva lui. Callee-saved: sp e s0–s11: se la routine chiamata li usa, deve salvarli all’ingresso e ripristinarli prima di ret. gp e tp non si modificano. Lo stack è lento: si salva solo ciò che serve davvero.',
        },
        {
          type: 'callout',
          tone: 'warn',
          title: 'Chiamate annidate e ricorsive',
          text: 'Ogni jal sovrascrive ra. Se sum2 chiama sum1 senza aver salvato ra, al ritorno non sa più tornare a main. Per questo una routine che ne chiama un’altra (o se stessa, come multiply ricorsiva) salva ra nello stack all’ingresso e lo ripristina prima di ret.',
        },
        {
          type: 'code',
          caption: 'sum2 salva ra prima di chiamare sum1',
          code: `sum2:
    addi sp, sp, -4
    sw   ra, 0(sp)       # salva l’indirizzo di ritorno verso main
    jal  sum1            # ra viene sovrascritto
    lw   ra, 0(sp)       # ripristina
    addi sp, sp, 4
    add  a0, a0, a2
    ret`,
        },
      ],
      keyPoints: ['Globali in .data, locali nei registri o nello stack', 'Caller-saved: ra, t, a', 'Callee-saved: sp, s0–s11', 'Chiamate annidate: salvare ra'],
      checkId: 'p04-annidata',
    },
    {
      id: 'rv32im',
      title: 'L’estensione M: moltiplicazione e divisione',
      slides: 'lezione 9',
      blocks: [
        {
          type: 'p',
          text: 'RV32I non ha istruzioni per moltiplicare e dividere: negli esercizi si usano cicli di somme. L’estensione M aggiunge otto istruzioni di tipo R, tutte con opcode 0110011 e funct7 0000001; funct3 vale da 000 a 111 nell’ordine della tabella.',
        },
        {
          type: 'code',
          caption: 'Le istruzioni di RV32M',
          code: `mul     rd = 32 bit bassi di rs1 × rs2
mulh    rd = 32 bit alti, con segno × con segno
mulhsu  rd = 32 bit alti, con segno × senza segno
mulhu   rd = 32 bit alti, senza segno × senza segno
div     quoziente con segno (arrotonda verso zero)
divu    quoziente senza segno
rem     resto con segno
remu    resto senza segno`,
        },
        {
          type: 'p',
          text: 'Il prodotto di due numeri da 32 bit può richiedere 64 bit. mul conserva solo i 32 bit bassi: in caso di overflow i bit alti si perdono. Per averli si usa la mulh adatta ai segni degli operandi.',
        },
        {
          type: 'callout',
          tone: 'warn',
          title: 'Divisione per zero',
          text: 'Non genera eccezioni. div per zero restituisce −1 (0xFFFFFFFF, tutti i bit a 1) e rem per zero restituisce il dividendo. Se serve, il controllo va fatto dal programma con un branch prima della divisione.',
        },
        {
          type: 'p',
          text: 'La divisione arrotonda verso zero: −7 / 2 = −3 e il resto ha il segno del dividendo, −7 rem 2 = −1 (perché −3 × 2 + (−1) = −7).',
        },
      ],
      keyPoints: ['M = mul, mulh, mulhsu, mulhu, div, divu, rem, remu', 'mul tiene i 32 bit bassi', 'div / 0 = −1, rem / 0 = dividendo, nessuna eccezione', 'Arrotondamento verso zero'],
      checkId: 'p04-mulh',
    },
  ],

  /* ═════════════ PRACTICE ═════════════ */
  practice: [
    {
      kind: 'choice',
      id: 'p04-nome-isa',
      prompt: 'Che cosa indica il nome RV32I?',
      options: [
        { id: 'a', text: 'Registri e indirizzi a 32 bit, insieme base di istruzioni intere', feedback: 'Esatto: 32 è la larghezza, I la base intera.' },
        { id: 'b', text: '32 istruzioni intere', feedback: 'Le istruzioni della base sono 40; 32 è la larghezza in bit.' },
        { id: 'c', text: '32 registri in virgola mobile', feedback: 'La virgola mobile è nelle estensioni F e D.' },
        { id: 'd', text: 'La versione 3.2 dell’ISA', feedback: 'Non è un numero di versione.' },
      ],
      correct: 'a',
      explanation: 'RV32 / RV64 / RV128 indicano la larghezza; la lettera I la base intera. Le estensioni aggiungono altre lettere (M, A, F, D, C…).',
      hint: 'Il numero è una larghezza in bit.',
      learnRef: 'panoramica',
    },
    {
      kind: 'match',
      id: 'p04-estensioni',
      prompt: 'Abbina ogni lettera all’estensione di RISC-V che indica.',
      pairs: [
        { id: 'm', left: 'M', right: 'Moltiplicazione e divisione intera', feedback: 'mul, div, rem e varianti.' },
        { id: 'a', left: 'A', right: 'Operazioni atomiche', feedback: 'Servono per la sincronizzazione tra thread.' },
        { id: 'f', left: 'F', right: 'Virgola mobile a precisione singola', feedback: 'D è la doppia precisione.' },
        { id: 'c', left: 'C', right: 'Istruzioni compresse a 16 bit', feedback: 'Riducono la dimensione del codice.' },
        { id: 'e', left: 'E (RV32E)', right: 'Base ridotta per sistemi embedded, con meno registri', feedback: 'È una base, non un’estensione.' },
      ],
      explanation: 'G è la sigla di IMAFD, la combinazione «general purpose».',
      hint: 'M come Multiply, C come Compressed.',
      learnRef: 'panoramica',
    },
    {
      kind: 'order',
      id: 'p04-regioni',
      prompt: 'Riordina le regioni della memoria di un programma, dall’indirizzo più basso al più alto.',
      items: [
        { id: 'code', text: 'Codice (.text)' },
        { id: 'static', text: 'Dati statici (.data)' },
        { id: 'heap', text: 'Heap' },
        { id: 'free', text: 'Spazio libero' },
        { id: 'stack', text: 'Stack' },
      ],
      explanation: 'Heap e stack crescono uno verso l’altro, nello spazio libero tra loro.',
      hint: 'Lo stack sta in cima e cresce verso il basso.',
      learnRef: 'memory-layout',
    },
    {
      kind: 'choice',
      id: 'p04-little',
      prompt: 'La word 0x12345678 viene salvata all’indirizzo 0x100. Quale byte si trova all’indirizzo 0x100?',
      options: [
        { id: 'a', text: '0x78', feedback: 'Esatto: little-endian, il byte meno significativo all’indirizzo più basso.' },
        { id: 'b', text: '0x12', feedback: 'Sarebbe così in big-endian.' },
        { id: 'c', text: '0x34', feedback: '0x34 si trova all’indirizzo 0x102.' },
        { id: 'd', text: '0x1234', feedback: 'Ogni indirizzo contiene un solo byte.' },
      ],
      correct: 'a',
      explanation: '0x100 = 78, 0x101 = 56, 0x102 = 34, 0x103 = 12.',
      hint: 'RISC-V è little-endian.',
      learnRef: 'memoria-byte',
    },
    {
      kind: 'match',
      id: 'p04-alias',
      prompt: 'Abbina ogni registro al suo nome ABI.',
      pairs: [
        { id: 'x0', left: 'x0', right: 'zero', feedback: 'Vale sempre 0.' },
        { id: 'x1', left: 'x1', right: 'ra', feedback: 'Return address, scritto da jal.' },
        { id: 'x2', left: 'x2', right: 'sp', feedback: 'Stack pointer.' },
        { id: 'x10', left: 'x10', right: 'a0', feedback: 'Primo argomento e valore di ritorno.' },
        { id: 'x8', left: 'x8', right: 's0 / fp', feedback: 'Primo registro saved, anche frame pointer.' },
      ],
      explanation: 'a0–a7 = x10–x17, t0–t2 = x5–x7, s2–s11 = x18–x27, t3–t6 = x28–x31.',
      hint: 'ra viene subito dopo zero.',
      learnRef: 'registri',
    },
    {
      kind: 'choice',
      id: 'p04-pseudo',
      prompt: 'Che cos’è una pseudo-istruzione come mv o li?',
      options: [
        { id: 'a', text: 'Una scorciatoia che l’assembler traduce in una o più istruzioni reali', feedback: 'Esatto: mv rd, rs diventa addi rd, rs, 0.' },
        { id: 'b', text: 'Un’istruzione eseguita più lentamente dal processore', feedback: 'Il processore non la vede mai: riceve le istruzioni reali.' },
        { id: 'c', text: 'Una direttiva per l’assembler', feedback: 'Le direttive iniziano con il punto e non producono istruzioni.' },
        { id: 'd', text: 'Un’istruzione delle estensioni opzionali', feedback: 'Le pseudo-istruzioni non appartengono a nessuna estensione.' },
      ],
      correct: 'a',
      explanation: 'Esempi: nop = addi x0, x0, 0; j L = jal x0, L; ret = jalr x0, 0(ra).',
      hint: 'Chi la traduce?',
      learnRef: 'gruppi-istruzioni',
    },
    {
      kind: 'match',
      id: 'p04-gruppi',
      prompt: 'Abbina ogni istruzione al suo gruppo.',
      pairs: [
        { id: 'lhu', left: 'LHU', right: 'Trasferimento (load/store)', feedback: 'Legge una half-word senza segno.' },
        { id: 'srai', left: 'SRAI', right: 'Shift', feedback: 'Shift aritmetico a destra con immediato.' },
        { id: 'bltu', left: 'BLTU', right: 'Controllo del flusso', feedback: 'Branch se minore, senza segno.' },
        { id: 'sltiu', left: 'SLTIU', right: 'Confronto', feedback: 'Scrive 1 se minore, altrimenti 0.' },
        { id: 'auipc', left: 'AUIPC', right: 'Indirizzamento', feedback: 'Somma un immediato alto al PC.' },
      ],
      explanation: 'Gli otto gruppi: trasferimento, aritmetiche, logiche, shift, flusso, confronto, indirizzamento, sistema.',
      hint: 'SLT = Set Less Than.',
      learnRef: 'gruppi-istruzioni',
    },
    {
      kind: 'choice',
      id: 'p04-lb-lbu',
      prompt: 'In memoria c’è il byte 0xF0. Che valore ha il registro dopo LB e dopo LBU?',
      options: [
        { id: 'a', text: 'LB → 0xFFFFFFF0, LBU → 0x000000F0', feedback: 'Esatto: LB estende il bit 7 (che vale 1), LBU aggiunge zeri.' },
        { id: 'b', text: 'Entrambe → 0x000000F0', feedback: 'LB estende il segno.' },
        { id: 'c', text: 'LB → 0x000000F0, LBU → 0xFFFFFFF0', feedback: 'È il contrario: U = unsigned, zeri.' },
        { id: 'd', text: 'Entrambe → 0xF0000000', feedback: 'Il byte va nei bit bassi del registro.' },
      ],
      correct: 'a',
      explanation: 'R[rd] = {24\'bM(7), M(7:0)} per LB; {24\'b0, M(7:0)} per LBU.',
      hint: 'Guarda il bit 7 di 0xF0.',
      learnRef: 'load-store',
    },
    {
      kind: 'choice',
      id: 'p04-riga',
      prompt: 'Quale riga è una direttiva?',
      code: `1)  loop:  addi t0, t0, 1
2)  .word 10, 20, 30
3)  # contatore
4)  beq t0, t1, end`,
      options: [
        { id: 'a', text: 'La 2', feedback: 'Esatto: inizia con il punto ed è un comando per l’assembler.' },
        { id: 'b', text: 'La 1', feedback: 'È una label seguita da un’istruzione.' },
        { id: 'c', text: 'La 3', feedback: 'È un commento.' },
        { id: 'd', text: 'La 4', feedback: 'È un’istruzione di salto condizionato.' },
      ],
      correct: 'a',
      explanation: 'LINE → [label] [istruzione] | [label] [direttiva]; il commento inizia con #.',
      hint: 'Le direttive iniziano con un punto.',
      learnRef: 'sorgente',
    },
    {
      kind: 'choice',
      id: 'p04-asciz',
      prompt: 'Quanti byte occupa .asciz "ciao"?',
      options: [
        { id: 'a', text: '5', feedback: 'Esatto: 4 caratteri più il terminatore \\0.' },
        { id: 'b', text: '4', feedback: 'Questi sono i byte di .ascii "ciao", senza terminatore.' },
        { id: 'c', text: '8', feedback: 'Ogni carattere ASCII occupa un byte.' },
        { id: 'd', text: '16', feedback: 'Non si allinea alla word.' },
      ],
      correct: 'a',
      explanation: 'La «z» di asciz sta per zero: il byte 0 finale segnala la fine della stringa.',
      hint: 'La z sta per zero.',
      learnRef: 'direttive',
    },
    {
      kind: 'match',
      id: 'p04-ecall',
      prompt: 'Abbina ogni valore di a7 al servizio richiesto con ecall.',
      pairs: [
        { id: '1', left: 'a7 = 1', right: 'Stampa l’intero contenuto in a0', feedback: 'print int.' },
        { id: '4', left: 'a7 = 4', right: 'Stampa la stringa che inizia all’indirizzo in a0', feedback: 'print string.' },
        { id: '5', left: 'a7 = 5', right: 'Legge un intero e lo mette in a0', feedback: 'read int.' },
        { id: '10', left: 'a7 = 10', right: 'Termina il programma', feedback: 'exit.' },
        { id: '11', left: 'a7 = 11', right: 'Stampa il carattere contenuto in a0', feedback: 'print char.' },
      ],
      explanation: 'Inoltre: 8 legge una stringa (a0 buffer, a1 lunghezza), 12 legge un carattere.',
      hint: '10 chiude tutto.',
      learnRef: 'ecall',
    },
    {
      kind: 'choice',
      id: 'p04-z3',
      prompt: 'In questo codice x10 ≠ x11. Quanto vale x12 alla fine?',
      code: `    beq x10, x11, THEN
    li  x12, 2
THEN:
    li  x12, 1
END:`,
      options: [
        { id: 'a', text: '1', feedback: 'Esatto: dopo li x12, 2 non c’è un salto, quindi si esegue anche li x12, 1.' },
        { id: 'b', text: '2', feedback: 'Sarebbe 2 solo con un j END dopo li x12, 2.' },
        { id: 'c', text: '3', feedback: 'Non c’è una somma: la seconda li sovrascrive.' },
        { id: 'd', text: '0', feedback: 'Il registro viene scritto due volte.' },
      ],
      correct: 'a',
      explanation: 'Le label non fermano l’esecuzione: senza salto si prosegue in sequenza. Serve j END dopo il blocco.',
      hint: 'Una label non è un’istruzione.',
      learnRef: 'condizioni',
    },
    {
      kind: 'order',
      id: 'p04-ordina-ifelse',
      prompt: 'Riordina le righe per tradurre: if (x == y) z = 1; else z = 2; nella forma richiesta dalla lezione.',
      items: [
        { id: 'b', text: 'beq x10, x11, THEN' },
        { id: 'e', text: 'li x12, 2' },
        { id: 'j', text: 'j END' },
        { id: 't', text: 'THEN: li x12, 1' },
        { id: 'end', text: 'END:' },
      ],
      explanation: 'Subito dopo il branch c’è il blocco ELSE (condizione falsa), che salta oltre THEN.',
      hint: 'Se il branch non salta, cosa deve succedere?',
      learnRef: 'condizioni',
    },
    {
      kind: 'choice',
      id: 'p04-dowhile',
      prompt: 'Perché in RISC-V la lezione preferisce la forma do-while per i cicli?',
      options: [
        { id: 'a', text: 'Perché usa solo salti all’indietro, il che è più efficiente e favorisce la branch prediction', feedback: 'Esatto.' },
        { id: 'b', text: 'Perché il while non si può tradurre in assembly', feedback: 'Si traduce, ma con almeno un salto in avanti.' },
        { id: 'c', text: 'Perché il do-while non esegue mai il corpo', feedback: 'Lo esegue sempre almeno una volta.' },
        { id: 'd', text: 'Perché non serve nessun branch', feedback: 'Serve un branch alla fine del corpo.' },
      ],
      correct: 'a',
      explanation: 'while e for generano almeno un salto in avanti per uscire; il do-while esce semplicemente non saltando.',
      hint: 'In che direzione salta?',
      learnRef: 'cicli',
    },
    {
      kind: 'choice',
      id: 'p04-jal',
      prompt: 'Che cosa fa jal sum?',
      options: [
        { id: 'a', text: 'Salta alla label sum e salva PC + 4 nel registro ra', feedback: 'Esatto.' },
        { id: 'b', text: 'Salta alla label sum senza salvare nulla', feedback: 'Questo è j sum (jal x0, sum).' },
        { id: 'c', text: 'Salva ra nello stack e salta', feedback: 'Il salvataggio nello stack è compito del programmatore.' },
        { id: 'd', text: 'Torna al chiamante', feedback: 'Il ritorno è ret.' },
      ],
      correct: 'a',
      explanation: 'PC + 4 è l’istruzione dopo la chiamata, perché ogni istruzione occupa 4 byte.',
      hint: 'Jump And Link.',
      learnRef: 'routine',
    },
    {
      kind: 'choice',
      id: 'p04-nono',
      prompt: 'Una funzione ha 10 parametri. Dove si trovano il 9° e il 10°, e chi libera lo spazio?',
      options: [
        { id: 'a', text: 'Nello stack, messi dal chiamante in ordine inverso; li libera il chiamante dopo la chiamata', feedback: 'Esatto.' },
        { id: 'b', text: 'In t0 e t1; nessuno deve liberare nulla', feedback: 'L’ABI usa lo stack oltre a0–a7.' },
        { id: 'c', text: 'Nello stack; li libera la funzione chiamata', feedback: 'Lo stack lo ripulisce il chiamante.' },
        { id: 'd', text: 'Nei registri s0 e s1', feedback: 's0 e s1 sono callee-saved, non servono per i parametri.' },
      ],
      correct: 'a',
      explanation: 'addi sp, sp, -8; sw del 10° in 4(sp) e del 9° in 0(sp); jal; addi sp, sp, 8.',
      hint: 'Gli argomenti nei registri sono otto.',
      learnRef: 'parametri',
    },
    {
      kind: 'match',
      id: 'p04-chi-salva',
      prompt: 'Abbina ogni registro (o gruppo) a chi deve salvarlo secondo l’ABI.',
      pairs: [
        { id: 'ra', left: 'ra', right: 'Il chiamante (caller)', feedback: 'jal lo sovrascrive a ogni chiamata.' },
        { id: 's', left: 's0–s11', right: 'La routine chiamata (callee), se li usa', feedback: 'Devono ritrovarsi intatti al ritorno.' },
        { id: 'sp', left: 'sp', right: 'Il callee: va riportato al valore di ingresso prima di ret', feedback: 'Ogni addi sp negativo ha il suo positivo.' },
        { id: 'gp', left: 'gp, tp', right: 'Nessuno: non si modificano', feedback: 'Sono gestiti dall’ambiente.' },
      ],
      explanation: 'Caller-saved: ra, t0–t6, a0–a7. Callee-saved: sp, s0–s11.',
      hint: 'S = saved.',
      learnRef: 'stack-salvataggi',
    },
    {
      kind: 'choice',
      id: 'p04-annidata',
      prompt: 'sum2 chiama sum1 e poi deve tornare a main. Che cosa deve fare sum2 prima di jal sum1?',
      options: [
        { id: 'a', text: 'Salvare ra nello stack, per ripristinarlo dopo la chiamata', feedback: 'Esatto: jal sum1 sovrascrive ra.' },
        { id: 'b', text: 'Salvare a7', feedback: 'a7 non contiene l’indirizzo di ritorno.' },
        { id: 'c', text: 'Niente: ra si ripristina da solo', feedback: 'Nessuno lo ripristina automaticamente.' },
        { id: 'd', text: 'Azzerare sp', feedback: 'Distruggerebbe lo stack.' },
      ],
      correct: 'a',
      explanation: 'addi sp, sp, -4 / sw ra, 0(sp) … jal sum1 … lw ra, 0(sp) / addi sp, sp, 4 / ret.',
      hint: 'Che registro scrive jal?',
      learnRef: 'stack-salvataggi',
    },
    {
      kind: 'choice',
      id: 'p04-mulh',
      prompt: 'Due interi con segno moltiplicati danno un risultato che non sta in 32 bit. Quale istruzione restituisce i 32 bit alti?',
      options: [
        { id: 'a', text: 'mulh', feedback: 'Esatto: parte alta, con segno × con segno.' },
        { id: 'b', text: 'mul', feedback: 'mul restituisce i 32 bit bassi.' },
        { id: 'c', text: 'mulhu', feedback: 'mulhu tratta entrambi gli operandi come senza segno.' },
        { id: 'd', text: 'rem', feedback: 'rem è il resto della divisione.' },
      ],
      correct: 'a',
      explanation: 'mulhsu è per con segno × senza segno; mulhu per senza segno × senza segno.',
      hint: 'h = high.',
      learnRef: 'rv32im',
    },
  ],

  /* ═════════════ QUIZ ═════════════ */
  quiz: {
    intro: 'Dieci domande nuove rispetto alla Practice: spesso parti dal risultato, dal codice o dalla definizione e risali al concetto. Il quiz è superato con almeno il 60%.',
    questions: [
      {
        kind: 'choice',
        id: 'q04-def-heap',
        prompt: '«Regione per l’allocazione dinamica, il cui limite superiore è il program break; se un blocco non viene liberato si ha un memory leak.» Di quale regione si parla?',
        options: [
          { id: 'a', text: 'Heap', feedback: 'Esatto.' },
          { id: 'b', text: 'Stack', feedback: 'Lo stack si libera da solo al termine della routine.' },
          { id: 'c', text: 'Dati statici', feedback: 'Hanno dimensione fissa, nota prima dell’esecuzione.' },
          { id: 'd', text: 'Codice', feedback: 'Contiene le istruzioni.' },
        ],
        correct: 'a',
        explanation: 'malloc/free in C lavorano sullo heap.',
        hint: 'malloc.',
        learnRef: 'memory-layout',
      },
      {
        kind: 'choice',
        id: 'q04-da-byte',
        prompt: 'Dagli indirizzi 0x200–0x203 leggi i byte 0D, 0C, 0B, 0A. Quale word legge lw dall’indirizzo 0x200?',
        options: [
          { id: 'a', text: '0x0A0B0C0D', feedback: 'Esatto: il byte all’indirizzo più basso è il meno significativo.' },
          { id: 'b', text: '0x0D0C0B0A', feedback: 'Questa sarebbe la lettura big-endian.' },
          { id: 'c', text: '0x0C0D0A0B', feedback: 'L’ordine dei byte non è a coppie.' },
          { id: 'd', text: '0x0000000D', feedback: 'lw legge 4 byte, non uno.' },
        ],
        correct: 'a',
        explanation: 'Little-endian: si legge dall’indirizzo più alto (MSB) al più basso (LSB).',
        hint: 'Il byte a 0x200 finisce in fondo.',
        learnRef: 'memoria-byte',
      },
      {
        kind: 'choice',
        id: 'q04-def-callee',
        prompt: '«Se una routine li usa, deve salvarli all’ingresso e ripristinarli prima di ret.» Quali registri descrive questa regola?',
        options: [
          { id: 'a', text: 's0–s11 (e sp)', feedback: 'Esatto: sono callee-saved.' },
          { id: 'b', text: 't0–t6', feedback: 'I temporanei li può modificare liberamente il callee.' },
          { id: 'c', text: 'a0–a7', feedback: 'Gli argomenti li salva il chiamante, se gli servono.' },
          { id: 'd', text: 'ra', feedback: 'ra è caller-saved.' },
        ],
        correct: 'a',
        explanation: 'S = saved: il chiamante può contare sul fatto che restino intatti.',
        hint: 'Saved.',
        learnRef: 'stack-salvataggi',
      },
      {
        kind: 'choice',
        id: 'q04-traduci-pseudo',
        prompt: 'L’assembler ha prodotto jalr x0, 0(ra). Quale pseudo-istruzione aveva scritto il programmatore?',
        options: [
          { id: 'a', text: 'ret', feedback: 'Esatto: salta a ra senza salvare un nuovo indirizzo.' },
          { id: 'b', text: 'jal ra', feedback: 'jal salverebbe un nuovo indirizzo di ritorno.' },
          { id: 'c', text: 'nop', feedback: 'nop è addi x0, x0, 0.' },
          { id: 'd', text: 'mv ra, x0', feedback: 'Sarebbe addi ra, x0, 0.' },
        ],
        correct: 'a',
        explanation: 'Il link va su x0, quindi viene scartato: è un semplice ritorno.',
        hint: 'Dove porta ra?',
        learnRef: 'gruppi-istruzioni',
      },
      {
        kind: 'choice',
        id: 'q04-quale-load',
        prompt: 'Dopo una load il registro vale 0x0000FF80, ma in memoria la half-word è 0xFF80. Quale load è stata usata?',
        options: [
          { id: 'a', text: 'LHU', feedback: 'Esatto: half-word estesa con zeri.' },
          { id: 'b', text: 'LH', feedback: 'LH avrebbe dato 0xFFFFFF80, estendendo il bit 15.' },
          { id: 'c', text: 'LBU', feedback: 'LBU legge un solo byte: avrebbe dato 0x00000080.' },
          { id: 'd', text: 'LWU', feedback: 'In RV32I LWU non esiste.' },
        ],
        correct: 'a',
        explanation: 'Il bit 15 di 0xFF80 è 1: solo una load senza segno lascia zeri nei 16 bit alti.',
        hint: 'I 16 bit alti sono zero.',
        learnRef: 'load-store',
      },
      {
        kind: 'choice',
        id: 'q04-codice-ecall',
        prompt: 'Che cosa fa questo frammento?',
        code: `    li a7, 5
    ecall
    li a7, 1
    ecall`,
        options: [
          { id: 'a', text: 'Legge un intero e lo ristampa', feedback: 'Esatto: 5 mette il numero letto in a0, 1 stampa a0.' },
          { id: 'b', text: 'Stampa 5 e poi 1', feedback: 'I numeri in a7 sono codici di servizio, non valori da stampare.' },
          { id: 'c', text: 'Termina il programma due volte', feedback: 'L’uscita è il servizio 10.' },
          { id: 'd', text: 'Legge una stringa e la stampa', feedback: 'Per le stringhe servono 8 e 4.' },
        ],
        correct: 'a',
        explanation: 'Il risultato di read int resta in a0, che è proprio l’argomento di print int.',
        hint: 'Dove finisce il valore letto?',
        learnRef: 'ecall',
      },
      {
        kind: 'choice',
        id: 'q04-quale-ciclo',
        prompt: 'Questo codice corrisponde a quale costrutto C?',
        code: `LOOP:
    addi t0, t0, 1
    blt  t0, t1, LOOP`,
        options: [
          { id: 'a', text: 'do { x++; } while (x < y);', feedback: 'Esatto: corpo prima, condizione dopo, salto all’indietro.' },
          { id: 'b', text: 'while (x < y) x++;', feedback: 'Il while controlla la condizione prima del corpo.' },
          { id: 'c', text: 'if (x < y) x++;', feedback: 'C’è un salto all’indietro: è un ciclo.' },
          { id: 'd', text: 'for (;;) x++;', feedback: 'Il ciclo ha una condizione d’uscita.' },
        ],
        correct: 'a',
        explanation: 'Se x è già ≥ y, il corpo viene comunque eseguito una volta: tipico del do-while.',
        hint: 'Quando si controlla la condizione?',
        learnRef: 'cicli',
      },
      {
        kind: 'choice',
        id: 'q04-def-procedura',
        prompt: '«Routine che accetta parametri ma non restituisce un valore.» Come si chiama?',
        options: [
          { id: 'a', text: 'Procedura', feedback: 'Esatto.' },
          { id: 'b', text: 'Funzione', feedback: 'La funzione restituisce un valore.' },
          { id: 'c', text: 'Call site', feedback: 'È la riga in cui si chiama la routine.' },
          { id: 'd', text: 'Callee', feedback: 'È il ruolo di chi viene chiamato, funzione o procedura che sia.' },
        ],
        correct: 'a',
        explanation: 'Routine è il termine generico; funzione e procedura si distinguono per il valore restituito.',
        hint: 'void in C.',
        learnRef: 'routine',
      },
      {
        kind: 'choice',
        id: 'q04-riferimento',
        prompt: 'Questa versione di inc riceve il parametro per valore o per riferimento? E dove trova il risultato il chiamante?',
        code: `inc:
    lw   a1, (a0)
    addi a1, a1, 1
    sw   a1, (a0)
    ret`,
        options: [
          { id: 'a', text: 'Per riferimento: il risultato è già nella variabile in memoria', feedback: 'Esatto: a0 contiene l’indirizzo.' },
          { id: 'b', text: 'Per valore: il risultato è in a0', feedback: 'a0 viene usato come indirizzo di lw e sw.' },
          { id: 'c', text: 'Per riferimento: il risultato è in a0', feedback: 'a0 contiene ancora l’indirizzo, non il nuovo valore.' },
          { id: 'd', text: 'Per valore: il risultato è nello stack', feedback: 'Lo stack non viene toccato.' },
        ],
        correct: 'a',
        explanation: 'Corrisponde a void inc(int *v) { *v = *v + 1; }.',
        hint: 'Come viene usato a0?',
        learnRef: 'parametri',
      },
      {
        kind: 'choice',
        id: 'q04-div-zero',
        prompt: 'Dopo un’istruzione dell’estensione M il registro vale 0xFFFFFFFF e il programma prosegue senza errori. Che cosa può essere successo?',
        options: [
          { id: 'a', text: 'Una div con divisore zero', feedback: 'Esatto: restituisce −1 senza eccezioni.' },
          { id: 'b', text: 'Una rem con divisore zero', feedback: 'rem per zero restituisce il dividendo.' },
          { id: 'c', text: 'Il processore ha sollevato un’eccezione', feedback: 'La divisione per zero in RISC-V non genera eccezioni.' },
          { id: 'd', text: 'Una mul che ha dato overflow', feedback: 'mul tiene i bit bassi del prodotto: non dà sempre 0xFFFFFFFF.' },
        ],
        correct: 'a',
        explanation: 'Per gestire il caso, il programma deve controllare il divisore con un branch prima di dividere.',
        hint: 'Tutti i bit a 1.',
        learnRef: 'rv32im',
      },
    ],
  },

  /* ═════════════ CHALLENGE ═════════════ */
  challenge: {
    intro: 'Sette domande su codice e scenari nuovi. Nessun suggerimento e una sola risposta per domanda: l’esito e le spiegazioni compaiono alla fine. È facoltativa.',
    questions: [
      {
        kind: 'choice',
        id: 'c04-somma',
        prompt: 'Con N = 4, quanto vale t2 alla fine?',
        code: `    li  t1, 4          # N
    li  t0, 1
    li  t2, 0
LOOP:
    bgt t0, t1, END
    add t2, t2, t0
    addi t0, t0, 1
    j   LOOP
END:`,
        options: [
          { id: 'a', text: '10', feedback: 'Esatto: 1 + 2 + 3 + 4.' },
          { id: 'b', text: '6', feedback: 'Il ciclo esce solo quando i > N, quindi somma anche 4.' },
          { id: 'c', text: '15', feedback: 'Somma fino a 4, non a 5.' },
          { id: 'd', text: '4', feedback: 't2 accumula tutti i valori di i.' },
        ],
        correct: 'a',
        explanation: 'È l’esercizio della lezione con N = 4 invece di 10 (che dà 55).',
        learnRef: 'cicli',
      },
      {
        kind: 'choice',
        id: 'c04-offset',
        prompt: 'In un ciclo t0 è l’indirizzo base di un array di word e t3 l’indice i. Quale coppia di istruzioni calcola l’indirizzo di A[i] in t5?',
        options: [
          { id: 'a', text: 'slli t4, t3, 2  /  add t5, t0, t4', feedback: 'Esatto: offset = i × 4, poi base + offset.' },
          { id: 'b', text: 'add t5, t0, t3', feedback: 'Ogni word occupa 4 byte: l’indice va moltiplicato per 4.' },
          { id: 'c', text: 'slli t4, t3, 4  /  add t5, t0, t4', feedback: 'Shift di 4 moltiplica per 16.' },
          { id: 'd', text: 'srli t4, t3, 2  /  add t5, t0, t4', feedback: 'Lo shift a destra divide.' },
        ],
        correct: 'a',
        explanation: 'Memoria indirizzata al byte: l’elemento i di un array di word è a base + 4i.',
        learnRef: 'cicli',
      },
      {
        kind: 'choice',
        id: 'c04-bug-ricorsione',
        prompt: 'Questa versione ricorsiva non torna mai correttamente a main. Qual è l’errore?',
        code: `multiply:
    beq  a1, x0, base
    addi a1, a1, -1
    mv   s0, a0
    jal  multiply
    add  a0, a0, s0
    ret
base:
    li   a0, 0
    ret`,
        options: [
          { id: 'a', text: 'Non salva ra nello stack prima di jal multiply', feedback: 'Esatto: ogni jal sovrascrive ra e l’indirizzo verso main si perde.' },
          { id: 'b', text: 'Usa beq invece di bne', feedback: 'beq a1, x0 è corretto per il caso base y = 0.' },
          { id: 'c', text: 'Il caso base dovrebbe restituire 1', feedback: 'x × 0 = 0: il caso base è corretto.' },
          { id: 'd', text: 'ret dovrebbe essere j main', feedback: 'Una routine torna con ret, non con un salto a una label fissa.' },
        ],
        correct: 'a',
        explanation: 'La versione della lezione salva ra all’ingresso (addi sp, sp, -4 / sw ra, 0(sp)) e lo ripristina prima di ret. (Anche s0, callee-saved, andrebbe salvato.)',
        learnRef: 'stack-salvataggi',
      },
      {
        kind: 'choice',
        id: 'c04-nested',
        prompt: 'Con t1 = t2 = −3, quanto vale t3 alla fine?',
        code: `    beq  t1, t2, THEN1
    j    ELSE1
THEN1:
    blez t1, ELSE2
    li   t3, 1
    j    END
ELSE2:
    li   t3, 2
    j    END
ELSE1:
    li   t3, 3
END:`,
        options: [
          { id: 'a', text: '2', feedback: 'Esatto: x == y, ma x ≤ 0, quindi ELSE2.' },
          { id: 'b', text: '1', feedback: 'Sarebbe 1 solo con x > 0.' },
          { id: 'c', text: '3', feedback: 'ELSE1 si raggiunge solo se x ≠ y.' },
          { id: 'd', text: '0', feedback: 't3 viene sempre scritto.' },
        ],
        correct: 'a',
        explanation: 'blez salta se t1 ≤ 0: è la negazione di x > 0.',
        learnRef: 'condizioni',
      },
      {
        kind: 'choice',
        id: 'c04-rem-neg',
        prompt: 'In RV32M, che risultati danno div e rem con −9 e 4?',
        options: [
          { id: 'a', text: 'div = −2, rem = −1', feedback: 'Esatto: arrotondamento verso zero, resto con il segno del dividendo.' },
          { id: 'b', text: 'div = −3, rem = 3', feedback: 'Questo è l’arrotondamento verso −∞, non quello di RISC-V.' },
          { id: 'c', text: 'div = −2, rem = 1', feedback: '−2 × 4 + 1 = −7, non −9.' },
          { id: 'd', text: 'div = 2, rem = 1', feedback: 'Il segno del quoziente è negativo.' },
        ],
        correct: 'a',
        explanation: '−9 / 4 = −2,25 → −2; −2 × 4 + (−1) = −9.',
        learnRef: 'rv32im',
      },
      {
        kind: 'choice',
        id: 'c04-stack-param',
        prompt: 'Una funzione ha 11 parametri. Subito prima di jal, che istruzione alloca lo spazio per quelli in eccesso?',
        options: [
          { id: 'a', text: 'addi sp, sp, -12', feedback: 'Esatto: 3 parametri oltre l’ottavo × 4 byte.' },
          { id: 'b', text: 'addi sp, sp, -44', feedback: 'I primi otto viaggiano in a0–a7.' },
          { id: 'c', text: 'addi sp, sp, 12', feedback: 'Lo stack cresce verso il basso: si sottrae.' },
          { id: 'd', text: 'addi sp, sp, -3', feedback: 'Ogni parametro occupa 4 byte, non 1.' },
        ],
        correct: 'a',
        explanation: 'Dopo il ritorno il chiamante esegue addi sp, sp, 12.',
        learnRef: 'parametri',
      },
      {
        kind: 'choice',
        id: 'c04-stringa',
        prompt: 'Il programma stampa «ciao» seguito da caratteri inattesi. Qual è la causa più probabile?',
        code: `.data
msg: .ascii "ciao"
n:   .word 42
.text
    la a0, msg
    li a7, 4
    ecall`,
        options: [
          { id: 'a', text: 'La stringa è definita con .ascii, senza terminatore: la stampa prosegue nei byte di n', feedback: 'Esatto: serve .asciz.' },
          { id: 'b', text: 'a7 = 4 stampa un intero', feedback: 'Il servizio 4 stampa una stringa.' },
          { id: 'c', text: 'la non funziona in .text', feedback: 'la è una pseudo-istruzione valida nel codice.' },
          { id: 'd', text: 'Manca .globl msg', feedback: '.globl serve per la visibilità verso il linker.' },
        ],
        correct: 'a',
        explanation: 'print string legge fino al byte 0: con .ascii il primo zero arriva dopo, dentro i dati successivi.',
        learnRef: 'direttive',
      },
    ],
  },
};
