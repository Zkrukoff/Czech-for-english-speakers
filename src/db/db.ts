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
  /** Today's ride: the learner's usual commute, as station slugs (content/lines/lines.json). */
  rideFrom?: string;
  rideTo?: string;
  /** Ticket streaks on Home and in the wallet (A7). Undefined means on. */
  showTicket?: boolean;
  /** Days ("YYYY-MM-DD", 04:00 boundary) the learner announced a výluka for. */
  vylukaDays?: string[];
  /** First day (04:00 Prague) the 5-answer ticket rule applied on this device; earlier days keep the 1-answer rule. */
  ticketRuleFrom?: string;
  /** Days on which the review queue was emptied (they validate the ticket too). Last 60 kept. */
  reviewClearedDays?: string[];
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
  context: 'lesson' | 'unitCheck' | 'review' | 'alphabet' | 'guide' | 'overheard';
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

/** Who the learner is (one row, id "me"). Created in onboarding, or inferred for existing learners. */
export interface Profile {
  id: 'me';
  /** Why they're learning, from onboarding. */
  who?: 'work' | 'partner' | 'study' | 'living' | 'other';
  /** Self-assessed starting level. */
  level?: 'new' | 'A1' | 'A2' | 'B1';
  /** Line/station key of their real-life home stop, e.g. "A/jiriho-z-podebrad" (optional, for flavour). */
  homeStation?: string;
  /** Has seen the vykání / tykání introduction. */
  vykaniIntroSeen: boolean;
  /** When onboarding finished (or the profile was inferred). */
  onboardedAt: number;
  /** True when created from existing progress instead of onboarding. */
  inferred: boolean;
}

/** A mission the learner says they've done. */
export interface MissionRecord {
  missionId: string;
  unitId: string;
  doneAt: number;
}

/** A stamp in the ticket wallet. Ids are deterministic, so awarding is idempotent. */
export interface Stamp {
  /** "unit:u01", "milestone:vaclavak:check", "mission:u01-m1" */
  id: string;
  kind: 'unit' | 'milestone' | 'mission';
  refId: string;
  at: number;
}

/** A word or phrase the learner saved from daily life. Reviewed as "own:<id>". */
export interface OwnWord {
  id?: number;
  cs: string;
  en?: string;
  note?: string;
  /** Where they saw or heard it. */
  place?: string;
  /** Link to a lexicon noun (with vzor) or verb entry; guessed = chosen by hand from a suggestion. */
  link?: { kind: 'noun'; lemma: string; vzor: string; gender: 'm-anim' | 'm-inan' | 'f' | 'n'; guessed?: boolean } | { kind: 'verb'; lemma: string };
  createdAt: number;
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
export const DATA_TABLES = ['settings', 'attempts', 'cards', 'lessonProgress', 'goalProgress', 'profile', 'missions', 'stamps', 'ownWords'] as const;

/** The tables that existed in schema v1 (and in the legacy database). */
export const V1_TABLES = ['settings', 'attempts', 'cards', 'lessonProgress', 'goalProgress'] as const;

export class PrazakDB extends Dexie {
  settings!: EntityTable<Settings, 'id'>;
  attempts!: EntityTable<Attempt, 'id'>;
  cards!: EntityTable<ReviewCard, 'itemKey'>;
  lessonProgress!: EntityTable<LessonProgress, 'lessonId'>;
  goalProgress!: EntityTable<GoalProgress, 'goalId'>;
  meta!: EntityTable<MetaEntry, 'key'>;
  profile!: EntityTable<Profile, 'id'>;
  missions!: EntityTable<MissionRecord, 'missionId'>;
  stamps!: EntityTable<Stamp, 'id'>;
  ownWords!: EntityTable<OwnWord, 'id'>;

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
    // v2 (Pražák phase 3): additive only. Existing tables and rows are untouched;
    // the profile and wallet stamps of existing learners are filled in by
    // ensureProfile() from their progress (src/db/profile.ts).
    this.version(2).stores({
      profile: 'id',
      missions: 'missionId, unitId, doneAt',
      stamps: 'id, kind, at',
    });
    // v3 (round 2): additive. Words the learner saves themselves.
    this.version(3).stores({
      ownWords: '++id, createdAt',
    });
  }
}

export const db = new PrazakDB();
