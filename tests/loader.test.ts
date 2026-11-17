import { describe, expect, it } from 'vitest';
import { loadContent, type ContentFiles } from '@/content/loader';

const exercise = (over: Record<string, unknown> = {}) => ({
  id: 'e1',
  type: 'translate',
  direction: 'en-cs',
  prompt: 'Hello',
  answers: ['Ahoj.'],
  why: 'Informal greeting.',
  skills: ['case:nominative'],
  nativeReviewed: false,
  ...over,
});

function fixture(): ContentFiles {
  return {
    json: {
      'course.json': { title: 'T', units: ['01-u'] },
      'units/01-u/unit.json': {
        id: 'u1',
        title: 'U',
        situation: 'S',
        canDo: [{ id: 'g1', text: 'You can greet.' }],
        lessons: ['01-l'],
        check: { exercises: [exercise({ id: 'c1', goalId: 'g1' })] },
        nativeReviewed: false,
      },
      'units/01-u/lessons/01-l/lesson.json': {
        id: 'l1',
        title: 'L',
        canDo: ['g1'],
        vocab: [{ id: 'v-ahoj', cs: 'ahoj', en: 'hi', pos: 'interj', nativeReviewed: false }],
        dialogue: { lines: [{ speaker: 'A', cs: 'Ahoj!', en: 'Hi!', nativeReviewed: false }] },
        exercises: [exercise()],
        nativeReviewed: false,
      },
      'lines/lines.json': {
        verified: { source: 'PID GTFS', date: '2026-11-17' },
        milestones: [],
        lines: [
          { id: 'A', nickname: 'a', levels: ['A1', 'A2'], service: 'in-service', stops: [{ station: 'x', kind: 'pronunciation' }, { station: 'y', kind: 'unit', unit: 'u1' }] },
          { id: 'B', nickname: 'b', levels: ['B1', 'B2'], service: 'not-yet', stops: [{ station: 'x', kind: 'planned' }, { station: 'z', kind: 'planned' }] },
          { id: 'C', nickname: 'c', levels: ['C1', 'C2'], service: 'not-yet', stops: [{ station: 'y', kind: 'planned' }, { station: 'z', kind: 'planned' }] },
        ],
        stations: { x: { name: 'X', tile: '01' }, y: { name: 'Y', tile: '02' }, z: { name: 'Z', tile: '03' } },
        nativeReviewed: false,
      },
    },
    markdown: { 'units/01-u/lessons/01-l/explanation.md': '## Hi' },
  };
}

describe('loadContent', () => {
  it('loads a valid course and builds indexes', () => {
    const { course, errors } = loadContent(fixture());
    expect(errors).toEqual([]);
    expect(course.units).toHaveLength(1);
    expect(course.lessonsById.get('l1')?.explanationMd).toBe('## Hi');
    expect(course.exercisesById.get('e1')?.source).toEqual({ kind: 'lesson', unitId: 'u1', lessonId: 'l1' });
    expect(course.exercisesById.get('c1')?.source).toEqual({ kind: 'unitCheck', unitId: 'u1' });
    expect(course.vocabById.has('v-ahoj')).toBe(true);
  });

  it('requires nativeReviewed on Czech content', () => {
    const f = fixture();
    const lesson = f.json['units/01-u/lessons/01-l/lesson.json'] as { vocab: Record<string, unknown>[] };
    delete lesson.vocab[0]!.nativeReviewed;
    expect(loadContent(f).errors.join('\n')).toMatch(/vocab\.0\.nativeReviewed.*nativeReviewed is required/);
  });

  it('reports missing lessons, unknown goals and uncovered goals', () => {
    const f = fixture();
    const unit = f.json['units/01-u/unit.json'] as Record<string, any>;
    unit.lessons.push('02-missing');
    unit.canDo.push({ id: 'g2', text: 'Another goal.' });
    unit.check.exercises.push(exercise({ id: 'c2', goalId: 'nope' }));
    const errors = loadContent(f).errors.join('\n');
    expect(errors).toMatch(/02-missing\/lesson.json does not exist/);
    expect(errors).toMatch(/unknown goalId "nope"/);
    expect(errors).toMatch(/goal "g2" has no check exercise/);
  });

  it('reports duplicate exercise ids, bad patterns and unknown vocab skills', () => {
    const f = fixture();
    const lesson = f.json['units/01-u/lessons/01-l/lesson.json'] as Record<string, any>;
    lesson.exercises.push(exercise({ answers: ['{Ahoj|Čau.'], skills: ['vocab:v-missing'] }));
    const errors = loadContent(f).errors.join('\n');
    expect(errors).toMatch(/duplicate exercise id "e1"/);
    expect(errors).toMatch(/Unclosed \{/);
    expect(errors).toMatch(/unknown vocab id/);
  });

  it('rejects unknown skill tags', () => {
    const f = fixture();
    const lesson = f.json['units/01-u/lessons/01-l/lesson.json'] as Record<string, any>;
    lesson.exercises[0].skills = ['case:ablative'];
    expect(loadContent(f).errors.join('\n')).toMatch(/skill must be/);
  });

  it('checks that table rows match their columns and embeds exist', () => {
    const f = fixture();
    f.json['grammar/tables/nouns.json'] = {
      tables: [{ id: 'zena', title: 'žena', group: 'nouns', columns: ['sg', 'pl'], rows: [{ case: 'nom', forms: ['žen|a'] }], nativeReviewed: false }],
    };
    f.markdown['grammar/cases/x.md'] = '---\nid: x\ntitle: X\nkind: other\nnativeReviewed: false\n---\n```table missing\n```\n';
    const errors = loadContent(f).errors.join('\n');
    expect(errors).toMatch(/row 1 has 1 forms but 2 columns/);
    expect(errors).toMatch(/embedded table "missing" does not exist/);
  });
});
