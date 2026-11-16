import type { ReactNode } from 'react';

export function PageHeader({ title, subtitle, eyebrow, children }: { title: ReactNode; subtitle?: ReactNode; eyebrow?: ReactNode; children?: ReactNode }) {
  return (
    <div className="mb-8">
      {eyebrow && <div className="eyebrow mb-2">{eyebrow}</div>}
      <h1 className="text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">{title}</h1>
      {subtitle && <p className="mt-3 max-w-2xl text-lg leading-relaxed text-stone-600">{subtitle}</p>}
      {children}
    </div>
  );
}
