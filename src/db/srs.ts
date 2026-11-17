import { db, type PrazakDB, type ReviewCard } from './db';
import { gradeFor, scheduler as defaultScheduler, type Scheduler } from '@/lib/srs/scheduler';
import type { CheckStatus } from '@/lib/answers/check';

/**
 * Review items are exercises ("ex:<id>"), vocabulary ("vocab:<id>") and,
 * from case-lens markup, ending patterns ("pattern:<vzor>:<case>.<number>")
 * and case functions ("fn:<id>").
 */
export const exerciseKey = (exerciseId: string) => `ex:${exerciseId}`;
export const vocabKey = (vocabId: string) => `vocab:${vocabId}`;

export interface SrsDeps {
  database?: PrazakDB;
  scheduler?: Scheduler;
  now?: number;
}

/** Grade one item from an answer, creating its card on first sight. */
export async function scheduleAnswer(itemKey: string, skills: string[], status: CheckStatus, deps: SrsDeps = {}): Promise<ReviewCard> {
  const database = deps.database ?? db;
  const s = deps.scheduler ?? defaultScheduler;
  const now = deps.now ?? Date.now();
  return database.transaction('rw', database.cards, async () => {
    const existing = await database.cards.get(itemKey);
    const card = existing ?? s.newCard(itemKey, skills, now);
    const next = s.review({ ...card, skills }, gradeFor(status), now);
    await database.cards.put(next);
    return next;
  });
}

/**
 * Schedule everything an answer touches: the exercise itself, plus every
 * vocabulary item it practises (skills "vocab:<id>"), so words you get wrong
 * in context come back as vocabulary reviews too.
 */
export async function scheduleExerciseAnswer(
  exercise: { id: string; skills: string[] },
  status: CheckStatus,
  deps: SrsDeps = {},
  /** Grammar keys from the exercise's case-lens markup ("pattern:…", "fn:…"), each with its case skill. */
  lens: { key: string; skill?: string }[] = [],
): Promise<void> {
  await scheduleAnswer(exerciseKey(exercise.id), exercise.skills, status, deps);
  for (const skill of exercise.skills) {
    if (skill.startsWith('vocab:')) await scheduleAnswer(vocabKey(skill.slice(6)), [skill], status, deps);
  }
  for (const { key, skill } of lens) await scheduleAnswer(key, skill ? [skill] : [], status, deps);
}

/** Add new (unseen) cards for a lesson's vocabulary. Existing cards are left alone. */
export async function ensureVocabCards(vocabIds: string[], deps: SrsDeps = {}): Promise<number> {
  const database = deps.database ?? db;
  const s = deps.scheduler ?? defaultScheduler;
  const now = deps.now ?? Date.now();
  return database.transaction('rw', database.cards, async () => {
    let added = 0;
    for (const id of vocabIds) {
      const key = vocabKey(id);
      if (!(await database.cards.get(key))) {
        await database.cards.put(s.newCard(key, [`vocab:${id}`], now));
        added++;
      }
    }
    return added;
  });
}

/** Cards due now, most overdue first. */
export async function dueCards(now = Date.now(), limit = Infinity, database: PrazakDB = db): Promise<ReviewCard[]> {
  const due = await database.cards.where('due').belowOrEqual(now).sortBy('due');
  return due.slice(0, limit);
}

export interface DueSummary {
  dueNow: number;
  dueToday: number;
  dueThisWeek: number;
  total: number;
  nextDue?: number;
}

export async function dueSummary(now = Date.now(), database: PrazakDB = db): Promise<DueSummary> {
  const day = 24 * 60 * 60 * 1000;
  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);
  const [dueNow, dueToday, dueThisWeek, total, next] = await Promise.all([
    database.cards.where('due').belowOrEqual(now).count(),
    database.cards.where('due').belowOrEqual(endOfToday.getTime()).count(),
    database.cards.where('due').belowOrEqual(now + 7 * day).count(),
    database.cards.count(),
    database.cards.where('due').above(now).first(),
  ]);
  return { dueNow, dueToday, dueThisWeek, total, nextDue: next?.due };
}
