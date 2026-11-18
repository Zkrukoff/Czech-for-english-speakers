/**
 * The fixed list of grammar skills the app tracks. Skill tags on exercises
 * (e.g. "case:genitive", "verb:aspect") must refer to one of these, and the
 * grammar reference must have a page for each.
 */
export const CASES = [
  'nominative',
  'genitive',
  'dative',
  'accusative',
  'vocative',
  'locative',
  'instrumental',
] as const;
export type CaseName = (typeof CASES)[number];

/** Short keys used in declension tables, in traditional Czech order (1.–7. pád). */
export const CASE_KEYS = ['nom', 'gen', 'dat', 'acc', 'voc', 'loc', 'ins'] as const;
export type CaseKey = (typeof CASE_KEYS)[number];

export const CASE_KEY_TO_NAME: Record<CaseKey, CaseName> = {
  nom: 'nominative',
  gen: 'genitive',
  dat: 'dative',
  acc: 'accusative',
  voc: 'vocative',
  loc: 'locative',
  ins: 'instrumental',
};

export const CASE_INFO: Record<CaseName, { number: number; czech: string; question: string }> = {
  nominative: { number: 1, czech: 'nominativ', question: 'kdo? co?' },
  genitive: { number: 2, czech: 'genitiv', question: 'koho? čeho?' },
  dative: { number: 3, czech: 'dativ', question: 'komu? čemu?' },
  accusative: { number: 4, czech: 'akuzativ', question: 'koho? co?' },
  vocative: { number: 5, czech: 'vokativ', question: 'oslovujeme, voláme' },
  locative: { number: 6, czech: 'lokál', question: '(o) kom? (o) čem?' },
  instrumental: { number: 7, czech: 'instrumentál', question: 'kým? čím?' },
};

/** Verb-track topics, in teaching order. */
export const VERB_TOPICS = [
  'present-classes',
  'irregulars',
  'past',
  'aspect',
  'future',
  'motion',
  'reflexive',
  'modals',
  'imperative',
  'conditional',
] as const;
export type VerbTopic = (typeof VERB_TOPICS)[number];

/** Skill tag for the alphabet and pronunciation section. */
export const ALPHABET_SKILL = 'alphabet';

/** Skill tag for listening comprehension (Overheard in Prague). */
export const LISTENING_SKILL = 'listening';

export type SkillTag = `case:${CaseName}` | `verb:${VerbTopic}` | `vocab:${string}` | typeof ALPHABET_SKILL;

export const GRAMMAR_SKILLS: string[] = [
  ...CASES.map((c) => `case:${c}`),
  ...VERB_TOPICS.map((t) => `verb:${t}`),
];

export function isGrammarSkill(tag: string): boolean {
  return GRAMMAR_SKILLS.includes(tag);
}
