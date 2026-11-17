import { useReducedMotion } from '@/lib/useReducedMotion';

/**
 * The ink stamp from a ticket validator. Used for finished units, missions and
 * correct answers instead of checkmarks or confetti. Punches in once on mount
 * (≤250ms); still under reduced motion.
 */
export function Stamp({
  top = 'PRAŽÁK',
  main,
  bottom,
  colour = 'var(--plate-red)',
  size = 120,
  animate = true,
  className = '',
}: { top?: string; main: string; bottom?: string; colour?: string; size?: number; animate?: boolean; className?: string }) {
  const reduced = useReducedMotion();
  const id = `arc-${Math.round(size)}-${main.length}`;
  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      role="img"
      aria-label={[top, main, bottom].filter(Boolean).join(', ')}
      className={`${animate && !reduced ? 'animate-punch' : ''} ${className}`}
      style={{ color: colour, transform: 'rotate(-8deg)', mixBlendMode: 'multiply' }}
    >
      <defs>
        <path id={`${id}-t`} d="M20 60a40 40 0 0 1 80 0" />
        <path id={`${id}-b`} d="M18 60a42 42 0 0 0 84 0" />
        {/* Uneven ink: a speckle mask so the stamp looks pressed, not printed. */}
        <filter id={`${id}-ink`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" />
          <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.2 1.6" />
          <feComposite in="SourceGraphic" operator="in" />
        </filter>
      </defs>
      <g fill="none" stroke="currentColor" filter={`url(#${id}-ink)`}>
        <circle cx="60" cy="60" r="54" strokeWidth="4" />
        <circle cx="60" cy="60" r="47" strokeWidth="1.5" />
        <g fill="currentColor" stroke="none" fontFamily="var(--font-mono)" fontWeight="700">
          <text fontSize="11" letterSpacing="2.5" textAnchor="middle">
            <textPath href={`#${id}-t`} startOffset="50%">{top}</textPath>
          </text>
          {bottom && (
            <text fontSize="10" letterSpacing="2" textAnchor="middle">
              <textPath href={`#${id}-b`} startOffset="50%">{bottom}</textPath>
            </text>
          )}
          <text x="60" y="67" fontSize={main.length > 8 ? 13 : 18} textAnchor="middle" letterSpacing="1">{main}</text>
        </g>
      </g>
    </svg>
  );
}
