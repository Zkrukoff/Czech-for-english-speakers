import { course } from '@/content';
import { namesOn, needsCheck } from '@/lib/namedays';

/** "Dnes má svátek …": today's Czech name day, the daily hook (brief 2.3). */
export function NameDay({ date = new Date() }: { date?: Date }) {
  const names = namesOn(date, course.namedays);
  const day = date.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long' });
  return (
    <section aria-labelledby="svatek-h" className="border-2 border-ink bg-champagne-tint p-4 shadow-offset-sm">
      <p className="label-board text-ink-2">
        <span lang="cs">{day}</span> · jmeniny
      </p>
      {names.length > 0 ? (
        <>
          <h2 id="svatek-h" className="mt-1 font-display text-2xl font-extrabold leading-tight" lang="cs">
            Dnes má svátek {names.join(', ')}.
          </h2>
          <p className="mt-2 text-sm text-ink-2">
            Today is the name day for people called {names.join(' and ')}: colleagues may bring cake. Say{' '}
            <b lang="cs">Všechno nejlepší k svátku!</b>
          </p>
        </>
      ) : (
        <>
          <h2 id="svatek-h" className="mt-1 font-display text-2xl font-extrabold leading-tight" lang="cs">
            Dnes nemá svátek nikdo.
          </h2>
          <p className="mt-2 text-sm text-ink-2">No name day today. Like a tram stop at 3 a.m.</p>
        </>
      )}
      {needsCheck(date, course.namedays) && <p className="mt-2 text-xs text-ink-3">Today's entry is waiting for a native speaker's check.</p>}
    </section>
  );
}
