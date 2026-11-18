import { describe, expect, it } from 'vitest';
import { contentFiles } from '@/content/files';
import { loadContent } from '@/content/loader';
import { buildLessonPractice } from '@/lib/practice/interleave';

const { course } = loadContent(contentFiles);
const order = course.units.flatMap((u) => u.lessonList);
const earlierOf = (id: string) => order.slice(0, order.findIndex((l) => l.id === id)).map((l) => ({ id: l.id, exercises: l.exercises }));
const none = { finishedLessons: new Set<string>(), lastResult: new Map(), dueAt: new Map() };

describe('Interleaving earlier lessons into practice (P4)', () => {
  it('adds nothing to the first lesson or before anything is finished', () => {
    const first = order[0]!;
    expect(buildLessonPractice(first.exercises, earlierOf(first.id), none).exercises).toEqual(first.exercises);
    const third = order[2]!;
    expect(buildLessonPractice(third.exercises, earlierOf(third.id), none).fromBefore.size).toBe(0);
  });

  it('adds up to two items from finished earlier lessons, spread through the session', () => {
    const l = order[4]!; // u02-l01
    const earlier = earlierOf(l.id);
    const finished = new Set(earlier.map((e) => e.id));
    const { exercises, fromBefore } = buildLessonPractice(l.exercises, earlier, { ...none, finishedLessons: finished });
    expect(fromBefore.size).toBe(Math.min(2, Math.max(1, Math.round(l.exercises.length / 4))));
    expect(exercises.length).toBe(l.exercises.length + fromBefore.size);
    const positions = exercises.map((e, i) => (fromBefore.has(e.id) ? i : -1)).filter((i) => i >= 0);
    expect(positions.at(-1)).toBeLessThan(exercises.length - 1); // never tacked on at the very end
    expect(exercises.filter((e) => !fromBefore.has(e.id))).toEqual(l.exercises); // the lesson's own order is kept
  });

  it('prefers items last answered wrong, then the ones due soonest', () => {
    const l = order[5]!;
    const earlier = earlierOf(l.id);
    const pool = earlier.flatMap((e) => e.exercises);
    const wrong = pool[7]!.id;
    const soon = pool[3]!.id;
    const { fromBefore } = buildLessonPractice(l.exercises, earlier, {
      finishedLessons: new Set(earlier.map((e) => e.id)),
      lastResult: new Map([[wrong, false], [pool[0]!.id, true]]),
      dueAt: new Map([[soon, 1]]),
    });
    expect([...fromBefore]).toEqual([wrong, soon]);
  });
});
