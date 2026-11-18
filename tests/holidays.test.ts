import { describe, expect, it } from 'vitest';
import { contentFiles } from '@/content/files';
import { loadContent } from '@/content/loader';
import { easterSunday, holidaysOn, inDaysCs, nextHoliday } from '@/lib/holidays';

const { course, errors } = loadContent(contentFiles);
const d = (y: number, m: number, day: number) => new Date(y, m - 1, day);

describe('Czech public holidays', () => {
  it('loads all 13, matching the culture guide', () => {
    expect(errors).toEqual([]);
    expect(course.holidays!.holidays).toHaveLength(13);
  });

  it('computes Easter (Gregorian)', () => {
    expect(easterSunday(2024)).toEqual(d(2024, 3, 31));
    expect(easterSunday(2025)).toEqual(d(2025, 4, 20));
    expect(easterSunday(2026)).toEqual(d(2026, 4, 5));
    expect(easterSunday(2027)).toEqual(d(2027, 3, 28));
  });

  it('places Good Friday and Easter Monday around it', () => {
    expect(holidaysOn(d(2026, 4, 3), course.holidays).map((h) => h.id)).toEqual(['velky-patek']);
    expect(holidaysOn(d(2026, 4, 6), course.holidays).map((h) => h.id)).toEqual(['velikonocni-pondeli']);
  });

  it('knows today is a holiday on 17 November', () => {
    expect(holidaysOn(d(2026, 11, 17), course.holidays).map((h) => h.cs)).toEqual(['Den boje za svobodu a demokracii']);
    expect(holidaysOn(d(2026, 11, 18), course.holidays)).toEqual([]);
  });

  it('counts down to the next holiday, never today’s, across the new year', () => {
    expect(nextHoliday(d(2026, 11, 17), course.holidays)).toMatchObject({ holiday: { id: 'stedry-den' }, days: 37 });
    expect(nextHoliday(d(2026, 12, 26), course.holidays)).toMatchObject({ holiday: { id: 'novy-rok' }, days: 6 });
    expect(nextHoliday(d(2027, 1, 2), course.holidays)).toMatchObject({ holiday: { id: 'velky-patek' }, days: 83 }); // 26 March 2027
    // Across the spring clock change (29 March 2026) the count still lands on whole days.
    expect(nextHoliday(d(2026, 3, 28), course.holidays)).toMatchObject({ holiday: { id: 'velky-patek' }, days: 6 });
  });

  it('says "in N days" in Czech with the right plural', () => {
    expect([1, 2, 4, 5, 22, 37].map(inDaysCs)).toEqual(['zítra', 'za 2 dny', 'za 4 dny', 'za 5 dní', 'za 22 dní', 'za 37 dní']);
  });
});

import { featuredPrep, nextDateFor } from '@/lib/holidays';

describe('holiday prep lessons', () => {
  it('has a lesson for every public holiday, each with words, customs and exercises', () => {
    const covered = new Set(course.holidayLessons.flatMap((l) => l.holidays));
    expect([...covered].sort()).toEqual(course.holidays!.holidays.map((h) => h.id).sort());
    for (const l of course.holidayLessons) {
      expect(l.vocab.length + l.exercises.length).toBeGreaterThan(4);
      expect(l.nativeReviewed).toBe(false);
    }
  });

  it('features a lesson on the day and in the 7 days before, and not earlier', () => {
    expect(featuredPrep(d(2026, 11, 17), course.holidays, course.holidayLessons)).toMatchObject({ lesson: { id: 'hol-17-listopad' }, days: 0 });
    expect(featuredPrep(d(2026, 12, 17), course.holidays, course.holidayLessons)).toMatchObject({ lesson: { id: 'hol-vanoce' }, days: 7 });
    expect(featuredPrep(d(2026, 12, 16), course.holidays, course.holidayLessons)).toBeNull();
    expect(featuredPrep(d(2026, 12, 25), course.holidays, course.holidayLessons)?.lesson.id).toBe('hol-vanoce');
    expect(featuredPrep(d(2026, 3, 30), course.holidays, course.holidayLessons)).toMatchObject({ lesson: { id: 'hol-velikonoce' }, days: 4 });
  });

  it('knows when each lesson’s holiday comes next', () => {
    expect(nextDateFor(['velky-patek', 'velikonocni-pondeli'], d(2026, 11, 17), course.holidays)).toEqual(d(2027, 3, 26));
  });

  it('records official sources for dates and shop rules', () => {
    expect(course.holidays!.verified.map((v) => new URL(v.url).hostname)).toEqual(['mzv.gov.cz', 'coi.gov.cz']);
  });
});
