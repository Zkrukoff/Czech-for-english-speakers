import { createEmptyCard, fsrs, generatorParameters, Rating, State, type Card, type Grade } from 'ts-fsrs';
import type { ReviewCard } from '@/db/db';
import type { CheckStatus } from '@/lib/answers/check';

/**
 * Spaced repetition, using FSRS (via ts-fsrs) behind a small interface so the
 * algorithm can be swapped without touching the rest of the app.
 *
 * Grades come from what the learner actually typed:
 *   correct            → Good
 *   diacritics slip    → Hard  (accepted, but shown again a bit sooner)
 *   wrong              → Again (relearned within minutes, interval shrinks)
 */

export { Rating, State };
export type { Grade };

export function gradeFor(status: CheckStatus): Grade {
  switch (status) {
    case 'correct':
      return Rating.Good;
    case 'diacritics':
      return Rating.Hard;
    case 'incorrect':
      return Rating.Again;
  }
}

export interface SchedulerOptions {
  /** Randomise intervals slightly so reviews don't bunch up (off in tests). */
  fuzz?: boolean;
  /** Target probability of remembering an item when it's due. */
  retention?: number;
  /** Longest gap between reviews, in days. */
  maximumIntervalDays?: number;
}

export interface Scheduler {
  newCard(itemKey: string, skills: string[], now: number): ReviewCard;
  review(card: ReviewCard, grade: Grade, now: number): ReviewCard;
}

function toFsrs(c: ReviewCard): Card {
  return {
    due: new Date(c.due),
    stability: c.stability,
    difficulty: c.difficulty,
    elapsed_days: c.elapsedDays,
    scheduled_days: c.scheduledDays,
    learning_steps: c.learningSteps,
    reps: c.reps,
    lapses: c.lapses,
    state: c.state as State,
    last_review: c.lastReview !== undefined ? new Date(c.lastReview) : undefined,
  };
}

function fromFsrs(card: Card, itemKey: string, skills: string[]): ReviewCard {
  return {
    itemKey,
    skills,
    due: card.due.getTime(),
    stability: card.stability,
    difficulty: card.difficulty,
    elapsedDays: card.elapsed_days,
    scheduledDays: card.scheduled_days,
    learningSteps: card.learning_steps,
    reps: card.reps,
    lapses: card.lapses,
    state: card.state,
    lastReview: card.last_review?.getTime(),
  };
}

export function createScheduler(options: SchedulerOptions = {}): Scheduler {
  const f = fsrs(
    generatorParameters({
      enable_fuzz: options.fuzz ?? true,
      request_retention: options.retention ?? 0.9,
      maximum_interval: options.maximumIntervalDays ?? 365,
      // One short step: a wrong answer comes back in 10 minutes; a correct first
      // answer graduates straight to a multi-day interval instead of reappearing
      // minutes after the lesson.
      learning_steps: ['10m'],
      relearning_steps: ['10m'],
    }),
  );
  return {
    newCard(itemKey, skills, now) {
      return fromFsrs(createEmptyCard(new Date(now)), itemKey, skills);
    },
    review(card, grade, now) {
      const { card: next } = f.next(toFsrs(card), new Date(now), grade);
      return fromFsrs(next, card.itemKey, card.skills);
    },
  };
}

/** The scheduler the app uses. */
export const scheduler = createScheduler();
