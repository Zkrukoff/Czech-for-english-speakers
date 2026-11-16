import { z } from 'zod';
import { ALPHABET_SKILL, CASES, CASE_KEYS, GRAMMAR_SKILLS } from './taxonomy';

/**
 * Zod schemas for everything in /content. These are the source of truth for
 * the content format; content/SCHEMA.md documents them for authors.
 */

const reviewed = z.boolean({
  error: 'nativeReviewed is required on every piece of Czech content (use false until a native speaker has checked it)',
});

const id = z.string().regex(/^[a-z0-9][a-z0-9-]*$/, 'ids use lowercase letters, digits and hyphens');

export const SkillTagSchema = z
  .string()
  .refine((s) => GRAMMAR_SKILLS.includes(s) || s === ALPHABET_SKILL || /^(vocab|guide):[a-z0-9-]+$/.test(s), {
    message: 'skill must be case:<case>, verb:<topic>, vocab:<vocabId>, guide:<guideId> or alphabet',
  });

export const SpokenFormSchema = z.object({
  /** The obecná čeština (colloquial) form, e.g. "dobrej". */
  form: z.string().min(1),
  /** Short explanation for learners. */
  note: z.string().optional(),
});

export const GenderSchema = z.enum(['m-anim', 'm-inan', 'f', 'n']);
export const AspectSchema = z.enum(['impf', 'pf', 'bi']);

export const VocabItemSchema = z.object({
  id,
  cs: z.string().min(1),
  en: z.string().min(1),
  pos: z.enum(['noun', 'verb', 'adj', 'adv', 'pron', 'prep', 'conj', 'num', 'phrase', 'particle', 'interj']),
  gender: GenderSchema.optional(),
  /** For nouns whose genitive singular is worth showing (e.g. "pes, psa"). */
  genitive: z.string().optional(),
  aspect: AspectSchema.optional(),
  partner: z.string().optional(),
  spoken: SpokenFormSchema.optional(),
  notes: z.string().optional(),
  /** Optional id of a recorded audio file in /public/audio (without extension). */
  audio: z.string().optional(),
  nativeReviewed: reviewed,
});

export const DialogueLineSchema = z.object({
  speaker: z.string().min(1),
  cs: z.string().min(1),
  en: z.string().min(1),
  spoken: SpokenFormSchema.optional(),
  audio: z.string().optional(),
  nativeReviewed: reviewed,
});

export const DialogueSchema = z.object({
  setting: z.string().optional(),
  lines: z.array(DialogueLineSchema).min(1),
});

export const HintSchema = z.object({
  /** A specific wrong answer (answer-pattern syntax allowed) that triggers this explanation. */
  wrong: z.string().min(1),
  explain: z.string().min(1),
});

const exerciseBase = {
  id,
  /** Answer patterns. "[...]" = optional, "{a|b}" = alternatives. */
  answers: z.array(z.string().min(1)).min(1),
  /** Default explanation shown for any wrong answer. Must explain WHY. */
  why: z.string().min(1),
  hints: z.array(HintSchema).default([]),
  skills: z.array(SkillTagSchema).min(1),
  /** When true, a missing diacritic is always wrong (e.g. byt vs být). */
  diacriticsMatter: z.boolean().optional(),
  /** In a unit check: which can-do goal this exercise tests. */
  goalId: z.string().optional(),
  nativeReviewed: reviewed,
};

export const TranslateExerciseSchema = z.object({
  ...exerciseBase,
  type: z.literal('translate'),
  direction: z.enum(['en-cs', 'cs-en']),
  prompt: z.string().min(1),
});

export const FillEndingExerciseSchema = z.object({
  ...exerciseBase,
  type: z.literal('fillEnding'),
  /** Sentence containing "___" where the ending goes, e.g. "Dám si káv___, prosím." */
  prompt: z.string().includes('___', { message: 'fillEnding prompt must contain ___' }),
  /** Optional English translation of the full sentence. */
  en: z.string().optional(),
  /** Optional hint shown in brackets, e.g. "káva". */
  base: z.string().optional(),
});

