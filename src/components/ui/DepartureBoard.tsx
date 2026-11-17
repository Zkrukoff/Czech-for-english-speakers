import { useEffect, useState } from 'react';
import { useReducedMotion } from '@/lib/useReducedMotion';

const FLIP_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ0123456789';

/**
 * Text set like a split-flap departure board. On mount the characters flip
 * through a few random letters to the real text, all within 250ms. Static
 * under reduced motion. The real text is always in the accessible name.
 */
export function DepartureBoard({ text, className = '' }: { text: string; className?: string }) {
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(reduced ? text : text.replace(/\S/g, ' '));
  useEffect(() => {
    if (reduced) {
      setShown(text);
      return;
    }
    const frames = 5;
    let f = 0;
    const id = setInterval(() => {
      f++;
      setShown(
        [...text]
          .map((ch, i) => (ch === ' ' || f >= frames || i / text.length < f / frames ? ch : FLIP_CHARS[Math.floor(Math.random() * FLIP_CHARS.length)]))
          .join(''),
      );
      if (f >= frames) clearInterval(id);
    }, 45);
    return () => clearInterval(id);
  }, [text, reduced]);
  return (
    <span className={`board inline-flex rounded-sm px-2 py-1 font-mono font-semibold uppercase ${className}`} style={{ letterSpacing: '0.08em', color: 'var(--line-b)' }} aria-label={text}>
      <span aria-hidden className="whitespace-pre-wrap break-words">
        {shown}
      </span>
    </span>
  );
}
