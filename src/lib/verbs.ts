import type { Verb } from '@/content/schema';
import { compareCs, searchKey } from './text';

export const PERSONS = ['1sg', '2sg', '3sg', '1pl', '2pl', '3pl'] as const;
export type Person = (typeof PERSONS)[number];

export const PERSON_LABELS: Record<Person, string> = {
  '1sg': 'já',
  '2sg': 'ty',
  '3sg': 'on / ona / ono',
  '1pl': 'my',
  '2pl': 'vy',
  '3pl': 'oni / ony / ona',
};

const BYT_AUX: Record<Person, string> = { '1sg': 'jsem', '2sg': 'jsi', '3sg': '', '1pl': 'jsme', '2pl': 'jste', '3pl': '' };
const BUDU: Record<Person, string> = { '1sg': 'budu', '2sg': 'budeš', '3sg': 'bude', '1pl': 'budeme', '2pl': 'budete', '3pl': 'budou' };
const BYCH: Record<Person, string> = { '1sg': 'bych', '2sg': 'bys', '3sg': 'by', '1pl': 'bychom', '2pl': 'byste', '3pl': 'by' };

/** The infinitive without "se"/"si". */
export function bareLemma(v: Verb): string {
  return v.reflexive ? v.lemma.replace(new RegExp(`\\s+${v.reflexive}$`), '') : v.lemma;
}

/** Insert the reflexive pronoun after the first word of a form ("učím" → "učím se"). */
function withReflexive(form: string, v: Verb, at: 'end' | 'second' = 'end'): string {
  if (!v.reflexive) return form;
  if (at === 'second') {
    const [first, ...rest] = form.split(' ');
    return [first, v.reflexive, ...rest].join(' ');
  }
  return `${form} ${v.reflexive}`;
}

/** Present forms with "se/si" added for reflexive verbs. */
export function presentForms(v: Verb): Record<Person, string> {
  return Object.fromEntries(PERSONS.map((p) => [p, withReflexive(v.present[p], v)])) as Record<Person, string>;
}

/**
 * Past tense: l-participle + jsem/jsi/jsme/jste (none in 3rd person).
 * Singular shows masculine/feminine; plural shows masc. animate/other.
 * Reflexive "se/si" goes after the auxiliary: "učil jsem se"; 2sg contracts
 * to "učil ses", "dal sis".
 */
export function pastForms(v: Verb): Record<Person, string> {
  const out = {} as Record<Person, string>;
  for (const p of PERSONS) {
    const plural = p.endsWith('pl');
    const parts = plural ? `${v.past.mpl} / ${v.past.fpl}` : `${v.past.m} / ${v.past.f}`;
    let aux = BYT_AUX[p];
    let refl = v.reflexive ?? '';
    if (p === '2sg' && refl) {
      aux = '';
      refl = `${refl}s`;
    }
    out[p] = [parts, aux, refl].filter(Boolean).join(' ');
  }
  return out;
}

/**
 * Future tense. Imperfective: budu + infinitive. Perfective: the present
 * forms. Verbs with an explicit future (být, jít, jet, …) use that.
 */
export function futureForms(v: Verb): Record<Person, string> {
  if (v.future) return presentFormsFrom(v.future, v);
  if (v.aspect === 'pf') return presentForms(v);
  return Object.fromEntries(
    PERSONS.map((p) => [p, [BUDU[p], v.reflexive, bareLemma(v)].filter(Boolean).join(' ')]),
  ) as Record<Person, string>;
}

function presentFormsFrom(forms: Record<Person, string>, v: Verb): Record<Person, string> {
  return Object.fromEntries(PERSONS.map((p) => [p, withReflexive(forms[p], v)])) as Record<Person, string>;
}

/** Conditional: l-participle + bych/bys/by/bychom/byste/by (+ se/si). */
export function conditionalForms(v: Verb): Record<Person, string> {
  const out = {} as Record<Person, string>;
  for (const p of PERSONS) {
    const plural = p.endsWith('pl');
    const parts = plural ? `${v.past.mpl} / ${v.past.fpl}` : `${v.past.m} / ${v.past.f}`;
    out[p] = [parts, BYCH[p], v.reflexive].filter(Boolean).join(' ');
  }
  return out;
}

/** Imperative with se/si: "uč se", "sedni si". */
export function imperativeForms(v: Verb): { '2sg': string; '1pl': string; '2pl': string } | null {
  if (!v.imperative) return null;
  const i = v.imperative;
  return { '2sg': withReflexive(i['2sg'], v), '1pl': withReflexive(i['1pl'], v), '2pl': withReflexive(i['2pl'], v) };
}

/**
 * Longest shared beginning of a set of forms (first alternative of each),
 * used to colour the endings. Returns "" when the shared part is shorter
 * than 2 letters (e.g. být: jsem / je / jsou), so nothing is highlighted.
 */
export function commonStem(forms: string[]): string {
  const firsts = forms.map((f) => f.split(' / ')[0]!.split(' ')[0]!);
  let prefix = firsts[0] ?? '';
  for (const f of firsts) {
    let i = 0;
    while (i < prefix.length && i < f.length && prefix[i] === f[i]) i++;
    prefix = prefix.slice(0, i);
  }
  return prefix.length < 2 ? '' : prefix;
}

/** Every searchable string for a verb: lemma, English, all forms. */
export function verbSearchText(v: Verb): string[] {
  const forms = [
    v.lemma,
    ...Object.values(v.present),
    ...Object.values(v.past),
    ...Object.values(v.imperative ?? {}),
    ...Object.values(v.future ?? {}),
  ].flatMap((f) => f.split(' / '));
  return [...forms, v.en].map(searchKey);
}

/**
 * Search verbs. Ranking: exact lemma > lemma prefix > any form > English.
 * Diacritics are ignored, so "pisu" finds psát.
 */
export function searchVerbs(verbs: Verb[], query: string): Verb[] {
  const q = searchKey(query);
  if (!q) return verbs;
  const scored: { v: Verb; score: number }[] = [];
  for (const v of verbs) {
    const lemma = searchKey(v.lemma);
    const en = searchKey(v.en);
    let score = 0;
    if (lemma === q) score = 100;
    else if (lemma.startsWith(q)) score = 80;
    else if (verbSearchText(v).some((f) => f === q)) score = 70;
    else if (en.split(/[^a-z]+/).includes(q.replace(/^to /, ''))) score = 60;
    else if (lemma.includes(q)) score = 40;
    else if (en.includes(q)) score = 30;
    if (score) scored.push({ v, score });
  }
  return scored.sort((a, b) => b.score - a.score || compareCs(a.v.lemma, b.v.lemma)).map((s) => s.v);
}
