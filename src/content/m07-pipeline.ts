import type { ModuleContent } from './types';

/*
 * MODULO 07 — Pipeline
 * Fonti: lezione 11 «La pipeline», 12 «Pipeline: hazard sui dati», 13 «Pipeline: hazard sul controllo».
 * I simulatori della pipeline e del predittore sono in sim/pipeline.ts e sim/predictor.ts, verificati dai test.
 * Il Quiz non ripete la Practice: stessi concetti chiesti al contrario o in casi nuovi.
 */

export const m07: ModuleContent = {
  moduleId: 'pipeline',

  /* ═════════════ LEARN ═════════════ */
  learn: [
    {
      id: 'concetto',
      title: 'L’idea: sovrapporre le istruzioni',
      slides: 'lezione 11, slide 3–10',
      blocks: [
        {
          type: 'p',
          text: 'La pipeline è una tecnica adottata dalla quasi totalità dei calcolatori moderni: sovrappone l’esecuzione di più istruzioni. L’analogia è il bucato, con quattro fasi (lavare, asciugare, stirare, riporre). Senza pipeline si finisce un carico prima di iniziare il successivo; con la pipeline, mentre il primo carico è nell’asciugatrice, il secondo è già in lavatrice, e ogni fase resta sempre attiva.',
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Throughput, non latenza',
          text: 'La pipeline non riduce il tempo per completare un singolo carico (o una singola istruzione). Aumenta il throughput: la quantità di lavoro completata per unità di tempo. Con molti carichi, se ne finiscono di più nello stesso tempo.',
        },
        {
          type: 'p',
          text: 'In teoria il miglioramento è proporzionale al numero di stadi: tempo tra due istruzioni con pipeline = tempo tra due istruzioni senza pipeline / numero di stadi. Con 5 stadi perfettamente bilanciati, circa un quinto.',
        },
        {
          type: 'list',
          items: [
            'Gli stadi dovrebbero durare tutti uno stesso tempo; se uno è più lungo (la stiratura) crea un collo di bottiglia e rallenta tutto.',
            'Il ciclo di clock deve adattarsi allo stadio più lento, quindi può essere più lungo di quanto servirebbe.',
            'Latenze aggiuntive e problemi di sincronizzazione fanno sì che il guadagno non sia lineare. Su milioni di istruzioni resta comunque significativo.',
          ],
        },
      ],
      keyPoints: ['Pipeline = sovrapposizione', 'Aumenta il throughput, non riduce la latenza della singola istruzione', 'Speedup ideale = numero di stadi', 'Lo stadio più lento detta il clock'],
      checkId: 'p07-throughput',
    },
    {
      id: 'stadi',
      title: 'I 5 stadi e perché RISC-V è adatto alla pipeline',
      slides: 'lezione 11, slide 6, 11–13',
      blocks: [
        {
          type: 'list',
          items: [
            'IF: fetch dell’istruzione dalla memoria;',
            'ID: decodifica e lettura dei registri;',
            'EX: esecuzione dell’operazione o calcolo dell’indirizzo;',
            'MEM: accesso alla memoria dati, se serve;',
            'WB: scrittura del risultato nel registro.',
          ],
        },
        { type: 'p', text: 'Il set di istruzioni RISC-V è stato progettato per la pipeline:' },
        {
          type: 'list',
          items: [
            'tutte le istruzioni hanno lunghezza fissa: fetch e decodifica sono semplici. Con lunghezze variabili (x86) la pipeline è molto più complessa: i processori x86 moderni traducono le istruzioni in microistruzioni simili a quelle RISC;',
            'pochi formati, e i registri sorgente sono sempre nelle stesse posizioni: decodifica più semplice e veloce;',
            'solo load e store accedono alla memoria: il calcolo dell’indirizzo (EX) è separato dall’accesso (MEM). Con operandi in memoria (x86) servirebbero pipeline più lunghe.',
          ],
        },
      ],
      keyPoints: ['IF, ID, EX, MEM, WB', 'Lunghezza fissa', 'Registri sorgente sempre nella stessa posizione', 'Solo load/store accedono alla memoria'],
      checkId: 'p07-ordina-stadi',
    },
    {
      id: 'hazard',
      title: 'Hazard: strutturali, sui dati, sul controllo',
      slides: 'lezione 11, slide 14–27',
      blocks: [
        {
          type: 'p',
          text: 'In una pipeline ideale a ogni ciclo entra una nuova istruzione. A volte però l’istruzione successiva non può procedere nel ciclo seguente: la pipeline rallenta o inserisce cicli di attesa (stalli o bolle). Queste situazioni sono gli hazard (criticità): nascono da dipendenze tra istruzioni, conflitti sulle risorse o problemi nel controllo del flusso.',
        },
        {
          type: 'list',
          items: [
            'Hazard strutturali: mancano risorse hardware per eseguire insieme ciò che la pipeline richiede (una sola macchina per lavare e asciugare). RISC-V li evita facilmente, per esempio con memorie istruzioni e dati separate: IF e MEM non si contendono la stessa memoria.',
            'Hazard sui dati: un’istruzione ha bisogno di un dato che una precedente non ha ancora prodotto.',
            'Hazard sul controllo (branch hazard): non si sa quale istruzione prelevare finché l’esito del salto non è noto. Sono critici perché i salti sono frequentissimi.',
          ],
        },
        {
          type: 'code',
          caption: 'I tre tipi di hazard sui dati (non spiegati nel libro, ma in programma)',
          code: `RAW  Read After Write   leggere un registro non ancora aggiornato
                        dalla precedente. Non si elimina: si può
                        mettere una «pezza» hardware (propagazione)
WAR  Write After Read   scrivere un registro che una precedente sta
                        ancora leggendo. Si risolve con registri nascosti
WAW  Write After Write  due scritture nello stesso registro devono
                        avvenire nell’ordine del codice. Registri nascosti`,
        },
        {
          type: 'p',
          text: 'Nella pipeline a 5 stadi il problema è il RAW: add x5, x1, x2 scrive x5 solo in WB, ma sub x6, x5, x3 lo vorrebbe già in EX. Senza aiuti servono stalli; con la propagazione (bypass) il risultato passa direttamente dalla fine di EX dell’add all’EX della sub. Non tutto si risolve così: dopo una lw il dato esiste solo alla fine di MEM, e se l’istruzione successiva lo usa serve comunque una bolla.',
        },
        {
          type: 'callout',
          tone: 'warn',
          title: 'Tre bolle o due?',
          text: 'La lezione 11 conta 3 bolle tra add e sub senza propagazione, perché suppone che ID legga i registri all’inizio del ciclo e WB scriva alla fine. La lezione 12 adotta l’implementazione comune in cui la scrittura avviene prima della lettura nello stesso ciclo: allora ID può leggere il valore scritto da WB e le bolle sono 2. Il simulatore usa questa seconda convenzione.',
        },
      ],
      keyPoints: ['Strutturali, sui dati, sul controllo', 'RAW, WAR, WAW', 'Propagazione = bypass', 'Load-use: una bolla anche con propagazione'],
      checkId: 'p07-match-hazard',
    },
    {
      id: 'registri-pipeline',
      title: 'I registri di pipeline',
      slides: 'lezione 11, slide 29–45',
      blocks: [
        {
          type: 'p',
          text: 'Con la pipeline ogni stadio lavora su un’istruzione diversa: i dati prodotti da uno stadio vanno conservati per lo stadio successivo. Lo fanno i registri di pipeline, uno tra ogni coppia di stadi adiacenti, che prende il nome dai due stadi: con 5 stadi ne servono 4.',
        },
        {
          type: 'list',
          items: [
            'IF/ID: l’istruzione prelevata e il valore del PC (serve in caso di branch);',
            'ID/EX: i valori letti dai registri, l’immediato esteso a 32 bit, il PC, il numero del registro destinazione;',
            'EX/MEM: il risultato della ALU (o l’indirizzo calcolato), il dato da scrivere per una store;',
            'MEM/WB: il dato da scrivere nel registro (risultato o dato letto dalla memoria).',
          ],
        },
        {
          type: 'p',
          text: 'Dopo WB non serve un registro: in WB si completano le modifiche allo stato del processore. Nel data path i dati vanno da sinistra a destra, con due eccezioni: la scrittura del risultato nel register file (rischio di hazard sui dati) e l’aggiornamento del PC (rischio di hazard sul controllo).',
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Il registro destinazione viaggia con l’istruzione',
          text: 'Nella lw il numero del registro destinazione viene copiato da ID/EX a EX/MEM e poi a MEM/WB: in WB serve sapere dove scrivere. Senza questo trasporto l’informazione andrebbe persa. In generale: ogni unità funzionale si usa in un solo stadio per ciclo, e alcuni segnali vanno trasportati anche negli stadi che non li usano.',
        },
      ],
      keyPoints: ['4 registri: IF/ID, ID/EX, EX/MEM, MEM/WB', 'Nessun registro dopo WB', 'Il numero di rd viene trasportato fino a WB'],
      checkId: 'p07-match-registri',
    },
    {
      id: 'controllo-pipeline',
      title: 'I segnali di controllo nella pipeline',
      slides: 'lezione 11, slide 50–64',
      blocks: [
        {
          type: 'p',
          text: 'I segnali sono gli stessi 7 del processore a ciclo singolo, ma vanno attivati nel momento giusto, perché più istruzioni sono contemporaneamente in stadi diversi. L’unità di controllo genera i segnali in ID e questi viaggiano nei registri di pipeline insieme all’istruzione.',
        },
        {
          type: 'code',
          caption: 'Dove si usa ogni segnale',
          code: `IF   nessun segnale: lettura istruzione e aggiornamento PC sempre attivi
ID   nessun segnale: si fanno sempre le stesse operazioni
EX   ALUOp, ALUSrc
MEM  Branch, MemRead, MemWrite
WB   MemtoReg, RegWrite`,
        },
        {
          type: 'p',
          text: 'I registri di pipeline vengono estesi con tre gruppi di segnali: EX (ALUOp, ALUSrc), M (Branch, MemRead, MemWrite) e WB (MemtoReg, RegWrite). In ID/EX ci sono tutti e tre; i segnali EX si usano in EX e non vengono propagati; in EX/MEM restano M e WB; in MEM/WB resta solo WB.',
        },
      ],
      keyPoints: ['Stessi 7 segnali', 'EX: ALUOp, ALUSrc', 'M: Branch, MemRead, MemWrite', 'WB: MemtoReg, RegWrite'],
      checkId: 'p07-match-segnali',
    },
    {
      id: 'diagrammi',
      title: 'Diagrammi della pipeline',
      slides: 'lezione 11, slide 46–49; lezione 12',
      blocks: [
        {
          type: 'p',
          text: 'Per capire una pipeline si usano due tipi di diagrammi. Quelli su più cicli di clock sono più semplici: il tempo scorre da sinistra a destra, le istruzioni dall’alto in basso, e ogni stadio è un rettangolo (o il simbolo dell’unità funzionale) nel ciclo giusto. Quelli a singolo ciclo mostrano lo stato di tutto il data path in un ciclo, con le istruzioni come etichette sopra gli stadi; si usano in sequenza per seguire più cicli.',
        },
        {
          type: 'p',
          text: 'Qui sotto un diagramma multi-ciclo calcolato sulle sequenze delle lezioni. Attiva e disattiva la propagazione e osserva dove compaiono le bolle.',
        },
        { type: 'diagram', diagram: 'pipeline' },
      ],
      keyPoints: ['Multi-ciclo: tempo → destra, istruzioni ↓', 'Singolo ciclo: istantanea del data path'],
      checkId: 'p07-cicli',
    },
    {
      id: 'propagazione',
      title: 'L’unità di propagazione',
      slides: 'lezione 12, slide 3–25',
      blocks: [
        {
          type: 'code',
          caption: 'L’esempio della lezione',
          code: `sub x2, x1, x3      # scrive x2
and x12, x2, x5     # rs1 dipende da sub
or  x13, x6, x2     # rs2 dipende da sub
add x14, x2, x2     # entrambi
sw  x15, 100(x2)    # registro base`,
        },
        {
          type: 'p',
          text: 'x2 è stabile nel register file solo dopo il WB della sub (ciclo 5). Se la scrittura avviene prima della lettura nello stesso ciclo, add (che fa ID al ciclo 5) e sw leggono già il valore giusto. Restano and e or: a loro il valore serve in EX, all’ingresso della ALU, e si può prendere dai registri di pipeline.',
        },
        {
          type: 'code',
          caption: 'Condizioni per propagare',
          code: `1a. EX/MEM.RegistroRd = ID/EX.RegistroRs1
1b. EX/MEM.RegistroRd = ID/EX.RegistroRs2
2a. MEM/WB.RegistroRd = ID/EX.RegistroRs1
2b. MEM/WB.RegistroRd = ID/EX.RegistroRs2
… e inoltre RegWrite = 1 e RegistroRd ≠ x0

PropagaA / PropagaB:  00 = da ID/EX (register file)
                      10 = da EX/MEM
                      01 = da MEM/WB`,
        },
        {
          type: 'p',
          text: 'La condizione RegWrite = 1 evita di propagare da istruzioni che non scrivono registri; Rd ≠ x0 evita di propagare un valore verso x0, che vale sempre 0. Le linee di propagazione partono dai registri di pipeline, non dalle unità funzionali. L’unità di propagazione sta nello stadio EX e comanda i due multiplexer davanti alla ALU.',
        },
        {
          type: 'callout',
          tone: 'warn',
          title: 'Priorità al risultato più recente',
          text: 'In x0 = x0 + x2; x0 = x0 + x3; x0 = x0 + x4 (somma di un vettore) la terza istruzione potrebbe prendere il registro sia da EX/MEM sia da MEM/WB. Il valore giusto è il più recente, quello dell’istruzione 2: la condizione per MEM/WB include «and not (condizione EX/MEM)», così EX/MEM ha la priorità.',
        },
      ],
      keyPoints: ['Il valore serve in EX', 'Sorgenti: EX/MEM (10), MEM/WB (01), register file (00)', 'Solo se RegWrite e Rd ≠ x0', 'Priorità a EX/MEM'],
      checkId: 'p07-codice-propaga',
    },
    {
      id: 'stalli',
      title: 'Stalli: load-use e il caso load-store',
      slides: 'lezione 12, slide 26–44',
      blocks: [
        {
          type: 'p',
          text: 'Con lw x2, 20(x1) seguita da and x4, x2, x5 il dato esiste solo dopo MEM: quando and è in EX (ciclo 4), la memoria non l’ha ancora letto. Non c’è propagazione possibile: serve uno stallo. Lo si rileva alla fine di ID, con un’unità di rilevamento degli hazard nello stadio ID:',
        },
        {
          type: 'code',
          caption: 'Condizione di stallo (load-use)',
          code: `if (ID/EX.MemRead and
    ((ID/EX.RegistroRd == IF/ID.RegistroRs1) or
     (ID/EX.RegistroRd == IF/ID.RegistroRs2)))
    metti in stallo la pipeline`,
        },
        {
          type: 'list',
          items: [
            'si inserisce una bolla: l’istruzione in ID diventa una nop, azzerando tutti i segnali di controllo di EX, MEM e WB (non modificherà memoria né register file);',
            'si impedisce al PC di avanzare: IF preleva di nuovo la stessa istruzione (or) e ID decodifica di nuovo and;',
            'dopo lo stallo le dipendenze rimaste si risolvono con la propagazione.',
          ],
        },
        {
          type: 'p',
          text: 'Caso speciale lw x2, 20(x1) → sw x2, 0(x3): la sw ha bisogno del dato solo in MEM (è il valore da scrivere). Il dato letto dalla lw è in MEM/WB proprio in quel momento: un’unità nello stadio MEM lo propaga (MEM/WB → MEM) e non serve stallo. Se invece il registro caricato è la base dell’indirizzo (lw x2… → sw x3, 0(x2)), l’indirizzo va calcolato in EX: serve uno stallo.',
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Una soluzione possibile',
          text: 'Il libro lascia al lettore i casi lw → sw. Le slide propongono questa soluzione, avvertendo che è una delle possibili.',
        },
      ],
      keyPoints: ['Load-use: stallo di 1 ciclo', 'Rilevamento in ID con ID/EX.MemRead', 'Bolla = segnali a 0 + PC fermo', 'lw → sw sul valore: propagazione MEM/WB → MEM'],
      checkId: 'p07-load-use',
    },
    {
      id: 'controllo',
      title: 'Hazard sul controllo: flush e decisione anticipata',
      slides: 'lezione 13, slide 3–30',
      blocks: [
        {
          type: 'p',
          text: 'Nell’architettura vista finora l’esito di beq si conosce solo alla fine di MEM, dove si compone PCSrc. Mettere in stallo costerebbe 3 cicli per ogni salto. In alternativa si suppone che il salto non sia preso: si continuano a prelevare le istruzioni successive. Se poi il salto va fatto, le tre istruzioni in IF, ID ed EX vengono scartate (flush) azzerando i registri di pipeline e neutralizzando i segnali di controllo, giusto in tempo per non modificare memoria o register file.',
        },
        {
          type: 'p',
          text: 'Se i salti non sono presi almeno nella metà dei casi, questa scelta dimezza il costo degli hazard sul controllo. Per ridurlo ancora si anticipa la decisione nello stadio ID:',
        },
        {
          type: 'list',
          items: [
            'indirizzo di destinazione: PC e immediato sono già in IF/ID, basta spostare il sommatore da EX a ID (lo si calcola per tutte le istruzioni, lo si usa solo quando serve);',
            'condizione: per l’uguaglianza non serve una ALU, basta uno XOR bit a bit dei due registri seguito da un OR di tutte le uscite: se l’OR dà 0, sono uguali;',
            'con il salto preso si scarta una sola istruzione: un nuovo segnale IF.Flush azzera IF/ID e la trasforma in nop. Si perde 1 ciclo invece di 3.',
          ],
        },
        {
          type: 'code',
          caption: 'Nuovi hazard sui dati con il confronto in ID',
          code: `istruzione ALU subito prima del beq          → 1 ciclo di stallo
load subito prima del beq                    → 2 cicli di stallo
load due istruzioni prima del beq            → 1 ciclo di stallo`,
        },
        {
          type: 'p',
          text: 'Leggere i registri in ID invece che in EX crea nuove dipendenze: il risultato di un’istruzione ALU è pronto alla fine di EX, ma il beq lo vuole all’inizio di ID. L’unità di rilevamento degli hazard aggiunge queste condizioni, e una nuova logica di propagazione (codici 00 da IF/ID, 10 da EX/MEM, 01 da MEM/WB) alimenta l’unità di confronto.',
        },
      ],
      keyPoints: ['Decisione in MEM: 3 istruzioni da scartare', 'Predire «non preso» + flush', 'Decisione in ID (XOR + OR): 1 ciclo perso', 'Nuovi stalli: ALU→beq 1, lw→beq 2'],
      checkId: 'p07-xor',
    },
    {
      id: 'predizione',
      title: 'Predizione dei salti',
      slides: 'lezione 13, slide 31–52',
      blocks: [
        {
          type: 'p',
          text: 'Supporre sempre «salto non preso» è una predizione statica e ingenua. Nelle architetture moderne, con più di 5 stadi, una predizione errata costa ancora di più e i salti sono frequentissimi: le tecniche dei produttori sono segreti industriali. Le basi sono note:',
        },
        {
          type: 'list',
          items: [
            'Predizione a 1 bit: una tabella (buffer indicizzato dall’indirizzo del salto, letto in IF) ricorda l’esito dell’ultima esecuzione (1 preso, 0 non preso). La prima volta si usa un’euristica: salto in avanti → non preso (di solito errore o uscita da un ciclo), salto all’indietro → preso (ripetizione di un ciclo). Limite: in un ciclo sbaglia all’uscita e di nuovo alla prima iterazione dell’esecuzione successiva.',
            'Predizione a 2 bit: una macchina a stati finiti con 4 stati (00 fortemente non preso, 01 debolmente non preso, 10 debolmente preso, 11 fortemente preso). Il bit più significativo è la predizione, quello meno significativo la «forza»; lo stato cambia di un passo alla volta, quindi serve sbagliare due volte per cambiare predizione. Su un ciclo rieseguito sbaglia una volta per esecuzione invece di due.',
            'Predittori correlati: considerano che i salti non sono indipendenti (if (a > b) … if (a > c) …). Usano un Branch History Register (registro a scorrimento con gli esiti degli ultimi salti, 1 preso / 0 non preso) che indicizza una Pattern History Table di predittori a 2 bit: «quando gli ultimi salti hanno seguito questo pattern, che cosa succede di solito dopo?».',
          ],
        },
        { type: 'diagram', diagram: 'predizione' },
        {
          type: 'callout',
          tone: 'info',
          title: 'Prova',
          text: 'Con 3 iterazioni e stato iniziale 00 il predittore a 2 bit sbaglia tutte e tre le volte: «va peggio». Il vantaggio compare quando il ciclo viene rieseguito: scegli 2 o 3 esecuzioni e confronta gli errori della seconda esecuzione.',
        },
      ],
      keyPoints: ['1 bit: ricorda l’ultimo esito', 'Euristica: indietro preso, avanti non preso', '2 bit: 4 stati, cambia con due errori', 'Correlati: BHR + PHT'],
      checkId: 'p07-2bit',
    },
  ],

  /* ═════════════ PRACTICE ═════════════ */
  practice: [
    {
      kind: 'choice',
      id: 'p07-throughput',
      prompt: 'Che cosa migliora la pipeline?',
      options: [
        { id: 'a', text: 'Il throughput: più istruzioni completate per unità di tempo', feedback: 'Esatto.' },
        { id: 'b', text: 'Il tempo di esecuzione della singola istruzione', feedback: 'La latenza della singola istruzione non si riduce (anzi, può crescere).' },
        { id: 'c', text: 'Il numero di registri', feedback: 'I registri dell’architettura restano 32.' },
        { id: 'd', text: 'La dimensione della memoria', feedback: 'Non c’entra con la memoria.' },
      ],
      correct: 'a',
      explanation: 'Come nel bucato: un carico dura uguale, ma se ne finiscono di più.',
      hint: 'Pensa a 20 carichi di bucato.',
      learnRef: 'concetto',
    },
    {
      kind: 'choice',
      id: 'p07-speedup',
      prompt: 'Secondo la formula teorica, con 5 stadi perfettamente bilanciati il tempo tra due istruzioni diventa…',
      options: [
        { id: 'a', text: 'Circa un quinto di quello senza pipeline', feedback: 'Esatto: tempo senza pipeline / numero di stadi.' },
        { id: 'b', text: '5 volte più lungo', feedback: 'È il contrario.' },
        { id: 'c', text: 'Uguale', feedback: 'Il throughput migliora.' },
        { id: 'd', text: 'La metà, qualunque sia il numero di stadi', feedback: 'Il guadagno teorico dipende dal numero di stadi.' },
      ],
      correct: 'a',
      explanation: 'In pratica il guadagno è minore: stadi sbilanciati, latenze aggiuntive, hazard.',
      hint: 'Divide per il numero di stadi.',
      learnRef: 'concetto',
    },
    {
      kind: 'order',
      id: 'p07-ordina-stadi',
      prompt: 'Riordina i 5 stadi della pipeline RISC-V.',
      items: [
        { id: 'if', text: 'IF — fetch dell’istruzione' },
        { id: 'id', text: 'ID — decodifica e lettura dei registri' },
        { id: 'ex', text: 'EX — esecuzione o calcolo dell’indirizzo' },
        { id: 'mem', text: 'MEM — accesso alla memoria dati' },
        { id: 'wb', text: 'WB — scrittura del risultato nel registro' },
      ],
      explanation: 'Tra stadi adiacenti stanno i 4 registri di pipeline.',
      hint: 'L’ultimo scrive nel register file.',
      learnRef: 'stadi',
    },
    {
      kind: 'choice',
      id: 'p07-riscv-adatto',
      prompt: 'Quale caratteristica di RISC-V NON è tra quelle che lo rendono adatto alla pipeline?',
      options: [
        { id: 'a', text: 'Le istruzioni possono avere operandi direttamente in memoria', feedback: 'Esatto: è il contrario, solo load e store accedono alla memoria.' },
        { id: 'b', text: 'Tutte le istruzioni hanno la stessa lunghezza', feedback: 'È una delle caratteristiche.' },
        { id: 'c', text: 'I registri sorgente sono sempre nelle stesse posizioni', feedback: 'È una delle caratteristiche.' },
        { id: 'd', text: 'Solo load e store accedono alla memoria', feedback: 'È una delle caratteristiche.' },
      ],
      correct: 'a',
      explanation: 'Gli operandi in memoria (come in x86) richiederebbero pipeline più lunghe.',
      hint: 'Modello load-store.',
      learnRef: 'stadi',
    },
    {
      kind: 'match',
      id: 'p07-match-hazard',
      prompt: 'Abbina ogni categoria di hazard alla sua causa.',
      pairs: [
        { id: 'str', left: 'Strutturale', right: 'Due stadi vogliono la stessa risorsa hardware nello stesso ciclo', feedback: 'Come usare una sola macchina per lavare e asciugare.' },
        { id: 'dati', left: 'Sui dati', right: 'Un’istruzione usa un dato non ancora prodotto da una precedente', feedback: 'Il caso tipico è RAW.' },
        { id: 'ctrl', left: 'Sul controllo', right: 'Non si sa ancora quale istruzione prelevare dopo un salto', feedback: 'Detto anche branch hazard.' },
      ],
      explanation: 'RISC-V evita gli strutturali separando memoria istruzioni e memoria dati.',
      hint: 'Risorse, dati, flusso.',
      learnRef: 'hazard',
    },
    {
      kind: 'match',
      id: 'p07-match-raw',
      prompt: 'Abbina ogni hazard sui dati alla sua descrizione.',
      pairs: [
        { id: 'raw', left: 'RAW', right: 'Leggere un registro che una precedente non ha ancora scritto', feedback: 'Si mitiga con la propagazione.' },
        { id: 'war', left: 'WAR', right: 'Scrivere un registro che una precedente sta ancora leggendo', feedback: 'Registri nascosti.' },
        { id: 'waw', left: 'WAW', right: 'Due scritture nello stesso registro da fare nell’ordine del codice', feedback: 'Registri nascosti.' },
      ],
      explanation: 'Read After Write, Write After Read, Write After Write.',
      hint: 'Leggi la sigla al contrario: RAW = lettura dopo scrittura.',
      learnRef: 'hazard',
    },
    {
      kind: 'match',
      id: 'p07-match-registri',
      prompt: 'Abbina ogni registro di pipeline a ciò che conserva.',
      pairs: [
        { id: 'ifid', left: 'IF/ID', right: 'L’istruzione prelevata e il valore del PC', feedback: 'Il PC serve in caso di salto.' },
        { id: 'idex', left: 'ID/EX', right: 'I valori dei registri letti e l’immediato esteso', feedback: 'Pronti per la ALU.' },
        { id: 'exmem', left: 'EX/MEM', right: 'Il risultato della ALU o l’indirizzo calcolato', feedback: 'Per la memoria o per WB.' },
        { id: 'memwb', left: 'MEM/WB', right: 'Il dato da scrivere nel registro destinazione', feedback: 'Risultato o dato letto dalla memoria.' },
      ],
      explanation: 'Non c’è un registro dopo WB.',
      hint: 'Il nome indica i due stadi che separa.',
      learnRef: 'registri-pipeline',
    },
    {
      kind: 'match',
      id: 'p07-match-segnali',
      prompt: 'Abbina ogni stadio ai segnali di controllo che usa.',
      pairs: [
        { id: 'ex', left: 'EX', right: 'ALUOp, ALUSrc', feedback: 'Operazione e secondo operando.' },
        { id: 'mem', left: 'MEM', right: 'Branch, MemRead, MemWrite', feedback: 'Accesso alla memoria e salto.' },
        { id: 'wb', left: 'WB', right: 'MemtoReg, RegWrite', feedback: 'Cosa scrivere e se scrivere.' },
        { id: 'ifid', left: 'IF e ID', right: 'Nessun segnale specifico', feedback: 'Fanno sempre le stesse operazioni.' },
      ],
      explanation: 'Nei registri di pipeline i segnali sono raggruppati in EX, M e WB.',
      hint: 'MemtoReg sceglie che cosa scrivere nel registro.',
      learnRef: 'controllo-pipeline',
    },
    {
      kind: 'choice',
      id: 'p07-cicli',
      prompt: 'Senza hazard, quanti cicli servono per completare 4 istruzioni in una pipeline a 5 stadi?',
      options: [
        { id: 'a', text: '8', feedback: 'Esatto: 5 per la prima, più 1 per ciascuna delle altre 3.' },
        { id: 'b', text: '20', feedback: 'Sarebbe senza pipeline (4 × 5).' },
        { id: 'c', text: '5', feedback: 'L’ultima istruzione entra al ciclo 4 e finisce al ciclo 8.' },
        { id: 'd', text: '9', feedback: 'Ne basta uno in meno.' },
      ],
      correct: 'a',
      explanation: 'In generale: stadi + istruzioni − 1.',
      hint: 'Disegna il diagramma multi-ciclo.',
      learnRef: 'diagrammi',
    },
    {
      kind: 'match',
      id: 'p07-codice-propaga',
      prompt: 'Abbina ogni codice del multiplexer PropagaA alla sorgente del primo operando della ALU.',
      pairs: [
        { id: '00', left: '00', right: 'Register file (da ID/EX): nessuna propagazione', feedback: 'Caso normale.' },
        { id: '10', left: '10', right: 'Registro di pipeline EX/MEM', feedback: 'Risultato dell’istruzione appena precedente.' },
        { id: '01', left: '01', right: 'Registro di pipeline MEM/WB', feedback: 'Risultato di due istruzioni prima, o di una load.' },
      ],
      explanation: 'Gli stessi codici valgono per PropagaB sul secondo operando.',
      hint: '10 = la più vicina.',
      learnRef: 'propagazione',
    },
    {
      kind: 'choice',
      id: 'p07-x0',
      prompt: 'Perché le condizioni di propagazione richiedono RegistroRd ≠ x0?',
      options: [
        { id: 'a', text: 'Perché x0 vale sempre 0: non si deve propagare un valore calcolato per x0', feedback: 'Esatto.' },
        { id: 'b', text: 'Perché x0 non si può leggere', feedback: 'x0 si legge e vale 0.' },
        { id: 'c', text: 'Perché x0 è lo stack pointer', feedback: 'Lo stack pointer è x2.' },
        { id: 'd', text: 'Per dare priorità a EX/MEM', feedback: 'La priorità è un’altra parte della condizione.' },
      ],
      correct: 'a',
      explanation: 'Un’istruzione può avere x0 come destinazione (il risultato viene scartato): chi legge x0 deve trovare 0.',
      hint: 'Che valore ha x0?',
      learnRef: 'propagazione',
    },
    {
      kind: 'choice',
      id: 'p07-load-use',
      prompt: 'lw x2, 20(x1) è seguita da and x4, x2, x5. Che cosa succede con l’unità di propagazione attiva?',
      options: [
        { id: 'a', text: 'Serve comunque una bolla: il dato esiste solo dopo MEM', feedback: 'Esatto: è un load-use hazard.' },
        { id: 'b', text: 'Nessuno stallo: si propaga da EX/MEM', feedback: 'In EX/MEM c’è l’indirizzo, non il dato letto.' },
        { id: 'c', text: 'Servono 3 bolle', feedback: 'Con la propagazione da MEM/WB basta una bolla.' },
        { id: 'd', text: 'L’istruzione and viene scartata', feedback: 'Viene ritardata, non scartata.' },
      ],
      correct: 'a',
      explanation: 'Condizione: ID/EX.MemRead e ID/EX.RegistroRd uguale a uno dei registri sorgente in IF/ID.',
      hint: 'Quando è pronto il dato di una load?',
      learnRef: 'stalli',
    },
    {
      kind: 'choice',
      id: 'p07-xor',
      prompt: 'Come si controlla l’uguaglianza di due registri nello stadio ID senza usare una ALU?',
      options: [
        { id: 'a', text: 'XOR bit a bit dei due valori, poi OR di tutte le uscite: 0 significa uguali', feedback: 'Esatto.' },
        { id: 'b', text: 'AND bit a bit, poi NOT', feedback: 'L’AND non rivela le differenze.' },
        { id: 'c', text: 'Sommando i due valori', feedback: 'La somma non dice se sono uguali.' },
        { id: 'd', text: 'Non si può: serve per forza la ALU in EX', feedback: 'Le slide mostrano come farlo in ID.' },
      ],
      correct: 'a',
      explanation: 'Lo XOR di due bit è 1 solo se sono diversi.',
      hint: 'Lo XOR rivela i bit diversi.',
      learnRef: 'controllo',
    },
    {
      kind: 'choice',
      id: 'p07-flush',
      prompt: 'Che cos’è il flush?',
      options: [
        { id: 'a', text: 'Scartare le istruzioni prelevate per errore, azzerando i registri di pipeline e i loro segnali di controllo', feedback: 'Esatto.' },
        { id: 'b', text: 'Svuotare la cache', feedback: 'Qui si parla di pipeline.' },
        { id: 'c', text: 'Propagare un valore da MEM/WB', feedback: 'Questa è la propagazione.' },
        { id: 'd', text: 'Salvare i registri nello stack', feedback: 'Non c’entra.' },
      ],
      correct: 'a',
      explanation: 'Con la decisione in ID si scarta una sola istruzione, tramite IF.Flush.',
      hint: 'Scartare.',
      learnRef: 'controllo',
    },
    {
      kind: 'choice',
      id: 'p07-2bit',
      prompt: 'In un predittore a 2 bit, che cosa indicano i due bit dello stato?',
      options: [
        { id: 'a', text: 'Il bit più significativo la predizione, il meno significativo la sua «forza»', feedback: 'Esatto.' },
        { id: 'b', text: 'Gli esiti degli ultimi due salti diversi', feedback: 'Questo assomiglia a un Branch History Register.' },
        { id: 'c', text: 'L’indirizzo del salto', feedback: 'L’indirizzo serve a indicizzare la tabella.' },
        { id: 'd', text: 'Il numero di errori fatti', feedback: 'Non conta gli errori.' },
      ],
      correct: 'a',
      explanation: '00 e 01 predicono «non preso», 10 e 11 «preso».',
      hint: 'Fortemente / debolmente.',
      learnRef: 'predizione',
    },
  ],

  /* ═════════════ QUIZ ═════════════ */
  quiz: {
    intro: 'Dieci domande nuove rispetto alla Practice: parti dalla definizione, dalla condizione o dal diagramma e risali al concetto. Il quiz è superato con almeno il 60%.',
    questions: [
      {
        kind: 'choice',
        id: 'q07-def-throughput',
        prompt: '«Quantità di lavoro completata per unità di tempo.» Che cos’è, e che cosa le succede con la pipeline?',
        options: [
          { id: 'a', text: 'Il throughput; aumenta', feedback: 'Esatto.' },
          { id: 'b', text: 'La latenza; diminuisce', feedback: 'La latenza è il tempo della singola istruzione, e non diminuisce.' },
          { id: 'c', text: 'Il periodo di clock; aumenta sempre', feedback: 'Il periodo è un tempo, non una quantità di lavoro.' },
          { id: 'd', text: 'Il throughput; resta uguale', feedback: 'È proprio ciò che la pipeline migliora.' },
        ],
        correct: 'a',
        explanation: 'Più istruzioni in volo contemporaneamente.',
        hint: 'Through-put.',
        learnRef: 'concetto',
      },
      {
        kind: 'choice',
        id: 'q07-def-raw',
        prompt: '«La seconda istruzione legge un registro che la prima deve ancora scrivere.» Che tipo di hazard è?',
        options: [
          { id: 'a', text: 'RAW (Read After Write), hazard sui dati', feedback: 'Esatto.' },
          { id: 'b', text: 'WAR', feedback: 'WAR è scrivere un registro che una precedente legge.' },
          { id: 'c', text: 'Hazard strutturale', feedback: 'Non c’è conflitto su una risorsa hardware.' },
          { id: 'd', text: 'Hazard sul controllo', feedback: 'Non c’è un salto.' },
        ],
        correct: 'a',
        explanation: 'È il caso tipico nella pipeline a 5 stadi.',
        hint: 'Lettura dopo scrittura.',
        learnRef: 'hazard',
      },
      {
        kind: 'choice',
        id: 'q07-da-condizione',
        prompt: 'Che cosa rileva questa condizione?',
        code: `if (ID/EX.MemRead and
    ((ID/EX.RegistroRd == IF/ID.RegistroRs1) or
     (ID/EX.RegistroRd == IF/ID.RegistroRs2)))`,
        options: [
          { id: 'a', text: 'Una load seguita da un’istruzione che usa il registro caricato: serve uno stallo', feedback: 'Esatto: load-use hazard.' },
          { id: 'b', text: 'Un salto da prendere', feedback: 'Non guarda Branch.' },
          { id: 'c', text: 'Una propagazione da EX/MEM', feedback: 'La propagazione confronta EX/MEM o MEM/WB con ID/EX.' },
          { id: 'd', text: 'Un hazard strutturale sulla memoria', feedback: 'MemRead qui identifica una load.' },
        ],
        correct: 'a',
        explanation: 'Si trova nell’unità di rilevamento degli hazard, nello stadio ID.',
        hint: 'MemRead = load.',
        learnRef: 'stalli',
      },
      {
        kind: 'choice',
        id: 'q07-def-bolla',
        prompt: 'Una pipeline azzera i segnali di controllo EX, M e WB dell’istruzione in ID e blocca il PC. Che cosa sta facendo?',
        options: [
          { id: 'a', text: 'Inserisce una bolla (stallo di un ciclo)', feedback: 'Esatto: l’istruzione diventa una nop e verrà ripetuta.' },
          { id: 'b', text: 'Un flush dopo un salto preso', feedback: 'Il flush scarta istruzioni sbagliate, qui l’istruzione viene ritardata.' },
          { id: 'c', text: 'Una propagazione', feedback: 'La propagazione non ferma la pipeline.' },
          { id: 'd', text: 'Una predizione dinamica', feedback: 'Non c’è un salto.' },
        ],
        correct: 'a',
        explanation: 'IF preleverà di nuovo la stessa istruzione e ID la decodificherà di nuovo.',
        hint: 'nop.',
        learnRef: 'stalli',
      },
      {
        kind: 'choice',
        id: 'q07-da-segnali',
        prompt: 'Un registro di pipeline contiene solo il gruppo di segnali WB (MemtoReg, RegWrite). Quale registro è?',
        options: [
          { id: 'a', text: 'MEM/WB', feedback: 'Esatto: EX e M sono già stati usati.' },
          { id: 'b', text: 'ID/EX', feedback: 'ID/EX contiene EX, M e WB.' },
          { id: 'c', text: 'EX/MEM', feedback: 'EX/MEM contiene M e WB.' },
          { id: 'd', text: 'IF/ID', feedback: 'I segnali vengono generati in ID, quindi IF/ID non li contiene.' },
        ],
        correct: 'a',
        explanation: 'I segnali avanzano con l’istruzione e si consumano nello stadio in cui servono.',
        hint: 'Resta solo l’ultimo stadio.',
        learnRef: 'controllo-pipeline',
      },
      {
        kind: 'choice',
        id: 'q07-priorita',
        prompt: 'Sia EX/MEM sia MEM/WB contengono un nuovo valore per lo stesso registro sorgente della ALU. Da dove si propaga, e perché?',
        options: [
          { id: 'a', text: 'Da EX/MEM: è il risultato più recente', feedback: 'Esatto.' },
          { id: 'b', text: 'Da MEM/WB: è il più vecchio, quindi il più sicuro', feedback: 'Serve il valore più recente nell’ordine del programma.' },
          { id: 'c', text: 'Dal register file', feedback: 'Il register file non è ancora aggiornato.' },
          { id: 'd', text: 'Si mette in stallo', feedback: 'Non serve stallo: basta scegliere la sorgente giusta.' },
        ],
        correct: 'a',
        explanation: 'La condizione per MEM/WB contiene «and not (condizione EX/MEM)».',
        hint: 'x0 = x0 + x2; x0 = x0 + x3; x0 = x0 + x4.',
        learnRef: 'propagazione',
      },
      {
        kind: 'choice',
        id: 'q07-lw-sw',
        prompt: 'lw x2, 20(x1) seguita da sw x2, 0(x3) non richiede stalli. Perché?',
        options: [
          { id: 'a', text: 'La sw usa x2 come valore da scrivere, che serve solo in MEM: lo si propaga da MEM/WB', feedback: 'Esatto.' },
          { id: 'b', text: 'Perché le store non leggono registri', feedback: 'Leggono sia la base sia il valore.' },
          { id: 'c', text: 'Perché la lw scrive x2 già in EX', feedback: 'Il dato si legge in MEM.' },
          { id: 'd', text: 'Perché x2 è un registro speciale', feedback: 'Non c’entra il nome del registro.' },
        ],
        correct: 'a',
        explanation: 'Con sw x3, 0(x2) invece x2 serve per l’indirizzo in EX, e lo stallo è necessario.',
        hint: 'In che stadio serve il valore da scrivere?',
        learnRef: 'stalli',
      },
      {
        kind: 'choice',
        id: 'q07-costo-salto',
        prompt: 'Con la decisione sul salto anticipata in ID, quante istruzioni si scartano se il salto è preso?',
        options: [
          { id: 'a', text: 'Una', feedback: 'Esatto: quella in IF, con IF.Flush.' },
          { id: 'b', text: 'Tre', feedback: 'Tre era il costo con la decisione in MEM.' },
          { id: 'c', text: 'Nessuna', feedback: 'L’istruzione dopo il beq è già stata prelevata.' },
          { id: 'd', text: 'Due', feedback: 'Con la decisione in ID basta scartarne una.' },
        ],
        correct: 'a',
        explanation: 'Il prezzo sono nuovi hazard sui dati per il confronto in ID.',
        hint: 'Quante istruzioni sono entrate dopo il beq quando questo è in ID?',
        learnRef: 'controllo',
      },
      {
        kind: 'choice',
        id: 'q07-euristica',
        prompt: 'Un predittore a 1 bit incontra per la prima volta un salto all’indietro. Che cosa predice, e perché?',
        options: [
          { id: 'a', text: 'Preso: di solito un salto all’indietro ripete un ciclo', feedback: 'Esatto.' },
          { id: 'b', text: 'Non preso: è la predizione di default per tutti i salti', feedback: 'L’euristica distingue avanti e indietro.' },
          { id: 'c', text: 'Preso: i salti all’indietro sono sempre errori', feedback: 'La motivazione è sbagliata.' },
          { id: 'd', text: 'Non può predire nulla', feedback: 'Usa l’euristica.' },
        ],
        correct: 'a',
        explanation: 'I salti in avanti si predicono non presi: di solito gestiscono un errore o l’uscita da un ciclo.',
        hint: 'Pensa al bne alla fine di un loop.',
        learnRef: 'predizione',
      },
      {
        kind: 'choice',
        id: 'q07-def-bhr',
        prompt: '«Registro a scorrimento che memorizza gli esiti (1 preso, 0 non preso) degli ultimi salti di tutto il programma.» Come si chiama, e in quale tecnica si usa?',
        options: [
          { id: 'a', text: 'Branch History Register, nei predittori correlati', feedback: 'Esatto: indicizza la Pattern History Table.' },
          { id: 'b', text: 'Pattern History Table, nel predittore a 1 bit', feedback: 'La PHT contiene contatori a 2 bit.' },
          { id: 'c', text: 'Registro IF/ID, nella pipeline', feedback: 'IF/ID contiene istruzione e PC.' },
          { id: 'd', text: 'Program Counter, nella predizione statica', feedback: 'Il PC contiene un indirizzo.' },
        ],
        correct: 'a',
        explanation: 'Esempio: T, T, N, T → 1101.',
        hint: 'History.',
        learnRef: 'predizione',
      },
    ],
  },

  /* ═════════════ CHALLENGE ═════════════ */
  challenge: {
    intro: 'Sette scenari nuovi. Nessun suggerimento e una sola risposta per domanda: l’esito e le spiegazioni compaiono alla fine. È facoltativa.',
    questions: [
      {
        kind: 'choice',
        id: 'c07-cicli-bolle',
        prompt: 'Con propagazione, quanti cicli servono in totale per questa sequenza?',
        code: `lw  x5, 0(x1)
add x6, x5, x2
sub x7, x6, x3`,
        options: [
          { id: 'a', text: '8', feedback: 'Esatto: 3 + 4 = 7 senza hazard, più 1 bolla per il load-use.' },
          { id: 'b', text: '7', feedback: 'lw → add sul registro caricato richiede una bolla.' },
          { id: 'c', text: '9', feedback: 'add → sub si risolve con la propagazione da EX/MEM.' },
          { id: 'd', text: '15', feedback: 'Sarebbe senza pipeline.' },
        ],
        correct: 'a',
        explanation: 'Una sola bolla: tra lw e add.',
        learnRef: 'stalli',
      },
      {
        kind: 'choice',
        id: 'c07-senza-fw',
        prompt: 'Senza propagazione, con la scrittura nel register file prima della lettura nello stesso ciclo, quante bolle servono tra add x5, x1, x2 e sub x6, x5, x3 adiacenti?',
        options: [
          { id: 'a', text: '2', feedback: 'Esatto: la sub può fare ID nello stesso ciclo del WB della add.' },
          { id: 'b', text: '3', feedback: 'Sono 3 se la lettura avviene prima della scrittura (convenzione della lezione 11).' },
          { id: 'c', text: '1', feedback: 'Il dato arriva nel register file solo in WB.' },
          { id: 'd', text: '0', feedback: 'Senza propagazione non basta.' },
        ],
        correct: 'a',
        explanation: 'add: WB al ciclo 5. sub: ID al ciclo 5 → IF al ciclo 4, invece del 2.',
        learnRef: 'hazard',
      },
      {
        kind: 'choice',
        id: 'c07-beq-load',
        prompt: 'Con il confronto anticipato in ID, quanti cicli di stallo servono qui?',
        code: `lw  x1, 0(x2)
beq x4, x1, fine`,
        options: [
          { id: 'a', text: '2', feedback: 'Esatto: il dato è pronto alla fine di MEM, il beq lo vuole all’inizio di ID.' },
          { id: 'b', text: '1', feedback: 'Basterebbe 1 se tra lw e beq ci fosse un’altra istruzione.' },
          { id: 'c', text: '0', feedback: 'Il confronto in ID arriva prima della disponibilità del dato.' },
          { id: 'd', text: '3', feedback: 'Basta attendere fino alla fine di MEM della lw.' },
        ],
        correct: 'a',
        explanation: 'ALU subito prima del beq: 1 ciclo; load subito prima: 2; load due istruzioni prima: 1.',
        learnRef: 'controllo',
      },
      {
        kind: 'choice',
        id: 'c07-1bit-rerun',
        prompt: 'Un ciclo con 10 iterazioni (bne preso 9 volte, poi non preso) viene eseguito più volte. Con un predittore a 1 bit, quanti errori per ogni esecuzione dopo la prima?',
        options: [
          { id: 'a', text: '2: alla prima iterazione e all’uscita', feedback: 'Esatto: dopo l’uscita il bit vale 0, e la prima iterazione successiva sbaglia.' },
          { id: 'b', text: '1: solo all’uscita', feedback: 'Questo è il comportamento del predittore a 2 bit.' },
          { id: 'c', text: '0', feedback: 'L’uscita dal ciclo è sempre una sorpresa per un predittore che ricorda solo l’ultimo esito.' },
          { id: 'd', text: '9', feedback: 'Dalla seconda iterazione il bit vale 1 e la predizione è giusta.' },
        ],
        correct: 'a',
        explanation: 'È il limite che il predittore a 2 bit risolve.',
        learnRef: 'predizione',
      },
      {
        kind: 'choice',
        id: 'c07-2bit-stato',
        prompt: 'Un contatore a 2 bit è in stato 11. Il salto non viene preso, poi viene preso. In che stato finisce, e che cosa predice?',
        options: [
          { id: 'a', text: '11, predice «preso»', feedback: 'Esatto: 11 → 10 → 11; un solo errore non cambia la predizione.' },
          { id: 'b', text: '01, predice «non preso»', feedback: 'Lo stato cambia di un passo alla volta.' },
          { id: 'c', text: '10, predice «preso»', feedback: 'Dopo il salto preso torna a 11.' },
          { id: 'd', text: '00, predice «non preso»', feedback: 'Servirebbero tre salti non presi di fila.' },
        ],
        correct: 'a',
        explanation: 'Contatore a saturazione: +1 se preso, −1 se non preso.',
        learnRef: 'predizione',
      },
      {
        kind: 'choice',
        id: 'c07-propaga-codice',
        prompt: 'Quali valori assumono PropagaA e PropagaB quando l’add è in EX?',
        code: `sub x2, x1, x3
or  x9, x8, x7
add x4, x2, x9`,
        options: [
          { id: 'a', text: 'PropagaA = 01 (x2 da MEM/WB), PropagaB = 10 (x9 da EX/MEM)', feedback: 'Esatto.' },
          { id: 'b', text: 'PropagaA = 10, PropagaB = 01', feedback: 'sub è due istruzioni prima: il suo risultato è in MEM/WB.' },
          { id: 'c', text: 'Entrambi 00', feedback: 'Nessuno dei due valori è ancora nel register file.' },
          { id: 'd', text: 'Serve uno stallo', feedback: 'Nessuna load: tutto si risolve con la propagazione.' },
        ],
        correct: 'a',
        explanation: '10 = istruzione immediatamente precedente (EX/MEM), 01 = due prima (MEM/WB).',
        learnRef: 'propagazione',
      },
      {
        kind: 'choice',
        id: 'c07-strutturale',
        prompt: 'Un processore con pipeline ha una sola memoria per istruzioni e dati. Che problema si presenta quando una lw è in MEM?',
        options: [
          { id: 'a', text: 'Un hazard strutturale: l’istruzione in IF vuole la stessa memoria nello stesso ciclo', feedback: 'Esatto: RISC-V lo evita separando le memorie.' },
          { id: 'b', text: 'Un hazard sui dati RAW', feedback: 'Il conflitto è sulla risorsa, non su un registro.' },
          { id: 'c', text: 'Un hazard sul controllo', feedback: 'Non c’è un salto.' },
          { id: 'd', text: 'Nessuno', feedback: 'IF e MEM accedono alla memoria nello stesso ciclo.' },
        ],
        correct: 'a',
        explanation: 'Come usare una sola macchina per lavare e asciugare.',
        learnRef: 'hazard',
      },
    ],
  },
};
