import { describe, expect, it } from 'vitest';
import { exam } from '@/features/exam/examContent';
import { PARTS, TASK_SHAPE } from '@/features/exam/schema';
import { emailMeetsMinimum, fillAccepted } from '@/lib/exam/score';
import { contentFiles } from '@/content/files';

describe('A2 exam content (step 4)', () => {
  it('loads without errors, all awaiting native review', () => {
    expect(exam.errors).toEqual([]);
    expect(exam.tasks.every((t) => t.nativeReviewed === false)).toBe(true);
  });

  it('is not part of the main course bundle', () => {
    expect(Object.keys(contentFiles.json).filter((p) => p.startsWith('exam/'))).toEqual([]);
  });

  it('has two practice sets and a set in each mock for all 16 task types', () => {
    let types = 0;
    for (const part of PARTS) for (const n of Object.keys(TASK_SHAPE[part])) {
      types++;
      const sets = exam.tasks.filter((t) => t.part === part && t.task === +n);
      expect(sets.map((t) => t.use).sort(), `${part} ${n}`).toEqual(['mock1', 'mock2', 'practice1', 'practice2']);
    }
    expect(types).toBe(16);
    expect(exam.tasks).toHaveLength(64);
  });

  it('adds up to the official points in each mock (speaking: the 37 we can practise)', () => {
    for (const mock of ['mock1', 'mock2'] as const) {
      const sum = (part: (typeof PARTS)[number]) => exam.tasks.filter((t) => t.use === mock && t.part === part).reduce((a, t) => a + TASK_SHAPE[t.part][t.task]!.points, 0);
      expect([sum('reading'), sum('writing'), sum('listening'), sum('speaking')]).toEqual([25, 20, 25, 37]);
    }
  });

  it('has a ten-item past-tense warm-up, each wrong option explained', () => {
    expect(exam.warmup).toHaveLength(10);
    for (const e of exam.warmup) {
      if (e.type !== 'multipleChoice') throw new Error(e.id);
      for (const o of e.options.filter((o) => !e.answers.includes(o))) expect(e.hints.some((h) => h.wrong === o), `${e.id}: ${o}`).toBe(true);
    }
  });

  it('tells every e-mail apart from a model that would score zero', () => {
    for (const t of exam.tasks) if (t.kind === 'email') expect(emailMeetsMinimum(t.model), t.id).toBe(true);
  });

  it('accepts its own first answer for every short-answer question', () => {
    for (const t of exam.tasks) if (t.kind === 'fill') for (const q of t.questions) for (const a of q.answers) expect(fillAccepted(a, q.answers), `${t.id}: ${a}`).toBe(true);
  });
});
