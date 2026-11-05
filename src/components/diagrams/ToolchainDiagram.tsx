/** Catena di traduzione di un programma C (lezione 2). */
const STEPS = [
  { file: 'main.c', kind: 'sorgente C (testo)', level: 'L5' },
  { tool: 'Preprocessore', cmd: 'macro, #include, compilazione condizionale' },
  { tool: 'Compilatore', cmd: 'gcc -S main.c -o main.s' },
  { file: 'main.s', kind: 'assembly (testo)', level: 'L4' },
  { tool: 'Assemblatore', cmd: 'gcc -c main.s -o main.o' },
  { file: 'main.o', kind: 'file oggetto (binario, non eseguibile)', level: 'L2 parziale' },
  { tool: 'Linker', cmd: 'gcc main.o -o main  (+ altri .o e librerie)' },
  { file: 'main', kind: 'eseguibile (binario completo)', level: 'L2' },
  { tool: 'Loader del sistema operativo', cmd: './main' },
  { file: 'processo', kind: 'programma in esecuzione in memoria', level: 'L3 + L1–L0' },
] as const;

export function ToolchainDiagram() {
  return (
    <ol className="chain" aria-label="Catena di traduzione da main.c al processo">
      {STEPS.map((s, i) =>
        'file' in s ? (
          <li key={i} className="chain-file">
            <span className="chain-name">{s.file}</span>
            <span className="chain-kind">{s.kind}</span>
            <span className="chain-level">{s.level}</span>
          </li>
        ) : (
          <li key={i} className="chain-tool">
            <span className="chain-arrow" aria-hidden="true">
              ↓
            </span>
            <span className="chain-toolname">{s.tool}</span>
            <code className="chain-cmd">{s.cmd}</code>
          </li>
        ),
      )}
    </ol>
  );
}
