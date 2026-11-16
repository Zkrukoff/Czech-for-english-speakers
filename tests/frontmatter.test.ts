import { describe, expect, it } from 'vitest';
import { parseFrontmatter } from '@/content/frontmatter';

describe('parseFrontmatter', () => {
  it('parses scalars, booleans, numbers and lists', () => {
    const { data, body } = parseFrontmatter('---\nid: genitive\ntitle: "The genitive"\norder: 2\nnativeReviewed: false\ntags: [a, b]\n---\n# Body\n');
    expect(data).toEqual({ id: 'genitive', title: 'The genitive', order: 2, nativeReviewed: false, tags: ['a', 'b'] });
    expect(body).toBe('# Body\n');
  });

  it('returns the whole text when there is no frontmatter', () => {
    expect(parseFrontmatter('# Hi')).toEqual({ data: {}, body: '# Hi' });
  });

  it('keeps colons inside values', () => {
    expect(parseFrontmatter('---\nsummary: do + genitive: do Prahy\n---\n').data.summary).toBe('do + genitive: do Prahy');
  });
});
