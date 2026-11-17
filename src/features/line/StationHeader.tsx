import type { Stop } from '@/content/loader';
import { course } from '@/content';
import { LineBadge, TileGrid } from '@/components/ui';

/**
 * The top of every station screen: the station name as a big enamel-style
 * sign, the line and level, transfers, the station's tile pattern, and what's
 * above ground.
 */
export function StationHeader({ stop, kicker }: { stop: Stop; kicker?: string }) {
  const line = course.lines.find((l) => l.id === stop.line)!;
  const info = stop.stationInfo;
  return (
    <header className="mb-10">
      <div className="relative overflow-hidden border-2 border-ink" style={{ background: `var(--tile-${info.tile})` }}>
        <TileGrid tone={`var(--tile-${info.tile})`} cols={10} rows={2} size={40} className="w-full opacity-90" />
      </div>
      <div className="-mt-7 ml-3 inline-flex max-w-[calc(100%-1.5rem)] items-center gap-3 border-2 border-ink bg-surface px-4 py-3 shadow-offset sm:ml-6">
        <LineBadge line={stop.line} size={44} />
        <div className="min-w-0">
          <p className="label-board text-ink-3">
            Linka {stop.line} · {line.levels.join('–')} · {stop.position}/{line.stops.length}
          </p>
          <h1 lang="cs" className="truncate font-display text-4xl font-extrabold leading-none tracking-tight sm:text-5xl">
            {info.name}
          </h1>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {kicker && <span className="chip">{kicker}</span>}
        {stop.transfers.map((t) => (
          <span key={t} className="chip">
            <span lang="cs">Přestup</span> · change to <LineBadge line={t} size={22} />
          </span>
        ))}
      </div>
      {info.aboveGround && (
        <p className="mt-4 max-w-2xl text-ink-2">
          <span className="label-board mr-2 text-ink-3">Nahoře · above ground</span>
          {info.aboveGround}
        </p>
      )}
    </header>
  );
}
