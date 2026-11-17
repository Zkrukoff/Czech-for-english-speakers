import { WALLET_PATH } from '@/lib/paths';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { course } from '@/content';
import type { Exercise } from '@/content/schema';
import { PageHeader } from '@/components/PageHeader';
import { ExerciseRunner, type ExerciseOutcome } from '@/features/exercises/ExerciseRunner';
import { db } from '@/db/db';
import { dueCards, scheduleAnswer } from '@/db/srs';
import { useDueSummary } from '@/db/useDue';
import { exerciseForCard } from '@/lib/srs/reviewItems';
import { relativeTime } from '@/lib/time';

const SESSION_SIZE = 20;

interface SessionItem {
  itemKey: string;
  exercise: Exercise;
}

type Phase =
  | { kind: 'idle' }
  | { kind: 'running'; items: SessionItem[]; run: number }
  | { kind: 'done'; outcomes: ExerciseOutcome[]; run: number };

/** Load the cards due now, dropping any whose lesson content no longer exists. */
async function buildSession(): Promise<SessionItem[]> {
  const cards = await dueCards(Date.now());
  const items: SessionItem[] = [];
  for (const card of cards) {
    const exercise = exerciseForCard(card.itemKey, course, card.reps);
    if (!exercise) {
      // Pattern cards are kept: their exercises may come back once content is annotated.
      if (!card.itemKey.startsWith('pattern:') && !card.itemKey.startsWith('fn:')) await db.cards.delete(card.itemKey);
      continue;
    }
    // One exercise once per session, even if it is due both as itself and as a pattern.
    if (items.some((i) => i.exercise === exercise)) continue;
    items.push({ itemKey: card.itemKey, exercise });
    if (items.length >= SESSION_SIZE) break;
  }
  return items;
}

export function ReviewPage() {
  const due = useDueSummary();
  const [phase, setPhase] = useState<Phase>({ kind: 'idle' });

  async function start(run = 0) {
    const items = await buildSession();
    setPhase(items.length ? { kind: 'running', items, run } : { kind: 'idle' });
  }

  if (phase.kind === 'running') {
    const keyOf = new Map(phase.items.map((i) => [i.exercise, i.itemKey]));
    return (
      <>
        <PageHeader title="Review" subtitle="Items come back when you're about to forget them, based on how you answered last time." />
        <ExerciseRunner
          key={phase.run}
          exercises={phase.items.map((i) => i.exercise)}
          context="review"
          retryMissed
          itemKeyOf={(ex) => keyOf.get(ex) ?? `ex:${ex.id}`}
          onAnswer={async (o) => {
            if (!o.firstTry) return;
            const key = keyOf.get(o.exercise);
            if (key) await scheduleAnswer(key, o.exercise.skills, o.result.status);
          }}
          onFinish={(outcomes) => setPhase({ kind: 'done', outcomes, run: phase.run })}
        />
      </>
    );
  }

  if (phase.kind === 'done') {
    const first = phase.outcomes.filter((o) => o.firstTry);
    const right = first.filter((o) => o.result.accepted).length;
    return (
      <>
        <PageHeader title="Review" />
        <div className="rounded-xl border border-rule bg-surface p-6">
          <h2 className="text-xl font-semibold">Review done</h2>
          <p className="mt-2 text-ink-2">
            You remembered {right} of {first.length}. Items you missed will come back in about 10 minutes; the ones you knew will wait longer this time.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {due && due.dueNow > 0 ? (
              <button type="button" onClick={() => start(phase.run + 1)} className="btn btn-primary">
                Continue ({due.dueNow} more due)
              </button>
            ) : (
              <Link to="/" className="btn btn-primary">Back to lessons</Link>
            )}
            <Link to={WALLET_PATH} className="btn btn-secondary">See your ticket wallet</Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Review" subtitle="Items come back when you're about to forget them, based on how you answered last time." />
      {!due ? null : due.total === 0 ? (
        <div className="rounded-xl border border-rule bg-surface p-6 text-ink-2">
          <p>Nothing to review yet. Words and exercises are added here as you work through lessons.</p>
          <Link to="/" className="mt-4 inline-block text-vltava underline">Go to the lessons</Link>
        </div>
      ) : due.dueNow === 0 ? (
        <div className="rounded-xl border border-rule bg-surface p-6 text-ink-2">
          <p className="font-medium text-ink">Nothing is due right now.</p>
          {due.nextDue && <p className="mt-1">The next item is due {relativeTime(due.nextDue)}.</p>}
          <p className="mt-1 text-sm text-ink-3">{due.dueThisWeek} due in the next 7 days · {due.total} items in total</p>
        </div>
      ) : (
        <div className="rounded-xl border border-rule bg-surface p-6">
          <p className="text-lg">
            <span className="font-semibold">{due.dueNow}</span> item{due.dueNow === 1 ? '' : 's'} ready for review.
          </p>
          <p className="mt-1 text-sm text-ink-2">
            Sessions are up to {SESSION_SIZE} items. Stop whenever you like: anything you don't get to just waits.
          </p>
          <button type="button" onClick={() => start()} className="mt-5 btn btn-primary">
            Start review
          </button>
        </div>
      )}
      <details className="mt-8 text-sm text-ink-2">
        <summary className="cursor-pointer font-medium text-ink">How reviews are scheduled</summary>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Every exercise you answer in a lesson or unit check, and every word from lessons you've practised, becomes a review item.</li>
          <li>Wrong answers come back after about 10 minutes. Right answers come back after a few days, then after longer and longer gaps.</li>
          <li>An answer accepted with a diacritics slip comes back a little sooner than a perfect one.</li>
          <li>Scheduling uses the FSRS algorithm, which estimates when you're likely to forget each item.</li>
        </ul>
      </details>
    </>
  );
}
