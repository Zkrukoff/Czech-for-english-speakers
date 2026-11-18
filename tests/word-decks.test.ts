import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { contentFiles } from '@/content/files';
import { loadContent } from '@/content/loader';
import { PrazakDB } from '@/db/db';
import { addWordCards, removeWordCards, wordKey } from '@/db/srs';
import { checkAnswer } from '@/lib/answers/check';
import { exerciseForCard } from '@/lib/srs/reviewItems';

const { course, errors } = loadContent(contentFiles);
const opts = { strictDiacritics: false };
const words = course.decks.flatMap((d) => d.words);

describe('Core vocabulary decks (step 3)', () => {
  it('loads fifteen ordered decks of about 1,200 words, all awaiting native review', () => {
    expect(errors).toEqual([]);
    expect(course.decks).toHaveLength(15);
    expect(course.decks.map((d) => d.order)).toEqual([...course.decks.map((d) => d.order)].sort((a, b) => a - b));
    expect(words.length).toBeGreaterThanOrEqual(1200);
    expect(words.every((w) => w.nativeReviewed === false)).toBe(true);
    expect(course.wordsById.size).toBe(words.length);
  });

  it('has no word twice and nothing a lesson already teaches', () => {
    const seen = new Set<string>();
    for (const w of words) {
      const k = `${w.cs.toLowerCase()}|${w.pos}`;
      expect(seen.has(k), k).toBe(false);
      seen.add(k);
    }
    const taught = new Set([...course.vocabById.values()].map((v) => v.item.cs.toLowerCase()));
    expect(words.filter((w) => taught.has(w.cs.toLowerCase())).map((w) => w.cs)).toEqual([]);
  });

  it('gives every noun a gender or a note, and every verb its aspect', () => {
    for (const w of words) {
      if (w.pos === 'noun') expect(Boolean(w.gender || w.note), w.cs).toBe(true);
      if (w.pos === 'verb') expect(w.aspect, w.cs).toBeDefined();
    }
  });

  it('has example sentences for the 300 most frequent words', () => {
    const ranked = words.filter((w) => w.rank).sort((a, b) => a.rank! - b.rank!).slice(0, 300);
    expect(ranked.filter((w) => !w.example).map((w) => w.cs)).toEqual([]);
  });

  it('is recognised first (with a hint for every wrong option), then typed, accepting alternatives and synonyms', () => {
    for (const w of words) {
      const first = exerciseForCard(wordKey(w.id), course, 0);
      expect(first?.type, w.id).toBe('multipleChoice');
      if (first?.type !== 'multipleChoice') continue;
      expect(first.options).toContain(w.en);
      expect(first.options.length).toBeGreaterThanOrEqual(2);
      expect(new Set(first.options).size).toBe(first.options.length);
      for (const o of first.options.filter((o) => o !== w.en)) expect(first.hints.some((h) => h.wrong === o), `${w.id}: ${o}`).toBe(true);
      const later = exerciseForCard(wordKey(w.id), course, 1);
      expect(later?.type).toBe('translate');
      if (!later) continue;
      for (const answer of [w.cs, ...w.alt]) expect(checkAnswer(later, answer, opts).accepted, `${w.id}: ${answer}`).toBe(true);
    }
    // vlevo and nalevo both mean "on the left": either is right when typed.
    const vlevo = words.find((w) => w.cs === 'vlevo')!;
    expect(checkAnswer(exerciseForCard(wordKey(vlevo.id), course, 1)!, 'nalevo', opts).accepted).toBe(true);
    expect(exerciseForCard('word:nope', course, 0)).toBeNull();
  });

  it('introduces at most the chosen number of new words a day, and removing a deck keeps what was practised', async () => {
    const database = new PrazakDB(`words-${Math.random()}`);
    const now = Date.parse('2026-11-18T10:00:00Z');
    const a = course.decks[0]!.words.map((w) => w.id);
    const b = course.decks[1]!.words.map((w) => w.id);
    expect(await addWordCards(a, 10, { database, now })).toBe(a.length);
    expect(await addWordCards(b, 10, { database, now })).toBe(b.length);
    expect(await addWordCards(a, 10, { database, now })).toBe(0);
    const cards = await database.cards.where('itemKey').startsWith('word:').toArray();
    const perDay = new Map<number, number>();
    for (const c of cards) { const d = Math.max(0, Math.round((c.due - now) / 86_400_000)); perDay.set(d, (perDay.get(d) ?? 0) + 1); }
    expect([...perDay.values()].every((n) => n <= 10)).toBe(true);
    expect(perDay.get(0)).toBe(10);
    // Deck 2 queues behind deck 1 instead of doubling today's load.
    const firstOfB = cards.find((c) => c.itemKey === wordKey(b[0]!))!;
    expect(firstOfB.due).toBeGreaterThan(now + 86_400_000);
    await database.cards.update(wordKey(a[0]!), { reps: 1 });
    await removeWordCards(a, database);
    const left = (await database.cards.where('itemKey').startsWith('word:').toArray()).map((c) => c.itemKey);
    expect(left.filter((k) => a.some((id) => k === wordKey(id)))).toEqual([wordKey(a[0]!)]);
    expect(left.filter((k) => b.some((id) => k === wordKey(id)))).toHaveLength(b.length);
  });
});
