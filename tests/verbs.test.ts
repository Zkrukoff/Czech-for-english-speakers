import { describe, expect, it } from 'vitest';
import { contentFiles } from '@/content/files';
import { loadContent } from '@/content/loader';
import { commonStem, conditionalForms, futureForms, pastForms, presentForms, searchVerbs } from '@/lib/verbs';

const { course } = loadContent(contentFiles);
const verb = (l: string) => course.verbsByLemma.get(l)!;

describe('verb forms', () => {
  it('builds the past tense with auxiliary only in 1st/2nd person', () => {
    const p = pastForms(verb('dělat'));
    expect(p['1sg']).toBe('dělal / dělala jsem');
    expect(p['3sg']).toBe('dělal / dělala');
    expect(p['2pl']).toBe('dělali / dělaly jste');
  });

  it('contracts jsi + se/si to ses/sis', () => {
    expect(pastForms(verb('učit se'))['2sg']).toBe('učil / učila ses');
    expect(pastForms(verb('učit se'))['1sg']).toBe('učil / učila jsem se');
    expect(pastForms(verb('sednout si'))['2sg']).toBe('sedl / sedla sis');
  });

  it('uses budu + infinitive for imperfective, present forms for perfective, and explicit futures', () => {
    expect(futureForms(verb('dělat'))['1sg']).toBe('budu dělat');
    expect(futureForms(verb('učit se'))['1sg']).toBe('budu se učit');
    expect(futureForms(verb('napsat'))['1sg']).toBe('napíšu / napíši');
    expect(futureForms(verb('jít'))['1sg']).toBe('půjdu');
  });

  it('adds se/si to present and builds the conditional', () => {
    expect(presentForms(verb('jmenovat se'))['3sg']).toBe('jmenuje se');
    expect(conditionalForms(verb('chtít'))['1sg']).toBe('chtěl / chtěla bych');
    expect(conditionalForms(verb('chtít'))['1pl']).toBe('chtěli / chtěly bychom');
  });

  it('finds a shared stem only when it is meaningful', () => {
    expect(commonStem(['dělám', 'děláš', 'dělá', 'děláme', 'děláte', 'dělají'])).toBe('děl');
    expect(commonStem(['jsem', 'jsi', 'je', 'jsme', 'jste', 'jsou'])).toBe('');
  });
});

describe('verb search', () => {
  it('ignores diacritics and matches conjugated forms', () => {
    expect(searchVerbs(course.verbs, 'pisu')[0]!.lemma).toBe('psát');
    expect(searchVerbs(course.verbs, 'šel')[0]!.lemma).toBe('jít');
  });

  it('matches English meanings', () => {
    expect(searchVerbs(course.verbs, 'to buy').map((v) => v.lemma)).toContain('koupit');
  });

  it('ranks the exact lemma first', () => {
    expect(searchVerbs(course.verbs, 'jet')[0]!.lemma).toBe('jet');
  });
});
