import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { CzechDB } from '@/db/db';
import { exportData, importData, resetProgress } from '@/db/backup';
import { updateSettings } from '@/db/settings';

describe('backup', () => {
  it('round-trips all learner data', async () => {
    const a = new CzechDB('backup-a');
    await updateSettings({ strictDiacritics: true }, a);
    await a.goalProgress.put({ goalId: 'g1', unitId: 'u1', bestScore: 1, completedAt: 5 });
    await a.attempts.add({ itemKey: 'ex:e1', skills: [], correct: true, diacriticSlip: false, answer: 'x', context: 'lesson', timestamp: 1 });
    const data = JSON.parse(JSON.stringify(await exportData(a)));

    const b = new CzechDB('backup-b');
    await b.goalProgress.put({ goalId: 'old', unitId: 'u1', bestScore: 0 });
    await importData(data, b);
    expect(await b.goalProgress.toArray()).toEqual([{ goalId: 'g1', unitId: 'u1', bestScore: 1, completedAt: 5 }]);
    expect(await b.attempts.count()).toBe(1);
    expect((await b.settings.get('app'))?.strictDiacritics).toBe(true);
  });

  it('rejects files that are not backups', async () => {
    await expect(importData({ hello: 1 }, new CzechDB('backup-c'))).rejects.toThrow(/not a backup/);
  });

  it('reset keeps settings', async () => {
    const d = new CzechDB('backup-d');
    await updateSettings({ speechRate: 1.2 }, d);
    await d.goalProgress.put({ goalId: 'g1', unitId: 'u1', bestScore: 1 });
    await resetProgress(d);
    expect(await d.goalProgress.count()).toBe(0);
    expect((await d.settings.get('app'))?.speechRate).toBe(1.2);
  });
});
