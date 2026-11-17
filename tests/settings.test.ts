import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { PrazakDB } from '@/db/db';
import { getSettings, updateSettings } from '@/db/settings';

describe('settings', () => {
  it('returns defaults and persists updates', async () => {
    const db = new PrazakDB('test-settings');
    expect((await getSettings(db)).strictDiacritics).toBe(false);
    await updateSettings({ strictDiacritics: true }, db);
    expect((await getSettings(db)).strictDiacritics).toBe(true);
    expect((await getSettings(db)).speechRate).toBe(0.9);
  });
});
