/**
 * Prague time for everything "daily": the ticket's 04:00 day, today's holiday,
 * today's name day, the countdown and the idiom of the week. Pražák is about
 * life in Prague, so a learner on a trip (or a phone set to UTC) still gets
 * Prague's day. Daylight saving is handled by the browser's time-zone data.
 */
export const PRAGUE = 'Europe/Prague';

let fmt: Intl.DateTimeFormat | undefined;
/** Created on first use: building an Intl formatter is slow on phones, and not every screen needs one. */
const formatter = () => (fmt ??= new Intl.DateTimeFormat('en-CA', {
  timeZone: PRAGUE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
}));

/** Prague's wall-clock fields for a moment. */
export function pragueParts(at: number | Date = Date.now()) {
  const parts = Object.fromEntries(formatter().formatToParts(typeof at === 'number' ? at : at.getTime()).map((p) => [p.type, p.value]));
  return { year: +parts.year!, month: +parts.month!, day: +parts.day!, hour: +parts.hour!, minute: +parts.minute! };
}

/**
 * A local Date whose calendar fields (year, month, day, hours) are Prague's
 * right now. Use it wherever code reads getFullYear/getMonth/getDate to mean
 * "today in Prague"; never compare it to real timestamps.
 */
export function pragueNow(at: number | Date = Date.now()): Date {
  const p = pragueParts(at);
  return new Date(p.year, p.month - 1, p.day, p.hour, p.minute);
}

/** "YYYY-MM-DD" of the Prague calendar day. */
export function pragueDateKey(at: number | Date = Date.now()): string {
  const p = pragueParts(at);
  return `${p.year}-${String(p.month).padStart(2, '0')}-${String(p.day).padStart(2, '0')}`;
}
