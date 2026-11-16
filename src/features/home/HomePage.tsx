import { Link } from 'react-router-dom';
import { course } from '@/content';
import { PageHeader } from '@/components/PageHeader';
import { GoalList } from '@/components/GoalList';

export function HomePage() {
  return (
    <>
      <PageHeader
        title="Learn Czech by doing real things"
        subtitle="Each unit is built around a real situation. You'll know a unit is done when you can do what it promises, not when a counter says so."
      />
      <ol className="grid gap-4 sm:grid-cols-2">
        {course.units.map((u) => (
          <li key={u.id}>
            <Link
              to={`/units/${u.id}`}
              className="block h-full rounded-xl border border-stone-200 bg-white p-5 shadow-sm transition hover:border-stone-400"
            >
              <div className="text-sm font-medium text-stone-500">Unit {u.number}</div>
              <h2 className="mt-1 text-xl font-semibold">
                {u.title} {u.titleCs && <span className="font-normal text-stone-500">· {u.titleCs}</span>}
              </h2>
              <p className="mt-2 text-sm text-stone-600">{u.situation}</p>
              <div className="mt-3 text-sm">
                <GoalList goals={u.canDo} />
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </>
  );
}
