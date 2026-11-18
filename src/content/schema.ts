import { z } from 'zod';
import { ALPHABET_SKILL, CASES, CASE_KEYS, GRAMMAR_SKILLS, LISTENING_SKILL, WORD_ORDER_SKILL } from './taxonomy';

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
  .refine((s) => GRAMMAR_SKILLS.includes(s) || s === ALPHABET_SKILL || s === LISTENING_SKILL || s === WORD_ORDER_SKILL || /^(vocab|guide):[a-z0-9-]+$/.test(s), {
    message: 'skill must be case:<case>, verb:<topic>, vocab:<vocabId>, guide:<guideId>, alphabet, listening or word-order',
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

/* ---- Exercise types added for Pražák (phase 3) ---- */

/** Listen to a real recording and type what you hear. Hidden until the recording exists (D6). */
export const ListenTypeExerciseSchema = z.object({
  ...exerciseBase,
  type: z.literal('listenType'),
  /** Recording id in content/audio/manifest.json. */
  audio: z.string().min(1),
  /** What is said (shown after answering). */
  cs: z.string().min(1),
  en: z.string().optional(),
});

/** Pick the right ending from a few; the sentence has "___" after the stem. */
export const ChooseEndingExerciseSchema = z.object({
  ...exerciseBase,
  type: z.literal('chooseEnding'),
  prompt: z.string().includes('___', { message: 'chooseEnding prompt must contain ___' }),
  options: z.array(z.string()).min(2).max(5),
  base: z.string().optional(),
  en: z.string().optional(),
});

/** Put word tiles in order. Tiles may include distractors. */
export const BuildSentenceExerciseSchema = z.object({
  ...exerciseBase,
  type: z.literal('buildSentence'),
  /** English meaning to build. */
  prompt: z.string().min(1),
  tiles: z.array(z.string().min(1)).min(2),
});

/** Choose the imperfective or perfective verb for the context. */
export const AspectChoiceExerciseSchema = z.object({
  ...exerciseBase,
  type: z.literal('aspectChoice'),
  /** Sentence with "___" where the verb goes. */
  prompt: z.string().includes('___', { message: 'aspectChoice prompt must contain ___' }),
  /** The two forms to choose between, imperfective first. */
  options: z.tuple([z.string().min(1), z.string().min(1)]),
  /** Infinitives of the pair, imperfective first (must be aspect partners in verbs.json). */
  verbs: z.tuple([z.string().min(1), z.string().min(1)]),
  en: z.string().optional(),
});

/** Hear one of two words that differ in one sound; choose which. Hidden until the recording exists. */
export const MinimalPairExerciseSchema = z.object({
  ...exerciseBase,
  type: z.literal('minimalPair'),
  pair: z.tuple([z.string().min(1), z.string().min(1)]),
  /** Recording id of the word that is played; answers holds that word. */
  audio: z.string().min(1),
  /** The contrast, e.g. "ř / ž". */
  sound: z.string().min(1),
});

/**
 * Say it out loud: record yourself in the browser, play it back next to the
 * reference, and judge for yourself (D8). Nothing is uploaded.
 */
export const SpeakExerciseSchema = z.object({
  ...exerciseBase,
  type: z.literal('speak'),
  answers: z.array(z.string()).default([]),
  cs: z.string().min(1),
  en: z.string().min(1),
  /** Reference recording id, if one exists. */
  audio: z.string().optional(),
  /** What to listen for in your own recording. */
  focus: z.string().optional(),
});

/** Read a real-world text (sign, menu, announcement, form) recreated in our style (D12), then answer. */
export const ReadRealExerciseSchema = z.object({
  ...exerciseBase,
  type: z.literal('readReal'),
  realia: z.object({
    kind: z.enum(['sign', 'menu', 'announcement', 'timetable', 'form', 'message']),
    title: z.string().optional(),
    /** Lines of Czech text, as printed. */
    lines: z.array(z.string().min(1)).min(1),
  }),
  /** The question, in English. */
  prompt: z.string().min(1),
  answerLang: z.enum(['cs', 'en']).default('en'),
  /** When set, answered by picking one (knowledge questions, B11); every wrong option needs a hint. */
  options: z.array(z.string().min(1)).min(2).max(5).optional(),
});

/**
 * Multiple choice, for knowledge *about* Czechia (transport, customs, history,
 * social conventions) and for listening comprehension. Producing Czech stays
 * typed. Explain each wrong option in `hints` (wrong = the option's text), so a
 * wrong pick teaches something.
 */
export const MultipleChoiceExerciseSchema = z.object({
  ...exerciseBase,
  type: z.literal('multipleChoice'),
  /** The question, in English. "**bold**" allowed. */
  prompt: z.string().min(1),
  /** Optional Czech shown above the question (a sign, a line someone says). */
  cs: z.string().optional(),
  /** Listening: Czech that is played, never shown before answering (put it in `why` for afterwards). */
  listen: z.string().optional(),
  /** Recording of `listen`, when there is one. */
  audio: z.string().optional(),
  options: z.array(z.string().min(1)).min(2).max(5),
  /** Language of the options, for lang attributes and fonts. */
  optionsLang: z.enum(['en', 'cs']).default('en'),
});

/**
 * Recall, graded by the learner: show the Czech, reveal the meaning, then
 * "Vím / Ještě ne". Used for saved words that have no English meaning.
 */
export const SelfCheckExerciseSchema = z.object({
  ...exerciseBase,
  type: z.literal('selfCheck'),
  answers: z.array(z.string()).default([]),
  cs: z.string().min(1),
  /** Revealed after "show": meaning, note, where it was seen. */
  reveal: z.string().optional(),
});

export const ExerciseSchema = z.discriminatedUnion('type', [
  MultipleChoiceExerciseSchema,
  SelfCheckExerciseSchema,
  TranslateExerciseSchema,
  FillEndingExerciseSchema,
  CaseSelectExerciseSchema,
  ConjugateExerciseSchema,
  DialogueCompleteExerciseSchema,
  QuestionExerciseSchema,
  ListenTypeExerciseSchema,
  ChooseEndingExerciseSchema,
  BuildSentenceExerciseSchema,
  AspectChoiceExerciseSchema,
  MinimalPairExerciseSchema,
  SpeakExerciseSchema,
  ReadRealExerciseSchema,
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
  /**
   * Grammar met here as fixed phrases before it is taught (D9): e.g. "Jsem z Anglie"
   * in unit 1, long before the genitive. The case lens points ahead to where it's taught.
   */
  grammarPreview: z.array(SkillTagSchema).default([]),
  vocab: z.array(VocabItemSchema).default([]),
  dialogue: DialogueSchema,
  exercises: z.array(ExerciseSchema).min(1),
  nativeReviewed: reviewed,
});

export const CanDoSchema = z.object({ id, text: z.string().min(1) });

/** A real-world task for the station: do it in Prague, then tick it off yourself. */
export const MissionSchema = z.object({
  id,
  title: z.string().min(1),
  /** What to do, in English. */
  task: z.string().min(1),
  /** Phrases that help. */
  phrases: z.array(z.object({ cs: z.string().min(1), en: z.string().min(1) })).default([]),
  /** A gentle way out for when it goes wrong. */
  ifStuck: z.string().optional(),
  nativeReviewed: reviewed,
});

export const UnitSchema = z.object({
  id,
  title: z.string().min(1),
  /** Czech title, e.g. "V kavárně". */
  titleCs: z.string().optional(),
  situation: z.string().min(1),
  canDo: z.array(CanDoSchema).min(1),
  /** Lesson folder names under lessons/, in order. */
  lessons: z.array(z.string()).min(1),
  missions: z.array(MissionSchema).default([]),
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
  /** Motion-verb family: the base verb (jít for přijít, odejít, chodit…). */
  family: z.string().optional(),
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

export const GuideSchema = z.object({
  id,
  title: z.string().min(1),
  titleCs: z.string().optional(),
  summary: z.string().min(1),
  /** Display order on the guides page. */
  order: z.number().default(0),
  /** Not shown to learners yet (structure in place, content still being written). */
  draft: z.boolean().default(false),
  /** Markdown pages, shown as tabs, in order. Files live next to guide.json. */
  sections: z
    .array(
      z.object({
        id,
        title: z.string().min(1),
        file: z.string().min(1),
        /** Lesson ids that teach the language this section uses. Back-links are generated. */
        lessons: z.array(z.string()).default([]),
      }),
    )
    .min(1),
  /** Groups of phrases with listen buttons. */
  phrasebook: z.array(z.object({ id, title: z.string().min(1), intro: z.string().optional(), phrases: z.array(PhraseSchema).min(1) })).default([]),
  practice: z.array(PracticeSetSchema).default([]),
  /** For guides with facts that change (prices, lines): where to check, and when they were last checked. */
  sources: z.array(z.object({ title: z.string().min(1), url: z.string().url() })).default([]),
  /** Optional history timeline, embedded in a section with a ```timeline <guide id>``` block. */
  timeline: z.array(TimelineEventSchema).optional(),
  lastChecked: z.string().optional(),
  nativeReviewed: reviewed,
});

/* ---------- Lines and stations (content/lines/lines.json) ---------- */

export const LINE_IDS = ['A', 'B', 'C'] as const;
export const LevelSchema = z.enum(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);
const slug = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'station slugs are ASCII, lowercase, hyphenated');
const tile = z.string().regex(/^(0[1-9]|1[0-9]|2[0-4])$/, 'tile is "01"…"24" (a --tile-NN token)');

export const StationSchema = z.object({
  /** Official name, exactly as in PID data. */
  name: z.string().min(1),
  tile,
  /** What's above ground: shown on the station screen. */
  aboveGround: z.string().optional(),
  /** A dated service note, e.g. a closure seen in the PID feed. */
  status: z.object({ note: z.string().min(1), checked: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) }).optional(),
});

export const StopSchema = z.discriminatedUnion('kind', [
  z.object({ station: slug, kind: z.literal('pronunciation') }),
  z.object({ station: slug, kind: z.literal('unit'), unit: id }),
  z.object({
    station: slug,
    kind: z.literal('milestone'),
    milestone: z.object({ id, part: z.enum(['review', 'check']), level: LevelSchema }),
  }),
  /** Not built yet: shown as "výluka" (closed for works). */
  z.object({ station: slug, kind: z.literal('planned') }),
]);

export const LinesSchema = z.object({
  $comment: z.string().optional(),
  verified: z.object({ source: z.string().min(1), date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), note: z.string().optional() }),
  milestones: z.array(z.object({ id, name: z.string().min(1), en: z.string().min(1), summary: z.string().min(1), level: LevelSchema, /** What the check is called, when it doesn't cover a whole level (e.g. "Part 1 check"). */ checkLabel: z.string().optional() })),
  lines: z
    .array(
      z.object({
        id: z.enum(LINE_IDS),
        nickname: z.string().min(1),
        levels: z.array(LevelSchema).length(2),
        service: z.enum(['in-service', 'not-yet']),
        /** In riding order, first terminus to last. */
        stops: z.array(StopSchema).min(2),
      }),
    )
    .length(3),
  underConstruction: z.string().optional(),
  stations: z.record(slug, StationSchema),
  nativeReviewed: reviewed,
});

/* ---------- Lexicon and case-lens functions ---------- */

const cellKey = z.string().regex(/^(nom|gen|dat|acc|voc|loc|ins)\.(sg|pl)$/, 'cells are "<case>.<sg|pl>", e.g. "gen.pl"');

export const NounSchema = z.object({
  lemma: z.string().min(1),
  en: z.string().min(1),
  gender: GenderSchema,
  /** A noun table id (content/grammar/tables/nouns.json) or "irregular" (then every form is listed). */
  vzor: z.string().min(1),
  stem: z.string().optional(),
  number: z.enum(['sg', 'pl']).optional(),
  forms: z.record(cellKey, z.string().min(1)).optional(),
  /** Forms not fully checked: mismatches are warnings, not errors. */
  uncertain: z.boolean().optional(),
  note: z.string().optional(),
  nativeReviewed: reviewed,
});

export const LexiconSchema = z.object({ $comment: z.string().optional(), nouns: z.array(NounSchema) });

export const GrammarFunctionSchema = z.object({
  id,
  case: z.enum(CASE_KEYS),
  /** Short label shown in the lens, e.g. "after z (from)". */
  label: z.string().min(1),
  /** Why: one or two sentences. */
  explain: z.string().min(1),
  example: z.object({ cs: z.string().min(1), en: z.string().min(1) }),
  /** Czech words that trigger it (prepositions, verbs). */
  triggers: z.array(z.string()).default([]),
});

export const FunctionsFileSchema = z.object({
  $comment: z.string().optional(),
  functions: z.array(GrammarFunctionSchema).min(1),
  nativeReviewed: reviewed,
});

/* ---------- Overheard in Prague (listening scenes) ---------- */

/** Where a line's wording comes from, when it's an official text (announcements). */
const VerifiedSchema = z.object({ source: z.string().min(1), url: z.string().url(), date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) });

