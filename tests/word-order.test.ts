import { describe, expect, it } from 'vitest';
import { contentFiles } from '@/content/files';
import { loadContent } from '@/content/loader';
import { checkAnswer } from '@/lib/answers/check';
import { expandPatterns } from '@/lib/answers/patterns';

const { course, errors } = loadContent(contentFiles);
const opts = { strictDiacritics: false };
const lessons = course.units.flatMap((u) => u.lessonList);

describe('Word order and clitics (A3)', () => {
  it('has the grammar page, linked to the skill', () => {
    expect(errors).toEqual([]);
    expect(course.grammarBySkill.get('word-order')?.id).toBe('word-order');
  });

  it('gives every lesson from u01-l02 on two sentence-building items', () => {
    for (const l of lessons.slice(1)) {
      expect(l.exercises.filter((e) => e.type === 'buildSentence').length, l.id).toBeGreaterThanOrEqual(2);
    }
  });

  it('accepts every listed order and explains the listed wrong ones', () => {
    for (const l of lessons) for (const e of l.exercises) {
      if (e.type !== 'buildSentence') continue;
      for (const a of expandPatterns(e.answers)) expect(checkAnswer(e, a, opts).accepted, `${e.id}: ${a}`).toBe(true);
      for (const h of e.hints) {
        const r = checkAnswer(e, h.wrong, opts);
        expect(r.accepted, `${e.id}: ${h.wrong}`).toBe(false);
        expect(r.explanation).toBe(h.explain);
      }
    }
  });

  it('catches the classic trap: a clitic first', () => {
    const e = lessons.flatMap((l) => l.exercises).find((x) => x.id === 'u01-l02-bld1')!;
    expect(checkAnswer(e, 'se jmenuju Sarah', opts).explanation).toMatch(/second position/);
  });
});
