import type { ReactNode } from 'react';

type Tone = 'red' | 'blue' | 'paper';

/**
 * Enamel-plate label, after Prague's street-name signs and the two
 * house-number plates on Czech buildings: rounded rectangle, a thin inner
 * rim, set in the mono face. Colours are fixed (they don't change in dark mode).
 */
export function EnamelPlate({ children, tone = 'blue', size = 'md', className = '' }: { children: ReactNode; tone?: Tone; size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const bg = tone === 'red' ? 'var(--plate-red)' : tone === 'blue' ? 'var(--plate-blue)' : 'var(--surface)';
  const fg = tone === 'paper' ? 'var(--ink)' : 'var(--on-fill-light)';
  const rim = tone === 'paper' ? 'var(--ink)' : 'var(--on-fill-light)';
  const pad = size === 'sm' ? 'px-2 py-0.5 text-2xs' : size === 'lg' ? 'px-4 py-2 text-sm' : 'px-3 py-1 text-xs';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md font-mono font-semibold uppercase ${pad} ${className}`}
      style={{ background: bg, color: fg, letterSpacing: '0.1em', boxShadow: `inset 0 0 0 2px ${bg}, inset 0 0 0 3px ${rim}, var(--shadow-offset-sm)` }}
    >
      {children}
    </span>
  );
}
