import { describe, expect, it } from 'vitest';
import { contentFiles } from '@/content/files';
import { loadContent } from '@/content/loader';
import { idiomOfWeek, isoWeek, weekIndex } from '@/lib/idioms';

const { course, errors } = loadContent(contentFiles);

describe('Idiom of the week', () => {
  it('loads sourced idioms, all awaiting native review', () => {
    expect(errors).toEqual([]);
    expect(course.idioms.length).toBeGreaterThanOrEqual(20);
    for (const i of course.idioms) {
      expect(i.source.url).toMatch(/^https:\/\/prirucka\.ujc\.cas\.cz\/\?slovo=/);
      expect(i.nativeReviewed).toBe(false);
    }
  });

  it('is the same all week and changes on Monday', () => {
    const mon = new Date(2026, 10, 16, 0, 5);
    const sun = new Date(2026, 10, 22, 23, 55);
    const nextMon = new Date(2026, 10, 23, 0, 5);
    expect(weekIndex(mon)).toBe(weekIndex(sun));
    expect(weekIndex(nextMon)).toBe(weekIndex(mon) + 1);
    expect(idiomOfWeek(course.idioms, mon)).toBe(idiomOfWeek(course.idioms, sun));
    expect(idiomOfWeek(course.idioms, nextMon)).not.toBe(idiomOfWeek(course.idioms, mon));
  });

  it('numbers ISO weeks', () => {
    expect(isoWeek(new Date(2026, 10, 18))).toBe(47);
    expect(isoWeek(new Date(2027, 0, 1))).toBe(53);
    expect(isoWeek(new Date(2026, 0, 5))).toBe(2);
  });
});
