import { Navigate, useParams } from 'react-router-dom';
import { course } from '@/content';
import { NotFound } from '@/components/NotFound';
import { stationPath } from '@/lib/paths';

/** Old bookmarks: /units/u01 → /line/A/petriny (and …/check). */
export function UnitRedirect({ check = false }: { check?: boolean }) {
  const { unitId = '' } = useParams();
  const stop = course.stopByUnit.get(unitId);
  if (!stop) return <NotFound what="unit" />;
  return <Navigate to={stationPath(stop) + (check ? '/check' : '')} replace />;
}
