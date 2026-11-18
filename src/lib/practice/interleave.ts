import type { Exercise } from '@/content/schema';

/** How many earlier items join a lesson's practice: about a quarter, at most two. */
export const FROM_BEFORE_MAX = 2;

export interface InterleaveHistory {
  /** Ids of lessons the learner has finished, other than this one. */
  finishedLessons: Set<string>;
  /** Exercise id → whether the learner's most recent answer was right. */
  lastResult: Map<string, boolean>;
  /** Exercise id → when its review card is next due (ms), if it has one. */
  dueAt: Map<string, number>;
}

/**
 * Lesson practice with a few items from earlier lessons mixed in (P4,
 * interleaving). Picks from finished lessons that come earlier in the course:
 * items last answered wrong first, then the ones due soonest, then the rest
 * in a stable order that changes with `seed`. Earlier items are spread through
 * the session, never all at the end.
 */
export function buildLessonPractice(
  lessonExercises: Exercise[],
  earlierLessons: { id: string; exercises: Exercise[] }[],
  history: InterleaveHistory,
  seed = 0,
): { exercises: Exercise[]; fromBefore: Set<string> } {
  const pool = earlierLessons.filter((l) => history.finishedLessons.has(l.id)).flatMap((l) => l.exercises);
  if (!pool.length || !lessonExercises.length) return { exercises: lessonExercises, fromBefore: new Set() };
  const want = Math.min(FROM_BEFORE_MAX, Math.max(1, Math.round(lessonExercises.length / 4)));
  const hash = (s: string) => [...`${s}:${seed}`].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
  const rank = (e: Exercise) => {
    const wrong = history.lastResult.get(e.id) === false ? 0 : 1;
    const due = history.dueAt.get(e.id) ?? Number.MAX_SAFE_INTEGER;
    return [wrong, due, hash(e.id)] as const;
  };
  const picked = [...pool]
    .sort((a, b) => {
      const [wa, da, ha] = rank(a);
      const [wb, db, hb] = rank(b);
      return wa - wb || da - db || ha - hb;
    })
    .slice(0, want);
  const out = [...lessonExercises];
  // Spread: after roughly a third and two thirds of the lesson's own items.
  picked.forEach((e, i) => {
    const at = Math.min(out.length, Math.round(((i + 1) * lessonExercises.length) / (picked.length + 1)) + i);
    out.splice(at, 0, e);
  });
  return { exercises: out, fromBefore: new Set(picked.map((e) => e.id)) };
}
