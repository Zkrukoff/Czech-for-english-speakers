import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { course } from '@/content';
import type { Gender } from '@/content/schema';
import { PageHeader } from '@/components/PageHeader';
import { GenderMark } from '@/components/GenderMark';
import { IconArrowRight, IconClose } from '@/components/icons';
import { db, type OwnWord } from '@/db/db';
import { addOwnWord, deleteOwnWord } from '@/db/ownWords';
import { guessVzor, linkWord } from '@/lib/words/link';
import { VZORY } from '@/features/grammar/VzorPage';

type Link_ = NonNullable<OwnWord['link']>;

function LinkChip({ link, word }: { link: Link_; word?: string }) {
  if (link.kind === 'verb') {
    return (
      <Link to={`/verbs/lookup/${encodeURIComponent(link.lemma)}`} className="chip normal-case tracking-normal hover:border-ink">
        verb <span lang="cs" className="font-semibold">{link.lemma}</span> <IconArrowRight size={14} />
      </Link>
    );
  }
  return (
    <Link to={`/grammar/vzory/${link.vzor}`} className="chip normal-case tracking-normal hover:border-ink">
      {word && word.trim().toLocaleLowerCase('cs') !== link.lemma.toLocaleLowerCase('cs') && (
        <span lang="cs"><span className="font-semibold">{link.lemma}</span> ·</span>
      )}
      <GenderMark gender={link.gender} /> like <span lang="cs" className="font-semibold">{course.tables.get(link.vzor)?.title}</span>
      {link.guessed && <span className="text-ink-3">(your pick)</span>}
      <IconArrowRight size={14} />
    </Link>
  );
}

