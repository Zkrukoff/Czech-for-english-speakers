import { updateSettings } from '@/db/settings';
import { addDays, daysCs, daysEn, shortDate, TICKET_SOURCE, TIERS, vylukyCs } from '@/lib/streak';
import { StreakTicket } from './StreakTicket';
import { useTicket } from './useTicket';

const WEEKDAY = ['ne', 'po', 'út', 'st', 'čt', 'pá', 'so'];

/** Wallet: the current ticket, výluka planning, and every ticket that has run out. */
export function TicketWallet() {
  const t = useTicket();
  if (!t) return null;
  const upcoming = Array.from({ length: 7 }, (_, i) => addDays(t.today, i + 1));
  const plannedAhead = t.planned.filter((d) => d > t.today);
  const canPlan = t.freezes - plannedAhead.length;

  function toggle(day: string) {
    const keep = t!.planned.filter((d) => d >= t!.today);
    const next = keep.includes(day) ? keep.filter((d) => d !== day) : [...keep, day].sort();
    void updateSettings({ vylukaDays: next });
  }

  return (
    <section id="ticket" aria-labelledby="ticket-h" className="mb-12">
      <h2 id="ticket-h" className="label-board mb-4 text-ink-3"><span lang="cs">Jízdenka</span> · your ticket</h2>
      {t.days === 0 && !t.justExpired ? (
        <p className="text-ink-2">No ticket yet. Answer one exercise and a 24-hour ticket appears here.</p>
      ) : (
        <div className="grid gap-8 md:grid-cols-2">
          <StreakTicket t={t} />
          <div>
            {t.days > 0 && (
              <>
                <h3 className="font-semibold">Plan a <span lang="cs">výluka</span></h3>
                <p className="mt-1 text-sm text-ink-2">
                  Away for a few days? Mark them as planned works and the ticket stays valid.
                  You earn a <span lang="cs">výluka</span> for every 3 days in a row and can hold {3}.{' '}
                  {t.freezes === 0 ? 'You have none in hand yet.' : <>You have <span lang="cs">{vylukyCs(t.freezes)}</span>.</>}
                </p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {upcoming.map((d) => {
                    const on = plannedAhead.includes(d);
                    const wd = WEEKDAY[new Date(`${d}T12:00:00`).getDay()]!;
                    return (
                      <li key={d}>
                        <button
                          type="button"
                          aria-pressed={on}
                          disabled={!on && canPlan <= 0}
                          onClick={() => toggle(d)}
                          className={`min-h-11 rounded border-2 px-3 font-mono text-sm disabled:opacity-40 ${on ? 'border-ink bg-ink text-paper' : 'border-ink bg-surface text-ink'}`}
                        >
                          <span lang="cs">{wd}</span> {shortDate(d)}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
            {t.past.length > 0 && (
              <>
                <h3 className="mt-8 font-semibold">Used tickets</h3>
                <p className="text-sm text-ink-2">Longest: <span className="font-semibold text-ink">{daysEn(t.longest)}</span>.</p>
                <ul className="mt-2 divide-y-2 divide-rule border-y-2 border-rule">
                  {[...t.past].reverse().slice(0, 8).map((p) => (
                    <li key={p.from} className="flex flex-wrap justify-between gap-x-3 py-2 font-mono text-sm">
                      <span lang="cs">{TIERS.find((x) => x.id === p.tier)!.cs}</span>
                      <span className="text-ink-2"><span lang="cs">{daysCs(p.days)}</span> · {shortDate(p.from)}–{shortDate(p.to)}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      )}
      <p className="mt-4 text-xs text-ink-3">
        Ticket types as sold by PID, checked {TICKET_SOURCE.date} on <a href={TICKET_SOURCE.url} className="underline" target="_blank" rel="noreferrer">pid.cz</a>. Days start at 04:00. You can switch the ticket off in Settings.
      </p>
    </section>
  );
}
