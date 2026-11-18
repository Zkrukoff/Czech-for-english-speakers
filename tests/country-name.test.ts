import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * C12: "Czechia" in the app's voice; "the Czech Republic" only for the state
 * itself and official things. Each allowed use is listed with its reason, so
 * a new one has to be added here on purpose.
 */
const ALLOWED: { file: string; text: string; why: string }[] = [
  { file: 'content/units/01-greetings/lessons/03-where-are-you-from/lesson.json', text: 'Česká republika (the Czech Republic) is the formal one', why: 'teaches the formal name' },
  { file: 'content/guides/culture/guide.json', text: 'splits peacefully into the Czech Republic and Slovakia', why: 'the state founded in 1993' },
  { file: 'content/calendar/holiday-lessons.json', text: 'the first of the Czech Republic', why: 'a state office (president)' },
  { file: 'content/calendar/holiday-lessons.json', text: 'when the Czech Republic and Slovakia became separate states', why: 'the state founded in 1993' },
  { file: 'content/calendar/holidays.json', text: 'The Czech Republic began on 1 January 1993', why: 'the state founded in 1993' },
  { file: 'index.html', text: 'Czechia (the Czech Republic)', why: 'search metadata, both names once' },
  { file: 'public/manifest.webmanifest', text: 'Czechia (Czech Republic)', why: 'install metadata, both names once' },
  { file: 'tests/country-name.test.ts', text: '', why: 'this file' },
  { file: 'content/REVIEW_NEEDED.md', text: 'C12 Czechia / the Czech Republic', why: 'the reviewers\' list, naming the rule itself' },
];

function* files(dir: string): Generator<string> {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) yield* files(p);
    else if (/\.(json|md|ts|tsx|html|webmanifest)$/.test(p)) yield p;
  }
}

describe('Czechia vs the Czech Republic (C12)', () => {
  it('uses "Czech Republic" only where it names the state or official things', () => {
    const found: string[] = [];
    for (const f of [...files('content'), ...files('src'), ...files('tests'), 'index.html', 'public/manifest.webmanifest', 'README.md']) {
      const lines = readFileSync(f, 'utf8').split('\n');
      lines.forEach((line, i) => {
        if (!/czech republic/i.test(line)) return;
        const ok = ALLOWED.some((a) => a.file === f && line.includes(a.text));
        if (!ok) found.push(`${f}:${i + 1}: ${line.trim().slice(0, 120)}`);
      });
    }
    expect(found).toEqual([]);
  });

  it('says both names once in the page and install metadata', () => {
    expect(readFileSync('index.html', 'utf8')).toContain('Czechia (the Czech Republic)');
    expect(readFileSync('public/manifest.webmanifest', 'utf8')).toContain('Czechia (Czech Republic)');
  });
});
