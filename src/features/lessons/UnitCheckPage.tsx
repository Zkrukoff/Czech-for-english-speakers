import { useRouteUnit } from './useRouteUnit';
import { unitPath, WALLET_PATH } from '@/lib/paths';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Unit } from '@/content';
import { PageHeader } from '@/components/PageHeader';
import { NotFound } from '@/components/NotFound';
import { ExerciseRunner } from '@/features/exercises/ExerciseRunner';
import { saveGoalScores, scoreGoals, type GoalScore } from '@/db/progress';
import { stampUnitIfComplete } from '@/db/wallet';
import { useLessonAnswerHandler } from './useLessonAnswerHandler';
import { IconArrowLeft, IconDone, IconOpen } from '@/components/icons';

export function UnitCheckPage() {
  const unit = useRouteUnit();
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
      <Link to={unitPath(unit.id)} className="text-sm text-vltava hover:underline"><IconArrowLeft size={16} className="inline-block align-[-3px]" /> Unit {unit.number}: {unit.title}</Link>
      <PageHeader title="What can you do now?" subtitle="This check tests each of the unit's goals. No time limit, and no hints from earlier answers: it's to show you where you are." />

      {phase.kind === 'intro' && (
        <div className="rounded-xl border border-rule bg-surface p-6">
          <p className="font-medium">You'll be checked on:</p>
          <ul className="mt-2 space-y-1">
            {unit.canDo.map((g) => (
              <li key={g.id} className="flex gap-2 text-ink-2"><IconOpen size={18} className="mt-0.5 shrink-0 text-ink-3" />{g.text}</li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-ink-2">
            {unit.check.exercises.length} questions. A goal counts as done when you get at least {Math.round(unit.check.passRatio * 100)}% of its questions right.
          </p>
          <button type="button" onClick={() => setPhase({ kind: 'running', run: 0 })} className="mt-5 btn btn-primary">
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
            await stampUnitIfComplete(unit.id, unit.canDo.map((g) => g.id));
            setPhase({ kind: 'done', scores, run: phase.run });
          }}
        />
      )}

      {phase.kind === 'done' && (
        <div className="rounded-xl border border-rule bg-surface p-6">
          <h2 className="text-xl font-semibold">Results</h2>
          <ul className="mt-4 space-y-3">
            {phase.scores.map((s) => (
              <li key={s.goalId} className="flex items-start gap-3">
                <span aria-hidden className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm ${s.passed ? 'bg-ink text-on-fill-light' : 'bg-paper-3 text-ink-2'}`}>
                  {s.passed ? <IconDone size={18} /> : <IconOpen size={18} />}
                </span>
                <span>
                  <span className="block">{goalText(s.goalId)}</span>
                  <span className="text-sm text-ink-3">
                    {s.correct} of {s.total} right{s.passed ? '' : ': worth another look at the lessons for this goal'}
                  </span>
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to={WALLET_PATH} className="btn btn-primary">See your ticket wallet</Link>
            <button type="button" onClick={() => setPhase({ kind: 'running', run: phase.run + 1 })} className="btn btn-secondary">
              Take the check again
            </button>
          </div>
        </div>
      )}
    </>
  );
}
