import { useLiveQuery } from 'dexie-react-hooks';
import { db, type ExamAttempt, type PrazakDB } from './db';

export async function saveExamAttempt(a: Omit<ExamAttempt, 'id'>, database: PrazakDB = db): Promise<number> {
  return (await database.examAttempts.add(a)) as number;
}

/** Every exam attempt, oldest first. */
export function useExamAttempts(): ExamAttempt[] | undefined {
  return useLiveQuery(() => db.examAttempts.orderBy('at').toArray(), []);
}

/** Best score per task id, from practice and mocks alike. */
export function bestByTask(attempts: ExamAttempt[]): Map<string, ExamAttempt> {
  const best = new Map<string, ExamAttempt>();
  for (const a of attempts) {
    const b = best.get(a.taskId);
    if (!b || a.score / a.max > b.score / b.max) best.set(a.taskId, a);
  }
  return best;
}
