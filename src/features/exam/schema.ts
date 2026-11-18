import { z } from 'zod';

/**
 * The A2 permanent-residence exam in its new format (from 11 April 2026), as
 * read task by task in NPI ČR's online mock test on 18 November 2026. Our own
 * tasks follow this shape exactly; the official tasks are linked, never copied.
 */
export const PARTS = ['reading', 'writing', 'listening', 'speaking'] as const;
export type Part = (typeof PARTS)[number];

export const PART_INFO: Record<Part, { en: string; cs: string; minutes: number; points: number; about?: string }> = {
  reading: { en: 'Reading', cs: 'Čtení', minutes: 40, points: 25 },
  writing: { en: 'Writing', cs: 'Psaní', minutes: 25, points: 20 },
  listening: { en: 'Listening', cs: 'Poslech', minutes: 40, points: 25, about: 'about 40 minutes, set by the recording' },
  // The four speaking tasks add up to 37 points; the official total is 40. The
  // mock test doesn't say where the other 3 come from, so we score only 37.
  speaking: { en: 'Speaking', cs: 'Mluvení', minutes: 15, points: 37, about: 'about 15 minutes' },
};

/** Pass rules [Official]: 42 of 70 in the written parts, and 24 of 40 in speaking. */
export const WRITTEN_PASS = 42;
export const WRITTEN_MAX = 70;
export const SPEAKING_PASS = 24;
export const SPEAKING_OFFICIAL_MAX = 40;

export type Kind = 'match' | 'choice' | 'fill' | 'form' | 'email' | 'interview' | 'roleplay' | 'story' | 'agree';

/** The official shape of each task: what kind, how many items, how many extra options, points. */
export const TASK_SHAPE: Record<Part, Record<number, { kind: Kind; items: number; extras?: number; points: number; en: string; cs: string; seconds?: number }>> = {
  reading: {
    1: { kind: 'match', items: 5, extras: 3, points: 5, en: 'Pictures and notices', cs: 'Obrázky a oznámení' },
    2: { kind: 'choice', items: 5, points: 5, en: 'One text, five questions', cs: 'Text a otázky' },
    3: { kind: 'match', items: 4, extras: 1, points: 4, en: 'Texts and people', cs: 'Texty a osoby' },
    4: { kind: 'choice', items: 6, points: 6, en: 'Short texts with a gap', cs: 'Krátké texty' },
    5: { kind: 'fill', items: 5, points: 5, en: 'Find the information', cs: 'Doplňte informace' },
  },
  writing: {
    1: { kind: 'form', items: 3, points: 8, en: 'A form', cs: 'Formulář' },
    2: { kind: 'email', items: 5, points: 12, en: 'An e-mail', cs: 'E-mail' },
  },
  listening: {
    1: { kind: 'choice', items: 5, points: 5, en: 'Short dialogues', cs: 'Krátké dialogy' },
    2: { kind: 'choice', items: 5, points: 5, en: 'Announcements', cs: 'Hlášení a oznámení' },
    3: { kind: 'match', items: 5, extras: 2, points: 5, en: 'Match to a table', cs: 'Tabulka' },
    4: { kind: 'match', items: 5, extras: 1, points: 5, en: 'Dialogues and pictures', cs: 'Dialogy a obrázky' },
    5: { kind: 'fill', items: 5, points: 5, en: 'A voicemail', cs: 'Hlasová zpráva' },
  },
  speaking: {
    1: { kind: 'interview', items: 8, points: 8, en: 'Answer questions', cs: 'Odpovědi na otázky', seconds: 7 },
    2: { kind: 'roleplay', items: 2, points: 12, en: 'Ask for information', cs: 'Dialogy', seconds: 90 },
    3: { kind: 'story', items: 4, points: 10, en: 'A story from pictures', cs: 'Vyprávění podle obrázků', seconds: 60 },
    4: { kind: 'agree', items: 3, points: 7, en: 'Agree with a friend', cs: 'Řešení situace', seconds: 15 },
  },
};

/** Preview time before each listening task [Official]: 1 minute, or 15 seconds for tables and pictures. */
export const LISTEN_PREVIEW_S: Record<number, number> = { 1: 60, 2: 60, 3: 15, 4: 15, 5: 60 };
export const WORD_MIN = { formAnswer: 10, email: 35 } as const;

const cs = z.string().min(1);
const Audio = z.array(z.object({ speaker: z.enum(['a', 'b']).default('a'), cs })).min(1);
export type ExamAudio = z.infer<typeof Audio>;

