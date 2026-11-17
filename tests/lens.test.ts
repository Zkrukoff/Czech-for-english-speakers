import { describe, expect, it } from 'vitest';
import { contentFiles } from '@/content/files';
import { loadContent } from '@/content/loader';
import { attach, cellsOf, decline, lensPlain, parseLens } from '@/lib/lens';

const result = loadContent(contentFiles);
const { course } = result;
const forms = (lemma: string, cell: string) => (course.lexicon.get(lemma)!.paradigm as Record<string, string[]>)[cell];

describe('lens markup', () => {
  it('parses form, lemma, case, number and function', () => {
    const { segments, problems } = parseLens('Dám si [[kávu|káva|acc|object]] a [[dvě kávy|káva|acc.pl|object]].');
    expect(problems).toEqual([]);
    expect(segments.filter((s) => s.type === 'lens')).toMatchObject([
      { form: 'kávu', lemma: 'káva', case: 'acc', number: undefined, fn: 'object' },
      { form: 'dvě kávy', case: 'acc', number: 'pl' },
    ]);
  });

  it('strips markup to what the reader sees', () => {
    expect(lensPlain('Jsem z [[Anglie|Anglie|gen|after-z]].')).toBe('Jsem z Anglie.');
    expect(lensPlain('No markup.')).toBe('No markup.');
  });

  it('reports malformed tokens', () => {
    expect(parseLens('[[kávu|káva|acc]]').problems[0]).toMatch(/four parts/);
    expect(parseLens('[[kávu|káva|akk|object]]').problems[0]).toMatch(/case must be/);
    expect(parseLens('Dám si [[kávu').problems[0]).toMatch(/unbalanced/);
  });
});

describe('declension rules', () => {
  it('applies the regular spelling changes before -ě', () => {
    expect(attach('Prah', 'ě')).toBe('Praze');
    expect(attach('bank', 'ě')).toBe('bance');
    expect(attach('sestr', 'ě')).toBe('sestře');
    expect(attach('Čech', 'ě')).toBe('Češe');
    expect(attach('káv', 'ě')).toBe('kávě');
    expect(attach('autobus', 'ě')).toBe('autobuse');
  });

  it('generates forms learners meet early', () => {
    expect(forms('káva', 'acc.sg')).toEqual(['kávu']);
    expect(forms('Praha', 'loc.sg')).toEqual(['Praze']);
    expect(forms('Anglie', 'gen.sg')).toEqual(['Anglie']);
    expect(forms('Čech', 'nom.pl')).toContain('Češi');
    expect(forms('Čech', 'voc.sg')).toEqual(['Čechu']);
    expect(forms('bratr', 'voc.sg')).toEqual(['bratře']);
    expect(forms('lístek', 'gen.sg')).toEqual(['lístku']);
    expect(forms('lístek', 'nom.sg')).toEqual(['lístek']);
    expect(forms('tramvaj', 'ins.sg')).toEqual(['tramvají']);
    expect(forms('kolegyně', 'dat.sg')).toEqual(['kolegyni']);
    expect(forms('koruna', 'gen.pl')).toEqual(['korun']);
    expect(forms('zastávka', 'gen.pl')).toEqual(['zastávek']);
  });

  it('reproduces each vzor table from its own headword', () => {
    for (const t of course.tables.values()) {
      if (!t.id.startsWith('noun-')) continue;
      const head = t.rows.find((r) => r.case === 'nom')!.forms[0]!.split(' / ')[0]!.replace('|', '');
      const gender = t.subtitle?.startsWith('feminine') ? 'f' : t.subtitle?.startsWith('neuter') ? 'n' : t.subtitle?.includes('inanimate') ? 'm-inan' : 'm-anim';
      const stem = t.rows.find((r) => r.case === 'gen')!.forms[0]!.split('|')[0]!;
      const { paradigm, error } = decline({ lemma: head, gender, vzor: t.id, stem }, course.tables);
      expect(error).toBeUndefined();
      for (const row of t.rows) {
        if (!row.case || row.case === 'voc') continue; // the table's vocative may use another stem (pán → pane)
        for (const [i, num] of (['sg', 'pl'] as const).entries()) {
          const want = row.forms[i]!.split(' / ').map((f) => f.replace('|', '').trim());
          expect(paradigm[`${row.case}.${num}`], `${t.id} ${row.case}.${num}`).toEqual(want);
        }
      }
    }
  });

  it('requires every form for irregular nouns', () => {
    expect(decline({ lemma: 'x', gender: 'n', vzor: 'irregular', forms: { 'nom.sg': 'x' } }, course.tables).error).toMatch(/missing/);
  });

  it('finds the cells a form belongs to', () => {
    expect(cellsOf(course.lexicon.get('káva')!.paradigm, 'kávy').sort()).toEqual(['acc.pl', 'gen.sg', 'nom.pl', 'voc.pl']);
  });
});

