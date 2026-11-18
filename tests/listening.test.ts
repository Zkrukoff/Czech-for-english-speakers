import { describe, expect, it } from 'vitest';
import { contentFiles } from '@/content/files';
import { loadContent } from '@/content/loader';
import { lensPlain } from '@/lib/lens';

const { course, errors } = loadContent(contentFiles);
const words = (s: string) => lensPlain(s).toLowerCase().match(/[a-záčďéěíňóřšťúůýž]+/g) ?? [];

describe('Listening in lessons (P1)', () => {
  it('gives every Line A lesson at least two listening questions, first in its practice', () => {
    expect(errors).toEqual([]);
    for (const u of course.units) for (const l of u.lessonList) {
      const listening = l.exercises.filter((e) => e.type === 'multipleChoice' && e.listen);
      expect(listening.length, l.id).toBeGreaterThanOrEqual(2);
      expect(l.exercises[0]!.type === 'multipleChoice' && l.exercises[0]!.listen, l.id).toBeTruthy();
    }
  });

  it('only plays words the lesson has taught (vocabulary and dialogue)', () => {
    for (const u of course.units) for (const l of u.lessonList) {
      const known = new Set([...l.dialogue.lines.flatMap((x) => words(x.cs)), ...l.vocab.flatMap((v) => words(v.cs))]);
      for (const e of l.exercises) {
        if (e.type !== 'multipleChoice' || !e.listen) continue;
        const unknown = words(e.listen).filter((w) => !known.has(w));
        expect(unknown, `${e.id}: ${e.listen}`).toEqual([]);
      }
    }
  });

  it('shows what was said after answering', () => {
    for (const e of [...course.exercisesById.values()].map((x) => x.exercise)) {
      if (e.type === 'multipleChoice' && e.listen) expect(e.why, e.id).toContain(lensPlain(e.listen).slice(0, 12));
    }
  });
});
