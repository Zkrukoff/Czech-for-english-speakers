import { Stamp, Ticket } from '@/components/ui';
import { daysCs, daysEn, shortDate, vylukyCs, type TicketState } from '@/lib/streak';

/**
 * The ticket that grows with each day you practise. Playful, never a guilt
 * trip: no notifications, and an expired ticket keeps its place in the wallet.
 */
export function StreakTicket({ t }: { t: TicketState & { today: string } }) {
  if (t.days === 0 && t.justExpired) {
    const last = t.justExpired;
    return (
      <div>
        <Ticket
          tone="var(--ticket-void)"
          title="Platnost vypršela"
          from="Expired"
          date={`${daysCs(last.days)} · ${shortDate(last.from)}–${shortDate(last.to)}`}
          stamp={<span className="label-board text-center">Neplatná</span>}
        />
        <p className="mt-3 text-ink-2">
          It happens: the tram still runs. One exercise validates a new ticket. Your last one ran{' '}
          <span className="font-semibold text-ink">{daysEn(last.days)}</span>.
        </p>
      </div>
    );
  }
  if (t.days === 0 || !t.tier) return null;
  return (
    <div>
      <Ticket
        title={t.tier.cs}
        from={t.tier.en}
        date={`Den ${t.days} · od ${shortDate(t.from!)}`}
        stamp={
          t.practisedToday ? (
            <Stamp top="OZNAČENO" main={shortDate(t.today).replace(/\s/g, '')} size={88} animate={false} />
          ) : (
            <span className="label-board text-center leading-snug">Platí<br />do 04:00</span>
          )
        }
      />
      <p className="mt-3 text-ink-2">
        {t.practisedToday ? (
          <><span lang="cs" className="font-semibold text-ink">Označeno.</span> Today is validated.</>
        ) : t.frozen.includes(t.today) ? (
          <><span lang="cs" className="font-semibold text-ink">Výluka.</span> Today is covered; enjoy the day off.</>
        ) : (
          <>Still valid until 04:00. One exercise validates today.</>
        )}{' '}
        {t.next && <>{t.next.inDays === 1 ? 'Tomorrow' : `In ${t.next.inDays} days`} it becomes a {t.next.tier.en.toLowerCase()}.</>}
      </p>
      {t.freezes > 0 && (
        <p className="mt-1 text-sm text-ink-3">
          <span lang="cs">{vylukyCs(t.freezes)}</span> in hand: a missed day uses one and the ticket carries on.
        </p>
      )}
    </div>
  );
}
