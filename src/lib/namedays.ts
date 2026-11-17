import type { NamedaysData } from '@/content/schema';

const key = (d: Date) => `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** Names celebrated on a date (local time), e.g. ["Adam a Eva"] on 24 December. */
export function namesOn(date: Date, data: NamedaysData | null): string[] {
  return data?.days[key(date)] ?? [];
}

/** Whether a date's entry is flagged for checking by a native speaker. */
export function needsCheck(date: Date, data: NamedaysData | null): boolean {
  return !!data?.verify.some((v) => v.date === key(date));
}

/** Dates (MM-DD) on which a name is celebrated. Matches whole names inside "Petr a Pavel". */
export function datesFor(name: string, data: NamedaysData | null): string[] {
  if (!data) return [];
  const want = name.trim().toLocaleLowerCase('cs');
  return Object.entries(data.days)
    .filter(([, names]) => names.some((n) => n.toLocaleLowerCase('cs').split(/\s+a\s+|\s*\(|\)|,\s*/).map((x) => x.trim()).includes(want)))
    .map(([d]) => d);
}
