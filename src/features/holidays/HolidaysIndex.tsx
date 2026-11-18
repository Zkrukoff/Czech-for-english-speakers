import { Link } from 'react-router-dom';
import { course } from '@/content';
import { PageHeader } from '@/components/PageHeader';
import { EnamelPlate } from '@/components/ui';
import { IconArrowRight } from '@/components/icons';
import { featuredPrep, inDaysCs, nextDateFor } from '@/lib/holidays';
import { pragueNow } from '@/lib/pragueTime';

/** All holiday prep lessons, soonest first. Open all year; the one coming up is highlighted. */
export function HolidaysIndex() {
  const now = pragueNow();
  const featured = featuredPrep(now, course.holidays, course.holidayLessons);
  const rows = course.holidayLessons
    .map((l) => ({ l, date: nextDateFor(l.holidays, now, course.holidays) }))
    .sort((a, b) => (a.date?.getTime() ?? 0) - (b.date?.getTime() ?? 0));
  return (
    <>
      <PageHeader title="Czech holidays" cs="Svátky" subtitle="A short lesson for each public holiday: the words, what people actually do, what to say, and what's open. Each one is featured on your home screen the week before." />
      <ul className="grid gap-4 sm:grid-cols-2">
        {rows.map(({ l, date }) => {
          const isFeatured = featured?.lesson.id === l.id;
          const days = date ? Math.round((date.getTime() - new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()) / 86_400_000) : null;
          return (
            <li key={l.id}>
              <Link to={`/holidays/${l.id}`} className={`group flex h-full flex-col border-2 p-5 transition-transform hover:-translate-y-0.5 ${isFeatured ? 'border-ink bg-ticket text-on-fill-dark shadow-offset' : 'border-ink bg-surface shadow-offset-sm'}`}>
                {isFeatured && <EnamelPlate tone="red" size="sm">{days === 0 ? 'Dnes · today' : 'Tento týden · this week'}</EnamelPlate>}
                <span lang="cs" className="mt-2 font-display text-2xl font-extrabold">{l.titleCs}</span>
                <span className="font-semibold">{l.title}</span>
                {date && (
                  <span className={`mt-2 text-sm ${isFeatured ? '' : 'text-ink-2'}`}>
                    {date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })} · <span lang="cs">{days === 0 ? 'dnes' : inDaysCs(days!)}</span>
                  </span>
                )}
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold group-hover:underline">Open <IconArrowRight size={16} /></span>
              </Link>
            </li>
          );
        })}
      </ul>
      {course.holidays?.verified.length ? (
        <p className="mt-8 text-xs text-ink-3">
          Dates and shop rules checked {course.holidays.verified[0]!.date}:{' '}
          {course.holidays.verified.map((v, i) => (
            <span key={v.url}>{i > 0 && ', '}<a href={v.url} className="underline" target="_blank" rel="noreferrer">{new URL(v.url).hostname}</a></span>
          ))}
          .
        </p>
      ) : null}
    </>
  );
}
