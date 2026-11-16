import { useLiveQuery } from 'dexie-react-hooks';
import { db, type GoalProgress, type LessonProgress } from './db';

export function useLessonProgress(): Map<string, LessonProgress> {
  const rows = useLiveQuery(() => db.lessonProgress.toArray(), []) ?? [];
  return new Map(rows.map((r) => [r.lessonId, r]));
}

export function useGoalProgress(): Map<string, GoalProgress> {
  const rows = useLiveQuery(() => db.goalProgress.toArray(), []) ?? [];
  return new Map(rows.map((r) => [r.goalId, r]));
}
