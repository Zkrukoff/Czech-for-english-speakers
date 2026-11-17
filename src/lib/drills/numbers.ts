import type { Exercise, Noun } from '@/content/schema';
import type { Paradigm } from '@/lib/lens';

/**
 * Number + noun agreement drills, generated from the lexicon so every form
 * comes from a checked paradigm (nothing is invented here):
 *   1      → jeden / jedna / jedno + nominative singular
 *   2      → dva (masculine) / dvě (feminine, neuter) + nominative plural
 *   3, 4   → tři, čtyři + nominative plural
 *   5 and up → genitive plural (pět korun)
 * Nouns marked uncertain, singular-only or plural-only, and irregular nouns
 * without both numbers, are skipped.
 */

export const NUMBER_WORDS: Record<number, string> = {
  1: 'jeden', 2: 'dva', 3: 'tři', 4: 'čtyři', 5: 'pět', 6: 'šest', 7: 'sedm', 8: 'osm', 9: 'devět', 10: 'deset', 20: 'dvacet', 100: 'sto',
};

export function numberWord(n: number, gender: Noun['gender']): string {
  if (n === 1) return gender === 'f' ? 'jedna' : gender === 'n' ? 'jedno' : 'jeden';
  if (n === 2) return gender === 'f' || gender === 'n' ? 'dvě' : 'dva';
  const w = NUMBER_WORDS[n];
  if (!w) throw new Error(`no number word for ${n}`);
  return w;
}

export function numberCell(n: number): 'nom.sg' | 'nom.pl' | 'gen.pl' {
  return n === 1 ? 'nom.sg' : n <= 4 ? 'nom.pl' : 'gen.pl';
}

const ascii = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-');

export function canDrill(noun: Noun, paradigm: Paradigm): boolean {
  return !noun.uncertain && !noun.number && !!paradigm['nom.sg'] && !!paradigm['nom.pl'] && !!paradigm['gen.pl'];
}

/** One drill: say "<n> <noun>" in Czech. */
export function numberDrill(noun: Noun, paradigm: Paradigm, n: number): Exercise {
  const cell = numberCell(n);
  const forms = paradigm[cell]!;
  const word = numberWord(n, noun.gender);
  const alts = forms.length > 1 ? `{${forms.join('|')}}` : forms[0]!;
  const why =
    cell === 'gen.pl'
      ? `After ${NUMBER_WORDS[n]} (5 and up) the noun goes into the genitive plural: ${word} ${forms[0]}.`
      : cell === 'nom.pl'
        ? `After 2, 3 and 4 the noun is in the nominative plural: ${word} ${forms[0]}.`
        : `With 1 the noun stays in the nominative singular, and jeden / jedna / jedno agrees with its gender: ${word} ${forms[0]}.`;
  return {
    id: `num-${ascii(noun.lemma)}-${n}`,
    type: 'question',
    prompt: `Say **${n} × ${noun.lemma}** (${noun.en}) in Czech.`,
    answerLang: 'cs',
    answers: [`{${word}|${n}} ${alts}`],
    why,
    hints: [],
    skills: [cell === 'gen.pl' ? 'case:genitive' : 'case:nominative'],
    nativeReviewed: false,
  };
}
