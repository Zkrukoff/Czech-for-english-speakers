import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { PrazakDB } from '@/db/db';
import { exportData, importData, resetProgress } from '@/db/backup';
import { updateSettings } from '@/db/settings';

describe('backup', () => {
  it('round-trips all learner data', async () => {
    const a = new PrazakDB('backup-a');
    await updateSettings({ strictDiacritics: true }, a);
    await a.goalProgress.put({ goalId: 'g1', unitId: 'u1', bestScore: 1, completedAt: 5 });
    await a.attempts.add({ itemKey: 'ex:e1', skills: [], correct: true, diacriticSlip: false, answer: 'x', context: 'lesson', timestamp: 1 });
    const data = JSON.parse(JSON.stringify(await exportData(a)));

    const b = new PrazakDB('backup-b');
    await b.goalProgress.put({ goalId: 'old', unitId: 'u1', bestScore: 0 });
    await importData(data, b);
    expect(await b.goalProgress.toArray()).toEqual([{ goalId: 'g1', unitId: 'u1', bestScore: 1, completedAt: 5 }]);
    expect(await b.attempts.count()).toBe(1);
    expect((await b.settings.get('app'))?.strictDiacritics).toBe(true);
  });

  it('rejects files that are not backups', async () => {
    await expect(importData({ hello: 1 }, new PrazakDB('backup-c'))).rejects.toThrow(/not a backup/);
  });

  it('reset keeps settings', async () => {
    const d = new PrazakDB('backup-d');
    await updateSettings({ speechRate: 1.2 }, d);
    await d.goalProgress.put({ goalId: 'g1', unitId: 'u1', bestScore: 1 });
    await resetProgress(d);
    expect(await d.goalProgress.count()).toBe(0);
    expect((await d.settings.get('app'))?.speechRate).toBe(1.2);
  });
});

describe('backups from before the rename', () => {
  it('new backups are tagged prazak, and old czech-for-english-speakers backups still restore', async () => {
    const { exportData: exp, importData: imp } = await import('@/db/backup');
    const a = new PrazakDB('backup-legacy-a');
    await a.goalProgress.put({ goalId: 'g9', unitId: 'u1', bestScore: 1, completedAt: 1 });
    const data = await exp(a);
    expect(data.app).toBe('prazak');
    const legacyFile = { ...JSON.parse(JSON.stringify(data)), app: 'czech-for-english-speakers' };
    const b = new PrazakDB('backup-legacy-b');
    await imp(legacyFile, b);
    expect(await b.goalProgress.get('g9')).toBeTruthy();
  });
});
