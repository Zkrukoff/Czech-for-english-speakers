import { useParams } from 'react-router-dom';
import { course } from '@/content';
import type { Unit } from '@/content/loader';

/** The unit for the current route: /line/:line/:station(/check), or the old /units/:unitId. */
export function useRouteUnit(): Unit | undefined {
  const { unitId, line, station } = useParams();
  if (unitId) return course.unitsById.get(unitId);
  const stop = course.stopsByKey.get(`${line}/${station}`);
  return stop?.kind === 'unit' ? course.unitsById.get(stop.unit) : undefined;
}
