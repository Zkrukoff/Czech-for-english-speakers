import { Link, useParams } from 'react-router-dom';
import { course } from '@/content';
import { PageHeader } from '@/components/PageHeader';
import { NotFound } from '@/components/NotFound';

export function UnitPage() {
  const { unitId = '' } = useParams();
  const unit = course.unitsById.get(unitId);
  if (!unit) return <NotFound what="unit" />;
  return (
    <>
      <PageHeader eyebrow={`Unit ${unit.number}`} title={unit.title} subtitle={unit.situation} />
      <section className="mb-8 rounded-xl border border-stone-200 bg-white p-5">
        <h2 className="font-semibold">By the end of this unit</h2>
        <ul className="mt-2 space-y-1">
          {unit.canDo.map((g) => (
            <li key={g.id} className="flex gap-2 text-stone-700">
              <span aria-hidden className="text-stone-400">○</span>
              {g.text}
            </li>
          ))}
        </ul>
      </section>
      <h2 className="mb-3 font-semibold">Lessons</h2>
      <ol className="space-y-2">
        {unit.lessonList.map((l) => (
          <li key={l.id}>
            <Link to={`/lessons/${l.id}`} className="flex items-center gap-4 rounded-lg border border-stone-200 bg-white px-4 py-3 hover:border-stone-400">
              <span className="text-sm font-medium text-stone-400">{l.number}</span>
              <span className="font-medium">{l.title}</span>
            </Link>
          </li>
        ))}
      </ol>
      <Link to={`/units/${unit.id}/check`} className="mt-6 inline-block rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700">
        Check what you can do
      </Link>
    </>
  );
}
