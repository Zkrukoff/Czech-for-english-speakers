import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui';
import { RideProgress } from './RideProgress';
import type { Exercise } from '@/content/schema';
import { checkAnswer, isChoice, type CheckResult } from '@/lib/answers/check';
import { recordAttempt, type AttemptContext } from '@/db/progress';
import { useSettings } from '@/db/settings';
import { AnswerInput } from './AnswerInput';
import { ChoiceInput } from './types/ChoiceInput';
import { SpeakInput } from './types/SpeakInput';
import { BuildSentenceInput } from './types/BuildSentenceInput';
import { SelfCheckInput } from './types/SelfCheckInput';

/** Types whose input submits by itself (a choice, or a self-assessment). */
const SELF_SUBMITTING = new Set<Exercise['type']>(['caseSelect', 'chooseEnding', 'aspectChoice', 'minimalPair', 'multipleChoice', 'speak', 'selfCheck']);
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
  /** Key under which answers are logged (defaults to "ex:<id>"). */
  itemKeyOf?: (exercise: Exercise) => string;
  /** Today's ride: show progress as the stations of the route instead of dots. */
  route?: string[];
  /** Ids of items mixed in from earlier lessons (interleaving), marked as such. */
  fromBefore?: Set<string>;
}

interface QueueItem {
  exercise: Exercise;
  firstTry: boolean;
}

export function ExerciseRunner({ exercises, context, retryMissed, onAnswer, onFinish, itemKeyOf, route, fromBefore }: Props) {
  const settings = useSettings();
  const [queue, setQueue] = useState<QueueItem[]>(() => exercises.map((exercise) => ({ exercise, firstTry: true })));
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState<CheckResult | null>(null);
  const [outcomes, setOutcomes] = useState<ExerciseOutcome[]>([]);
  const continueRef = useRef<HTMLButtonElement>(null);
  // After an answer, move focus to Continue so Enter moves on (the input it came from is now disabled).
  useEffect(() => {
    if (result) requestAnimationFrame(() => continueRef.current?.focus());
  }, [result]);

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
    await recordAttempt(exercise, value, r, context, undefined, undefined, itemKeyOf?.(exercise));
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

  return (
    <div className="space-y-5">
      {route && route.length > 1 ? (
        <RideProgress route={route} done={index / queue.length} />
      ) : (
      <div className="flex items-center gap-4">
        <span className="label-board shrink-0 text-ink-3">
          {index + 1} / {queue.length}
          {!item.firstTry && <span className="ml-2 text-ink-2">· znovu</span>}
        </span>
        {/* Progress as stops on a line: passed stops filled, the current one ringed. */}
        <ol className="relative flex h-4 flex-1 items-center justify-between" aria-hidden>
          <span className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 bg-paper-3" />
          <span className="absolute left-0 top-1/2 h-1 -translate-y-1/2 bg-ink transition-[width] duration-200" style={{ width: `${(index / Math.max(1, queue.length - 1)) * 100}%` }} />
          {queue.length <= 14 && queue.map((_, i) => (
            <li
              key={i}
              className={`relative h-3 w-3 rounded-full border-2 border-ink ${i < index ? 'bg-ink' : i === index ? 'h-4 w-4 bg-line-b' : 'bg-surface'}`}
            />
          ))}
        </ol>
      </div>
      )}

      <Card key={`${exercise.id}-${index}`} corner="tr" className="block" >
        <div className="p-5 sm:p-6">
        {fromBefore?.has(exercise.id) && (
          <p className="label-board mb-2 text-ink-3"><span lang="cs">Z dřívějška</span> · from before</p>
        )}
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
                      right ? 'border-ink bg-paper-2' : chosen ? 'border-ink bg-paper-2' : 'border-rule-strong bg-surface hover:border-rule-strong'
                    }`}
                  >
                    {caseOptionLabel(o)}
                  </button>
                );
              })}
            </div>
          ) : exercise.type === 'chooseEnding' || exercise.type === 'aspectChoice' || exercise.type === 'minimalPair' ? (
            <ChoiceInput
              options={exercise.type === 'minimalPair' ? exercise.pair : exercise.options}
              chosen={result ? answer : undefined}
              correct={exercise.answers}
              onChoose={(o) => submit(o)}
              render={exercise.type === 'chooseEnding' ? (o) => <>–{o || '∅'}</> : undefined}
            />
          ) : exercise.type === 'multipleChoice' || (exercise.type === 'readReal' && exercise.options) ? (
            <ChoiceInput
              options={exercise.options!}
              chosen={result ? answer : undefined}
              correct={exercise.answers}
              onChoose={(o) => submit(o)}
              lang={exercise.type === 'multipleChoice' ? exercise.optionsLang : exercise.answerLang}
            />
          ) : exercise.type === 'selfCheck' ? (
            <SelfCheckInput reveal={exercise.reveal} disabled={!!result} onAssess={(v) => submit(v)} />
          ) : exercise.type === 'speak' ? (
            <SpeakInput cs={exercise.cs} audio={exercise.audio} disabled={!!result} onAssess={(v) => submit(v)} />
          ) : exercise.type === 'buildSentence' ? (
            <BuildSentenceInput tiles={exercise.tiles} disabled={!!result} onChange={setAnswer} />
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
      </Card>

      {result && <FeedbackPanel exercise={exercise} result={result} answer={answer} />}

      <div className="flex justify-end">
        {result ? (
          <button ref={continueRef} type="button" onClick={next} className="btn btn-primary">
            {index + 1 >= queue.length ? 'Finish' : 'Continue'}
          </button>
        ) : (
          !SELF_SUBMITTING.has(exercise.type) && !isChoice(exercise) && (
            <button type="button" onClick={() => submit()} disabled={!answer.trim()} className="btn btn-primary">
              Check
            </button>
          )
        )}
      </div>
    </div>
  );
}
