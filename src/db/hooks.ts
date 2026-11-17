import { useLiveQuery } from 'dexie-react-hooks';
import { db, type GoalProgress, type LessonProgress, type MissionRecord, type Profile, type Stamp } from './db';

export function useLessonProgress(): Map<string, LessonProgress> {
  const rows = useLiveQuery(() => db.lessonProgress.toArray(), []) ?? [];
  return new Map(rows.map((r) => [r.lessonId, r]));
}

export function useGoalProgress(): Map<string, GoalProgress> {
  const rows = useLiveQuery(() => db.goalProgress.toArray(), []) ?? [];
  return new Map(rows.map((r) => [r.goalId, r]));
}

export function useMissions(): Map<string, MissionRecord> {
  const rows = useLiveQuery(() => db.missions.toArray(), []) ?? [];
  return new Map(rows.map((r) => [r.missionId, r]));
}

export function useStamps(): Stamp[] | undefined {
  return useLiveQuery(() => db.stamps.orderBy('at').toArray(), []);
}

/** undefined while loading, null when there is no profile yet. */
export function useProfile(): Profile | null | undefined {
  return useLiveQuery(async () => (await db.profile.get('me')) ?? null, []);
}
