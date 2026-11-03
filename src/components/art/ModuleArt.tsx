import type { ModuleIcon } from '../../data/modules';

/*
 * Illustrazioni vettoriali dei moduli: decorative (aria-hidden), disegnate con i colori del tema
 * tramite variabili CSS, così restano leggere e coerenti in tutte le dimensioni.
 */

const C = { line: 'var(--art-line)', glow: 'var(--art-glow)', soft: 'var(--art-soft)', fill: 'var(--art-fill)', text: 'var(--art-text)' };

function Layers() {
  return (
    <g>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <g key={i} transform={`translate(0 ${72 - i * 11})`}>
          <path d="M60 4 100 22 60 40 20 22Z" fill={C.fill} stroke={i === 5 ? C.glow : C.line} strokeWidth={i === 5 ? 1.6 : 1} opacity={0.5 + i * 0.1} />
        </g>
      ))}
      <text x="106" y="98" fill={C.text} fontSize="8" fontFamily="var(--font-mono)">L0</text>
      <text x="106" y="44" fill={C.glow} fontSize="8" fontFamily="var(--font-mono)">L5</text>
    </g>
  );
}

function Files() {
  const file = (x: number, y: number, label: string, hi = false) => (
    <g transform={`translate(${x} ${y})`}>
      <path d="M0 0h22l8 8v30H0Z" fill={C.fill} stroke={hi ? C.glow : C.line} strokeWidth={hi ? 1.5 : 1} />
      <path d="M22 0v8h8" fill="none" stroke={hi ? C.glow : C.line} />
      <text x="15" y="27" textAnchor="middle" fill={hi ? C.glow : C.text} fontSize="8" fontFamily="var(--font-mono)">{label}</text>
    </g>
  );
  return (
    <g>
      {file(6, 40, '.c')}
      {file(34, 40, '.s')}
      {file(62, 40, '.o')}
      {file(90, 40, 'exe', true)}
      <path d="M36 59h-2M64 59h-2M92 59h-2" stroke={C.soft} strokeWidth="1.5" />
      <text x="60" y="30" textAnchor="middle" fill={C.soft} fontSize="7" fontFamily="var(--font-mono)">cc → as → ld</text>
    </g>
  );
}

function Isa() {
  const rows = ['add  x1, x2, x3', 'sub  x4, x5, x6', 'lw   x7, 0(x8)', 'sw   x7, 4(x8)'];
  return (
    <g fontFamily="var(--font-mono)" fontSize="8.5">
      <rect x="8" y="22" width="104" height="66" rx="4" fill={C.fill} stroke={C.line} />
      {rows.map((r, i) => (
        <text key={r} x="16" y={38 + i * 14} fill={i === 0 ? C.glow : C.text}>
          {r}
        </text>
      ))}
    </g>
  );
}

function Riscv() {
  return (
    <g>
      <rect x="22" y="20" width="76" height="70" rx="5" fill={C.fill} stroke={C.glow} strokeWidth="1.4" />
      <text x="60" y="52" textAnchor="middle" fill={C.glow} fontSize="17" fontWeight="700" fontFamily="var(--font-display)">RV32I</text>
      <text x="60" y="70" textAnchor="middle" fill={C.text} fontSize="7.5" fontFamily="var(--font-mono)">x0 … x31</text>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <g key={i}>
          <path d={`M${30 + i * 12} 20v-8M${30 + i * 12} 90v8`} stroke={C.line} />
        </g>
      ))}
    </g>
  );
}

function Counter() {
  return (
    <g fontFamily="var(--font-mono)" fontSize="7.5">
      {['0x00', '0x04', '0x08', '0x0C', '0x10'].map((a, i) => (
        <g key={a} transform={`translate(0 ${18 + i * 15})`}>
          <rect x="34" y="0" width="70" height="12" rx="2" fill={C.fill} stroke={i === 2 ? C.glow : C.line} />
          <text x="10" y="9" fill={i === 2 ? C.glow : C.text}>{a}</text>
        </g>
      ))}
      <path d="M108 54h8" stroke={C.glow} strokeWidth="1.5" />
      <text x="106" y="48" fill={C.glow}>LC</text>
    </g>
  );
}

function Cpu() {
  return (
    <g>
      <rect x="30" y="25" width="60" height="60" rx="5" fill={C.fill} stroke={C.glow} strokeWidth="1.4" />
      <rect x="44" y="39" width="32" height="32" rx="3" fill="none" stroke={C.line} />
      <text x="60" y="58" textAnchor="middle" fill={C.glow} fontSize="9" fontFamily="var(--font-mono)">ALU</text>
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i} stroke={C.line}>
          <path d={`M${38 + i * 11} 25v-9M${38 + i * 11} 85v9M30 ${33 + i * 11}h-9M90 ${33 + i * 11}h9`} />
        </g>
      ))}
    </g>
  );
}

function Pipeline() {
  const stages = ['IF', 'ID', 'EX', 'MEM', 'WB'];
  return (
    <g fontFamily="var(--font-mono)" fontSize="7">
      {[0, 1, 2].map((row) =>
        stages.map((s, i) => (
          <g key={`${row}${s}`} transform={`translate(${6 + (i + row) * 15} ${30 + row * 18})`}>
            <rect width="14" height="13" rx="2" fill={C.fill} stroke={i + row === 4 ? C.glow : C.line} />
            <text x="7" y="9" textAnchor="middle" fill={i + row === 4 ? C.glow : C.text} fontSize={s.length > 2 ? 5 : 6.5}>
              {s}
            </text>
          </g>
        )),
      )}
    </g>
  );
}

const ART: Record<ModuleIcon, () => JSX.Element> = {
  layers: Layers,
  files: Files,
  isa: Isa,
  riscv: Riscv,
  counter: Counter,
  cpu: Cpu,
  pipeline: Pipeline,
};

export function ModuleArt({ icon }: { icon: ModuleIcon }) {
  const Art = ART[icon];
  return (
    <svg className="module-art" viewBox="0 0 120 110" aria-hidden="true" focusable="false">
      <Art />
    </svg>
  );
}
