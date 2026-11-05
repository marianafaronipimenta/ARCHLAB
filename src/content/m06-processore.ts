import type { ModuleContent } from './types';

/*
 * MODULO 06 — Il processore
 * Fonte: lezione 10 «Il processore» (processore RISC-V a ciclo singolo, sottoinsieme lw, sw, add, sub, and, or, beq).
 * La tabella dei segnali di controllo è anche in sim/control.ts, verificata dai test.
 * Il Quiz non ripete la Practice: stessi concetti chiesti al contrario o in casi nuovi.
 */

export const m06: ModuleContent = {
  moduleId: 'processore',

  /* ═════════════ LEARN ═════════════ */
  learn: [
    {
      id: 'obiettivo',
      title: 'Che cosa costruiamo',
      slides: 'lezione 10, slide 2–5',
      blocks: [
        {
          type: 'p',
          text: 'In questo modulo si costruisce un’implementazione di un processore RISC-V composta da due parti: l’unità di elaborazione (data path), che contiene gli elementi che elaborano e memorizzano i dati, e l’unità di controllo (control unit), che dice a ciascun elemento che cosa fare.',
        },
        {
          type: 'p',
          text: 'Per renderla adatta a scopi didattici si usa un sottoinsieme molto limitato di RV32I, che basta comunque a progettare data path e controllo (aggiungere le altre istruzioni sarebbe poi relativamente semplice):',
        },
        {
          type: 'list',
          items: [
            'accesso alla memoria: lw e sw;',
            'aritmetico-logiche (tipo R): add, sub, and, or;',
            'salto condizionato: beq.',
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Perché funziona con poche istruzioni',
          text: 'Il set di istruzioni RISC-V è semplice e regolare: le tre categorie seguono una struttura comune, e questo semplifica il progetto del processore.',
        },
      ],
      keyPoints: ['Data path + unità di controllo', 'Sottoinsieme: lw, sw, add, sub, and, or, beq'],
      checkId: 'p06-sottoinsieme',
    },
    {
      id: 'ciclo',
      title: 'Le fasi di esecuzione di un’istruzione',
      slides: 'lezione 10, slide 6–7',
      blocks: [
        { type: 'p', text: 'Qualunque sia l’istruzione, i primi passaggi sono sempre gli stessi:' },
        {
          type: 'list',
          items: [
            'Fetch: il Program Counter fornisce l’indirizzo dell’istruzione da prelevare dalla memoria;',
            'Decodifica: si identifica l’operazione da eseguire e si preparano le risorse;',
            'Lettura dei registri: alcune istruzioni leggono un solo registro (le load), altre due (le aritmetico-logiche).',
          ],
        },
        { type: 'p', text: 'Seguono fasi comuni a quasi tutte le istruzioni, che però dipendono dal tipo:' },
        {
          type: 'list',
          items: [
            'Esecuzione: la ALU esegue l’operazione e produce un risultato (in alcune istruzioni non serve);',
            'Scrittura del risultato: nel registro di destinazione o in memoria;',
            'Aggiornamento del PC: in modo condizionato o non condizionato.',
          ],
        },
        {
          type: 'p',
          text: 'Dopo i passaggi iniziali le istruzioni si separano: load e store usano la ALU per calcolare l’indirizzo e poi accedono alla memoria; le aritmetico-logiche usano la ALU sui registri e scrivono il risultato nel registro destinazione; i salti condizionati usano la ALU per il confronto e poi, forse, aggiornano il PC.',
        },
      ],
      keyPoints: ['Sempre: fetch, decodifica, lettura registri', 'Poi: ALU, scrittura, aggiornamento PC', 'Tutte le istruzioni usano la ALU'],
      checkId: 'p06-ordina-fasi',
    },
    {
      id: 'elementi-logici',
      title: 'Elementi combinatori ed elementi di stato',
      slides: 'lezione 10, slide 8–10',
      blocks: [
        {
          type: 'p',
          text: 'Progettare un calcolatore significa definire la logica hardware e la sincronizzazione del sistema (la logica digitale di base è materia di Architettura degli elaboratori 1). Gli elementi del data path sono di due tipi:',
        },
        {
          type: 'list',
          items: [
            'Elementi combinatori: l’uscita dipende solo dagli ingressi in quell’istante, non hanno memoria. Esempio: la ALU, che con gli stessi ingressi dà sempre lo stesso risultato.',
            'Elementi di stato: contengono memoria interna e mantengono lo stato tra un ciclo di clock e l’altro. Esempi: memoria istruzioni, memoria dati, registri.',
          ],
        },
        {
          type: 'p',
          text: 'La logica sequenziale è costruita con elementi di stato: la sua uscita dipende dagli ingressi e dallo stato interno. Si chiama «sequenziale» perché il comportamento dipende dalla sequenza dei cicli di clock che la aggiornano (flip-flop, registri, memorie).',
        },
      ],
      keyPoints: ['Combinatorio: niente memoria (ALU, sommatori, MUX)', 'Di stato: memoria interna (PC, registri, memorie)', 'Sequenziale = dipende anche dallo stato'],
      checkId: 'p06-match-elementi',
    },
    {
      id: 'componenti-fetch',
      title: 'Memoria istruzioni, PC e sommatore',
      slides: 'lezione 10, slide 11–15',
      blocks: [
        {
          type: 'list',
          items: [
            'Memoria istruzioni: elemento di stato in sola lettura che contiene le istruzioni del programma. Riceve un indirizzo e fornisce l’istruzione. Essendo in sola lettura, si può trattare come un circuito combinatorio: con lo stesso ingresso dà sempre la stessa uscita.',
            'Program Counter: elemento di stato da 32 bit con l’indirizzo dell’istruzione da eseguire. Si aggiorna a ogni ciclo di clock, quindi non ha bisogno di un segnale di scrittura. Non fa parte dei 32 registri dell’architettura.',
            'Adder (sommatore): una ALU configurata per fare sempre e solo la somma; è combinatorio. Le istruzioni sono lunghe 4 byte, quindi senza salti si somma 4 al PC.',
          ],
        },
        {
          type: 'p',
          text: 'Unendo questi tre componenti si ottiene la prima parte della CPU: preleva le istruzioni dalla memoria e incrementa il PC. Ma servono anche registri per gli operandi, una memoria per i dati e il supporto ai salti: ci vogliono altri componenti.',
        },
      ],
      keyPoints: ['Memoria istruzioni: sola lettura → trattata come combinatoria', 'PC: 32 bit, aggiornato a ogni ciclo, senza segnale di scrittura', 'Sommatore: PC + 4'],
      checkId: 'p06-pc',
    },
    {
      id: 'componenti-esecuzione',
      title: 'Register file, ALU, memoria dati, estensione del segno',
      slides: 'lezione 10, slide 16–20',
      blocks: [
        {
          type: 'list',
          items: [
            'Register file: elemento di stato con 32 registri da 32 bit, 2 porte di lettura e 1 di scrittura. Ogni numero di registro è su 5 bit (2⁵ = 32). In uscita ci sono sempre i contenuti dei 2 registri selezionati; la scrittura richiede un segnale e avviene sul fronte di clock. Si può quindi leggere e scrivere lo stesso registro nello stesso ciclo.',
            'ALU: circuito combinatorio con due ingressi e un’uscita a 32 bit; fa una delle 4 operazioni AND, OR, somma, sottrazione. Per beq fa una sottrazione: se il risultato è 0, i due valori sono uguali e si salta.',
            'Memoria dati: elemento di stato in lettura (riceve un indirizzo, fornisce il dato) e in scrittura (riceve indirizzo e dato). Contiene costanti, variabili globali e locali. A differenza della memoria istruzioni, non si può trattare come combinatoria.',
            'Unità di estensione del segno: riceve i 12 bit dell’immediato (di load, store o salto condizionato) e li estende con segno a 32 bit.',
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'L’offset dei salti',
          text: 'L’offset di un salto viene shiftato a sinistra di un bit, così codifica indirizzi alla half-word invece che al byte (l’estensione C usa istruzioni da 16 bit). Il bit meno significativo è sempre 0, quindi non serve memorizzarlo nell’istruzione: si guadagna un bit di portata.',
        },
      ],
      keyPoints: ['Register file: 32 × 32 bit, 2 letture + 1 scrittura, numeri su 5 bit', 'ALU: AND, OR, somma, sottrazione', 'beq = sottrazione + Zero', 'Offset dei salti × 2'],
      checkId: 'p06-regfile',
    },
    {
      id: 'multiplexer',
      title: 'Multiplexer e i 7 segnali di controllo',
      slides: 'lezione 10, slide 21–30',
      blocks: [
        {
          type: 'p',
          text: 'Molte unità funzionali vogliono segnali di controllo: la memoria va letta per le load e scritta per le store; il register file va scritto solo per load e istruzioni aritmetico-logiche; la ALU deve scegliere l’operazione. Inoltre alcuni ingressi possono arrivare da sorgenti diverse: il secondo operando della ALU può essere un registro o un immediato. Due sorgenti non si possono collegare direttamente: serve un multiplexer (MUX), che ha più ingressi e porta in uscita uno solo, scelto da una linea di controllo.',
        },
        {
          type: 'code',
          caption: 'I 7 segnali di controllo',
          code: `segnale    0 (non asserito)                  1 (asserito)
RegWrite   nulla                             scrive nel registro destinazione
ALUOp      (2 bit, va al controllore ALU)
ALUSrc     2° operando ALU = Dato letto 2    2° operando = immediato esteso
PCSrc      PC ← PC + 4                       PC ← indirizzo di salto
MemRead    nulla                             la memoria fornisce il dato letto
MemWrite   nulla                             la memoria scrive il dato
MemtoReg   al registro va il risultato ALU   al registro va il dato dalla memoria`,
        },
        {
          type: 'p',
          text: 'Tre di questi segnali comandano altrettanti multiplexer: PCSrc (quale valore entra nel PC), MemtoReg (che cosa si scrive nel registro: risultato della ALU o dato letto, per le load) e ALUSrc (secondo operando: registro o immediato, per load/store).',
        },
      ],
      keyPoints: ['MUX: tanti ingressi, un’uscita scelta dal controllo', 'MUX: PCSrc, MemtoReg, ALUSrc', 'Lettura/scrittura: RegWrite, MemRead, MemWrite', 'ALUOp: 2 bit'],
      checkId: 'p06-match-segnali',
    },
    {
      id: 'unita-controllo',
      title: 'Unità di controllo, AND Branch e controllore ALU',
      slides: 'lezione 10, slide 41–52',
      blocks: [
        {
          type: 'p',
          text: 'L’unità di controllo fa da decoder: riceve i 7 bit dell’opcode e produce ALUSrc, MemtoReg, RegWrite, MemRead, MemWrite, Branch (1 bit ciascuno) e ALUOp (2 bit). Branch non è tra i 7 segnali perché è solo uno dei due ingressi di PCSrc.',
        },
        {
          type: 'p',
          text: 'L’altro ingresso è Zero, che la ALU mette a 1 quando il risultato è 0. Una porta AND li combina: PCSrc = Branch AND Zero. Si salta solo se l’istruzione è un salto e i due registri sono uguali.',
        },
        {
          type: 'p',
          text: 'Il controllore ALU è un livello intermedio di decodifica: riceve ALUOp e i campi funct7 [31:25] e funct3 [14:12] e produce i 4 bit di controllo della ALU (0000 AND, 0001 OR, 0010 somma, 0110 sottrazione). Così l’unità di controllo principale è più piccola e la latenza del controllo, critica per la durata del ciclo di clock, si riduce.',
        },
        { type: 'diagram', diagram: 'controllo' },
        {
          type: 'code',
          caption: 'ALUOp e controllore ALU',
          code: `ALUOp  istruzione  funct7   funct3  operazione   bit ALU
00     lw, sw      X        X       somma        0010
01     beq         X        X       sottrazione  0110
10     add         0000000  000     somma        0010
10     sub         0100000  000     sottrazione  0110
10     and         0000000  111     AND          0000
10     or          0000000  110     OR           0001`,
        },
      ],
      keyPoints: ['Input: opcode (7 bit)', 'PCSrc = Branch AND Zero', 'ALUOp 00 somma, 01 sottrazione, 10 guarda funct7/funct3', 'lw, sw e add usano tutte la somma'],
      checkId: 'p06-pcsrc',
    },
    {
      id: 'flussi',
      title: 'Il percorso di tipo R, load, store e beq',
      slides: 'lezione 10, slide 31–40, 53–55',
      blocks: [
        {
          type: 'list',
          items: [
            'Tipo R (add, sub, and, or): legge due registri, la ALU li combina (ALUSrc = 0), il risultato va nel registro destinazione (MemtoReg = 0, RegWrite = 1).',
            'Load (lw): la ALU somma il registro 1 e l’immediato esteso (ALUSrc = 1) per ottenere l’indirizzo; la memoria dati viene letta (MemRead = 1) e il dato va nel registro destinazione (MemtoReg = 1, RegWrite = 1).',
            'Store (sw): l’indirizzo è registro 1 + immediato; il dato da scrivere viene dal registro 2 (MemWrite = 1). Nessun registro viene scritto (RegWrite = 0).',
            'beq: la ALU sottrae i due registri (ALUOp = 01); un sommatore a parte calcola PC + (offset esteso e shiftato di 1); se Zero = 1 e Branch = 1, il PC prende l’indirizzo di salto.',
            'Senza salto, il PC viene incrementato di 4 da un sommatore apposito.',
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Valori «indifferenti»',
          text: 'Per sw e beq RegWrite = 0, quindi il valore di MemtoReg non ha effetto: la tabella delle slide lo indica come 0.',
        },
      ],
      keyPoints: ['R: ALUSrc 0, MemtoReg 0, RegWrite 1', 'lw: ALUSrc 1, MemRead 1, MemtoReg 1, RegWrite 1', 'sw: ALUSrc 1, MemWrite 1', 'beq: ALUOp 01, Branch 1'],
      checkId: 'p06-sw-dato',
    },
    {
      id: 'clock',
      title: 'Clock e metodologia di temporizzazione',
      slides: 'lezione 10, slide 56–61',
      blocks: [
        {
          type: 'p',
          text: 'Non basta che i componenti siano collegati: letture e scritture devono avvenire al momento giusto. Il clock è un segnale periodico che alterna uno stato basso e uno alto; ogni transizione è un fronte, e serve a sincronizzare tutto il sistema. Una temporizzazione sensibile ai fronti si dice edge-triggered. Nel corso si suppone che gli elementi di stato siano scritti sul fronte di salita.',
        },
        {
          type: 'p',
          text: 'In un ciclo, i segnali partono da un elemento di stato, attraversano la logica combinatoria e devono raggiungere un altro elemento di stato entro un periodo di clock. La velocità di propagazione attraverso la logica fissa quindi la durata minima del periodo.',
        },
        {
          type: 'list',
          items: [
            'Gli elementi aggiornati a ogni ciclo (come il PC) non hanno bisogno di un segnale di scrittura esplicito.',
            'Gli altri si scrivono solo quando il loro segnale di scrittura è asserito (= 1).',
            'Non c’è retroazione nello stesso ciclo: un valore letto, elaborato e riscritto nello stesso elemento viene scritto solo al fronte di salita.',
          ],
        },
      ],
      keyPoints: ['Edge-triggered, scrittura sul fronte di salita', 'Il periodo deve coprire la propagazione più lunga', 'Segnale di scrittura solo per chi non si aggiorna a ogni ciclo'],
      checkId: 'p06-edge',
    },
    {
      id: 'temporizzazione',
      title: 'Un ciclo di clock, fase per fase',
      slides: 'lezione 10, slide 62–71',
      blocks: [
        {
          type: 'code',
          caption: 'Una possibile temporizzazione del data path',
          code: `fronte di salita    write back: si aggiornano PC, registro (se RegWrite),
                    segnali di scrittura/lettura alla memoria
fine del fronte     PC e registri stabili, parte la propagazione
fase alta           fetch: PC → memoria istruzioni e → sommatore PC + 4
fine fase alta      decode: arriva l’istruzione, l’unità di controllo la decodifica
fronte di discesa   lettura dei registri, estensione del segno
fase bassa          execute: ALU (operazione, indirizzo, confronto)
                    e in parallelo l’indirizzo di salto
fronte di salita    write back… e il ciclo ricomincia`,
        },
        {
          type: 'p',
          text: 'Dal fetch in poi è tutta logica combinatoria fino al fronte di salita successivo. La durata del ciclo (per esempio 250 ps) dipende dal progetto: ogni componente aggiunge la sua latenza, e la somma determina il periodo minimo che garantisce il funzionamento corretto.',
        },
        {
          type: 'callout',
          tone: 'warn',
          title: 'La memoria è lenta',
          text: 'Lettura e scrittura della memoria hanno una latenza molto più alta delle operazioni interne, molto superiore al ciclo di clock. Per questo servono cache e altre ottimizzazioni.',
        },
      ],
      keyPoints: ['Fronte di salita = write back', 'Fronte di discesa = lettura registri', 'Periodo = somma delle latenze', 'Memoria ≫ ciclo → cache'],
      checkId: 'p06-ordina-ciclo',
    },
  ],

  /* ═════════════ PRACTICE ═════════════ */
  practice: [
    {
      kind: 'choice',
      id: 'p06-sottoinsieme',
      prompt: 'Quali istruzioni compongono il sottoinsieme di RV32I usato per costruire il processore della lezione?',
      options: [
        { id: 'a', text: 'lw, sw, add, sub, and, or, beq', feedback: 'Esatto.' },
        { id: 'b', text: 'Tutte le 40 istruzioni di RV32I', feedback: 'La lezione semplifica a un sottoinsieme.' },
        { id: 'c', text: 'add, mul, div, jal', feedback: 'mul e div sono dell’estensione M.' },
        { id: 'd', text: 'lb, sb, addi, j', feedback: 'Non sono quelle scelte.' },
      ],
      correct: 'a',
      explanation: 'Memoria (lw, sw), aritmetico-logiche (add, sub, and, or), salto condizionato (beq).',
      hint: 'Una per categoria… più o meno.',
      learnRef: 'obiettivo',
    },
    {
      kind: 'order',
      id: 'p06-ordina-fasi',
      prompt: 'Riordina le fasi di esecuzione di un’istruzione.',
      items: [
        { id: 'f', text: 'Fetch dell’istruzione' },
        { id: 'd', text: 'Decodifica' },
        { id: 'r', text: 'Lettura dei registri' },
        { id: 'e', text: 'Esecuzione nella ALU' },
        { id: 'w', text: 'Scrittura del risultato' },
        { id: 'p', text: 'Aggiornamento del PC' },
      ],
      explanation: 'Le prime tre sono uguali per tutte le istruzioni.',
      hint: 'Prima si preleva, poi si capisce che cosa fare.',
      learnRef: 'ciclo',
    },
    {
      kind: 'match',
      id: 'p06-match-elementi',
      prompt: 'Abbina ogni componente al tipo di elemento.',
      pairs: [
        { id: 'alu', left: 'ALU', right: 'Combinatorio: nessuna memoria interna', feedback: 'Stessi ingressi, stessa uscita.' },
        { id: 'rf', left: 'Register file', right: 'Di stato: mantiene i valori tra i cicli', feedback: 'Contiene i 32 registri.' },
        { id: 'imem', left: 'Memoria istruzioni', right: 'Di stato, ma in sola lettura: si può trattare come combinatoria', feedback: 'Non viene mai scritta durante l’esecuzione.' },
        { id: 'dmem', left: 'Memoria dati', right: 'Di stato, letta e scritta: non è trattabile come combinatoria', feedback: 'Il contenuto cambia con le store.' },
      ],
      explanation: 'Combinatorio = uscita funzione dei soli ingressi; di stato = ha memoria.',
      hint: 'Chi ricorda qualcosa tra un ciclo e l’altro?',
      learnRef: 'elementi-logici',
    },
    {
      kind: 'choice',
      id: 'p06-pc',
      prompt: 'Perché il Program Counter non ha un segnale di controllo per la scrittura?',
      options: [
        { id: 'a', text: 'Perché viene aggiornato a ogni ciclo di clock', feedback: 'Esatto.' },
        { id: 'b', text: 'Perché è un elemento combinatorio', feedback: 'Il PC è un elemento di stato.' },
        { id: 'c', text: 'Perché è uno dei 32 registri', feedback: 'Non rientra nei 32 registri dell’architettura.' },
        { id: 'd', text: 'Perché non viene mai modificato', feedback: 'Cambia a ogni istruzione.' },
      ],
      correct: 'a',
      explanation: 'Il segnale di scrittura serve solo agli elementi che non si aggiornano a ogni ciclo.',
      hint: 'Quando cambia il PC?',
      learnRef: 'componenti-fetch',
    },
    {
      kind: 'choice',
      id: 'p06-regfile',
      prompt: 'Quante porte di lettura e di scrittura ha il register file, e su quanti bit è il numero di un registro?',
      options: [
        { id: 'a', text: '2 di lettura, 1 di scrittura; 5 bit', feedback: 'Esatto: 2⁵ = 32 registri.' },
        { id: 'b', text: '1 di lettura, 1 di scrittura; 32 bit', feedback: '32 bit è la larghezza dei registri, non del loro numero.' },
        { id: 'c', text: '2 di lettura, 2 di scrittura; 5 bit', feedback: 'Si scrive al massimo un registro per istruzione.' },
        { id: 'd', text: '3 di lettura, 1 di scrittura; 6 bit', feedback: 'Servono al massimo due operandi sorgente.' },
      ],
      correct: 'a',
      explanation: 'Due registri sorgente, un registro destinazione.',
      hint: 'Un’istruzione di tipo R ha rs1, rs2, rd.',
      learnRef: 'componenti-esecuzione',
    },
    {
      kind: 'choice',
      id: 'p06-beq-alu',
      prompt: 'Quale operazione esegue la ALU per un beq, e come si capisce se saltare?',
      options: [
        { id: 'a', text: 'Una sottrazione: se il risultato è 0 (Zero = 1) i registri sono uguali', feedback: 'Esatto.' },
        { id: 'b', text: 'Un AND bit a bit', feedback: 'L’AND non dice se due numeri sono uguali.' },
        { id: 'c', text: 'Una somma: se il risultato è 0 si salta', feedback: 'La somma di due numeri uguali non è 0.' },
        { id: 'd', text: 'Nessuna: il confronto lo fa la memoria', feedback: 'Il confronto lo fa la ALU.' },
      ],
      correct: 'a',
      explanation: 'a − b = 0 ⇔ a = b.',
      hint: 'Uguali ⇔ differenza nulla.',
      learnRef: 'componenti-esecuzione',
    },
    {
      kind: 'match',
      id: 'p06-match-segnali',
      prompt: 'Abbina ogni segnale all’effetto che ha quando vale 1.',
      pairs: [
        { id: 'alusrc', left: 'ALUSrc = 1', right: 'Il secondo operando della ALU è l’immediato esteso', feedback: 'Serve a load e store.' },
        { id: 'memtoreg', left: 'MemtoReg = 1', right: 'Nel registro si scrive il dato letto dalla memoria', feedback: 'Serve alle load.' },
        { id: 'pcsrc', left: 'PCSrc = 1', right: 'Nel PC entra l’indirizzo di salto', feedback: 'Altrimenti PC + 4.' },
        { id: 'regwrite', left: 'RegWrite = 1', right: 'Il register file scrive il registro destinazione', feedback: 'Load e tipo R.' },
        { id: 'memwrite', left: 'MemWrite = 1', right: 'La memoria dati scrive il dato all’indirizzo', feedback: 'Store.' },
      ],
      explanation: 'ALUSrc, MemtoReg e PCSrc comandano i tre multiplexer.',
      hint: 'Src = sorgente di un multiplexer.',
      learnRef: 'multiplexer',
    },
    {
      kind: 'choice',
      id: 'p06-mux',
      prompt: 'Perché serve un multiplexer davanti al secondo ingresso della ALU?',
      options: [
        { id: 'a', text: 'Perché l’operando può arrivare dal register file o dall’immediato, e due sorgenti non si collegano direttamente', feedback: 'Esatto: è il MUX comandato da ALUSrc.' },
        { id: 'b', text: 'Per scegliere l’operazione della ALU', feedback: 'L’operazione la sceglie il controllore ALU.' },
        { id: 'c', text: 'Per memorizzare l’operando tra due cicli', feedback: 'Un MUX è combinatorio, non memorizza.' },
        { id: 'd', text: 'Per moltiplicare gli operandi', feedback: 'Multiplexer non c’entra con la moltiplicazione.' },
      ],
      correct: 'a',
      explanation: 'Un MUX ha più ingressi e porta in uscita quello scelto dalla linea di controllo.',
      hint: 'Registro o immediato?',
      learnRef: 'multiplexer',
    },
    {
      kind: 'choice',
      id: 'p06-pcsrc',
      prompt: 'Come si ottiene il segnale PCSrc?',
      options: [
        { id: 'a', text: 'PCSrc = Branch AND Zero', feedback: 'Esatto.' },
        { id: 'b', text: 'PCSrc = Branch OR Zero', feedback: 'Con OR si salterebbe ogni volta che la ALU dà 0, anche con un add.' },
        { id: 'c', text: 'Lo produce direttamente l’unità di controllo dall’opcode', feedback: 'L’unità di controllo produce Branch; serve anche Zero.' },
        { id: 'd', text: 'PCSrc = MemRead AND MemWrite', feedback: 'Non riguarda la memoria.' },
      ],
      correct: 'a',
      explanation: 'Si salta solo se l’istruzione è un salto e il confronto è riuscito.',
      hint: 'Servono due condizioni insieme.',
      learnRef: 'unita-controllo',
    },
    {
      kind: 'match',
      id: 'p06-match-aluop',
      prompt: 'Abbina ogni valore di ALUOp a che cosa fa la ALU.',
      pairs: [
        { id: '00', left: 'ALUOp = 00', right: 'Somma, per calcolare l’indirizzo di lw e sw', feedback: 'Registro + immediato.' },
        { id: '01', left: 'ALUOp = 01', right: 'Sottrazione, per il confronto di beq', feedback: 'Zero = 1 se uguali.' },
        { id: '10', left: 'ALUOp = 10', right: 'Dipende da funct7 e funct3 (tipo R)', feedback: 'add, sub, and, or.' },
      ],
      explanation: 'Il controllore ALU legge funct7/funct3 solo con ALUOp = 10.',
      hint: '10 = tipo R.',
      learnRef: 'unita-controllo',
    },
    {
      kind: 'choice',
      id: 'p06-sw-dato',
      prompt: 'In un’istruzione sw, da dove arrivano l’indirizzo e il dato da scrivere?',
      options: [
        { id: 'a', text: 'Indirizzo = registro 1 + immediato (calcolato dalla ALU); dato = registro 2', feedback: 'Esatto.' },
        { id: 'b', text: 'Indirizzo = registro 2; dato = registro 1', feedback: 'È il contrario, e all’indirizzo si somma l’immediato.' },
        { id: 'c', text: 'Indirizzo = PC + 4; dato = risultato della ALU', feedback: 'PC + 4 è l’istruzione successiva.' },
        { id: 'd', text: 'Indirizzo = immediato; dato = memoria istruzioni', feedback: 'Il dato arriva dal register file.' },
      ],
      correct: 'a',
      explanation: 'sw x5, 8(x6): indirizzo x6 + 8, dato x5.',
      hint: 'sw rs2, imm(rs1).',
      learnRef: 'flussi',
    },
    {
      kind: 'choice',
      id: 'p06-edge',
      prompt: 'Che cosa significa che la temporizzazione è edge-triggered?',
      options: [
        { id: 'a', text: 'Gli elementi di stato si aggiornano su un fronte del clock (qui quello di salita)', feedback: 'Esatto.' },
        { id: 'b', text: 'I segnali si propagano solo quando il clock è alto', feedback: 'La logica combinatoria si propaga in tutto il ciclo.' },
        { id: 'c', text: 'La ALU lavora solo sui fronti', feedback: 'La ALU è combinatoria.' },
        { id: 'd', text: 'Il clock ha un solo stato', feedback: 'Il clock alterna stato alto e basso.' },
      ],
      correct: 'a',
      explanation: 'Fronte = transizione tra stato basso e alto.',
      hint: 'Edge = fronte.',
      learnRef: 'clock',
    },
    {
      kind: 'order',
      id: 'p06-ordina-ciclo',
      prompt: 'Riordina ciò che accade in un ciclo di clock, partendo dal fronte di salita.',
      items: [
        { id: 'wb', text: 'Fronte di salita: write back, si aggiornano PC e registri' },
        { id: 'st', text: 'PC e registri stabili, parte la propagazione' },
        { id: 'if', text: 'Fase alta: fetch, il PC va alla memoria istruzioni' },
        { id: 'id', text: 'Fine fase alta: decodifica dell’istruzione' },
        { id: 'rf', text: 'Fronte di discesa: lettura registri ed estensione del segno' },
        { id: 'ex', text: 'Fase bassa: la ALU esegue' },
      ],
      explanation: 'Poi arriva il fronte di salita successivo, con il write back.',
      hint: 'Il fronte di discesa sta a metà ciclo.',
      learnRef: 'temporizzazione',
    },
  ],

  /* ═════════════ QUIZ ═════════════ */
  quiz: {
    intro: 'Dieci domande nuove rispetto alla Practice: parti dalla descrizione, dai valori dei segnali o dal comportamento e risali al componente o all’istruzione. Il quiz è superato con almeno il 60%.',
    questions: [
      {
        kind: 'choice',
        id: 'q06-def-combinatorio',
        prompt: '«Non ha memoria: la sua uscita dipende solo dagli ingressi in quell’istante.» Che tipo di elemento è, e quale di questi componenti ne è un esempio?',
        options: [
          { id: 'a', text: 'Elemento combinatorio; la ALU', feedback: 'Esatto.' },
          { id: 'b', text: 'Elemento di stato; il register file', feedback: 'Il register file ha memoria.' },
          { id: 'c', text: 'Elemento sequenziale; il PC', feedback: 'Il PC mantiene il suo valore tra i cicli.' },
          { id: 'd', text: 'Elemento combinatorio; la memoria dati', feedback: 'La memoria dati viene scritta: non è combinatoria.' },
        ],
        correct: 'a',
        explanation: 'Anche sommatori e multiplexer sono combinatori.',
        hint: 'Stessi ingressi, stessa uscita.',
        learnRef: 'elementi-logici',
      },
      {
        kind: 'choice',
        id: 'q06-def-pc',
        prompt: '«Elemento di stato da 32 bit, aggiornato a ogni ciclo di clock, che non rientra nei 32 registri dell’architettura.» Che cos’è?',
        options: [
          { id: 'a', text: 'Il Program Counter', feedback: 'Esatto.' },
          { id: 'b', text: 'Il registro x0', feedback: 'x0 è uno dei 32 registri.' },
          { id: 'c', text: 'Il sommatore', feedback: 'Il sommatore è combinatorio.' },
          { id: 'd', text: 'La memoria istruzioni', feedback: 'È una memoria, non un registro.' },
        ],
        correct: 'a',
        explanation: 'Contiene l’indirizzo dell’istruzione da eseguire.',
        hint: 'Indica l’istruzione.',
        learnRef: 'componenti-fetch',
      },
      {
        kind: 'choice',
        id: 'q06-da-segnali-lw',
        prompt: 'L’unità di controllo produce: RegWrite 1, ALUOp 00, ALUSrc 1, Branch 0, MemRead 1, MemWrite 0, MemtoReg 1. Quale istruzione è?',
        options: [
          { id: 'a', text: 'lw', feedback: 'Esatto: legge la memoria e scrive il dato in un registro.' },
          { id: 'b', text: 'sw', feedback: 'sw ha MemWrite = 1 e RegWrite = 0.' },
          { id: 'c', text: 'add', feedback: 'add ha ALUOp = 10 e ALUSrc = 0.' },
          { id: 'd', text: 'beq', feedback: 'beq ha Branch = 1.' },
        ],
        correct: 'a',
        explanation: 'MemRead e MemtoReg a 1 sono la firma delle load.',
        hint: 'Chi legge la memoria?',
        learnRef: 'flussi',
      },
      {
        kind: 'choice',
        id: 'q06-da-segnali-sw',
        prompt: 'RegWrite 0, ALUSrc 1, MemWrite 1, Branch 0. Quale istruzione è?',
        options: [
          { id: 'a', text: 'sw', feedback: 'Esatto: scrive in memoria, non nei registri.' },
          { id: 'b', text: 'lw', feedback: 'lw scrive un registro.' },
          { id: 'c', text: 'or', feedback: 'or scrive un registro e non usa l’immediato.' },
          { id: 'd', text: 'beq', feedback: 'beq ha Branch = 1 e ALUSrc = 0.' },
        ],
        correct: 'a',
        explanation: 'L’immediato serve a calcolare l’indirizzo.',
        hint: 'MemWrite.',
        learnRef: 'flussi',
      },
      {
        kind: 'choice',
        id: 'q06-da-bit-alu',
        prompt: 'Il controllore ALU ha prodotto i bit 0110. Quali istruzioni del sottoinsieme possono averlo causato?',
        options: [
          { id: 'a', text: 'sub e beq', feedback: 'Esatto: entrambe richiedono una sottrazione.' },
          { id: 'b', text: 'lw e sw', feedback: 'lw e sw richiedono una somma (0010).' },
          { id: 'c', text: 'and', feedback: 'and è 0000.' },
          { id: 'd', text: 'or', feedback: 'or è 0001.' },
        ],
        correct: 'a',
        explanation: 'sub: ALUOp 10, funct7 0100000. beq: ALUOp 01.',
        hint: '0110 = sottrazione.',
        learnRef: 'unita-controllo',
      },
      {
        kind: 'choice',
        id: 'q06-def-mux',
        prompt: '«Ha diversi ingressi ma porta in uscita solo uno di essi, scelto da una linea di controllo.» Come si chiama?',
        options: [
          { id: 'a', text: 'Multiplexer (data selector)', feedback: 'Esatto.' },
          { id: 'b', text: 'Decoder', feedback: 'Il decoder è il ruolo dell’unità di controllo.' },
          { id: 'c', text: 'Sommatore', feedback: 'Il sommatore combina gli ingressi.' },
          { id: 'd', text: 'Register file', feedback: 'Il register file memorizza.' },
        ],
        correct: 'a',
        explanation: 'Nel data path ci sono tre MUX: PCSrc, ALUSrc, MemtoReg.',
        hint: 'Selettore.',
        learnRef: 'multiplexer',
      },
      {
        kind: 'choice',
        id: 'q06-scenario-pcsrc',
        prompt: 'Un add produce risultato 0, quindi Zero = 1. Il PC salta?',
        options: [
          { id: 'a', text: 'No: Branch = 0, quindi PCSrc = 0 e nel PC va PC + 4', feedback: 'Esatto: serve anche Branch.' },
          { id: 'b', text: 'Sì: Zero = 1 basta', feedback: 'PCSrc è un AND: Zero da solo non basta.' },
          { id: 'c', text: 'Sì, perché ALUOp = 10', feedback: 'ALUOp riguarda l’operazione della ALU.' },
          { id: 'd', text: 'Dipende da MemtoReg', feedback: 'MemtoReg sceglie il dato per il registro.' },
        ],
        correct: 'a',
        explanation: 'PCSrc = Branch AND Zero = 0 AND 1 = 0.',
        hint: 'Quanto vale Branch per add?',
        learnRef: 'unita-controllo',
      },
      {
        kind: 'choice',
        id: 'q06-perche-controllore',
        prompt: 'Perché la decodifica dell’operazione ALU è divisa tra unità di controllo (ALUOp) e controllore ALU?',
        options: [
          { id: 'a', text: 'Per ridurre la dimensione dell’unità di controllo principale e la latenza del controllo', feedback: 'Esatto: la latenza è critica per il periodo di clock.' },
          { id: 'b', text: 'Perché la ALU non conosce l’opcode', feedback: 'Il motivo indicato è la riduzione di dimensione e latenza.' },
          { id: 'c', text: 'Per permettere alla ALU di fare la moltiplicazione', feedback: 'La ALU del corso non moltiplica.' },
          { id: 'd', text: 'Per poter scrivere due registri', feedback: 'Non c’entra con la scrittura dei registri.' },
        ],
        correct: 'a',
        explanation: 'Livello intermedio: ALUOp (2 bit) + funct7 e funct3 → 4 bit di controllo.',
        hint: 'Ciclo di clock.',
        learnRef: 'unita-controllo',
      },
      {
        kind: 'choice',
        id: 'q06-fase-discesa',
        prompt: 'Nella temporizzazione della lezione, che cosa avviene sul fronte di discesa del clock?',
        options: [
          { id: 'a', text: 'Si leggono i registri e si estende il segno dell’immediato', feedback: 'Esatto.' },
          { id: 'b', text: 'Si scrive il registro destinazione', feedback: 'La scrittura avviene sul fronte di salita.' },
          { id: 'c', text: 'Si aggiorna il PC', feedback: 'Anche il PC si aggiorna sul fronte di salita.' },
          { id: 'd', text: 'Si preleva l’istruzione', feedback: 'Il fetch avviene nella fase alta.' },
        ],
        correct: 'a',
        explanation: 'Poi, nella fase bassa, la ALU esegue.',
        hint: 'Metà ciclo.',
        learnRef: 'temporizzazione',
      },
      {
        kind: 'choice',
        id: 'q06-latenza',
        prompt: 'Che cosa determina la durata minima del periodo di clock in questo processore?',
        options: [
          { id: 'a', text: 'La somma delle latenze lungo il percorso dei segnali tra due elementi di stato', feedback: 'Esatto: il segnale deve arrivare entro un periodo.' },
          { id: 'b', text: 'Il numero di registri', feedback: 'Conta il tempo di propagazione.' },
          { id: 'c', text: 'Il numero di istruzioni del programma', feedback: 'Il periodo non dipende dal programma.' },
          { id: 'd', text: 'Solo la latenza della ALU', feedback: 'Contano tutti i componenti attraversati.' },
        ],
        correct: 'a',
        explanation: 'Per esempio 250 ps: ogni componente aggiunge la sua latenza.',
        hint: 'Propagazione.',
        learnRef: 'clock',
      },
    ],
  },

  /* ═════════════ CHALLENGE ═════════════ */
  challenge: {
    intro: 'Sei scenari nuovi sul data path. Nessun suggerimento e una sola risposta per domanda: l’esito e le spiegazioni compaiono alla fine. È facoltativa.',
    questions: [
      {
        kind: 'choice',
        id: 'c06-guasto-alusrc',
        prompt: 'Per un guasto ALUSrc resta sempre a 0. Quale istruzione smette di funzionare correttamente?',
        options: [
          { id: 'a', text: 'lw (e sw): l’indirizzo verrebbe calcolato con il registro 2 invece che con l’immediato', feedback: 'Esatto.' },
          { id: 'b', text: 'add', feedback: 'add usa già ALUSrc = 0.' },
          { id: 'c', text: 'beq', feedback: 'beq usa già ALUSrc = 0.' },
          { id: 'd', text: 'Nessuna', feedback: 'Load e store hanno bisogno dell’immediato.' },
        ],
        correct: 'a',
        explanation: 'Solo load e store hanno ALUSrc = 1.',
        learnRef: 'multiplexer',
      },
      {
        kind: 'choice',
        id: 'c06-guasto-memtoreg',
        prompt: 'Per un guasto MemtoReg resta sempre a 1. Che cosa succede a un add?',
        options: [
          { id: 'a', text: 'Nel registro destinazione finisce il valore uscito dalla memoria dati invece del risultato della ALU', feedback: 'Esatto.' },
          { id: 'b', text: 'Nulla: add non usa MemtoReg', feedback: 'add scrive un registro: il MUX MemtoReg sceglie che cosa.' },
          { id: 'c', text: 'Il PC salta', feedback: 'MemtoReg non riguarda il PC.' },
          { id: 'd', text: 'La memoria viene scritta', feedback: 'La scrittura in memoria dipende da MemWrite.' },
        ],
        correct: 'a',
        explanation: 'Per add RegWrite = 1, quindi il valore scelto dal MUX viene davvero scritto.',
        learnRef: 'multiplexer',
      },
      {
        kind: 'choice',
        id: 'c06-guasto-sw',
        prompt: 'Lo stesso guasto (MemtoReg sempre a 1) causa problemi a sw?',
        options: [
          { id: 'a', text: 'No: per sw RegWrite = 0, quindi il valore scelto dal MUX non viene scritto', feedback: 'Esatto: per sw MemtoReg è indifferente.' },
          { id: 'b', text: 'Sì: sw scriverebbe nel registro sbagliato', feedback: 'sw non scrive registri.' },
          { id: 'c', text: 'Sì: sw leggerebbe la memoria invece di scriverla', feedback: 'Lettura e scrittura dipendono da MemRead e MemWrite.' },
          { id: 'd', text: 'Sì: l’indirizzo sarebbe sbagliato', feedback: 'L’indirizzo esce dalla ALU, prima del MUX MemtoReg.' },
        ],
        correct: 'a',
        explanation: 'Lo stesso vale per beq.',
        learnRef: 'flussi',
      },
      {
        kind: 'choice',
        id: 'c06-and-unita',
        prompt: 'Quali unità del data path NON servono a un’istruzione and?',
        options: [
          { id: 'a', text: 'Memoria dati ed estensione del segno', feedback: 'Esatto: and lavora solo su registri.' },
          { id: 'b', text: 'Register file e ALU', feedback: 'and legge due registri e usa la ALU.' },
          { id: 'c', text: 'Memoria istruzioni e PC', feedback: 'Ogni istruzione passa dal fetch.' },
          { id: 'd', text: 'Sommatore PC + 4', feedback: 'Senza salto il PC avanza di 4.' },
        ],
        correct: 'a',
        explanation: 'Nessun immediato e nessun accesso alla memoria dati.',
        learnRef: 'flussi',
      },
      {
        kind: 'choice',
        id: 'c06-offset',
        prompt: 'Un beq ha nel campo offset il valore 6. Di quanti byte si sposta il PC se il salto è preso?',
        options: [
          { id: 'a', text: '12', feedback: 'Esatto: l’offset è shiftato di un bit a sinistra (× 2).' },
          { id: 'b', text: '6', feedback: 'L’offset codifica half-word, non byte.' },
          { id: 'c', text: '24', feedback: 'Sarebbe uno shift di due bit.' },
          { id: 'd', text: '10', feedback: 'Il PC non va a 6 + 4.' },
        ],
        correct: 'a',
        explanation: 'Il bit meno significativo è sempre 0 e non viene memorizzato.',
        learnRef: 'componenti-esecuzione',
      },
      {
        kind: 'choice',
        id: 'c06-stesso-registro',
        prompt: 'add x5, x5, x6 legge e scrive x5 nello stesso ciclo. Perché non c’è un conflitto?',
        options: [
          { id: 'a', text: 'Perché la lettura avviene durante il ciclo e la scrittura solo al fronte di salita successivo', feedback: 'Esatto: logica combinatoria ed elemento di stato sono separati da un fronte.' },
          { id: 'b', text: 'Perché il register file ha due porte di scrittura', feedback: 'Ne ha una sola.' },
          { id: 'c', text: 'Perché x5 viene copiato in memoria prima', feedback: 'Non serve: basta il clock.' },
          { id: 'd', text: 'Perché c’è un conflitto, e l’istruzione non è valida', feedback: 'È un’istruzione valida.' },
        ],
        correct: 'a',
        explanation: 'Edge-triggered: nessuna retroazione all’interno dello stesso ciclo.',
        learnRef: 'clock',
      },
    ],
  },
};
