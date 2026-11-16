import { describe, expect, it } from 'vitest';
import { contentFiles } from '@/content/files';
import { loadContent } from '@/content/loader';

/** Validates the real course in /content. Any broken content fails here. */
describe('course content', () => {
  const result = loadContent(contentFiles);

  it('has no validation errors', () => {
    expect(result.errors).toEqual([]);
  });

  it('loads at least one unit with lessons', () => {
    expect(result.course.units.length).toBeGreaterThan(0);
    for (const u of result.course.units) expect(u.lessonList.length).toBeGreaterThan(0);
  });

});
