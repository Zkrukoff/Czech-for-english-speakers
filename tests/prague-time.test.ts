import { afterEach, describe, expect, it } from 'vitest';
import { pragueDateKey, pragueNow, pragueParts } from '@/lib/pragueTime';
import { dayKey } from '@/lib/streak';
import { holidaysOn, nextHoliday } from '@/lib/holidays';
import { namesOn } from '@/lib/namedays';
import { contentFiles } from '@/content/files';
import { loadContent } from '@/content/loader';

const { course } = loadContent(contentFiles);
const originalTZ = process.env.TZ;
afterEach(() => { process.env.TZ = originalTZ; });

describe('Prague time', () => {
  it('handles the spring and autumn clock changes (last Sundays of March and October)', () => {
    // 29 March 2026: 02:00 CET → 03:00 CEST.
    expect(pragueParts(Date.parse('2026-03-29T00:59:00Z')).hour).toBe(1);
    expect(pragueParts(Date.parse('2026-03-29T01:00:00Z')).hour).toBe(3);
    // The 04:00 boundary that morning is 02:00 UTC.
    expect(dayKey(Date.parse('2026-03-29T01:59:00Z'))).toBe('2026-03-28');
    expect(dayKey(Date.parse('2026-03-29T02:00:00Z'))).toBe('2026-03-29');
    // 25 October 2026: 03:00 CEST → 02:00 CET; 04:00 is 03:00 UTC.
    expect(dayKey(Date.parse('2026-10-25T02:59:00Z'))).toBe('2026-10-24');
    expect(dayKey(Date.parse('2026-10-25T03:00:00Z'))).toBe('2026-10-25');
  });

  it('gives Prague’s day to learners in New York and Tokyo, whatever the phone says', () => {
    const instant = Date.parse('2026-12-24T05:30:00Z'); // 06:30 in Prague, 00:30 in New York, 14:30 in Tokyo
    for (const tz of ['America/New_York', 'Asia/Tokyo', 'UTC', 'Europe/Prague']) {
      process.env.TZ = tz;
      expect(pragueDateKey(instant)).toBe('2026-12-24');
      expect(dayKey(instant)).toBe('2026-12-24');
      const today = pragueNow(instant);
      expect([today.getFullYear(), today.getMonth() + 1, today.getDate()]).toEqual([2026, 12, 24]);
      expect(holidaysOn(today, course.holidays).map((h) => h.id)).toContain('stedry-den');
    }
  });

  it('crosses the year end for holidays, name days and the countdown', () => {
    process.env.TZ = 'America/Los_Angeles';
    // 23:30 on 31 Dec in Prague is still the afternoon of 31 Dec in LA; 00:30 on 1 Jan in Prague is 15:30 on 31 Dec in LA.
    const lateNye = pragueNow(Date.parse('2026-12-31T22:30:00Z'));
    const newYear = pragueNow(Date.parse('2026-12-31T23:30:00Z'));
    expect(newYear.getFullYear()).toBe(2027);
    expect(holidaysOn(newYear, course.holidays).map((h) => h.id)).toContain('novy-rok');
    expect(holidaysOn(lateNye, course.holidays)).toEqual([]);
    expect(namesOn(lateNye, course.namedays)).toEqual(namesOn(new Date(2026, 11, 31), course.namedays));
    const next = nextHoliday(lateNye, course.holidays)!;
    expect(next.holiday.id).toBe('novy-rok');
  });
});
