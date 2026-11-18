import { useEffect, useRef, useState } from 'react';
import { scoreChoice, scoreFill, scoreMatch } from '@/lib/exam/score';
import { ChoicePlayer, FillPlayer, MatchPlayer } from './players';
import { TASK_SHAPE, type ChoiceTask, type FillTask, type MatchTask } from './schema';

export type AutoTask = MatchTask | ChoiceTask | FillTask;
export const isAutoScored = (t: { kind: string }): t is AutoTask => t.kind === 'match' || t.kind === 'choice' || t.kind === 'fill';

export function Instruction({ cs, en }: { cs: string; en: string }) {
  return (
    <div className="mb-6">
      <p lang="cs" className="text-lg font-semibold">{cs}</p>
      <p className="mt-1 text-ink-2">{en}</p>
    </div>
  );
}

type Answers = Record<string, string> | (number | undefined)[] | string[];
const empty = (t: AutoTask): Answers => (t.kind === 'match' ? {} : []);

export function score(t: AutoTask, a: Answers): number {
  if (t.kind === 'match') return scoreMatch(t, a as Record<string, string>);
  if (t.kind === 'choice') return scoreChoice(t, a as (number | undefined)[]);
  return scoreFill(t, a as string[]);
}

function answered(t: AutoTask, a: Answers): number {
  if (t.kind === 'match') return Object.keys(a).length;
  return (a as unknown[]).filter((x) => x !== undefined && x !== '').length;
}

/**
 * A reading or listening task, scored by the app: answer, hand in, see what
 * was right. `exam` limits recordings to two plays; `onHandIn` gets the score.
 * `handIn` lets a mock exam's timer hand the task in.
 */
export function ScoredTask({ task, exam = false, onHandIn, handInLabel = 'Check my answers', forceHandIn, partHandIn }: {
  task: AutoTask;
  exam?: boolean;
  onHandIn?: (score: number, max: number) => void;
  handInLabel?: string;
  /** A mock exam handed the whole part in (its button, or its timer). */
  forceHandIn?: boolean;
  /** In a mock the part has one hand-in button, so the task has none. */
  partHandIn?: boolean;
}) {
  const [answers, setAnswers] = useState<Answers>(() => empty(task));
  const [done, setDone] = useState(false);
  const max = TASK_SHAPE[task.part][task.task]!.points;
  const total = task.kind === 'match' ? task.items.length : task.questions.length;
  const got = score(task, answers);

  function handIn() {
    if (done) return;
    setDone(true);
    onHandIn?.(got, max);
  }
  const handInRef = useRef(handIn);
  handInRef.current = handIn;
  useEffect(() => { if (forceHandIn) handInRef.current(); }, [forceHandIn]);

  return (
    <div>
      <Instruction cs={task.instruction} en={task.instructionEn} />
      {task.kind === 'match' && <MatchPlayer task={task} value={answers as Record<string, string>} onChange={setAnswers} done={done} exam={exam} />}
      {task.kind === 'choice' && <ChoicePlayer task={task} value={answers as (number | undefined)[]} onChange={setAnswers} done={done} exam={exam} />}
      {task.kind === 'fill' && <FillPlayer task={task} value={answers as string[]} onChange={setAnswers} done={done} exam={exam} />}
      <div className="mt-6 flex flex-wrap items-center gap-4" aria-live="polite">
        {!done ? (
          <>
            {!partHandIn && <button type="button" className="btn btn-primary" onClick={handIn}>{handInLabel}</button>}
            <span className="text-sm text-ink-2">{answered(task, answers)} of {total} answered</span>
          </>
        ) : (
          <p className="text-xl font-bold">{got} of {max} points</p>
        )}
      </div>
    </div>
  );
}
