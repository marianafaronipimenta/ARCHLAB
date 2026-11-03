/*
 * Illustrazione della home: una scheda madre olografica con processore, moduli RAM,
 * bus e un pannello con il datapath a 5 stadi. Puramente decorativa.
 */

const traces = [
  'M320 180 H420 V110 H520',
  'M320 196 H440 V150 H560',
  'M320 212 H460 V250 H560',
  'M240 180 H150 V120 H90',
  'M240 196 H130 V200 H80',
  'M240 212 H170 V270 H110',
  'M272 150 V80 H300 V40',
  'M288 150 V96 H360 V48',
  'M272 242 V300 H220 V330',
  'M288 242 V312 H380 V336',
];

export function LabIllustration() {
  return (
    <svg className="lab-art" viewBox="0 0 640 360" role="img" aria-label="Scheda madre olografica con processore RISC-V">
      <defs>
        <linearGradient id="la-chip" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#16233f" />
          <stop offset="1" stopColor="#0b1428" />
        </linearGradient>
        <radialGradient id="la-halo" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#38d8ff" stopOpacity="0.28" />
          <stop offset="1" stopColor="#38d8ff" stopOpacity="0" />
        </radialGradient>
        <pattern id="la-grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0H0V20" fill="none" stroke="#2a4a7a" strokeOpacity="0.35" strokeWidth="0.6" />
        </pattern>
      </defs>

      {/* piano della scheda */}
      <rect x="20" y="20" width="600" height="320" rx="14" fill="#0a1426" stroke="#1d3a66" />
      <rect x="20" y="20" width="600" height="320" rx="14" fill="url(#la-grid)" />
      <circle cx="280" cy="196" r="150" fill="url(#la-halo)" />

      {/* piste */}
      <g fill="none" strokeLinecap="round">
        {traces.map((d) => (
          <path key={d} d={d} stroke="#1f6fa8" strokeWidth="2" strokeOpacity="0.55" />
        ))}
        {traces.map((d, i) => (
          <path key={`p${d}`} className="lab-pulse" style={{ animationDelay: `${(i % 5) * 0.7}s` }} d={d} stroke="#38d8ff" strokeWidth="2" />
        ))}
      </g>
      {[
        [520, 110],
        [560, 150],
        [560, 250],
        [90, 120],
        [80, 200],
        [110, 270],
        [300, 40],
        [360, 48],
        [220, 330],
        [380, 336],
      ].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="3.5" fill="#0a1426" stroke="#38d8ff" strokeWidth="1.5" />
      ))}

      {/* processore */}
      <g>
        <rect x="216" y="132" width="128" height="128" rx="10" fill="url(#la-chip)" stroke="#38d8ff" strokeWidth="2" />
        {Array.from({ length: 9 }, (_, i) => (
          <g key={i} stroke="#5b8fc7" strokeWidth="2">
            <path d={`M${228 + i * 13} 132v-10M${228 + i * 13} 260v10M216 ${144 + i * 13}h-10M344 ${144 + i * 13}h10`} />
          </g>
        ))}
        <rect x="240" y="156" width="80" height="80" rx="6" fill="#0d1a33" stroke="#2b5d93" />
        <text x="280" y="193" textAnchor="middle" fill="#7fe3ff" fontFamily="var(--font-display)" fontSize="17" fontWeight="700" letterSpacing="1">
          RISC-V
        </text>
        <text x="280" y="213" textAnchor="middle" fill="#8aa3c7" fontFamily="var(--font-mono)" fontSize="10">
          RV32I
        </text>
      </g>

      {/* moduli RAM */}
      <g>
        {[0, 1, 2].map((i) => (
          <g key={i} transform={`translate(${410 + i * 22} 196)`}>
            <rect width="14" height="120" rx="2" fill="#0f2a22" stroke="#2fbf8f" strokeOpacity="0.7" />
            {[0, 1, 2, 3, 4].map((k) => (
              <rect key={k} x="3" y={10 + k * 22} width="8" height="14" rx="1" fill="#1c4a3b" />
            ))}
          </g>
        ))}
        <text x="443" y="330" textAnchor="middle" fill="#6fd3b0" fontFamily="var(--font-mono)" fontSize="9">
          MEM
        </text>
      </g>

      {/* pannello olografico: datapath a 5 stadi */}
      <g transform="translate(400 46)">
        <rect width="196" height="62" rx="6" fill="#0b1a33" fillOpacity="0.85" stroke="#38d8ff" strokeOpacity="0.6" />
        {['IF', 'ID', 'EX', 'MEM', 'WB'].map((s, i) => (
          <g key={s} transform={`translate(${12 + i * 36} 18)`}>
            <rect width="30" height="26" rx="3" fill="none" stroke="#38d8ff" strokeOpacity={0.5 + i * 0.1} />
            <text x="15" y="17" textAnchor="middle" fill="#bfefff" fontFamily="var(--font-mono)" fontSize="9">
              {s}
            </text>
          </g>
        ))}
      </g>

      {/* registri */}
      <g transform="translate(46 40)" fontFamily="var(--font-mono)" fontSize="9">
        <rect width="132" height="66" rx="6" fill="#0b1a33" fillOpacity="0.85" stroke="#2b5d93" />
        {['x1  ra', 'x2  sp', 'x10 a0'].map((r, i) => (
          <text key={r} x="12" y={20 + i * 17} fill={i === 2 ? '#7fe3ff' : '#8aa3c7'}>
            {r}
          </text>
        ))}
      </g>
    </svg>
  );
}
