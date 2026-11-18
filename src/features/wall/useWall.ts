import { useLiveQuery } from 'dexie-react-hooks';
import { course } from '@/content';
import { db } from '@/db/db';
import { useLessonProgress, useStamps } from '@/db/hooks';
import { buildWall, type WallBlock } from '@/lib/wall';

/** The learner's wall, derived from lesson progress and stamps. undefined while loading. */
export function useWall(): WallBlock[] | undefined {
  const lessons = useLessonProgress();
  const stamps = useStamps();
  const alphabet = useLiveQuery(async () => !!(await db.attempts.filter((a) => a.context === 'alphabet').first()), []);
  if (!stamps || alphabet === undefined) return undefined;
  return buildWall(course, { lessons, stamps: new Set(stamps.map((s) => s.id)), alphabetPractised: alphabet });
}