export const OverheardLineSchema = z.object({
  speaker: z.string().min(1),
  /** Standard Czech (case-lens markup allowed). */
  cs: z.string().min(1),
  /** How it's actually said, if different (obecná čeština). */
  spoken: z.string().optional(),
  en: z.string().min(1),
  /** Recording id in content/audio/manifest.json, once a real recording exists. */
  audio: z.string().optional(),
  /** For official wording (e.g. PID announcements): where it was checked. Absent = not an official text, or not verified. */
  verified: VerifiedSchema.optional(),
  /** For lines that imitate an official text we could NOT verify. */
  unverifiedNote: z.string().optional(),
  nativeReviewed: reviewed,
});

export const OverheardSceneSchema = z.object({
  id,
  title: z.string().min(1),
  titleCs: z.string().min(1),
  /** Where you are, in English. */
  setting: z.string().min(1),
  kind: z.enum(['transport', 'shop', 'pub', 'health', 'work']),
  order: z.number().default(0),
  lines: z.array(OverheardLineSchema).min(2),
  /** A short "good to know" for after the scene. */
  note: z.string().optional(),
  /** 2–3 comprehension questions (multiple choice). */
  questions: z.array(z.lazy(() => MultipleChoiceExerciseSchema)).min(2).max(3),
  nativeReviewed: reviewed,
});

