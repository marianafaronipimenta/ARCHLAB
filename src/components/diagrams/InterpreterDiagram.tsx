/** Confronto tra interpretazione e traduzione (slide 8–10). */
export function InterpreterDiagram() {
  return (
    <div className="flows">
      <figure className="flow">
        <figcaption>Interpretazione</figcaption>
        <ol className="flow-steps">
          <li>
            <span className="flow-box">Programma P in L<sub>i+1</sub></span>
            <span className="flow-note">trattato come dati</span>
          </li>
          <li>
            <span className="flow-box flow-box-accent">Interprete scritto in L<sub>i</sub></span>
            <span className="flow-note">fetch → decode → execute, istruzione per istruzione</span>
          </li>
          <li>
            <span className="flow-box">Macchina M<sub>i</sub> esegue l’interprete</span>
          </li>
        </ol>
      </figure>
      <figure className="flow">
        <figcaption>Traduzione</figcaption>
        <ol className="flow-steps">
          <li>
            <span className="flow-box">Programma P in L<sub>i+1</sub></span>
          </li>
          <li>
            <span className="flow-box flow-box-accent">Traduttore (es. compilatore)</span>
            <span className="flow-note">produce un programma equivalente</span>
          </li>
          <li>
            <span className="flow-box">Programma P′ in L<sub>i</sub>, eseguito da M<sub>i</sub></span>
          </li>
        </ol>
      </figure>
    </div>
  );
}
