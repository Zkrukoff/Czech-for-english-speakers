import 'fake-indexeddb/auto';
import Dexie from 'dexie';
import { describe, expect, it } from 'vitest';
import { PrazakDB } from '@/db/db';
import { migrateLegacyDatabase } from '@/db/migrate';
import { ensureProfile, saveProfile } from '@/db/profile';
import { awardStamp, completeMission, undoMission } from '@/db/wallet';
import { exportData, importData, resetProgress } from '@/db/backup';
import { scheduleExerciseAnswer } from '@/db/srs';
import { contentFiles } from '@/content/files';
import { loadContent } from '@/content/loader';
import { exerciseForCard } from '@/lib/srs/reviewItems';
import { lensKeys } from '@/lib/lens';

let n = 0;
const fresh = () => `v2-test-${++n}`;
const UNITS = [
  { id: 'u01', goalIds: ['u01-g1', 'u01-g2'] },
  { id: 'u02', goalIds: ['u02-g1'] },
];

/** A "prazak" database as phase 1–2 created it: schema v1 (five tables + meta), with progress. */
async function makeV1(name: string) {
  const v1 = new Dexie(name);
  v1.version(1).stores({
    settings: 'id',
    attempts: '++id, itemKey, exerciseId, *skills, timestamp',
    cards: 'itemKey, due, *skills',
    lessonProgress: 'lessonId',
    goalProgress: 'goalId, unitId',
    meta: 'key',
  });
  await v1.open();
  await v1.table('settings').put({ id: 'app', strictDiacritics: true, speechRate: 1.2, showSpokenForms: false });
  await v1.table('attempts').add({ itemKey: 'ex:a', exerciseId: 'a', skills: [], correct: true, diacriticSlip: false, answer: 'x', context: 'lesson', timestamp: 1 });
  await v1.table('cards').put({ itemKey: 'vocab:v-kava', skills: [], due: 5, stability: 2, difficulty: 5, elapsedDays: 0, scheduledDays: 2, learningSteps: 0, reps: 3, lapses: 1, state: 2 });
  await v1.table('lessonProgress').put({ lessonId: 'u01-l01', stepsDone: ['practice'], completedAt: 10 });
  await v1.table('goalProgress').bulkPut([
    { goalId: 'u01-g1', unitId: 'u01', bestScore: 1, completedAt: 100 },
    { goalId: 'u01-g2', unitId: 'u01', bestScore: 0.9, completedAt: 200 },
    { goalId: 'u02-g1', unitId: 'u02', bestScore: 0.5 },
  ]);
  await v1.table('meta').put({ key: 'migratedFromLegacy', value: { copied: false } });
  v1.close();
}

describe('schema v2 upgrade', () => {
  it('keeps every v1 row and adds empty profile, missions and stamps tables', async () => {
    const name = fresh();
    await makeV1(name);
    const db = new PrazakDB(name);
    await db.open();
    expect(db.verno).toBeGreaterThanOrEqual(2);
    expect((await db.settings.get('app'))?.speechRate).toBe(1.2);
    expect(await db.attempts.count()).toBe(1);
    expect((await db.cards.get('vocab:v-kava'))?.reps).toBe(3);
    expect((await db.lessonProgress.get('u01-l01'))?.completedAt).toBe(10);
    expect(await db.goalProgress.count()).toBe(3);
    expect(await db.profile.count()).toBe(0);
    expect(await db.stamps.count()).toBe(0);
    db.close();
  });

  it('infers a profile for an existing learner and back-fills station stamps with the real date', async () => {
    const name = fresh();
    await makeV1(name);
    const db = new PrazakDB(name);
    const r = await ensureProfile(UNITS, db, 999);
    expect(r).toMatchObject({ status: 'inferred', stamps: 1, profile: { inferred: true, vykaniIntroSeen: true, onboardedAt: 999 } });
    expect(await db.stamps.toArray()).toEqual([{ id: 'unit:u01', kind: 'unit', refId: 'u01', at: 200 }]);
    // Idempotent: a second load changes nothing.
    expect((await ensureProfile(UNITS, db, 2000)).status).toBe('exists');
    expect(await db.stamps.count()).toBe(1);
    expect((await db.profile.get('me'))?.onboardedAt).toBe(999);
    db.close();
  });

  it('sends a brand-new learner to onboarding and never overwrites a real profile', async () => {
    const db = new PrazakDB(fresh());
    expect((await ensureProfile(UNITS, db)).status).toBe('needs-onboarding');
    await saveProfile({ who: 'work', level: 'new', vykaniIntroSeen: false }, db, 5);
    const r = await ensureProfile(UNITS, db);
    expect(r).toMatchObject({ status: 'exists', profile: { who: 'work', inferred: false, onboardedAt: 5 } });
    db.close();
  });

  it('carries legacy progress all the way through: copy, upgrade, profile, stamps', async () => {
    const legacyName = fresh();
    const legacy = new Dexie(legacyName);
    legacy.version(1).stores({ settings: 'id', attempts: '++id', cards: 'itemKey', lessonProgress: 'lessonId', goalProgress: 'goalId, unitId' });
    await legacy.open();
    await legacy.table('goalProgress').put({ goalId: 'u02-g1', unitId: 'u02', bestScore: 1, completedAt: 77 });
    legacy.close();
    const db = new PrazakDB(fresh());
    expect((await migrateLegacyDatabase(db, [legacyName])).status).toBe('copied');
    expect((await ensureProfile(UNITS, db)).status).toBe('inferred');
    expect((await db.stamps.get('unit:u02'))?.at).toBe(77);
    expect(await Dexie.exists(legacyName)).toBe(true);
    db.close();
  });
});

