import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { PrazakDB } from '@/db/db';
import { completeLesson, markLessonStep, saveGoalScores, scoreGoals } from '@/db/progress';

describe('scoreGoals', () => {
  it('passes a goal at or above the pass ratio', () => {
    const s = scoreGoals(
      [
        { goalId: 'g1', correct: true },
        { goalId: 'g1', correct: true },
        { goalId: 'g1', correct: true },
        { goalId: 'g1', correct: true },
        { goalId: 'g1', correct: false },
        { goalId: 'g2', correct: true },
        { goalId: 'g2', correct: false },
      ],
      0.8,
    );
    expect(s.find((g) => g.goalId === 'g1')).toMatchObject({ correct: 4, total: 5, passed: true });
    expect(s.find((g) => g.goalId === 'g2')).toMatchObject({ correct: 1, total: 2, passed: false });
  });
});

describe('progress storage', () => {
  it('keeps a completed goal completed and keeps the best score', async () => {
    const db = new PrazakDB('test-goals');
    await saveGoalScores('u1', [{ goalId: 'g1', correct: 2, total: 2, passed: true }], db, 1000);
    await saveGoalScores('u1', [{ goalId: 'g1', correct: 0, total: 2, passed: false }], db, 2000);
    const g = await db.goalProgress.get('g1');
    expect(g).toMatchObject({ completedAt: 1000, bestScore: 1 });
  });

  it('records lesson steps and completion once', async () => {
    const db = new PrazakDB('test-lessons');
    await markLessonStep('l1', 'explanation', db);
    await markLessonStep('l1', 'explanation', db);
    await completeLesson('l1', db, 5);
    await completeLesson('l1', db, 9);
    expect(await db.lessonProgress.get('l1')).toEqual({ lessonId: 'l1', stepsDone: ['explanation', 'practice'], completedAt: 5 });
  });
});
