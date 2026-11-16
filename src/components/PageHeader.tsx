import type { ReactNode } from 'react';

export function PageHeader({ title, subtitle, eyebrow, children }: { title: ReactNode; subtitle?: ReactNode; eyebrow?: ReactNode; children?: ReactNode }) {
  return (
    <div className="mb-10 animate-rise">
      <div className="metro-stripe mb-4" aria-hidden />
      {eyebrow && <div className="eyebrow mb-2">{eyebrow}</div>}
      <h1 className="text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">{title}</h1>
      {subtitle && <p className="mt-4 max-w-2xl text-lg leading-relaxed text-stone-600">{subtitle}</p>}
      {children}
    </div>
  );
}
