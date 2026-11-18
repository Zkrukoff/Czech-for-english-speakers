import { useLiveQuery } from 'dexie-react-hooks';
import { course } from '@/content';
import { db } from '@/db/db';
import { addWordCards, removeWordCards, wordKey } from '@/db/srs';
import { updateSettings, useSettings } from '@/db/settings';
import { SpeakButton } from '@/components/SpeakButton';

const PER_DAY = [5, 10, 20] as const;

/** Slovíčka (step 3): core vocabulary by topic. Add a deck; new words arrive a few a day. */
export function WordDecks() {
  const settings = useSettings();
  const perDay = settings.newWordsPerDay ?? 10;
  // Decks are static content: draw them at once so the page doesn't jump while cards load.
  const cards =
    useLiveQuery(async () => {
      const list = await db.cards.where('itemKey').startsWith('word:').toArray();
      return new Map(list.map((c) => [c.itemKey, c]));
    }, []) ?? new Map();
  return (
    <div>
      <p className="mb-3 max-w-2xl text-ink-2">
        The everyday words, chosen by how often Czech actually uses them, grouped by topic. Add a deck and its words join your reviews a few a day: first
        you recognise each word, then you type it.
      </p>
      <fieldset className="mb-5 flex flex-wrap items-center gap-2">
        <legend className="mb-2 text-sm text-ink-2">New words a day</legend>
        {PER_DAY.map((n) => (
          <button key={n} type="button" aria-pressed={perDay === n} onClick={() => void updateSettings({ newWordsPerDay: n })} className={`btn min-w-11 ${perDay === n ? 'btn-primary' : 'btn-secondary'}`}>
            {n}
          </button>
        ))}
      </fieldset>
      <ul className="grid gap-4 sm:grid-cols-2">
        {course.decks.map((d) => {
          const keys = d.words.map((w) => wordKey(w.id));
          const added = keys.filter((k) => cards.has(k)).length;
          const learned = keys.filter((k) => (cards.get(k)?.reps ?? 0) > 0).length;
          const on = added > 0;
          return (
            <li key={d.id} className="card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p lang="cs" className="font-display text-xl font-extrabold">{d.titleCs}</p>
                  <p className="text-sm text-ink-2">{d.title}</p>
                </div>
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => void (on ? removeWordCards(d.words.map((w) => w.id)) : addWordCards(d.words.map((w) => w.id), perDay))}
                  className={`btn shrink-0 ${on ? 'btn-quiet' : 'btn-secondary'}`}
                >
                  {on ? 'Remove' : 'Add'}
                </button>
              </div>
              <p className="label-board mt-3 text-ink-3">{on ? `${learned} of ${d.words.length} practised` : `${d.words.length} words`}</p>
              <details className="mt-2 text-sm">
                <summary className="cursor-pointer text-vltava">See the words</summary>
                <ul className="mt-2 space-y-1">
                  {d.words.map((w) => (
                    <li key={w.id} className="flex items-start justify-between gap-2">
                      <span>
                        <span lang="cs" className="font-semibold text-ink">{w.cs}</span> <span className="text-ink-2">{w.en}</span>
                      </span>
                      <SpeakButton text={w.cs} />
                    </li>
                  ))}
                </ul>
              </details>
            </li>
          );
        })}
      </ul>
      <p className="mt-4 text-xs text-ink-3">
        Words chosen and ordered with the Czech National Corpus SYN2015 frequency list (ÚČNK, CC BY 4.0). Meanings and notes are Pražák's and await native review.
      </p>
    </div>
  );
}
