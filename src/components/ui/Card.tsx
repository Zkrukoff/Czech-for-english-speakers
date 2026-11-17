import type { CSSProperties, ElementType, ReactNode } from 'react';

type Corner = 'tr' | 'tl' | 'br' | 'bl' | 'none';

const CLIP: Record<Exclude<Corner, 'none'>, string> = {
  tr: 'polygon(0 0, calc(100% - var(--clip-corner)) 0, 100% var(--clip-corner), 100% 100%, 0 100%)',
  tl: 'polygon(var(--clip-corner) 0, 100% 0, 100% 100%, 0 100%, 0 var(--clip-corner))',
  br: 'polygon(0 0, 100% 0, 100% calc(100% - var(--clip-corner)), calc(100% - var(--clip-corner)) 100%, 0 100%)',
  bl: 'polygon(0 0, 100% 0, 100% 100%, var(--clip-corner) 100%, 0 calc(100% - var(--clip-corner)))',
};

/**
 * A card with one clipped "cubist" corner (after Czech Cubist architecture).
 * clip-path would cut off a box-shadow, so the border and the offset shadow
 * are drawn with drop-shadow filters on a wrapper around the clipped shape.
 */
export function Card({
  children,
  corner = 'tr',
  tone = 'var(--surface)',
  className = '',
  as: As = 'div',
  style,
}: { children: ReactNode; corner?: Corner; tone?: string; className?: string; as?: ElementType; style?: CSSProperties }) {
  if (corner === 'none') {
    return (
      <As className={`card ${className}`} style={{ background: tone, ...style }}>
        {children}
      </As>
    );
  }
  return (
    <As className={`relative ${className}`} style={{ filter: 'drop-shadow(4px 4px 0 var(--shadow-ink))', ...style }}>
      <div style={{ clipPath: CLIP[corner], background: 'var(--ink)', padding: 'var(--border-w)' }}>
        <div className="h-full" style={{ clipPath: CLIP[corner], background: tone }}>
          {children}
        </div>
      </div>
    </As>
  );
}
