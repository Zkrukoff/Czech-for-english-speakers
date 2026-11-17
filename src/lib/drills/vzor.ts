import type { Exercise, Noun } from '@/content/schema';
import { CASE_INFO, CASE_KEY_TO_NAME, CASE_KEYS, type CaseKey } from '@/content/taxonomy';
import { patternKey, type CellKey, type Paradigm } from '@/lib/lens';

/**
 * "Drill a pattern across cases" (brief 2.2 #2): questions generated from the
 * lexicon nouns that follow one vzor. Every answer is a form from a checked
 * paradigm; nouns marked uncertain are left out.
 */

const ascii = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-');

export function cellLabel(cell: CellKey): string {
  const [c, n] = cell.split('.') as [CaseKey, 'sg' | 'pl'];
  const name = CASE_KEY_TO_NAME[c];
  return `${CASE_INFO[name].number}. pád · ${name} · ${n === 'sg' ? 'singular' : 'plural'}`;
}

export function vzorDrill(noun: Noun, paradigm: Paradigm, cell: CellKey): Exercise | null {
  const forms = paradigm[cell];
  if (!forms?.length || noun.uncertain) return null;
  const [c] = cell.split('.') as [CaseKey];
  const name = CASE_KEY_TO_NAME[c];
  return {
    id: `vzor-${ascii(noun.lemma)}-${cell.replace('.', '-')}`,
    type: 'question',
    prompt: `**${noun.lemma}** (${noun.en}) → ${cellLabel(cell)}`,
    answerLang: 'cs',
    answers: [forms.length > 1 ? `{${forms.join('|')}}` : forms[0]!],
    why: `${noun.lemma} in the ${name} ${cell.endsWith('sg') ? 'singular' : 'plural'} is ${forms.join(' or ')}. ${CASE_INFO[name].question}`,
    hints: [],
    skills: [`case:${name}`],
    nativeReviewed: false,
  };
}

/** The SRS key for the ending this drill practises. */
export const vzorDrillKey = (vzor: string, cell: CellKey) => patternKey(vzor, cell.split('.')[0] as CaseKey, cell.split('.')[1] as 'sg' | 'pl');

/** A session: `count` questions over the vzor's nouns, cycling through the cases (nominative skipped). */
export function vzorSession(
  vzor: string,
  lexicon: Map<string, { noun: Noun; paradigm: Paradigm }>,
  count = 10,
  seed = Date.now(),
): { exercise: Exercise; key: string }[] {
  const nouns = [...lexicon.values()].filter((e) => e.noun.vzor === vzor && !e.noun.uncertain);
  if (!nouns.length) return [];
  const cells = CASE_KEYS.filter((c) => c !== 'nom').flatMap((c) => ['sg', 'pl'].map((n) => `${c}.${n}` as CellKey));
  let x = seed % 2147483647 || 1;
  const rnd = () => (x = (x * 48271) % 2147483647) / 2147483647;
  const out: { exercise: Exercise; key: string }[] = [];
  for (let i = 0; out.length < count && i < count * 6; i++) {
    const e = nouns[Math.floor(rnd() * nouns.length)]!;
    const cell = cells[Math.floor(rnd() * cells.length)]!;
    const ex = vzorDrill(e.noun, e.paradigm, cell);
    if (ex && !out.some((o) => o.exercise.id === ex.id)) out.push({ exercise: ex, key: vzorDrillKey(vzor, cell) });
  }
  return out;
}
