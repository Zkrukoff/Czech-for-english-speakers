import { course } from '@/content';

type Num = (typeof course.emergency.numbers)[number];

/** Big tappable emergency numbers. `ids` limits and orders them; default is all. */
export function EmergencyNumbers({ ids, compact = false }: { ids?: string[]; compact?: boolean }) {
  const all = course.emergency.numbers;
  const list = ids ? ids.map((id) => all.find((n) => n.id === id)).filter((n): n is Num => !!n) : all;
  if (!list.length) return null;
  return (
    <ul className={`grid gap-3 ${compact ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
      {list.map((n) => (
        <li key={n.id}>
          <a href={`tel:${n.number}`} className="board flex h-full items-center gap-4 rounded-md border-2 border-ink p-4 hover:underline">
            <span className="font-display text-5xl font-extrabold tabular-nums leading-none">{n.number}</span>
            <span className="min-w-0">
              <span className="block font-semibold">{n.en}</span>
              <span lang="cs" className="block text-sm opacity-80">{n.cs}</span>
            </span>
          </a>
          {n.note && !compact && <p className="mt-2 text-sm text-ink-2">{n.note}</p>}
        </li>
      ))}
    </ul>
  );
}

export function VerifiedLine() {
  const sources = new Map<string, { url: string; date: string }>();
  for (const n of course.emergency.numbers) for (const v of n.verified) sources.set(v.url, v);
  const list = [...sources.values()];
  if (!list.length) return null;
  return (
    <p className="mt-3 text-xs text-ink-3">
      Numbers checked {list[0]!.date} against{' '}
      {list.map((v, i) => (
        <span key={v.url}>{i > 0 && ' and '}<a href={v.url} className="underline" target="_blank" rel="noreferrer">{new URL(v.url).hostname}</a></span>
      ))}
      .
    </p>
  );
}
