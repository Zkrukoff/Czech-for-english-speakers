import { useLiveQuery } from 'dexie-react-hooks';
import { course } from '@/content';
import type { Exercise } from '@/content/schema';
import { db } from '@/db/db';
import { dueCards } from '@/db/srs';
import { exerciseForCard, ownWordExercise } from '@/lib/srs/reviewItems';
import { DEFAULT_PER_STOP, exercisesPerStop } from '@/lib/ride';

export interface RideItem {
  exercise: Exercise;
  /** Review card key for due items; undefined for new practice. */
  reviewKey?: string;
}

/**
 * A ride's worth of practice: reviews that are due first (most overdue first),
 * then new practice from the next lessons, skipping exercises already seen.
 */
export async function buildRide(total: number, now = Date.now()): Promise<RideItem[]> {
  const items: RideItem[] = [];
  const seen = new Set<Exercise>();
  for (const card of await dueCards(now)) {
    if (items.length >= total) break;
    let exercise = exerciseForCard(card.itemKey, course, card.reps);
    if (card.itemKey.startsWith('own:')) {
      const w = await db.ownWords.get(Number(card.itemKey.slice(4)));
      exercise = w ? ownWordExercise(w) : null;
    }
    if (!exercise || seen.has(exercise)) continue;
    seen.add(exercise);
    items.push({ exercise, reviewKey: card.itemKey });
  }
  if (items.length < total) {
    const known = new Set((await db.cards.toCollection().primaryKeys()) as string[]);
    for (const u of course.units) {
      for (const l of u.lessonList) {
        for (const ex of l.exercises) {
          if (items.length >= total) return items;
          if (!known.has(`ex:${ex.id}`) && !seen.has(ex)) items.push({ exercise: ex });
        }
      }
    }
  }
  return items;
}

/** Exercises per stop, from this learner's own pace (default 3 until there's enough history). */
export function usePerStop(): number {
  return (
    useLiveQuery(async () => {
      const recent = await db.attempts.orderBy('timestamp').reverse().limit(400).toArray();
      return exercisesPerStop(recent.map((a) => a.timestamp));
    }, []) ?? DEFAULT_PER_STOP
  );
}
