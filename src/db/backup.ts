import { db, type CzechDB } from './db';

/** All learner data as one JSON-serialisable object. */
export interface Backup {
  app: 'czech-for-english-speakers';
  version: 1;
  exportedAt: string;
  tables: Record<string, unknown[]>;
}

const TABLES = ['settings', 'attempts', 'cards', 'lessonProgress', 'goalProgress'] as const;

export async function exportData(database: CzechDB = db): Promise<Backup> {
  const tables: Record<string, unknown[]> = {};
  for (const t of TABLES) tables[t] = await database.table(t).toArray();
  return { app: 'czech-for-english-speakers', version: 1, exportedAt: new Date().toISOString(), tables };
}

/** Replace all learner data with a backup. Throws on a file that isn't one of ours. */
export async function importData(backup: unknown, database: CzechDB = db): Promise<void> {
  const b = backup as Partial<Backup>;
  if (b?.app !== 'czech-for-english-speakers' || b.version !== 1 || typeof b.tables !== 'object' || !b.tables) {
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
export async function resetProgress(database: CzechDB = db): Promise<void> {
  await database.transaction('rw', [database.attempts, database.cards, database.lessonProgress, database.goalProgress], async () => {
    await Promise.all([database.attempts.clear(), database.cards.clear(), database.lessonProgress.clear(), database.goalProgress.clear()]);
  });
}
