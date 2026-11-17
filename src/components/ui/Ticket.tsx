import type { ReactNode } from 'react';

/**
 * A transit ticket: paper stock, perforated stub, mono labels. Holds a stamp.
 * The perforation is a CSS mask, so the ticket shape has real holes.
 */
export function Ticket({
  line,
  from,
  title,
  date,
  stamp,
  tone = 'var(--champagne-tint)',
}: { line?: ReactNode; from?: string; title: string; date?: string; stamp?: ReactNode; tone?: string }) {
  const holes = 'radial-gradient(circle at 0 50%, transparent 7px, black 7.5px), radial-gradient(circle at 100% 50%, transparent 7px, black 7.5px)';
  return (
    <div className="relative w-full max-w-sm" style={{ filter: 'drop-shadow(3px 3px 0 var(--shadow-ink))' }}>
      <div
        className="grid grid-cols-[1fr_auto] border-2 border-ink"
        style={{ background: tone, WebkitMask: holes, mask: holes, WebkitMaskComposite: 'source-in', maskComposite: 'intersect', color: 'var(--on-fill-dark)' }}
      >
        <div className="p-4">
          <div className="label-board flex items-center gap-2">
            {line}
            <span>Jízdenka · Ticket</span>
          </div>
          <div className="mt-2 font-display text-xl font-extrabold leading-tight">{title}</div>
          {from && <div className="mt-1 font-mono text-xs uppercase tracking-wider">{from}</div>}
          {date && <div className="mt-3 font-mono text-xs">{date}</div>}
        </div>
        <div className="flex w-28 items-center justify-center border-l-2 border-dashed border-ink/50 p-2">{stamp}</div>
      </div>
    </div>
  );
}
