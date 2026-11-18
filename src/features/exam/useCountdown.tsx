import { useEffect, useRef, useState } from 'react';

/**
 * Seconds left of `total`, counting down while `running`. Uses the clock, not
 * the number of ticks, so a busy or backgrounded tab doesn't slow it down.
 * Calls `onDone` once when it reaches zero.
 */
export function useCountdown(total: number, running: boolean, onDone?: () => void): number {
  const [left, setLeft] = useState(total);
  const end = useRef<number | null>(null);
  const done = useRef(onDone);
  done.current = onDone;
  useEffect(() => {
    if (!running) { end.current = null; return; }
    end.current = Date.now() + left * 1000;
    const tick = () => {
      const s = Math.max(0, Math.ceil((end.current! - Date.now()) / 1000));
      setLeft(s);
      if (s === 0) { clearInterval(id); done.current?.(); }
    };
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
    // `left` is read once at start: restarting resumes where it stopped.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);
  return left;
}

export function clock(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/** A visible countdown, announced politely to screen readers only each minute. */
export function TimerBadge({ seconds, label }: { seconds: number; label: string }) {
  const low = seconds <= 60;
  return (
    <span className={`label-board inline-flex min-h-11 items-center rounded-md border-2 px-3 ${low ? 'border-ink bg-paper-2 text-ink' : 'border-rule-strong text-ink-2'}`}>
      <span aria-hidden>{label} {clock(seconds)}</span>
      <span className="sr-only" aria-live={seconds % 60 === 0 ? 'polite' : 'off'}>{`${label}: ${Math.ceil(seconds / 60)} minutes left`}</span>
    </span>
  );
}
