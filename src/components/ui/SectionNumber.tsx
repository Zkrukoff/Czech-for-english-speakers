import type { ReactNode } from 'react';

/** Numbered section heading: mono number, display title, ink rule. Visible structure, not decoration. */
export function SectionNumber({ n, children, id }: { n: number; children: ReactNode; id?: string }) {
  return (
    <div className="mb-6 flex items-end gap-4 border-b-2 border-ink pb-2">
      <span className="font-mono text-sm font-semibold text-ink-3">{String(n).padStart(2, '0')}</span>
      <h2 id={id} className="text-3xl font-extrabold text-ink">{children}</h2>
    </div>
  );
}
