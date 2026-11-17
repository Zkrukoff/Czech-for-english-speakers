import { Link } from 'react-router-dom';
import { course } from '@/content';
import { EnamelPlate } from '@/components/ui';
import { namesOn, needsCheck } from '@/lib/namedays';
import { holidaysOn, inDaysCs, nextHoliday } from '@/lib/holidays';

const SHOPS = { closed: 'Larger shops are closed today.', noon: 'Larger shops close at midday.', open: 'Shops are open as usual.' } as const;

/**
 * "Dnes": the daily hook on the home screen. Today's public holiday (if
 * there is one), today's name day, and a countdown to the next holiday.
 */
export function Today({ date = new Date() }: { date?: Date }) {
  const day = date.toLocaleDateString('cs-CZ', { weekday: 'long', day: 'numeric', month: 'long' });
  const holidays = holidaysOn(date, course.holidays);
  const names = namesOn(date, course.namedays);
  const next = nextHoliday(date, course.holidays);

  return (
    <section aria-labelledby="today-h" className="border-2 border-ink bg-surface shadow-offset-sm">
      <h2 id="today-h" className="label-board border-b-2 border-ink px-4 py-2 text-ink-2">
        <span lang="cs">Dnes</span> · <span lang="cs">{day}</span>
      </h2>

      {holidays.map((h) => (
        <div key={h.id} className="border-b-2 border-ink bg-ticket p-4 text-on-fill-dark">
          <EnamelPlate tone="red" size="sm">Státní svátek · public holiday</EnamelPlate>
          <p lang="cs" className="mt-3 font-display text-2xl font-extrabold leading-tight">{h.cs}</p>
          <p className="mt-1 font-semibold">{h.en}</p>
          <p className="mt-2 text-sm">{h.about}</p>
          <p className="mt-2 text-sm">{SHOPS[h.shops]}</p>
          {h.greeting && (
            <p className="mt-2 text-sm">
              Say <b lang="cs">{h.greeting.cs}</b> ({h.greeting.en})
            </p>
          )}
        </div>
      ))}

      <div className="bg-champagne-tint p-4">
        <p className="label-board text-ink-3">Jmeniny · name day</p>
        {names.length > 0 ? (
          <>
            <p lang="cs" className="mt-1 font-display text-2xl font-extrabold leading-tight">Dnes má svátek {names.join(', ')}.</p>
            <p className="mt-2 text-sm text-ink-2">
              Today is the name day for people called {names.join(' and ')}: colleagues may bring cake. Say <b lang="cs">Všechno nejlepší k svátku!</b>
            </p>
          </>
        ) : (
          <>
            <p lang="cs" className="mt-1 font-display text-2xl font-extrabold leading-tight">Dnes nemá svátek nikdo.</p>
            <p className="mt-2 text-sm text-ink-2">No name day today. Like a tram stop at 3 a.m.</p>
          </>
        )}
        {needsCheck(date, course.namedays) && <p className="mt-2 text-xs text-ink-3">Today's entry is waiting for a native speaker's check.</p>}
      </div>

      {next && (
        <div className="border-t-2 border-ink p-4">
          <p className="label-board text-ink-3">Příští svátek · next holiday</p>
          <div className="mt-1 flex items-baseline justify-between gap-3">
            <p className="min-w-0">
              <span lang="cs" className="block font-semibold">{next.holiday.cs}</span>
              <span className="block text-sm text-ink-2">
                {next.holiday.en} ·{' '}
                {next.date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long' })}
              </span>
            </p>
            <p className="shrink-0 text-right">
              <span className="block font-display text-3xl font-extrabold tabular-nums leading-none">{next.days}</span>
              <span lang="cs" className="text-sm text-ink-2">{inDaysCs(next.days)}</span>
            </p>
          </div>
          <Link to="/guides/culture?tab=holidays" className="mt-2 inline-block text-sm text-vltava underline">All Czech holidays</Link>
        </div>
      )}
    </section>
  );
}
