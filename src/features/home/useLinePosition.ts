import { course } from '@/content';
import type { Lesson, Stop } from '@/content/loader';
import { useLessonProgress, useStamps } from '@/db/hooks';
import type { StopState } from './LineStrip';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/db';

export interface LinePosition {
  stateOf: (stop: Stop) => StopState;
  current?: Stop;
  nextLesson?: Lesson;
  practised: number;
  total: number;
}

/**
 * Where the learner is on the line. "You are here" is the station of the
 * next lesson to practise; once every lesson is done, the first station whose
 * check isn't passed; after that, the next milestone.
 */
export function useLinePosition(): LinePosition {
  const lessons = useLessonProgress();
  const alphabetPractised = useLiveQuery(async () => !!(await db.attempts.filter((a) => a.context === 'alphabet').first()), []) ?? false;
  const stamps = useStamps() ?? [];
  const stamped = new Set(stamps.map((s) => s.id));
  const all = course.units.flatMap((u) => u.lessonList);
  const practised = all.filter((l) => lessons.get(l.id)?.completedAt).length;
  const nextLesson = all.find((l) => !lessons.get(l.id)?.completedAt);
  const lineA = course.lines[0]!;
  const unitStops = lineA.stops.filter((s) => s.kind === 'unit');
  let current: Stop | undefined;
  if (practised === 0) current = lineA.stops.find((s) => s.kind === 'pronunciation');
  else if (nextLesson) current = course.stopByUnit.get(nextLesson.unitId);
  else current = unitStops.find((s) => s.kind === 'unit' && !stamped.has(`unit:${s.unit}`)) ?? lineA.stops.find((s) => s.kind === 'milestone');

  const stateOf = (stop: Stop): StopState => {
    if (stop.kind === 'planned') return 'vyluka';
    if (current && stop.line === current.line && stop.slug === current.slug) return 'current';
    if (stop.kind === 'unit') return stamped.has(`unit:${stop.unit}`) || (current && stop.position < current.position) ? 'done' : 'open';
    // Same rule as the station wall: done once pronunciation has actually been practised.
    if (stop.kind === 'pronunciation') return alphabetPractised ? 'done' : 'open';
    if (stop.kind === 'milestone') return stamped.has(`milestone:${stop.milestone.id}:${stop.milestone.part}`) ? 'done' : 'open';
    return 'open';
  };
  return { stateOf, current, nextLesson, practised, total: all.length };
}
