import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/db';
import { getSettings, updateSettings, useSettings } from '@/db/settings';
import { ANSWERS_PER_DAY, computeTicket, dayKey, validatedDays, type TicketState } from '@/lib/streak';

/** The learner's day, refreshed each minute so the 04:00 rollover shows without a reload. */
export function useToday(): string {
  const [today, setToday] = useState(() => dayKey(Date.now()));
  useEffect(() => {
    const t = setInterval(() => setToday(dayKey(Date.now())), 60_000);
    return () => clearInterval(t);
  }, []);
  return today;
}

/** undefined while loading; null when the learner has switched tickets off. */
export type TicketView = TicketState & { today: string; planned: string[]; answersToday: number; needed: number };

export function useTicket(): TicketView | null | undefined {
  const settings = useSettings();
  const today = useToday();
  const byDay = useLiveQuery(async () => {
    const stamps = (await db.attempts.orderBy('timestamp').keys()) as number[];
    const m = new Map<string, number>();
    for (const t of stamps) {
      const k = dayKey(t);
      m.set(k, (m.get(k) ?? 0) + 1);
    }
    return m;
  }, []);
  // The stricter rule starts on the first day this version runs here; earlier days are kept as they were.
  useEffect(() => {
    if (settings.ticketRuleFrom) return;
    // Read the stored settings, not the defaults shown while they load, before writing.
    void getSettings().then((s) => (s.ticketRuleFrom ? undefined : updateSettings({ ticketRuleFrom: today })));
  }, [settings.ticketRuleFrom, today]);
  if (settings.showTicket === false) return null;
  if (!byDay) return undefined;
  const planned = settings.vylukaDays ?? [];
  const ruleFrom = settings.ticketRuleFrom ?? today;
  const days = validatedDays(byDay, settings.reviewClearedDays ?? [], ruleFrom);
  return { ...computeTicket(days, planned, today), today, planned, answersToday: byDay.get(today) ?? 0, needed: ANSWERS_PER_DAY };
}

/** Called when a review session ends with nothing left due: that validates the day too. */
export async function markReviewCleared(day: string) {
  const s = await getSettings();
  const list = [...new Set([...(s.reviewClearedDays ?? []), day])].sort().slice(-60);
  await updateSettings({ reviewClearedDays: list });
}