/* ---------- Name days and audio ---------- */

export const NamedaysSchema = z.object({
  $comment: z.string().optional(),
  source: z.object({ title: z.string(), url: z.string().url(), licence: z.string(), retrieved: z.string() }),
  verify: z.array(z.object({ date: z.string().regex(/^\d{2}-\d{2}$/), note: z.string() })).default([]),
  days: z.record(z.string().regex(/^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/), z.array(z.string().min(1)).min(1)),
  nativeReviewed: reviewed,
});

export const HolidaysSchema = z.object({
  $comment: z.string().optional(),
  source: z.object({ title: z.string(), checked: z.string() }),
  verified: z.array(z.object({ source: z.string(), url: z.string().url(), date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) })).default([]),
  shopsNote: z.string().optional(),
  holidays: z
    .array(
      z.object({
        id,
        /** MM-DD, or easter-2 (Good Friday) / easter+1 (Easter Monday). */
        date: z.string().regex(/^((0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])|easter[+-]\d)$/),
        cs: z.string().min(1),
        en: z.string().min(1),
        about: z.string().min(1),
        shops: z.enum(['closed', 'noon', 'open']),
        greeting: z.object({ cs: z.string(), en: z.string() }).optional(),
      }),
    )
    .min(1),
  nativeReviewed: reviewed,
});

