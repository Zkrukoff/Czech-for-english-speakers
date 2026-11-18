import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { contentFiles } from '@/content/files';
import { loadContent } from '@/content/loader';
import { PrazakDB } from '@/db/db';
import { addPhraseCards, removePhraseCards, NEW_PHRASES_PER_DAY } from '@/db/srs';
import { checkAnswer } from '@/lib/answers/check';
import { exerciseForCard, phraseExercise } from '@/lib/srs/reviewItems';

const { course, errors } = loadContent(contentFiles);
const opts = { strictDiacritics: false };

describe('Phrase deck (A7)', () => {
  it('has eight situations of sourced phrases, all awaiting native review, including Můžu platit kartou?', () => {
    expect(errors).toEqual([]);
    expect(course.phrases).toHaveLength(8);
    const all = course.phrases.flatMap((s) => s.phrases);
    expect(all.length).toBeGreaterThanOrEqual(48);
    expect(all.filter((p) => p.source.kind === 'inventory').length).toBeGreaterThanOrEqual(24);
    expect(all.every((p) => p.nativeReviewed === false)).toBe(true);
    expect(all.map((p) => p.cs)).toContain('Můžu platit kartou?');
  });

  it('is recognised first, then produced, and the checker accepts the phrase', () => {
    for (const s of course.phrases) for (const p of s.phrases) {
      const first = phraseExercise(p, s, 0);
      expect(first.type).toBe('multipleChoice');
      if (first.type !== 'multipleChoice') continue;
      expect(first.options).toContain(p.en);
      expect(new Set(first.options).size).toBe(3);
      for (const o of first.options.filter((o) => o !== p.en)) expect(first.hints.some((h) => h.wrong === o), `${p.id}: ${o}`).toBe(true);
      const later = phraseExercise(p, s, 2);
      expect(later.type).toBe('translate');
      const typed = p.cs.replace(/…/g, '');
      expect(checkAnswer(later, typed, opts).accepted, `${p.id}: ${typed}`).toBe(true);
    }
    expect(exerciseForCard('chunk:kartou', course, 0)?.type).toBe('multipleChoice');
    expect(exerciseForCard('chunk:nope', course, 0)).toBeNull();
  });

  it('introduces at most five new phrases a day, and removing a situation keeps what was practised', async () => {
    const database = new PrazakDB(`phrases-${Math.random()}`);
    const now = Date.parse('2026-11-18T10:00:00Z');
    const a = course.phrases[0]!.phrases.map((p) => p.id);
    const b = course.phrases[1]!.phrases.map((p) => p.id);
    expect(await addPhraseCards(a, { database, now })).toBe(6);
    expect(await addPhraseCards(b, { database, now })).toBe(6);
    const cards = await database.cards.where('itemKey').startsWith('chunk:').toArray();
    const perDay = new Map<number, number>();
    for (const c of cards) { const d = Math.max(0, Math.round((c.due - now) / 86_400_000)); perDay.set(d, (perDay.get(d) ?? 0) + 1); }
    expect([...perDay.values()].every((n) => n <= NEW_PHRASES_PER_DAY)).toBe(true);
    expect(perDay.get(0)).toBe(NEW_PHRASES_PER_DAY);
    await database.cards.update(`chunk:${a[0]}`, { reps: 1 });
    await removePhraseCards(a, database);
    const left = (await database.cards.where('itemKey').startsWith('chunk:').toArray()).map((c) => c.itemKey);
    expect(left).toContain(`chunk:${a[0]}`);
    expect(left.filter((k) => a.some((id) => k === `chunk:${id}`))).toEqual([`chunk:${a[0]}`]);
  });
});
