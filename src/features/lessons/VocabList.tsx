import { vocabAudioId } from '@/lib/audio/ids';
import type { VocabItem } from '@/content/schema';
import { SpeakButton } from '@/components/SpeakButton';
import { SpokenFormNote } from '@/components/SpokenFormNote';
import { AspectBadge } from '@/components/AspectBadge';
import { GenderMark } from '@/components/GenderMark';

export function VocabList({ items }: { items: VocabItem[] }) {
  return (
    <ul className="divide-y divide-rule overflow-hidden rounded-md border-2 border-ink bg-surface shadow-offset">
      {items.map((v) => (
        <li key={v.id} className="px-4 py-3">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="text-lg font-semibold" lang="cs">{v.cs}</span>
            <SpeakButton text={v.cs} audioId={v.audio ?? vocabAudioId(v.id)} />
            {v.genitive && <span className="text-sm text-ink-3" lang="cs">gen. {v.genitive}</span>}
            <span className="text-ink-2">{v.en}</span>
            <span className="ml-auto flex items-center gap-2 text-xs text-ink-3">
              {v.gender && <GenderMark gender={v.gender} />}
              {v.aspect && <AspectBadge aspect={v.aspect} />}
              {v.partner && <span><span className="label-board mr-1">pair</span><span lang="cs">{v.partner}</span></span>}
            </span>
          </div>
          {v.notes && <p className="mt-1 text-sm text-ink-2">{v.notes}</p>}
          {v.spoken && <div className="mt-2"><SpokenFormNote spoken={v.spoken} /></div>}
        </li>
      ))}
    </ul>
  );
}
