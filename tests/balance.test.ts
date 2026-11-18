import { describe, expect, it } from 'vitest';
import { contentFiles } from '@/content/files';
import { loadContent } from '@/content/loader';
import { lensPlain } from '@/lib/lens';

const { course } = loadContent(contentFiles);
const lessons = course.units.flatMap((u) => u.lessonList);
const words = (s: string) => lensPlain(s).toLowerCase().match(/[a-záčďéěíňóřšťúůýž]+/g) ?? [];

describe('Practice balance in Line A (P3)', () => {
  it('keeps English → Czech translation at 20% or less of lesson practice', () => {
    const all = lessons.flatMap((l) => l.exercises);
    const enCs = all.filter((e) => e.type === 'translate' && e.direction === 'en-cs').length;
    expect(enCs / all.length).toBeLessThanOrEqual(0.2);
  });

  it('has a reading-for-meaning item in every lesson, using only words taught so far', () => {
    const known = new Set<string>(['kč']);
    for (const l of lessons) {
      for (const w of [...l.dialogue.lines.flatMap((x) => [...words(x.cs), ...words(x.speaker)]), ...l.vocab.flatMap((v) => words(v.cs))]) known.add(w);
      const reading = l.exercises.filter((e) => e.type === 'readReal' && e.options);
      expect(reading.length, l.id).toBeGreaterThanOrEqual(1);
      for (const e of reading) {
        if (e.type !== 'readReal') continue;
        const unknown = [...e.realia.lines, e.realia.title ?? ''].flatMap(words).filter((w) => !known.has(w));
        expect(unknown, `${e.id}`).toEqual([]);
      }
    }
  });
});
