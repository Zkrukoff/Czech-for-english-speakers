/**
 * Signature pattern: a grid of alternately convex and concave circles in one
 * flat colour, after the anodised aluminium wall panels of the Line A metro
 * stations. Convex circles get a lighter cap, concave ones a darker bowl;
 * no gradients. Decorative only.
 */
export function TileGrid({
  tone = 'var(--tile-09)',
  cols = 6,
  rows = 3,
  size = 32,
  className = '',
}: { tone?: string; cols?: number; rows?: number; size?: number; className?: string }) {
  const r = size * 0.38;
  const cells = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const cx = x * size + size / 2;
      const cy = y * size + size / 2;
      const convex = (x + y) % 2 === 0;
      cells.push(
        <g key={`${x}-${y}`}>
          <circle cx={cx} cy={cy} r={r} fill={`color-mix(in oklab, ${tone} 80%, var(--ink))`} />
          {convex ? (
            <path d={`M${cx - r} ${cy} a${r} ${r} 0 0 1 ${r * 2} 0 a${r} ${r * 0.7} 0 0 0 -${r * 2} 0`} fill={`color-mix(in oklab, ${tone} 55%, white)`} />
          ) : (
            <path d={`M${cx - r} ${cy} a${r} ${r} 0 0 0 ${r * 2} 0 a${r} ${r * 0.7} 0 0 1 -${r * 2} 0`} fill={`color-mix(in oklab, ${tone} 62%, var(--ink))`} />
          )}
        </g>,
      );
    }
  }
  return (
    <svg aria-hidden viewBox={`0 0 ${cols * size} ${rows * size}`} className={className} style={{ background: tone }}>
      {cells}
    </svg>
  );
}
