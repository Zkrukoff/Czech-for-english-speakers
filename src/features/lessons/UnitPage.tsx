import { Link, useParams } from 'react-router-dom';
import { course } from '@/content';
import { PageHeader } from '@/components/PageHeader';
import { NotFound } from '@/components/NotFound';
import { GoalList } from '@/components/GoalList';
import { unitColour } from '@/components/unitColours';
import { useLessonProgress } from '@/db/hooks';

export function UnitPage() {
  const { unitId = '' } = useParams();
  const unit = course.unitsById.get(unitId);
  const lessons = useLessonProgress();
  if (!unit) return <NotFound what="unit" />;
  const c = unitColour(unit.number);
  return (
    <>
      <PageHeader eyebrow={`Unit ${unit.number}${unit.titleCs ? ` · ${unit.titleCs}` : ''}`} title={unit.title} subtitle={unit.situation} />
      <div className="grid gap-8 md:grid-cols-[1fr_20rem]">
        <section aria-labelledby="lessons-heading">
          <h2 id="lessons-heading" className="sr-only">Lessons</h2>
          {/* The unit as a metro line: each lesson is a stop, the unit check is the terminus. */}
          <ol className="relative">
            <span aria-hidden className={`absolute bottom-6 left-[21px] top-6 w-2 rounded-full ${c.bg}`} />
            {unit.lessonList.map((l) => {
              const done = !!lessons.get(l.id)?.completedAt;
              return (
                <li key={l.id} className="relative mb-3">
                  <Link to={`/lessons/${l.id}`} className="group flex items-center gap-5 rounded-2xl py-2 pr-3">
                    <span className={`relative z-[1] flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-[5px] font-display text-lg font-extrabold transition-transform group-hover:scale-110 ${c.border} ${done ? `${c.bg} ${c.text}` : 'bg-white text-ink'}`}>
                      {done ? '✓' : l.number}
                    </span>
                    <span className="card card-link flex flex-1 items-center justify-between gap-3 px-5 py-4">
                      <span>
                        <span className="eyebrow block">Lesson {l.number}</span>
                        <span className="text-lg font-semibold text-ink">{l.title}</span>
                      </span>
                      {done && <span className="chip">practised</span>}
                    </span>
                  </Link>
                </li>
              );
            })}
            <li className="relative">
              <Link to={`/units/${unit.id}/check`} className="group flex items-center gap-5 rounded-2xl py-2 pr-3">
                <span className={`relative z-[1] flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-display text-xl font-extrabold text-night-text transition-transform group-hover:scale-110 bg-night`}>
                  ★
                </span>
                <span className="board flex flex-1 items-center justify-between gap-3 rounded-2xl px-5 py-4">
                  <span>
                    <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-metro-b" lang="cs">Konečná</span>
                    <span className="text-lg font-semibold">Unit check: what can you do?</span>
                  </span>
                  <span aria-hidden>→</span>
                </span>
              </Link>
            </li>
          </ol>
        </section>
        <aside className="card self-start p-5">
          <h2 className="mb-3 text-xl font-bold">By the end of this unit</h2>
          <GoalList goals={unit.canDo} />
        </aside>
      </div>
    </>
  );
}
