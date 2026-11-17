import Dexie from 'dexie';
import { db as defaultDb, DATA_TABLES, LEGACY_DB_NAMES, type PrazakDB } from './db';

/**
 * One-time copy of learner data from the pre-Pražák database into the new one.
 *
 * Rules (so that no progress can be lost):
 * - The legacy database is opened read-only in Dexie's dynamic mode (no schema
 *   declared, so nothing about it is upgraded or changed) and is never deleted.
 * - Data is copied only if the new database has no learner data yet; otherwise
 *   newer progress always wins.
 * - The copy is one transaction: it either completes fully or not at all.
 * - A marker is written only after success, so a failed copy is retried on the
 *   next load.
 */

export const MIGRATION_KEY = 'migratedFromLegacy';

export type MigrationResult =
  | { status: 'already-done' }
  | { status: 'no-legacy-data' }
  | { status: 'skipped-target-has-data'; legacy: string }
  | { status: 'copied'; legacy: string; rows: Record<string, number> };

async function hasData(database: Dexie, tables: readonly string[]): Promise<boolean> {
  for (const t of tables) {
    if (!database.tables.some((x) => x.name === t)) continue;
    if ((await database.table(t).count()) > 0) return true;
  }
  return false;
}

export async function migrateLegacyDatabase(
  target: PrazakDB = defaultDb,
  legacyNames: readonly string[] = LEGACY_DB_NAMES,
): Promise<MigrationResult> {
  if (await target.meta.get(MIGRATION_KEY)) return { status: 'already-done' };

  for (const legacyName of legacyNames) {
    if (legacyName === target.name || !(await Dexie.exists(legacyName))) continue;

    const legacy = new Dexie(legacyName);
    try {
      await legacy.open();
      const tables = DATA_TABLES.filter((t) => legacy.tables.some((x) => x.name === t));
      if (!(await hasData(legacy, tables))) continue;

      if (await hasData(target, DATA_TABLES)) {
        await target.meta.put({ key: MIGRATION_KEY, value: { from: legacyName, at: Date.now(), copied: false } });
        return { status: 'skipped-target-has-data', legacy: legacyName };
      }

      const rows: Record<string, number> = {};
      const data: Record<string, unknown[]> = {};
      for (const t of tables) {
        data[t] = await legacy.table(t).toArray();
        rows[t] = data[t]!.length;
      }
      await target.transaction('rw', [...DATA_TABLES.map((t) => target.table(t)), target.meta], async () => {
        for (const t of tables) await target.table(t).bulkPut(data[t]!);
        await target.meta.put({ key: MIGRATION_KEY, value: { from: legacyName, at: Date.now(), copied: true, rows } });
      });
      return { status: 'copied', legacy: legacyName, rows };
    } finally {
      legacy.close();
    }
  }

  await target.meta.put({ key: MIGRATION_KEY, value: { from: null, at: Date.now(), copied: false } });
  return { status: 'no-legacy-data' };
}
