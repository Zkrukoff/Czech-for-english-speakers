import { useLiveQuery } from 'dexie-react-hooks';
import { db, DEFAULT_SETTINGS, type Settings } from './db';

export async function getSettings(database = db): Promise<Settings> {
  const s = await database.settings.get('app');
  return { ...DEFAULT_SETTINGS, ...s };
}

export async function updateSettings(patch: Partial<Omit<Settings, 'id'>>, database = db): Promise<Settings> {
  const next = { ...(await getSettings(database)), ...patch, id: 'app' as const };
  await database.settings.put(next);
  return next;
}

/** Live settings for React components; returns defaults while loading. */
export function useSettings(): Settings {
  return useLiveQuery(() => getSettings(), []) ?? DEFAULT_SETTINGS;
}
