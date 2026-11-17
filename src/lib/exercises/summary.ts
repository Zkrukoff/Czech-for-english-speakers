import type { Exercise } from '@/content/schema';
import { lensPlain } from '@/lib/lens';

/** A one-line description of an exercise, for summaries and lists. */
export function exerciseSummary(ex: Exercise): string {
  switch (ex.type) {
    case 'listenType':
    case 'speak':
      return lensPlain(ex.cs);
    case 'minimalPair':
      return `${ex.pair[0]} / ${ex.pair[1]}`;
    default:
      return lensPlain(ex.prompt);
  }
}
