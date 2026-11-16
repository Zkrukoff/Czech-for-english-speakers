import type { Phrase } from '@/content/schema';
import { SpeakButton } from '@/components/SpeakButton';
import { SpokenFormNote } from '@/components/SpokenFormNote';

export function PhraseList({ phrases }: { phrases: Phrase[] }) {
  return (
    <ul className="card divide-y divide-stone-100 overflow-hidden">
      {phrases.map((p) => (
        <li key={p.cs} className="px-4 py-3">
          <div className="flex items-start gap-1">
            <span lang="cs" className="text-lg text-stone-900">{p.cs}</span>
            <SpeakButton text={p.cs} />
          </div>
          <div className="text-stone-600">{p.en}</div>
          {p.note && <p className="mt-1 text-sm text-stone-500">{p.note}</p>}
          {p.spoken && <div className="mt-2"><SpokenFormNote spoken={p.spoken} /></div>}
        </li>
      ))}
    </ul>
  );
}
