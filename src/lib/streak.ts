/**
 * Ticket streaks (A7). Derived from the answer log: nothing is stored except
 * the výluka days a learner plans ahead (in Settings).
 *
 * - A day runs 04:00 to 04:00, so a late-night session counts for the evening.
 * - Practising (any answer) validates the day.
 * - A missed day uses a výluka (freeze) if you have one: planned ones first,
 *   then automatically. You earn one for every 3 days you practise in a row,
 *   and hold at most 3.
 * - Otherwise the ticket expires. Expired tickets stay in the wallet.
 *
 * Tiers are real PID products, checked on pid.cz/jizdne-a-tarif (2026-11-18).
 */

export const DAY_STARTS_AT_HOUR = 4;
export const MAX_FREEZES = 3;
export const FREEZE_EVERY = 3;

export type TierId = '24h' | '72h' | 'month' | 'quarter' | 'year';

export const TIERS: { id: TierId; minDays: number; cs: string; en: string }[] = [
  { id: '24h', minDays: 1, cs: '24hodinová jízdenka', en: '24-hour ticket' },
  { id: '72h', minDays: 3, cs: '72hodinová jízdenka', en: '72-hour ticket' },
  { id: 'month', minDays: 30, cs: 'Měsíční kupon', en: 'Monthly pass' },
  { id: 'quarter', minDays: 90, cs: 'Čtvrtletní kupon', en: 'Quarterly pass' },
  { id: 'year', minDays: 365, cs: 'Roční kupon', en: 'Annual pass' },
];

export const TICKET_SOURCE = { url: 'https://pid.cz/jizdne-a-tarif/', date: '2026-11-18' };

/** "YYYY-MM-DD" of the learner's day (local time, day starts at 04:00). */
export function dayKey(ts: number | Date): string {
  const d = new Date(typeof ts === 'number' ? ts : ts.getTime());
  d.setHours(d.getHours() - DAY_STARTS_AT_HOUR);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function addDays(key: string, n: number): string {
  const [y, m, d] = key.split('-').map(Number);
  const dt = new Date(Date.UTC(y!, m! - 1, d! + n));
  return dt.toISOString().slice(0, 10);
}

export function tierFor(days: number) {
  let t = TIERS[0]!;
  for (const x of TIERS) if (days >= x.minDays) t = x;
  return t;
}

export interface PastTicket {
  days: number;
  from: string;
  to: string;
  tier: TierId;
}

export interface TicketState {
  /** Days on the current ticket (practised + covered by výluka). 0 = no valid ticket. */
  days: number;
  from: string | null;
  tier: (typeof TIERS)[number] | null;
  next: { tier: (typeof TIERS)[number]; inDays: number } | null;
  practisedToday: boolean;
  freezes: number;
  /** Days covered by a výluka on the current ticket. */
  frozen: string[];
  /** The last ticket, if it expired and nothing has been validated since. */
  justExpired: PastTicket | null;
  past: PastTicket[];
  longest: number;
}

export function computeTicket(practiceDays: Iterable<string>, plannedVyluka: Iterable<string>, today: string): TicketState {
  const practised = new Set(practiceDays);
  const planned = new Set(plannedVyluka);
  const sorted = [...practised].filter((d) => d <= today).sort();
  const past: PastTicket[] = [];
  let days = 0;
  let from: string | null = null;
  let streakPractised = 0;
  let freezes = 0;
  let frozen: string[] = [];

  const expire = (lastDay: string) => {
    if (days > 0 && from) past.push({ days, from, to: lastDay, tier: tierFor(days).id });
    days = 0;
    from = null;
    streakPractised = 0;
    frozen = [];
  };

  if (sorted.length) {
    for (let d = sorted[0]!; d <= today; d = addDays(d, 1)) {
      if (practised.has(d)) {
        if (!from) from = d;
        days++;
        streakPractised++;
        if (streakPractised % FREEZE_EVERY === 0) freezes = Math.min(MAX_FREEZES, freezes + 1);
        continue;
      }
      if (d === today) break; // today is still open
      if (days > 0 && freezes > 0) {
        freezes--;
        days++;
        frozen.push(d);
        continue;
      }
      expire(addDays(d, -1));
    }
  }

  // Planned výluka for today counts as covered (if a freeze is free for it).
  const practisedToday = practised.has(today);
  if (!practisedToday && days > 0 && planned.has(today) && freezes > 0) {
    freezes--;
    days++;
    frozen.push(today);
  }

  const tier = days > 0 ? tierFor(days) : null;
  const nextTier = TIERS.find((t) => t.minDays > days) ?? null;
  const last = past[past.length - 1] ?? null;
  return {
    days,
    from,
    tier,
    next: days > 0 && nextTier ? { tier: nextTier, inDays: nextTier.minDays - days } : null,
    practisedToday,
    freezes,
    frozen,
    justExpired: days === 0 && last ? last : null,
    past,
    longest: Math.max(days, ...past.map((p) => p.days), 0),
  };
}

/** 1 den, 2–4 dny, 5+ dní. */
export function daysCs(n: number): string {
  return `${n} ${n === 1 ? 'den' : n >= 2 && n <= 4 ? 'dny' : 'dní'}`;
}

/** 1 výluka, 2–4 výluky, 0 or 5+ výluk. */
export function vylukyCs(n: number): string {
  return `${n} ${n === 1 ? 'výluka' : n >= 2 && n <= 4 ? 'výluky' : 'výluk'}`;
}

export function shortDate(key: string): string {
  const [, m, d] = key.split('-').map(Number);
  return `${d}. ${m}.`;
}

export const daysEn = (n: number) => `${n} ${n === 1 ? 'day' : 'days'}`;
