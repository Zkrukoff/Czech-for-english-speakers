import type { WallBlock } from '@/lib/wall';
import { BLOCK, CELL, cellCentres } from './geometry';

const tone = (t: string) => `var(--tile-${t})`;
const mixInk = (t: string, pct: number) => `color-mix(in oklab, ${tone(t)} ${pct}%, var(--on-fill-dark))`;
const mixWhite = (t: string, pct: number) => `color-mix(in oklab, ${tone(t)} ${pct}%, white)`;

/**
 * One station on the wall: the anodised-panel circles (after the Line A wall
 * panels) in the station's tile tone. Done lessons are full convex/concave
 * circles; started ones are a ring; the rest are flat, waiting.
 */
export function WallBlockSvg({ block, size }: { block: WallBlock; size?: number }) {
  const r = CELL * 0.4;
  return (
    <svg viewBox={`0 0 ${BLOCK} ${BLOCK}`} width={size} height={size} aria-hidden className="block h-auto w-full">
      <rect width={BLOCK} height={BLOCK} fill={tone(block.tile)} />
      {cellCentres(block.cells.length).map(({ x, y }, i) => {
        const c = block.cells[i]!;
        const convex = i % 2 === 0;
        if (c !== 'done')
          return (
            <circle key={i} cx={x} cy={y} r={r} fill={mixWhite(block.tile, 55)} stroke={c === 'started' ? 'var(--on-fill-dark)' : 'none'} strokeWidth={2} strokeDasharray={c === 'started' ? '3 3' : undefined} />
          );
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={r} fill={mixInk(block.tile, 80)} />
            {convex ? (
              <path d={`M${x - r} ${y} a${r} ${r} 0 0 1 ${r * 2} 0 a${r} ${r * 0.7} 0 0 0 -${r * 2} 0`} fill={mixWhite(block.tile, 55)} />
            ) : (
              <path d={`M${x - r} ${y} a${r} ${r} 0 0 0 ${r * 2} 0 a${r} ${r * 0.7} 0 0 1 -${r * 2} 0`} fill={mixInk(block.tile, 62)} />
            )}
          </g>
        );
      })}
      {block.stamped && <rect x={1.5} y={1.5} width={BLOCK - 3} height={BLOCK - 3} fill="none" stroke="var(--stamp-red)" strokeWidth={3} />}
    </svg>
  );
}
