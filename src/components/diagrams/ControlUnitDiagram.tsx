import { useState } from 'react';
import { ALU_OPS, aluBitsOf, control, INSTRS, pcSrc, R_FIELDS, UNIT_LABELS, unitsUsed, type Instr, type Unit } from '../../sim/control';

const EXAMPLES: Record<Instr, string> = {
  lw: 'lw x5, 8(x6)',
  sw: 'sw x5, 8(x6)',
  beq: 'beq x5, x6, etichetta',
  add: 'add x5, x6, x7',
  sub: 'sub x5, x6, x7',
  and: 'and x5, x6, x7',
  or: 'or x5, x6, x7',
};
const ORDER: Unit[] = ['pc', 'imem', 'adder4', 'regread', 'signext', 'alu', 'branchadder', 'dmem', 'regwrite'];

/** Sceglie un’istruzione e mostra i segnali dell’unità di controllo, il controllore ALU e le unità usate. */
export function ControlUnitDiagram() {
  const [instr, setInstr] = useState<Instr>('lw');
  const [zero, setZero] = useState<0 | 1>(1);
  const c = control(instr);
  const bits = aluBitsOf(instr);
  const used = new Set(unitsUsed(instr));
  const f = instr in R_FIELDS ? R_FIELDS[instr as keyof typeof R_FIELDS] : undefined;
  const pc = pcSrc(c.Branch, zero);
  const signals: [string, string][] = Object.entries(c).map(([k, v]) => [k, String(v)]);

  return (
    <div className="ctrl">
      <div className="ctrl-pick" role="group" aria-label="Istruzione">
        {INSTRS.map((i) => (
          <button key={i} type="button" className={i === instr ? 'btn btn-small is-current' : 'btn btn-small'} aria-pressed={i === instr} onClick={() => setInstr(i)}>
            {i}
          </button>
        ))}
      </div>
      <p className="ctrl-example">
        <code>{EXAMPLES[instr]}</code>
      </p>
      <div className="ctrl-grid">
        <table className="ctrl-table">
          <caption>Unità di controllo</caption>
          <tbody>
            {signals.map(([k, v]) => (
              <tr key={k} className={v === '1' ? 'is-on' : ''}>
                <th scope="row">{k}</th>
                <td>{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="ctrl-side">
          <p>
            <strong>Controllore ALU.</strong> ALUOp = {c.ALUOp}
            {f ? `, funct7 = ${f.funct7}, funct3 = ${f.funct3}` : ' (funct7 e funct3 ignorati)'} → bit di controllo <code>{bits}</code> = {ALU_OPS[bits]}.
          </p>
          {instr === 'beq' ? (
            <div className="ctrl-zero">
              <span>Zero della ALU (x5 − x6 = 0?)</span>
              <div role="group" aria-label="Segnale Zero">
                {([1, 0] as const).map((z) => (
                  <button key={z} type="button" className={z === zero ? 'btn btn-mini is-current' : 'btn btn-mini'} aria-pressed={z === zero} onClick={() => setZero(z)}>
                    Zero = {z}
                  </button>
                ))}
              </div>
              <p>
                PCSrc = Branch AND Zero = {c.Branch} AND {zero} = <strong>{pc}</strong>: nel PC va {pc ? 'l’indirizzo di salto' : 'PC + 4'}.
              </p>
            </div>
          ) : (
            <p>PCSrc = Branch AND Zero = 0: nel PC va PC + 4.</p>
          )}
          <ul className="ctrl-units" aria-label="Unità del data path">
            {ORDER.map((u) => (
              <li key={u} className={used.has(u) ? 'is-used' : ''}>
                {UNIT_LABELS[u]}
                <span className="sr-only">{used.has(u) ? ' (usata)' : ' (non usata)'}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