describe('content validation', () => {
  const withLesson = (dialogueCs: string) => {
    const json = structuredClone(contentFiles.json) as Record<string, any>;
    const path = Object.keys(json).find((p) => p.endsWith('lesson.json'))!;
    json[path].dialogue.lines[0].cs = dialogueCs;
    return loadContent({ ...contentFiles, json });
  };

  it('accepts a correct token', () => {
    expect(withLesson('Dám si [[kávu|káva|acc|object]].').errors).toEqual([]);
  });

  it('rejects a form that is not that case of the lemma', () => {
    expect(withLesson('Dám si [[kávy|káva|acc.sg|object]].').errors.join()).toMatch(/not the acc of "káva" \(expected kávu\)/);
  });

  it('rejects an unknown lemma, an unknown function and a function used with the wrong case', () => {
    expect(withLesson('[[x|neznámé|acc|object]]').errors.join()).toMatch(/not in content\/lexicon/);
    expect(withLesson('[[kávu|káva|acc|nope]]').errors.join()).toMatch(/unknown function/);
    expect(withLesson('[[kávu|káva|acc|with-s]]').errors.join()).toMatch(/for the ins case/);
  });

  it('only warns for nouns marked uncertain', () => {
    const r = withLesson('[[mlékem|mléko|loc|location-v-na]]');
    expect(r.errors).toEqual([]);
    expect(r.warnings.join()).toMatch(/marked uncertain/);
  });

  it('has functions for every case', () => {
    const cases = new Set([...course.functions.values()].map((f) => f.case));
    expect([...cases].sort()).toEqual(['acc', 'dat', 'gen', 'ins', 'loc', 'nom', 'voc']);
  });

  it('every lexicon noun declines without errors', () => {
    expect(result.errors.filter((e) => e.startsWith('lexicon'))).toEqual([]);
  });
});

describe('lens words around a blank', () => {
  const withPrompt = (prompt: string, answers: string[]) => {
    const json = structuredClone(contentFiles.json) as Record<string, any>;
    const path = Object.keys(json).find((p) => p.endsWith('lesson.json'))!;
    json[path].exercises.push({ id: 'blank-1', type: 'fillEnding', prompt, answers, why: 'w', hints: [], skills: ['case:accusative'], nativeReviewed: false });
    return loadContent({ ...contentFiles, json });
  };
  it('checks every accepted ending in place', () => {
    expect(withPrompt('Dám si [[káv___|káva|acc|object]].', ['u']).errors).toEqual([]);
    expect(withPrompt('Dám si [[káv___|káva|acc|object]].', ['ě']).errors.join()).toMatch(/gives "kávě", which is not the acc/);
  });
  it('the model lesson (u02-l01) is annotated and valid', () => {
    expect(course.lensKeysByExercise.get('u02-l01-e1')).toEqual(['fn:object', 'pattern:zena:acc.sg']);
  });
});
