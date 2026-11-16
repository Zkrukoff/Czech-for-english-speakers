import { Link } from 'react-router-dom';
import type { ExerciseOutcome } from '@/features/exercises/ExerciseRunner';

export function PracticeSummary({ outcomes, onAgain, next }: { outcomes: ExerciseOutcome[]; onAgain: () => void; next: { to: string; label: string } }) {
  const first = outcomes.filter((o) => o.firstTry);
  const right = first.filter((o) => o.result.accepted).length;
  const missed = first.filter((o) => !o.result.accepted);
  const slips = first.filter((o) => o.result.status === 'diacritics').length;
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-6">
      <h2 className="text-xl font-semibold">Practice done</h2>
      <p className="mt-2 text-stone-700">
        You answered {right} of {first.length} correctly on the first try
        {slips > 0 && <> ({slips} with a diacritics slip)</>}.
      </p>
      {missed.length > 0 && (
        <div className="mt-4">
          <p className="text-stone-700">These will come back in your reviews until they stick:</p>
          <ul className="mt-2 space-y-1 text-sm">
            {missed.map((o) => (
              <li key={o.exercise.id} className="rounded-md bg-stone-50 px-3 py-2">
                <span className="text-stone-500">{o.exercise.prompt.replace(/\*\*/g, '')}</span> → <span lang="cs" className="font-medium">{o.result.expected}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="mt-6 flex flex-wrap gap-3">
        <Link to={next.to} className="btn btn-primary">{next.label}</Link>
        <button type="button" onClick={onAgain} className="btn btn-secondary">Practise again</button>
      </div>
    </div>
  );
}
