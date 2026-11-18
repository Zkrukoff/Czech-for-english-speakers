import type { Course } from '@/content/loader';
import type { Gender } from '@/content/schema';
import { cellsOf } from '@/lib/lens';
import type { Verb } from '@/content/schema';

/** Every written form of a verb, with diacritics (the search helper strips them). */
const verbForms = (v: Verb) =>
  [v.lemma, ...Object.values(v.present), ...Object.values(v.past), ...Object.values(v.imperative ?? {}), ...Object.values(v.future ?? {})].flatMap((f) => f.split(' / '));

/** What a saved word is linked to: a lexicon noun (and its vzor) or a verb entry. */
export type WordLink =
  | { kind: 'noun'; lemma: string; vzor: string; gender: Gender; guessed?: false }
  | { kind: 'noun'; lemma: string; vzor: string; gender: Gender; guessed: true }
  | { kind: 'verb'; lemma: string };

const norm = (s: string) => s.trim().toLocaleLowerCase('cs').replace(/[.,!?;:]+$/g, '');

/**
 * Find a word in the course: any form of a lexicon noun (kávu → káva, vzor
 * žena), then a verb by infinitive or any conjugated form (dělám → dělat).
 * Only single words are linked; phrases are saved as they are.
 */
export function linkWord(text: string, course: Pick<Course, 'lexicon' | 'verbs'>): WordLink | null {
  const w = norm(text);
  if (!w || /\s/.test(w)) return null;
  for (const [lemma, { noun, paradigm }] of course.lexicon) {
    if (lemma.toLocaleLowerCase('cs') === w || cellsOf(paradigm, w).length > 0) {
      return noun.vzor === 'irregular' ? null : { kind: 'noun', lemma, vzor: noun.vzor, gender: noun.gender };
    }
  }
  const verb =
    course.verbs.find((v) => norm(v.lemma) === w) ??
    course.verbs.find((v) => verbForms(v).some((f) => norm(f) === w));
  return verb ? { kind: 'verb', lemma: verb.lemma } : null;
}

const SOFT = /[žščřcjďťň]$/;

/**
 * A suggestion only (shown as "a guess: check it"): the usual vzor for a
 * noun of this gender with this ending. Exceptions are common, which is why
 * it's never applied silently.
 */
export function guessVzor(word: string, gender: Gender): string {
  const w = norm(word);
  if (gender === 'f') return w.endsWith('a') ? 'noun-zena' : /[eě]$/.test(w) ? 'noun-ruze' : SOFT.test(w) ? 'noun-pisen' : 'noun-kost';
  if (gender === 'n') return w.endsWith('o') ? 'noun-mesto' : w.endsWith('í') ? 'noun-staveni' : 'noun-more';
  if (gender === 'm-anim') return w.endsWith('a') ? 'noun-predseda' : w.endsWith('e') ? 'noun-soudce' : SOFT.test(w) ? 'noun-muz' : 'noun-pan';
  return SOFT.test(w) ? 'noun-stroj' : 'noun-hrad';
}
