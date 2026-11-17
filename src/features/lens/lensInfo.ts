import { course } from '@/content';
import { CASE_INFO, CASE_KEY_TO_NAME, type CaseKey } from '@/content/taxonomy';
import type { LensSegment } from '@/lib/lens';
import type { GrammarFunction, Noun } from '@/content/schema';

export type LensToken = Extract<LensSegment, { type: 'lens' }>;

export interface LensInfo {
  token: LensToken;
  caseKey: CaseKey;
  caseNumber: number;
  /** "akuzativ" */
  caseCs: string;
  /** "accusative" */
  caseEn: string;
  question: string;
  fn?: GrammarFunction;
  noun?: Noun;
  /** The model noun's table id, e.g. "noun-zena", when the noun is regular. */
  vzorTable?: string;
  /** The vzor headword, e.g. "žena". */
  vzorWord?: string;
  /** The form split into what stays and the ending the case adds: ["káv", "u"]. */
  split: [string, string];
  /** Link to the grammar page for the case, if it exists. */
  casePage?: string;
}

/** Split a form into stem and ending by comparing it with the dictionary form. */
export function splitEnding(form: string, lemma: string): [string, string] {
  if (form.includes('___')) return [form.split('___')[0]!, ''];
  let i = 0;
  const a = form.toLocaleLowerCase('cs');
  const b = lemma.toLocaleLowerCase('cs');
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  // Keep at least one letter in the stem, and don't call the whole word an ending.
  i = Math.max(1, Math.min(i, form.length));
  if (i === form.length && form.length === lemma.length) return [form, ''];
  return [form.slice(0, i), form.slice(i)];
}

export function lensInfo(token: LensToken): LensInfo {
  const caseEn = CASE_KEY_TO_NAME[token.case];
  const info = CASE_INFO[caseEn];
  const entry = course.lexicon.get(token.lemma);
  const table = entry && entry.noun.vzor !== 'irregular' ? course.tables.get(entry.noun.vzor) : undefined;
  const page = course.grammarBySkill.get(`case:${caseEn}`);
  return {
    token,
    caseKey: token.case,
    caseNumber: info.number,
    caseCs: info.czech,
    caseEn,
    question: info.question,
    fn: course.functions.get(token.fn),
    noun: entry?.noun,
    vzorTable: table?.id,
    vzorWord: table?.title,
    split: splitEnding(token.form, token.lemma),
    casePage: page ? `/grammar/${page.id}` : undefined,
  };
}
