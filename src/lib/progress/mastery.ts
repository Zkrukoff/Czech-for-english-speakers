import type { Attempt } from '@/db/db';

/**
 * Mastery of a grammar skill is measured from the learner's own answers,
 * not from time spent or points:
 *   - look at the most recent WINDOW answers that practise the skill
 *   - "mastered" when at least MIN_ATTEMPTS answers exist and ACCURACY of them were right
 * Answers accepted with a diacritics slip count as right (they were accepted);
 * with strict diacritics on they were recorded as wrong.
 */
export const MASTERY_WINDOW = 20;
export const MASTERY_MIN_ATTEMPTS = 8;
export const MASTERY_ACCURACY = 0.85;

export type MasteryStatus = 'not-started' | 'learning' | 'mastered';

export interface SkillMastery {
  skill: string;
  status: MasteryStatus;
  /** Answers counted (≤ MASTERY_WINDOW). */
  recent: number;
  /** All answers ever recorded for the skill. */
  total: number;
  /** Accuracy over the recent answers, 0–1 (0 when none). */
  accuracy: number;
}

export function computeMastery(skill: string, attempts: Pick<Attempt, 'skills' | 'correct' | 'timestamp'>[]): SkillMastery {
  const relevant = attempts.filter((a) => a.skills.includes(skill)).sort((a, b) => b.timestamp - a.timestamp);
  const recent = relevant.slice(0, MASTERY_WINDOW);
  const right = recent.filter((a) => a.correct).length;
  const accuracy = recent.length ? right / recent.length : 0;
  const status: MasteryStatus =
    recent.length === 0
      ? 'not-started'
      : recent.length >= MASTERY_MIN_ATTEMPTS && accuracy >= MASTERY_ACCURACY
        ? 'mastered'
        : 'learning';
  return { skill, status, recent: recent.length, total: relevant.length, accuracy };
}

export function computeAllMastery(skills: string[], attempts: Pick<Attempt, 'skills' | 'correct' | 'timestamp'>[]): Map<string, SkillMastery> {
  return new Map(skills.map((s) => [s, computeMastery(s, attempts)]));
}
