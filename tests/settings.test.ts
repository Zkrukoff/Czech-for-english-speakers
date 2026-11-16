import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { CzechDB } from '@/db/db';
import { getSettings, updateSettings } from '@/db/settings';

describe('settings', () => {
  it('returns defaults and persists updates', async () => {
    const db = new CzechDB('test-settings');
    expect((await getSettings(db)).strictDiacritics).toBe(false);
    await updateSettings({ strictDiacritics: true }, db);
    expect((await getSettings(db)).strictDiacritics).toBe(true);
    expect((await getSettings(db)).speechRate).toBe(0.9);
  });
});
