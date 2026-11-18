import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { checkAnswer } from '@/lib/answers/check';
import type { Exercise } from '@/content/schema';

function* jsonFiles(dir: string): Generator<string> {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) yield* jsonFiles(p);
    else if (p.endsWith('.json')) yield p;
  }
}
function* exercises(o: unknown, file: string): Generator<{ ex: Record<string, unknown>; file: string }> {
  if (Array.isArray(o)) for (const v of o) yield* exercises(v, file);
  else if (o && typeof o === 'object') {
    const r = o as Record<string, unknown>;
    if (typeof r.type === 'string' && typeof r.id === 'string' && 'answers' in r) yield { ex: r, file };
    for (const v of Object.values(r)) yield* exercises(v, file);
  }
}
const all = [...jsonFiles('content')].flatMap((f) => [...exercises(JSON.parse(readFileSync(f, 'utf8')), f)]);

describe('Knowledge is multiple choice; producing Czech stays typed (B11)', () => {
  it('finds the exercises', () => expect(all.length).toBeGreaterThan(300));

  it('has no question or sign-reading exercise that expects a typed English answer', () => {
    const typedEnglish = all
      .filter(({ ex }) => (ex.type === 'question' && ex.answerLang === 'en') || (ex.type === 'readReal' && (ex.answerLang ?? 'en') === 'en' && !ex.options))
      .map(({ ex, file }) => `${file}: ${ex.id}`);
    expect(typedEnglish).toEqual([]);
  });

  it('explains every wrong option', () => {
    for (const { ex } of all.filter(({ ex }) => Array.isArray(ex.options) && (ex.type === 'multipleChoice' || ex.type === 'readReal'))) {
      const wrong = (ex.options as string[]).filter((o) => !(ex.answers as string[]).includes(o));
      const hinted = new Set((ex.hints as { wrong: string }[]).map((h) => h.wrong));
      for (const w of wrong) expect(hinted.has(w), `${ex.id}: "${w}"`).toBe(true);
    }
  });

  it('marks a sign-reading choice by exact pick, with the hint for the wrong one', () => {
    const exit = all.find(({ ex }) => ex.id === 'tr-read-exit')!.ex as unknown as Exercise;
    expect(checkAnswer(exit, 'The exit', { strictDiacritics: false }).status).toBe('correct');
    const wrong = checkAnswer(exit, 'The entrance', { strictDiacritics: false });
    expect(wrong.status).toBe('incorrect');
    expect(wrong.explanation).toMatch(/vstup/);
  });
});
