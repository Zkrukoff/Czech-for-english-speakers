import { Link } from 'react-router-dom';
import { IconArrowRight } from '@/components/icons';
import { wallCounts } from '@/lib/wall';
import { useWall } from './useWall';
import { WallBlockSvg } from './WallBlockSvg';

/** Home: a thin strip of the wall, linking to the full one in the wallet. */
export function WallPreview() {
  const blocks = useWall();
  if (!blocks?.length) return null;
  const { filled, total } = wallCounts(blocks);
  return (
    <Link to="/wallet" className="card card-link group block p-4">
      <span className="flex items-center justify-between gap-3">
        <span className="label-board text-ink-3" lang="cs">Tvoje stěna</span>
        <span className="text-sm text-ink-2"><span className="font-semibold tabular-nums text-ink">{filled} / {total}</span> circles</span>
      </span>
      <span className="mt-3 grid gap-1" style={{ gridTemplateColumns: `repeat(${blocks.length}, minmax(0, 1fr))` }} aria-hidden>
        {blocks.map((b) => <WallBlockSvg key={b.slug} block={b} />)}
      </span>
      <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold group-hover:underline">Your wall <IconArrowRight size={16} /></span>
    </Link>
  );
}
