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

export class CzechDB extends Dexie {
  settings!: EntityTable<Settings, 'id'>;
  attempts!: EntityTable<Attempt, 'id'>;
  cards!: EntityTable<ReviewCard, 'itemKey'>;
  lessonProgress!: EntityTable<LessonProgress, 'lessonId'>;
  goalProgress!: EntityTable<GoalProgress, 'goalId'>;

  constructor(name = 'czech-for-english-speakers') {
    super(name);
    this.version(1).stores({
      settings: 'id',
      attempts: '++id, itemKey, exerciseId, *skills, timestamp',
      cards: 'itemKey, due, *skills',
      lessonProgress: 'lessonId',
      goalProgress: 'goalId, unitId',
    });
  }
}

export const db = new CzechDB();
