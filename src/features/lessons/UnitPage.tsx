import { useRouteUnit } from './useRouteUnit';
import { unitCheckPath } from '@/lib/paths';
import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/PageHeader';
import { NotFound } from '@/components/NotFound';
import { GoalList } from '@/components/GoalList';
import { unitColour } from '@/components/unitColours';
import { useLessonProgress } from '@/db/hooks';
import { IconArrowRight, IconDone, IconTerminus } from '@/components/icons';

export function UnitPage() {
  const unit = useRouteUnit();
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
                    <span className={`relative z-[1] flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-[5px] font-display text-lg font-extrabold transition-transform group-hover:scale-110 ${c.border} ${done ? `${c.bg} ${c.text}` : 'bg-surface text-ink'}`}>
                      {done ? <IconDone size={24} /> : l.number}
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
              <Link to={unitCheckPath(unit.id)} className="group flex items-center gap-5 rounded-2xl py-2 pr-3">
                <span className={`relative z-[1] flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-display text-xl font-extrabold text-on-fill-light transition-transform group-hover:scale-110 bg-board`}>
                  <IconTerminus size={22} />
                </span>
                <span className="board flex flex-1 items-center justify-between gap-3 rounded-2xl px-5 py-4">
                  <span>
                    <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-line-b" lang="cs">Konečná</span>
                    <span className="text-lg font-semibold">Unit check: what can you do?</span>
                  </span>
                  <IconArrowRight size={20} />
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
