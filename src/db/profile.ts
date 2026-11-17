import { db, type PrazakDB, type Profile } from './db';
import { stampUnitIfComplete } from './wallet';

/**
 * The learner profile. New learners get one in onboarding (phase 4). Existing
 * learners must never be forced through onboarding: if there is any progress
 * and no profile, one is inferred from that progress, and their finished
 * stations get their wallet stamps (dated when they were finished).
 */

export interface UnitGoals {
  id: string;
  goalIds: string[];
  /** Line level of the unit's station, e.g. "A1". */
  level?: string;
}

export type EnsureProfileResult =
  | { status: 'exists'; profile: Profile }
  | { status: 'inferred'; profile: Profile; stamps: number }
  | { status: 'needs-onboarding' };

async function hasProgress(database: PrazakDB): Promise<boolean> {
  const counts = await Promise.all([database.lessonProgress.count(), database.attempts.count(), database.cards.count(), database.goalProgress.count()]);
  return counts.some((n) => n > 0);
}

export async function ensureProfile(units: UnitGoals[], database: PrazakDB = db, now = Date.now()): Promise<EnsureProfileResult> {
  const existing = await database.profile.get('me');
  // Stamps are back-filled on every load (idempotent), so a unit finished in an
  // older version of the app always has its stamp.
  let stamps = 0;
  for (const u of units) if (await stampUnitIfComplete(u.id, u.goalIds, database)) stamps++;
  if (existing) return { status: 'exists', profile: existing };
  if (!(await hasProgress(database))) return { status: 'needs-onboarding' };

  const profile: Profile = {
    id: 'me',
    // We don't know their level or reasons; leave them for Settings, and
    // don't show the vykání intro again to someone who has done Unit 1.
    vykaniIntroSeen: (await database.lessonProgress.count()) > 0,
    onboardedAt: now,
    inferred: true,
  };
  await database.profile.put(profile);
  return { status: 'inferred', profile, stamps };
}

export async function saveProfile(profile: Omit<Profile, 'id' | 'inferred' | 'onboardedAt'> & Partial<Pick<Profile, 'onboardedAt'>>, database: PrazakDB = db, now = Date.now()): Promise<Profile> {
  const p: Profile = { ...profile, id: 'me', inferred: false, onboardedAt: profile.onboardedAt ?? now };
  await database.profile.put(p);
  return p;
}
