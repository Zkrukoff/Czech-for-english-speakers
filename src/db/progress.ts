import { db, type Attempt, type PrazakDB, type GoalProgress } from './db';
import type { CheckResult } from '@/lib/answers/check';
import type { Exercise } from '@/content/schema';

export type AttemptContext = Attempt['context'];

/** Log one answer. Every answer is kept; mastery and review are computed from this log. */
export async function recordAttempt(
  exercise: Exercise,
  answer: string,
  result: CheckResult,
  context: AttemptContext,
  database: PrazakDB = db,
  now = Date.now(),
  itemKey = `ex:${exercise.id}`,
): Promise<Attempt> {
  const attempt: Attempt = {
    itemKey,
    exerciseId: exercise.id,
    skills: exercise.skills,
    correct: result.accepted,
    diacriticSlip: result.diacriticsOnly,
    answer,
    context,
    timestamp: now,
  };
  attempt.id = await database.attempts.add(attempt);
  return attempt;
}

export async function markLessonStep(lessonId: string, step: string, database: PrazakDB = db): Promise<void> {
  await database.transaction('rw', database.lessonProgress, async () => {
    const p = (await database.lessonProgress.get(lessonId)) ?? { lessonId, stepsDone: [] };
    if (!p.stepsDone.includes(step)) p.stepsDone.push(step);
    await database.lessonProgress.put(p);
  });
}

export async function completeLesson(lessonId: string, database: PrazakDB = db, now = Date.now()): Promise<void> {
  await database.transaction('rw', database.lessonProgress, async () => {
    const p = (await database.lessonProgress.get(lessonId)) ?? { lessonId, stepsDone: [] };
    p.completedAt ??= now;
    if (!p.stepsDone.includes('practice')) p.stepsDone.push('practice');
    await database.lessonProgress.put(p);
  });
}

export interface GoalScore {
  goalId: string;
  correct: number;
  total: number;
  passed: boolean;
}

/** Score a unit check per can-do goal. A goal passes when correct/total ≥ passRatio. */
export function scoreGoals(
  results: { goalId: string; correct: boolean }[],
  passRatio: number,
): GoalScore[] {
  const byGoal = new Map<string, { correct: number; total: number }>();
  for (const r of results) {
    const g = byGoal.get(r.goalId) ?? { correct: 0, total: 0 };
    g.total++;
    if (r.correct) g.correct++;
    byGoal.set(r.goalId, g);
  }
  return [...byGoal].map(([goalId, g]) => ({ goalId, ...g, passed: g.total > 0 && g.correct / g.total >= passRatio - 1e-9 }));
}

/** Save unit-check results. A goal, once completed, stays completed; the best score is kept. */
export async function saveGoalScores(unitId: string, scores: GoalScore[], database: PrazakDB = db, now = Date.now()): Promise<void> {
  await database.transaction('rw', database.goalProgress, async () => {
    for (const s of scores) {
      const prev = await database.goalProgress.get(s.goalId);
      const score = s.total ? s.correct / s.total : 0;
      const next: GoalProgress = {
        goalId: s.goalId,
        unitId,
        bestScore: Math.max(prev?.bestScore ?? 0, score),
        completedAt: prev?.completedAt ?? (s.passed ? now : undefined),
      };
      await database.goalProgress.put(next);
    }
  });
}
