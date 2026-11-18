import { useLiveQuery } from 'dexie-react-hooks';
import { course } from '@/content';
import { db } from '@/db/db';
import { addPhraseCards, NEW_PHRASES_PER_DAY, phraseKey, removePhraseCards } from '@/db/srs';
import { SpeakButton } from '@/components/SpeakButton';

/**
 * Fráze (A7): whole phrases by situation. Add a situation and its phrases
 * join review, NEW_PHRASES_PER_DAY a day: recognise them first, then say them.
 */
export function PhraseSituations() {
  const cards = useLiveQuery(async () => {
    const list = await db.cards.where('itemKey').startsWith('chunk:').toArray();
    return new Map(list.map((c) => [c.itemKey, c]));
  }, []) ?? new Map();
  // The situations are static content: draw them at once (as "Add") so nothing below jumps when cards load.
  return (
    <section aria-labelledby="phrases-h" className="mt-12">
      <h2 id="phrases-h" className="label-board mb-1 text-ink-3"><span lang="cs">Fráze</span> · phrases by situation</h2>
      <p className="mb-5 max-w-2xl text-ink-2">
        Whole sentences you'll need before you could build them yourself. Add a situation and its phrases join your reviews, {NEW_PHRASES_PER_DAY} new
        ones a day: first you recognise them, then you say them.
      </p>
      <ul className="grid gap-4 sm:grid-cols-2">
        {course.phrases.map((s) => {
          const keys = s.phrases.map((p) => phraseKey(p.id));
          const added = keys.filter((k) => cards.has(k)).length;
          const learned = keys.filter((k) => (cards.get(k)?.reps ?? 0) > 0).length;
          const on = added > 0;
          return (
            <li key={s.id} className="card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p lang="cs" className="font-display text-xl font-extrabold">{s.titleCs}</p>
                  <p className="text-sm text-ink-2">{s.title}</p>
                </div>
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => void (on ? removePhraseCards(s.phrases.map((p) => p.id)) : addPhraseCards(s.phrases.map((p) => p.id)))}
                  className={`btn shrink-0 ${on ? 'btn-quiet' : 'btn-secondary'}`}
                >
                  {on ? 'Remove' : 'Add'}
                </button>
              </div>
              <p className="label-board mt-3 text-ink-3">
                {on ? `${learned} of ${s.phrases.length} practised` : `${s.phrases.length} phrases`}
              </p>
              <details className="mt-2 text-sm">
                <summary className="cursor-pointer text-vltava">See the phrases</summary>
                <ul className="mt-2 space-y-1">
                  {s.phrases.map((p) => (
                    <li key={p.id} className="flex items-start justify-between gap-2">
                      <span>
                        <span lang="cs" className="font-semibold text-ink">{p.cs}</span> <span className="text-ink-2">{p.en}</span>
                      </span>
                      <SpeakButton text={p.cs} />
                    </li>
                  ))}
                </ul>
              </details>
            </li>
          );
        })}
      </ul>
      <p className="mt-4 text-xs text-ink-3">
        Most phrases are from the official A1 word list for the Czech residence exam (NPI ČR); the rest are from Pražák's lessons and guides. All await native review.
      </p>
    </section>
  );
}
