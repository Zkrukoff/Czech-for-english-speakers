import { Link, useParams } from 'react-router-dom';
import { course } from '@/content';
import { PageHeader } from '@/components/PageHeader';
import { NotFound } from '@/components/NotFound';
import { GoalList } from '@/components/GoalList';
import { useLessonProgress } from '@/db/hooks';

export function UnitPage() {
  const { unitId = '' } = useParams();
  const unit = course.unitsById.get(unitId);
  const lessons = useLessonProgress();
  if (!unit) return <NotFound what="unit" />;
  return (
    <>
      <PageHeader eyebrow={`Unit ${unit.number}${unit.titleCs ? ` · ${unit.titleCs}` : ''}`} title={unit.title} subtitle={unit.situation} />
      <section className="mb-8 rounded-xl border border-stone-200 bg-white p-5">
        <h2 className="mb-2 font-semibold">By the end of this unit</h2>
        <GoalList goals={unit.canDo} />
      </section>
      <h2 className="mb-3 font-semibold">Lessons</h2>
      <ol className="space-y-2">
        {unit.lessonList.map((l) => {
          const done = !!lessons.get(l.id)?.completedAt;
          return (
            <li key={l.id}>
              <Link to={`/lessons/${l.id}`} className="flex items-center gap-4 rounded-lg border border-stone-200 bg-white px-4 py-3 hover:border-stone-400">
                <span className="w-4 text-sm font-medium text-stone-400">{l.number}</span>
                <span className="font-medium">{l.title}</span>
                {done && <span className="ml-auto text-sm text-emerald-700">practised ✓</span>}
              </Link>
            </li>
          );
        })}
      </ol>
      <Link to={`/units/${unit.id}/check`} className="btn btn-primary mt-6">
        Unit check: what can you do?
      </Link>
    </>
  );
}
