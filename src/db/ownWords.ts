import { db, type OwnWord, type PrazakDB } from './db';
import { scheduler as defaultScheduler } from '@/lib/srs/scheduler';

export const ownKey = (id: number) => `own:${id}`;

/** Save a word and put it straight into the review queue (due now). */
export async function addOwnWord(word: Omit<OwnWord, 'id' | 'createdAt'>, database: PrazakDB = db, now = Date.now()): Promise<number> {
  return database.transaction('rw', database.ownWords, database.cards, async () => {
    const id = (await database.ownWords.add({ ...word, cs: word.cs.trim(), createdAt: now })) as number;
    await database.cards.put(defaultScheduler.newCard(ownKey(id), ['own'], now));
    return id;
  });
}

export async function updateOwnWord(id: number, changes: Partial<Omit<OwnWord, 'id' | 'createdAt'>>, database: PrazakDB = db): Promise<void> {
  await database.ownWords.update(id, changes);
}

/** Delete a word and its review card. */
export async function deleteOwnWord(id: number, database: PrazakDB = db): Promise<void> {
  await database.transaction('rw', database.ownWords, database.cards, async () => {
    await database.ownWords.delete(id);
    await database.cards.delete(ownKey(id));
  });
}
