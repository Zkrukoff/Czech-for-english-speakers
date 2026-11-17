import { describe, expect, it } from 'vitest';
import { contentFiles } from '@/content/files';
import { loadContent } from '@/content/loader';
import { checkAnswer, SELF_ASSESSED } from '@/lib/answers/check';
import { validatePattern } from '@/lib/answers/patterns';
import { canDrill, numberDrill } from '@/lib/drills/numbers';
import { datesFor, namesOn, needsCheck } from '@/lib/namedays';
import type { Exercise } from '@/content/schema';

const result = loadContent(contentFiles);
const { course } = result;

/** Put one exercise into the first lesson and load. */
function withExercise(ex: Record<string, unknown>, extra?: (json: Record<string, any>) => void) {
  const json = structuredClone(contentFiles.json) as Record<string, any>;
  const path = Object.keys(json).find((p) => p.endsWith('lesson.json'))!;
  json[path].exercises.push({ hints: [], skills: ['case:accusative'], why: 'Because.', nativeReviewed: false, ...ex });
  extra?.(json);
  return loadContent({ ...contentFiles, json });
}
const opts = { strictDiacritics: false };

describe('new exercise types', () => {
  it('accepts a valid example of every new type', () => {
    const r = withExercise({ id: 'x-choose', type: 'chooseEnding', prompt: 'Dám si káv___.', options: ['a', 'u', 'y'], answers: ['u'] });
    expect(r.errors).toEqual([]);
    for (const ex of [
      { id: 'x-build', type: 'buildSentence', prompt: "I'll have a coffee.", tiles: ['Dám', 'si', 'kávu', 'káva'], answers: ['Dám si kávu'] },
      { id: 'x-aspect', type: 'aspectChoice', prompt: 'Zítra ___ domů.', options: ['přicházím', 'přijdu'], verbs: ['přicházet', 'přijít'], answers: ['přijdu'] },
      { id: 'x-speak', type: 'speak', cs: 'Řeknu to.', en: "I'll say it.", focus: 'the ř' },
      { id: 'x-read', type: 'readReal', realia: { kind: 'sign', lines: ['VÝSTUP'] }, prompt: 'What does the sign mean?', answers: ['{exit|way out}'] },
      { id: 'x-listen', type: 'listenType', audio: 'rec-dobry-den', cs: 'Dobrý den.', answers: ['Dobrý den'] },
      { id: 'x-pair', type: 'minimalPair', pair: ['řeka', 'žena'], audio: 'rec-reka', sound: 'ř / ž', answers: ['řeka'] },
    ]) {
      expect(withExercise(ex).errors, ex.id).toEqual([]);
    }
  });

  it('rejects answers that are not among the options or tiles', () => {
    expect(withExercise({ id: 'x', type: 'chooseEnding', prompt: 'káv___', options: ['a', 'y'], answers: ['u'] }).errors.join()).toMatch(/not one of the options/);
    expect(withExercise({ id: 'x', type: 'buildSentence', prompt: 'p', tiles: ['Dám', 'si'], answers: ['Dám si kávu'] }).errors.join()).toMatch(/not tiles: kávu/);
  });

  it('checks that aspect choices are a real imperfective / perfective pair', () => {
    const bad = { id: 'x', type: 'aspectChoice', prompt: '___', options: ['jdu', 'jedu'], verbs: ['jít', 'jet'], answers: ['jdu'] };
    expect(withExercise(bad).errors.join()).toMatch(/not an imperfective \/ perfective pair/);
  });

  it('hides listening exercises until their recording exists, and shows them once it does', () => {
    const ex = { id: 'x-listen', type: 'listenType', audio: 'rec-dobry-den', cs: 'Dobrý den.', answers: ['Dobrý den'] };
    const hidden = withExercise(ex);
    expect(hidden.course.hiddenExercises).toContainEqual({ id: 'x-listen', audio: 'rec-dobry-den' });
    expect(hidden.course.hiddenExercises).toContainEqual({ id: 'tr-hear-doors', audio: 'rec-ukoncete-vystup' });
    expect(hidden.course.exercisesById.has('x-listen')).toBe(false);
    expect(hidden.course.units[0]!.lessonList[0]!.exercises.some((e) => e.id === 'x-listen')).toBe(false);
    const shown = withExercise(ex, (json) => {
      json['audio/manifest.json'].recordings.push({ id: 'rec-dobry-den', file: 'rec-dobry-den.mp3', cs: 'Dobrý den.', speaker: 'Test', licence: 'CC BY 4.0' });
    });
    expect(shown.course.exercisesById.has('x-listen')).toBe(true);
  });

  it('checks choices exactly and speaking by self-assessment', () => {
    const choose = { id: 'c', type: 'chooseEnding', prompt: 'Dám si káv___.', options: ['a', 'u'], answers: ['u'], why: 'Object: accusative.', hints: [], skills: [], nativeReviewed: false } as unknown as Exercise;
    expect(checkAnswer(choose, 'u', opts)).toMatchObject({ status: 'correct', expected: 'kávu' });
    expect(checkAnswer(choose, 'a', opts)).toMatchObject({ status: 'incorrect', expected: 'kávu', explanation: 'Object: accusative.' });
    const speak = { id: 's', type: 'speak', cs: 'Řeknu to.', en: '', answers: [], why: 'Listen to the ř again.', hints: [], skills: [], nativeReviewed: false } as unknown as Exercise;
    expect(checkAnswer(speak, SELF_ASSESSED.good, opts).accepted).toBe(true);
    expect(checkAnswer(speak, SELF_ASSESSED.again, opts)).toMatchObject({ accepted: false, explanation: 'Listen to the ř again.' });
  });
});

