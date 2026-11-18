import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Line, Stop } from '@/content/loader';
import { LineBadge } from '@/components/ui';
import { IconPin } from '@/components/icons';
import { stationPath } from '@/lib/paths';
import { stopSummary } from '@/features/line/stopSummary';
import type { StopState } from './LineStrip';

const LINE_BG = { A: 'bg-line-a', B: 'bg-line-b', C: 'bg-line-c' } as const;

/**
 * The line running top to bottom, for phones: station names straight, with
 * what's taught there in English underneath (phones can't hover). Shows the
 * stops around "you are here", and unfolds to the whole line.
 */
export function LineVertical({ line, stateOf, homeKey }: { line: Line; stateOf: (s: Stop) => StopState; homeKey?: string }) {
  const [all, setAll] = useState(false);
  const here = Math.max(0, line.stops.findIndex((s) => stateOf(s) === 'current'));
  const from = all ? 0 : Math.max(0, here - 1);
  const to = all ? line.stops.length : Math.min(line.stops.length, from + 6);
  const shown = line.stops.slice(from, to);

  return (
    <div>
      {from > 0 && <p className="mb-1 pl-[3.25rem] text-xs text-ink-3">↑ {from} earlier {from === 1 ? 'station' : 'stations'}</p>}
      <ol className="relative" aria-label={`Linka ${line.id}, stations ${from + 1} to ${to} of ${line.stops.length}`}>
        <span aria-hidden className={`absolute bottom-6 left-[1.3rem] top-6 w-2 ${LINE_BG[line.id]}`} />
        {shown.map((stop) => {
          const state = stateOf(stop);
          const sum = stopSummary(stop);
          const isHome = homeKey === `${stop.line}/${stop.slug}`;
          return (
            <li key={stop.slug}>
              <Link
                to={stationPath(stop)}
                aria-current={state === 'current' ? 'location' : undefined}
                className="group relative flex min-h-14 items-center gap-3 py-1.5"
              >
                <span
                  aria-hidden
                  className={`relative z-[1] flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-[3px] border-ink ${stop.kind === 'milestone' ? 'ring-2 ring-ink ring-offset-2 ring-offset-paper' : ''} ${
                    state === 'done' ? 'bg-ink' : state === 'current' ? 'bg-line-b' : state === 'vyluka' ? 'border-dashed bg-paper' : 'bg-surface'
                  }`}
                >
                  {state === 'current' && <IconPin size={20} className="text-on-fill-dark" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className={`flex flex-wrap items-center gap-x-2 ${state === 'vyluka' ? 'text-ink-3' : 'text-ink'}`}>
                    <span lang="cs" className={`text-lg leading-tight ${state === 'current' ? 'font-extrabold' : 'font-semibold'} group-hover:underline`}>
                      {stop.stationInfo.name}
                    </span>
                    {stop.transfers.map((t) => <LineBadge key={t} line={t} size={20} />)}
                    {isHome && <span className="label-board text-2xs text-ink-2">domov</span>}
                  </span>
                  <span className={`block text-sm leading-snug ${state === 'vyluka' ? 'text-ink-3' : 'text-ink-2'}`}>
                    {state === 'current' && <b className="text-ink">You are here · </b>}
                    {sum.kicker}: {sum.title}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
      <div className="mt-2 flex items-center justify-between gap-3 pl-[3.25rem]">
        {to < line.stops.length && !all && <p className="whitespace-nowrap text-xs text-ink-3">↓ {line.stops.length - to} more stations</p>}
        <button type="button" onClick={() => setAll((a) => !a)} className="btn btn-quiet ml-auto text-sm" aria-expanded={all}>
          {all ? 'Show less' : `Whole line (${line.stops.length})`}
        </button>
      </div>
    </div>
  );
}
