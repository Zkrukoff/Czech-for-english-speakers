import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { dueSummary, type DueSummary } from './srs';
import { isResolvable } from '@/lib/srs/resolvable';

/** Current time, refreshed every minute so "due now" counts stay correct while the app is open. */
export function useNow(intervalMs = 60_000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

export function useDueSummary(): DueSummary | undefined {
  const now = useNow();
  return useLiveQuery(() => dueSummary(now, undefined, isResolvable), [now]);
}
