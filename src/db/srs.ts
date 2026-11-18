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

/**
 * Counts for the review board. With `resolvable`, cards that can't currently
 * become an exercise (e.g. an ending pattern with no sentence yet) aren't
 * counted, so the badge never promises more than a session can show.
 */
export async function dueSummary(now = Date.now(), database: PrazakDB = db, resolvable?: (itemKey: string) => boolean): Promise<DueSummary> {
  const day = 24 * 60 * 60 * 1000;
  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);
  if (resolvable) {
    const cards = (await database.cards.toArray()).filter((c) => resolvable(c.itemKey));
    const upTo = (t: number) => cards.filter((c) => c.due <= t).length;
    const next = cards.filter((c) => c.due > now).sort((a, b) => a.due - b.due)[0];
    return { dueNow: upTo(now), dueToday: upTo(endOfToday.getTime()), dueThisWeek: upTo(now + 7 * day), total: cards.length, nextDue: next?.due };
  }
  const [dueNow, dueToday, dueThisWeek, total, next] = await Promise.all([
    database.cards.where('due').belowOrEqual(now).count(),
    database.cards.where('due').belowOrEqual(endOfToday.getTime()).count(),
    database.cards.where('due').belowOrEqual(now + 7 * day).count(),
    database.cards.count(),
    database.cards.where('due').above(now).first(),
  ]);
  return { dueNow, dueToday, dueThisWeek, total, nextDue: next?.due };
}

export type CardKind = 'vocab' | 'ex' | 'pattern' | 'fn' | 'own' | 'chunk' | 'word';
export const cardKind = (itemKey: string): CardKind => (itemKey.split(':')[0] as CardKind) ?? 'ex';

/** Cards due now, counted by kind (words, exercises, ending patterns, case uses). */
export async function dueByKind(now = Date.now(), database: PrazakDB = db, resolvable?: (itemKey: string) => boolean): Promise<Record<CardKind, number>> {
  const counts: Record<CardKind, number> = { vocab: 0, ex: 0, pattern: 0, fn: 0, own: 0, chunk: 0, word: 0 };
  await database.cards.where('due').belowOrEqual(now).each((c) => {
    if (resolvable && !resolvable(c.itemKey)) return;
    const k = cardKind(c.itemKey);
    if (k in counts) counts[k]++;
  });
  return counts;
}

export const phraseKey = (phraseId: string) => `chunk:${phraseId}`;
/** New phrases per day when a situation is added to review (A7). */
export const NEW_PHRASES_PER_DAY = 5;
const DAY_MS = 86_400_000;

/**
 * Adds cards for new items (phrases or deck words), staggered `perDay` a day
 * after any of the same kind already waiting to be introduced. Today's batch is
 * due at once (a minute back, so counts that refresh each minute see it).
 */
async function addStaggered(prefix: 'chunk:' | 'word:', ids: string[], perDay: number, skills: string[], deps: SrsDeps): Promise<number> {
  const database = deps.database ?? db;
  const s = deps.scheduler ?? defaultScheduler;
  const now = deps.now ?? Date.now();
  return database.transaction('rw', database.cards, async () => {
    const waiting = await database.cards.where('itemKey').startsWith(prefix).filter((c) => c.reps === 0).count();
    let added = 0;
    for (const id of ids) {
      const key = prefix + id;
      if (await database.cards.get(key)) continue;
      const card = s.newCard(key, skills, now);
      const day = Math.floor((waiting + added) / perDay);
      card.due = day === 0 ? now - 60_000 : now + day * DAY_MS;
      await database.cards.put(card);
      added++;
    }
    return added;
  });
}

/** Adds a situation's phrases to review, NEW_PHRASES_PER_DAY a day. */
export function addPhraseCards(phraseIds: string[], deps: SrsDeps = {}): Promise<number> {
  return addStaggered('chunk:', phraseIds, NEW_PHRASES_PER_DAY, ['vocab:phrase'], deps);
}

export const wordKey = (wordId: string) => `word:${wordId}`;
/** Adds a vocabulary deck to review, `perDay` new words a day (Settings: 5, 10 or 20). */
export function addWordCards(wordIds: string[], perDay = 10, deps: SrsDeps = {}): Promise<number> {
  return addStaggered('word:', wordIds, perDay, ['vocab:deck'], deps);
}

/** Takes a deck out of review: words not yet seen go; ones already practised stay. */
export async function removeWordCards(wordIds: string[], database: PrazakDB = db): Promise<void> {
  const cards = await database.cards.bulkGet(wordIds.map(wordKey));
  await database.cards.bulkDelete(cards.filter((c) => c && c.reps === 0).map((c) => c!.itemKey));
}

/** Takes a situation out of review: phrases not yet seen go; ones already practised stay. */
export async function removePhraseCards(phraseIds: string[], database: PrazakDB = db): Promise<void> {
  const keys = phraseIds.map(phraseKey);
  const cards = await database.cards.bulkGet(keys);
  await database.cards.bulkDelete(cards.filter((c) => c && c.reps === 0).map((c) => c!.itemKey));
}
