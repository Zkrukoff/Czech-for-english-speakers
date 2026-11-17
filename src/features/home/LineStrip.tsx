import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import type { Line, Stop } from '@/content/loader';
import { LineBadge } from '@/components/ui';
import { IconPin } from '@/components/icons';
import { stationPath } from '@/lib/paths';

const LINE_BG = { A: 'bg-line-a', B: 'bg-line-b', C: 'bg-line-c' } as const;

export type StopState = 'done' | 'current' | 'open' | 'vyluka';

interface Props {
  line: Line;
  stateOf: (stop: Stop) => StopState;
  /** Station key of the learner's real home stop, e.g. "A/flora". */
  homeKey?: string;
  compact?: boolean;
}

/**
 * The home screen's strip map, like the line diagrams above metro doors:
 * one straight line, stations as ticks, names at an angle, the current
 * station marked "you are here". Scrolls sideways on phones and starts
 * scrolled to where you are.
 */
export function LineStrip({ line, stateOf, homeKey, compact = false }: Props) {
  const scroller = useRef<HTMLDivElement>(null);
  const current = useRef<HTMLLIElement>(null);
  useEffect(() => {
    const s = scroller.current;
    const c = current.current;
    if (s && c) s.scrollLeft = Math.max(0, c.offsetLeft - s.clientWidth / 2 + c.clientWidth / 2);
  }, []);
  const step = compact ? 44 : 64;
  const inService = line.service === 'in-service';

  return (
    <div className="relative">
      <div ref={scroller} className="min-w-0 overflow-x-auto pb-2" tabIndex={-1}>
        <ol
          className={`relative flex ${compact ? 'h-28' : 'h-44'} items-end`}
          style={{ width: line.stops.length * step + (compact ? 120 : 170), paddingLeft: 16 }}
          aria-label={`Linka ${line.id}: ${line.stops.length} stations`}
        >
          <span aria-hidden className={`absolute left-4 right-4 ${compact ? 'bottom-5 h-2' : 'bottom-8 h-3'} ${LINE_BG[line.id]} ${inService ? '' : 'opacity-40'}`} />
          {line.stops.map((stop) => {
            const state = inService ? stateOf(stop) : 'vyluka';
            const isHome = homeKey === `${stop.line}/${stop.slug}`;
            const milestone = stop.kind === 'milestone';
            const label = `${stop.stationInfo.name}${state === 'current' ? ', you are here' : state === 'done' ? ', done' : state === 'vyluka' ? ', not open yet' : ''}${isHome ? ', your home station' : ''}`;
            return (
              <li key={stop.slug} ref={state === 'current' ? current : undefined} className="relative shrink-0" style={{ width: step }}>
                <Link
                  to={stationPath(stop)}
                  aria-label={label}
                  aria-current={state === 'current' ? 'location' : undefined}
                  className="group absolute bottom-0 left-0 flex w-full flex-col items-center"
                >
                  {/* Name, angled like on the real strip maps. */}
                  <span
                    lang="cs"
                    className={`absolute origin-bottom-left -rotate-45 whitespace-nowrap leading-none ${compact ? 'text-[11px]' : 'text-sm'} ${
                      state === 'current' ? 'font-bold text-ink' : state === 'vyluka' ? 'text-ink-3' : 'font-medium text-ink-2'
                    } group-hover:text-ink group-hover:underline`}
                    style={{ left: 'calc(50% + 4px)', bottom: compact ? 42 : 64 }}
                    aria-hidden
                  >
                    {stop.stationInfo.name}
                  </span>
                  <span
                    aria-hidden
                    className={`relative z-[1] ${compact ? 'mb-3 h-6 w-6' : 'mb-5 h-9 w-9'} rounded-full border-ink ${milestone ? 'border-[5px] ring-2 ring-ink ring-offset-2 ring-offset-paper' : 'border-[3px]'} ${
                      state === 'done' ? 'bg-ink' : state === 'current' ? 'bg-line-b' : state === 'vyluka' ? 'border-dashed bg-paper' : 'bg-surface'
                    } flex items-center justify-center transition-transform group-hover:scale-110`}
                  >
                    {state === 'current' && !compact && <IconPin size={18} className="text-on-fill-dark" />}
                  </span>
                  {isHome && (
                    <span aria-hidden className="absolute -bottom-0.5 label-board whitespace-nowrap text-[10px] text-ink-2">
                      domov
                    </span>
                  )}
                  {stop.transfers.length > 0 && (
                    <span aria-hidden className={`absolute ${compact ? 'bottom-7' : 'bottom-12'} left-1/2 ml-3 flex gap-0.5`}>
                      {stop.transfers.map((t) => (
                        <LineBadge key={t} line={t} size={18} />
                      ))}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
