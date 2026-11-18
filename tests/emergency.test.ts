import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { contentFiles } from '@/content/files';
import { loadContent } from '@/content/loader';

const { course, errors } = loadContent(contentFiles);

describe('Emergency cards', () => {
  it('loads the verified numbers in priority order', () => {
    expect(errors).toEqual([]);
    expect(course.emergency.numbers.map((n) => n.number)).toEqual(['112', '155', '158', '150', '156']);
    for (const n of course.emergency.numbers) {
      expect(n.verified.length).toBeGreaterThan(0);
      for (const v of n.verified) expect(v.url).toMatch(/^https:\/\/[a-z.]*gov\.cz\//);
    }
  });

  it('has the six cards, each with a show-to-a-Czech message', () => {
    expect(course.emergency.cards.map((c) => c.id)).toEqual(['doctor', 'pharmacy', 'police', 'locked-out', 'lost', 'accident']);
    for (const c of course.emergency.cards) expect(c.show.length).toBeGreaterThan(0);
  });

  it('marks all Czech for native review', () => {
    for (const c of course.emergency.cards) for (const p of [...c.show, ...c.phrases]) expect(p.nativeReviewed).toBe(false);
  });

  it('dates every extra contact and links it to its source', () => {
    const lost = course.emergency.cards.find((c) => c.id === 'lost')!;
    expect(lost.contacts.map((k) => k.tel)).toEqual(['+420296191817', '+420224235085']);
    for (const k of lost.contacts) expect(k.verified.url).toBe('https://pid.cz/ztraty-a-nalezy/');
  });

  it('is reachable from the footer and the home page only', () => {
    const shell = readFileSync('src/components/AppShell.tsx', 'utf8');
    expect(shell.slice(shell.indexOf('<footer'))).toContain('to="/emergency"');
    expect(shell.slice(shell.indexOf('const NAV'), shell.indexOf('];', shell.indexOf('const NAV')))).not.toContain('emergency');
    expect(readFileSync('src/features/home/HomePage.tsx', 'utf8')).toContain('to="/emergency"');
  });
});
