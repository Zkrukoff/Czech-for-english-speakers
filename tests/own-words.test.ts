import 'fake-indexeddb/auto';
import Dexie from 'dexie';
import { describe, expect, it } from 'vitest';
import { contentFiles } from '@/content/files';
import { loadContent } from '@/content/loader';
import { PrazakDB } from '@/db/db';
import { addOwnWord, deleteOwnWord } from '@/db/ownWords';
import { exportData, importData, resetProgress } from '@/db/backup';
import { guessVzor, linkWord } from '@/lib/words/link';
import { ownWordExercise } from '@/lib/srs/reviewItems';
import { checkAnswer, SELF_ASSESSED } from '@/lib/answers/check';

const { course } = loadContent(contentFiles);
let n = 0;
const fresh = () => new PrazakDB(`own-${++n}`);

describe('linking a saved word', () => {
  it('finds any form of a lexicon noun, with its vzor', () => {
    expect(linkWord('kávu', course)).toEqual({ kind: 'noun', lemma: 'káva', vzor: 'noun-zena', gender: 'f' });
    expect(linkWord('v Praze', course)).toBeNull(); // phrases are saved as they are
    expect(linkWord('Praze', course)).toMatchObject({ lemma: 'Praha', vzor: 'noun-zena' });
  });
  it('finds a verb by infinitive or conjugated form', () => {
    expect(linkWord('dělat', course)).toEqual({ kind: 'verb', lemma: 'dělat' });
    expect(linkWord('dělám', course)).toEqual({ kind: 'verb', lemma: 'dělat' });
  });
  it('leaves unknown words unlinked, and only suggests a vzor', () => {
    expect(linkWord('rohlíček', course)).toBeNull();
    expect(guessVzor('lavička', 'f')).toBe('noun-zena');
    expect(guessVzor('kancelář', 'f')).toBe('noun-pisen');
    expect(guessVzor('počítač', 'm-inan')).toBe('noun-stroj');
    expect(guessVzor('nádraží', 'n')).toBe('noun-staveni');
  });
});

describe('saved words in the database and reviews', () => {
  it('upgrades a v2 database to v3 without touching its data', async () => {
    const name = `own-v2-${++n}`;
    const v2 = new Dexie(name);
    v2.version(2).stores({ settings: 'id', attempts: '++id, itemKey, exerciseId, *skills, timestamp', cards: 'itemKey, due, *skills', lessonProgress: 'lessonId', goalProgress: 'goalId, unitId', meta: 'key', profile: 'id', missions: 'missionId, unitId, doneAt', stamps: 'id, kind, at' });
    await v2.open();
    await v2.table('stamps').put({ id: 'unit:u01', kind: 'unit', refId: 'u01', at: 5 });
    v2.close();
    const db = new PrazakDB(name);
    await db.open();
    expect(db.verno).toBe(4);
    expect(await db.stamps.get('unit:u01')).toBeDefined();
    expect(await db.ownWords.count()).toBe(0);
    db.close();
  });

  it('adds a word with a review card due now, and deletes both', async () => {
    const db = fresh();
    const id = await addOwnWord({ cs: ' výdejní místo ', en: 'pick-up point' }, db, 100);
    expect(await db.ownWords.get(id)).toMatchObject({ cs: 'výdejní místo', en: 'pick-up point', createdAt: 100 });
    expect((await db.cards.get(`own:${id}`))?.due).toBeLessThanOrEqual(100);
    await deleteOwnWord(id, db);
    expect(await db.cards.count()).toBe(0);
    db.close();
  });

  it('reviews a word with a meaning as English → Czech, and one without as recall', () => {
    const t = ownWordExercise({ id: 1, cs: 'výdejní místo', en: 'pick-up point', place: 'Anděl' });
    expect(t).toMatchObject({ type: 'translate', direction: 'en-cs', prompt: 'pick-up point' });
    expect(checkAnswer(t, 'vydejni misto', { strictDiacritics: false }).accepted).toBe(true);
    // Pattern characters typed by the learner are matched literally, not as syntax.
    expect(ownWordExercise({ id: 2, cs: 'pivo [velké]', en: 'beer' }).answers).toEqual(['pivo velké']);
    const r = ownWordExercise({ id: 3, cs: 'obvoďák', note: 'the GP' });
    expect(r).toMatchObject({ type: 'selfCheck', cs: 'obvoďák', reveal: 'the GP' });
    expect(checkAnswer(r, SELF_ASSESSED.good, { strictDiacritics: false }).accepted).toBe(true);
  });

  it('keeps saved words through a progress reset, with fresh cards', async () => {
    const db = fresh();
    const id = await addOwnWord({ cs: 'kancelář' }, db);
    await resetProgress(db);
    expect(await db.ownWords.count()).toBe(1);
    expect(await db.cards.get(`own:${id}`)).toBeDefined();
    db.close();
  });

  it('backs up words in v3, and an older backup keeps the words on this device', async () => {
    const a = fresh();
    await addOwnWord({ cs: 'lavička', en: 'bench' }, a);
    const b = fresh();
    await importData(JSON.parse(JSON.stringify(await exportData(a))), b);
    expect((await b.ownWords.toArray())[0]).toMatchObject({ cs: 'lavička' });
    await importData({ app: 'prazak', version: 2, exportedAt: '', tables: { settings: [], attempts: [], cards: [], lessonProgress: [], goalProgress: [], profile: [], missions: [], stamps: [] } }, b);
    expect(await b.ownWords.count()).toBe(1);
    a.close();
    b.close();
  });
});
