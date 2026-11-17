import { db, DATA_TABLES, type PrazakDB } from './db';

/** All learner data as one JSON-serialisable object. */
/** Backup files from before the rename say 'czech-for-english-speakers'; both are accepted. */
export const BACKUP_APP_ID = 'prazak';
const LEGACY_BACKUP_APP_IDS = ['czech-for-english-speakers'];

export interface Backup {
  app: typeof BACKUP_APP_ID;
  version: 1;
  exportedAt: string;
  tables: Record<string, unknown[]>;
}

const TABLES = DATA_TABLES;

export async function exportData(database: PrazakDB = db): Promise<Backup> {
  const tables: Record<string, unknown[]> = {};
  for (const t of TABLES) tables[t] = await database.table(t).toArray();
  return { app: BACKUP_APP_ID, version: 1, exportedAt: new Date().toISOString(), tables };
}

/** Replace all learner data with a backup. Throws on a file that isn't one of ours. */
export async function importData(backup: unknown, database: PrazakDB = db): Promise<void> {
  const b = backup as Partial<Omit<Backup, 'app'>> & { app?: string };
  const knownApp = b?.app === BACKUP_APP_ID || LEGACY_BACKUP_APP_IDS.includes(b?.app ?? '');
  if (!knownApp || b.version !== 1 || typeof b.tables !== 'object' || !b.tables) {
    throw new Error('This file is not a backup from this app.');
  }
  await database.transaction('rw', TABLES.map((t) => database.table(t)), async () => {
    for (const t of TABLES) {
      await database.table(t).clear();
      const rows = b.tables![t];
      if (Array.isArray(rows)) await database.table(t).bulkPut(rows);
    }
  });
}

/** Delete all progress, reviews and answers. Settings are kept. */
export async function resetProgress(database: PrazakDB = db): Promise<void> {
  await database.transaction('rw', [database.attempts, database.cards, database.lessonProgress, database.goalProgress], async () => {
    await Promise.all([database.attempts.clear(), database.cards.clear(), database.lessonProgress.clear(), database.goalProgress.clear()]);
  });
}
