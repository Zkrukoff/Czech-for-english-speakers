import { describe, expect, it } from 'vitest';
import { contentFiles } from '@/content/files';
import { loadContent } from '@/content/loader';

const { course, errors } = loadContent(contentFiles);

describe('Aspect as pairs (P6)', () => {
  it('shows the partner on lesson verbs that have one', () => {
    expect(errors).toEqual([]);
    const zaplatit = [...course.vocabById.values()].find((v) => v.item.cs === 'zaplatit')!.item;
    expect(zaplatit.partner).toBe('platit');
    expect(zaplatit.aspect).toBe('pf');
    for (const { item } of course.vocabById.values()) {
      const verb = course.verbsByLemma.get(item.cs);
      if (verb?.partner.length) expect(item.partner, item.cs).toBeTruthy();
    }
  });

  it('practises aspect in Line A lessons, with a reason and a hint for the wrong form', () => {
    const items = course.units.flatMap((u) => u.lessonList).flatMap((l) => l.exercises).filter((e) => e.type === 'aspectChoice');
    expect(items.length).toBeGreaterThanOrEqual(12);
    for (const e of items) {
      if (e.type !== 'aspectChoice') continue;
      const wrong = e.options.filter((o) => !e.answers.includes(o));
      for (const w of wrong) expect(e.hints.some((h) => h.wrong === w), `${e.id}: ${w}`).toBe(true);
      expect(e.why.length).toBeGreaterThan(20);
    }
  });
});
