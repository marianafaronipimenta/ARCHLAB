/*
 * Notazione polacca inversa (lezione 3): conversione infissa → postfissa con l’algoritmo
 * shunting yard (vagone ferroviario) e valutazione su uno stack LIFO.
 * Supporta numeri interi, variabili di una lettera/parola, + - * / e parentesi.
 */

export type Token = { type: 'num'; value: number; text: string } | { type: 'var'; text: string } | { type: 'op'; text: '+' | '-' | '*' | '/' } | { type: 'paren'; text: '(' | ')' };

const PREC: Record<string, number> = { '+': 1, '-': 1, '*': 2, '/': 2 };

export function tokenize(expr: string): Token[] {
  const out: Token[] = [];
  const re = /\s*(\d+|[A-Za-z_]\w*|[-+*/()])/y;
  let m: RegExpExecArray | null;
  let pos = 0;
  while (pos < expr.length) {
    if (/^\s*$/.test(expr.slice(pos))) break;
    re.lastIndex = pos;
    m = re.exec(expr);
    if (!m) throw new Error(`Carattere non valido in posizione ${pos + 1}`);
    const t = m[1];
    if (/^\d+$/.test(t)) out.push({ type: 'num', value: Number(t), text: t });
    else if (/^[A-Za-z_]/.test(t)) out.push({ type: 'var', text: t });
    else if (t === '(' || t === ')') out.push({ type: 'paren', text: t });
    else out.push({ type: 'op', text: t as '+' | '-' | '*' | '/' });
    pos = re.lastIndex;
  }
  return out;
}

/** Shunting yard: operandi diretti all’uscita («California»), operatori e parentesi nello stack («Texas»). */
export function toPostfix(expr: string): Token[] {
  const output: Token[] = [];
  const stack: Token[] = [];
  for (const t of tokenize(expr)) {
    if (t.type === 'num' || t.type === 'var') output.push(t);
    else if (t.type === 'op') {
      // A parità di priorità si raggruppa da sinistra a destra: si estraggono gli operatori con priorità ≥.
      while (stack.length) {
        const top = stack[stack.length - 1];
        if (top.type === 'op' && PREC[top.text] >= PREC[t.text]) output.push(stack.pop()!);
        else break;
      }
      stack.push(t);
    } else if (t.text === '(') stack.push(t);
    else {
      // «)» libera i simboli fino alla «(» corrispondente; le parentesi si annullano.
      while (stack.length && stack[stack.length - 1].text !== '(') output.push(stack.pop()!);
      if (!stack.length) throw new Error('Parentesi non bilanciate');
      stack.pop();
    }
  }
  while (stack.length) {
    const t = stack.pop()!;
    if (t.type === 'paren') throw new Error('Parentesi non bilanciate');
    output.push(t);
  }
  return output;
}

export const postfixString = (tokens: Token[]) => tokens.map((t) => t.text).join(' ');

export interface EvalStep {
  token: string;
  action: string;
  stack: number[];
}

/** Valuta un’espressione postfissa numerica: ogni operatore usa i due valori in cima, quello in cima è l’operando destro. */
export function evalPostfix(tokens: Token[]): { steps: EvalStep[]; result: number } {
  const stack: number[] = [];
  const steps: EvalStep[] = [];
  for (const t of tokens) {
    if (t.type === 'num') {
      stack.push(t.value);
      steps.push({ token: t.text, action: `push ${t.value}`, stack: [...stack] });
    } else if (t.type === 'op') {
      if (stack.length < 2) throw new Error('Espressione non valida');
      const right = stack.pop()!;
      const left = stack.pop()!;
      const v = t.text === '+' ? left + right : t.text === '-' ? left - right : t.text === '*' ? left * right : Math.trunc(left / right);
      stack.push(v);
      steps.push({ token: t.text, action: `${left} ${t.text} ${right} = ${v}`, stack: [...stack] });
    } else throw new Error('Per valutare servono solo numeri e operatori');
  }
  if (stack.length !== 1) throw new Error('Espressione non valida');
  return { steps, result: stack[0] };
}

/** Byte di un intero a 32 bit nell’ordine degli indirizzi crescenti. */
export function bytesOf(value: number, order: 'little' | 'big'): string[] {
  const v = value >>> 0;
  const be = [24, 16, 8, 0].map((s) => ((v >>> s) & 0xff).toString(16).toUpperCase().padStart(2, '0'));
  return order === 'big' ? be : be.reverse();
}
