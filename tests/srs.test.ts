import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { PrazakDB } from '@/db/db';
import { createScheduler, gradeFor, Rating, State } from '@/lib/srs/scheduler';
import { dueByKind, dueCards, dueSummary, ensureVocabCards, scheduleAnswer, scheduleExerciseAnswer } from '@/db/srs';

const MIN = 60 * 1000;
const DAY = 24 * 60 * MIN;
const T0 = Date.UTC(2026, 0, 5, 9, 0, 0);
const s = createScheduler({ fuzz: false });

let dbCounter = 0;
const freshDb = () => new PrazakDB(`test-srs-${dbCounter++}`);

describe('gradeFor', () => {
  it('maps answer outcomes to FSRS grades', () => {
    expect(gradeFor('correct')).toBe(Rating.Good);
    expect(gradeFor('diacritics')).toBe(Rating.Hard);
    expect(gradeFor('incorrect')).toBe(Rating.Again);
  });
});

describe('scheduler', () => {
  it('creates a new card that is due immediately', () => {
    const c = s.newCard('ex:a', ['case:genitive'], T0);
    expect(c.due).toBe(T0);
    expect(c.state).toBe(State.New);
    expect(c.reps).toBe(0);
  });

  it('brings a wrong answer back within minutes and a right one days later', () => {
    const c = s.newCard('ex:a', [], T0);
    const wrong = s.review(c, Rating.Again, T0);
    const right = s.review(c, Rating.Good, T0);
    expect(wrong.due - T0).toBeLessThanOrEqual(10 * MIN);
    expect(right.due - T0).toBeGreaterThanOrEqual(DAY);
  });

  it('schedules a diacritics slip sooner than a clean answer once the item is learned', () => {
    let c = s.newCard('ex:a', [], T0);
    let t = T0;
    for (let i = 0; i < 3; i++) {
      c = s.review(c, Rating.Good, t);
      t = c.due;
    }
    const hard = s.review(c, Rating.Hard, t);
    const good = s.review(c, Rating.Good, t);
    expect(hard.due).toBeLessThan(good.due);
  });

  it('grows the interval with each successful review', () => {
    let c = s.newCard('ex:a', [], T0);
    let t = T0;
    const intervals: number[] = [];
    for (let i = 0; i < 6; i++) {
      c = s.review(c, Rating.Good, t);
      intervals.push(c.due - t);
      t = c.due;
    }
    expect(c.state).toBe(State.Review);
    for (let i = 3; i < intervals.length; i++) expect(intervals[i]!).toBeGreaterThan(intervals[i - 1]!);
    expect(intervals.at(-1)!).toBeGreaterThan(7 * DAY);
  });

  it('counts a lapse and shrinks the interval after forgetting a learned item', () => {
    let c = s.newCard('ex:a', [], T0);
    let t = T0;
    for (let i = 0; i < 5; i++) {
      c = s.review(c, Rating.Good, t);
      t = c.due;
    }
    const before = c.scheduledDays;
    const lapsed = s.review(c, Rating.Again, t);
    expect(lapsed.lapses).toBe(1);
    expect(lapsed.state).toBe(State.Relearning);
    expect(lapsed.due - t).toBeLessThan(DAY);
    const recovered = s.review(lapsed, Rating.Good, lapsed.due);
    expect(recovered.scheduledDays).toBeLessThan(before);
  });

  it('keeps cards as plain data (round-trips through storage)', () => {
    const c = s.review(s.newCard('ex:a', ['case:dative'], T0), Rating.Good, T0);
    expect(JSON.parse(JSON.stringify(c))).toEqual(c);
    expect(c.skills).toEqual(['case:dative']);
  });

  it('caps intervals at the maximum', () => {
    const capped = createScheduler({ fuzz: false, maximumIntervalDays: 10 });
    let c = capped.newCard('ex:a', [], T0);
    let t = T0;
    for (let i = 0; i < 15; i++) {
      c = capped.review(c, Rating.Good, t);
      t = c.due;
    }
    // ts-fsrs may overshoot the cap by one day when the review itself happens a day late.
    expect(c.scheduledDays).toBeLessThanOrEqual(11);
  });
});

describe('card storage', () => {
  it('creates a card on the first answer and updates it on later ones', async () => {
    const database = freshDb();
    const deps = { database, scheduler: s, now: T0 };
    const first = await scheduleAnswer('ex:x', ['case:genitive'], 'incorrect', deps);
    expect(first.reps).toBe(1);
    const second = await scheduleAnswer('ex:x', ['case:genitive'], 'correct', { ...deps, now: first.due });
    expect(second.reps).toBe(2);
    expect(await database.cards.count()).toBe(1);
  });

  it('also schedules the vocabulary an exercise practises', async () => {
    const database = freshDb();
    await scheduleExerciseAnswer({ id: 'e1', skills: ['case:accusative', 'vocab:v-kava'] }, 'incorrect', { database, scheduler: s, now: T0 });
    const keys = (await database.cards.toArray()).map((c) => c.itemKey).sort();
    expect(keys).toEqual(['ex:e1', 'vocab:v-kava']);
  });

  it('adds vocabulary cards only once', async () => {
    const database = freshDb();
    const deps = { database, scheduler: s, now: T0 };
    await scheduleAnswer('vocab:v-kava', ['vocab:v-kava'], 'correct', deps);
    expect(await ensureVocabCards(['v-kava', 'v-caj'], deps)).toBe(1);
    expect(await ensureVocabCards(['v-kava', 'v-caj'], deps)).toBe(0);
    // The graded card keeps its schedule.
    expect((await database.cards.get('vocab:v-kava'))!.reps).toBe(1);
  });

  it('lists due cards, most overdue first, and summarises what is coming', async () => {
    const database = freshDb();
    const deps = { database, scheduler: s };
    await scheduleAnswer('ex:right', [], 'correct', { ...deps, now: T0 });
    await scheduleAnswer('ex:wrong', [], 'incorrect', { ...deps, now: T0 });
    await ensureVocabCards(['v-new'], { ...deps, now: T0 - MIN });

    const due = await dueCards(T0 + 15 * MIN, Infinity, database);
    expect(due.map((c) => c.itemKey)).toEqual(['vocab:v-new', 'ex:wrong']);

    const sum = await dueSummary(T0 + 15 * MIN, database);
    expect(sum).toMatchObject({ dueNow: 2, total: 3 });
    expect(sum.dueThisWeek).toBe(3);
    expect(sum.nextDue).toBeGreaterThan(T0 + 15 * MIN);
  });
});


describe('Due counts only include cards that can be shown (I10)', () => {
  it('skips unresolvable cards when a resolver is given', async () => {
    const database = new PrazakDB(`due-${Math.random()}`);
    const now = Date.parse('2026-11-18T10:00:00Z');
    const base = { skills: [], stability: 1, difficulty: 5, elapsedDays: 0, scheduledDays: 0, learningSteps: 0, reps: 1, lapses: 0, state: 1 };
    await database.cards.bulkPut([
      { ...base, itemKey: 'ex:u01-l01-e1', due: now - 1 },
      { ...base, itemKey: 'pattern:nowhere:acc.sg', due: now - 1 },
    ] as never);
    const resolvable = (k: string) => !k.startsWith('pattern:nowhere');
    expect((await dueSummary(now, database)).dueNow).toBe(2);
    expect((await dueSummary(now, database, resolvable)).dueNow).toBe(1);
    expect((await dueByKind(now, database, resolvable)).pattern).toBe(0);
  });
});
