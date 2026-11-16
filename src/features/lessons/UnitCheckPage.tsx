import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { course, type Unit } from '@/content';
import { PageHeader } from '@/components/PageHeader';
import { NotFound } from '@/components/NotFound';
import { ExerciseRunner } from '@/features/exercises/ExerciseRunner';
import { saveGoalScores, scoreGoals, type GoalScore } from '@/db/progress';
import { useLessonAnswerHandler } from './useLessonAnswerHandler';

export function UnitCheckPage() {
  const { unitId = '' } = useParams();
  const unit = course.unitsById.get(unitId);
  if (!unit) return <NotFound what="unit" />;
  return <UnitCheck key={unit.id} unit={unit} />;
}

type Phase = { kind: 'intro' } | { kind: 'running'; run: number } | { kind: 'done'; scores: GoalScore[]; run: number };

function UnitCheck({ unit }: { unit: Unit }) {
  const [phase, setPhase] = useState<Phase>({ kind: 'intro' });
  const onAnswer = useLessonAnswerHandler();
  const goalText = (id: string) => unit.canDo.find((g) => g.id === id)?.text ?? id;

  return (
    <>
      <Link to={`/units/${unit.id}`} className="text-sm text-sky-700 hover:underline">← Unit {unit.number}: {unit.title}</Link>
      <PageHeader title="What can you do now?" subtitle="This check tests each of the unit's goals. No time limit, and no hints from earlier answers: it's to show you where you are." />

      {phase.kind === 'intro' && (
        <div className="rounded-xl border border-stone-200 bg-white p-6">
          <p className="font-medium">You'll be checked on:</p>
          <ul className="mt-2 space-y-1">
            {unit.canDo.map((g) => (
              <li key={g.id} className="flex gap-2 text-stone-700"><span aria-hidden className="text-stone-400">○</span>{g.text}</li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-stone-600">
            {unit.check.exercises.length} questions. A goal counts as done when you get at least {Math.round(unit.check.passRatio * 100)}% of its questions right.
          </p>
          <button type="button" onClick={() => setPhase({ kind: 'running', run: 0 })} className="mt-5 rounded-lg bg-stone-900 px-5 py-2.5 font-medium text-white hover:bg-stone-700">
            Start
          </button>
        </div>
      )}

      {phase.kind === 'running' && (
        <ExerciseRunner
          key={phase.run}
          exercises={unit.check.exercises}
          context="unitCheck"
          retryMissed={false}
          onAnswer={onAnswer}
          onFinish={async (outcomes) => {
            const scores = scoreGoals(
              outcomes.map((o) => ({ goalId: o.exercise.goalId!, correct: o.result.accepted })),
              unit.check.passRatio,
            );
            await saveGoalScores(unit.id, scores);
            setPhase({ kind: 'done', scores, run: phase.run });
          }}
        />
      )}

      {phase.kind === 'done' && (
        <div className="rounded-xl border border-stone-200 bg-white p-6">
          <h2 className="text-xl font-semibold">Results</h2>
          <ul className="mt-4 space-y-3">
            {phase.scores.map((s) => (
              <li key={s.goalId} className="flex items-start gap-3">
                <span aria-hidden className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm ${s.passed ? 'bg-emerald-600 text-white' : 'bg-stone-200 text-stone-600'}`}>
                  {s.passed ? '✓' : '·'}
                </span>
                <span>
                  <span className="block">{goalText(s.goalId)}</span>
                  <span className="text-sm text-stone-500">
                    {s.correct} of {s.total} right{s.passed ? '' : ': worth another look at the lessons for this goal'}
                  </span>
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/progress" className="rounded-lg bg-stone-900 px-5 py-2.5 font-medium text-white hover:bg-stone-700">See your progress</Link>
            <button type="button" onClick={() => setPhase({ kind: 'running', run: phase.run + 1 })} className="rounded-lg border border-stone-300 px-5 py-2.5 font-medium hover:bg-stone-100">
              Take the check again
            </button>
          </div>
        </div>
      )}
    </>
  );
}
