import { Link } from 'react-router-dom';
import { course } from '@/content';
import { GoalList } from '@/components/GoalList';
import { useDueSummary } from '@/db/useDue';
import { useLessonProgress } from '@/db/hooks';

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
      <section className="mb-10 max-w-3xl">
        <p className="eyebrow">For English speakers living and working in Czechia</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
          The Czech you need at work, explained properly.
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-stone-600">
          Short lessons built around your week: meeting colleagues, lunch near the office, the commute, describing the people around you.
          Real grammar explanations, answers you type yourself, and reviews timed to your mistakes. No streaks, no points.
        </p>
      </section>

      <section aria-label="Where to start" className="mb-12 grid gap-4 md:grid-cols-3">
        {next && nextUnit && (
          <Link to={`/lessons/${next.id}`} className="card group flex flex-col p-5 hover:border-stone-400 md:col-span-2">
            <span className="eyebrow">{isNew ? 'Start the course' : 'Continue'}</span>
            <span className="mt-2 text-xl font-semibold">{next.title}</span>
            <span className="mt-1 text-sm text-stone-600">
              Unit {nextUnit.number}: {nextUnit.title} · lesson {next.number} of {nextUnit.lessonList.length}
            </span>
            <span className="mt-4 text-sm font-medium text-sky-700 group-hover:underline">
              {isNew ? 'Begin lesson 1' : 'Open the lesson'} →
            </span>
          </Link>
        )}
        {!next && (
          <div className="card p-5 md:col-span-2">
            <span className="eyebrow">All lessons practised</span>
            <p className="mt-2 text-stone-700">Keep up your reviews, and check each unit's goals on the progress page.</p>
          </div>
        )}
        {due && due.dueNow > 0 ? (
          <Link to="/review" className="card group flex flex-col p-5 hover:border-stone-400">
            <span className="eyebrow">Reviews</span>
            <span className="mt-2 text-xl font-semibold tabular-nums">{due.dueNow} ready</span>
            <span className="mt-1 text-sm text-stone-600">Items you're about to forget, from your own answers.</span>
            <span className="mt-4 text-sm font-medium text-sky-700 group-hover:underline">Review →</span>
          </Link>
        ) : (
          <Link to="/alphabet" className="card group flex flex-col p-5 hover:border-stone-400">
            <span className="eyebrow">{isNew ? 'Before you start' : 'Reference'}</span>
            <span className="mt-2 text-xl font-semibold">The alphabet</span>
            <span className="mt-1 text-sm text-stone-600">
              42 letters, how to say them, and how to spell your name and e-mail on the phone.
            </span>
            <span className="mt-4 text-sm font-medium text-sky-700 group-hover:underline">Learn the letters →</span>
          </Link>
        )}
      </section>

      <section aria-labelledby="units-heading">
        <div className="mb-4 flex items-baseline justify-between gap-4">
          <h2 id="units-heading" className="text-xl font-semibold tracking-tight">Units</h2>
          <span className="text-sm text-stone-500">{practised} of {allLessons.length} lessons practised</span>
        </div>
        <ol className="grid gap-4 sm:grid-cols-2">
          {course.units.map((u) => {
            const done = u.lessonList.filter((l) => lessons.get(l.id)?.completedAt).length;
            return (
              <li key={u.id}>
                <Link to={`/units/${u.id}`} className="card flex h-full flex-col p-5 transition hover:border-stone-400">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="eyebrow">Unit {u.number}</span>
                    <span className="text-xs text-stone-500 tabular-nums">{done}/{u.lessonList.length} lessons</span>
                  </div>
                  <h3 className="mt-1 text-lg font-semibold">{u.title}</h3>
                  {u.titleCs && <p lang="cs" className="text-stone-500">{u.titleCs}</p>}
                  <p className="mt-2 text-sm text-stone-600">{u.situation}</p>
                  <div className="mt-4 border-t border-stone-100 pt-3 text-sm">
                    <GoalList goals={u.canDo} />
                  </div>
                </Link>
              </li>
            );
          })}
        </ol>
      </section>
    </>
  );
}
