import type { VocabItem } from '@/content/schema';
import { SpeakButton } from '@/components/SpeakButton';
import { SpokenFormNote } from '@/components/SpokenFormNote';
import { AspectBadge } from '@/components/AspectBadge';

const GENDER: Record<string, string> = { 'm-anim': 'masc. animate', 'm-inan': 'masc. inanimate', f: 'feminine', n: 'neuter' };

export function VocabList({ items }: { items: VocabItem[] }) {
  return (
    <ul className="divide-y divide-stone-100 overflow-hidden rounded-xl border border-stone-200 bg-white">
      {items.map((v) => (
        <li key={v.id} className="px-4 py-3">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="text-lg font-semibold" lang="cs">{v.cs}</span>
            <SpeakButton text={v.cs} audioId={v.audio} />
            {v.genitive && <span className="text-sm text-stone-500" lang="cs">gen. {v.genitive}</span>}
            <span className="text-stone-700">{v.en}</span>
            <span className="ml-auto flex items-center gap-2 text-xs text-stone-500">
              {v.gender && GENDER[v.gender]}
              {v.aspect && <AspectBadge aspect={v.aspect} />}
              {v.partner && <span lang="cs">↔ {v.partner}</span>}
            </span>
          </div>
          {v.notes && <p className="mt-1 text-sm text-stone-600">{v.notes}</p>}
          {v.spoken && <div className="mt-2"><SpokenFormNote spoken={v.spoken} /></div>}
        </li>
      ))}
    </ul>
  );
}
