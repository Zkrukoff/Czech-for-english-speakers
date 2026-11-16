import type { CanDo } from '@/content/schema';
import { useGoalProgress } from '@/db/hooks';

/** Can-do goals, ticked once passed in a unit check. */
export function GoalList({ goals }: { goals: CanDo[] }) {
  const progress = useGoalProgress();
  return (
    <ul className="space-y-1.5">
      {goals.map((g) => {
        const done = !!progress.get(g.id)?.completedAt;
        return (
          <li key={g.id} className="flex gap-2 text-stone-700">
            <span aria-hidden className={done ? 'text-emerald-600' : 'text-stone-400'}>{done ? '✓' : '○'}</span>
            <span>
              {g.text}
              {done && <span className="sr-only"> (done)</span>}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
