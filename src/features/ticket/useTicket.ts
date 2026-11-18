import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/db';
import { useSettings } from '@/db/settings';
import { computeTicket, dayKey, type TicketState } from '@/lib/streak';

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
export function useTicket(): (TicketState & { today: string; planned: string[] }) | null | undefined {
  const settings = useSettings();
  const today = useToday();
  const days = useLiveQuery(async () => {
    const stamps = (await db.attempts.orderBy('timestamp').keys()) as number[];
    return [...new Set(stamps.map((t) => dayKey(t)))];
  }, []);
  if (settings.showTicket === false) return null;
  if (!days) return undefined;
  const planned = settings.vylukaDays ?? [];
  return { ...computeTicket(days, planned, today), today, planned };
}
