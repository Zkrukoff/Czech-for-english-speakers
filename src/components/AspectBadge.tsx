const LABEL = { impf: 'imperfective', pf: 'perfective', bi: 'bi-aspectual' } as const;
const STYLE = { impf: 'bg-violet-50 text-violet-800 border-violet-200', pf: 'bg-emerald-50 text-emerald-800 border-emerald-200', bi: 'bg-stone-50 text-stone-700 border-stone-200' } as const;

export function AspectBadge({ aspect }: { aspect: keyof typeof LABEL }) {
  return <span className={`inline-block rounded-full border px-2 py-0.5 text-xs font-medium ${STYLE[aspect]}`}>{LABEL[aspect]}</span>;
}
