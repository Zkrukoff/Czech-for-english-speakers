export type LineId = 'A' | 'B' | 'C';

const FILL: Record<LineId, string> = { A: 'var(--line-a)', B: 'var(--line-b)', C: 'var(--line-c)' };
const ON: Record<LineId, string> = { A: 'var(--on-fill-light)', B: 'var(--on-fill-dark)', C: 'var(--on-fill-light)' };

/**
 * Circular line badge, after the 1970s metro wayfinding. The letter is always
 * large and bold, which keeps light-on-green and light-on-red legible (they
 * pass only as large text). Below 28px the badge switches to a coloured ring
 * with an ink letter.
 */
export function LineBadge({ line, size = 40, label }: { line: LineId; size?: number; label?: string }) {
  const small = size < 28;
  return (
    <span
      role="img"
      aria-label={label ?? `Linka ${line}`}
      className="inline-flex shrink-0 items-center justify-center rounded-full font-display font-extrabold leading-none"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.56,
        background: small ? 'var(--surface)' : FILL[line],
        color: small ? 'var(--ink)' : ON[line],
        boxShadow: small ? `inset 0 0 0 ${Math.max(3, size * 0.16)}px ${FILL[line]}` : `0 0 0 2px var(--ink), var(--shadow-offset-sm)`,
      }}
    >
      {line}
    </span>
  );
}
