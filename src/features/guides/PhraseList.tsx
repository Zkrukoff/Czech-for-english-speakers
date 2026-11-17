import type { Phrase } from '@/content/schema';
import { SpeakButton } from '@/components/SpeakButton';
import { SpokenFormNote } from '@/components/SpokenFormNote';

export function PhraseList({ phrases }: { phrases: Phrase[] }) {
  return (
    <ul className="card divide-y divide-rule overflow-hidden">
      {phrases.map((p) => (
        <li key={p.cs} className="px-4 py-3">
          <div className="flex items-start gap-1">
            <span lang="cs" className="text-lg text-ink">{p.cs}</span>
            <SpeakButton text={p.cs} />
          </div>
          <div className="text-ink-2">{p.en}</div>
          {p.note && <p className="mt-1 text-sm text-ink-3">{p.note}</p>}
          {p.spoken && <div className="mt-2"><SpokenFormNote spoken={p.spoken} /></div>}
        </li>
      ))}
    </ul>
  );
}
