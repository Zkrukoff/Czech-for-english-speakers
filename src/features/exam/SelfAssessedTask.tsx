import type { ExamTask } from './schema';

/** Writing and speaking tasks, scored by the learner (built in step 4b). */
export function SelfAssessedTask({ task }: { task: ExamTask; onDone: (score: number, max: number) => void }) {
  return <p className="text-ink-2">This task type ({task.kind}) isn't available yet.</p>;
}
