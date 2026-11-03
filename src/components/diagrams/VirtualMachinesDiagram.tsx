/** Pila di macchine virtuali M0…Mn (slide 5). */
export function VirtualMachinesDiagram() {
  const rows = [
    { m: 'Mn', l: 'Ln', note: 'più astrazione' },
    { m: '…', l: '…', note: '' },
    { m: 'M2', l: 'L2', note: '' },
    { m: 'M1', l: 'L1', note: '' },
    { m: 'M0', l: 'L0', note: 'eseguita dall’hardware' },
  ];
  return (
    <ol className="vm-stack" aria-label="Macchine virtuali dalla più alta alla più bassa">
      {rows.map((r, i) => (
        <li key={i} className="vm-row">
          <span className="vm-machine">{r.m === '…' ? '…' : `Macchina virtuale ${r.m}`}</span>
          <span className="vm-lang">{r.l === '…' ? '' : `linguaggio ${r.l}`}</span>
          {r.note && <span className="vm-note">{r.note}</span>}
        </li>
      ))}
    </ol>
  );
}
