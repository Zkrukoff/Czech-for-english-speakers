import { describe, expect, it } from 'vitest';
import { addDays, computeTicket, dayKey, tierFor } from '@/lib/streak';

const run = (from: string, n: number) => Array.from({ length: n }, (_, i) => addDays(from, i));

describe('Ticket streaks', () => {
  it('starts the day at 04:00', () => {
    expect(dayKey(new Date(2026, 10, 18, 3, 59))).toBe('2026-11-17');
    expect(dayKey(new Date(2026, 10, 18, 4, 0))).toBe('2026-11-18');
  });

  it('uses real PID tiers', () => {
    expect([1, 2, 3, 29, 30, 90, 365].map((d) => tierFor(d).id)).toEqual(['24h', '24h', '72h', '72h', 'month', 'quarter', 'year']);
  });

  it('keeps the ticket valid while today is still open', () => {
    const t = computeTicket(run('2026-11-10', 8), [], '2026-11-18');
    expect(t.days).toBe(8);
    expect(t.practisedToday).toBe(false);
    expect(t.tier!.id).toBe('72h');
    expect(t.next).toEqual({ tier: expect.objectContaining({ id: 'month' }), inDays: 22 });
  });

  it('earns a výluka every 3 days, at most 3, and spends one on a missed day', () => {
    const days = [...run('2026-11-01', 12), ...run('2026-11-14', 3)]; // 13 Nov missed
    const t = computeTicket(days, [], '2026-11-16');
    expect(t.days).toBe(16);
    expect(t.frozen).toEqual(['2026-11-13']);
    expect(t.freezes).toBe(3); // 4 earned, capped at 3, one spent, one earned back
  });

  it('expires without a výluka, keeps the old ticket, and says so until you validate again', () => {
    const t = computeTicket(run('2026-11-01', 2), [], '2026-11-05');
    expect(t.days).toBe(0);
    expect(t.justExpired).toEqual({ days: 2, from: '2026-11-01', to: '2026-11-02', tier: '24h' });
    expect(t.longest).toBe(2);
    const again = computeTicket([...run('2026-11-01', 2), '2026-11-05'], [], '2026-11-05');
    expect(again.days).toBe(1);
    expect(again.justExpired).toBeNull();
    expect(again.past).toHaveLength(1);
  });

  it('covers today with a planned výluka', () => {
    const t = computeTicket(run('2026-11-01', 3), ['2026-11-04'], '2026-11-04');
    expect(t.days).toBe(4);
    expect(t.freezes).toBe(0);
  });

  it('has no ticket before the first answer', () => {
    const t = computeTicket([], [], '2026-11-18');
    expect(t).toMatchObject({ days: 0, tier: null, justExpired: null, longest: 0 });
  });
});
