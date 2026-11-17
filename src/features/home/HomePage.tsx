import { Link, Navigate } from 'react-router-dom';
import { course } from '@/content';
import { DepartureBoard, LineBadge, TileGrid } from '@/components/ui';
import { useDueSummary } from '@/db/useDue';
import { useProfile } from '@/db/hooks';
import { IconArrowRight, IconReview } from '@/components/icons';
import { stationPath } from '@/lib/paths';
import { LineStrip } from './LineStrip';
import { LineVertical } from './LineVertical';
import { Today } from './Today';
import { HolidayPrepBanner } from './HolidayPrepBanner';
import { RideCard } from './RideCard';
import { useLinePosition } from './useLinePosition';

/** Home: the line you're riding, where you are, what's next, and today's name day. */
export function HomePage() {
  const due = useDueSummary();
  const profile = useProfile();
  const pos = useLinePosition();
  const [lineA, ...otherLines] = course.lines;
  const nextUnit = pos.nextLesson ? course.unitsById.get(pos.nextLesson.unitId) : undefined;
  const isNew = pos.practised === 0;
  // A brand-new learner (no profile, no progress) starts with onboarding.
  if (profile === null) return <Navigate to="/welcome" replace />;

  return (
    <>
      <section aria-labelledby="line-h" className="mb-10">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="label-board text-ink-3">{isNew ? 'Vítejte · welcome aboard' : 'Jedeme · on your way'}</p>
            <h1 id="line-h" className="mt-1 flex items-center gap-3 text-4xl font-extrabold tracking-tight sm:text-5xl">
              <LineBadge line="A" size={48} /> <span>Linka A</span>
            </h1>
          </div>
          <p className="text-sm text-ink-2">
            <span className="font-mono">A1–A2</span> · {pos.practised} of {pos.total} lessons practised
          </p>
        </div>
        {/* Phones: the line runs top to bottom with unit names written out. Wider screens: a strip map, unit names on hover. */}
        <div className="border-2 border-ink bg-surface p-3 shadow-offset sm:hidden">
          <LineVertical line={lineA!} stateOf={pos.stateOf} homeKey={profile?.homeStation} />
        </div>
        <div className="hidden min-w-0 border-2 border-ink bg-surface pt-2 shadow-offset sm:block">
          <LineStrip line={lineA!} stateOf={pos.stateOf} homeKey={profile?.homeStation} />
        </div>
        <p className="mt-2 text-xs text-ink-3">
          Filled: done · yellow: you are here · dashed: <span lang="cs">výluka</span>, still being written · double ring: milestone.
          <span className="hidden sm:inline"> Point at a station to see what's taught there.</span>
        </p>
      </section>

      <HolidayPrepBanner />

      <section aria-label="Today" className="mb-12 grid gap-5 md:grid-cols-[1.4fr_1fr]">
        {pos.nextLesson && nextUnit && pos.current ? (
          <Link to={`/lessons/${pos.nextLesson.id}`} className="card-link group board flex min-w-0 flex-col rounded-md border-2 border-ink p-5 sm:p-6">
            <span className="label-board text-line-b" lang="cs">Příští zastávka · next stop</span>
            <DepartureBoard text={course.stopByUnit.get(nextUnit.id)!.stationInfo.name.toUpperCase()} className="mt-3 text-2xl sm:text-3xl" />
            <span className="mt-4 font-display text-2xl font-extrabold leading-tight text-on-fill-light">{pos.nextLesson.title}</span>
            <span className="mt-1 text-sm text-on-fill-light/80">
              {nextUnit.title} · lekce {pos.nextLesson.number}/{nextUnit.lessonList.length}
            </span>
            <span className="mt-5 inline-flex items-center gap-2 font-semibold text-line-b group-hover:underline">
              {isNew ? 'Nastupovat · board here' : 'Pokračovat · continue'} <IconArrowRight size={18} />
            </span>
          </Link>
        ) : (
          <div className="board rounded-md border-2 border-ink p-6">
            <span className="label-board text-line-b" lang="cs">Konečná · end of the line, for now</span>
            <p className="mt-3 text-on-fill-light">Every lesson so far is practised. Keep your reviews ticking over; new stations open as they're written.</p>
            {pos.current && (
              <Link to={stationPath(pos.current)} className="mt-4 inline-flex items-center gap-2 font-semibold text-line-b underline">
                {pos.current.stationInfo.name} <IconArrowRight size={18} />
              </Link>
            )}
          </div>
        )}
        <div className="grid min-w-0 gap-5">
          <RideCard />
          <Link to="/review" className="card card-link group flex items-center gap-4 p-5">
            <IconReview size={32} className="shrink-0" />
            <span className="flex-1">
              <span className="label-board block text-ink-3" lang="cs">Opakování</span>
              {due && due.dueNow > 0 ? (
                <span className="font-display text-3xl font-extrabold tabular-nums">{due.dueNow} <span className="text-base font-semibold text-ink-2">due now</span></span>
              ) : (
                <span className="text-ink-2">Nothing due. <span lang="cs">Hotovo.</span></span>
              )}
            </span>
            <IconArrowRight size={18} className="text-ink-3 group-hover:text-ink" />
          </Link>
          <Link to="/words" className="card card-link group flex items-center justify-between gap-3 p-4">
            <span>
              <span className="label-board block text-ink-3" lang="cs">Moje slova</span>
              <span className="text-ink-2">Saw a new word today? Save it.</span>
            </span>
            <IconArrowRight size={18} className="text-ink-3 group-hover:text-ink" />
          </Link>
          <Today />
        </div>
      </section>

      {isNew && (
        <section className="mb-12 max-w-2xl">
          <p className="text-lg text-ink-2">
            Short lessons built around your week in Prague: colleagues, lunch near the office, the tram home. Real grammar, answers you type yourself,
            reviews timed to your mistakes. No streaks, no points: you ride the line, and finished stations get a stamp on your ticket.
          </p>
          <Link to="/alphabet" className="btn btn-secondary mt-4">First: the sounds of Czech</Link>
        </section>
      )}

      <section aria-labelledby="other-lines-h" className="mb-14">
        <h2 id="other-lines-h" className="label-board mb-3 text-ink-3">Zatím nejezdí · not in service yet</h2>
        <div className="grid gap-4">
          {otherLines.map((l) => (
            <div key={l.id} className="min-w-0 border-2 border-dashed border-rule-strong bg-paper-2 px-3 pt-1">
              <p className="flex items-center gap-2 pt-2 text-sm font-semibold text-ink-2">
                <LineBadge line={l.id} size={26} /> Linka {l.id} · <span className="font-mono">{l.levels.join('–')}</span>
              </p>
              <LineStrip line={l} stateOf={() => 'vyluka'} homeKey={profile?.homeStation} compact />
            </div>
          ))}
        </div>
      </section>

      {course.guides.length > 0 && (
        <section aria-labelledby="guides-heading">
          <h2 id="guides-heading" className="mb-5 text-3xl font-extrabold tracking-tight">
            <span lang="cs">Průvodce</span> <span className="text-ink-3">· life in Czechia</span>
          </h2>
          <ul className="grid gap-5 sm:grid-cols-2">
            {course.guides.map((g, i) => (
              <li key={g.id}>
                <Link to={`/guides/${g.id}`} className="card card-link group relative flex h-full flex-col overflow-hidden p-6">
                  <TileGrid tone={`var(--tile-${i % 2 ? '16' : '04'})`} cols={4} rows={2} size={28} className="absolute -right-6 -top-4 w-36 border-2 border-ink opacity-80" />
                  <span className="relative max-w-[70%] font-display text-xl font-bold tracking-tight">{g.title}</span>
                  {g.titleCs && <span lang="cs" className="relative text-ink-3">{g.titleCs}</span>}
                  <span className="relative mt-3 flex-1 text-sm text-ink-2">{g.summary}</span>
                  <span className="relative mt-4 inline-flex items-center gap-1 text-sm font-semibold text-vltava group-hover:underline">
                    Open the guide <IconArrowRight size={16} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
