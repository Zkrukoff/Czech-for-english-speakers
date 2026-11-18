import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { wallCounts, type WallBlock } from '@/lib/wall';
import { shareOrDownload } from '@/lib/exportImage';
import { stationPath } from '@/lib/paths';
import { course } from '@/content';
import { WallBlockSvg } from './WallBlockSvg';
import { renderWallPng } from './exportWall';

const KIND_EN = { pronunciation: 'sounds', unit: 'lesson', milestone: 'milestone' } as const;

function describe(b: WallBlock): string {
  const done = b.cells.filter((c) => c === 'done').length;
  const what = b.kind === 'unit' ? `${done} of ${b.cells.length} lessons done` : done ? `${KIND_EN[b.kind]} done` : `${KIND_EN[b.kind]} not yet`;
  return `${b.name}: ${what}${b.stamped ? ', stamped' : ''}`;
}

/** Tvoje stěna: Line A as a wall of panels that fills as you practise. */
export function StationWall({ blocks }: { blocks: WallBlock[] }) {
  const refs = useRef<(SVGSVGElement | null)[]>([]);
  const [state, setState] = useState<'idle' | 'busy' | 'downloaded' | 'shared' | 'error'>('idle');
  const { filled, total, stations } = wallCounts(blocks);

  async function share() {
    setState('busy');
    try {
      const svgs = refs.current.filter((s): s is SVGSVGElement => !!s);
      const png = await renderWallPng(blocks, svgs);
      const r = await shareOrDownload(png, 'prazak-stena.png', `Moje stěna na lince A: ${filled} z ${total}.`);
      setState(r === 'cancelled' ? 'idle' : r);
    } catch {
      setState('error');
    }
  }

  return (
    <div>
      <ul className="grid grid-cols-4 gap-3 sm:grid-cols-6 sm:gap-4 lg:grid-cols-9" aria-label="Your station wall">
        {blocks.map((b, i) => {
          const stop = course.stopsByKey.get(`A/${b.slug}`);
          const inner = (
            <>
              <span className="block border-2 border-ink" ref={(el) => { refs.current[i] = el?.querySelector('svg') ?? null; }}>
                <WallBlockSvg block={b} />
              </span>
              <span className="mt-1.5 block font-mono text-2xs uppercase leading-tight tracking-wide text-ink-2 sm:text-xs">{b.name}</span>
            </>
          );
          return (
            <li key={b.slug} title={describe(b)}>
              {stop ? <Link to={stationPath(stop)} aria-label={describe(b)} className="block hover:opacity-90">{inner}</Link> : inner}
            </li>
          );
        })}
      </ul>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-ink-2">
          <span className="font-display text-2xl font-extrabold tabular-nums text-ink">{filled} / {total}</span> circles ·{' '}
          {stations === 1 ? '1 station' : `${stations} stations`} stamped
        </p>
        <button type="button" onClick={share} disabled={state === 'busy'} className="btn btn-secondary">
          {state === 'busy' ? 'Drawing…' : 'Share as image'}
        </button>
      </div>
      <p className="mt-2 min-h-5 text-sm text-ink-3" role="status">
        {state === 'downloaded' && 'Saved as prazak-stena.png.'}
        {state === 'shared' && <span lang="cs">Odesláno.</span>}
        {state === 'error' && 'That didn’t draw. Try again?'}
      </p>
    </div>
  );
}
