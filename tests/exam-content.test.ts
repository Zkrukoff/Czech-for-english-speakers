import { describe, expect, it } from 'vitest';
import { exam } from '@/features/exam/examContent';
import { PARTS, TASK_SHAPE } from '@/features/exam/schema';
import { fillAccepted } from '@/lib/exam/score';
import { contentFiles } from '@/content/files';

describe('A2 exam content (step 4)', () => {
  it('loads without errors, all awaiting native review', () => {
    expect(exam.errors).toEqual([]);
    expect(exam.tasks.every((t) => t.nativeReviewed === false)).toBe(true);
  });

  it('is not part of the main course bundle', () => {
    expect(Object.keys(contentFiles.json).filter((p) => p.startsWith('exam/'))).toEqual([]);
  });

  it('has a practice1, practice2, mock1 and mock2 set for every built task type', () => {
    for (const part of PARTS) for (const n of Object.keys(TASK_SHAPE[part])) {
      const sets = exam.tasks.filter((t) => t.part === part && t.task === +n);
      if (!sets.length) continue; // not built yet
      expect(sets.map((t) => t.use).sort(), `${part} ${n}`).toEqual(['mock1', 'mock2', 'practice1', 'practice2']);
    }
  });

  it('accepts its own first answer for every short-answer question', () => {
    for (const t of exam.tasks) if (t.kind === 'fill') for (const q of t.questions) for (const a of q.answers) expect(fillAccepted(a, q.answers), `${t.id}: ${a}`).toBe(true);
  });
});
