/**
 * Progress on Today's ride: the stations of the learner's route, the current
 * one ringed, and "Příští stanice" (next station) like the board in the train.
 */
export function RideProgress({ route, done }: { route: string[]; done: number }) {
  const stops = route.length - 1;
  const at = Math.min(stops, Math.floor(done * stops + 1e-9));
  const next = route[Math.min(stops, at + 1)]!;
  return (
    <div>
      <p className="label-board flex flex-wrap gap-x-2 text-ink-3">
        <span lang="cs">Příští stanice</span>
        <span lang="cs" className="text-ink">{at >= stops ? `${route[stops]} (konečná)` : next}</span>
        <span>· stop {Math.min(at + 1, stops)} of {stops}</span>
      </p>
      <ol className="relative mt-2 flex h-4 items-center justify-between" aria-hidden>
        <span className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 bg-paper-3" />
        <span className="absolute left-0 top-1/2 h-1 -translate-y-1/2 bg-line-a transition-[width] duration-200" style={{ width: `${(at / stops) * 100}%` }} />
        {stops <= 24 &&
          route.map((name, i) => (
            <li key={`${name}-${i}`} title={name} className={`relative h-3 w-3 rounded-full border-2 border-ink ${i < at ? 'bg-ink' : i === at ? 'h-4 w-4 bg-line-b' : 'bg-surface'}`} />
          ))}
      </ol>
    </div>
  );
}
