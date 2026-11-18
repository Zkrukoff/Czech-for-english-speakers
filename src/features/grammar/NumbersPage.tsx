import { useState } from 'react';
import { Link } from 'react-router-dom';
import { course } from '@/content';
import type { Exercise } from '@/content/schema';
import { PageHeader } from '@/components/PageHeader';
import { SectionNumber } from '@/components/ui';
import { IconArrowLeft } from '@/components/icons';
import { ExerciseRunner } from '@/features/exercises/ExerciseRunner';
import { scheduleAnswer } from '@/db/srs';
import { canDrill, numberDrill } from '@/lib/drills/numbers';

const NUMBERS = [1, 2, 3, 4, 5, 6, 10, 20];

function session(seed: number): { exercise: Exercise; key?: string }[] {
  const nouns = [...course.lexicon.values()].filter((e) => canDrill(e.noun, e.paradigm) && !/^[A-ZÁ-Ž]/.test(e.noun.lemma));
  let x = seed % 2147483647 || 1;
  const rnd = () => (x = (x * 48271) % 2147483647) / 2147483647;
  const out: { exercise: Exercise; key?: string }[] = [];
  for (let i = 0; out.length < 10 && i < 60; i++) {
    const e = nouns[Math.floor(rnd() * nouns.length)]!;
    const n = NUMBERS[Math.floor(rnd() * NUMBERS.length)]!;
    const exercise = numberDrill(e.noun, e.paradigm, n);
    if (out.some((o) => o.exercise.id === exercise.id)) continue;
    out.push({ exercise, key: n === 1 ? undefined : n <= 4 ? 'fn:quantity-2-4' : 'fn:quantity-5plus' });
  }
  return out;
}

/** Numbers and case agreement as its own skill (brief 2.2 #6). */
export function NumbersPage() {
  const [run, setRun] = useState<number | null>(null);
  const [done, setDone] = useState<{ right: number; total: number } | null>(null);
  const items = run === null ? [] : session(run);
  const keyOf = new Map(items.map((i) => [i.exercise, i.key]));
  const rows: [string, string, string, string][] = [
    ['1', 'jeden / jedna / jedno', 'nominative singular', 'jedno pivo, jedna koruna'],
    ['2–4', 'dva (m.) / dvě (f., n.), tři, čtyři', 'plural (= nominative plural)', 'dvě piva, tři koruny'],
    ['5 and up', 'pět, šest … deset … dvacet …', 'genitive plural', 'pět piv, deset korun'],
  ];
  return (
    <>
      <Link to="/grammar" className="inline-flex min-h-11 items-center gap-1 text-sm text-vltava hover:underline"><IconArrowLeft size={16} /> Mluvnice</Link>
      <PageHeader eyebrow="Čísla · numbers" title="Numbers change the noun" subtitle="One beer, two beers, five beers: in Czech the noun's ending depends on the number. It comes up all day: prices, tram numbers, minutes, colleagues." />
      <div className="-mx-4 overflow-x-auto px-4 pb-2">
      <table className="w-full min-w-[34rem] border-2 border-ink bg-surface text-left shadow-offset-sm">
        <caption className="sr-only">Which form follows which number</caption>
        <thead className="border-b-2 border-ink">
          <tr>
            {['Number', 'Number word', 'Noun form', 'Example'].map((h) => <th key={h} scope="col" className="label-board px-3 py-2 text-ink-3">{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map(([n, w, f, e]) => (
            <tr key={n} className="border-t border-rule align-top">
              <th scope="row" className="px-3 py-2 font-mono font-bold">{n}</th>
              <td className="px-3 py-2" lang="cs">{w}</td>
              <td className="px-3 py-2">{f}</td>
              <td className="px-3 py-2 font-semibold" lang="cs">{e}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      <p className="mt-4 max-w-2xl text-sm text-ink-2">
        <span lang="cs">Kolik</span> (how many), <span lang="cs">hodně</span> (a lot) and <span lang="cs">málo</span> (few) also take the genitive plural: <i lang="cs">kolik korun?</i> In the case lens these are "after 2, 3, 4" and "after 5 and more".
      </p>

      <section aria-labelledby="num-drill" className="mt-10">
        <SectionNumber n={1} id="num-drill">Drill</SectionNumber>
        <p className="mt-3 max-w-2xl text-ink-2">Ten nouns from the course with a number. Type the number (as a word or digits) and the noun. Every form comes from the checked lexicon.</p>
        {run === null || done ? (
          <div className="mt-5 flex flex-wrap items-center gap-4">
            {done && <p className="font-semibold">{done.right} of {done.total} right.</p>}
            <button type="button" className="btn btn-primary" onClick={() => { setDone(null); setRun(Date.now()); }}>{done ? 'Another ten' : 'Start'}</button>
          </div>
        ) : (
          <div className="mt-5">
            <ExerciseRunner
              key={run}
              exercises={items.map((i) => i.exercise)}
              context="lesson"
              retryMissed={false}
              onAnswer={async (o) => {
                const key = keyOf.get(o.exercise);
                if (key) await scheduleAnswer(key, o.exercise.skills, o.result.status);
              }}
              onFinish={(o) => setDone({ right: o.filter((x) => x.result.accepted).length, total: o.length })}
            />
          </div>
        )}
      </section>
    </>
  );
}
