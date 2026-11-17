import { CASE_KEYS, type CaseKey } from '@/content/taxonomy';
import type { NumberKey } from './decline';

/**
 * Case-lens markup inside Czech strings:
 *
 *   Dám si [[kávu|káva|acc|object]], prosím.
 *            form  lemma case function
 *
 * The case may carry a number: "acc.pl". The function is an id from
 * content/grammar/functions.json (why this case is used here). Everything
 * outside [[…]] is plain text. Use lensPlain() wherever a string is shown,
 * spoken or compared, and parseLens() to render the lens.
 */

export type LensSegment =
  | { type: 'text'; text: string }
  | { type: 'lens'; form: string; lemma: string; case: CaseKey; number?: NumberKey; fn: string; raw: string };

const TOKEN = /\[\[([^\]]*)\]\]/g;

export interface LensParse {
  segments: LensSegment[];
  /** Syntax problems, e.g. a missing part or an unknown case. */
  problems: string[];
}

export function parseLens(text: string): LensParse {
  const segments: LensSegment[] = [];
  const problems: string[] = [];
  let last = 0;
  for (const m of text.matchAll(TOKEN)) {
    if (m.index! > last) segments.push({ type: 'text', text: text.slice(last, m.index) });
    last = m.index! + m[0].length;
    const parts = m[1]!.split('|').map((p) => p.trim());
    const [form = '', lemma = '', caseSpec = '', fn = ''] = parts;
    const [c, num] = caseSpec.split('.');
    if (parts.length !== 4 || !form || !lemma || !fn) {
      problems.push(`"${m[0]}" needs four parts: [[form|lemma|case|function]]`);
      segments.push({ type: 'text', text: form || m[0] });
      continue;
    }
    if (!(CASE_KEYS as readonly string[]).includes(c!) || (num !== undefined && num !== 'sg' && num !== 'pl')) {
      problems.push(`"${m[0]}": case must be one of ${CASE_KEYS.join(', ')}, optionally with .sg or .pl`);
      segments.push({ type: 'text', text: form });
      continue;
    }
    segments.push({ type: 'lens', form, lemma, case: c as CaseKey, number: num as NumberKey | undefined, fn, raw: m[0] });
  }
  if (last < text.length) segments.push({ type: 'text', text: text.slice(last) });
  if (/\[\[|\]\]/.test(segments.filter((s) => s.type === 'text').map((s) => (s as { text: string }).text).join(''))) {
    problems.push('unbalanced [[ or ]]');
  }
  return { segments, problems };
}

/** The string as a reader sees it: markup removed, forms kept. */
export function lensPlain(text: string): string {
  if (!text.includes('[[')) return text;
  return text.replace(TOKEN, (_, inner: string) => inner.split('|')[0]!.trim());
}

export function hasLens(text: string): boolean {
  return text.includes('[[');
}