export const HolidayLessonSchema = z.object({
  id,
  /** Holiday ids (calendar/holidays.json) this lesson prepares for. */
  holidays: z.array(z.string()).min(1),
  title: z.string().min(1),
  titleCs: z.string().min(1),
  intro: z.string().min(1),
  whatPeopleDo: z.array(z.string().min(1)).min(1),
  greetings: z.array(z.object({ cs: z.string().min(1), en: z.string().min(1), note: z.string().optional() })).default([]),
  etiquette: z.array(z.string().min(1)).default([]),
  vocab: z.array(VocabItemSchema).default([]),
  exercises: z.array(z.lazy(() => ExerciseSchema)).min(3),
  nativeReviewed: reviewed,
});

export const HolidayLessonsSchema = z.object({ $comment: z.string().optional(), lessons: z.array(HolidayLessonSchema), nativeReviewed: reviewed });

const Verified = z.object({ source: z.string().min(1), url: z.string().url(), date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) });

export const EmergencyNumbersSchema = z.object({
  $comment: z.string().optional(),
  numbers: z.array(z.object({ id: z.string(), number: z.string().regex(/^\d{3}$/), cs: z.string(), en: z.string(), note: z.string().optional(), verified: z.array(Verified).min(1) })),
  nativeReviewed: reviewed,
});

const EmergencyPhrase = z.object({ cs: z.string().min(1), en: z.string().min(1), nativeReviewed: reviewed });

