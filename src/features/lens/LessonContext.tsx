import { createContext, useContext } from 'react';
import { course } from '@/content';

/** The lesson being shown, so the lens can say "you'll learn why later" (D9). */
export const LessonContext = createContext<string | undefined>(undefined);

const ORDER = new Map(course.units.flatMap((u) => u.lessonList).map((l, i) => [l.id, i]));

/**
 * When a case turns up before the lesson that teaches it, where it is taught:
 * { station, lesson } for a built lesson, or { later: true } when it's taught
 * further down the line. Undefined when there's nothing to say.
 */
export function useTaughtLater(skill: string): { station?: string; lesson?: string; later?: true } | undefined {
  const here = useContext(LessonContext);
  if (!here) return undefined;
  const taught = course.taughtIn.get(skill);
  if (!taught) return { later: true };
  if ((ORDER.get(taught) ?? 0) <= (ORDER.get(here) ?? 0)) return undefined;
  const l = course.lessonsById.get(taught)!;
  return { station: course.stopByUnit.get(l.unitId)?.stationInfo.name, lesson: l.title };
}
