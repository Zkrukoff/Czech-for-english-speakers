import type { CanDo } from '@/content/schema';
import { useGoalProgress } from '@/db/hooks';
import { IconDone, IconOpen } from '@/components/icons';

/** Can-do goals, ticked once passed in a unit check. */
export function GoalList({ goals }: { goals: CanDo[] }) {
  const progress = useGoalProgress();
  return (
    <ul className="space-y-1.5">
      {goals.map((g) => {
        const done = !!progress.get(g.id)?.completedAt;
        return (
          <li key={g.id} className="flex gap-2 text-ink-2">
            <span aria-hidden className={`mt-0.5 shrink-0 ${done ? 'text-ink' : 'text-ink-3'}`}>{done ? <IconDone size={18} /> : <IconOpen size={18} />}</span>
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