describe('wallet', () => {
  it('awards each stamp once and keeps the first date', async () => {
    const db = new PrazakDB(fresh());
    await awardStamp('milestone', 'vaclavak:check', db, 1);
    await awardStamp('milestone', 'vaclavak:check', db, 2);
    expect(await db.stamps.toArray()).toEqual([{ id: 'milestone:vaclavak:check', kind: 'milestone', refId: 'vaclavak:check', at: 1 }]);
    db.close();
  });

  it('records missions with a stamp, and undoes both', async () => {
    const db = new PrazakDB(fresh());
    await completeMission('u02-m1', 'u02', db, 3);
    expect(await db.missions.get('u02-m1')).toEqual({ missionId: 'u02-m1', unitId: 'u02', doneAt: 3 });
    expect(await db.stamps.get('mission:u02-m1')).toBeDefined();
    await undoMission('u02-m1', db);
    expect(await db.missions.count()).toBe(0);
    expect(await db.stamps.count()).toBe(0);
    db.close();
  });
});

describe('backup and reset with v2 tables', () => {
  it('round-trips profile, missions and stamps', async () => {
    const a = new PrazakDB(fresh());
    await saveProfile({ who: 'partner', level: 'A1', vykaniIntroSeen: true, homeStation: 'A/flora' }, a, 1);
    await completeMission('u01-m1', 'u01', a, 2);
    const backup = await exportData(a);
    expect(backup.version).toBe(4);
    const b = new PrazakDB(fresh());
    await importData(JSON.parse(JSON.stringify(backup)), b);
    expect((await b.profile.get('me'))?.homeStation).toBe('A/flora');
    expect(await b.stamps.count()).toBe(1);
    a.close();
    b.close();
  });

  it('imports an old v1 backup without wiping the profile', async () => {
    const db = new PrazakDB(fresh());
    await saveProfile({ who: 'work', vykaniIntroSeen: true }, db, 1);
    await importData({ app: 'czech-for-english-speakers', version: 1, exportedAt: '', tables: { settings: [], attempts: [], cards: [], lessonProgress: [], goalProgress: [] } }, db);
    expect((await db.profile.get('me'))?.who).toBe('work');
    db.close();
  });

  it('reset clears missions and stamps but keeps settings and profile', async () => {
    const db = new PrazakDB(fresh());
    await saveProfile({ vykaniIntroSeen: true }, db, 1);
    await completeMission('u01-m1', 'u01', db);
    await resetProgress(db);
    expect(await db.stamps.count()).toBe(0);
    expect(await db.missions.count()).toBe(0);
    expect(await db.profile.count()).toBe(1);
    db.close();
  });
});

describe('pattern and function review cards', () => {
  it('schedules pattern:/fn: cards from lens markup and reviews them through a matching exercise', async () => {
    const json = structuredClone(contentFiles.json) as Record<string, any>;
    const path = Object.keys(json).find((p) => p.endsWith('lesson.json'))!;
    json[path].exercises.push(
      { id: 'lens-1', type: 'fillEnding', prompt: 'Dám si káv___ a [[čaj|čaj|acc|object]].', answers: ['u'], why: 'w', hints: [], skills: ['case:accusative'], nativeReviewed: false },
      { id: 'lens-2', type: 'translate', direction: 'cs-en', prompt: 'Mám [[čaj|čaj|acc|object]].', answers: ['I have tea'], why: 'w', hints: [], skills: ['case:accusative'], nativeReviewed: false },
    );
    const { course, errors } = loadContent({ ...contentFiles, json });
    expect(errors).toEqual([]);
    const ex = course.exercisesById.get('lens-1')!.exercise;
    expect(lensKeys(ex, course.lexicon).sort()).toEqual(['fn:object', 'pattern:stroj:acc.sg']);
    expect(course.exercisesByLensKey.get('fn:object')!.slice(0, 2)).toEqual(['lens-1', 'lens-2']);
    expect(course.exercisesByLensKey.get('fn:object')).toContain('u02-l01-e1');

    const db = new PrazakDB(fresh());
    await scheduleExerciseAnswer(ex, 'incorrect', { database: db }, [{ key: 'fn:object', skill: 'case:accusative' }]);
    expect((await db.cards.get('fn:object'))?.skills).toEqual(['case:accusative']);
    expect(exerciseForCard('fn:object', course, 0)?.id).toBe('lens-1');
    expect(exerciseForCard('fn:object', course, 1)?.id).toBe('lens-2');
    // No annotated sentence: an ending pattern is drilled on a lexicon noun of that vzor; none at all → null.
    expect(exerciseForCard('pattern:zena:ins.pl', course)?.id).toMatch(/^vzor-.*-ins-pl$/);
    expect(exerciseForCard('pattern:kure:ins.pl', course)).toBeNull();
    db.close();
  });
});
