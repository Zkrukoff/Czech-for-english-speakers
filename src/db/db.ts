import Dexie, { type EntityTable } from 'dexie';

/** All learner data lives in this browser's IndexedDB. No server, no account. */

export interface Settings {
  id: 'app';
  /** When true, answers missing háčky/čárky are marked wrong instead of accepted-with-flag. */
  strictDiacritics: boolean;
  /** Speech rate for text-to-speech, 0.5–1.5. */
  speechRate: number;
  /** Preferred cs-CZ voice (SpeechSynthesisVoice.voiceURI). */
  voiceURI?: string;
  /** Show colloquial (obecná čeština) notes. */
  showSpokenForms: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  id: 'app',
  strictDiacritics: false,
  speechRate: 0.9,
  showSpokenForms: true,
};

export interface Attempt {
  id?: number;
  /** Exercise id or review item key. */
  itemKey: string;
  exerciseId?: string;
  skills: string[];
  correct: boolean;
  /** Accepted but with missing/wrong diacritics. */
  diacriticSlip: boolean;
  answer: string;
  context: 'lesson' | 'unitCheck' | 'review' | 'alphabet' | 'guide';
  timestamp: number;
}

/** Spaced-repetition card state (FSRS fields are stored as plain data). */
export interface ReviewCard {
  /** e.g. "ex:u02-l01-e1" or "vocab:v-kava:en-cs" */
  itemKey: string;
  skills: string[];
  due: number;
  stability: number;
  difficulty: number;
  elapsedDays: number;
  scheduledDays: number;
  learningSteps: number;
  reps: number;
  lapses: number;
  state: number;
  lastReview?: number;
}

export interface LessonProgress {
  lessonId: string;
  completedAt?: number;
  /** Highest step reached: explanation, vocab, dialogue, practice. */
  stepsDone: string[];
}

export interface GoalProgress {
  goalId: string;
  unitId: string;
  completedAt?: number;
  bestScore: number;
}

/** Internal bookkeeping, e.g. whether the one-time copy from the old database has run. */
export interface MetaEntry {
  key: string;
  value: unknown;
}

/** The learner database. ASCII identifier, as for every other identifier in the app. */
export const DB_NAME = 'prazak';

/**
 * Databases used by earlier versions of the app (before the rename to Pražák).
 * Their data is copied into DB_NAME once, on first load (see migrate.ts).
 * They are never deleted, so a failed copy can't lose anything.
 */
export const LEGACY_DB_NAMES = ['czech-for-english-speakers'] as const;

/** The tables that hold learner data, in the order they are copied and backed up. */
export const DATA_TABLES = ['settings', 'attempts', 'cards', 'lessonProgress', 'goalProgress'] as const;

export class PrazakDB extends Dexie {
  settings!: EntityTable<Settings, 'id'>;
  attempts!: EntityTable<Attempt, 'id'>;
  cards!: EntityTable<ReviewCard, 'itemKey'>;
  lessonProgress!: EntityTable<LessonProgress, 'lessonId'>;
  goalProgress!: EntityTable<GoalProgress, 'goalId'>;
  meta!: EntityTable<MetaEntry, 'key'>;

  constructor(name: string = DB_NAME) {
    super(name);
    // Same stores as the legacy database (schema v1), plus `meta`.
    this.version(1).stores({
      settings: 'id',
      attempts: '++id, itemKey, exerciseId, *skills, timestamp',
      cards: 'itemKey, due, *skills',
      lessonProgress: 'lessonId',
      goalProgress: 'goalId, unitId',
      meta: 'key',
    });
  }
}

export const db = new PrazakDB();