const Base = {
  $comment: z.string().optional(),
  id: z.string().regex(/^[a-z0-9-]+$/),
  part: z.enum(PARTS),
  task: z.number().int().min(1).max(5),
  /** Two practice sets, and one set inside each of the two mock exams. */
  use: z.enum(['practice1', 'practice2', 'mock1', 'mock2']),
  title: z.string().optional(),
  nativeReviewed: z.boolean().default(false),
};

const Match = z.object({
  ...Base,
  kind: z.literal('match'),
  instruction: cs,
  instructionEn: cs,
  /** Shown above the options, e.g. "Který sport teď dělají ty ženy?" */
  question: z.string().optional(),
  items: z.array(z.object({ id: z.string(), text: z.string().optional(), audio: Audio.optional(), picture: z.string().optional(), label: z.string().optional() })),
  options: z.array(z.object({ id: z.string().regex(/^[A-H]$/), text: z.string().optional(), picture: z.string().optional() })),
  answers: z.record(z.string(), z.string()),
});

const Choice = z.object({
  ...Base,
  kind: z.literal('choice'),
  instruction: cs,
  instructionEn: cs,
  /** One text for all the questions (reading 2). */
  text: z.string().optional(),
  questions: z.array(z.object({
    q: z.string(),
    /** A text or recording of its own (reading 4, listening 1–2). */
    text: z.string().optional(),
    audio: Audio.optional(),
    options: z.array(cs).length(4),
    answer: z.number().int().min(0).max(3),
    why: z.string().optional(),
  })),
});

const Fill = z.object({
  ...Base,
  kind: z.literal('fill'),
  instruction: cs,
  instructionEn: cs,
  text: z.string().optional(),
  audio: Audio.optional(),
  questions: z.array(z.object({ q: cs, answers: z.array(cs).min(1), suffix: z.string().optional() })),
});

const Form = z.object({
  ...Base,
  kind: z.literal('form'),
  situation: cs,
  situationEn: cs,
  heading: cs,
  questions: z.array(z.object({ q: cs, model: cs })),
});

const Email = z.object({
  ...Base,
  kind: z.literal('email'),
  situation: cs,
  situationEn: cs,
  to: cs,
  subject: cs,
  prompts: z.array(z.object({ cs, picture: z.string() })),
  model: cs,
});

const Interview = z.object({
  ...Base,
  kind: z.literal('interview'),
  topics: z.array(z.object({ topic: cs, topicEn: cs, questions: z.array(z.object({ q: cs, model: cs })).length(4) })).length(2),
});

const Roleplay = z.object({
  ...Base,
  kind: z.literal('roleplay'),
  cards: z.array(z.object({
    situation: cs,
    situationEn: cs,
    /** Four cues; the last is the learner's own question. */
    cues: z.array(cs).length(4),
    model: z.array(z.object({ who: z.enum(['examiner', 'you']), cs })).min(8),
  })).length(2),
});

const Story = z.object({
  ...Base,
  kind: z.literal('story'),
  heading: cs,
  question: cs,
  panels: z.array(z.string()).length(4),
  /** Alt text per panel: says what's shown, in English, without giving away the Czech. */
  panelsAlt: z.array(cs).length(4),
  model: cs,
});

const Agree = z.object({
  ...Base,
  kind: z.literal('agree'),
  situation: cs,
  situationEn: cs,
  options: z.array(z.object({ picture: z.string(), en: cs })).length(3),
  /** What the friend says, and a model reply (you tykáte). */
  turns: z.array(z.object({ friend: cs, model: cs })).min(3),
});

export const ExamTaskSchema = z.discriminatedUnion('kind', [Match, Choice, Fill, Form, Email, Interview, Roleplay, Story, Agree]);
export type ExamTask = z.infer<typeof ExamTaskSchema>;
export type MatchTask = z.infer<typeof Match>;
export type ChoiceTask = z.infer<typeof Choice>;
export type FillTask = z.infer<typeof Fill>;
export type FormTask = z.infer<typeof Form>;
export type EmailTask = z.infer<typeof Email>;
export type InterviewTask = z.infer<typeof Interview>;
export type RoleplayTask = z.infer<typeof Roleplay>;
export type StoryTask = z.infer<typeof Story>;
export type AgreeTask = z.infer<typeof Agree>;

export const ExamFileSchema = z.object({ $comment: z.string().optional(), tasks: z.array(ExamTaskSchema) });

/** A short warm-up drill (exercises in the course's own format) before speaking task 3. */
export const WarmupFileSchema = z.object({ $comment: z.string().optional(), warmup: z.array(z.unknown()) });
