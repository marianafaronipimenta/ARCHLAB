import { useId, useState } from 'react';
import { bytesOf } from '../../sim/rpn';

/** Disposizione dei byte di una parola da 32 bit in memoria: little-endian e big-endian. */
export function EndianDiagram() {
  const id = useId();
  const [text, setText] = useState('01234567');
  const valid = /^[0-9a-fA-F]{1,8}$/.test(text);
  const value = valid ? parseInt(text, 16) : 0;
  return (
    <div className="endian">
      <div className="rpn-input">
        <label htmlFor={id}>Parola a 32 bit (esadecimale)</label>
        <div className="endian-field">
          <span aria-hidden="true">0x</span>
          <input id={id} value={text} maxLength={8} spellCheck={false} onChange={(e) => setText(e.target.value.trim())} />
        </div>
      </div>
      {!valid ? (
        <p className="rpn-error">Inserisci da 1 a 8 cifre esadecimali.</p>
      ) : (
        (['little', 'big'] as const).map((order) => (
          <div key={order} className="endian-row">
            <p className="endian-label">{order === 'little' ? 'Little-endian (x86, ARM, RISC-V)' : 'Big-endian (storico in MIPS, PowerPC)'}</p>
            <ol className="endian-bytes">
              {bytesOf(value, order).map((b, i) => (
                <li key={i}>
                  <span className="endian-addr">indirizzo {i}</span>
                  <span className="endian-byte">{b}</span>
                </li>
              ))}
            </ol>
          </div>
        ))
      )}
    </div>
  );
}
