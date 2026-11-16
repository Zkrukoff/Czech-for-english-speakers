import { describe, expect, it } from 'vitest';
import { computeMastery, MASTERY_MIN_ATTEMPTS, MASTERY_WINDOW } from '@/lib/progress/mastery';

const at = (correct: boolean, timestamp: number, skills = ['case:genitive']) => ({ correct, timestamp, skills });

describe('computeMastery', () => {
  it('is not started without answers for the skill', () => {
    expect(computeMastery('case:genitive', [at(true, 1, ['case:dative'])]).status).toBe('not-started');
  });

  it('needs a minimum number of answers before calling a skill mastered', () => {
    const few = Array.from({ length: MASTERY_MIN_ATTEMPTS - 1 }, (_, i) => at(true, i));
    expect(computeMastery('case:genitive', few)).toMatchObject({ status: 'learning', accuracy: 1 });
    expect(computeMastery('case:genitive', [...few, at(true, 99)]).status).toBe('mastered');
  });

  it('requires high accuracy', () => {
    const answers = [...Array.from({ length: 8 }, (_, i) => at(true, i)), at(false, 8), at(false, 9)];
    expect(computeMastery('case:genitive', answers)).toMatchObject({ status: 'learning', accuracy: 0.8 });
  });

  it('only looks at the most recent answers, so early mistakes stop counting', () => {
    const early = Array.from({ length: 10 }, (_, i) => at(false, i));
    const later = Array.from({ length: MASTERY_WINDOW }, (_, i) => at(true, 100 + i));
    const m = computeMastery('case:genitive', [...early, ...later]);
    expect(m).toMatchObject({ status: 'mastered', recent: MASTERY_WINDOW, total: 30, accuracy: 1 });
  });

  it('loses mastery when recent answers go wrong', () => {
    const good = Array.from({ length: 15 }, (_, i) => at(true, i));
    const bad = Array.from({ length: 5 }, (_, i) => at(false, 100 + i));
    expect(computeMastery('case:genitive', [...good, ...bad]).status).toBe('learning');
  });
});
