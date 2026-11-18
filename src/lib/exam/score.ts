import { loose } from '@/lib/answers/check';
import type { ChoiceTask, FillTask, MatchTask } from '@/features/exam/schema';
import { SPEAKING_PASS, WORD_MIN, WRITTEN_MAX, WRITTEN_PASS } from '@/features/exam/schema';

/** Words as the exam counts them: anything between spaces with a letter or digit in it. */
export function wordCount(text: string): number {
  return text.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
}

/** One point per item matched to the right option. */
export function scoreMatch(task: MatchTask, picks: Record<string, string | undefined>): number {
  return task.items.filter((i) => picks[i.id] !== undefined && picks[i.id] === task.answers[i.id]).length;
}

/** One point per question answered correctly. */
export function scoreChoice(task: ChoiceTask, picks: (number | undefined)[]): number {
  return task.questions.filter((q, i) => picks[i] === q.answer).length;
}

/**
 * Short written answers are marked for the information, not the spelling:
 * case, diacritics and punctuation are ignored, spaces inside numbers
 * ("1 200") don't matter, and a currency or unit after a number ("Kč") is
 * optional.
 */
export function fillAccepted(given: string, answers: string[]): boolean {
  const norm = (s: string) =>
    loose(s)
      .replace(/(\d) (?=\d{3}\b)/g, '$1')
      .replace(/\b(kc|korun|koruny|czk)\b/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  const g = norm(given);
  return g.length > 0 && answers.some((a) => norm(a) === g);
}

export function scoreFill(task: FillTask, given: string[]): number {
  return task.questions.filter((q, i) => fillAccepted(given[i] ?? '', q.answers)).length;
}

/** The e-mail scores 0 under 35 words, whatever else it says [Official]. */
export function emailMeetsMinimum(text: string): boolean {
  return wordCount(text) >= WORD_MIN.email;
}

export function formAnswerMeetsMinimum(text: string): boolean {
  return wordCount(text) >= WORD_MIN.formAnswer;
}

/**
 * What a reading + listening score (out of 50) means for the written pass
 * mark: how many of the 20 writing points are still needed to reach 42 of 70.
 */
export function writingNeeded(readingListening: number): { need: number; possible: boolean } {
  const need = Math.max(0, WRITTEN_PASS - readingListening);
  return { need, possible: need <= WRITTEN_MAX - 50 };
}

/** The pass line in words, for the result screen. */
export function neededSentence(readingListening: number): string {
  const { need, possible } = writingNeeded(readingListening);
  if (!possible) return `${readingListening} of 50. Even full marks in writing (20) would leave you short of ${WRITTEN_PASS}, so reading and listening need work first.`;
  if (need === 0) return `${readingListening} of 50. That already reaches ${WRITTEN_PASS} without writing, but the real exam marks writing too, so don't skip it.`;
  return `${readingListening} of 50. You'd need at least ${need} of 20 in writing to reach ${WRITTEN_PASS} of ${WRITTEN_MAX}.`;
}

export const speakingPassLine = `You need ${SPEAKING_PASS} of 40 in the real exam.`;
