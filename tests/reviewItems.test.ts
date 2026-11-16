import { describe, expect, it } from 'vitest';
import { contentFiles } from '@/content/files';
import { loadContent } from '@/content/loader';
import { checkAnswer } from '@/lib/answers/check';
import { exerciseForCard, reviewableVocab, vocabAnswers } from '@/lib/srs/reviewItems';

const { course } = loadContent(contentFiles);

describe('vocabulary review items', () => {
  it('accepts either form of a paired entry', () => {
    expect(vocabAnswers('kamarád / kamarádka')).toEqual(['kamarád', 'kamarádka', 'kamarád / kamarádka']);
  });

  it('drops parenthetical notes', () => {
    expect(vocabAnswers('stát (stojí)')).toEqual(['stát']);
  });

  it('skips list-like entries', () => {
    const all = [...course.vocabById.values()].map((v) => v.item);
    expect(reviewableVocab(all).some((v) => v.cs.startsWith('jeden, dva'))).toBe(false);
  });

  it('builds a checkable exercise for every reviewable word in the course', () => {
    const failures: string[] = [];
    for (const { item } of course.vocabById.values()) {
      if (!reviewableVocab([item]).length) continue;
      const ex = exerciseForCard(`vocab:${item.id}`, course)!;
      for (const a of vocabAnswers(item.cs)) {
        if (checkAnswer(ex, a, { strictDiacritics: true }).status !== 'correct') failures.push(`${item.id}: ${a}`);
      }
    }
    expect(failures).toEqual([]);
  });

  it('explains a synonym from elsewhere in the course instead of just marking it wrong', () => {
    const ex = exerciseForCard('vocab:v-cau', course)!;
    const r = checkAnswer(ex, 'ahoj', { strictDiacritics: false });
    expect(r.status).toBe('incorrect');
    expect(r.hintMatched).toBe(true);
    expect(r.explanation).toMatch(/ahoj means/);
  });

  it('never gives a hint that contradicts an accepted answer', () => {
    const failures: string[] = [];
    for (const { item } of course.vocabById.values()) {
      const ex = exerciseForCard(`vocab:${item.id}`, course)!;
      for (const a of vocabAnswers(item.cs)) {
        const r = checkAnswer(ex, a, { strictDiacritics: false });
        if (r.status !== 'correct') failures.push(`${item.id}: ${a} → ${r.status}`);
      }
    }
    expect(failures).toEqual([]);
  });

  it('finds exercise cards and ignores cards whose content is gone', () => {
    expect(exerciseForCard('ex:u02-l01-e1', course)?.type).toBe('fillEnding');
    expect(exerciseForCard('ex:no-such-exercise', course)).toBeNull();
    expect(exerciseForCard('vocab:no-such-word', course)).toBeNull();
  });
});
