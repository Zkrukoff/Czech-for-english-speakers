import { useEffect, useRef, useState } from 'react';
import type { TimelineEvent } from '@/content/schema';
import { useReducedMotion } from '@/lib/useReducedMotion';

/** Dot colours cycle through the metro lines and the Vltava. */
const DOTS = ['bg-metro-a', 'bg-metro-b', 'bg-metro-c', 'bg-vltava'];

/**
 * A scroll-driven timeline. Events start small and faded; as each one reaches
 * the middle of the screen it grows, and its "why it matters" panel opens.
 * Events stay open once revealed. With reduced motion (or "Show all"),
 * everything is open and nothing moves. Content is always in the DOM, so
 * screen readers and search get all of it.
 */
export function Timeline({ events }: { events: TimelineEvent[] }) {
  const reduced = useReducedMotion();
  const [showAll, setShowAll] = useState(false);
  const [active, setActive] = useState(0);
  const [revealed, setRevealed] = useState(-1);
  const [progress, setProgress] = useState(0);
  const listRef = useRef<HTMLOListElement>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const still = reduced || showAll;

  useEffect(() => {
    if (still) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const vh = window.innerHeight;
      const focus = vh * 0.55;
      let best = 0;
      let bestDistance = Infinity;
      let lastRevealed = -1;
      itemRefs.current.forEach((el, i) => {
        if (!el) return;
        const r = el.getBoundingClientRect();
        if (r.top < vh * 0.72) lastRevealed = i;
        const centre = r.top + Math.min(r.height, 240) / 2;
        const d = Math.abs(centre - focus);
        if (d < bestDistance) {
          bestDistance = d;
          best = i;
        }
      });
      setActive(best);
      setRevealed((prev) => Math.max(prev, lastRevealed));
      const list = listRef.current?.getBoundingClientRect();
      if (list) setProgress(Math.min(1, Math.max(0, (focus - list.top) / list.height)));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [still]);

  return (
    <div className="not-prose my-8">
      {!reduced && (
        <div className="mb-6 flex justify-end">
          <button type="button" onClick={() => setShowAll((v) => !v)} className="btn btn-secondary">
            {showAll ? 'Reveal as I scroll' : 'Show everything'}
          </button>
        </div>
      )}
      <ol ref={listRef} className="relative" aria-label="Timeline of Czech history">
        {/* The track, and a three-colour fill that grows as you scroll. */}
        <div aria-hidden className="absolute left-[11px] top-2 bottom-2 w-1 rounded-full bg-stone-200 md:left-[7.75rem]" />
        <div
          aria-hidden
          className="absolute left-[11px] top-2 w-1 rounded-full bg-gradient-to-b from-metro-a via-metro-b to-metro-c md:left-[7.75rem]"
          style={{ height: still ? 'calc(100% - 1rem)' : `calc(${progress * 100}% - 0.5rem)` }}
        />
        {events.map((e, i) => {
          const open = still || i <= revealed;
          const isActive = !still && i === active;
          return (
            <li
              key={e.id}
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              className="relative grid grid-cols-[1.75rem_1fr] gap-x-4 pb-10 md:grid-cols-[7rem_1.75rem_1fr]"
            >
              <div
                className={`hidden pt-3 text-right font-display font-extrabold leading-tight tracking-tight transition-all duration-500 md:block ${
                  isActive ? 'text-2xl text-stone-900' : open ? 'text-xl text-stone-700' : 'text-lg text-stone-400'
                }`}
              >
                {e.year}
              </div>
              <div className="relative flex justify-center pt-4">
                <span
                  aria-hidden
                  className={`relative z-[1] block rounded-full ring-4 ring-stone-50 transition-all duration-500 ${DOTS[i % DOTS.length]} ${
                    isActive ? 'h-6 w-6 -mt-1' : open ? 'h-4 w-4' : 'h-3 w-3 opacity-50'
                  }`}
                />
              </div>
              <article
                className={`card origin-left p-5 transition-all duration-500 ease-out ${
                  isActive ? 'scale-100 border-stone-300 opacity-100 shadow-lg' : open ? 'scale-[0.97] opacity-100' : 'scale-[0.92] opacity-40'
                }`}
              >
                <div className="font-display text-sm font-bold text-stone-500 md:hidden">{e.year}</div>
                <h3 className={`font-display font-bold tracking-tight text-stone-900 transition-all duration-500 ${isActive ? 'text-2xl' : 'text-xl'}`}>
                  {e.title}
                </h3>
                {e.titleCs && <p lang="cs" className="text-stone-500">{e.titleCs}</p>}
                <p className="mt-2 text-stone-700">{e.summary}</p>
                <div className={`grid transition-[grid-template-rows,opacity] duration-700 ease-out ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                  <div className="overflow-hidden">
                    <div className="mt-4 rounded-xl bg-cream p-4 text-stone-800">
                      <p className="eyebrow text-stone-600">Why it matters</p>
                      <p className="mt-1">{e.significance}</p>
                      {e.place && (
                        <>
                          <p className="eyebrow mt-3 text-stone-600">See it in Prague</p>
                          <p className="mt-1">{e.place}</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