/** Words and phrases the learner meets in daily life, saved into the same review queue. */
export function WordsPage() {
  const words = useLiveQuery(() => db.ownWords.orderBy('createdAt').reverse().toArray(), []);
  const [cs, setCs] = useState('');
  const [en, setEn] = useState('');
  const [note, setNote] = useState('');
  const [place, setPlace] = useState('');
  const [gender, setGender] = useState<Gender | ''>('');
  const [vzor, setVzor] = useState('');
  const [saved, setSaved] = useState<string | null>(null);

  const found = useMemo(() => (cs.trim() ? linkWord(cs, course) : null), [cs]);
  const singleWord = cs.trim() !== '' && !/\s/.test(cs.trim());
  const suggestion = gender ? guessVzor(cs, gender) : '';

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!cs.trim()) return;
    const link: OwnWord['link'] = found ?? (singleWord && gender ? { kind: 'noun', lemma: cs.trim(), gender, vzor: vzor || suggestion, guessed: true } : undefined);
    await addOwnWord({ cs, en: en.trim() || undefined, note: note.trim() || undefined, place: place.trim() || undefined, link });
    setSaved(cs.trim());
    setCs(''); setEn(''); setNote(''); setPlace(''); setGender(''); setVzor('');
  }

  const field = 'mt-1 block min-h-11 w-full rounded-sm border-2 border-ink bg-surface px-3';
  return (
    <>
      <PageHeader title="Your words" cs="Moje slova" subtitle="A word on a sign, something a colleague said, the name of that pastry. Save it here and it joins your reviews." />

      <form onSubmit={save} className="mb-12 border-2 border-ink bg-surface p-5 shadow-offset" aria-labelledby="add-h">
        <h2 id="add-h" className="label-board text-ink-3">Přidat slovo · add a word</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="font-semibold">Czech</span> <span className="text-sm text-ink-3">(required)</span>
            <input lang="cs" required value={cs} onChange={(e) => { setCs(e.target.value); setSaved(null); }} className={field} placeholder="e.g. výdejní místo" autoComplete="off" />
          </label>
          <label className="block">
            <span className="font-semibold">Meaning</span> <span className="text-sm text-ink-3">(English, optional)</span>
            <input value={en} onChange={(e) => setEn(e.target.value)} className={field} placeholder="e.g. pick-up point" autoComplete="off" />
          </label>
          <label className="block">
            <span className="font-semibold">Where you saw it</span> <span className="text-sm text-ink-3">(optional)</span>
            <input value={place} onChange={(e) => setPlace(e.target.value)} className={field} placeholder="e.g. a sign at Anděl" autoComplete="off" />
          </label>
          <label className="block">
            <span className="font-semibold">Note</span> <span className="text-sm text-ink-3">(optional)</span>
            <input value={note} onChange={(e) => setNote(e.target.value)} className={field} placeholder="e.g. the tall one in the office said it" autoComplete="off" />
          </label>
        </div>

        {cs.trim() && (
          <div className="mt-4 border-l-4 border-vltava bg-vltava-tint px-3 py-2 text-sm text-ink" aria-live="polite">
            {found ? (
              <span className="flex flex-wrap items-center gap-2">
                Found in the course: <LinkChip link={found} word={cs} />
              </span>
            ) : singleWord ? (
              <div className="flex flex-wrap items-end gap-3">
                <span>Not in the course yet. If it's a noun, pick its gender to link a pattern:</span>
                <select aria-label="Gender" value={gender} onChange={(e) => { setGender(e.target.value as Gender | ''); setVzor(''); }} className="min-h-11 rounded-sm border-2 border-ink bg-surface px-2">
                  <option value="">not a noun / skip</option>
                  <option value="m-anim">masculine animate</option>
                  <option value="m-inan">masculine inanimate</option>
                  <option value="f">feminine</option>
                  <option value="n">neuter</option>
                </select>
                {gender && (
                  <label className="flex items-center gap-2">
                    like
                    <select aria-label="Pattern" value={vzor || suggestion} onChange={(e) => setVzor(e.target.value)} lang="cs" className="min-h-11 rounded-sm border-2 border-ink bg-surface px-2">
                      {VZORY.map((v) => <option key={v} value={v}>{course.tables.get(v)?.title}{v === suggestion ? ' (a guess)' : ''}</option>)}
                    </select>
                    <span className="text-ink-2">A guess from the ending: check it.</span>
                  </label>
                )}
              </div>
            ) : (
              <span>A phrase: it'll be saved as it is.</span>
            )}
          </div>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-4">
          <button type="submit" className="btn btn-primary" disabled={!cs.trim()}>Save · <span lang="cs">Uložit</span></button>
          {saved && <p role="status" className="text-sm">Saved <b lang="cs">{saved}</b>. It's in your reviews now.</p>}
        </div>
      </form>

      <section aria-labelledby="list-h">
        <h2 id="list-h" className="mb-4 text-2xl font-extrabold">
          Saved <span className="text-ink-3">· {words?.length ?? 0}</span>
        </h2>
        {words && words.length === 0 ? (
          <p className="border-2 border-dashed border-rule-strong p-5 text-ink-2">
            <span lang="cs" className="font-semibold">Tady nic není.</span> Like a tram stop at 3 a.m. Saw a word on a sign today? Save it above.
          </p>
        ) : (
          <ul className="divide-y divide-rule border-2 border-ink bg-surface">
            {words?.map((w) => (
              <li key={w.id} className="flex items-start gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-lg font-semibold" lang="cs">{w.cs}</p>
                  {w.en && <p className="text-ink-2">{w.en}</p>}
                  {(w.place || w.note) && <p className="text-sm text-ink-3">{[w.place, w.note].filter(Boolean).join(' · ')}</p>}
                  {w.link && <div className="mt-2"><LinkChip link={w.link} word={w.cs} /></div>}
                </div>
                <button
                  type="button"
                  aria-label={`Delete ${w.cs}`}
                  onClick={() => { if (window.confirm(`Delete "${w.cs}" and its reviews?`)) void deleteOwnWord(w.id!); }}
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-ink-2 hover:bg-paper-2"
                >
                  <IconClose size={18} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
