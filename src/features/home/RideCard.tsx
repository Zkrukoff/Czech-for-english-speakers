import { Link } from 'react-router-dom';
import { course } from '@/content';
import { useSettings } from '@/db/settings';
import { useProfile } from '@/db/hooks';
import { routeBetween } from '@/lib/ride';
import { usePerStop } from '@/features/ride/buildRide';
import { LineBadge } from '@/components/ui';
import { IconArrowRight, IconTram } from '@/components/icons';

/** Home: today's ride, sized to the learner's commute. */
export function RideCard() {
  const settings = useSettings();
  const profile = useProfile();
  const perStop = usePerStop();
  const from = settings.rideFrom ?? profile?.homeStation?.split('/')[1];
  const route = from && settings.rideTo ? routeBetween(course.lines, from, settings.rideTo) : null;
  return (
    <Link to="/ride" className="card card-link group flex items-center gap-4 p-5">
      <IconTram size={32} className="shrink-0" />
      <span className="min-w-0 flex-1">
        <span className="label-board block text-ink-3">Dnešní jízda · today's ride</span>
        {route && route.stops > 0 ? (
          <>
            <span lang="cs" className="block truncate font-semibold">{route.stations[0]} → {route.stations.at(-1)}</span>
            <span className="flex flex-wrap items-center gap-1 text-sm text-ink-2">
              {route.lines.map((l) => <LineBadge key={l} line={l as 'A'} size={18} />)} {route.stops} stops · ≈ {route.stops * perStop} exercises
            </span>
          </>
        ) : (
          <span className="text-ink-2">Practise for the length of your commute. Set your stations.</span>
        )}
      </span>
      <span className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-vltava group-hover:underline">
        {route && route.stops > 0 ? <span lang="cs">Jedeme</span> : 'Set up'} <IconArrowRight size={16} />
      </span>
    </Link>
  );
}
