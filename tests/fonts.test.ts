import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import * as fontkit from 'fontkit';

/** Every font file referenced in fonts.css, grouped by family. */
const FONTS_CSS = resolve(new URL('..', import.meta.url).pathname, 'src/styles/fonts.css');
const css = readFileSync(FONTS_CSS, 'utf8');
const byFamily = new Map<string, string[]>();
for (const block of css.match(/@font-face\s*\{[^}]+\}/g) ?? []) {
  const family = /font-family:\s*'([^']+)'/.exec(block)![1]!;
  const url = /url\(([^)]+)\)/.exec(block)![1]!;
  byFamily.set(family, [...(byFamily.get(family) ?? []), resolve(dirname(FONTS_CSS), url)]);
}

const PANGRAM = 'Příliš žluťoučký kůň úpěl ďábelské ódy';
const CZECH = 'ÁáČčĎďÉéĚěÍíŇňÓóŘřŠšŤťÚúŮůÝýŽž' + 'Ř ř Ů ů Ě ě Ď ď Ť ť Ň ň' + PANGRAM + PANGRAM.toUpperCase() + '„“‚‘–—…€';

describe('fonts cover Czech', () => {
  it('loads the four families the brief specifies', () => {
    expect([...byFamily.keys()].sort()).toEqual(['Azeret Mono', 'Bricolage Grotesque', 'Mluvka', 'Yrsa']);
  });

  for (const [family, paths] of byFamily) {
    it(`${family}: every Czech letter and the pangram are in the self-hosted files`, () => {
      const fonts = [...new Set(paths)].map((p) => fontkit.create(readFileSync(p)) as fontkit.Font);
      const missing = [...new Set(CZECH.replace(/\s/g, ''))].filter((ch) => !fonts.some((f) => f.hasGlyphForCodePoint(ch.codePointAt(0)!)));
      expect(missing).toEqual([]);
    });
  }

  it('ships only WOFF2', () => {
    for (const paths of byFamily.values()) for (const p of paths) expect(p).toMatch(/\.woff2$/);
  });
});
