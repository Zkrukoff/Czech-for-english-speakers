import type { Holiday, HolidaysData } from '@/content/schema';

/** Easter Sunday (Gregorian), by the anonymous Gregorian ("Meeus/Jones/Butcher") algorithm. */
export function easterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

/** The date a holiday falls on in a given year (local time, midnight). */
export function holidayDate(h: Holiday, year: number): Date {
  const m = /^easter([+-]\d)$/.exec(h.date);
  if (m) {
    const e = easterSunday(year);
    return new Date(year, e.getMonth(), e.getDate() + Number(m[1]));
  }
  const [mm, dd] = h.date.split('-').map(Number);
  return new Date(year, mm! - 1, dd!);
}

const midnight = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const DAY = 86_400_000;

/** Holidays that fall on this date. */
export function holidaysOn(date: Date, data: HolidaysData | null): Holiday[] {
  if (!data) return [];
  const t = midnight(date).getTime();
  return data.holidays.filter((h) => holidayDate(h, date.getFullYear()).getTime() === t);
}

/** The next holiday after today (not today's), with its date and how many days away. */
export function nextHoliday(date: Date, data: HolidaysData | null): { holiday: Holiday; date: Date; days: number } | null {
  if (!data) return null;
  const today = midnight(date);
  let best: { holiday: Holiday; date: Date; days: number } | null = null;
  for (const year of [date.getFullYear(), date.getFullYear() + 1]) {
    for (const h of data.holidays) {
      const d = holidayDate(h, year);
      // Round, not floor: a daylight-saving change makes one day 23 or 25 hours.
      const days = Math.round((d.getTime() - today.getTime()) / DAY);
      if (days > 0 && (!best || days < best.days)) best = { holiday: h, date: d, days };
    }
  }
  return best;
}

/**
 * "za 3 dny": the Czech for "in N days", with the noun agreeing with the
 * number (1 den, 2–4 dny, 5+ dní), the rule taught at /grammar/numbers.
 */
export function inDaysCs(n: number): string {
  if (n === 1) return 'zítra';
  const word = n >= 2 && n <= 4 ? 'dny' : 'dní';
  return `za ${n} ${word}`;
}
