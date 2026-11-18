import { Link } from 'react-router-dom';
import { course } from '@/content';
import { idiomOfWeek, isoWeek } from '@/lib/idioms';
import { IdiomPlate } from './IdiomPlate';

/** Home: this week's idiom on its plate, with the meaning underneath. */
export function IdiomCard() {
  const now = new Date();
  const idiom = idiomOfWeek(course.idioms, now);
  if (!idiom) return null;
  return (
    <Link to="/idioms" className="group block">
      <IdiomPlate idiom={idiom} week={isoWeek(now)} />
      <span className="mt-3 block text-ink-2">{idiom.meaning}.</span>
      <span className="mt-1 inline-block text-sm font-semibold text-ink group-hover:underline">Example, source, share</span>
    </Link>
  );
}
