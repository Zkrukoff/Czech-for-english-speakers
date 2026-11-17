import 'fake-indexeddb/auto';
import Dexie from 'dexie';
import { describe, expect, it } from 'vitest';
import { PrazakDB, LEGACY_DB_NAMES } from '@/db/db';
import { migrateLegacyDatabase, MIGRATION_KEY } from '@/db/migrate';

let n = 0;
const names = () => {
  n++;
  return { legacy: `legacy-${n}`, target: `prazak-${n}` };
};

/** A database exactly like the one the app used before the rename (schema v1). */
async function makeLegacy(name: string, withData = true) {
  const legacy = new Dexie(name);
  legacy.version(1).stores({
    settings: 'id',
    attempts: '++id, itemKey, exerciseId, *skills, timestamp',
    cards: 'itemKey, due, *skills',
    lessonProgress: 'lessonId',
    goalProgress: 'goalId, unitId',
  });
  await legacy.open();
  if (withData) {
    await legacy.table('settings').put({ id: 'app', strictDiacritics: true, speechRate: 1.1, showSpokenForms: false });
    await legacy.table('attempts').bulkAdd([
      { itemKey: 'ex:u02-l01-e1', exerciseId: 'u02-l01-e1', skills: ['case:accusative'], correct: false, diacriticSlip: false, answer: 'a', context: 'lesson', timestamp: 1 },
      { itemKey: 'ex:u02-l01-e1', exerciseId: 'u02-l01-e1', skills: ['case:accusative'], correct: true, diacriticSlip: false, answer: 'u', context: 'review', timestamp: 2 },
    ]);
    await legacy.table('cards').put({ itemKey: 'vocab:v-kava', skills: ['vocab:v-kava'], due: 5, stability: 2, difficulty: 5, elapsedDays: 0, scheduledDays: 2, learningSteps: 0, reps: 3, lapses: 1, state: 2 });
    await legacy.table('lessonProgress').put({ lessonId: 'u02-l01', stepsDone: ['explanation', 'practice'], completedAt: 10 });
    await legacy.table('goalProgress').put({ goalId: 'u02-g1', unitId: 'u02', bestScore: 1, completedAt: 11 });
  }
  legacy.close();
}

describe('migrating progress from the pre-Pražák database', () => {
  it('the app reads from a new database called prazak and migrates from the old name', () => {
    expect(new PrazakDB().name).toBe('prazak');
    expect(LEGACY_DB_NAMES).toContain('czech-for-english-speakers');
  });

  it('copies every table, so all progress survives', async () => {
    const { legacy, target } = names();
    await makeLegacy(legacy);
    const db = new PrazakDB(target);
    const r = await migrateLegacyDatabase(db, [legacy]);
    expect(r).toEqual({ status: 'copied', legacy, rows: { settings: 1, attempts: 2, cards: 1, lessonProgress: 1, goalProgress: 1 } });
    expect((await db.settings.get('app'))?.strictDiacritics).toBe(true);
    expect(await db.attempts.count()).toBe(2);
    expect((await db.cards.get('vocab:v-kava'))?.reps).toBe(3);
    expect((await db.lessonProgress.get('u02-l01'))?.completedAt).toBe(10);
    expect((await db.goalProgress.get('u02-g1'))?.completedAt).toBe(11);
    // New answers continue the attempt ids instead of overwriting them.
    const id = await db.attempts.add({ itemKey: 'x', skills: [], correct: true, diacriticSlip: false, answer: '', context: 'lesson', timestamp: 3 });
    expect(id).toBe(3);
  });

  it('never deletes or changes the old database', async () => {
    const { legacy, target } = names();
    await makeLegacy(legacy);
    await migrateLegacyDatabase(new PrazakDB(target), [legacy]);
    expect(await Dexie.exists(legacy)).toBe(true);
    const old = new Dexie(legacy);
    await old.open();
    expect(old.verno).toBe(1);
    expect(old.tables.map((t) => t.name).sort()).toEqual(['attempts', 'cards', 'goalProgress', 'lessonProgress', 'settings']);
    expect(await old.table('attempts').count()).toBe(2);
    old.close();
  });

  it('runs only once', async () => {
    const { legacy, target } = names();
    await makeLegacy(legacy);
    const db = new PrazakDB(target);
    await migrateLegacyDatabase(db, [legacy]);
    await db.attempts.clear(); // e.g. the learner reset their progress afterwards
    expect(await migrateLegacyDatabase(db, [legacy])).toEqual({ status: 'already-done' });
    expect(await db.attempts.count()).toBe(0);
  });

  it('does not overwrite newer progress in the new database', async () => {
    const { legacy, target } = names();
    await makeLegacy(legacy);
    const db = new PrazakDB(target);
    await db.goalProgress.put({ goalId: 'u01-g1', unitId: 'u01', bestScore: 1, completedAt: 99 });
    const r = await migrateLegacyDatabase(db, [legacy]);
    expect(r.status).toBe('skipped-target-has-data');
    expect(await db.goalProgress.count()).toBe(1);
    expect(await db.meta.get(MIGRATION_KEY)).toBeTruthy();
  });

  it('handles new learners with no old database, and empty old databases', async () => {
    const a = names();
    expect(await migrateLegacyDatabase(new PrazakDB(a.target), [a.legacy])).toEqual({ status: 'no-legacy-data' });
    const b = names();
    await makeLegacy(b.legacy, false);
    expect(await migrateLegacyDatabase(new PrazakDB(b.target), [b.legacy])).toEqual({ status: 'no-legacy-data' });
  });
});
