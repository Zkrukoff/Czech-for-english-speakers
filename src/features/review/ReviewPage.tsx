import { WALLET_PATH } from '@/lib/paths';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { course } from '@/content';
import type { Exercise } from '@/content/schema';
import { PageHeader } from '@/components/PageHeader';
import { ExerciseRunner, type ExerciseOutcome } from '@/features/exercises/ExerciseRunner';
import { db } from '@/db/db';
import { dueByKind, dueCards, scheduleAnswer } from '@/db/srs';
import { useLiveQuery } from 'dexie-react-hooks';
import { DepartureBoard, Stamp } from '@/components/ui';
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
  const kinds = useLiveQuery(() => dueByKind(Date.now()), [due?.dueNow]);

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
        <PageHeader eyebrow="Opakování" title="Hotovo." />
        <div className="flex flex-wrap items-center gap-6 rounded-md border-2 border-ink bg-surface p-6 shadow-offset">
          <Stamp main={`${right}/${first.length}`} bottom="OPAKOVÁNÍ" size={104} />
          <div className="min-w-0 flex-1">
            <p className="text-lg">
              You remembered <b>{right} of {first.length}</b>.
            </p>
            <p className="mt-1 text-ink-2">Misses come back in about 10 minutes; the ones you knew will wait longer this time.</p>
            <div className="mt-5 flex flex-wrap gap-3">
              {due && due.dueNow > 0 ? (
                <button type="button" onClick={() => start(phase.run + 1)} className="btn btn-primary">
                  <span lang="cs">Ještě jedno kolo</span> · {due.dueNow} more due
                </button>
              ) : (
                <Link to="/" className="btn btn-primary">Back to the line</Link>
              )}
              <Link to={WALLET_PATH} className="btn btn-secondary">Ticket wallet</Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  const rows: { kind: keyof NonNullable<typeof kinds>; cs: string; en: string }[] = [
    { kind: 'vocab', cs: 'Slovíčka', en: 'words' },
    { kind: 'ex', cs: 'Cvičení', en: 'exercises' },
    { kind: 'pattern', cs: 'Koncovky', en: 'endings' },
    { kind: 'fn', cs: 'Pády', en: 'case uses' },
  ];

  return (
    <>
      <PageHeader eyebrow="Opakování" title="Review" subtitle="Things come back just before you'd forget them, timed from how you answered last time." />
      {!due ? null : due.total === 0 ? (
        <div className="rounded-md border-2 border-dashed border-ink bg-paper-2 p-6">
          <p className="font-display text-2xl font-extrabold" lang="cs">Tady nic není.</p>
          <p className="mt-1 text-ink-2">Like a tram stop at 3 a.m. Words and exercises arrive here as you practise lessons.</p>
          <Link to="/" className="btn btn-primary mt-5">To the line</Link>
        </div>
      ) : (
        <section aria-labelledby="board-h" className="board rounded-md border-2 border-ink p-5 sm:p-6">
          <h2 id="board-h" className="label-board text-line-b" lang="cs">Odjezdy · due now</h2>
          <DepartureBoard text={due.dueNow === 0 ? 'NIC' : String(due.dueNow).padStart(3, ' ')} className="mt-3 text-5xl" />
          <table className="mt-5 w-full border-collapse font-mono text-sm">
            <caption className="sr-only">Due now, by kind</caption>
            <tbody>
              {rows.map((r) => (
                <tr key={r.kind} className="border-t border-on-fill-light/20">
                  <th scope="row" className="py-2 text-left font-normal">
                    <span lang="cs" className="text-on-fill-light">{r.cs}</span> <span className="text-on-fill-light/70">· {r.en}</span>
                  </th>
                  <td className="py-2 text-right tabular-nums text-line-b">{kinds?.[r.kind] ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {due.dueNow > 0 ? (
            <button type="button" onClick={() => start()} className="btn mt-6 border-line-b bg-line-b text-on-fill-dark">
              <span lang="cs">Jedeme</span> · start ({Math.min(due.dueNow, SESSION_SIZE)})
            </button>
          ) : (
            <p className="mt-5 text-on-fill-light/80">
              Nothing due. {due.nextDue && <>Next one {relativeTime(due.nextDue)}.</>} {due.dueThisWeek} due this week · {due.total} in all.
            </p>
          )}
        </section>
      )}
      <details className="mt-8 text-sm text-ink-2">
        <summary className="cursor-pointer font-medium text-ink">How reviews are scheduled</summary>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Every exercise you answer in a lesson or unit check, and every word from lessons you've practised, becomes a review item.</li>
          <li>Endings and case uses are tracked too: when you answer a sentence with underlined endings, the ending pattern (say, <i>žena</i> in the accusative) and the reason for the case (say, "after <i lang="cs">z</i>") each get their own review, shown through a different sentence each time.</li>
          <li>Wrong answers come back after about 10 minutes. Right answers come back after a few days, then after longer and longer gaps.</li>
          <li>Scheduling uses FSRS, which estimates when you're likely to forget each item. Sessions are at most {SESSION_SIZE} items; stop whenever you like.</li>
        </ul>
      </details>
    </>
  );
}
