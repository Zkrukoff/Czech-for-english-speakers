import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// The review scripts work on a copy of the content (PRAZAK_ROOT), never on the real files.
const root = mkdtempSync(join(tmpdir(), 'prazak-review-'));
let kit: typeof import('../scripts/review.mjs');
let items: typeof import('../scripts/lib/review-items.mjs');

beforeAll(async () => {
  cpSync('content', join(root, 'content'), { recursive: true });
  process.env.PRAZAK_ROOT = root;
  items = await import('../scripts/lib/review-items.mjs');
  kit = await import('../scripts/review.mjs');
});
afterAll(() => { rmSync(root, { recursive: true, force: true }); delete process.env.PRAZAK_ROOT; });

const sheet = (rows: string[][]) => {
  const f = join(root, 'filled.csv');
  writeFileSync(f, kit.toCsv([['key', 'batch', 'czech', 'english', 'context', 'check', 'verdict', 'corrected_czech', 'comment', 'reviewer'], ...rows]));
  return f;
};
const row = (key: string, verdict: string, corrected = '', comment = '') => {
  const it = [...items.jsonItems(), ...items.mdItems()].find((i) => i.key === key)!;
  return [key, '1', it.cs, it.en, '', '', verdict, corrected, comment, 'ZK'];
};
const json = (f: string) => JSON.parse(readFileSync(join(root, 'content', f), 'utf8'));

describe('review kit', () => {
  it('gives every reviewable item a unique, stable key and a batch', () => {
    const a = items.jsonItems().map((i) => i.key);
    const b = items.jsonItems().map((i) => i.key);
    expect(new Set(a).size).toBe(a.length);
    expect(a).toEqual(b);
    expect(items.jsonItems().every((i) => i.batch)).toBe(true);
    expect(items.jsonItems().length).toBeGreaterThan(3000);
  });

  it('reads CSV back exactly, with quotes, commas and line breaks', () => {
    const rows = [['a', 'b, c', 'He said "ahoj"'], ['line\nbreak', 'ž', '']];
    expect(kit.parseCsv(kit.toCsv(rows))).toEqual(rows);
  });

  it('marks OK items reviewed and applies a plain fix', () => {
    const f = 'units/01-greetings/lessons/01-hello-and-goodbye/lesson.json';
    const r = kit.importSheet(sheet([row(`${f}#vocab/v-dobry-den`, 'OK'), row('words/01-zakladni.json#words/a', 'Fix', 'a (spojka)')]), { validate: () => {} });
    expect(r.ok).toBe(1);
    expect(r.fixed).toBe(1);
    expect(json(f).vocab.find((v: { id: string }) => v.id === 'v-dobry-den').nativeReviewed).toBe(true);
    const a = json('words/01-zakladni.json').words.find((w: { id: string }) => w.id === 'a');
    expect([a.cs, a.nativeReviewed]).toEqual(['a (spojka)', true]);
  });

  it('holds back fixes to exercises and lens markup, and changes nothing there', () => {
    const f = 'units/01-greetings/lessons/01-hello-and-goodbye/lesson.json';
    const before = json(f).dialogue.lines[0];
    const r = kit.importSheet(sheet([row(`${f}#dialogue/lines/0`, 'Fix', 'Ahoj, Jani!'), row(`${f}#exercises/u01-l01-lis1`, 'Fix', '', 'Better: Jak se máte?')]), { validate: () => {} });
    expect(r.held).toHaveLength(2);
    expect(json(f).dialogue.lines[0]).toEqual(before);
    expect(readFileSync(join(root, 'review/fixes-to-apply.md'), 'utf8')).toMatch(/To apply by hand.*dialogue\/lines\/0/);
  });

  it('skips rows whose Czech changed since export, and unknown keys', () => {
    const k = 'words/01-zakladni.json#words/ale';
    const stale = row(k, 'OK'); stale[2] = 'something older';
    const r = kit.importSheet(sheet([stale, ['nope#x', '1', '', '', '', '', 'OK', '', '', 'ZK']]), { validate: () => {} });
    expect(r.ok).toBe(0);
    expect(r.problems).toHaveLength(2);
    expect(json('words/01-zakladni.json').words.find((w: { id: string }) => w.id === 'ale').nativeReviewed).toBe(false);
  });

  it('rolls everything back if the content stops validating', () => {
    const k = 'words/01-zakladni.json#words/nebo';
    expect(() => kit.importSheet(sheet([row(k, 'OK')]), { validate: () => { throw new Error('boom'); } })).toThrow(/nothing was changed/);
    expect(json('words/01-zakladni.json').words.find((w: { id: string }) => w.id === 'nebo').nativeReviewed).toBe(false);
  });

  it('marks a grammar page reviewed in its frontmatter, and logs an explanation page', () => {
    const r = kit.importSheet(sheet([row('md:grammar/verbs/past.md', 'OK'), row('md:units/01-greetings/lessons/01-hello-and-goodbye/explanation.md', 'OK')]), { validate: () => {} });
    expect(r.ok).toBe(2);
    expect(readFileSync(join(root, 'content/grammar/verbs/past.md'), 'utf8')).toMatch(/^nativeReviewed: true$/m);
    const log = JSON.parse(readFileSync(join(root, 'review/log.json'), 'utf8'));
    expect(log.pages['units/01-greetings/lessons/01-hello-and-goodbye/explanation.md'].by).toBe('ZK');
    const s = kit.status();
    expect(s.reviewed).toBe(4); // one OK, one fix, two pages
  });
});

describe('review status in the app', () => {
  it('matches the real content', async () => {
    const shipped = JSON.parse(readFileSync('src/generated/review-status.json', 'utf8'));
    const count = { total: 0, reviewed: 0 };
    const walk = (o: unknown): void => {
      if (Array.isArray(o)) o.forEach(walk);
      else if (o && typeof o === 'object') { if ('nativeReviewed' in o) { count.total++; if ((o as { nativeReviewed: boolean }).nativeReviewed) count.reviewed++; } Object.values(o).forEach(walk); }
    };
    const { readdirSync } = await import('node:fs');
    const files = (d: string): string[] => readdirSync(d, { withFileTypes: true }).flatMap((f) => (f.isDirectory() ? files(join(d, f.name)) : [join(d, f.name)]));
    for (const f of files('content').filter((f) => f.endsWith('.json'))) walk(JSON.parse(readFileSync(f, 'utf8')));
    expect(shipped.total).toBeGreaterThanOrEqual(count.total);
    expect(shipped.reviewed).toBeGreaterThanOrEqual(count.reviewed);
    expect(shipped.total - count.total).toBeLessThan(60); // the Markdown pages
  });
});
