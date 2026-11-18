import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { contentFiles } from '@/content/files';
import { loadContent } from '@/content/loader';

const { course, errors } = loadContent(contentFiles);
const read = (f: string) => readFileSync(`content/guides/sports/${f}`, 'utf8');

describe('Sports guide', () => {
  it('loads with its sections, phrasebook and practice', () => {
    expect(errors).toEqual([]);
    const g = course.guidesById.get('sports')!;
    expect(g.sections.map((s) => s.id)).toEqual(['hockey', 'football', 'chants', 'going']);
    expect(g.practice[0]!.exercises.length).toBeGreaterThanOrEqual(5);
    expect(g.lastChecked).toBe('2026-11-18');
  });

  it('cites a dated source for every chant', () => {
    const chants = read('chants.md');
    for (const block of chants.split(/\n(?=\*\*)/).filter((b) => b.startsWith('**') && !b.startsWith('**Jude'))) {
      expect(block, block.slice(0, 40)).toMatch(/\*\((?:[^)]*?)(?:19|20)\d\d\.\)\*|\*\([^)]*(eFotbal)[^)]*\)\*/);
    }
  });

  it('names the antisemitic chant only to warn about it', () => {
    const chants = read('chants.md');
    expect(chants).toMatch(/## What not to repeat\n\n\*\*Jude Slavie\*\*/);
    for (const f of ['hockey.md', 'football.md', 'going.md']) expect(read(f)).not.toMatch(/Jude/);
    const g = course.guidesById.get('sports')!;
    expect(JSON.stringify(g.practice)).not.toMatch(/Jude|Smrt/);
  });
});
