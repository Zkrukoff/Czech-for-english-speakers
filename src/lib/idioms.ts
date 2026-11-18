import { pragueNow } from './pragueTime';

/**
 * Idiom of the week: the same idiom for everyone in a given ISO week (Monday
 * to Sunday), cycling through the list in order.
 */

/** Monday of the ISO week containing `date`, as a UTC day number. */
function mondayDay(date: Date): number {
  const day = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000;
  const weekday = (date.getDay() + 6) % 7; // Monday = 0
  return day - weekday;
}

/** Weeks since Monday 5 January 2026 (ISO week 2 of 2026). Negative before then. */
export function weekIndex(date: Date): number {
  return Math.floor((mondayDay(date) - Date.UTC(2026, 0, 5) / 86_400_000) / 7);
}

export function idiomOfWeek<T>(idioms: T[], date = pragueNow()): T | undefined {
  if (!idioms.length) return undefined;
  const n = idioms.length;
  return idioms[((weekIndex(date) % n) + n) % n];
}

/** ISO 8601 week number, for the label ("týden 47"). */
export function isoWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  return 1 + Math.round(((d.getTime() - firstThursday.getTime()) / 86_400_000 - 3 + ((firstThursday.getUTCDay() + 6) % 7)) / 7);
}
