import { describe, expect, it } from 'vitest';
import { contrast, readTokens } from './design-tokens';

/**
 * Every text/background pairing the components use, with the WCAG level it
 * must meet: 'text' = 4.5:1 (AA, any size), 'large' = 3:1 (AA large text,
 * badges, fills). Add a row here when a component uses a new pairing.
 */
const PAIRS: [fg: string, bg: string, level: 'text' | 'large'][] = [
  ['--ink', '--paper', 'text'], ['--ink', '--paper-2', 'text'], ['--ink', '--surface', 'text'], ['--ink', '--paper-3', 'text'],
  ['--ink-2', '--paper', 'text'], ['--ink-2', '--paper-2', 'text'], ['--ink-2', '--surface', 'text'],
  ['--ink-3', '--paper', 'text'], ['--ink-3', '--paper-2', 'text'], ['--ink-3', '--surface', 'text'],
  ['--paper', '--ink', 'text'],
  ['--vltava', '--paper', 'text'], ['--vltava', '--paper-2', 'text'], ['--vltava', '--surface', 'text'],
  ['--ink', '--vltava-tint', 'text'], ['--ink', '--champagne-tint', 'text'],
  ['--line-a-deep', '--paper', 'text'], ['--line-a-deep', '--paper-2', 'text'], ['--line-c-deep', '--paper', 'text'], ['--line-c-deep', '--paper-2', 'text'],
  ['--line-a', '--paper', 'large'], ['--line-c', '--paper', 'large'],
  ['--on-fill-dark', '--line-b', 'text'], ['--on-fill-dark', '--champagne', 'text'],
  ['--on-fill-dark', '--ticket', 'text'], ['--on-fill-dark', '--ticket-void', 'text'],
  ['--on-fill-light', '--line-a', 'large'], ['--on-fill-light', '--line-c', 'large'],
  ['--on-fill-light', '--plate-red', 'text'], ['--on-fill-light', '--plate-blue', 'text'], ['--on-fill-light', '--board', 'text'], ['--line-b', '--board', 'text'],
  ...(['1', '2', '3', '4', '5', '6', '7'] as const).flatMap((n) => [
    [`--case-${n}`, '--paper', 'text'], [`--case-${n}`, '--paper-2', 'text'], [`--case-${n}`, '--surface', 'text'],
  ] as [string, string, 'text'][]),
  ...Array.from({ length: 24 }, (_, i) => [`--on-fill-dark`, `--tile-${String(i + 1).padStart(2, '0')}`, 'text'] as [string, string, 'text']),
];

describe('token contrast (WCAG AA)', () => {
  const { light, dark } = readTokens();
  for (const [theme, t] of [['light', light], ['noční tramvaj (dark)', dark]] as const) {
    it(`every used pair passes in ${theme}`, () => {
      const failures = PAIRS.filter(([fg, bg]) => t[fg] && t[bg])
        .map(([fg, bg, level]) => ({ fg, bg, level, ratio: contrast(t[fg]!, t[bg]!) }))
        .filter(({ level, ratio }) => ratio < (level === 'text' ? 4.5 : 3))
        .map(({ fg, bg, ratio }) => `${fg} on ${bg}: ${ratio.toFixed(2)}`);
      expect(failures).toEqual([]);
    });
  }

  it('every pair refers to tokens that exist', () => {
    const missing = PAIRS.flatMap(([a, b]) => [a, b]).filter((n) => !light[n]);
    expect(missing).toEqual([]);
  });

  it('documents the brief\'s own figures (yellow is never text on paper)', () => {
    expect(contrast(light['--line-b']!, light['--paper']!)).toBeLessThan(2);
    expect(contrast(light['--ink']!, light['--paper']!)).toBeGreaterThan(15);
  });
});
