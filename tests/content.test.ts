import { describe, expect, it } from 'vitest';
import { contentFiles } from '@/content/files';
import { loadContent } from '@/content/loader';

/** Validates the real course in /content. Any broken content fails here. */
describe('course content', () => {
  const result = loadContent(contentFiles);

  it('has no validation errors', () => {
    expect(result.errors).toEqual([]);
  });

  it('loads at least one unit with lessons', () => {
    expect(result.course.units.length).toBeGreaterThan(0);
    for (const u of result.course.units) expect(u.lessonList.length).toBeGreaterThan(0);
  });

});

describe('grammar reference coverage', () => {
  const { course, warnings } = loadContent(contentFiles);

  it('has a page for every case and every verb topic', async () => {
    const { GRAMMAR_SKILLS } = await import('@/content/taxonomy');
    const missing = GRAMMAR_SKILLS.filter((s) => !course.grammarBySkill.has(s));
    expect(missing).toEqual([]);
  });

  it('has declension tables for all 14 standard model nouns', () => {
    const models = ['pan', 'hrad', 'muz', 'stroj', 'predseda', 'soudce', 'zena', 'ruze', 'pisen', 'kost', 'mesto', 'more', 'kure', 'staveni'];
    for (const m of models) expect(course.tables.has(`noun-${m}`), m).toBe(true);
  });

  it('has adjective and pronoun tables', () => {
    expect([...course.tables.values()].filter((t) => t.group === 'adjectives').length).toBeGreaterThanOrEqual(4);
    expect([...course.tables.values()].filter((t) => t.group === 'pronouns').length).toBeGreaterThanOrEqual(5);
  });

  it('every noun table has all seven cases', () => {
    for (const t of course.tables.values()) {
      if (t.group !== 'nouns') continue;
      expect(t.rows.map((r) => r.case)).toEqual(['nom', 'gen', 'dat', 'acc', 'voc', 'loc', 'ins']);
    }
  });

  it('has the core irregular verbs, with aspect partners resolvable', () => {
    for (const l of ['být', 'mít', 'chtít', 'jíst', 'jít']) expect(course.verbsByLemma.has(l), l).toBe(true);
    expect(warnings.filter((w) => w.includes('partner'))).toEqual([]);
  });
});

describe('exercises are self-consistent', async () => {
  const { checkAnswer, acceptedAnswers } = await import('@/lib/answers/check');
  const { expandPattern } = await import('@/lib/answers/patterns');
  const { course, warnings } = loadContent(contentFiles);
  const all = [...course.exercisesById.values()].map((e) => e.exercise);

  it('has three units of four lessons, each with exercises', () => {
    expect(course.units).toHaveLength(3);
    for (const u of course.units) expect(u.lessonList).toHaveLength(4);
  });

  it('marks every accepted answer as correct (tolerant and strict)', () => {
    const failures: string[] = [];
    for (const ex of all) {
      for (const a of acceptedAnswers(ex)) {
        for (const strictDiacritics of [false, true]) {
          const r = checkAnswer(ex, a, { strictDiacritics });
          if (r.status !== 'correct') failures.push(`${ex.id}: "${a}" → ${r.status}`);
        }
      }
    }
    expect(failures).toEqual([]);
  });

  it('triggers each hint for the wrong answer it describes', () => {
    const failures: string[] = [];
    for (const ex of all) {
      for (const h of ex.hints) {
        for (const w of expandPattern(h.wrong)) {
          const r = checkAnswer(ex, w, { strictDiacritics: false });
          if (!r.hintMatched || r.explanation !== h.explain) failures.push(`${ex.id}: hint "${w}" → ${r.status}${r.hintMatched ? '' : ' (no hint)'}`);
        }
      }
    }
    expect(failures).toEqual([]);
  });

  it('every conjugate exercise refers to a verb in the lookup', () => {
    expect(warnings.filter((w) => w.includes('not in the verb lookup'))).toEqual([]);
  });

  it('every lesson links only to grammar pages that exist', () => {
    expect(warnings.filter((w) => w.includes('grammar page'))).toEqual([]);
  });
});
