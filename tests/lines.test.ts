import { describe, expect, it } from 'vitest';
import { contentFiles } from '@/content/files';
import { loadContent } from '@/content/loader';

const result = loadContent(contentFiles);
const { course } = result;

const names = (id: string) => course.lines.find((l) => l.id === id)!.stops.map((s) => s.stationInfo.name);

describe('lines.json (course map)', () => {
  it('loads without errors', () => {
    expect(result.errors).toEqual([]);
  });

  it('records where and when the stations were verified', () => {
    expect(course.linesVerified?.source).toMatch(/PID/);
    expect(course.linesVerified?.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('matches the PID order checked on 2026-11-17 (scripts/pid_stations.py)', () => {
    expect(names('A')).toEqual([
      'Nemocnice Motol', 'Petřiny', 'Nádraží Veleslavín', 'Bořislavka', 'Dejvická', 'Hradčanská', 'Malostranská',
      'Staroměstská', 'Můstek', 'Muzeum', 'Náměstí Míru', 'Jiřího z Poděbrad', 'Flora', 'Želivského', 'Strašnická',
      'Skalka', 'Depo Hostivař',
    ]);
    expect(names('B')).toHaveLength(24);
    expect(names('C')).toHaveLength(20);
    expect([names('B')[0], names('B').at(-1), names('C')[0], names('C').at(-1)]).toEqual(['Zličín', 'Černý Most', 'Letňany', 'Háje']);
  });

  it('maps lines to CEFR levels', () => {
    expect(course.lines.map((l) => [l.id, l.levels.join('–')])).toEqual([['A', 'A1–A2'], ['B', 'B1–B2'], ['C', 'C1–C2']]);
  });

  it('marks transfer stations', () => {
    const t = (line: string, slug: string) => course.stopsByKey.get(`${line}/${slug}`)!.transfers;
    expect(t('A', 'mustek')).toEqual(['B']);
    expect(t('A', 'muzeum')).toEqual(['C']);
    expect(t('B', 'florenc')).toEqual(['C']);
    expect(t('A', 'dejvicka')).toEqual([]);
  });

  it('puts every unit at a station, in course order, with pronunciation first', () => {
    const a = course.lines[0]!.stops;
    expect(a[0]!.kind).toBe('pronunciation');
    expect(course.units.map((u) => course.stopByUnit.get(u.id)!.position)).toEqual([2, 3, 4, 5]);
  });

  it('has the Václavák double milestone: review at Můstek, A1 check at Muzeum', () => {
    const m = course.stopsByKey.get('A/mustek')!;
    const n = course.stopsByKey.get('A/muzeum')!;
    expect(m.kind === 'milestone' && m.milestone).toEqual({ id: 'vaclavak', part: 'review', level: 'A1' });
    expect(n.kind === 'milestone' && n.milestone).toEqual({ id: 'vaclavak', part: 'check', level: 'A1' });
  });

  it('uses ASCII slugs and only the 24 tile tokens', () => {
    for (const l of course.lines) for (const s of l.stops) {
      expect(s.slug).toMatch(/^[a-z0-9-]+$/);
      expect(Number(s.stationInfo.tile)).toBeGreaterThanOrEqual(1);
      expect(Number(s.stationInfo.tile)).toBeLessThanOrEqual(24);
    }
  });

  it('gives each Line A station its own tile colour', () => {
    const tiles = course.lines[0]!.stops.map((s) => s.stationInfo.tile);
    expect(new Set(tiles).size).toBe(tiles.length);
  });

  it('flags units placed on a line out of course order', () => {
    const json = structuredClone(contentFiles.json) as Record<string, any>;
    const a = json['lines/lines.json'].lines[0].stops;
    [a[1], a[2]] = [a[2], a[1]];
    expect(loadContent({ ...contentFiles, json }).errors.join('\n')).toMatch(/not in course.json order/);
  });
});
