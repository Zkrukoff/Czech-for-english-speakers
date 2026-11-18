import { Link } from 'react-router-dom';
import { course } from '@/content';
import { EnamelPlate, TileGrid } from '@/components/ui';
import { IconArrowRight } from '@/components/icons';
import { featuredPrep, inDaysCs } from '@/lib/holidays';
import { pragueNow } from '@/lib/pragueTime';

/** In the week before a holiday (and on the day), its prep lesson is featured on Home. */
export function HolidayPrepBanner({ date = pragueNow() }: { date?: Date }) {
  const f = featuredPrep(date, course.holidays, course.holidayLessons);
  if (!f) return null;
  return (
    <section aria-labelledby="prep-h" className="mb-10">
      <Link to={`/holidays/${f.lesson.id}`} className="group relative block overflow-hidden border-2 border-ink bg-ticket text-on-fill-dark shadow-offset transition-transform hover:-translate-y-0.5">
        <TileGrid tone="var(--tile-02)" cols={14} rows={1} size={30} className="w-full border-b-2 border-ink" />
        <div className="flex flex-wrap items-end justify-between gap-4 p-5">
          <div>
            <EnamelPlate tone="red" size="sm">{f.days === 0 ? 'Dnes je svátek · today' : `Svátek ${inDaysCs(f.days)}`}</EnamelPlate>
            <h2 id="prep-h" className="mt-3 font-display text-3xl font-extrabold leading-tight" lang="cs">{f.lesson.titleCs}</h2>
            <p className="font-semibold">{f.lesson.title}: get ready in five minutes</p>
            <p className="mt-1 max-w-xl text-sm">{f.lesson.intro}</p>
          </div>
          <span className="inline-flex items-center gap-2 font-semibold group-hover:underline">
            Prep lesson <IconArrowRight size={18} />
          </span>
        </div>
      </Link>
    </section>
  );
}