describe('missions, verb families and guide links', () => {
  it('has a mission at every built station', () => {
    for (const u of course.units) expect(u.missions.length, u.id).toBeGreaterThan(0);
    expect(course.missionsById.get('u02-m1')?.unitId).toBe('u02');
  });

  it('links motion verbs to their family', () => {
    expect(course.verbsByLemma.get('přijít')?.family).toBe('jít');
    expect(course.verbs.filter((v) => v.family === 'jet').map((v) => v.lemma).sort()).toEqual(['jezdit', 'odjet', 'odjíždět', 'přijet', 'přijíždět'].sort());
  });

  it('generates lesson → guide back-links, leaving out draft guides', () => {
    expect(course.guideLinksByLesson.get('u03-l04')).toEqual([{ guideId: 'prague-transport', sectionId: 'tickets', title: 'Tickets and rules' }]);
    expect(course.guideLinksByLesson.get('u02-l04')?.map((l) => l.guideId).sort()).toEqual(['culture', 'settling-in']);
    // A draft guide is validated but neither listed nor linked from lessons.
    const json = structuredClone(contentFiles.json) as Record<string, any>;
    json['guides/settling-in/guide.json'].draft = true;
    const drafted = loadContent({ ...contentFiles, json }).course;
    expect(drafted.guides.map((g) => g.id)).not.toContain('settling-in');
    expect(drafted.draftGuides.map((g) => g.id)).toEqual(['settling-in']);
    expect(drafted.guideLinksByLesson.get('u02-l04')?.map((l) => l.guideId)).toEqual(['culture']);
  });

  it('rejects a guide link to a lesson that does not exist', () => {
    const json = structuredClone(contentFiles.json) as Record<string, any>;
    json['guides/culture/guide.json'].sections[0].lessons.push('u99-l01');
    expect(loadContent({ ...contentFiles, json }).errors.join()).toMatch(/unknown lesson "u99-l01"/);
  });
});

describe('number drills (generated from the lexicon)', () => {
  const drill = (lemma: string, n: number) => {
    const e = course.lexicon.get(lemma)!;
    return numberDrill(e.noun, e.paradigm, n);
  };
  const ok = (lemma: string, n: number, typed: string) => checkAnswer(drill(lemma, n), typed, opts).accepted;

  it('follows 1 / 2–4 / 5+ agreement', () => {
    expect(ok('koruna', 1, 'jedna koruna')).toBe(true);
    expect(ok('koruna', 2, 'dvě koruny')).toBe(true);
    expect(ok('koruna', 5, 'pět korun')).toBe(true);
    expect(ok('koruna', 5, 'pět koruny')).toBe(false);
    expect(ok('lístek', 2, 'dva lístky')).toBe(true);
    expect(ok('pivo', 2, 'dvě piva')).toBe(true);
    expect(ok('pivo', 1, 'jedno pivo')).toBe(true);
    expect(ok('rohlík', 10, '10 rohlíků')).toBe(true);
    expect(ok('student', 3, 'tři studenti')).toBe(true);
  });

  it('produces valid answer patterns for every drillable noun', () => {
    let n = 0;
    for (const { noun, paradigm } of course.lexicon.values()) {
      if (!canDrill(noun, paradigm)) continue;
      for (const k of [1, 2, 3, 5, 10]) {
        for (const a of numberDrill(noun, paradigm, k).answers) expect(validatePattern(a), noun.lemma).toBeNull();
        n++;
      }
    }
    expect(n).toBeGreaterThan(200);
  });

  it('skips uncertain and number-restricted nouns', () => {
    const e = (l: string) => course.lexicon.get(l)!;
    expect(canDrill(e('mléko').noun, e('mléko').paradigm)).toBe(false);
    expect(canDrill(e('brýle').noun, e('brýle').paradigm)).toBe(false);
    expect(canDrill(e('Praha').noun, e('Praha').paradigm)).toBe(false);
  });
});

describe('name days', () => {
  it('has every day of the year except where no name is listed, with a cited source', () => {
    expect(Object.keys(course.namedays!.days).length).toBeGreaterThanOrEqual(364);
    expect(course.namedays!.source.url).toMatch(/^https:/);
  });

  it('looks up names by date and dates by name', () => {
    expect(namesOn(new Date(2026, 11, 24), course.namedays)).toEqual(['Adam a Eva']);
    expect(namesOn(new Date(2028, 1, 29), course.namedays)).toEqual(['Horymír']);
    expect(datesFor('Pavel', course.namedays)).toContain('06-29');
    expect(datesFor('Václav', course.namedays)).toContain('09-28');
  });

  it('flags the days a native speaker must check', () => {
    expect(needsCheck(new Date(2026, 0, 1), course.namedays)).toBe(true);
    expect(needsCheck(new Date(2026, 2, 19), course.namedays)).toBe(false);
  });
});
