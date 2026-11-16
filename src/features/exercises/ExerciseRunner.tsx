import { useState } from 'react';
import type { Exercise } from '@/content/schema';
import { checkAnswer, type CheckResult } from '@/lib/answers/check';
import { recordAttempt, type AttemptContext } from '@/db/progress';
import { useSettings } from '@/db/settings';
import { AnswerInput } from './AnswerInput';
import { FeedbackPanel, answerIsCzech } from './FeedbackPanel';
import { ExercisePrompt, caseOptionLabel } from './ExercisePrompt';

export interface ExerciseOutcome {
  exercise: Exercise;
  answer: string;
  result: CheckResult;
  /** False for the second go at an exercise missed earlier in the session. */
  firstTry: boolean;
}

interface Props {
  exercises: Exercise[];
  context: AttemptContext;
  /** Put missed exercises back at the end of the session once (lessons), or not (unit checks). */
  retryMissed: boolean;
  /** Called after each answer is checked (used by spaced repetition). */
  onAnswer?: (outcome: ExerciseOutcome) => void | Promise<void>;
  onFinish: (outcomes: ExerciseOutcome[]) => void;
}

interface QueueItem {
  exercise: Exercise;
  firstTry: boolean;
}

export function ExerciseRunner({ exercises, context, retryMissed, onAnswer, onFinish }: Props) {
  const settings = useSettings();
  const [queue, setQueue] = useState<QueueItem[]>(() => exercises.map((exercise) => ({ exercise, firstTry: true })));
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState<CheckResult | null>(null);
  const [outcomes, setOutcomes] = useState<ExerciseOutcome[]>([]);

  const item = queue[index];
  if (!item) return null;
  const { exercise } = item;

  async function submit(value = answer) {
    if (result) return next();
    if (!value.trim()) return;
    const r = checkAnswer(exercise, value, { strictDiacritics: settings.strictDiacritics });
    setAnswer(value);
    setResult(r);
    const outcome: ExerciseOutcome = { exercise, answer: value, result: r, firstTry: item!.firstTry };
    setOutcomes((o) => [...o, outcome]);
    if (retryMissed && item!.firstTry && !r.accepted) {
      setQueue((q) => [...q, { exercise, firstTry: false }]);
    }
    await recordAttempt(exercise, value, r, context);
    await onAnswer?.(outcome);
  }

  function next() {
    if (index + 1 >= queue.length) {
      onFinish(outcomes);
      return;
    }
    setIndex(index + 1);
    setAnswer('');
    setResult(null);
  }

  const remaining = queue.length - index;
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between text-sm text-stone-500">
        <span>
          {index + 1} of {queue.length}
          {!item.firstTry && <span className="ml-2 rounded-full bg-stone-200 px-2 py-0.5 text-xs text-stone-700">another try</span>}
        </span>
        <div className="h-1.5 w-40 overflow-hidden rounded-full bg-stone-200" aria-hidden>
          <div className="h-full bg-stone-700 transition-all" style={{ width: `${((queue.length - remaining) / queue.length) * 100}%` }} />
        </div>
      </div>

      <div key={`${exercise.id}-${index}`} className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
        <ExercisePrompt exercise={exercise} />
        <div className="mt-5">
          {exercise.type === 'caseSelect' ? (
            <div className="grid gap-2 sm:grid-cols-2">
              {exercise.options.map((o) => {
                const chosen = result && answer === o;
                const right = result && exercise.answers.includes(o);
                return (
                  <button
                    key={o}
                    type="button"
                    disabled={!!result}
                    onClick={() => submit(o)}
                    className={`rounded-lg border px-4 py-3 text-left capitalize ${
                      right ? 'border-emerald-400 bg-emerald-50' : chosen ? 'border-rose-400 bg-rose-50' : 'border-stone-300 bg-white hover:border-stone-500'
                    }`}
                  >
                    {caseOptionLabel(o)}
                  </button>
                );
              })}
            </div>
          ) : (
            <AnswerInput
              value={answer}
              onChange={setAnswer}
              onSubmit={() => submit()}
              disabled={!!result}
              lang={answerIsCzech(exercise) ? 'cs' : 'en'}
              short={exercise.type === 'fillEnding' || exercise.type === 'conjugate'}
              placeholder={exercise.type === 'fillEnding' ? 'ending, or the whole word' : exercise.type === 'conjugate' ? 'verb form' : 'Type your answer'}
            />
          )}
        </div>
      </div>

      {result && <FeedbackPanel exercise={exercise} result={result} answer={answer} />}

      <div className="flex justify-end">
        {result ? (
          <button autoFocus type="button" onClick={next} className="rounded-lg bg-stone-900 px-5 py-2.5 font-medium text-white hover:bg-stone-700">
            {index + 1 >= queue.length ? 'Finish' : 'Continue'}
          </button>
        ) : (
          exercise.type !== 'caseSelect' && (
            <button type="button" onClick={() => submit()} disabled={!answer.trim()} className="rounded-lg bg-stone-900 px-5 py-2.5 font-medium text-white hover:bg-stone-700 disabled:opacity-40">
              Check
            </button>
          )
        )}
      </div>
    </div>
  );
}
