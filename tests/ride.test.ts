import { describe, expect, it } from 'vitest';
import { contentFiles } from '@/content/files';
import { loadContent } from '@/content/loader';
import { exercisesPerStop, routeBetween } from '@/lib/ride';

const { course } = loadContent(contentFiles);

describe("today's ride", () => {
  it('counts stops along one line', () => {
    expect(routeBetween(course.lines, 'flora', 'mustek')).toEqual({
      stations: ['Flora', 'Jiřího z Poděbrad', 'Náměstí Míru', 'Muzeum', 'Můstek'],
      stops: 4,
      lines: ['A'],
      changes: [],
    });
  });

  it('changes lines at a transfer station for free', () => {
    const r = routeBetween(course.lines, 'dejvicka', 'andel')!;
    expect(r.stops).toBe(7); // Dejvická → Můstek (4) on A, Můstek → Anděl (3) on B
    expect(r.lines).toEqual(['A', 'B']);
    expect(r.changes).toEqual(['Můstek']);
  });

  it('takes the shortest way across the network', () => {
    // Zličín → Háje: B to Můstek, one stop on A to Muzeum, then C (23) beats changing at Florenc (14 + 12 = 26).
    const r = routeBetween(course.lines, 'zlicin', 'haje')!;
    expect(r).toMatchObject({ stops: 23, lines: ['B', 'A', 'C'], changes: ['Můstek', 'Muzeum'] });
    const viaFlorenc = routeBetween(course.lines, 'zlicin', 'florenc')!.stops + routeBetween(course.lines, 'florenc', 'haje')!.stops;
    expect(viaFlorenc).toBe(26);
  });

  it('handles a ride of zero stops and unknown stations', () => {
    expect(routeBetween(course.lines, 'flora', 'flora')!.stops).toBe(0);
    expect(routeBetween(course.lines, 'flora', 'nowhere')).toBeNull();
  });

  it('calibrates exercises per stop from the learner’s pace', () => {
    expect(exercisesPerStop([])).toBe(3);
    const fast = Array.from({ length: 30 }, (_, i) => i * 20_000); // 20 s per answer
    expect(exercisesPerStop(fast)).toBe(6);
    const slow = Array.from({ length: 30 }, (_, i) => i * 60_000); // 60 s per answer
    expect(exercisesPerStop(slow)).toBe(2);
    const withBreaks = Array.from({ length: 30 }, (_, i) => i * 40_000 + (i > 15 ? 3_600_000 : 0));
    expect(exercisesPerStop(withBreaks)).toBe(3);
  });
});
