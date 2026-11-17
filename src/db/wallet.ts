import { db, type PrazakDB, type Stamp } from './db';

/**
 * The ticket wallet: stamps for finished stations (units), milestones and
 * missions. Stamp ids are deterministic ("unit:u01"), so awarding twice is
 * harmless and the first date is kept.
 */

export const stampId = (kind: Stamp['kind'], refId: string) => `${kind}:${refId}`;

export async function awardStamp(kind: Stamp['kind'], refId: string, database: PrazakDB = db, at = Date.now()): Promise<Stamp> {
  return database.transaction('rw', database.stamps, async () => {
    const id = stampId(kind, refId);
    const existing = await database.stamps.get(id);
    if (existing) return existing;
    const stamp: Stamp = { id, kind, refId, at };
    await database.stamps.put(stamp);
    return stamp;
  });
}

/** A unit (station) is done when every one of its can-do goals is completed. */
export async function unitComplete(goalIds: string[], database: PrazakDB = db): Promise<number | null> {
  if (!goalIds.length) return null;
  const rows = await database.goalProgress.bulkGet(goalIds);
  if (rows.some((r) => !r?.completedAt)) return null;
  return Math.max(...rows.map((r) => r!.completedAt!));
}

/** Award the station stamp if the unit is now complete. Returns the stamp, or null. */
export async function stampUnitIfComplete(unitId: string, goalIds: string[], database: PrazakDB = db): Promise<Stamp | null> {
  const at = await unitComplete(goalIds, database);
  return at === null ? null : awardStamp('unit', unitId, database, at);
}

/** The learner says they did a mission (self-report, D: missions). */
export async function completeMission(missionId: string, unitId: string, database: PrazakDB = db, now = Date.now()): Promise<void> {
  await database.transaction('rw', database.missions, database.stamps, async () => {
    if (!(await database.missions.get(missionId))) await database.missions.put({ missionId, unitId, doneAt: now });
    await awardStamp('mission', missionId, database, now);
  });
}

/** Undo a mistaken tick: removes the mission record and its stamp. */
export async function undoMission(missionId: string, database: PrazakDB = db): Promise<void> {
  await database.transaction('rw', database.missions, database.stamps, async () => {
    await database.missions.delete(missionId);
    await database.stamps.delete(stampId('mission', missionId));
  });
}
