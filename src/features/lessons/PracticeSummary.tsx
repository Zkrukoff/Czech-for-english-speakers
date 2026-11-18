import { exerciseSummary } from '@/lib/exercises/summary';
import { Link } from 'react-router-dom';
import type { ExerciseOutcome } from '@/features/exercises/ExerciseRunner';
import { IconArrowRight } from '@/components/icons';

export function PracticeSummary({ outcomes, onAgain, next, decks = [] }: { outcomes: ExerciseOutcome[]; onAgain: () => void; next: { to: string; label: string }; decks?: { id: string; title: string; titleCs: string }[] }) {
  const first = outcomes.filter((o) => o.firstTry);
  const right = first.filter((o) => o.result.accepted).length;
  const missed = first.filter((o) => !o.result.accepted);
  const slips = first.filter((o) => o.result.status === 'diacritics').length;
  return (
    <div className="rounded-md border-2 border-ink bg-surface p-6">
      <h2 className="text-xl font-semibold">Practice done</h2>
      <p className="mt-2 text-ink-2">
        You answered {right} of {first.length} correctly on the first try
        {slips > 0 && <> ({slips} with a diacritics slip)</>}.
      </p>
      {missed.length > 0 && (
        <div className="mt-4">
          <p className="text-ink-2">These will come back in your reviews until they stick:</p>
          <ul className="mt-2 space-y-1 text-sm">
            {missed.map((o) => (
              <li key={o.exercise.id} className="rounded-md bg-paper px-3 py-2">
                <span className="text-ink-3">{exerciseSummary(o.exercise).replace(/\*\*/g, '')}</span> <IconArrowRight size={16} className="inline-block align-[-3px]" /> <span lang="cs" className="font-medium">{o.result.expected}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {decks.length > 0 && (
        <p className="mt-5 text-sm text-ink-2">
          Words for this topic:{' '}
          {decks.map((d, i) => (
            <span key={d.id}>
              {i > 0 && ', '}
              <Link to="/review#packs" className="inline-flex min-h-11 items-center text-vltava underline"><span lang="cs">{d.titleCs}</span>&nbsp;· {d.title.toLowerCase()}</Link>
            </span>
          ))}
          . Add them to your reviews, a few a day.
        </p>
      )}
      <div className="mt-6 flex flex-wrap gap-3">
        <Link to={next.to} className="btn btn-primary">{next.label}</Link>
        <button type="button" onClick={onAgain} className="btn btn-secondary">Practise again</button>
      </div>
    </div>
  );
}
