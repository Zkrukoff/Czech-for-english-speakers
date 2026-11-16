import type { ExerciseOutcome } from '@/features/exercises/ExerciseRunner';

/**
 * Hook point for spaced repetition: called after every lesson answer.
 * Milestone (d) schedules review cards here.
 */
export function useLessonAnswerHandler(): ((o: ExerciseOutcome) => Promise<void>) | undefined {
  return undefined;
}
