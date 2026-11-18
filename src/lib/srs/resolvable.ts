import { course } from '@/content';
import { exerciseForCard } from './reviewItems';

const cache = new Map<string, boolean>();

/** Whether a review card can be turned into an exercise with the current content. Own words always can. */
export function isResolvable(itemKey: string): boolean {
  if (itemKey.startsWith('own:')) return true;
  let hit = cache.get(itemKey);
  if (hit === undefined) {
    hit = exerciseForCard(itemKey, course) !== null;
    cache.set(itemKey, hit);
  }
  return hit;
}