export const CaseSelectExerciseSchema = z.object({
  ...exerciseBase,
  type: z.literal('caseSelect'),
  /** Czech sentence; the word in question is wrapped in **double asterisks**. */
  prompt: z.string().min(1),
  question: z.string().min(1),
  options: z.array(z.enum(CASES)).min(2),
  en: z.string().optional(),
});

export const ConjugateExerciseSchema = z.object({
  ...exerciseBase,
  type: z.literal('conjugate'),
  /** Infinitive (should exist in content/verbs/verbs.json for the lookup link). */
  verb: z.string().min(1),
  person: z.enum(['1sg', '2sg', '3sg', '1pl', '2pl', '3pl']).optional(),
  tense: z.enum(['present', 'past', 'future', 'imperative', 'conditional']).default('present'),
  /** Sentence containing "___". */
  prompt: z.string().includes('___', { message: 'conjugate prompt must contain ___' }),
  en: z.string().optional(),
});

export const DialogueCompleteExerciseSchema = z.object({
  ...exerciseBase,
  type: z.literal('dialogueComplete'),
  context: z
    .array(z.object({ speaker: z.string(), cs: z.string(), en: z.string().optional() }))
    .min(1),
  /** Instruction in English, e.g. "Order a coffee politely." */
  prompt: z.string().min(1),
});

/**
 * A general typed question, used e.g. for the alphabet: an English
 * instruction, optionally a Czech text to read or listen to, and a typed
 * answer in Czech or English.
 */
export const QuestionExerciseSchema = z.object({
  ...exerciseBase,
  type: z.literal('question'),
  /** Instruction or question, in English. "**bold**" allowed. */
  prompt: z.string().min(1),
  /** Czech text shown large (with a listen button), e.g. a spelled-out name. */
  cs: z.string().optional(),
  /** What the listen button says, if different from `cs`. */
  speak: z.string().optional(),
  /** Language of the expected answer (sets the on-screen keyboard). */
  answerLang: z.enum(['cs', 'en']).default('cs'),
});

export const ExerciseSchema = z.discriminatedUnion('type', [
  TranslateExerciseSchema,
  FillEndingExerciseSchema,
  CaseSelectExerciseSchema,
  ConjugateExerciseSchema,
  DialogueCompleteExerciseSchema,
  QuestionExerciseSchema,
]);

export const LessonSchema = z.object({
  id,
  title: z.string().min(1),
  /** Ids of the unit's can-do goals this lesson works towards. */
  canDo: z.array(z.string()).default([]),
  /** Markdown file next to lesson.json. */
  explanation: z.string().default('explanation.md'),
  /** Grammar skills this lesson teaches; links to the reference. */
  grammarRefs: z.array(SkillTagSchema).default([]),
  vocab: z.array(VocabItemSchema).default([]),
  dialogue: DialogueSchema,
  exercises: z.array(ExerciseSchema).min(1),
  nativeReviewed: reviewed,
});

export const CanDoSchema = z.object({ id, text: z.string().min(1) });

export const UnitSchema = z.object({
  id,
  title: z.string().min(1),
  /** Czech title, e.g. "V kavárně". */
  titleCs: z.string().optional(),
  situation: z.string().min(1),
  canDo: z.array(CanDoSchema).min(1),
  /** Lesson folder names under lessons/, in order. */
  lessons: z.array(z.string()).min(1),
  check: z.object({
    /** Fraction of a goal's check items that must be right to complete it. */
    passRatio: z.number().min(0).max(1).default(0.8),
    exercises: z.array(ExerciseSchema).min(1),
  }),
  nativeReviewed: reviewed,
});

export const CourseSchema = z.object({
  title: z.string(),
  /** Unit folder names under content/units/, in order. */
  units: z.array(z.string()).min(1),
});

/* ---------- Grammar reference ---------- */

