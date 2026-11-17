import type { ReactNode } from 'react';

/**
 * Page title in English, with the Czech name underneath (`cs`), so the
 * navigation is easy to read and the Czech is learnt along the way.
 */
export function PageHeader({ title, subtitle, eyebrow, cs, children }: { title: ReactNode; subtitle?: ReactNode; eyebrow?: ReactNode; cs?: string; children?: ReactNode }) {
  return (
    <div className="mb-10 animate-rise">
      <div className="metro-stripe mb-4" aria-hidden />
      {eyebrow && <div className="eyebrow mb-2">{eyebrow}</div>}
      <h1 className="text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">{title}</h1>
      {cs && (
        <p lang="cs" className="mt-1 font-display text-2xl font-bold tracking-tight text-ink-3 sm:text-3xl">
          {cs}
        </p>
      )}
      {subtitle && <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-2">{subtitle}</p>}
      {children}
    </div>
  );
}
