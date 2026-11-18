import { useEffect, useState } from 'react';
import { course } from '@/content';
import type { Lesson } from '@/content/loader';
import { db } from '@/db/db';
import { buildLessonPractice } from '@/lib/practice/interleave';

type Practice = ReturnType<typeof buildLessonPractice>;

/**
 * The lesson's practice with earlier items mixed in (P4). Computed once per
 * lesson and run, so answers given during the session don't reshuffle it.
 * undefined while the learner's history loads.
 */
export function useLessonPractice(lesson: Lesson, run: number): Practice | undefined {
  const [practice, setPractice] = useState<{ key: string; value: Practice }>();
  const key = `${lesson.id}:${run}`;
  useEffect(() => {
    let live = true;
    void (async () => {
      const order = course.units.flatMap((u) => u.lessonList);
      const earlier = order.slice(0, order.findIndex((l) => l.id === lesson.id)).map((l) => ({ id: l.id, exercises: l.exercises }));
      const ids = new Set(earlier.flatMap((l) => l.exercises.map((e) => e.id)));
      const finished = new Set((await db.lessonProgress.toArray()).filter((p) => p.completedAt).map((p) => p.lessonId));
      const lastResult = new Map<string, boolean>();
      await db.attempts.orderBy('timestamp').each((a) => {
        if (a.exerciseId && ids.has(a.exerciseId)) lastResult.set(a.exerciseId, a.correct);
      });
      const dueAt = new Map<string, number>();
      for (const c of await db.cards.where('itemKey').startsWith('ex:').toArray()) if (ids.has(c.itemKey.slice(3))) dueAt.set(c.itemKey.slice(3), c.due);
      if (live) setPractice({ key, value: buildLessonPractice(lesson.exercises, earlier, { finishedLessons: finished, lastResult, dueAt }, run) });
    })();
    return () => { live = false; };
  }, [key, lesson, run]);
  return practice?.key === key ? practice.value : undefined;
}
