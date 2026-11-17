import { course } from '@/content';
import type { Stop } from '@/content/loader';

/** Every in-app URL that depends on the course map is built here. */
export const stationPath = (stop: Pick<Stop, 'line' | 'slug'>) => `/line/${stop.line}/${stop.slug}`;

export function unitPath(unitId: string): string {
  const stop = course.stopByUnit.get(unitId);
  return stop ? stationPath(stop) : `/units/${unitId}`;
}

export const unitCheckPath = (unitId: string) => `${unitPath(unitId)}/check`;

export const WALLET_PATH = '/wallet';
