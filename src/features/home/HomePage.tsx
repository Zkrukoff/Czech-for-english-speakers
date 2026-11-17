import { unitPath } from '@/lib/paths';
import { Link } from 'react-router-dom';
import { course } from '@/content';
import { GoalList } from '@/components/GoalList';
import { TileGrid } from '@/components/ui';
import { unitColour } from '@/components/unitColours';
import { useDueSummary } from '@/db/useDue';
import { useLessonProgress } from '@/db/hooks';
import { IconArrowRight } from '@/components/icons';

export function HomePage() {
  const due = useDueSummary();
  const lessons = useLessonProgress();
  const allLessons = course.units.flatMap((u) => u.lessonList);
  const practised = allLessons.filter((l) => lessons.get(l.id)?.completedAt).length;
  const next = allLessons.find((l) => !lessons.get(l.id)?.completedAt);
  const nextUnit = next ? course.unitsById.get(next.unitId) : undefined;
  const isNew = practised === 0;

  return (
    <>
      {/* Hero */}
      <section className="relative mb-14 grid items-center gap-8 md:grid-cols-[1.35fr_1fr]">
        <div className="animate-rise">
          <p className="chip mb-5">
            <span className="h-2 w-2 rounded-full bg-line-a" aria-hidden />
            For English speakers living and working in Czechia
          </p>
          <h1 className="text-5xl font-extrabold leading-[0.95] tracking-tight text-ink sm:text-6xl">
            The Czech you need <span className="marker">at work</span>, explained properly.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-2">
            Short lessons built around your week in Prague: colleagues, lunch near the office, the tram home, the people around you.
            Real grammar, answers you type yourself, reviews timed to your mistakes. No streaks, no points.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {next && (
              <Link to={`/lessons/${next.id}`} className="btn btn-primary">
                {isNew ? 'Start lesson 1' : 'Continue learning'} <IconArrowRight size={16} className="inline-block align-[-3px]" />
              </Link>
            )}
            <Link to="/alphabet" className="btn btn-secondary">The alphabet</Link>
          </div>
        </div>
        <div className="relative hidden md:block" aria-hidden>
          <TileGrid tone="var(--tile-09)" cols={7} rows={7} size={40} className="w-full border-2 border-ink" />
          <span lang="cs" className="board absolute -bottom-3 -left-4 -rotate-6 rounded-xl px-4 py-2 font-display text-xl font-extrabold text-line-b shadow-offset">
            Ahoj, Praho!
          </span>
        </div>
      </section>

      {/* Next stop / reviews */}
      <section aria-label="Where to start" className="mb-16 grid gap-4 md:grid-cols-3">
        {next && nextUnit ? (
          <Link to={`/lessons/${next.id}`} className="card-link group board relative flex flex-col overflow-hidden rounded-2xl p-6 md:col-span-2">
            <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-line-b">
              <span className="h-2 w-2 animate-pulse rounded-full bg-line-b" aria-hidden />
              <span lang="cs">Příští zastávka</span> · next stop
            </span>
            <span className="mt-3 font-display text-3xl font-extrabold tracking-tight text-line-b" style={{ fontFamily: 'var(--font-display)' }}>
              {next.title}
            </span>
            <span className="mt-2 text-sm text-on-fill-light/70">
              Unit {nextUnit.number}: {nextUnit.title} · lesson {next.number} of {nextUnit.lessonList.length}
            </span>
            <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-on-fill-light group-hover:underline">
              {isNew ? 'Board here' : 'Continue'} <IconArrowRight size={16} className="inline-block align-[-3px]" />
            </span>
          </Link>
        ) : (
          <div className="card p-6 md:col-span-2">
            <span className="eyebrow">Konečná · end of the line</span>
            <p className="mt-2 text-ink-2">All lessons practised. Keep up your reviews, and check each unit's goals on the progress page.</p>
          </div>
        )}
        {due && due.dueNow > 0 ? (
          <Link to="/review" className="card card-link group flex flex-col p-6">
            <span className="eyebrow">Reviews</span>
            <span className="mt-2 font-display text-4xl font-extrabold tabular-nums text-ink" style={{ fontFamily: 'var(--font-display)' }}>{due.dueNow}</span>
            <span className="text-sm text-ink-2">ready, from your own answers</span>
            <span className="mt-auto pt-4 text-sm font-semibold text-vltava group-hover:underline">Review <IconArrowRight size={16} className="inline-block align-[-3px]" /></span>
          </Link>
        ) : (
          <Link to="/guides/prague-transport" className="card card-link group flex flex-col p-6">
            <span className="eyebrow">Guide</span>
            <span className="mt-2 text-xl font-bold text-ink">Getting around Prague</span>
            <span className="mt-1 text-sm text-ink-2">The metro map, tickets, and every announcement you'll hear.</span>
            <span className="mt-auto pt-4 text-sm font-semibold text-vltava group-hover:underline">Open the guide <IconArrowRight size={16} className="inline-block align-[-3px]" /></span>
          </Link>
        )}
      </section>

      {/* Units as metro lines */}
      <section aria-labelledby="units-heading">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="metro-stripe mb-3" aria-hidden />
            <h2 id="units-heading" className="text-3xl font-extrabold tracking-tight">Your lines</h2>
          </div>
          <span className="text-sm text-ink-3">{practised} of {allLessons.length} stops reached</span>
        </div>
        <ol className="grid gap-5 sm:grid-cols-2">
          {course.units.map((u) => {
            const c = unitColour(u.number);
            const done = u.lessonList.map((l) => !!lessons.get(l.id)?.completedAt);
            return (
              <li key={u.id}>
                <Link to={unitPath(u.id)} className="card card-link flex h-full flex-col p-6">
                  <div className="flex items-center gap-3">
                    <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-display text-xl font-extrabold ${c.bg} ${c.text}`} style={{ fontFamily: 'var(--font-display)' }}>
                      {u.number}
                    </span>
                    <div>
                      <h3 className="font-display text-xl font-bold leading-tight tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>{u.title}</h3>
                      {u.titleCs && <p lang="cs" className="text-ink-3">{u.titleCs}</p>}
                    </div>
                  </div>
                  {/* The unit's lessons as stops on its line. */}
                  <div className="relative mt-5 flex items-center justify-between px-1" aria-label={`${done.filter(Boolean).length} of ${done.length} lessons practised`}>
                    <span className={`absolute left-2 right-2 top-1/2 h-1.5 -translate-y-1/2 rounded-full ${c.bg}`} aria-hidden />
                    {done.map((d, i) => (
                      <span
                        key={i}
                        aria-hidden
                        className={`relative z-[1] h-4 w-4 rounded-full border-[3px] ${c.border} ${d ? c.bg : 'bg-surface'}`}
                      />
                    ))}
                  </div>
                  <p className="mt-4 text-sm text-ink-2">{u.situation}</p>
                  <div className="mt-4 border-t border-rule pt-3 text-sm">
                    <GoalList goals={u.canDo} />
                  </div>
                </Link>
              </li>
            );
          })}
        </ol>
      </section>

      {course.guides.length > 0 && (
        <section aria-labelledby="guides-heading" className="mt-16">
          <div className="metro-stripe mb-3" aria-hidden />
          <h2 id="guides-heading" className="mb-6 text-3xl font-extrabold tracking-tight">Guides to life in Czechia</h2>
          <ul className="grid gap-5 sm:grid-cols-2">
            {course.guides.map((g, i) => (
              <li key={g.id}>
                <Link to={`/guides/${g.id}`} className="card card-link group relative flex h-full flex-col overflow-hidden p-6">
                  <TileGrid tone={`var(--tile-${i % 2 ? "16" : "04"})`} cols={4} rows={2} size={28} className="absolute -right-6 -top-4 w-36 opacity-80 border-2 border-ink" />
                  <span className="relative max-w-[70%] font-display text-xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>{g.title}</span>
                  {g.titleCs && <span lang="cs" className="relative text-ink-3">{g.titleCs}</span>}
                  <span className="relative mt-3 flex-1 text-sm text-ink-2">{g.summary}</span>
                  <span className="relative mt-4 text-sm font-semibold text-vltava group-hover:underline">Open the guide <IconArrowRight size={16} className="inline-block align-[-3px]" /></span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
