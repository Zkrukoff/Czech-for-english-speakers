import { describe, expect, it } from 'vitest';
import { contentFiles } from '@/content/files';
import { loadContent } from '@/content/loader';
import { buildWall, wallCounts } from '@/lib/wall';
import { stationsCs } from '@/features/wall/exportWall';

const { course } = loadContent(contentFiles);
const empty = { lessons: new Map(), stamps: new Set<string>(), alphabetPractised: false };

describe('Station wall', () => {
  it('has a block per built Line A station and none for closed ones', () => {
    const wall = buildWall(course, empty);
    expect(wall.map((b) => b.slug)).toEqual(['nemocnice-motol', 'petriny', 'nadrazi-veleslavin', 'borislavka', 'dejvicka', 'hradcanska', 'mustek', 'muzeum', 'depo-hostivar'].filter((s) => course.stopsByKey.has(`A/${s}`) && course.stopsByKey.get(`A/${s}`)!.kind !== 'planned'));
    expect(wall.find((b) => b.slug === 'petriny')!.cells).toEqual(['empty', 'empty', 'empty', 'empty']);
    expect(wallCounts(wall).filled).toBe(0);
  });

  it('fills a circle per finished lesson, rings a started one, frames a stamped station', () => {
    const wall = buildWall(course, {
      lessons: new Map([
        ['u01-l01', { completedAt: 1, stepsDone: ['practice'] }],
        ['u01-l02', { stepsDone: ['explanation'] }],
      ]),
      stamps: new Set(['unit:u01']),
      alphabetPractised: true,
    });
    const petriny = wall.find((b) => b.slug === 'petriny')!;
    expect(petriny.cells.slice(0, 2)).toEqual(['done', 'started']);
    expect(petriny.stamped).toBe(true);
    expect(wall[0]!.cells).toEqual(['done']);
    expect(wallCounts(wall)).toMatchObject({ filled: 2, stations: 1 });
  });

  it('counts stations in Czech', () => {
    expect([0, 1, 3, 5].map(stationsCs)).toEqual(['zatím žádná stanice', '1 stanice', '3 stanice', '5 stanic']);
  });
});
