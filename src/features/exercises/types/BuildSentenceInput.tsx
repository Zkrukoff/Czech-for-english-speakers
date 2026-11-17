import { useState } from 'react';
import { lensPlain } from '@/lib/lens';

interface Props {
  tiles: string[];
  disabled: boolean;
  onChange: (sentence: string) => void;
}

/** Tap word tiles to build a sentence; tap a placed word to take it back. */
export function BuildSentenceInput({ tiles, disabled, onChange }: Props) {
  // Shuffle once per exercise, deterministically, so the order isn't the answer.
  const [pool] = useState(() => tiles.map((t, i) => ({ t: lensPlain(t), i })).sort((a, b) => ((a.i * 7919) % 13) - ((b.i * 7919) % 13)));
  const [placed, setPlaced] = useState<number[]>([]);
  const update = (next: number[]) => {
    setPlaced(next);
    onChange(next.map((i) => pool.find((p) => p.i === i)!.t).join(' '));
  };
  return (
    <div className="space-y-3">
      <div className="flex min-h-14 flex-wrap items-center gap-2 rounded-md border-2 border-dashed border-rule-strong bg-surface p-2" aria-label="Your sentence" lang="cs">
        {placed.length === 0 && <span className="px-2 text-ink-3">Tap the words in order</span>}
        {placed.map((i) => (
          <button key={i} type="button" disabled={disabled} onClick={() => update(placed.filter((x) => x !== i))} className="chip text-base">
            {pool.find((p) => p.i === i)!.t}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2" lang="cs">
        {pool.map(({ t, i }) => (
          <button
            key={i}
            type="button"
            disabled={disabled || placed.includes(i)}
            onClick={() => update([...placed, i])}
            className="min-h-11 rounded-md border-2 border-ink bg-paper px-3 text-lg shadow-offset-sm disabled:border-rule disabled:text-ink-3 disabled:shadow-none"
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}
