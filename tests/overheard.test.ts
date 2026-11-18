import { describe, expect, it } from 'vitest';
import { contentFiles } from '@/content/files';
import { loadContent } from '@/content/loader';
import { checkAnswer } from '@/lib/answers/check';

const { course, errors } = loadContent(contentFiles);

describe('Overheard in Prague', () => {
  it('loads every scene with 2–3 multiple-choice questions and a recording id per line', () => {
    expect(errors).toEqual([]);
    expect(course.overheard.map((s) => s.id)).toEqual(['oh-bus', 'oh-metro', 'oh-checkout', 'oh-pub', 'oh-pharmacy']);
    for (const s of course.overheard) {
      expect(s.questions.every((q) => q.type === 'multipleChoice')).toBe(true);
      for (const l of s.lines) expect(l.audio).toBe(`${s.id}-${s.lines.indexOf(l) + 1}`);
    }
  });

  it('marks official-looking wording as verified with a source, or as unverified', () => {
    for (const s of course.overheard.filter((x) => x.kind === 'transport')) {
      for (const l of s.lines.filter((x) => x.speaker === 'Hlášení')) expect(!!l.verified !== !!l.unverifiedNote, l.cs).toBe(true);
    }
    const pressButton = course.overheard[0]!.lines.find((l) => l.cs.startsWith('Pro výstup'))!;
    expect(pressButton.verified?.url).toMatch(/^https:\/\/pid\.cz\//);
  });

  it('requires an explanation for every wrong option', () => {
    const json = structuredClone(contentFiles.json) as Record<string, any>;
    json['overheard/bus.json'].questions[0].hints.pop();
    expect(loadContent({ ...contentFiles, json }).errors.join()).toMatch(/needs an explanation in hints/);
  });

  it('checks a choice and teaches with the wrong option', () => {
    const q = course.exercisesById.get('oh-bus-q1')!.exercise;
    expect(checkAnswer(q, 'Press the button', { strictDiacritics: false }).accepted).toBe(true);
    const wrong = checkAnswer(q, 'Wave at the driver', { strictDiacritics: false });
    expect(wrong).toMatchObject({ accepted: false, hintMatched: true, expected: 'Press the button' });
    expect(wrong.explanation).toMatch(/Waving/);
  });
});
