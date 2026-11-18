import { describe, expect, it } from 'vitest';
import { contentFiles } from '@/content/files';
import { loadContent } from '@/content/loader';

describe('Trusted (production) content load (I8)', () => {
  it('builds the same course as the fully validated load, without the authoring checks', () => {
    const full = loadContent(contentFiles);
    const fast = loadContent(contentFiles, { validate: false });
    expect(full.errors).toEqual([]);
    expect([...fast.course.exercisesById.keys()]).toEqual([...full.course.exercisesById.keys()]);
    expect(fast.course.hiddenExercises).toEqual(full.course.hiddenExercises);
    expect([...fast.course.lensKeysByExercise]).toEqual([...full.course.lensKeysByExercise]);
    expect(fast.course.units.map((u) => u.lessonList.map((l) => l.exercises.length))).toEqual(full.course.units.map((u) => u.lessonList.map((l) => l.exercises.length)));
    expect(JSON.stringify(fast.course.phrases)).toEqual(JSON.stringify(full.course.phrases));
  });
});
