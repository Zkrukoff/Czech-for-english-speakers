import type { Course } from '@/content/loader';
import type { Exercise, VocabItem } from '@/content/schema';
import type { CellKey } from '@/lib/lens';
import { vzorDrill } from '@/lib/drills/vzor';

/**
 * Turns review cards back into exercises.
 *   "ex:<id>"    → the original lesson/unit-check exercise
 *   "vocab:<id>" → a generated English → Czech translation of the word
 *   "pattern:…" / "fn:…" → an exercise that practises that ending or case use
 */

/** Vocabulary that works as a flashcard (lists like "jeden, dva, tři" don't). */
export function reviewableVocab(items: VocabItem[]): VocabItem[] {
  return items.filter((v) => !v.cs.includes(', '));
}

const PATTERN_CHARS = /[[\]{}|]/g;

/**
 * Accepted answers for a vocabulary card. "kamarád / kamarádka" accepts
 * either form (or both); "stát (stojí)" accepts "stát".
 */
export function vocabAnswers(cs: string): string[] {
  const clean = cs.replace(/\s*\([^)]*\)/g, '').replace(PATTERN_CHARS, '').trim();
  const parts = clean.split(/\s+\/\s+/).map((p) => p.trim()).filter(Boolean);
  return [...new Set([...parts, clean])];
}

/** The separate meanings in an English gloss: "hi; bye (informal)" → ["hi", "bye"]. */
export function glosses(en: string): string[] {
  return en
    .replace(/\([^)]*\)/g, '')
    .split(/[;,/]/)
    .map((g) => g.trim().toLowerCase().replace(/^to /, '').replace(/[.!?]+$/, ''))
    .filter(Boolean);
}

/**
 * A vocabulary flashcard (English → Czech). Words elsewhere in the course
 * that share a meaning ("ahoj" and "čau" both mean "hi; bye") get a hint, so
 * a learner who types the other word is told why it isn't the one wanted.
 */
export function vocabExercise(item: VocabItem, allVocab: VocabItem[] = []): Exercise {
  const extra = item.notes ? ` ${item.notes}` : '';
  const mine = new Set(glosses(item.en));
  const ownAnswers = new Set(vocabAnswers(item.cs).map((a) => a.toLowerCase()));
  const hints = allVocab
    .filter((o) => o.id !== item.id && glosses(o.en).some((g) => mine.has(g)))
    .flatMap((o) =>
      vocabAnswers(o.cs)
        .filter((a) => !ownAnswers.has(a.toLowerCase()))
        .map((a) => ({ wrong: a, explain: `${a} means "${o.en}". Here the word for "${item.en}" is ${item.cs}.` })),
    );
  return {
    id: `vocab-${item.id}`,
    type: 'translate',
    direction: 'en-cs',
    prompt: item.en,
    answers: vocabAnswers(item.cs),
    why: `"${item.en}" is ${item.cs}.${extra}`,
    hints,
    skills: [`vocab:${item.id}`],
    nativeReviewed: item.nativeReviewed,
  };
}

/**
 * The exercise for a card, or null if its content no longer exists.
 * Pattern and function cards ("pattern:…", "fn:…") are reviewed through an
 * exercise that practises them; `rotation` (e.g. the card's rep count) picks
 * a different one each time, so the learner sees the pattern in new sentences.
 */
export function exerciseForCard(itemKey: string, course: Course, rotation = 0): Exercise | null {
  if (itemKey.startsWith('pattern:') || itemKey.startsWith('fn:')) {
    const ids = course.exercisesByLensKey.get(itemKey) ?? [];
    if (!ids.length) {
      // No annotated sentence for this ending yet: drill it on a lexicon noun that follows the pattern.
      const m = /^pattern:([^:]+):([a-z]{3}\.(?:sg|pl))$/.exec(itemKey);
      if (!m) return null;
      const nouns = [...course.lexicon.values()].filter((e) => e.noun.vzor === `noun-${m[1]}` && !e.noun.uncertain && e.paradigm[m[2] as CellKey]);
      const e = nouns[rotation % Math.max(1, nouns.length)];
      return e ? vzorDrill(e.noun, e.paradigm, m[2] as CellKey) : null;
    }
    return course.exercisesById.get(ids[rotation % ids.length]!)?.exercise ?? null;
  }
  if (itemKey.startsWith('ex:')) return course.exercisesById.get(itemKey.slice(3))?.exercise ?? null;
  if (itemKey.startsWith('vocab:')) {
    const v = course.vocabById.get(itemKey.slice(6));
    return v ? vocabExercise(v.item, [...course.vocabById.values()].map((x) => x.item)) : null;
  }
  return null;
}

/** Strip answer-pattern syntax from learner-typed text, so it's matched literally. */
const literal = (t: string) => t.replace(/[[\]{}|]/g, '').trim();

/**
 * A saved word as a review exercise: English → Czech when it has a meaning,
 * otherwise a self-graded recall card.
 */
export function ownWordExercise(word: { id?: number; cs: string; en?: string; note?: string; place?: string }): Exercise {
  const extra = [word.note, word.place && `Seen: ${word.place}`].filter(Boolean).join('\n');
  if (word.en?.trim()) {
    return {
      id: `own-${word.id}`,
      type: 'translate',
      direction: 'en-cs',
      prompt: word.en.trim(),
      answers: [literal(word.cs)],
      why: `You saved this as: ${word.cs}.${extra ? ' ' + extra.replace('\n', ' · ') : ''}`,
      hints: [],
      skills: ['vocab:own'],
      nativeReviewed: false,
    };
  }
  return {
    id: `own-${word.id}`,
    type: 'selfCheck',
    cs: word.cs,
    reveal: extra || undefined,
    answers: [],
    why: 'It will come back soon.',
    hints: [],
    skills: ['vocab:own'],
    nativeReviewed: false,
  };
}
