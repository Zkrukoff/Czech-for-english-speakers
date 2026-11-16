import { useCallback } from 'react';
import type { ExerciseOutcome } from '@/features/exercises/ExerciseRunner';
import { scheduleExerciseAnswer } from '@/db/srs';

/**
 * Called after every lesson or unit-check answer: schedules the exercise (and
 * the vocabulary it practises) for spaced repetition from the learner's
 * actual result. Only the first try counts; a retry in the same session
 * doesn't overwrite the grade.
 */
export function useLessonAnswerHandler(): (o: ExerciseOutcome) => Promise<void> {
  return useCallback(async (o: ExerciseOutcome) => {
    if (!o.firstTry) return;
    await scheduleExerciseAnswer(o.exercise, o.result.status);
  }, []);
}
