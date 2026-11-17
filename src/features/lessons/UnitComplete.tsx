import { Link } from 'react-router-dom';
import type { Unit } from '@/content/loader';
import { course } from '@/content';
import { LineBadge, Stamp, Ticket } from '@/components/ui';
import { IconArrowRight } from '@/components/icons';
import { stationPath, WALLET_PATH } from '@/lib/paths';
import { useReducedMotion } from '@/lib/useReducedMotion';

/**
 * The validator moment: the station's ticket slides in and the stamp punches
 * it (≤250ms each, static under reduced motion). No confetti.
 */
export function UnitComplete({ unit, at }: { unit: Unit; at: number }) {
  const reduced = useReducedMotion();
  const stop = course.stopByUnit.get(unit.id)!;
  const line = course.lines.find((l) => l.id === stop.line)!;
  const next = line.stops.slice(stop.position).find((s) => s.kind !== 'planned');
  return (
    <section aria-labelledby="done-h" className="mx-auto max-w-lg text-center">
      <p className="label-board text-ink-3" lang="cs">Označeno · validated</p>
      <h2 id="done-h" className="mt-2 font-display text-5xl font-extrabold tracking-tight" lang="cs">Hotovo.</h2>
      <p className="mt-2 text-ink-2">
        Every goal at <span lang="cs">{stop.stationInfo.name}</span> is done. The ticket goes in your wallet.
      </p>
      <div className={`mt-8 flex justify-center ${reduced ? '' : 'animate-rise'}`}>
        <Ticket
          line={<LineBadge line={stop.line} size={22} />}
          title={stop.stationInfo.name}
          from={`Unit ${unit.number} · ${unit.title}`}
          date={new Date(at).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric', year: 'numeric' })}
          stamp={<Stamp main={`U${String(unit.number).padStart(2, '0')}`} bottom={new Date(at).toLocaleDateString('cs-CZ')} size={92} />}
        />
      </div>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        {next && (
          <Link to={stationPath(next)} className="btn btn-primary">
            <span lang="cs">Příští zastávka</span>: {next.stationInfo.name} <IconArrowRight size={16} />
          </Link>
        )}
        <Link to={WALLET_PATH} className="btn btn-secondary">Your ticket wallet</Link>
      </div>
    </section>
  );
}
