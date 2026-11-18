import { db, DATA_TABLES, type PrazakDB } from './db';
import { scheduler } from '@/lib/srs/scheduler';

/** All learner data as one JSON-serialisable object. */
/** Backup files from before the rename say 'czech-for-english-speakers'; both are accepted. */
export const BACKUP_APP_ID = 'prazak';
const LEGACY_BACKUP_APP_IDS = ['czech-for-english-speakers'];

export interface Backup {
  app: typeof BACKUP_APP_ID;
  /** 1: the five v1 tables. 2: adds profile, missions and stamps. 3: adds ownWords. 4: adds examAttempts. All import. */
  version: 1 | 2 | 3 | 4;
  exportedAt: string;
  tables: Record<string, unknown[]>;
}

const TABLES = DATA_TABLES;

export async function exportData(database: PrazakDB = db): Promise<Backup> {
  const tables: Record<string, unknown[]> = {};
  for (const t of TABLES) tables[t] = await database.table(t).toArray();
  return { app: BACKUP_APP_ID, version: 4, exportedAt: new Date().toISOString(), tables };
}

/** Replace all learner data with a backup. Throws on a file that isn't one of ours. */
export async function importData(backup: unknown, database: PrazakDB = db): Promise<void> {
  const b = backup as Partial<Omit<Backup, 'app'>> & { app?: string };
  const knownApp = b?.app === BACKUP_APP_ID || LEGACY_BACKUP_APP_IDS.includes(b?.app ?? '');
  if (!knownApp || ![1, 2, 3, 4].includes(b.version as number) || typeof b.tables !== 'object' || !b.tables) {
    throw new Error('This file is not a backup from this app.');
  }
  await database.transaction('rw', TABLES.map((t) => database.table(t)), async () => {
    for (const t of TABLES) {
      const rows = b.tables![t];
      // A v1 backup has no profile/missions/stamps: keep the current profile
      // (stamps are re-derived from progress on the next load).
      if (b.version === 1 && t === 'profile') continue;
      // Older backups have no saved words: keep the ones on this device.
      if ((b.version ?? 0) < 3 && t === 'ownWords') continue;
      // Older backups have no exam results: keep the ones on this device.
      if ((b.version ?? 0) < 4 && t === 'examAttempts') continue;
      await database.table(t).clear();
      if (Array.isArray(rows)) await database.table(t).bulkPut(rows);
    }
  });
}

/** Delete all progress, reviews, answers, missions and stamps. Settings and the profile are kept. */
export async function resetProgress(database: PrazakDB = db): Promise<void> {
  // Saved words are the learner's own content, not progress: they're kept (their review cards are reset).
  const tables = [database.attempts, database.cards, database.lessonProgress, database.goalProgress, database.missions, database.stamps, database.examAttempts];
  await database.transaction('rw', [...tables, database.ownWords], async () => {
    await Promise.all(tables.map((t) => t.clear()));
    // Saved words stay, so give each a fresh review card.
    const now = Date.now();
    for (const w of await database.ownWords.toArray()) await database.cards.put(scheduler.newCard(`own:${w.id}`, ['own'], now));
  });
}