export const GrammarFrontmatterSchema = z.object({
  id: z.string(),
  title: z.string(),
  kind: z.enum(['case', 'verb-topic', 'other']),
  /** The skill tag this page explains, e.g. "case:genitive". */
  skill: SkillTagSchema.optional(),
  order: z.number().default(0),
  summary: z.string().optional(),
  nativeReviewed: reviewed,
});

/**
 * A generic form table (nouns, adjectives, pronouns). Each cell is
 * "stem|ending"; alternatives are separated by " / ". A cell of "—" means
 * no form. Rows are usually cases.
 */
export const FormTableSchema = z.object({
  id,
  title: z.string(),
  group: z.string(),
  /** e.g. "masculine animate, hard" */
  subtitle: z.string().optional(),
  columns: z.array(z.string()).min(1),
  rows: z
    .array(
      z.object({
        case: z.enum(CASE_KEYS).optional(),
        label: z.string().optional(),
        forms: z.array(z.string()),
      }),
    )
    .min(1),
  notes: z.array(z.string()).default([]),
  nativeReviewed: reviewed,
});

export const FormTableFileSchema = z.object({ tables: z.array(FormTableSchema) });

/* ---------- Verbs ---------- */

const personForms = z.object({
  '1sg': z.string(),
  '2sg': z.string(),
  '3sg': z.string(),
  '1pl': z.string(),
  '2pl': z.string(),
  '3pl': z.string(),
});

export const VerbSchema = z.object({
  lemma: z.string().min(1),
  en: z.string().min(1),
  aspect: AspectSchema,
  /** Aspect partner(s), e.g. "napsat" for "psát". */
  partner: z.array(z.string()).default([]),
  /** Conjugation class label, e.g. "-á- (dělat)". */
  class: z.string(),
  reflexive: z.enum(['se', 'si']).optional(),
  /** Present forms. For perfective verbs these have future meaning. */
  present: personForms,
  /** l-participle: masculine sg, feminine sg, neuter sg, masc. animate pl, other pl. */
  past: z.object({ m: z.string(), f: z.string(), n: z.string(), mpl: z.string(), fpl: z.string() }),
  imperative: z.object({ '2sg': z.string(), '1pl': z.string(), '2pl': z.string() }).optional(),
  /** Only for verbs with an irregular/synthetic future (být → budu, jít → půjdu). */
  future: personForms.optional(),
  motion: z.enum(['determinate', 'indeterminate']).optional(),
  /** The other verb of a motion pair, e.g. "chodit" for "jít". */
  motionPair: z.string().optional(),
  topics: z.array(z.string()).default([]),
  notes: z.string().optional(),
  spoken: SpokenFormSchema.optional(),
  nativeReviewed: reviewed,
});

export const VerbFileSchema = z.object({ verbs: z.array(VerbSchema) });

/* ---------- Alphabet ---------- */

export const LetterSchema = z.object({
  /** Lower-case letter, e.g. "č" or "ch". */
  letter: z.string().min(1).max(2),
  upper: z.string().min(1).max(2),
  /** How the letter is named when spelling aloud, e.g. "čé", "eř". */
  name: z.string().min(1),
  group: z.enum(['vowel', 'consonant']),
  /** Plain-English description of the sound. */
  sound: z.string().min(1),
  ipa: z.string().min(1),
  example: z.object({ cs: z.string().min(1), en: z.string().min(1) }),
  /** Word from the traditional Czech phone-spelling alphabet ("Č jako Čeněk"). */
  spellingWord: z.string().optional(),
  tip: z.string().optional(),
  /** Only appears in foreign words and names. */
  loanOnly: z.boolean().optional(),
  nativeReviewed: reviewed,
});

export const PracticeSetSchema = z.object({
  id,
  title: z.string().min(1),
  description: z.string().min(1),
  exercises: z.array(ExerciseSchema).min(1),
});

export const AlphabetSchema = z.object({
  /** Markdown file in content/alphabet/ with the pronunciation guide. */
  intro: z.string().default('intro.md'),
  letters: z.array(LetterSchema).min(1),
  practice: z.array(PracticeSetSchema).default([]),
  nativeReviewed: reviewed,
});

