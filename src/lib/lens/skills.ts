import { CASE_KEY_TO_NAME, type CaseKey } from '@/content/taxonomy';
import type { Exercise } from '@/content/schema';
import type { Paradigm } from './decline';
import { cellsOf } from './decline';
import { parseLens } from './parse';

/**
 * Spaced-repetition keys for the grammar an exercise practises, read from the
 * case-lens markup in its Czech text:
 *   pattern:<vzor>:<case>.<number>   e.g. pattern:zena:acc.sg  (the ending pattern)
 *   fn:<function>                     e.g. fn:after-z           (why that case)
 * Fixed phrases ("chunk") and irregular nouns give no pattern key.
 */

export const patternKey = (vzor: string, c: CaseKey, n: 'sg' | 'pl') => `pattern:${vzor.replace(/^noun-/, '')}:${c}.${n}`;
export const fnKey = (fn: string) => `fn:${fn}`;

/** The Czech strings in an exercise that may carry lens markup. */
export function czechStrings(ex: Exercise): string[] {
  switch (ex.type) {
    case 'dialogueComplete':
      return ex.context.map((l) => l.cs);
    case 'translate':
      return ex.direction === 'cs-en' ? [ex.prompt] : [];
    case 'listenType':
    case 'speak':
    case 'selfCheck':
      return [ex.cs];
    case 'readReal':
      return ex.realia.lines;
    case 'buildSentence':
      return ex.tiles;
    case 'minimalPair':
      return [];
    case 'multipleChoice':
      return ex.cs ? [ex.cs] : [];
    default:
      return [ex.prompt];
  }
}

export function lensKeys(ex: Exercise, lexicon: Map<string, { noun: { vzor: string }; paradigm: Paradigm }>): string[] {
  const keys = new Set<string>();
  for (const s of czechStrings(ex)) {
    for (const seg of parseLens(s).segments) {
      if (seg.type !== 'lens' || seg.fn === 'chunk') continue;
      keys.add(fnKey(seg.fn));
      const entry = lexicon.get(seg.lemma);
      if (!entry || entry.noun.vzor === 'irregular') continue;
      const num =
        seg.number ??
        (cellsOf(entry.paradigm, seg.form).find((c) => c.startsWith(seg.case))?.split('.')[1] as 'sg' | 'pl' | undefined) ??
        'sg';
      keys.add(patternKey(entry.noun.vzor, seg.case, num));
    }
  }
  return [...keys];
}

/** The case skill a lens key belongs to, for card tagging and progress. */
export function lensKeySkill(key: string, caseOfFn: (fn: string) => CaseKey | undefined): string | undefined {
  const m = /^pattern:[^:]+:([a-z]{3})\./.exec(key);
  const c = (m?.[1] as CaseKey | undefined) ?? (key.startsWith('fn:') ? caseOfFn(key.slice(3)) : undefined);
  return c ? `case:${CASE_KEY_TO_NAME[c]}` : undefined;
}
