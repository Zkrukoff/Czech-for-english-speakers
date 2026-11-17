const LABEL = { impf: 'imperfective', pf: 'perfective', bi: 'bi-aspectual' } as const;
const STYLE = { impf: 'bg-vltava-tint text-vltava border-vltava', pf: 'bg-paper-2 text-ink border-ink', bi: 'bg-paper text-ink-2 border-rule' } as const;

export function AspectBadge({ aspect }: { aspect: keyof typeof LABEL }) {
  return <span className={`inline-block rounded-full border px-2 py-0.5 text-xs font-medium ${STYLE[aspect]}`}>{LABEL[aspect]}</span>;
}
