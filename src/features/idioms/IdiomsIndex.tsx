import { Link } from 'react-router-dom';
import { course } from '@/content';
import { PageHeader } from '@/components/PageHeader';
import { idiomOfWeek, isoWeek } from '@/lib/idioms';
import { IdiomDetail } from './IdiomDetail';
import { pragueNow } from '@/lib/pragueTime';

export function IdiomsIndex() {
  const now = pragueNow();
  const current = idiomOfWeek(course.idioms, now);
  return (
    <>
      <PageHeader title="Idiom of the week" cs="Idiom týdne" subtitle="One Czech idiom a week, the same for everyone. Each one is checked against the Czech Academy of Sciences' dictionaries, with what it says word for word and what it actually means." />
      {current && <IdiomDetail idiom={current} week={isoWeek(now)} />}
      <section aria-labelledby="idioms-all" className="mt-14">
        <h2 id="idioms-all" className="label-board mb-4 text-ink-3">All idioms</h2>
        <ul className="grid gap-x-8 sm:grid-cols-2">
          {course.idioms.map((i) => (
            <li key={i.id} className="border-b-2 border-rule">
              <Link to={`/idioms/${i.id}`} className="block py-3 hover:underline">
                <span lang="cs" className="block font-semibold">{i.cs}</span>
                <span className="block text-sm text-ink-2">{i.meaning}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