/* ---------- Guides (culture, Prague transport, …) ---------- */

export const PhraseSchema = z.object({
  cs: z.string().min(1),
  en: z.string().min(1),
  note: z.string().optional(),
  spoken: SpokenFormSchema.optional(),
  nativeReviewed: reviewed,
});

export const TimelineEventSchema = z.object({
  id,
  /** Display date: "1415", "May 1945", "10th century". */
  year: z.string().min(1),
  title: z.string().min(1),
  titleCs: z.string().optional(),
  /** What happened (always visible). */
  summary: z.string().min(1),
  /** Why it matters today (revealed as the event scrolls into focus). */
  significance: z.string().min(1),
  /** Where to see it in Prague. */
  place: z.string().optional(),
  nativeReviewed: reviewed,
});

export const MetroSchema = z.object({
  lines: z
    .array(
      z.object({
        id: z.enum(['A', 'B', 'C']),
        nickname: z.string(),
        colour: z.string().regex(/^#[0-9a-f]{6}$/i),
        /** Stations in order, from the first terminus to the last. */
        stations: z.array(z.string().min(1)).min(2),
      }),
    )
    .length(3),
  /** Short notes for stations, keyed by station name. */
  notes: z.record(z.string(), z.string()).default({}),
  underConstruction: z.string().optional(),
  nativeReviewed: reviewed,
});

export const GuideSchema = z.object({
  id,
  title: z.string().min(1),
  titleCs: z.string().optional(),
  summary: z.string().min(1),
  /** Display order on the guides page. */
  order: z.number().default(0),
  /** Markdown pages, shown as tabs, in order. Files live next to guide.json. */
  sections: z.array(z.object({ id, title: z.string().min(1), file: z.string().min(1) })).min(1),
  /** Groups of phrases with listen buttons. */
  phrasebook: z.array(z.object({ id, title: z.string().min(1), intro: z.string().optional(), phrases: z.array(PhraseSchema).min(1) })).default([]),
  practice: z.array(PracticeSetSchema).default([]),
  /** For guides with facts that change (prices, lines): where to check, and when they were last checked. */
  sources: z.array(z.object({ title: z.string().min(1), url: z.string().url() })).default([]),
  /** Optional history timeline, embedded in a section with a ```timeline <guide id>``` block. */
  timeline: z.array(TimelineEventSchema).optional(),
  /** Optional metro data, embedded with a ```metro <guide id>``` block. */
  metro: MetroSchema.optional(),
  lastChecked: z.string().optional(),
  nativeReviewed: reviewed,
});

/* ---------- Inferred types ---------- */

export type VocabItem = z.infer<typeof VocabItemSchema>;
export type DialogueLine = z.infer<typeof DialogueLineSchema>;
export type Dialogue = z.infer<typeof DialogueSchema>;
export type Hint = z.infer<typeof HintSchema>;
export type Exercise = z.infer<typeof ExerciseSchema>;
export type ExerciseType = Exercise['type'];
export type LessonData = z.infer<typeof LessonSchema>;
export type UnitData = z.infer<typeof UnitSchema>;
export type CanDo = z.infer<typeof CanDoSchema>;
export type CourseData = z.infer<typeof CourseSchema>;
export type GrammarFrontmatter = z.infer<typeof GrammarFrontmatterSchema>;
export type FormTable = z.infer<typeof FormTableSchema>;
export type Verb = z.infer<typeof VerbSchema>;
export type Letter = z.infer<typeof LetterSchema>;
export type PracticeSet = z.infer<typeof PracticeSetSchema>;
export type AlphabetData = z.infer<typeof AlphabetSchema>;
export type Phrase = z.infer<typeof PhraseSchema>;
export type GuideData = z.infer<typeof GuideSchema>;
export type TimelineEvent = z.infer<typeof TimelineEventSchema>;
export type MetroData = z.infer<typeof MetroSchema>;
