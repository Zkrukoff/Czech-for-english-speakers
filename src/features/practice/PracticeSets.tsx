import { useState } from 'react';
import type { PracticeSet } from '@/content/schema';
import { ExerciseRunner, type ExerciseOutcome } from '@/features/exercises/ExerciseRunner';
import { useLessonAnswerHandler } from '@/features/lessons/useLessonAnswerHandler';
import { IconArrowLeft } from '@/components/icons';

/** A list of practice sets; each runs in the exercise runner and feeds reviews and progress. */
export function PracticeSets({ sets, context }: { sets: PracticeSet[]; context: 'alphabet' | 'guide' }) {
  const [active, setActive] = useState<{ set: PracticeSet; run: number } | null>(null);
  const [done, setDone] = useState<{ set: PracticeSet; outcomes: ExerciseOutcome[] } | null>(null);
  const onAnswer = useLessonAnswerHandler();

  if (active) {
    return (
      <>
        <button type="button" onClick={() => setActive(null)} className="mb-4 text-sm text-vltava hover:underline"><IconArrowLeft size={16} className="inline-block align-[-3px]" /> All practice sets</button>
        <h2 className="mb-1 text-xl font-semibold">{active.set.title}</h2>
        <p className="mb-5 text-ink-2">{active.set.description}</p>
        <ExerciseRunner
          key={active.run}
          exercises={active.set.exercises}
          context={context}
          retryMissed
          onAnswer={onAnswer}
          onFinish={(outcomes) => {
            setDone({ set: active.set, outcomes });
            setActive(null);
          }}
        />
      </>
    );
  }

  return (
    <>
      {done && (
        <div role="status" className="mb-6 rounded-md border-2 border-ink bg-surface p-5">
          <p className="font-semibold">{done.set.title}: done</p>
          <p className="mt-1 text-ink-2">
            {done.outcomes.filter((o) => o.firstTry && o.result.accepted).length} of {done.outcomes.filter((o) => o.firstTry).length} right on the first try. Anything you missed will come back in your reviews.
          </p>
        </div>
      )}
      <ul className="grid gap-3 sm:grid-cols-2">
        {sets.map((s) => (
          <li key={s.id} className="flex flex-col rounded-md border-2 border-ink bg-surface p-5">
            <h2 className="font-semibold">{s.title}</h2>
            <p className="mt-1 flex-1 text-sm text-ink-2">{s.description}</p>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-ink-3">{s.exercises.length} questions</span>
              <button type="button" onClick={() => { setDone(null); setActive({ set: s, run: Date.now() }); }} className="btn btn-primary">
                Start
              </button>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
