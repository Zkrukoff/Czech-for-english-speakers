import { Link } from 'react-router-dom';
import { course } from '@/content';
import { PageHeader } from '@/components/PageHeader';
import { GoalList } from '@/components/GoalList';
import { useDueSummary } from '@/db/useDue';

export function HomePage() {
  const due = useDueSummary();
  return (
    <>
      <PageHeader
        title="Learn Czech by doing real things"
        subtitle="Each unit is built around a real situation. You'll know a unit is done when you can do what it promises, not when a counter says so."
      />
      {due && due.dueNow > 0 && (
        <Link to="/review" className="mb-6 flex items-center justify-between rounded-xl border border-stone-200 bg-white px-5 py-3 hover:border-stone-400">
          <span><b className="tabular-nums">{due.dueNow}</b> item{due.dueNow === 1 ? '' : 's'} ready for review</span>
          <span className="text-sm text-sky-700">Review →</span>
        </Link>
      )}
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
