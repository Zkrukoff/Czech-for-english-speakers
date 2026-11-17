import 'fake-indexeddb/auto';
import Dexie from 'dexie';
import { describe, expect, it } from 'vitest';
import { PrazakDB } from '@/db/db';
import { migrateLegacyDatabase } from '@/db/migrate';
import { ensureProfile } from '@/db/profile';
import { contentFiles } from '@/content/files';
import { loadContent } from '@/content/loader';
import { exerciseForCard } from '@/lib/srs/reviewItems';

/**
 * Definition of done: "existing user progress survives the update".
 * A database exactly as the pre-Pražák app (schema v1, old name) left it for a
 * learner halfway through unit 2, with real ids from the course, is carried
 * through the whole upgrade path and checked against today's content.
 */
const { course } = loadContent(contentFiles);
const LEGACY = 'czech-for-english-speakers-fixture';
const now = Date.UTC(2026, 10, 1);

async function captureFixture() {
  const old = new Dexie(LEGACY);
  old.version(1).stores({
    settings: 'id',
    attempts: '++id, itemKey, exerciseId, *skills, timestamp',
    cards: 'itemKey, due, *skills',
    lessonProgress: 'lessonId',
    goalProgress: 'goalId, unitId',
  });
  await old.open();
  await old.table('settings').put({ id: 'app', strictDiacritics: true, speechRate: 0.8, showSpokenForms: false, voiceURI: 'cs-voice' });
  const lessons = ['u01-l01', 'u01-l02', 'u01-l03', 'u01-l04', 'u02-l01', 'u02-l02'];
  await old.table('lessonProgress').bulkPut(lessons.map((id, i) => ({ lessonId: id, stepsDone: ['explanation', 'vocab', 'dialogue', 'practice'], completedAt: now - (10 - i) * 86_400_000 })));
  await old.table('lessonProgress').put({ lessonId: 'u02-l03', stepsDone: ['explanation', 'vocab'] });
  await old.table('goalProgress').bulkPut([
    ...['u01-g1', 'u01-g2', 'u01-g3', 'u01-g4'].map((g) => ({ goalId: g, unitId: 'u01', bestScore: 0.9, completedAt: now - 3 * 86_400_000 })),
    { goalId: 'u02-g1', unitId: 'u02', bestScore: 0.5 },
  ]);
  const card = (itemKey: string, due: number, reps: number) => ({ itemKey, skills: [], due, stability: 3.2, difficulty: 5.1, elapsedDays: 2, scheduledDays: 3, learningSteps: 0, reps, lapses: 1, state: 2, lastReview: now - 86_400_000 });
  await old.table('cards').bulkPut([
    card('ex:u02-l01-e1', now + 86_400_000, 4),
    card('ex:u03-l03-e2', now - 1000, 1), // a unit-3 lesson that has since moved to first place
    card('ex:u01-c1', now + 5 * 86_400_000, 2),
    card('vocab:v-kava', now - 1000, 6),
    card('vocab:v-ahoj', now + 2 * 86_400_000, 3),
  ]);
  for (let i = 0; i < 40; i++) {
    await old.table('attempts').add({ itemKey: 'ex:u02-l01-e1', exerciseId: 'u02-l01-e1', skills: ['case:accusative'], correct: i % 3 !== 0, diacriticSlip: false, answer: 'u', context: 'lesson', timestamp: now - i * 3600_000 });
  }
  old.close();
}

describe('progress survives the Pražák update', () => {
  it('copies, upgrades and still resolves every piece of progress against the new content', async () => {
    await captureFixture();
    const db = new PrazakDB('prazak-survival');
    expect((await migrateLegacyDatabase(db, [LEGACY])).status).toBe('copied');
    const units = course.units.map((u) => ({ id: u.id, goalIds: u.canDo.map((g) => g.id) }));
    expect((await ensureProfile(units, db, now)).status).toBe('inferred');

    // Settings
    expect(await db.settings.get('app')).toMatchObject({ strictDiacritics: true, speechRate: 0.8, showSpokenForms: false, voiceURI: 'cs-voice' });
    // Lessons: every saved lesson still exists, and the next lesson is where they left off
    const progress = await db.lessonProgress.toArray();
    expect(progress).toHaveLength(7);
    for (const p of progress) expect(course.lessonsById.has(p.lessonId), p.lessonId).toBe(true);
    const done = new Set(progress.filter((p) => p.completedAt).map((p) => p.lessonId));
    expect(course.units.flatMap((u) => u.lessonList).find((l) => !done.has(l.id))?.id).toBe('u02-l03');
    // Goals and the station stamp for the finished unit, dated when it was finished
    expect(await db.goalProgress.count()).toBe(5);
    expect(await db.stamps.get('unit:u01')).toMatchObject({ kind: 'unit', at: now - 3 * 86_400_000 });
    expect(await db.stamps.get('unit:u02')).toBeUndefined();
    // Reviews: every card keeps its schedule and still turns into an exercise
    const cards = await db.cards.toArray();
    expect(cards).toHaveLength(5);
    for (const c of cards) expect(exerciseForCard(c.itemKey, course), c.itemKey).not.toBeNull();
    expect((await db.cards.get('vocab:v-kava'))?.reps).toBe(6);
    // Answer history
    expect(await db.attempts.count()).toBe(40);
    // The old database is still there, untouched
    expect(await Dexie.exists(LEGACY)).toBe(true);
    db.close();
  });
});
