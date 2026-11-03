import { useEffect, useRef } from 'react';
import type { LearnBlock, ModuleContent } from '../../content/types';
import { findItem } from '../../content/index';
import { moduleHref } from '../../router';
import { CheckIcon } from '../art/Icons';
import { Diagram } from '../diagrams/Diagram';
import { ExerciseView } from '../exercise/ExerciseView';
import { Panel } from '../ui/Panel';

interface Props {
  content: ModuleContent;
  pageId: string | undefined;
  done: boolean;
  onPage: (pageId: string) => void;
  onComplete: () => void;
}

function Block({ block }: { block: LearnBlock }) {
  switch (block.type) {
    case 'p':
      return <p className="learn-p">{block.text}</p>;
    case 'list':
      return (
        <ul className="learn-list">
          {block.items.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      );
    case 'code':
      return (
        <figure className="learn-code">
          <pre className="code-block">{block.code}</pre>
          {block.caption && <figcaption>{block.caption}</figcaption>}
        </figure>
      );
    case 'callout':
      return (
        <aside className={`callout callout-${block.tone}`}>
          <p className="callout-title">{block.title}</p>
          <p>{block.text}</p>
        </aside>
      );
    case 'diagram':
      return <Diagram id={block.diagram} />;
  }
}

export function LearnView({ content, pageId, done, onPage, onComplete }: Props) {
  const index = Math.max(0, content.learn.findIndex((p) => p.id === pageId));
  const page = content.learn[index];
  const last = index === content.learn.length - 1;
  const check = page.checkId ? findItem(content, page.checkId) : undefined;
  const titleRef = useRef<HTMLHeadingElement>(null);
  const tocRef = useRef<HTMLElement>(null);
  const first = useRef(true);

  // Al cambio pagina porta il focus sul titolo (utile da tastiera e lettore di schermo).
  // Mantiene visibile nell’indice la pagina corrente (su mobile l’indice scorre in orizzontale).
  useEffect(() => {
    const el = tocRef.current?.querySelector<HTMLElement>('.is-current');
    const list = el?.closest('ol');
    if (el && list && list.scrollWidth > list.clientWidth) list.scrollLeft = el.offsetLeft - list.offsetLeft - 16;
  }, [page.id]);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    titleRef.current?.focus();
  }, [page.id]);

  return (
    <div className="learn">
      <nav className="learn-toc" aria-label="Pagine della lezione" ref={tocRef}>
        <ol>
          {content.learn.map((p, i) => (
            <li key={p.id}>
              <button
                type="button"
                className={i === index ? 'toc-link is-current' : 'toc-link'}
                aria-current={i === index ? 'step' : undefined}
                onClick={() => onPage(p.id)}
              >
                <span className="toc-n">{String(i + 1).padStart(2, '0')}</span>
                <span>{p.title}</span>
              </button>
            </li>
          ))}
        </ol>
      </nav>

      <Panel as="article" className="learn-page" aria-labelledby="learn-title">
        <p className="learn-meta">
          Pagina {index + 1} di {content.learn.length} · {page.slides}
        </p>
        <h2 id="learn-title" className="learn-title" tabIndex={-1} ref={titleRef}>
          {page.title}
        </h2>
        {page.blocks.map((b, i) => (
          <Block key={i} block={b} />
        ))}

        {page.keyPoints && (
          <div className="keypoints">
            <p className="keypoints-title">Da ricordare</p>
            <ul>
              {page.keyPoints.map((k) => (
                <li key={k}>{k}</li>
              ))}
            </ul>
          </div>
        )}

        {check && (
          <section className="learn-check" aria-label="Verifica rapida">
            <p className="keypoints-title">Verifica rapida</p>
            <ExerciseView key={check.id} exercise={check} />
          </section>
        )}

        <div className="learn-nav">
          <button type="button" className="btn" disabled={index === 0} onClick={() => onPage(content.learn[index - 1].id)}>
            ← Precedente
          </button>
          {!last ? (
            <button type="button" className="btn btn-primary" onClick={() => onPage(content.learn[index + 1].id)}>
              Successiva →
            </button>
          ) : done ? (
            <a className="btn btn-primary" href={moduleHref(content.moduleId, 'practice')}>
              <CheckIcon size={18} /> Learn completato · vai a Practice
            </a>
          ) : (
            <button type="button" className="btn btn-primary" onClick={onComplete}>
              Completa Learn (+50 XP)
            </button>
          )}
        </div>
      </Panel>
    </div>
  );
}
