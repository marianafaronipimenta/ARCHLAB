import type { ElementType, ReactNode } from 'react';

interface PanelProps {
  as?: ElementType;
  className?: string;
  /** «accent» evidenzia il pannello (es. modulo consigliato). */
  tone?: 'default' | 'accent' | 'muted';
  children: ReactNode;
  [key: string]: unknown;
}

/** Riquadro «olografico» con angoli luminosi: la base visiva di tutte le schede. */
export function Panel({ as: Tag = 'div', className = '', tone = 'default', children, ...rest }: PanelProps) {
  return (
    <Tag className={`panel panel-${tone} ${className}`.trim()} {...rest}>
      <span className="panel-corner panel-corner-tl" aria-hidden="true" />
      <span className="panel-corner panel-corner-br" aria-hidden="true" />
      {children}
    </Tag>
  );
}