export const EmergencyCardsSchema = z.object({
  $comment: z.string().optional(),
  cards: z.array(
    z.object({
      id,
      title: z.string().min(1),
      titleCs: z.string().min(1),
      intro: z.string().min(1),
      /** Ids from numbers.json. */
      numbers: z.array(z.string()),
      /** Large "Show to a Czech" screens, one message each. */
      show: z.array(EmergencyPhrase).min(1),
      phrases: z.array(EmergencyPhrase).min(1),
      expect: z.array(z.string()).default([]),
      /** Other verified contacts, e.g. lost and found. */
      contacts: z.array(z.object({ label: z.string(), tel: z.string().regex(/^\+?\d+$/), display: z.string(), verified: Verified })).default([]),
    }),
  ),
  nativeReviewed: reviewed,
});

export const IdiomsSchema = z.object({
  $comment: z.string().optional(),
  idioms: z
    .array(
      z.object({
        id,
        cs: z.string().min(1),
        /** Word for word. */
        literal: z.string().min(1),
        meaning: z.string().min(1),
        /** The dictionary's own definition, quoted. */
        definitionCs: z.string().min(1),
        /** Dictionary label, e.g. "expr.", "hovor.", "pořek.". */
        label: z.string().optional(),
        /** Closest real English idiom; left out when there isn't one. */
        english: z.string().optional(),
        example: z.object({ cs: z.string().min(1), en: z.string().min(1) }),
        source: z.object({ dictionaries: z.array(z.enum(['SSČ', 'SSJČ'])).min(1), url: z.string().url(), date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) }),
        nativeReviewed: reviewed,
      }),
    )
    .min(1),
});

export const PhrasesSchema = z.object({
  $comment: z.string().optional(),
  situations: z
    .array(
      z.object({
        id,
        title: z.string().min(1),
        titleCs: z.string().min(1),
        phrases: z
          .array(
            z.object({
              id,
              cs: z.string().min(1),
              en: z.string().min(1),
              /** Accepted typed answers (answer patterns); defaults to `cs` with optional final punctuation. */
              answers: z.array(z.string().min(1)).optional(),
              note: z.string().optional(),
              /** Where it comes from: the official A1 inventory entry, a lesson, a guide, or ours. */
              source: z.discriminatedUnion('kind', [
                z.object({ kind: z.literal('inventory'), ref: z.string().min(1) }),
                z.object({ kind: z.literal('lesson'), ref: z.string().min(1) }),
                z.object({ kind: z.literal('guide'), ref: z.string().min(1) }),
                z.object({ kind: z.literal('ours') }),
              ]),
              nativeReviewed: reviewed,
            }),
          )
          .min(3),
      }),
    )
    .min(1),
});

/**
 * Real-speaker recordings (D6). Files live in public/audio/<id>.<ext>.
 * Exercises that need a recording stay hidden until it is listed here.
 */
export const AudioManifestSchema = z.object({
  $comment: z.string().optional(),
  recordings: z.array(
    z.object({
      id: z.string().regex(/^[a-z0-9][a-z0-9-]*$/),
      file: z.string().regex(/^[a-z0-9][a-z0-9-]*\.(mp3|m4a|ogg|opus|wav)$/),
      /** What is said, exactly. */
      cs: z.string().min(1),
      speaker: z.string().min(1),
      licence: z.string().min(1),
    }),
  ),
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
export type Noun = z.infer<typeof NounSchema>;
export type Gender = z.infer<typeof GenderSchema>;
export type Mission = z.infer<typeof MissionSchema>;
export type NamedaysData = z.infer<typeof NamedaysSchema>;
export type OverheardScene = z.infer<typeof OverheardSceneSchema>;
export type HolidayLesson = z.infer<typeof HolidayLessonSchema>;
export type EmergencyNumbers = z.infer<typeof EmergencyNumbersSchema>;
export type EmergencyCards = z.infer<typeof EmergencyCardsSchema>;
export type PhraseSituation = z.infer<typeof PhrasesSchema>['situations'][number];
export type DeckPhrase = PhraseSituation['phrases'][number];
export type Idiom = z.infer<typeof IdiomsSchema>['idioms'][number];
export type HolidaysData = z.infer<typeof HolidaysSchema>;
export type Holiday = HolidaysData['holidays'][number];
export type AudioManifest = z.infer<typeof AudioManifestSchema>;
export type GrammarFunction = z.infer<typeof GrammarFunctionSchema>;
export type LinesData = z.infer<typeof LinesSchema>;
export type StopData = z.infer<typeof StopSchema>;
export type StationData = z.infer<typeof StationSchema>;
