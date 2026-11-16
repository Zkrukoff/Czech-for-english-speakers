import type { Exercise } from '@/content/schema';
import { expandPattern, expandPatterns } from './patterns';
import { stripDiacritics } from '../text';

/**
 * Answer checking.
 *
 * 1. Normalise: NFC, lower case, collapse whitespace, ignore punctuation
 *    (commas, full stops, question marks…) and typographic quotes.
 * 2. Exact match with an accepted answer          → "correct"
 * 3. Match only once diacritics are removed:
 *      - default                                  → "diacritics" (accepted, flagged)
 *      - strict setting or exercise.diacriticsMatter → "incorrect", flagged as a diacritics error
 * 4. A specific wrong answer listed in `hints`    → "incorrect" with that explanation
 * 5. Anything else                                → "incorrect" with the exercise's `why`
 */

export type CheckStatus = 'correct' | 'diacritics' | 'incorrect';

export interface DiffChar {
  ch: string;
  /** True when the learner's character differed (missing/wrong háček or čárka). */
  wrong: boolean;
}

export interface CheckResult {
  status: CheckStatus;
  /** True if the answer was accepted (correct, or diacritics-only slip in tolerant mode). */
  accepted: boolean;
  /** The answer to show the learner: the accepted answer closest to what they typed. */
  expected: string;
  /** Explanation to show when the answer is not exactly right. */
  explanation?: string;
  /** Whether a specific hint matched (vs. the generic `why`). */
  hintMatched: boolean;
  /** The only problem is diacritics (whether or not it was accepted). */
  diacriticsOnly: boolean;
  /** Character diff of `expected`, marking where the learner's diacritics differed. */
  diff?: DiffChar[];
}

export interface CheckOptions {
  strictDiacritics: boolean;
}

const PUNCTUATION = /[.,!?;:…"„“”«»()[\]–—-]/g;

export function normalize(s: string): string {
  return s
    .normalize('NFC')
    .toLowerCase()
    .replace(/[’‘`´]/g, "'")
    .replace(PUNCTUATION, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function loose(s: string): string {
  return stripDiacritics(normalize(s));
}

/** Levenshtein distance, used only to pick which accepted answer to display. */
export function editDistance(a: string, b: string): number {
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let diag = prev[0]!;
    prev[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = prev[j]!;
      prev[j] = Math.min(prev[j]! + 1, prev[j - 1]! + 1, diag + (a[i - 1] === b[j - 1] ? 0 : 1));
      diag = tmp;
    }
  }
  return prev[b.length]!;
}

/**
 * Mark the characters of `expected` that the learner got wrong, assuming the
 * two strings are equal once diacritics and punctuation are ignored. Letters
 * are aligned in order; punctuation and spaces in `expected` are never marked.
 */
export function diacriticDiff(expected: string, answer: string): DiffChar[] {
  const userLetters = [...normalize(answer).replace(/\s/g, '')];
  let k = 0;
  return [...expected.normalize('NFC')].map((ch) => {
    const lower = ch.toLowerCase();
    if (!/\p{L}/u.test(ch)) return { ch, wrong: false };
    const u = userLetters[k++];
    return { ch, wrong: u !== undefined && u !== lower };
  });
}

/** Pick the accepted answer that looks most like what the learner typed. */
function closest(candidates: string[], answer: string): string {
  const target = loose(answer);
  let best = candidates[0] ?? '';
  let bestD = Infinity;
  for (const c of candidates) {
    const d = editDistance(loose(c), target);
    if (d < bestD) {
      best = c;
      bestD = d;
    }
  }
  return best;
}

const expansionCache = new WeakMap<Exercise, string[]>();

/** Accepted answers for an exercise, fully expanded, in display form (cached per exercise). */
export function acceptedAnswers(exercise: Exercise): string[] {
  let answers = expansionCache.get(exercise);
  if (!answers) {
    answers = expandPatterns(exercise.answers);
    expansionCache.set(exercise, answers);
  }
  return answers;
}

/** For fill-in-the-ending, the letters right before "___" (e.g. "káv" in "Dám si káv___"). */
function fillEndingStem(exercise: Exercise): string | undefined {
  if (exercise.type !== 'fillEnding') return undefined;
  return /(\p{L}+)___/u.exec(exercise.prompt)?.[1];
}

export function checkAnswer(exercise: Exercise, rawAnswer: string, options: CheckOptions): CheckResult {
  const answer = rawAnswer.trim();
  // Fill-in-the-ending: learners may type the ending ("u") or the whole word
  // ("kávu"); both are accepted, and feedback always shows the whole word.
  const stem = fillEndingStem(exercise);
  const endings = acceptedAnswers(exercise);
  const display = stem ? endings.map((e) => stem + e) : endings;
  const accepted = stem ? [...endings, ...display] : endings;
  const strict = options.strictDiacritics || exercise.diacriticsMatter === true;

  const n = normalize(answer);
  const l = loose(answer);

  // Empty answer: just show the answer.
  if (!n) {
    return {
      status: 'incorrect',
      accepted: false,
      expected: display[0] ?? '',
      explanation: exercise.why,
      hintMatched: false,
      diacriticsOnly: false,
    };
  }

  // 1. Exact match.
  const exact = accepted.find((a) => normalize(a) === n);
  if (exact !== undefined) {
    const shown = display.find((d) => normalize(d) === n) ?? (stem ? stem + exact : exact);
    return { status: 'correct', accepted: true, expected: shown, hintMatched: false, diacriticsOnly: false };
  }

  // 2. Specific wrong answers with their own explanation. A hint also matches
  //    when only the learner's diacritics differ from it ("Dam si kava"),
  //    unless the answer is a diacritics-only variant of an accepted answer.
  const acceptedLoose = new Set(accepted.map(loose));
  for (const hint of exercise.hints) {
    const variants = expandPattern(hint.wrong);
    const exact = variants.some((v) => normalize(v) === n);
    const looseHit = variants.some((v) => loose(v) === l) && !acceptedLoose.has(l);
    if (exact || looseHit) {
      return {
        status: 'incorrect',
        accepted: false,
        expected: closest(display, answer),
        explanation: hint.explain,
        hintMatched: true,
        diacriticsOnly: false,
      };
    }
  }

  // 3. Diacritics-only difference.
  const looseMatch = accepted.find((a) => loose(a) === l);
  if (looseMatch) {
    // Show the full display form (not the bare ending) when they typed the whole word.
    const typedWholeWord = display.find((d) => loose(d) === l);
    const shown = typedWholeWord ?? (stem ? stem + looseMatch : looseMatch);
    // If only the ending was typed, compare it with the ending and leave the stem unmarked.
    const diff =
      typedWholeWord || !stem
        ? diacriticDiff(shown, answer)
        : [...[...stem].map((ch) => ({ ch, wrong: false })), ...diacriticDiff(looseMatch, answer)];
    return {
      status: strict ? 'incorrect' : 'diacritics',
      accepted: !strict,
      expected: shown,
      explanation: strict
        ? exercise.diacriticsMatter
          ? `Here the accents change the word, so they have to be exact. ${exercise.why}`
          : 'Only the diacritics (háčky and čárky) are different. You have "require exact diacritics" turned on in Settings.'
        : undefined,
      hintMatched: false,
      diacriticsOnly: true,
      diff,
    };
  }

  // 4. Plain wrong answer.
  return {
    status: 'incorrect',
    accepted: false,
    expected: closest(display, answer),
    explanation: exercise.why,
    hintMatched: false,
    diacriticsOnly: false,
  };
}
