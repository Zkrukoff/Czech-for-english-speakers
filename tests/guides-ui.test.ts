import { describe, expect, it } from 'vitest';
import { contentFiles } from '@/content/files';
import { loadContent } from '@/content/loader';
import { POSITIONS } from '@/features/guides/MetroMap';

const { course } = loadContent(contentFiles);

describe('metro map', () => {
  const metro = course.guidesById.get('prague-transport')!.metro!;

  it('has all 61 stations on lines A (17), B (24) and C (20)', () => {
    expect(metro.lines.map((l) => [l.id, l.stations.length])).toEqual([['A', 17], ['B', 24], ['C', 20]]);
  });

  it('has the three transfer stations in the right places', () => {
    const on = (name: string) => metro.lines.filter((l) => l.stations.includes(name)).map((l) => l.id);
    expect(on('Můstek')).toEqual(['A', 'B']);
    expect(on('Muzeum')).toEqual(['A', 'C']);
    expect(on('Florenc')).toEqual(['B', 'C']);
  });

  it('draws every station in the content', () => {
    const missing = metro.lines.flatMap((l) => l.stations).filter((s) => !POSITIONS[s]);
    expect(missing).toEqual([]);
  });

  it('never draws two stations in the same place', () => {
    const seen = new Map<string, string>();
    for (const [name, [x, y]] of Object.entries(POSITIONS)) {
      const key = `${x},${y}`;
      expect(seen.get(key), `${name} overlaps ${seen.get(key)}`).toBeUndefined();
      seen.set(key, name);
    }
  });

  it('only has notes for real stations', () => {
    const all = new Set(metro.lines.flatMap((l) => l.stations));
    expect(Object.keys(metro.notes).filter((n) => !all.has(n))).toEqual([]);
  });
});

describe('history timeline', () => {
  const timeline = course.guidesById.get('culture')!.timeline!;

  it('covers the key events in order, each with its significance', () => {
    expect(timeline.length).toBeGreaterThanOrEqual(15);
    expect(timeline[0]!.year).toBe('863');
    for (const e of timeline) expect(e.significance.length, e.id).toBeGreaterThan(40);
  });

  it('is embedded in the history section', () => {
    expect(course.guidesById.get('culture')!.sectionMd.history).toContain('```timeline culture');
  });
});
