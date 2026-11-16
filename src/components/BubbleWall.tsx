/**
 * Decorative pattern inspired by the convex aluminium "bubble" wall panels of
 * Prague's metro stations, coloured with the metro lines. Purely decorative.
 */
const FILLS = ['var(--color-metro-a)', 'var(--color-metro-b)', 'var(--color-metro-c)', 'var(--color-vltava)', 'var(--color-cream)', 'var(--color-cream)', 'none'];

/** Small deterministic pseudo-random generator, so the pattern is the same on every render. */
function rand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function BubbleWall({ cols = 7, rows = 6, seed = 7, className = '' }: { cols?: number; rows?: number; seed?: number; className?: string }) {
  const r = rand(seed);
  const size = 40;
  const cells = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const fill = FILLS[Math.floor(r() * FILLS.length)]!;
      const radius = 14 + r() * 5;
      const offset = y % 2 ? size / 2 : 0;
      cells.push(
        <g key={`${x}-${y}`} style={{ animationDelay: `${(x + y) * 40}ms` }} className="animate-rise">
          <circle cx={x * size + size / 2 + offset} cy={y * size * 0.87 + size / 2} r={radius} fill={fill} stroke={fill === 'none' ? 'var(--color-ink)' : 'none'} strokeWidth={2.5} opacity={fill === 'none' ? 0.35 : 1} />
          {fill !== 'none' && (
            <circle cx={x * size + size / 2 + offset - radius * 0.3} cy={y * size * 0.87 + size / 2 - radius * 0.3} r={radius * 0.28} fill="white" opacity={0.35} />
          )}
        </g>,
      );
    }
  }
  return (
    <svg aria-hidden viewBox={`0 0 ${cols * size + size / 2} ${rows * size * 0.87 + size * 0.2}`} className={className}>
      {cells}
    </svg>
  );
}

/** The logo mark: three overlapping metro-line circles. */
export function MetroMark({ className = 'h-7 w-7' }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 40 40" className={className}>
      <circle cx="13" cy="15" r="10" fill="var(--color-metro-a)" />
      <circle cx="27" cy="15" r="10" fill="var(--color-metro-b)" opacity="0.92" />
      <circle cx="20" cy="27" r="10" fill="var(--color-metro-c)" opacity="0.9" />
    </svg>
  );
}

/** A full-width three-colour line, as on the metro map. */
export function MetroLineStripe({ className = 'h-1.5' }: { className?: string }) {
  return (
    <div aria-hidden className={`flex w-full ${className}`}>
      <span className="flex-1 bg-metro-a" />
      <span className="flex-1 bg-metro-b" />
      <span className="flex-1 bg-metro-c" />
    </div>
  );
}
