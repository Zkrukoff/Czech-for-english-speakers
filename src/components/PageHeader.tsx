import type { ReactNode } from 'react';

export function PageHeader({ title, subtitle, eyebrow, children }: { title: ReactNode; subtitle?: ReactNode; eyebrow?: ReactNode; children?: ReactNode }) {
  return (
    <div className="mb-8">
      {eyebrow && <div className="mb-1 text-sm font-medium text-stone-500">{eyebrow}</div>}
      <h1 className="text-3xl font-semibold tracking-tight text-stone-900">{title}</h1>
      {subtitle && <p className="mt-2 max-w-2xl text-stone-600">{subtitle}</p>}
      {children}
    </div>
  );
}
