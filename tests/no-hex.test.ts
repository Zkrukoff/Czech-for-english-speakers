import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = new URL('..', import.meta.url).pathname;
function files(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? files(p) : [p];
  });
}
const SRC = files(join(ROOT, 'src')).filter((f) => /\.(tsx?|css)$/.test(f));
/** The only files allowed to contain raw colour values. */
const TOKEN_FILES = ['src/styles/tokens.css'];

describe('design tokens are the only source of colour and type', () => {
  it('no hex colours outside tokens.css', () => {
    const hits = SRC.filter((f) => !TOKEN_FILES.includes(relative(ROOT, f))).flatMap((f) =>
      readFileSync(f, 'utf8')
        .split('\n')
        .map((line, i) => [line, i] as const)
        .filter(([line]) => /(^|[^\w&$%{])#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3})(?![\w-])/.test(line))
        .map(([line, i]) => `${relative(ROOT, f)}:${i + 1}: ${line.trim().slice(0, 80)}`),
    );
    expect(hits).toEqual([]);
  });

  it('no rgb()/hsl() colours outside tokens.css (the hex check would miss them)', () => {
    const rx = /\b(?:rgba?|hsla?)\(/;
    const hits = SRC.filter((f) => !TOKEN_FILES.includes(relative(ROOT, f)))
      .flatMap((f) => readFileSync(f, 'utf8').split('\n').map((l, i) => [l, i, f] as const))
      .filter(([l]) => rx.test(l) && !l.trim().startsWith('//') && !l.trim().startsWith('*'))
      .map(([l, i, f]) => `${relative(ROOT, f)}:${i + 1}: ${l.trim().slice(0, 80)}`);
    expect(hits).toEqual([]);
  });

  it('no off-scale arbitrary font sizes (use the type scale, down to text-2xs)', () => {
    const rx = /\btext-\[\d/;
    const hits = SRC.filter((f) => f.endsWith('.tsx') && !f.includes('styleguide'))
      .flatMap((f) => readFileSync(f, 'utf8').split('\n').map((l, i) => [l, i, f] as const))
      .filter(([l]) => rx.test(l))
      .map(([, i, f]) => `${relative(ROOT, f)}:${i + 1}`);
    expect(hits).toEqual([]);
  });

  it("no Tailwind default palette classes (they're switched off and would render nothing)", () => {
    const rx = /\b(?:bg|text|border|ring|outline|fill|stroke|from|via|to|decoration|divide|shadow|caret|accent)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|white|black)(?:-\d{2,3})?\b/;
    const hits = SRC.filter((f) => f.endsWith('.tsx') || f.endsWith('.ts'))
      .flatMap((f) => readFileSync(f, 'utf8').split('\n').map((l, i) => [l, i, f] as const))
      .filter(([l]) => rx.test(l))
      .map(([l, i, f]) => `${relative(ROOT, f)}:${i + 1}: ${l.trim().slice(0, 80)}`);
    expect(hits).toEqual([]);
  });

  it('no banned brand fonts are loaded (anti-AI checklist)', () => {
    const banned = /\b(Inter|Poppins|Montserrat|Space Grotesk|DM Sans|Plus Jakarta Sans)\b/;
    const css = SRC.filter((f) => f.endsWith('.css')).map((f) => readFileSync(f, 'utf8')).join('\n');
    const families = [...css.matchAll(/font-family\s*:\s*([^;]+);/g)].map((m) => m[1]!);
    expect(families.filter((f) => banned.test(f))).toEqual([]);
    const pkg = readFileSync(join(ROOT, 'package.json'), 'utf8');
    expect(pkg).not.toMatch(/@fontsource[^"]*\/(inter|poppins|montserrat|space-grotesk|dm-sans|plus-jakarta-sans)"/);
  });
});
